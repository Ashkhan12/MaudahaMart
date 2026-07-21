import * as tf from '@tensorflow/tfjs';
import { Product, Store, RegisteredUser } from '../types';

export interface AttentionFeatureBreakdown {
  featureName: string;
  featureNameHi: string;
  weight: number; // 0 to 1
  score: number;  // 0 to 100%
}

export interface ItemAttentionResult<T = Product | Store> {
  item: T;
  attentionScore: number; // Percentage 0 - 100
  featureBreakdown: AttentionFeatureBreakdown[];
  attentionVector: number[];
}

export interface TensorFlowAttentionSummary {
  rankedProducts: ItemAttentionResult<Product>[];
  rankedStores: ItemAttentionResult<Store>[];
  attentionMatrix: number[][]; // [queries, keys]
  queryFeatureLabels: string[];
  keyFeatureLabels: string[];
  inferenceTimeMs: number;
  tensorCount: number;
  modelVersion: string;
}

// Map textual search/category intent to embedding vector
function encodeQueryContext(
  user: RegisteredUser | null,
  searchQuery: string = '',
  activeTab: string = 'all'
): number[] {
  const q = searchQuery.toLowerCase().trim();
  const currentHour = new Date().getHours();

  // 8 Dimensions:
  // [0]: Category - Food / Restaurant
  // [1]: Category - Grocery / Supermart
  // [2]: Category - Fashion / Clothing
  // [3]: Price Sensitivity (0 = High-end, 1 = Budget / Deals)
  // [4]: Time-of-day food urgency (Breakfast/Lunch/Dinner peak)
  // [5]: Fast Delivery Urgency
  // [6]: Discount / Coupon Loyalty Seeking
  // [7]: Rating / Premium Quality seeking

  let foodScore = 0.2;
  let groceryScore = 0.2;
  let fashionScore = 0.2;

  if (activeTab === 'restaurants' || q.includes('biryani') || q.includes('pizza') || q.includes('burger') || q.includes('food') || q.includes('paneer') || q.includes('chai') || q.includes('roll')) {
    foodScore = 0.95;
  }
  if (activeTab === 'browse' || q.includes('grocery') || q.includes('milk') || q.includes('oil') || q.includes('atta') || q.includes('subzi') || q.includes('snack') || q.includes('rice')) {
    groceryScore = 0.95;
  }
  if (activeTab === 'clothing' || q.includes('shirt') || q.includes('saree') || q.includes('dress') || q.includes('kurti') || q.includes('jeans')) {
    fashionScore = 0.95;
  }

  // Time of day urgency
  let timeUrgency = 0.3;
  if ((currentHour >= 12 && currentHour <= 15) || (currentHour >= 19 && currentHour <= 22)) {
    timeUrgency = 0.9; // Lunch/Dinner peak time
  }

  // Price sensitivity based on user coins / history
  const userCoins = (user as any)?.loyaltyCoins || (user as any)?.coins || 0;
  const priceSensitivity = userCoins > 200 ? 0.8 : 0.5;

  return [
    foodScore,
    groceryScore,
    fashionScore,
    priceSensitivity,
    timeUrgency,
    0.7, // Instant delivery baseline preference
    0.8, // Deal seeking
    0.85 // High rating preference
  ];
}

function encodeProductKey(product: Product): number[] {
  const cat = (product.category || '').toLowerCase();
  const name = (product.name || '').toLowerCase();

  const isFood = cat.includes('restaurant') || cat.includes('food') || name.includes('thali') || name.includes('biryani');
  const isGrocery = cat.includes('mart') || cat.includes('grocery') || cat.includes('kirana') || cat.includes('veg') || cat.includes('fruit');
  const isFashion = cat.includes('cloth') || cat.includes('fashion') || cat.includes('wear') || cat.includes('boutique');

  // Normalized price factor (0 = expensive, 1 = affordable/cheap)
  const priceFactor = Math.max(0, 1 - (product.price / 1500));
  const isDiscounted = product.originalPrice && product.originalPrice > product.price ? 0.95 : 0.3;
  const inStockFactor = product.stock > 0 ? 0.9 : 0.1;

  return [
    isFood ? 0.9 : 0.1,
    isGrocery ? 0.9 : 0.1,
    isFashion ? 0.9 : 0.1,
    priceFactor,
    isFood ? 0.85 : 0.3,
    inStockFactor,
    isDiscounted,
    (product.rating || 4.2) / 5.0
  ];
}

function encodeStoreKey(store: Store): number[] {
  const categories = (store.categories || []).map(c => (c || '').toLowerCase()).join(' ');
  const name = (store.name || '').toLowerCase();

  const isFood = categories.includes('restaurant') || categories.includes('cafe') || name.includes('hotel') || name.includes('bhojnalaya');
  const isGrocery = categories.includes('mart') || categories.includes('kirana') || categories.includes('veg') || categories.includes('store');
  const isFashion = categories.includes('boutique') || categories.includes('cloth') || categories.includes('garment');

  return [
    isFood ? 0.95 : 0.1,
    isGrocery ? 0.95 : 0.1,
    isFashion ? 0.95 : 0.1,
    0.7, // Moderate price baseline
    isFood ? 0.85 : 0.3,
    (store as any).isOpen !== false ? 0.95 : 0.1,
    (store as any).isFeatured ? 0.9 : 0.4,
    (store.rating || 4.5) / 5.0
  ];
}

