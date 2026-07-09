/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Store, Product, Review, Notification, RegisteredUser, SupportTicket, Order } from './types';

export const INITIAL_STORES: Store[] = [
  {
    id: 'banda-mart',
    name: 'Banda Super Mart',
    nameHi: 'बांदा सुपर मार्ट',
    area: 'Banda',
    address: 'Station Road, Banda',
    addressHi: 'स्टेशन रोड, बांदा',
    rating: 4.8,
    reviewCount: 120,
    banner: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600',
    deliveryTime: '15-20 mins',
    deliveryTimeHi: '15-20 मिनट',
    minOrder: 149,
    categories: ['Atta, Rice & Dal', 'Oils & Spices', 'Daily Provisions', 'Snacks & Munchies']
  },
  {
    id: 'gupta-kirana',
    name: 'Gupta Ji Kirana (Galla Mandi)',
    nameHi: 'गुप्ता जी किराना (गल्ला मंडी)',
    area: 'Maudaha',
    address: 'Galla Mandi Main Rd, Maudaha',
    addressHi: 'गल्ला मंडी मुख्य मार्ग, मौदहा',
    rating: 4.6,
    reviewCount: 48,
    banner: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600',
    deliveryTime: '10-15 mins',
    deliveryTimeHi: '10-15 मिनट',
    minOrder: 99,
    categories: ['Atta, Rice & Dal', 'Oils & Spices', 'Daily Provisions', 'Snacks & Munchies']
  },
  {
    id: 'siddiqui-fruits',
    name: 'Siddiqui Fresh Fruits & Veg (Naya Bazar)',
    nameHi: 'सिद्दीकी फ्रेश फ्रूट्स और सब्जियां (नया बाजार)',
    area: 'Maudaha',
    address: 'Naya Bazar, Maudaha',
    addressHi: 'नया बाजार, मौदहा',
    rating: 4.8,
    reviewCount: 65,
    banner: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&q=80&w=600',
    deliveryTime: '8-12 mins',
    deliveryTimeHi: '8-12 मिनट',
    minOrder: 49,
    categories: ['Vegetables', 'Fresh Fruits', 'Organic Greens']
  },
  {
    id: 'maudaha-dairy',
    name: 'Maudaha Dairy & Organic Farm',
    nameHi: 'मौदहा डेयरी और ऑर्गेनिक फार्म',
    area: 'Maudaha',
    address: 'Near Rahmaniya Ward, Maudaha',
    addressHi: 'रहमानिया वार्ड के पास, मौदहा',
    rating: 4.7,
    reviewCount: 39,
    banner: 'https://images.unsplash.com/photo-1527018601619-a508a2be00cd?auto=format&fit=crop&q=80&w=600',
    deliveryTime: '12-18 mins',
    deliveryTimeHi: '12-18 मिनट',
    minOrder: 50,
    categories: ['Milk & Butter', 'Paneer & Curd', 'Breads & Eggs']
  },
  {
    id: 'bundelkhand-sweets',
    name: 'Bundelkhand Sweets & Bakery',
    nameHi: 'बुंदेलखंड स्वीट्स एंड बेकरी',
    area: 'Maudaha',
    address: 'Subhash Nagar Road, Maudaha',
    addressHi: 'सुभाष नगर रोड, मौदहा',
    rating: 4.9,
    reviewCount: 112,
    banner: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&q=80&w=600',
    deliveryTime: '15-20 mins',
    deliveryTimeHi: '15-20 मिनट',
    minOrder: 99,
    categories: ['Maudaha Special Sweets', 'Namkeen & Savories', 'Fresh Bakery']
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  // Banda Mart Products
  {
    id: 'bm1',
    name: 'Banda Special Desi Ghee',
    nameHi: 'बांदा स्पेशल देसी घी',
    category: 'Oils & Spices',
    categoryHi: 'तेल और मसाले',
    price: 450,
    unit: '1 L',
    unitHi: '1 लीटर',
    stock: 20,
    image: 'https://images.unsplash.com/photo-1601055903647-8f1ea7511116?auto=format&fit=crop&q=80&w=200',
    rating: 4.9,
    description: 'Pure desi ghee made in Banda.',
    descriptionHi: 'बांदा में बना शुद्ध देसी घी।',
    storeId: 'banda-mart'
  },
  // Gupta Ji Kirana Products
  {
    id: 'g1',
    name: 'Fortune Premium Chakki Atta',
    nameHi: 'फॉर्च्यून प्रीमियम चक्की आटा',
    category: 'Atta, Rice & Dal',
    categoryHi: 'आटा, चावल और दाल',
    price: 245,
    unit: '5 kg',
    unitHi: '5 किलो',
    stock: 15,
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=200',
    rating: 4.5,
    description: '100% pure whole wheat flour processed with traditional stone-grinding.',
    descriptionHi: 'पारंपरिक पत्थर-पिसाई से तैयार 100% शुद्ध गेहूं का आटा।',
    storeId: 'gupta-kirana'
  },
  {
    id: 'g2',
    name: 'India Gate Basmati Rice Mini',
    nameHi: 'इंडिया गेट बासमती चावल मिनी',
    category: 'Atta, Rice & Dal',
    categoryHi: 'आटा, चावल और दाल',
    price: 95,
    unit: '1 kg',
    unitHi: '1 किलो',
    stock: 25,
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=200',
    rating: 4.7,
    description: 'Perfectly aged aromatic basmati rice grains with delicious taste.',
    descriptionHi: 'स्वादिष्ट स्वाद के साथ पूरी तरह से पुराना सुगंधित बासमती चावल।',
    storeId: 'gupta-kirana'
  },
  {
    id: 'g3',
    name: 'Premium Unpolished Toor Dal',
    nameHi: 'प्रीमियम अनपॉलिश तूर दाल',
    category: 'Atta, Rice & Dal',
    categoryHi: 'आटा, चावल और दाल',
    price: 160,
    unit: '1 kg',
    unitHi: '1 किलो',
    stock: 20,
    image: 'https://images.unsplash.com/photo-1547058881-aa0edd92aab3?auto=format&fit=crop&q=80&w=200',
    rating: 4.4,
    description: 'Rich in protein, chemical-free and unpolished split pigeon peas.',
    descriptionHi: 'प्रोटीन से भरपूर, रसायन मुक्त और बिना पॉलिश की हुई अरहर की दाल।',
    storeId: 'gupta-kirana'
  },
  {
    id: 'g4',
    name: 'Fortune Pure Mustard Oil',
    nameHi: 'फॉर्च्यून शुद्ध सरसों का तेल',
    category: 'Oils & Spices',
    categoryHi: 'तेल और मसाले',
    price: 175,
    unit: '1 Liter',
    unitHi: '1 लीटर',
    stock: 30,
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=200',
    rating: 4.6,
    description: 'Cold pressed kachi ghani pure mustard oil with high pungency.',
    descriptionHi: 'उच्च तीखेपन के साथ कोल्ड प्रेस्ड कच्ची घानी शुद्ध सरसों का तेल।',
    storeId: 'gupta-kirana'
  },
  {
    id: 'g5',
    name: 'Tata Tea Premium Blend',
    nameHi: 'टाटा चाय प्रीमियम ब्लेंड',
    category: 'Daily Provisions',
    categoryHi: 'दैनिक प्रावधान',
    price: 110,
    unit: '250 g',
    unitHi: '250 ग्राम',
    stock: 40,
    image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=200',
    rating: 4.5,
    description: 'Deliciously strong taste with an exquisite rich aroma.',
    descriptionHi: 'उत्कृष्ट समृद्ध सुगंध के साथ स्वादिष्ट रूप से कड़क स्वाद।',
    storeId: 'gupta-kirana'
  },
  {
    id: 'g6',
    name: 'Catch Turmeric Powder (Haldi)',
    nameHi: 'कैच हल्दी पाउडर (हल्दी)',
    category: 'Oils & Spices',
    categoryHi: 'तेल और मसाले',
    price: 34,
    unit: '100 g',
    unitHi: '100 ग्राम',
    stock: 50,
    image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&q=80&w=200',
    rating: 4.8,
    description: 'Sourced from the best farms of Salem, rich curcumin content.',
    descriptionHi: 'सेलम के सबसे अच्छे खेतों से प्राप्त, समृद्ध करक्यूमिन सामग्री।',
    storeId: 'gupta-kirana'
  },

  // Siddiqui Fruits & Veg Products
  {
    id: 's1',
    name: 'Fresh Local Potato (Alloo)',
    nameHi: 'ताजा स्थानीय आलू',
    category: 'Vegetables',
    categoryHi: 'सब्जियां',
    price: 25,
    unit: '1 kg',
    unitHi: '1 किलो',
    stock: 60,
    image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&q=80&w=200',
    rating: 4.6,
    description: 'Starchy local potatoes, freshly harvested from Maudaha fields.',
    descriptionHi: 'मौदहा के खेतों से ताजी काटी गई स्थानीय आलू।',
    storeId: 'siddiqui-fruits'
  },
  {
    id: 's2',
    name: 'Fresh Red Onion (Pyaz)',
    nameHi: 'ताजा लाल प्याज',
    category: 'Vegetables',
    categoryHi: 'सब्जियां',
    price: 38,
    unit: '1 kg',
    unitHi: '1 किलो',
    stock: 50,
    image: 'https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&q=80&w=200',
    rating: 4.4,
    description: 'Crispy and pungent red onions, handpicked quality.',
    descriptionHi: 'कुरकुरी और तीखी लाल प्याज, हाथ से चुनी हुई गुणवत्ता।',
    storeId: 'siddiqui-fruits'
  },
  {
    id: 's3',
    name: 'Organic Farm Tomatoes',
    nameHi: 'ऑर्गेनिक फार्म टमाटर',
    category: 'Vegetables',
    categoryHi: 'सब्जियां',
    price: 32,
    unit: '1 kg',
    unitHi: '1 किलो',
    stock: 45,
    image: 'https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&q=80&w=200',
    rating: 4.5,
    description: 'Juicy, rich-red ripe farm tomatoes, perfect for local curries.',
    descriptionHi: 'रसीले, गहरे लाल पके हुए खेत के टमाटर, स्थानीय कढ़ी और सब्जी के लिए उत्तम।',
    storeId: 'siddiqui-fruits'
  },
  {
    id: 's4',
    name: 'Fresh Golden Bananas',
    nameHi: 'ताजा सुनहरे केले',
    category: 'Fresh Fruits',
    categoryHi: 'ताजे फल',
    price: 55,
    unit: '1 Dozen',
    unitHi: '1 दर्जन',
    stock: 20,
    image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&q=80&w=200',
    rating: 4.7,
    description: 'Sweet, energy-rich, premium quality yellow bananas.',
    descriptionHi: 'मीठे, ऊर्जा से भरपूर, प्रीमियम गुणवत्ता वाले पीले केले।',
    storeId: 'siddiqui-fruits'
  },
  {
    id: 's5',
    name: 'Kashmiri Sweet Apples',
    nameHi: 'कश्मीरी मीठे सेब',
    category: 'Fresh Fruits',
    categoryHi: 'ताजे फल',
    price: 140,
    unit: '1 kg',
    unitHi: '1 किलो',
    stock: 18,
    image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&q=80&w=200',
    rating: 4.8,
    description: 'Fresh and crispy Kashmiri red apples with a sweet, juicy taste.',
    descriptionHi: 'मीठे और रसीले स्वाद वाले ताजे और कुरकुरे कश्मीरी लाल सेब।',
    storeId: 'siddiqui-fruits'
  },
  {
    id: 's6',
    name: 'Fresh Spicy Green Chillies',
    nameHi: 'ताजा तीखी हरी मिर्च',
    category: 'Organic Greens',
    categoryHi: 'ऑर्गेनिक सब्जियां',
    price: 15,
    unit: '100 g',
    unitHi: '100 ग्राम',
    stock: 40,
    image: 'https://images.unsplash.com/photo-1565191945037-fe4da1022938?auto=format&fit=crop&q=80&w=200',
    rating: 4.6,
    description: 'Extremely hot local green chillies, rich in flavor.',
    descriptionHi: 'अत्यंत तीखी स्थानीय हरी मिर्च, स्वाद से भरपूर।',
    storeId: 'siddiqui-fruits'
  },

  // Maudaha Dairy Products
  {
    id: 'd1',
    name: 'Fresh Buffalo Milk (Thick)',
    nameHi: 'ताजा भैंस का गाढ़ा दूध',
    category: 'Milk & Butter',
    categoryHi: 'दूध और मक्खन',
    price: 72,
    unit: '1 Liter',
    unitHi: '1 लीटर',
    stock: 35,
    image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&q=80&w=200',
    rating: 4.9,
    description: 'Fresh organic milk sourced directly from Maudaha organic farm.',
    descriptionHi: 'मौदहा ऑर्गेनिक फार्म से सीधे प्राप्त ताजा जैविक दूध।',
    storeId: 'maudaha-dairy'
  },
  {
    id: 'd2',
    name: 'Artisanal Fresh Paneer',
    nameHi: 'कारीगर द्वारा बनाया ताजा पनीर',
    category: 'Paneer & Curd',
    categoryHi: 'पनीर और दही',
    price: 90,
    unit: '200 g',
    unitHi: '200 ग्राम',
    stock: 22,
    image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&q=80&w=200',
    rating: 4.8,
    description: 'Soft, creamy and freshly packed paneer. Free from preservatives.',
    descriptionHi: 'सॉफ्ट, मखमली और ताजा पैक किया हुआ पनीर। प्रिजर्वेटिव्स से मुक्त।',
    storeId: 'maudaha-dairy'
  },
  {
    id: 'd3',
    name: 'Thick Farm Curd (Dahi)',
    nameHi: 'गाढ़ी फार्म दही (दही)',
    category: 'Paneer & Curd',
    categoryHi: 'पनीर और दही',
    price: 45,
    unit: '500 g',
    unitHi: '500 ग्राम',
    stock: 30,
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&q=80&w=200',
    rating: 4.7,
    description: 'Perfect thick curd made with high-quality pasteurized milk.',
    descriptionHi: 'उच्च गुणवत्ता वाले पाश्चुरीकृत दूध से बनी उत्तम गाढ़ी दही।',
    storeId: 'maudaha-dairy'
  },
  {
    id: 'd4',
    name: 'Amul Butter Salted',
    nameHi: 'अमुल बटर नमकीन',
    category: 'Milk & Butter',
    categoryHi: 'दूध और मक्खन',
    price: 56,
    unit: '100 g',
    unitHi: '100 ग्राम',
    stock: 45,
    image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&q=80&w=200',
    rating: 4.7,
    description: 'Delicious cream butter, perfect companion for toasted local breads.',
    descriptionHi: 'स्वादिष्ट क्रीम बटर, टोस्टेड लोकल ब्रेड के लिए सबसे अच्छा साथी।',
    storeId: 'maudaha-dairy'
  },
  {
    id: 'd5',
    name: 'Premium Brown Bread',
    nameHi: 'प्रीमियम ब्राउन ब्रेड',
    category: 'Breads & Eggs',
    categoryHi: 'ब्रेड और अंडे',
    price: 35,
    unit: '1 Pack',
    unitHi: '1 पैक',
    stock: 20,
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=200',
    rating: 4.3,
    description: 'Fresh and soft whole wheat brown bread baked daily.',
    descriptionHi: 'प्रतिदिन बेक किया हुआ ताजा और नरम साबुत गेहूं का ब्राउन ब्रेड।',
    storeId: 'maudaha-dairy'
  },

  // Bundelkhand Sweets Products
  {
    id: 'b1',
    name: 'Famous Maudaha Special Peda',
    nameHi: 'प्रसिद्ध मौदहा स्पेशल पेड़ा',
    category: 'Maudaha Special Sweets',
    categoryHi: 'मौदहा स्पेशल मिठाई',
    price: 210,
    unit: '500 g',
    unitHi: '500 ग्राम',
    stock: 12,
    image: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&q=80&w=200',
    rating: 5.0,
    description: 'The legendary caramelized milk sweet of Maudaha, authentic taste.',
    descriptionHi: 'मौदहा की प्रसिद्ध कैरामेलाइज्ड दूध से बनी मिठाई, असली पारंपरिक स्वाद।',
    storeId: 'bundelkhand-sweets'
  },
  {
    id: 'b2',
    name: 'Desi Ghee Besan Ladoo',
    nameHi: 'देसी घी बेसन लड्डू',
    category: 'Maudaha Special Sweets',
    categoryHi: 'मौदहा स्पेशल मिठाई',
    price: 180,
    unit: '500 g',
    unitHi: '500 ग्राम',
    stock: 15,
    image: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&q=80&w=200',
    rating: 4.8,
    description: 'Deliciously melted besan ladoos prepared with pure cow desi ghee.',
    descriptionHi: 'शुद्ध गाय के देसी घी से तैयार स्वादिष्ट और मुंह में पिघल जाने वाले बेसन के लड्डू।',
    storeId: 'bundelkhand-sweets'
  },
  {
    id: 'b3',
    name: 'Fresh Hot Samosas (With Chutney)',
    nameHi: 'ताजा गरम समोसा (चटनी के साथ)',
    category: 'Namkeen & Savories',
    categoryHi: 'नमकीन और नमकीन',
    price: 32,
    unit: '4 Pcs',
    unitHi: '4 पीस',
    stock: 10,
    image: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=200',
    rating: 4.9,
    description: 'Crispy samosas stuffed with spiced potatoes. Delivered hot.',
    descriptionHi: 'मसालेदार आलू से भरे कुरकुरे समोसे। गरम डिलीवर किया जाएगा।',
    storeId: 'bundelkhand-sweets'
  },
  {
    id: 'b4',
    name: 'Bundelkhand Special Sev',
    nameHi: 'बुंदेलखंड स्पेशल सेव',
    category: 'Namkeen & Savories',
    categoryHi: 'नमकीन और नमकीन',
    price: 60,
    unit: '250 g',
    unitHi: '250 ग्राम',
    stock: 25,
    image: 'https://images.unsplash.com/photo-1547058881-aa0edd92aab3?auto=format&fit=crop&q=80&w=200',
    rating: 4.7,
    description: 'Spicy, crispy gram flour noodles blended with Bundelkhandi spices.',
    descriptionHi: 'बुंदेलखंडी मसालों के साथ मिलाया गया तीखा, कुरकुरा बेसन का सेव।',
    storeId: 'bundelkhand-sweets'
  }
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'r1',
    storeId: 'gupta-kirana',
    author: 'Anshul Sahu',
    rating: 5,
    comment: 'Best store in Galla Mandi. Everything is packaged properly and the delivery is super fast.',
    commentHi: 'गल्ला मंडी में सबसे अच्छी दुकान। सब कुछ ठीक से पैक किया जाता है और डिलीवरी बहुत तेज होती है।',
    date: '2026-06-25'
  },
  {
    id: 'r2',
    storeId: 'gupta-kirana',
    author: 'Rajeev Kumar',
    rating: 4,
    comment: 'The grains are of very high quality. I always order my month\'s grocery from here.',
    commentHi: 'अनाज बहुत ही उच्च गुणवत्ता के हैं। मैं हमेशा अपने महीने का राशन यहीं से मंगवाता हूं।',
    date: '2026-06-20'
  },
  {
    id: 'r3',
    storeId: 'siddiqui-fruits',
    author: 'Asif Khan',
    rating: 5,
    comment: 'Veggies are exceptionally fresh, just like they got brought straight from local fields of Maudaha.',
    commentHi: 'सब्जियां असाधारण रूप से ताजी हैं, जैसे सीधे मौदहा के खेतों से लाई गई हों।',
    date: '2026-06-27'
  },
  {
    id: 'r4',
    storeId: 'maudaha-dairy',
    author: 'Savita Devi',
    rating: 5,
    comment: 'The Buffalo Milk is thick and makes amazing malai. Highly recommended!',
    commentHi: 'भैंस का दूध बहुत गाढ़ा है और इससे लाजवाब मलाई बनती है। अत्यधिक अनुशंसित!',
    date: '2026-06-26'
  },
  {
    id: 'r5',
    storeId: 'bundelkhand-sweets',
    author: 'Prashant Shivhare',
    rating: 5,
    comment: 'Maudaha Peda of this shop is absolute love. It is world-class, so soft and rich!',
    commentHi: 'इस दुकान का मौदहा पेड़ा बिल्कुल लाजवाब है। यह विश्व स्तरीय है, बहुत नरम और स्वादिष्ट है!',
    date: '2026-06-28'
  }
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    title: 'Monsoon Feast Offer!',
    titleHi: 'मानसून दावत ऑफर!',
    body: 'Get flat Rs. 50 off on fresh fruits & vegetables at Siddiqui Fruits! Minimum order Rs. 199.',
    bodyHi: 'सिद्दीकी फ्रूट्स पर ताजे फलों और सब्जियों पर फ्लैट 50 रुपये की छूट पाएं! न्यूनतम ऑर्डर 199 रुपये।',
    code: 'MAUMANGO',
    discountAmount: 50,
    type: 'discount',
    date: '2026-06-28',
    isRead: false
  },
  {
    id: 'n2',
    title: 'Galla Mandi Kirana Fest',
    titleHi: 'गल्ला मंडी किराना उत्सव',
    body: 'Save big with 10% discount at Gupta Ji Kirana. Applicable on grocery bags.',
    bodyHi: 'गुप्ता जी किराना पर 10% की छूट के साथ बड़ी बचत करें। राशन बैग पर लागू।',
    code: 'GUPTA10',
    discountAmount: 30,
    type: 'discount',
    date: '2026-06-27',
    isRead: false
  },
  {
    id: 'n3',
    title: 'Welcome to Maudaha Mart',
    titleHi: 'मौदहा मार्ट में आपका स्वागत है',
    body: 'Your hyper-local instant delivery companion. Enjoy 5% cashback coins on every order.',
    bodyHi: 'आपका अपना हाइपर-लोकल त्वरित डिलीवरी साथी। प्रत्येक ऑर्डर पर 5% कैश-बैक कॉइन्स का आनंद लें।',
    type: 'general',
    date: '2026-06-28',
    isRead: false
  }
];

