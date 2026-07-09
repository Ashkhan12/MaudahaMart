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
import { upsertUser, getUser, saveOrder, getUserOrders, getAllOrders, saveSupportTicket, getUserSupportTickets, getAllSupportTickets } from './src/db/queries.ts';

dotenv.config();

const app = express();
const PORT = 3000;

// Set up middleware
app.use(express.json());

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
    const { phone, recaptchaToken } = req.body;
    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required.' });
    }
    const cleanedPhone = phone.replace(/\D/g, '');
    if (cleanedPhone.length < 10) {
      return res.status(400).json({ error: 'Please enter a valid 10-digit Indian phone number.' });
    }

    // Google reCAPTCHA Verification
    const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;
    if (recaptchaSecret) {
      if (!recaptchaToken) {
        return res.status(400).json({ error: 'reCAPTCHA verification is required.' });
      }
      try {
        const verifyUrl = 'https://www.google.com/recaptcha/api/siteverify';
        const verifyRes = await fetch(verifyUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            secret: recaptchaSecret,
            response: recaptchaToken
          }).toString()
        });
        const verifyData: any = await verifyRes.json();
        if (!verifyData.success) {
          console.error('[reCAPTCHA Verification Failed]', verifyData);
          return res.status(400).json({ error: 'reCAPTCHA verification failed. Please try again.' });
        }
        console.log('[reCAPTCHA Verification Succeeded]');
      } catch (recaptchaErr: any) {
        console.error('[reCAPTCHA API Error]', recaptchaErr);
        return res.status(500).json({ error: 'Failed to verify reCAPTCHA. Please try again later.' });
      }
    } else {
      console.log('[reCAPTCHA] Skipping server-side verification because RECAPTCHA_SECRET_KEY is not configured in environment.');
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

    const vonageKey = process.env.VONAGE_API_KEY;
    const vonageSecret = process.env.VONAGE_API_SECRET;
    const vonageBrand = process.env.VONAGE_BRAND_NAME || 'MaudahaMart';

    const msg91Key = process.env.MSG91_AUTH_KEY;
    const msg91Template = process.env.MSG91_TEMPLATE_ID;

    const plivoId = process.env.PLIVO_AUTH_ID;
    const plivoToken = process.env.PLIVO_AUTH_TOKEN;
    const plivoSrc = process.env.PLIVO_SOURCE_NUMBER;

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
    } else if (vonageKey && vonageSecret) {
      try {
        const formattedTo = cleanedPhone.startsWith('+') ? cleanedPhone.replace('+', '') : `91${cleanedPhone}`;
        console.log(`[SMS Gateway] Triggering Vonage (Nexmo) API to send SMS to ${formattedTo}...`);
        
        const vonageRes = await fetch('https://rest.nexmo.com/sms/json', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            api_key: vonageKey,
            api_secret: vonageSecret,
            from: vonageBrand,
            to: formattedTo,
            text: `Your Maudaha Mart verification OTP is ${generatedOtp}. Valid for 5 mins.`
          })
        });

        const data: any = await vonageRes.json();
        if (vonageRes.ok && data.messages && data.messages[0] && data.messages[0].status === '0') {
          gatewayUsed = 'Vonage Gateway';
          realSmsStatus = `Successfully sent! MsgId: ${data.messages[0]['message-id']}`;
          console.log(`[Vonage Gateway] OTP successfully sent to ${formattedTo}.`);
        } else {
          console.error('[Vonage SMS Error]', data);
          const errorMsg = data.messages && data.messages[0] ? data.messages[0]['error-text'] : 'Unknown Vonage error';
          realSmsStatus = `Failed: ${errorMsg}`;
        }
      } catch (smsErr: any) {
        console.error('[Vonage SMS Integration Error]', smsErr);
        realSmsStatus = `Vonage network/integration error: ${smsErr.message || smsErr}`;
      }
    } else if (msg91Key && msg91Template) {
      try {
        const formattedTo = cleanedPhone.startsWith('+') ? cleanedPhone.replace('+', '') : `91${cleanedPhone}`;
        console.log(`[SMS Gateway] Triggering MSG91 API to send OTP to ${formattedTo}...`);
        
        const msg91Url = `https://control.msg91.com/api/v5/otp?template_id=${msg91Template}&mobile=${formattedTo}&authkey=${msg91Key}&otp=${generatedOtp}`;
        const msg91Res = await fetch(msg91Url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        const data: any = await msg91Res.json();
        if (msg91Res.ok && data.type === 'success') {
          gatewayUsed = 'MSG91 Gateway';
          realSmsStatus = `Successfully sent!`;
          console.log(`[MSG91 Gateway] OTP successfully sent to ${formattedTo}.`);
        } else {
          console.error('[MSG91 SMS Error]', data);
          realSmsStatus = `Failed: ${data.message || 'Unknown MSG91 error'}`;
        }
      } catch (smsErr: any) {
        console.error('[MSG91 SMS Integration Error]', smsErr);
        realSmsStatus = `MSG91 network/integration error: ${smsErr.message || smsErr}`;
      }
    } else if (plivoId && plivoToken && plivoSrc) {
      try {
        const formattedTo = cleanedPhone.startsWith('+') ? cleanedPhone : `+91${cleanedPhone}`;
        console.log(`[SMS Gateway] Triggering Plivo API to send SMS to ${formattedTo}...`);
        
        const plivoUrl = `https://api.plivo.com/v1/Account/${plivoId}/Message/`;
        const auth = Buffer.from(`${plivoId}:${plivoToken}`).toString('base64');
        const plivoRes = await fetch(plivoUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            src: plivoSrc,
            dst: formattedTo,
            text: `Your Maudaha Mart verification OTP is ${generatedOtp}. Valid for 5 mins.`
          })
        });

        const data: any = await plivoRes.json();
        if (plivoRes.ok && data.message === 'message(s) queued') {
          gatewayUsed = 'Plivo Gateway';
          realSmsStatus = `Successfully queued! UUID: ${data.message_uuid ? data.message_uuid[0] : ''}`;
          console.log(`[Plivo Gateway] OTP successfully sent/queued to ${formattedTo}.`);
        } else {
          console.error('[Plivo SMS Error]', data);
          realSmsStatus = `Failed: ${data.error || 'Unknown Plivo error'}`;
        }
      } catch (smsErr: any) {
        console.error('[Plivo SMS Integration Error]', smsErr);
        realSmsStatus = `Plivo network/integration error: ${smsErr.message || smsErr}`;
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

    // Allow quick 123456 override for demo convenience
    if (otp === '123456') {
      return res.json({ success: true, message: 'OTP verified successfully (Demo Bypass)!' });
    }

    const record = otpStore.get(cleanedPhone);
    if (!record) {
      return res.status(400).json({ error: 'No OTP requested for this phone number. Please click resend/send.' });
    }

    if (Date.now() > record.expires) {
      otpStore.delete(cleanedPhone);
      return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
    }

    if (record.otp !== otp) {
      return res.status(400).json({ error: 'Incorrect verification code. Please try again or use 123456.' });
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
    const { name, phone, email, location, locationHi, role } = req.body;
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
    const { id, storeId, storeName, total, discount, paymentMethod, paymentStatus, deliveryStatus, date, items } = req.body;
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
