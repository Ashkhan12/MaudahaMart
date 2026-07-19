/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { INITIAL_PRODUCTS, INITIAL_STORES } from './src/data';
import Razorpay from "razorpay";
import { requireAuth, AuthRequest } from './src/middleware/auth.ts';
import { regionSegregationMiddleware } from './src/middleware/regionSegregation.ts';
import { upsertUser, getUser, saveOrder, getUserOrders, getAllOrders, saveSupportTicket, getUserSupportTickets, getAllSupportTickets, getOrderById } from './src/db/queries.ts';

dotenv.config();

const app = express();
const PORT = 3000;

// Set up middleware
app.use(express.json());
app.use('/api', regionSegregationMiddleware);

// Initialize Gemini API Client
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// --- API Endpoints ---

// Store OTPs in-memory: key=phoneNumber, value={ otp, expires }
const otpStore = new Map<string, { otp: string; expires: number }>();

// Send SMS OTP Verification Code
app.post('/api/auth/send-otp', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required.' });
    }
    const cleanedPhone = phone.replace(/\D/g, '');
    if (cleanedPhone.length < 10) {
      return res.status(400).json({ error: 'Please enter a valid 10-digit Indian phone number.' });
    }

    // Generate a secure 6-digit OTP
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Valid for 5 minutes
    const expires = Date.now() + 5 * 60 * 1000;
    otpStore.set(cleanedPhone, { otp: generatedOtp, expires });

    let gatewayUsed = 'Console Simulator (Local Testing)';
    let realSmsStatus = 'Not Sent (Configure TWILIO_ACCOUNT_SID or FAST2SMS_API_KEY in Secrets to send real SMS)';

    const twilioSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioFrom = process.env.TWILIO_PHONE_NUMBER;
    const fast2smsKey = process.env.FAST2SMS_API_KEY;

    if (twilioSid && twilioToken && twilioFrom) {
      try {
        const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`;
        const auth = Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64');
        const formattedTo = cleanedPhone.startsWith('+') ? cleanedPhone : `+91${cleanedPhone}`;
        
        const rawFrom = twilioFrom.trim();
        const formattedFrom = rawFrom.startsWith('+') 
          ? rawFrom 
          : (rawFrom.length === 10 ? `+91${rawFrom}` : `+${rawFrom}`);
        
        const params = new URLSearchParams();
        params.append('To', formattedTo);
        params.append('From', formattedFrom);
        params.append('Body', `Your Maudaha Mart verification OTP is ${generatedOtp}. Valid for 5 mins.`);

        if (formattedTo === formattedFrom) {
          gatewayUsed = 'Twilio Gateway (Self-Send Bypass)';
          realSmsStatus = `Successfully sent! (Bypassed: Sent to Twilio sender phone number. OTP code: ${generatedOtp})`;
          console.log(`[Maudaha Mart SMS Gateway] Target number matches Twilio sender number. Bypassed Twilio request to prevent self-sending limitation. SMS simulated successfully.`);
        } else {
          console.log(`[SMS Gateway] Triggering Twilio API to send SMS from ${formattedFrom} to ${formattedTo}...`);
          const twilioRes = await fetch(twilioUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Basic ${auth}`,
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: params.toString()
          });

          const data: any = await twilioRes.json();
          if (twilioRes.ok) {
            gatewayUsed = 'Twilio Gateway';
            realSmsStatus = `Successfully sent! SID: ${data.sid}`;
            console.log(`[Twilio SMS Gateway] OTP successfully sent to ${formattedTo}.`);
          } else {
            console.error('[Twilio SMS Error]', data);
            realSmsStatus = `Failed: ${data.message || 'Unknown Twilio error'}`;
          }
        }
      } catch (smsErr: any) {
        console.error('[Twilio SMS Integration Error]', smsErr);
        realSmsStatus = `Twilio network/integration error: ${smsErr.message || smsErr}`;
      }
    } else if (fast2smsKey) {
      try {
        const formattedTo = cleanedPhone.length === 10 ? cleanedPhone : cleanedPhone.slice(-10);
        console.log(`[SMS Gateway] Triggering Fast2SMS API to send SMS to ${formattedTo}...`);
        
        const fast2smsRes = await fetch('https://www.fast2sms.com/dev/bulkV2', {
          method: 'POST',
          headers: {
            'authorization': fast2smsKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            variables_values: generatedOtp,
            route: 'otp',
            numbers: formattedTo
          })
        });

        const data: any = await fast2smsRes.json();
        if (fast2smsRes.ok && data.return === true) {
          gatewayUsed = 'Fast2SMS Gateway';
          realSmsStatus = `Successfully sent! Message: ${data.message || 'OTP Sent'}`;
          console.log(`[Fast2SMS Gateway] OTP successfully sent to ${formattedTo}.`);
        } else {
          console.error('[Fast2SMS SMS Error]', data);
          realSmsStatus = `Failed: ${data.message || 'Unknown Fast2SMS error'}`;
        }
      } catch (smsErr: any) {
        console.error('[Fast2SMS SMS Integration Error]', smsErr);
        realSmsStatus = `Fast2SMS network/integration error: ${smsErr.message || smsErr}`;
      }
    }

    console.log(`\n======================================================\n[Maudaha Mart SMS Gateway] OTP sent to +91 ${cleanedPhone}\nMessage: "Your Maudaha Mart verification OTP is ${generatedOtp}. Valid for 5 mins."\nGateway Used: ${gatewayUsed}\nStatus: ${realSmsStatus}\n======================================================\n`);

    res.json({
      success: true,
      message: `OTP sent successfully via ${gatewayUsed}!`,
      otp: generatedOtp,
      phone: cleanedPhone,
      smsStatus: realSmsStatus
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to send OTP.' });
  }
});