// Dictionary of translations for static elements
export const TRANSLATIONS = {
  en: {
    appName: 'Maudaha Mart',
    tagline: 'Maudaha’s Superfast Grocery Delivery',
    taglineHi: 'मौदहा की सुपरफास्ट ग्रोसरी डिलीवरी',
    searchPlaceholder: 'Search fresh veggies, milk, local peda...',
    customerPortal: 'Customer Portal',
    merchantPortal: 'Merchant Portal',
    switchRole: 'Switch Role',
    langToggle: 'हिंदी',
    english: 'English',
    hindi: 'Hindi',
    categories: 'Categories',
    popularStores: 'Popular Stores in Maudaha',
    deliveryTime: 'Delivery Time',
    minOrder: 'Min. Order',
    rating: 'Rating',
    reviews: 'Reviews',
    addReview: 'Add Review',
    writeComment: 'Write your comment...',
    yourName: 'Your Name',
    submit: 'Submit',
    items: 'items',
    cart: 'Cart',
    viewCart: 'View Cart',
    cartEmpty: 'Your cart is empty',
    addToCart: 'Add to Cart',
    outOfStock: 'Out of Stock',
    checkout: 'Instant Checkout',
    subtotal: 'Subtotal',
    discount: 'Discount',
    deliveryFee: 'Delivery Fee',
    free: 'FREE',
    grandTotal: 'Grand Total',
    selectPayment: 'Select Payment Method',
    upiPay: 'Pay via UPI (Instant)',
    codPay: 'Cash on Delivery (COD)',
    enterUpiId: 'Enter your UPI ID',
    payNow: 'Pay Now & Place Order',
    paymentSuccess: 'Payment Successful!',
    orderPlaced: 'Order Placed Successfully!',
    deliveryAddress: 'Enter Delivery Address in Maudaha',
    placeOrder: 'Place Order',
    loyaltyProgram: 'Loyalty Club',
    loyaltyBalance: 'Maudaha Coin Balance',
    loyaltyCoins: 'Coins',
    loyaltySub: 'Earn 5 coins per ₹100 spent! Redeem them for instant cash discounts.',
    redeemCoins: 'Redeem Coins for ₹',
    redeemed: 'Redeemed',
    coinsEarnedMsg: 'You will earn {coins} coins on this order!',
    orderHistory: 'Order History',
    noOrders: 'No orders placed yet.',
    orderId: 'Order ID',
    status: 'Status',
    trackOrder: 'Track Live Delivery',
    notifications: 'Promotions & Coupons',
    promoAvailable: 'Promo code copied!',
    useCode: 'Use Code',
    copyCode: 'Copy Code',
    // Delivery tracking stages
    pending: 'Pending (Waiting for Merchant)',
    processing: 'Processing (Accepted by Merchant)',
    ready_for_pickup: 'Ready for Pickup (Waiting for Delivery boy)',
    ready_for_delivery: 'Ready for Delivery (Delivery boy has items)',
    out_for_delivery: 'Out for Delivery (Delivery boy en-route)',
    arrived: 'Delivered Successfully!',
    // Merchant Dashboard strings
    merchantTitle: 'Maudaha Merchant Console',
    inventoryTitle: 'Inventory & Stock Management',
    addMenuItem: 'Add New Product',
    updateStock: 'Update Stock',
    saveChanges: 'Save Changes',
    allOrders: 'Received Orders',
    clientReviews: 'Customer Reviews Feedback',
    price: 'Price',
    stock: 'Stock Status',
    actions: 'Actions',
    inStock: 'In Stock',
    lowStock: 'Low Stock',
    storeSettings: 'My Store Profiles',
    acceptOrder: 'Accept Order',
    markPacked: 'Mark Packed',
    dispatchOrder: 'Dispatch Delivery',
    markDelivered: 'Simulate Arrival',
    activeOrders: 'Active Orders',
    noMerchantOrders: 'No orders received yet for your store.',
    backToBrowsing: 'Back to Stores',
    paymentCompleted: 'Payment Completed',
    paymentPending: 'Payment Pending',
    notificationHeading: 'Push Notifications & Alerts',
    addNewPromo: 'Create New Discount Notification',
    promoTitleInput: 'Promo Title',
    promoBodyInput: 'Promo Details (Description)',
    promoCodeInput: 'Coupon Code (e.g. EXTRA20)',
    promoDiscountInput: 'Discount Amount (₹)',
    sendNotification: 'Send Push Notification to Customers',
    storeHeaderLabel: 'Selected Store',
    loyaltyTierBronze: 'Maudaha Bronze Club',
    loyaltyTierSilver: 'Maudaha Silver Star',
    loyaltyTierGold: 'Maudaha Gold Elite',
    loyaltyTierPlatinum: 'Maudaha Royal Club',
    pointsHistory: 'Coins History Log',
    earned: 'Earned',
    spent: 'Spent'
  },
  hi: {
    appName: 'मौदहा मार्ट',
    tagline: 'मौदहा की सुपरफास्ट ग्रोसरी डिलीवरी',
    taglineHi: 'मौदहा की सुपरफास्ट ग्रोसरी डिलीवरी',
    searchPlaceholder: 'ताजी सब्जियां, दूध, स्थानीय पेड़ा खोजें...',
    customerPortal: 'ग्राहक पोर्टल',
    merchantPortal: 'व्यापारी पोर्टल',
    switchRole: 'भूमिका बदलें',
    langToggle: 'English',
    english: 'अंग्रेजी',
    hindi: 'हिंदी',
    categories: 'श्रेणियां',
    popularStores: 'मौदहा में लोकप्रिय दुकानें',
    deliveryTime: 'वितरण समय',
    minOrder: 'न्यूनतम आर्डर',
    rating: 'रेटिंग',
    reviews: 'समीक्षाएं',
    addReview: 'समीक्षा जोड़ें',
    writeComment: 'अपनी टिप्पणी लिखें...',
    yourName: 'आपका नाम',
    submit: 'जमा करें',
    items: 'सामग्री',
    cart: 'कार्ट',
    viewCart: 'कार्ट देखें',
    cartEmpty: 'आपकी कार्ट खाली है',
    addToCart: 'कार्ट में जोड़ें',
    outOfStock: 'स्टॉक में नहीं है',
    checkout: 'त्वरित चेकआउट',
    subtotal: 'उपयोगिता योग',
    discount: 'छूट',
    deliveryFee: 'वितरण शुल्क',
    free: 'मुफ़्त',
    grandTotal: 'कुल देय राशि',
    selectPayment: 'भुगतान विधि चुनें',
    upiPay: 'UPI द्वारा भुगतान (त्वरित)',
    codPay: 'कैश ऑन डिलीवरी (COD)',
    enterUpiId: 'अपनी UPI आईडी दर्ज करें',
    payNow: 'अभी भुगतान करें और ऑर्डर दें',
    paymentSuccess: 'भुगतान सफल रहा!',
    orderPlaced: 'आर्डर सफलतापूर्वक दर्ज हुआ!',
    deliveryAddress: 'मौदहा में वितरण का पता दर्ज करें',
    placeOrder: 'ऑर्डर दें',
    loyaltyProgram: 'लोयल्टी क्लब',
    loyaltyBalance: 'मौदहा कॉइन बैलेंस',
    loyaltyCoins: 'कॉइन्स',
    loyaltySub: 'प्रत्येक ₹100 खर्च करने पर 5 कॉइन्स कमाएं! उन्हें तत्काल नकद छूट के लिए भुनाएं।',
    redeemCoins: 'कॉइन्स भुनाएं ₹',
    redeemed: 'भुनाया गया',
    coinsEarnedMsg: 'आपको इस ऑर्डर पर {coins} कॉइन्स मिलेंगे!',
    orderHistory: 'ऑर्डर इतिहास',
    noOrders: 'अभी तक कोई ऑर्डर नहीं दिया गया है।',
    orderId: 'ऑर्डर आईडी',
    status: 'स्थिति',
    trackOrder: 'लाइव वितरण ट्रैकिंग',
    notifications: 'प्रचार और कूपन',
    promoAvailable: 'प्रोमो कोड कॉपी किया गया!',
    useCode: 'कोड प्रयोग करें',
    copyCode: 'कोड कॉपी करें',
    // Delivery tracking stages
    pending: 'लंबित (व्यापारी की स्वीकृति का इंतजार)',
    processing: 'प्रसंस्करण (व्यापारी द्वारा स्वीकृत)',
    ready_for_pickup: 'पिकअप के लिए तैयार (सवार का इंतजार)',
    ready_for_delivery: 'वितरण के लिए तैयार (सामान सवार के पास है)',
    out_for_delivery: 'वितरण के लिए बाहर (सवार रास्ते में है)',
    arrived: 'सफलतापूर्वक वितरित!',
    // Merchant Dashboard strings
    merchantTitle: 'मौदहा मर्चेंट कंसोल',
    inventoryTitle: 'इन्वेंट्री और स्टॉक प्रबंधन',
    addMenuItem: 'नया उत्पाद जोड़ें',
    updateStock: 'स्टॉक अपडेट करें',
    saveChanges: 'बदलाव सुरक्षित करें',
    allOrders: 'प्राप्त आर्डर',
    clientReviews: 'ग्राहक समीक्षा प्रतिक्रिया',
    price: 'मूल्य',
    stock: 'स्टॉक स्थिति',
    actions: 'कार्रवाई',
    inStock: 'स्टॉक में है',
    lowStock: 'कम स्टॉक',
    storeSettings: 'मेरी दुकान प्रोफाइल',
    acceptOrder: 'ऑर्डर स्वीकार करें',
    markPacked: 'पैक किया हुआ चिह्नित करें',
    dispatchOrder: 'डिलीवरी के लिए भेजें',
    markDelivered: 'आगमन सिमुलेट करें',
    activeOrders: 'सक्रिय ऑर्डर',
    noMerchantOrders: 'आपकी दुकान के लिए अभी तक कोई ऑर्डर प्राप्त नहीं हुआ है।',
    backToBrowsing: 'दुकानों पर वापस जाएं',
    paymentCompleted: 'भुगतान पूरा हुआ',
    paymentPending: 'भुगतान लंबित',
    notificationHeading: 'पुश नोटिफिकेशन और अलर्ट',
    addNewPromo: 'नया डिस्काउंट नोटिफिकेशन बनाएं',
    promoTitleInput: 'प्रोमो शीर्षक',
    promoBodyInput: 'प्रोमो विवरण (विवरण)',
    promoCodeInput: 'कूपन कोड (जैसे EXTRA20)',
    promoDiscountInput: 'छूट राशि (₹)',
    sendNotification: 'ग्राहकों को पुश नोटिफिकेशन भेजें',
    storeHeaderLabel: 'चयनित दुकान',
    loyaltyTierBronze: 'मौदहा ब्रॉन्ज़ क्लब',
    loyaltyTierSilver: 'मौदहा सिल्वर स्टार',
    loyaltyTierGold: 'मौदहा गोल्ड एलीट',
    loyaltyTierPlatinum: 'मौदहा रॉयल क्लब',
    pointsHistory: 'कॉइन्स इतिहास लॉग',
    earned: 'कमाया गया',
    spent: 'खर्च किया गया'
  }
};