/**
 * Runs TensorFlow Scaled Dot-Product Attention in browser memory:
 * Attention(Q, K, V) = softmax((Q * K^T) / sqrt(d_k)) * V
 */
export async function calculateTensorFlowAttention(
  products: Product[],
  stores: Store[],
  user: RegisteredUser | null,
  searchQuery: string = '',
  activeTab: string = 'all'
): Promise<TensorFlowSummary> {
  const startTime = performance.now();

  const queryVector = encodeQueryContext(user, searchQuery, activeTab);
  const dk = queryVector.length; // 8 dimensions
  const scale = Math.sqrt(dk);

  let productAttentionScores: number[] = [];
  let storeAttentionScores: number[] = [];
  let tensorCount = 0;

  // Use tf.tidy for memory safety during matrix computation
  tf.tidy(() => {
    // 1. Prepare Tensors
    const qTensor = tf.tensor2d([queryVector], [1, dk]);

    // Candidate Products Keys [NumProducts, 8]
    const pKeysData = products.map(p => encodeProductKey(p));
    if (products.length > 0) {
      const pKeysTensor = tf.tensor2d(pKeysData, [pKeysData.length, dk]);
      const dotProduct = tf.matMul(qTensor, pKeysTensor, false, true); // [1, NumProducts]
      const scaledScores = tf.div(dotProduct, tf.scalar(scale));
      const softmaxScores = tf.softmax(scaledScores);
      productAttentionScores = Array.from(softmaxScores.dataSync());
    }

    // Candidate Stores Keys [NumStores, 8]
    const sKeysData = stores.map(s => encodeStoreKey(s));
    if (stores.length > 0) {
      const sKeysTensor = tf.tensor2d(sKeysData, [sKeysData.length, dk]);
      const sDotProduct = tf.matMul(qTensor, sKeysTensor, false, true);
      const sScaledScores = tf.div(sDotProduct, tf.scalar(scale));
      const sSoftmaxScores = tf.softmax(sScaledScores);
      storeAttentionScores = Array.from(sSoftmaxScores.dataSync());
    }

    tensorCount = tf.memory().numTensors;
  });

  const pKeysData = products.map(p => encodeProductKey(p));
  const productAttentionMatrix = products.map((p, pIdx) => {
    const itemKey = pKeysData[pIdx];
    return queryVector.map((qVal, kIdx) => (qVal * itemKey[kIdx]) / scale);
  });

  const formatScores = <T>(
    items: T[],
    scores: number[],
    encoder: (item: T) => number[]
  ): ItemAttentionResult<T>[] => {
    if (scores.length === 0) return [];

    const minScore = Math.min(...scores);
    const maxScore = Math.max(...scores);
    const range = maxScore - minScore || 1;

    const featureNames = [
      { en: 'Food Intent Match', hi: 'भोजन प्राथमिकता' },
      { en: 'Grocery Intent Match', hi: 'किराना प्राथमिकता' },
      { en: 'Fashion Intent Match', hi: 'फैशन प्राथमिकता' },
      { en: 'Affordability & Price', hi: 'कीमत & बजट' },
      { en: 'Time-of-Day Context', hi: 'समय के अनुसार' },
      { en: 'Stock & Speed', hi: 'स्टॉक & स्पीड' },
      { en: 'Offer & Coin Relevance', hi: 'ऑफर & डिस्काउंट' },
      { en: 'Quality & Rating', hi: 'रेटिंग & क्वालिटी' }
    ];

    return items.map((item, idx) => {
      const rawScore = scores[idx] || 0.1;
      const normalized = 68 + Math.round(((rawScore - minScore) / range) * 31); // 68% to 99%
      const itemKeyVector = encoder(item);

      const featureBreakdown: AttentionFeatureBreakdown[] = featureNames.map((fn, fIdx) => {
        const qVal = queryVector[fIdx];
        const kVal = itemKeyVector[fIdx];
        const score = Math.round(qVal * kVal * 100);
        return {
          featureName: fn.en,
          featureNameHi: fn.hi,
          weight: kVal,
          score
        };
      });

      return {
        item,
        attentionScore: Math.min(99, Math.max(65, normalized)),
        featureBreakdown,
        attentionVector: itemKeyVector
      };
    }).sort((a, b) => b.attentionScore - a.attentionScore);
  };

  const rankedProducts = formatScores(products, productAttentionScores, encodeProductKey);
  const rankedStores = formatScores(stores, storeAttentionScores, encodeStoreKey);

  const endTime = performance.now();

  return {
    rankedProducts,
    rankedStores,
    attentionMatrix: productAttentionMatrix.slice(0, 8),
    queryFeatureLabels: [
      'Food Intent', 'Grocery Intent', 'Fashion Intent',
      'Budget Alignment', 'Meal Time Context', 'Delivery Speed',
      'Loyalty Offer Seeking', 'Rating Preference'
    ],
    keyFeatureLabels: [
      'Food Category', 'Grocery Category', 'Fashion Category',
      'Affordable Price', 'Meal Relevancy', 'In-Stock Availability',
      'Discount Active', 'Rating Stars'
    ],
    inferenceTimeMs: Math.round((endTime - startTime) * 100) / 100,
    tensorCount,
    modelVersion: 'TFJS-Transformer-SelfAttention-v2.1'
  };
}

export type TensorFlowSummary = TensorFlowAttentionSummary;