// Verify SMS OTP Verification Code
app.post('/api/auth/verify-otp', (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ error: 'Phone number and OTP code are required.' });
    }
    const cleanedPhone = phone.replace(/\D/g, '');

    const record = otpStore.get(cleanedPhone);
    if (!record) {
      return res.status(400).json({ error: 'No OTP requested for this phone number. Please click resend/send.' });
    }

    if (Date.now() > record.expires) {
      otpStore.delete(cleanedPhone);
      return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
    }

    if (record.otp !== otp) {
      return res.status(400).json({ error: 'Incorrect verification code. Please try again.' });
    }

    // Verified! Delete the single-use OTP
    otpStore.delete(cleanedPhone);
    res.json({ success: true, message: 'OTP verified successfully!' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Verification failed.' });
  }
});

// 1. Health check API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    api_key_configured: !!apiKey,
    environment: process.env.NODE_ENV || 'development'
  });
});

// AI Translation API for easy product catalog management
app.post('/api/translate', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text to translate is required.' });
    }

    if (!apiKey) {
      return res.json({ translatedText: text });
    }

    const systemInstruction = `You are a high-fidelity translator for Maudaha Mart, an e-commerce platform in India. 
Translate the provided English text into clean, colloquial Hindi (Devanagari script). 
If it is a product name, keep it natural (e.g., "Mustard Oil" -> "सरसों का तेल", "Desi Ghee" -> "देसी घी", "Potato" -> "आलू"). 
Output ONLY the translated text. Do not write any explanation, intro, or extra characters.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: text,
      config: {
        systemInstruction,
        temperature: 0.3
      }
    });

    const translatedText = response.text ? response.text.trim() : text;
    res.json({ translatedText });
  } catch (error: any) {
    console.error('Error in /api/translate:', error);
    res.status(500).json({ error: error.message || 'An error occurred during translation.' });
  }
});

// AI Voice Search for Smart Intelligence Bar
app.post('/api/voice-search', async (req, res) => {
  try {
    const { prompt, language, products } = req.body;
    
    if (!apiKey) {
      return res.json({
        reply: language === 'hi' 
          ? "माफ़ करें, अभी मेरा AI असिस्टेंट काम नहीं कर रहा है। कृपया GEMINI_API_KEY सेट करें।" 
          : "Sorry, my AI assistant is currently unavailable. Please set the GEMINI_API_KEY."
      });
    }

    // Creating context from available products
    const productContext = products.map((p: any) => `- ${p.name} (${p.category}): ₹${p.price} | ${p.description}`).join('\n');

    const systemInstruction = `You are a smart, friendly shopping assistant for Maudaha Mart. 