export const INITIAL_USERS: RegisteredUser[] = [
  {
    id: 'user-owner-ash',
    name: 'Ash (Project Owner)',
    phone: '+91 99999 00000',
    email: 'biengwithash@gmail.com',
    location: 'Maudaha Central',
    locationHi: 'मौदहा सेंट्रल',
    role: 'admin',
    searchHistory: [],
    activities: [
      {
        id: 'act-owner-1',
        timestamp: '2026-07-09 10:00 AM',
        action: 'Restored owner permission rights',
        actionHi: 'मालिक की अनुमति अधिकार बहाल किए'
      }
    ]
  },
  {
    id: 'user-manager-banda',
    name: 'Banda Area Manager',
    phone: '+91 88888 77777',
    location: 'Banda',
    locationHi: 'बांदा',
    role: 'manager',
    assignedArea: 'Banda',
    searchHistory: [],
    activities: []
  },
  {
    id: 'user-customer-banda',
    name: 'Ramesh (Banda)',
    phone: '+91 77777 66666',
    location: 'Banda',
    locationHi: 'बांदा',
    role: 'customer',
    assignedArea: 'Banda',
    searchHistory: [],
    activities: []
  },
  {
    id: 'user-manager',
    name: 'Maudaha Area Manager',
    phone: '+91 99999 88888',
    location: 'Maudaha',
    locationHi: 'मौदहा',
    role: 'manager',
    assignedArea: 'Maudaha',
    searchHistory: [],
    activities: []
  },
  {
    id: 'user-1',
    name: 'Amit Kumar Mishra',
    phone: '+91 94520 12345',
    location: 'Station Road, Maudaha',
    locationHi: 'स्टेशन रोड, मौदहा',
    role: 'customer',
    searchHistory: ['desi ghee', 'ashirvaad atta', 'shampoo', 'paneer', 'mustard oil'],
    activities: [
      {
        id: 'act-1-1',
        timestamp: '2026-06-28 09:30 AM',
        action: 'Searched for "Desi Ghee" in Gupta Ji Kirana',
        actionHi: 'गुप्ता जी किराना में "देसी घी" खोजा गया'
      },
      {
        id: 'act-1-2',
        timestamp: '2026-06-28 09:45 AM',
        action: 'Added Pure Desi Ghee (1 L) to cart',
        actionHi: 'कार्ट में शुद्ध देसी घी (1 लीटर) जोड़ा गया'
      },
      {
        id: 'act-1-3',
        timestamp: '2026-06-28 10:00 AM',
        action: 'Placed order #1001 for ₹480',
        actionHi: '₹480 का ऑर्डर #1001 दिया'
      }
    ]
  },
  {
    id: 'user-2',
    name: 'Sana Siddiqui',
    phone: '+91 81270 98765',
    location: 'Rahmaniya Mohalla, Maudaha',
    locationHi: 'रहमानिया मोहल्ला, मौदहा',
    role: 'merchant',
    searchHistory: ['fresh mangoes', 'spinach', 'fuji apples', 'organic potatoes'],
    activities: [
      {
        id: 'act-2-1',
        timestamp: '2026-06-28 10:15 AM',
        action: 'Searched for "Fresh Mangoes"',
        actionHi: '"ताजे आम" खोजा गया'
      },
      {
        id: 'act-2-2',
        timestamp: '2026-06-28 10:30 AM',
        action: 'Applied coupon RAKHI40 successfully',
        actionHi: 'कूपन RAKHI40 सफलतापूर्वक लागू किया गया'
      }
    ]
  },
  {
    id: 'user-3',
    name: 'Rajesh Gupta',
    phone: '+91 91400 45678',
    location: 'Galla Mandi Lane, Maudaha',
    locationHi: 'गल्ला मंडी लेन, मौदहा',
    role: 'rider',
    searchHistory: ['cow milk', 'fresh paneer', 'eggs'],
    activities: [
      {
        id: 'act-3-1',
        timestamp: '2026-06-27 05:12 PM',
        action: 'Reviewed Maudaha Dairy & Organic Farm (5 Stars)',
        actionHi: 'मौदहा डेयरी को 5 स्टार समीक्षा दी'
      }
    ]
  },
  {
    id: 'user-4',
    name: 'Deepak Verma',
    phone: '+91 70075 54321',
    location: 'Chauraha Bypass Road, Maudaha',
    locationHi: 'चौराहा बाईपास रोड, मौदहा',
    role: 'customer',
    searchHistory: ['britannia biscuits', 'coca cola', 'potato chips'],
    activities: [
      {
        id: 'act-4-1',
        timestamp: '2026-06-27 11:20 AM',
        action: 'Viewed Gupta Ji Kirana popular products',
        actionHi: 'गुप्ता जी किराना के लोकप्रिय उत्पाद देखे'
      }
    ]
  }
];

export const INITIAL_SUPPORT_TICKETS: SupportTicket[] = [
  {
    id: 'ticket-1',
    userId: 'user-1',
    userName: 'Rajesh Kumar',
    userPhone: '+91 94520 12345',
    subject: 'Refund issue with order #ORD-12502',
    category: 'Refund / Payment',
    status: 'open',
    createdAt: '06/27/2026, 10:15 AM',
    messages: [
      {
        id: 'msg-1',
        sender: 'user',
        senderName: 'Rajesh Kumar',
        text: 'Hello, I paid for order #ORD-12502 using coins, but my order got cancelled and I have not received my coins back yet. Please check.',
        timestamp: '06/27/2026, 10:15 AM'
      }
    ]
  },
  {
    id: 'ticket-2',
    userId: 'user-2',
    userName: 'Anjali Sharma',
    userPhone: '+91 81270 98765',
    subject: 'Unable to update store banner image',
    category: 'App Issue',
    status: 'resolved',
    createdAt: '06/26/2026, 04:30 PM',
    messages: [
      {
        id: 'msg-2',
        sender: 'user',
        senderName: 'Anjali Sharma',
        text: 'Is there a size restriction for the store banner? Mine keeps getting cut off.',
        timestamp: '06/26/2026, 04:30 PM'
      },
      {
        id: 'msg-3',
        sender: 'admin',
        senderName: 'Admin',
        text: 'Hi Anjali, please use an aspect ratio of 4:3 for store banners (e.g., 800x600 px). Let us know if you need anything else.',
        timestamp: '06/26/2026, 05:00 PM'
      },
      {
        id: 'msg-4',
        sender: 'user',
        senderName: 'Anjali Sharma',
        text: 'Thank you! It works perfectly now.',
        timestamp: '06/26/2026, 05:15 PM'
      }
    ]
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'MAU-5041',
    userId: 'user-1',
    storeId: 'gupta-kirana',
    storeName: 'Gupta Ji Grocery & Provisions',
    storeNameHi: 'गुप्ता जी किराना एवं प्रोविज़न्स',
    date: '2026-06-28',
    total: 340,
    discount: 15,
    paymentMethod: 'UPI',
    upiId: 'amit.mishra@okhdfcbank',
    paymentStatus: 'completed',
    deliveryStatus: 'pending',
    coinsEarned: 17,
    coinsRedeemed: 0,
    items: [
      {
        product: {
          id: 'g1',
          name: 'Fortune Premium Chakki Atta',
          nameHi: 'फॉर्च्यून प्रीमियम चक्की आटा',
          category: 'Atta, Rice & Dal',
          categoryHi: 'आटा, चावल और दाल',
          price: 245,
          unit: '5 kg',
          unitHi: '5 किलो',
          stock: 15,
          image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=200',
          rating: 4.5,
          description: '100% pure whole wheat flour processed with traditional stone-grinding.',
          descriptionHi: 'पारंपरिक पत्थर-पिसाई से तैयार 100% शुद्ध गेहूं का आटा।',
          storeId: 'gupta-kirana'
        },
        quantity: 1
      },
      {
        product: {
          id: 'g2',
          name: 'India Gate Basmati Rice Mini',
          nameHi: 'इंडिया गेट बासमती चावल मिनी',
          category: 'Atta, Rice & Dal',
          categoryHi: 'आटा, चावल और दाल',
          price: 95,
          unit: '1 kg',
          unitHi: '1 किलो',
          stock: 25,
          image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=200',
          rating: 4.4,
          description: 'Aromatic and long grain basmati rice, perfect for biryani.',
          descriptionHi: 'सुगंधित और लंबे दाने वाले बासमती चावल, बिरयानी के लिए उपयुक्त।',
          storeId: 'gupta-kirana'
        },
        quantity: 1
      }
    ]
  },
  {
    id: 'MAU-3120',
    userId: 'user-1',
    storeId: 'maudaha-dairy',
    storeName: 'Maudaha Dairy & Organic Farm',
    storeNameHi: 'मौदहा डेयरी एंड ऑर्गेनिक फार्म',
    date: '2026-06-26',
    total: 252,
    discount: 0,
    paymentMethod: 'COD',
    paymentStatus: 'completed',
    deliveryStatus: 'arrived',
    coinsEarned: 12,
    coinsRedeemed: 0,
    items: [
      {
        product: {
          id: 'd1',
          name: 'Fresh Buffalo Milk (Thick)',
          nameHi: 'ताजा भैंस का गाढ़ा दूध',
          category: 'Milk & Butter',
          categoryHi: 'दूध और मक्खन',
          price: 72,
          unit: '1 Liter',
          unitHi: '1 लीटर',
          stock: 35,
          image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&q=80&w=200',
          rating: 4.9,
          description: 'Fresh organic milk sourced directly from Maudaha organic farm.',
          descriptionHi: 'मौदहा ऑर्गेनिक फार्म से सीधे प्राप्त ताजा जैविक दूध।',
          storeId: 'maudaha-dairy'
        },
        quantity: 2
      },
      {
        product: {
          id: 'd2',
          name: 'Artisanal Fresh Paneer',
          nameHi: 'कारीगर द्वारा बनाया ताजा पनीर',
          category: 'Paneer & Curd',
          categoryHi: 'पनीर और दही',
          price: 90,
          unit: '200 g',
          unitHi: '200 ग्राम',
          stock: 22,
          image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&q=80&w=200',
          rating: 4.8,
          description: 'Soft, creamy and freshly packed paneer. Free from preservatives.',
          descriptionHi: 'सॉफ्ट, मखमली और ताजा पैक किया हुआ पनीर। प्रिजर्वेटिव्स से मुक्त।',
          storeId: 'maudaha-dairy'
        },
        quantity: 1
      }
    ]
  },
  {
    id: 'MAU-1250',
    userId: 'user-4',
    storeId: 'siddiqui-fruits',
    storeName: 'Siddiqui Fruits & Fresh Vegetables',
    storeNameHi: 'सिद्दीकी फ्रूट्स एंड फ्रेश वेजिटेबल्स',
    date: '2026-06-27',
    total: 180,
    discount: 10,
    paymentMethod: 'UPI',
    upiId: 'deepak@upi',
    paymentStatus: 'completed',
    deliveryStatus: 'arrived',
    coinsEarned: 9,
    coinsRedeemed: 15,
    items: [
      {
        product: {
          id: 's4',
          name: 'Fresh Golden Bananas',
          nameHi: 'ताजा सुनहरे केले',
          category: 'Fresh Fruits',
          categoryHi: 'ताजे फल',
          price: 55,
          unit: '1 Dozen',
          unitHi: '1 दर्जन',
          stock: 20,
          image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&q=80&w=200',
          rating: 4.7,
          description: 'Sweet, energy-rich, premium quality yellow bananas.',
          descriptionHi: 'मीठे, ऊर्जा से भरपूर, प्रीमियम गुणवत्ता वाले पीले केले।',
          storeId: 'siddiqui-fruits'
        },
        quantity: 2
      },
      {
        product: {
          id: 's3',
          name: 'Organic Farm Tomatoes',
          nameHi: 'ऑर्गेनिक फार्म टमाटर',
          category: 'Vegetables',
          categoryHi: 'सब्जियां',
          price: 32,
          unit: '1 kg',
          unitHi: '1 किलो',
          stock: 45,
          image: 'https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&q=80&w=200',
          rating: 4.5,
          description: 'Juicy, rich-red ripe farm tomatoes, perfect for local curries.',
          descriptionHi: 'रसीले, गहरे लाल पके हुए खेत के टमाटर, स्थानीय कढ़ी और सब्जी के लिए उत्तम।',
          storeId: 'siddiqui-fruits'
        },
        quantity: 2
      }
    ]
  }
];