The user is speaking to you via voice search. Keep your answer brief, conversational, and helpful (1-3 sentences maximum).
If the user asks for health-related products (e.g. healthy, health, immunity, organic, vitamins, medicine), aggressively suggest relevant items from the store's inventory.
Store Inventory:
${productContext}

Language requested: ${language === 'hi' ? 'Hindi' : 'English'}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7
      }
    });

    res.json({ reply: response.text });
  } catch (error: any) {
    console.error('Error in /api/voice-search:', error);
    res.status(500).json({ error: error.message || 'An error occurred during voice search.' });
  }
});

// 1.1 Database User Upsert API
app.post('/api/db/users', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { name, phone, email, location, locationHi, role, serviceAreaId } = req.body;
    const uid = req.user?.uid;
    if (!uid) {
      return res.status(400).json({ error: 'UID is required.' });
    }
    const user = await upsertUser({
      uid,
      name: name || 'User',
      phone,
      email: email || req.user?.email || undefined,
      location,
      locationHi,
      role,
      serviceAreaId: serviceAreaId || (req as any).serviceAreaId,
    });
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 1.2 Database Get User API
app.get('/api/db/users/me', requireAuth, async (req: AuthRequest, res) => {
  try {
    const uid = req.user?.uid;
    if (!uid) {
      return res.status(400).json({ error: 'UID is required.' });
    }
    const user = await getUser(uid);
    res.json(user || { error: 'User not found.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 1.3 Database Orders Upsert API
app.post('/api/db/orders', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { id, storeId, storeName, total, discount, paymentMethod, paymentStatus, deliveryStatus, date, items, serviceAreaId } = req.body;
    const uid = req.user?.uid;
    if (!uid) {
      return res.status(400).json({ error: 'UID is required.' });
    }
    const order = await saveOrder({
      id,
      userId: uid,
      storeId,
      storeName,
      total,
      discount,
      paymentMethod,
      paymentStatus,
      deliveryStatus,
      date,
      items,
      serviceAreaId: serviceAreaId || (req as any).serviceAreaId,
    });
    res.json(order);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 1.4 Database Get User Orders API
app.get('/api/db/orders/me', requireAuth, async (req: AuthRequest, res) => {
  try {
    const uid = req.user?.uid;
    if (!uid) {
      return res.status(400).json({ error: 'UID is required.' });
    }
    const orders = await getUserOrders(uid);
    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 1.5 Database Get All Orders API (Admin/Merchant Portal)
app.get('/api/db/orders/all', requireAuth, async (req: AuthRequest, res) => {
  try {
    const orders = await getAllOrders();
    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 1.5.1 Public Order Tracking API
app.get('/api/orders/track/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: 'Order ID is required.' });
    }
    const order = await getOrderById(id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }
    
    // Simulate real-time tracking details or generate an estimate
    // Some mock/simulated GPS coordinates and status timelines
    const statusTimeline = [
      { status: 'pending', label: 'Order Placed', labelHi: 'ऑर्डर दिया गया', time: order.date, completed: true },
      { status: 'accepted', label: 'Accepted by Merchant', labelHi: 'विक्रेता द्वारा स्वीकृत', time: order.date, completed: ['accepted', 'preparing', 'dispatched', 'arrived'].includes(order.deliveryStatus) },
      { status: 'preparing', label: 'Preparing Items', labelHi: 'सामग्री तैयार की जा रही है', time: order.date, completed: ['preparing', 'dispatched', 'arrived'].includes(order.deliveryStatus) },
      { status: 'dispatched', label: 'Out for Delivery', labelHi: 'वितरण के लिए निकला', time: order.date, completed: ['dispatched', 'arrived'].includes(order.deliveryStatus) },
      { status: 'arrived', label: 'Delivered', labelHi: 'पहुंचा दिया गया', time: order.date, completed: order.deliveryStatus === 'arrived' },
    ];

    // Simple ETA calculation
    let etaMinutes = 30;
    if (order.deliveryStatus === 'pending') etaMinutes = 45;
    else if (order.deliveryStatus === 'accepted') etaMinutes = 35;
    else if (order.deliveryStatus === 'preparing') etaMinutes = 25;
    else if (order.deliveryStatus === 'dispatched') etaMinutes = 10;
    else if (order.deliveryStatus === 'arrived') etaMinutes = 0;

    res.json({
      orderId: order.id,
      storeId: order.storeId,
      storeName: order.storeName,
      total: order.total,
      discount: order.discount,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      deliveryStatus: order.deliveryStatus,
      date: order.date,
      items: order.items,
      createdAt: order.createdAt,
      etaMinutes,
      statusTimeline,
      trackingCoordinates: {
        latitude: 25.6844, // Maudaha default coords approximately
        longitude: 80.1167
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 1.6 Database Tickets Upsert API
app.post('/api/db/tickets', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { id, subject, category, status, messages } = req.body;
    const uid = req.user?.uid;
    if (!uid) {
      return res.status(400).json({ error: 'UID is required.' });
    }
    const ticket = await saveSupportTicket({
      id,
      userId: uid,
      subject,
      category,
      status,
      messages,
    });
    res.json(ticket);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 1.7 Database Get User Tickets API
app.get('/api/db/tickets/me', requireAuth, async (req: AuthRequest, res) => {
  try {
    const uid = req.user?.uid;
    if (!uid) {
      return res.status(400).json({ error: 'UID is required.' });
    }
    const tickets = await getUserSupportTickets(uid);
    res.json(tickets);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 1.8 Database Get All Tickets API (Admin Support Desk)
app.get('/api/db/tickets/all', requireAuth, async (req: AuthRequest, res) => {
  try {
    const tickets = await getAllSupportTickets();
    res.json(tickets);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Stores API
app.get('/api/stores', (req, res) => {
  res.json(INITIAL_STORES);
});

// 3. Products API
app.get('/api/products', (req, res) => {
  res.json(INITIAL_PRODUCTS);
});

// 4. AI Shopping Assistant Chat API
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message parameter is required.' });
    }

    if (!apiKey) {
      return res.status(200).json({
        text: "Maudaha AI Assistant Offline: GEMINI_API_KEY is not configured in Secrets. Please configure it in Settings > Secrets to enable instant replies!",
        offline: true
      });
    }

    // Prepare contents history for Google GenAI SDK format
    // Format: { role: 'user' | 'model', parts: [{ text: string }] }
    const contentsPayload = [];

    if (history && Array.isArray(history)) {
      for (const turn of history) {
        contentsPayload.push({
          role: turn.role === 'user' ? 'user' : 'model',
          parts: [{ text: turn.text }]
        });
      }
    }

    // Append current message
    contentsPayload.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: contentsPayload,
      config: {
        systemInstruction: `You are the friendly Maudaha Mart Smart AI Assistant.
You help residents of Maudaha, Uttar Pradesh, with grocery selection, recipes, cooking tips, and navigating our local stores (Gupta Ji Kirana in Galla Mandi, Siddiqui Fresh Fruits & Veg in Bhatipura, Maudaha Dairy near Rahmaniya Ward, and Bundelkhand Sweets & Namkeen near Station Road).
You speak in a warm, welcoming, hyper-local tone, blending English and Hindi (Hinglish) naturally to reflect standard local conversation.
If asked for recipes, suggest regional Bundelkhandi specialties (e.g., Mahoba-style sweets, Bundelkhandi Kadhi, local Peda) and explain which items are available at Maudaha Mart stores. Keep answers under 150 words and do not refer to yourself as an language model.`
      }
    });

    res.json({
      text: response.text || "I couldn't generate a response. Please try again.",
      offline: false
    });
  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    res.status(500).json({ error: error.message || 'An error occurred during generation.' });
  }
});

// 5. AI Shopping List Parser API
app.post('/api/ai-parse-list', async (req, res) => {
  try {
    const { textList } = req.body;
    if (!textList) {
      return res.status(400).json({ error: 'textList parameter is required.' });
    }

    if (!apiKey) {
      return res.status(200).json({
        items: [],
        offline: true,
        error: "GEMINI_API_KEY is not configured."
      });
    }

    // Provide simplified product list to the model for matching
    const simplifiedCatalog = INITIAL_PRODUCTS.map(p => ({
      id: p.id,
      name: p.name,
      nameHi: p.nameHi,
      price: p.price,
      unit: p.unit,
      storeId: p.storeId
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `You are a shopping list parsing engine for Maudaha Mart.
The user wrote/pasted this raw list: "${textList}"
Your job is to parse each item they wanted and find the best match in our catalog of products:
${JSON.stringify(simplifiedCatalog)}

Match smartly, taking into account translations (e.g. "atta" -> Fortune Premium Chakki Atta, "milk" -> Maudaha Dairy Milk, "oil" -> Mustard Oil).
Return a JSON object conforming exactly to the responseSchema.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  itemName: { 
                    type: Type.STRING, 
                    description: "The name of the item from the user's input" 
                  },
                  quantity: { 
                    type: Type.STRING, 
                    description: "The quantity requested, or '1' if unspecified" 
                  },
                  matchedProductId: { 
                    type: Type.STRING, 
                    description: "The ID of the matched product (e.g. 'g1'), or null if no product in catalog is a close match" 
                  },
                  matchedProductName: { 
                    type: Type.STRING, 
                    description: "The name of the matched product, or null" 
                  },
                  matchedStoreId: { 
                    type: Type.STRING, 
                    description: "The store ID of the matched product, or null" 
                  },
                  price: { 
                    type: Type.NUMBER, 
                    description: "The price of the matched product, or null" 
                  }
                },
                required: ['itemName', 'quantity']
              }
            }
          },
          required: ['items']
        }
      }
    });

    const parsedResponse = JSON.parse(response.text || '{"items":[]}');
    res.json({
      items: parsedResponse.items || [],
      offline: false
    });
  } catch (error: any) {
    console.error('Error in /api/ai-parse-list:', error);
    res.status(500).json({ error: error.message || 'An error occurred during list parsing.' });
  }
});

// 6. AI Integrated Search API
app.post('/api/ai-search', async (req, res) => {
  try {
    const { query, language } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required.' });
    }

    if (!apiKey) {
      return res.json({
        explanation: "Maudaha AI Search is currently offline. Please configure your GEMINI_API_KEY in Secrets to enable semantic search!",
        explanationHi: "मौदहा एआई सर्च वर्तमान में ऑफलाइन है। सिमेंटिक सर्च को सक्षम करने के लिए कृपया सीक्रेट्स में अपना GEMINI_API_KEY कॉन्फ़िगर करें!",
        recommendedProductIds: [],
        offline: true
      });
    }

    const simplifiedCatalog = INITIAL_PRODUCTS.map(p => ({
      id: p.id,
      name: p.name,
      nameHi: p.nameHi,
      category: p.category,
      categoryHi: p.categoryHi || '',
      price: p.price,
      description: p.description || '',
      descriptionHi: p.descriptionHi || ''
    }));

    const systemInstruction = `You are the Maudaha Mart semantic product search engine.
Analyze the user's natural language shopping query and select the most relevant products from our catalog.
Explain your choices briefly in a warm, helpful, hyper-local tone, using Hinglish (mix of Hindi and English) or English depending on the language preference.
Return a JSON object with:
1. explanation: Your explanation of the search results in English.
2. explanationHi: Your explanation of the search results in Hindi.
3. recommendedProductIds: Array of product ID strings that match the query (e.g. ["g1", "g2"]). Limit to 6 product IDs.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `User Query: "${query}"
Selected Language: "${language || 'en'}"
Product Catalog:
${JSON.stringify(simplifiedCatalog)}

Provide your smart recommendations according to the response schema.`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            explanation: { type: Type.STRING },
            explanationHi: { type: Type.STRING },
            recommendedProductIds: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ['explanation', 'explanationHi', 'recommendedProductIds']
        }
      }
    });

    const result = JSON.parse(response.text || '{"explanation":"","explanationHi":"","recommendedProductIds":[]}');
    res.json({
      ...result,
      offline: false
    });
  } catch (error: any) {
    console.error('Error in /api/ai-search:', error);
    res.status(500).json({ error: error.message || 'An error occurred during AI search.' });
  }
});

// 7. AI Personalized Recommendations API
app.post('/api/ai-recommendations', async (req, res) => {
  try {
    const { searchHistory, watchlist, recentCategories, trendingProducts, recommendedProducts, language } = req.body;

    if (!apiKey) {
      return res.json({
        explanation: "Based on your active interests in Maudaha Mart, we picked some fresh & trending items from local shops! (Connect GEMINI_API_KEY for personalized explanations)",
        explanationHi: "मौदहा मार्ट में आपकी सक्रिय रुचियों के आधार पर, हमने स्थानीय दुकानों से कुछ ताज़ा और ट्रेंडिंग उत्पाद चुने हैं! (व्यक्तिगत स्पष्टीकरण के लिए GEMINI_API_KEY कनेक्ट करें)",
        marketTrendAlert: "Siddiqui Fresh Fruits and Maudaha Dairy are currently seeing peak weekend demand from Bhatipura and Rahmaniya Ward.",
        marketTrendAlertHi: "सिद्दीकी फ्रेश फ्रूट्स और मौदहा डेयरी में वर्तमान में भटीपुरा और रहमानिया वार्ड से सप्ताहांत की चरम मांग देखी जा रही है।",
        offline: true
      });
    }

    const systemInstruction = `You are the Maudaha Mart Smart Recommendation Engine.
Your goal is to understand the customer's shopping needs, search patterns, and local demands in Maudaha, UP, and explain why the suggested products match their lifestyle or current local trends.
Keep the explanation friendly, warm, and highly local. Speak in Hinglish/English based on preference. Reference our local stores (Gupta Ji Kirana, Siddiqui Fresh Fruits, Maudaha Dairy, Bundelkhand Sweets).
Response must conform to the JSON schema.`;

    const prompt = `
User Profile & Activity:
- Search History: ${JSON.stringify(searchHistory || [])}
- Watchlisted Product IDs: ${JSON.stringify(watchlist || [])}
- Recent Categories purchased or viewed: ${JSON.stringify(recentCategories || [])}
- Top Trending Products overall: ${JSON.stringify(trendingProducts || [])}

Suggested Products to explain:
${JSON.stringify(recommendedProducts || [])}

Selected Language: "${language || 'en'}"

Return a friendly explanation of why these match their needs, and provide a general market trend alert for Maudaha.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            explanation: { type: Type.STRING },
            explanationHi: { type: Type.STRING },
            marketTrendAlert: { type: Type.STRING },
            marketTrendAlertHi: { type: Type.STRING }
          },
          required: ['explanation', 'explanationHi', 'marketTrendAlert', 'marketTrendAlertHi']
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    res.json({
      ...result,
      offline: false
    });
  } catch (error: any) {
    console.error('Error in /api/ai-recommendations:', error);
    res.status(500).json({ error: error.message || 'An error occurred during recommendations generation.' });
  }
});

// --- Admin Service Area Management Mocks ---
let mockAreas = [
  { id: '1', name: 'Noida Sector 62', status: 'Active', radius: '5km', polygon_coordinates: [] },
  { id: '2', name: 'South Delhi', status: 'Closed', radius: '8km', polygon_coordinates: [] },
  { id: '3', name: 'Indirapuram', status: 'Active', radius: '4km', polygon_coordinates: [] },
];

app.get('/api/admin/service-areas', (req, res) => {
  res.json(mockAreas);
});

app.post('/api/admin/service-areas', (req, res) => {
  const { name, status, radius } = req.body;
  const newArea = {
    id: String(mockAreas.length + 1),
    name: name || 'New Area',
    status: status || 'Active',
    radius: radius || '5km',
    polygon_coordinates: []
  };
  mockAreas.push(newArea);
  res.status(201).json(newArea);
});

app.patch('/api/admin/service-areas/:id/status', (req, res) => {
  const area = mockAreas.find(a => a.id === req.params.id);
  if (area) {
    area.status = area.status === 'Active' ? 'Closed' : 'Active';
    res.json(area);
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});

app.put('/api/admin/service-areas/:id', (req, res) => {
  const area = mockAreas.find(a => a.id === req.params.id);
  if (area) {
    Object.assign(area, req.body);
    res.json(area);
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});

app.delete('/api/admin/service-areas/:id', (req, res) => {
  const initialLength = mockAreas.length;
  mockAreas = mockAreas.filter(a => a.id !== req.params.id);
  if (mockAreas.length < initialLength) {
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});

app.get('/api/admin/service-areas/:id/users', (req, res) => {
  res.json([
    { id: 'u1', name: 'Amit Kumar', location: 'Noida' },
    { id: 'u2', name: 'Rahul Sharma', location: 'Noida' }
  ]);
});

app.get('/api/admin/service-areas/:id/vendors', (req, res) => {
  res.json([
    { id: 'v1', name: 'Sharma Sweets', type: 'Restaurant' },
    { id: 'v2', name: 'Grocers Hub', type: 'Shop' }
  ]);
});

app.get('/api/admin/service-areas/:id/products', (req, res) => {
  res.json({ total: 1240, message: "Items Available" });
});

app.get('/api/admin/service-areas/:id/orders', (req, res) => {
  res.json({ totalActive: 48, message: "Active Orders Right Now" });
});

app.put('/api/admin/service-areas/:id/delivery-settings', (req, res) => {
  res.json({ success: true, message: 'Delivery settings updated' });
});

app.get('/api/admin/service-areas/:id/delivery-partners', (req, res) => {
  res.json({ online: 12, message: "Boys Online" });
});

app.get('/api/admin/service-areas/:id/coupons', (req, res) => {
  res.json([
    { code: 'NOIDANEW50' },
    { code: 'WELCOME100' }
  ]);
});

app.post('/api/admin/service-areas/:id/coupons', (req, res) => {
  res.status(201).json({ success: true, message: 'Coupon created' });
});

app.get('/api/admin/service-areas/:id/support-tickets', (req, res) => {
  res.json([
    { id: 'TK-902', subject: 'Delivery delay issue', status: 'open' }
  ]);
});

// 8. Admin AI Trend Analysis & Demand Forecast API
app.post('/api/admin/trend-analysis', async (req, res) => {
  try {
    const { allUserSearches, allOrders, allProducts, language } = req.body;

    if (!apiKey) {
      return res.json({
        summary: "Database query trends show steady growth in Daily Provisions and Dairy Products across Maudaha Mandi. (Set your GEMINI_API_KEY to generate deep strategic merchant reports).",
        topDemands: [
          { category: "Dairy", keyword: "Fresh Paneer", estimatedGrowth: "15%", actionItem: "Ensure daily morning supply at Maudaha Dairy." },
          { category: "Grocery", keyword: "Chakki Atta", estimatedGrowth: "12%", actionItem: "Increase wholesale orders for Gupta Ji Kirana." },
          { category: "Fruits", keyword: "Ripe Mangoes", estimatedGrowth: "22%", actionItem: "Procure fresh consignments for Siddiqui Fruits." }
        ],
        restockAdvice: [
          { merchantName: "Maudaha Dairy", suggestedAction: "Restock Premium Milk & Paneer by 7:00 AM", reason: "Maudaha residents search heavily for fresh dairy before morning tea hours." },
          { merchantName: "Gupta Ji Kirana", suggestedAction: "Bundle Atta with Mustard Oil promotions", reason: "Grocery buyers frequently add daily cooking oils with flour orders." }
        ],
        offline: true
      });
    }

    const systemInstruction = `You are the Maudaha Mart Market Research and Demand Forecasting AI.
Analyze the local transaction records, user search logs, and product catalog to detect latent customer demands, trending categories, and actionable restock advise for local shopkeepers in Maudaha (Gupta Ji Kirana in Galla Mandi, Siddiqui Fresh Fruits & Veg in Bhatipura, Maudaha Dairy near Rahmaniya Ward, and Bundelkhand Sweets & Namkeen near Station Road).
Return a beautifully structured report matching the schema.`;

    const prompt = `
All User Searches: ${JSON.stringify(allUserSearches || [])}
Recent Orders count: ${(allOrders || []).length}
Product Categories: ${JSON.stringify(allProducts?.map((p: any) => p.category) || [])}

Provide detailed strategic demand insights and merchant advice.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            topDemands: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING },
                  keyword: { type: Type.STRING },
                  estimatedGrowth: { type: Type.STRING },
                  actionItem: { type: Type.STRING }
                },
                required: ['category', 'keyword', 'estimatedGrowth', 'actionItem']
              }
            },
            restockAdvice: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  merchantName: { type: Type.STRING },
                  suggestedAction: { type: Type.STRING },
                  reason: { type: Type.STRING }
                },
                required: ['merchantName', 'suggestedAction', 'reason']
              }
            }
          },
          required: ['summary', 'topDemands', 'restockAdvice']
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    res.json({
      ...result,
      offline: false
    });
  } catch (error: any) {
    console.error('Error in /api/admin/trend-analysis:', error);
    res.status(500).json({ error: error.message || 'An error occurred during trend analysis.' });
  }
});


let razorpayInstance: Razorpay | null = null;
function getRazorpay() {
  if (!razorpayInstance) {
    if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
      razorpayInstance = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });
    }
  }
  return razorpayInstance;
}

// Razorpay Split Payment Route
app.post("/api/payment/razorpay-order", async (req, res) => {
  try {
    const { amount, transfers } = req.body;
    const rzp = getRazorpay();
    if (!rzp) {
      return res.status(200).json({
        success: true,
        mock: true,
        orderId: "mock_order_" + Date.now(),
        amount,
      });
    }
    const options = {
      amount: Math.round(amount * 100),
      currency: "INR",
      transfers: transfers?.map((t: any) => ({
        account: t.account,
        amount: Math.round(t.amount * 100),
        currency: "INR",
        notes: t.notes || {},
        linked_account_notes: ["branch"],
        on_hold: 0,
      })) || [],
    };
    const order = await rzp.orders.create(options);
    res.json({
      success: true,
      mock: false,
      orderId: order.id,
      amount,
      order,
    });
  } catch (err: any) {
    console.error("Razorpay Error:", err);
    res.status(500).json({ error: err.message });
  }
});


// --- Vite Dev Middleware / Production Static Asset Hosting ---

async function setupServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

setupServer();
