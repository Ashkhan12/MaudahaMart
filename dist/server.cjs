var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc2) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc2 = __getOwnPropDesc(from, key)) || desc2.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_dotenv = __toESM(require("dotenv"), 1);
var import_genai = require("@google/genai");

// src/data.ts
var INITIAL_STORES = [];
var INITIAL_PRODUCTS = [];

// server.ts
var import_razorpay = __toESM(require("razorpay"), 1);

// src/lib/firebase-admin.ts
var import_app = require("firebase-admin/app");
var import_auth = require("firebase-admin/auth");

// firebase-applet-config.json
var firebase_applet_config_default = {
  projectId: "maudahamartfirebase",
  appId: "1:1043763135109:web:6a9790f54f04f7db1cdfec",
  apiKey: "AIzaSyAo0OBoIBeYNw_jykeu3ERQwcofCVyMDaQ",
  authDomain: "maudahamartfirebase.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-maudahamart-55495b6b-a809-417b-b1ae-8472e7d6c620",
  storageBucket: "maudahamartfirebase.firebasestorage.app",
  messagingSenderId: "1043763135109",
  measurementId: ""
};

// src/lib/firebase-admin.ts
if (!(0, import_app.getApps)().length) {
  (0, import_app.initializeApp)({
    projectId: firebase_applet_config_default.projectId
  });
}
var adminAuth = (0, import_auth.getAuth)();

// src/middleware/auth.ts
var requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: Missing token" });
  }
  const token = authHeader.split("Bearer ")[1];
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error("Error verifying Firebase ID token:", error);
    return res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
};

// src/db/index.ts
var import_node_postgres = require("drizzle-orm/node-postgres");
var import_pg = __toESM(require("pg"), 1);

// src/db/schema.ts
var schema_exports = {};
__export(schema_exports, {
  orders: () => orders,
  supportTickets: () => supportTickets,
  users: () => users
});
var import_pg_core = require("drizzle-orm/pg-core");
var users = (0, import_pg_core.pgTable)("users", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  uid: (0, import_pg_core.text)("uid").notNull().unique(),
  // Firebase Auth UID
  name: (0, import_pg_core.text)("name").notNull(),
  phone: (0, import_pg_core.text)("phone"),
  email: (0, import_pg_core.text)("email"),
  location: (0, import_pg_core.text)("location"),
  locationHi: (0, import_pg_core.text)("location_hi"),
  role: (0, import_pg_core.text)("role").default("customer").notNull(),
  serviceAreaId: (0, import_pg_core.text)("service_area_id"),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow()
});
var orders = (0, import_pg_core.pgTable)("orders", {
  id: (0, import_pg_core.text)("id").primaryKey(),
  userId: (0, import_pg_core.text)("user_id").references(() => users.uid),
  storeId: (0, import_pg_core.text)("store_id").notNull(),
  storeName: (0, import_pg_core.text)("store_name").notNull(),
  total: (0, import_pg_core.integer)("total").notNull(),
  discount: (0, import_pg_core.integer)("discount").default(0).notNull(),
  paymentMethod: (0, import_pg_core.text)("payment_method").notNull(),
  paymentStatus: (0, import_pg_core.text)("payment_status").default("pending").notNull(),
  deliveryStatus: (0, import_pg_core.text)("delivery_status").default("pending").notNull(),
  date: (0, import_pg_core.text)("date").notNull(),
  items: (0, import_pg_core.jsonb)("items").notNull(),
  // JSON list of ordered items
  serviceAreaId: (0, import_pg_core.text)("service_area_id"),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow()
});
var supportTickets = (0, import_pg_core.pgTable)("support_tickets", {
  id: (0, import_pg_core.text)("id").primaryKey(),
  userId: (0, import_pg_core.text)("user_id").references(() => users.uid),
  subject: (0, import_pg_core.text)("subject").notNull(),
  category: (0, import_pg_core.text)("category").notNull(),
  status: (0, import_pg_core.text)("status").default("open").notNull(),
  messages: (0, import_pg_core.jsonb)("messages").notNull(),
  // JSON list of support messages
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow()
});

// src/db/index.ts
var { Pool } = import_pg.default;
var createPool = () => {
  return new Pool({
    host: process.env.SQL_HOST,
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    database: process.env.SQL_DB_NAME,
    connectionTimeoutMillis: 15e3
  });
};
var pool = createPool();
pool.on("error", (err) => {
  console.error("Unexpected error on idle SQL pool client:", err);
});
var db = (0, import_node_postgres.drizzle)(pool, { schema: schema_exports });

// src/db/queries.ts
var import_drizzle_orm = require("drizzle-orm");
async function upsertUser(data) {
  try {
    const result = await db.insert(users).values({
      uid: data.uid,
      name: data.name,
      email: data.email || null,
      phone: data.phone || null,
      location: data.location || null,
      locationHi: data.locationHi || null,
      role: data.role || "customer",
      serviceAreaId: data.serviceAreaId || null
    }).onConflictDoUpdate({
      target: users.uid,
      set: {
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
        location: data.location || null,
        locationHi: data.locationHi || null,
        role: data.role || "customer",
        serviceAreaId: data.serviceAreaId || null
      }
    }).returning();
    return result[0];
  } catch (error) {
    console.error("Database user upsert failed:", error);
    throw new Error("Database user upsert failed. Please try again later.", { cause: error });
  }
}
async function getUser(uid) {
  try {
    const result = await db.select().from(users).where((0, import_drizzle_orm.eq)(users.uid, uid)).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("Database getUser failed:", error);
    throw new Error("Database query failed. Please try again later.", { cause: error });
  }
}
async function saveOrder(data) {
  try {
    const result = await db.insert(orders).values({
      id: data.id,
      userId: data.userId,
      storeId: data.storeId,
      storeName: data.storeName,
      total: data.total,
      discount: data.discount,
      paymentMethod: data.paymentMethod,
      paymentStatus: data.paymentStatus,
      deliveryStatus: data.deliveryStatus,
      date: data.date,
      items: data.items,
      serviceAreaId: data.serviceAreaId || null
    }).onConflictDoUpdate({
      target: orders.id,
      set: {
        paymentStatus: data.paymentStatus,
        deliveryStatus: data.deliveryStatus,
        serviceAreaId: data.serviceAreaId || null
      }
    }).returning();
    return result[0];
  } catch (error) {
    console.error("Database saveOrder failed:", error);
    throw new Error("Database saveOrder failed. Please try again later.", { cause: error });
  }
}
async function getUserOrders(userId) {
  try {
    return await db.select().from(orders).where((0, import_drizzle_orm.eq)(orders.userId, userId)).orderBy((0, import_drizzle_orm.desc)(orders.createdAt));
  } catch (error) {
    console.error("Database getUserOrders failed:", error);
    throw new Error("Database query failed. Please try again later.", { cause: error });
  }
}
async function getAllOrders() {
  try {
    return await db.select().from(orders).orderBy((0, import_drizzle_orm.desc)(orders.createdAt));
  } catch (error) {
    console.error("Database getAllOrders failed:", error);
    throw new Error("Database query failed. Please try again later.", { cause: error });
  }
}
async function getOrderById(id) {
  try {
    const result = await db.select().from(orders).where((0, import_drizzle_orm.eq)(orders.id, id)).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("Database getOrderById failed:", error);
    throw new Error("Database query failed. Please try again later.", { cause: error });
  }
}
async function saveSupportTicket(data) {
  try {
    const result = await db.insert(supportTickets).values({
      id: data.id,
      userId: data.userId,
      subject: data.subject,
      category: data.category,
      status: data.status,
      messages: data.messages
    }).onConflictDoUpdate({
      target: supportTickets.id,
      set: {
        status: data.status,
        messages: data.messages
      }
    }).returning();
    return result[0];
  } catch (error) {
    console.error("Database saveSupportTicket failed:", error);
    throw new Error("Database saveSupportTicket failed. Please try again later.", { cause: error });
  }
}
async function getUserSupportTickets(userId) {
  try {
    return await db.select().from(supportTickets).where((0, import_drizzle_orm.eq)(supportTickets.userId, userId)).orderBy((0, import_drizzle_orm.desc)(supportTickets.createdAt));
  } catch (error) {
    console.error("Database getUserSupportTickets failed:", error);
    throw new Error("Database query failed. Please try again later.", { cause: error });
  }
}
async function getAllSupportTickets() {
  try {
    return await db.select().from(supportTickets).orderBy((0, import_drizzle_orm.desc)(supportTickets.createdAt));
  } catch (error) {
    console.error("Database getAllSupportTickets failed:", error);
    throw new Error("Database query failed. Please try again later.", { cause: error });
  }
}

// src/middleware/regionSegregation.ts
var regionSegregationMiddleware = async (req, res, next) => {
  let uid = req.user?.uid;
  if (!uid) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split("Bearer ")[1];
      try {
        const decodedToken = await adminAuth.verifyIdToken(token);
        req.user = decodedToken;
        uid = decodedToken.uid;
      } catch (error) {
        console.warn("Optional auth token verification failed in regionSegregation:", error);
      }
    }
  }
  let userAreaId = "area-maudaha";
  if (uid) {
    try {
      const dbUser = await getUser(uid);
      if (dbUser && dbUser.serviceAreaId) {
        userAreaId = dbUser.serviceAreaId;
      }
    } catch (dbErr) {
      console.error("Error fetching user serviceAreaId in middleware:", dbErr);
    }
  }
  req.serviceAreaId = userAreaId;
  const originalJson = res.json;
  res.json = function(body) {
    if (!body) {
      return originalJson.call(this, body);
    }
    const filterItem = (item) => {
      if (!item || typeof item !== "object") return true;
      const itemAreaId = item.serviceAreaId;
      if (itemAreaId !== void 0 && itemAreaId !== null) {
        return itemAreaId === userAreaId;
      }
      if (item.product && item.product.serviceAreaId) {
        return item.product.serviceAreaId === userAreaId;
      }
      return true;
    };
    if (Array.isArray(body)) {
      const filteredArray = body.filter(filterItem);
      return originalJson.call(this, filteredArray);
    }
    if (typeof body === "object") {
      const isUserProfileRequest = body.uid === uid || body.userId && body.userId === uid && !body.storeId;
      if (!isUserProfileRequest && body.serviceAreaId !== void 0 && body.serviceAreaId !== null) {
        if (body.serviceAreaId !== userAreaId) {
          return res.status(403).json({ error: "Access forbidden: region data segregation" });
        }
      }
    }
    return originalJson.call(this, body);
  };
  next();
};

// server.ts
import_dotenv.default.config();
var app = (0, import_express.default)();
var PORT = 3e3;
app.use(import_express.default.json());
app.use("/api", regionSegregationMiddleware);
var apiKey = process.env.GEMINI_API_KEY;
var ai = new import_genai.GoogleGenAI({
  apiKey: apiKey || "",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build"
    }
  }
});
var otpStore = /* @__PURE__ */ new Map();
app.post("/api/auth/send-otp", async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ error: "Phone number is required." });
    }
    const cleanedPhone = phone.replace(/\D/g, "");
    if (cleanedPhone.length < 10) {
      return res.status(400).json({ error: "Please enter a valid 10-digit Indian phone number." });
    }
    const generatedOtp = Math.floor(1e5 + Math.random() * 9e5).toString();
    const expires = Date.now() + 5 * 60 * 1e3;
    otpStore.set(cleanedPhone, { otp: generatedOtp, expires });
    let gatewayUsed = "Console Simulator (Local Testing)";
    let realSmsStatus = "Not Sent (Configure TWILIO_ACCOUNT_SID or FAST2SMS_API_KEY in Secrets to send real SMS)";
    const twilioSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioFrom = process.env.TWILIO_PHONE_NUMBER;
    const fast2smsKey = process.env.FAST2SMS_API_KEY;
    if (twilioSid && twilioToken && twilioFrom) {
      try {
        const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`;
        const auth = Buffer.from(`${twilioSid}:${twilioToken}`).toString("base64");
        const formattedTo = cleanedPhone.startsWith("+") ? cleanedPhone : `+91${cleanedPhone}`;
        const rawFrom = twilioFrom.trim();
        const formattedFrom = rawFrom.startsWith("+") ? rawFrom : rawFrom.length === 10 ? `+91${rawFrom}` : `+${rawFrom}`;
        const params = new URLSearchParams();
        params.append("To", formattedTo);
        params.append("From", formattedFrom);
        params.append("Body", `Your Maudaha Mart verification OTP is ${generatedOtp}. Valid for 5 mins.`);
        if (formattedTo === formattedFrom) {
          gatewayUsed = "Twilio Gateway (Self-Send Bypass)";
          realSmsStatus = `Successfully sent! (Bypassed: Sent to Twilio sender phone number. OTP code: ${generatedOtp})`;
          console.log(`[Maudaha Mart SMS Gateway] Target number matches Twilio sender number. Bypassed Twilio request to prevent self-sending limitation. SMS simulated successfully.`);
        } else {
          console.log(`[SMS Gateway] Triggering Twilio API to send SMS from ${formattedFrom} to ${formattedTo}...`);
          const twilioRes = await fetch(twilioUrl, {
            method: "POST",
            headers: {
              "Authorization": `Basic ${auth}`,
              "Content-Type": "application/x-www-form-urlencoded"
            },
            body: params.toString()
          });
          const data = await twilioRes.json();
          if (twilioRes.ok) {
            gatewayUsed = "Twilio Gateway";
            realSmsStatus = `Successfully sent! SID: ${data.sid}`;
            console.log(`[Twilio SMS Gateway] OTP successfully sent to ${formattedTo}.`);
          } else {
            console.error("[Twilio SMS Error]", data);
            realSmsStatus = `Failed: ${data.message || "Unknown Twilio error"}`;
          }
        }
      } catch (smsErr) {
        console.error("[Twilio SMS Integration Error]", smsErr);
        realSmsStatus = `Twilio network/integration error: ${smsErr.message || smsErr}`;
      }
    } else if (fast2smsKey) {
      try {
        const formattedTo = cleanedPhone.length === 10 ? cleanedPhone : cleanedPhone.slice(-10);
        console.log(`[SMS Gateway] Triggering Fast2SMS API to send SMS to ${formattedTo}...`);
        const fast2smsRes = await fetch("https://www.fast2sms.com/dev/bulkV2", {
          method: "POST",
          headers: {
            "authorization": fast2smsKey,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            variables_values: generatedOtp,
            route: "otp",
            numbers: formattedTo
          })
        });
        const data = await fast2smsRes.json();
        if (fast2smsRes.ok && data.return === true) {
          gatewayUsed = "Fast2SMS Gateway";
          realSmsStatus = `Successfully sent! Message: ${data.message || "OTP Sent"}`;
          console.log(`[Fast2SMS Gateway] OTP successfully sent to ${formattedTo}.`);
        } else {
          console.error("[Fast2SMS SMS Error]", data);
          realSmsStatus = `Failed: ${data.message || "Unknown Fast2SMS error"}`;
        }
      } catch (smsErr) {
        console.error("[Fast2SMS SMS Integration Error]", smsErr);
        realSmsStatus = `Fast2SMS network/integration error: ${smsErr.message || smsErr}`;
      }
    }
    console.log(`
======================================================
[Maudaha Mart SMS Gateway] OTP sent to +91 ${cleanedPhone}
Message: "Your Maudaha Mart verification OTP is ${generatedOtp}. Valid for 5 mins."
Gateway Used: ${gatewayUsed}
Status: ${realSmsStatus}
======================================================
`);
    res.json({
      success: true,
      message: `OTP sent successfully via ${gatewayUsed}!`,
      otp: generatedOtp,
      phone: cleanedPhone,
      smsStatus: realSmsStatus
    });
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to send OTP." });
  }
});
app.post("/api/auth/verify-otp", (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ error: "Phone number and OTP code are required." });
    }
    const cleanedPhone = phone.replace(/\D/g, "");
    const record = otpStore.get(cleanedPhone);
    if (!record) {
      return res.status(400).json({ error: "No OTP requested for this phone number. Please click resend/send." });
    }
    if (Date.now() > record.expires) {
      otpStore.delete(cleanedPhone);
      return res.status(400).json({ error: "OTP has expired. Please request a new one." });
    }
    if (record.otp !== otp) {
      return res.status(400).json({ error: "Incorrect verification code. Please try again." });
    }
    otpStore.delete(cleanedPhone);
    res.json({ success: true, message: "OTP verified successfully!" });
  } catch (error) {
    res.status(500).json({ error: error.message || "Verification failed." });
  }
});
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    api_key_configured: !!apiKey,
    environment: process.env.NODE_ENV || "development"
  });
});
app.post("/api/translate", async (req, res) => {
  try {
    const { text: text2 } = req.body;
    if (!text2) {
      return res.status(400).json({ error: "Text to translate is required." });
    }
    if (!apiKey) {
      return res.json({ translatedText: text2 });
    }
    const systemInstruction = `You are a high-fidelity translator for Maudaha Mart, an e-commerce platform in India. 
Translate the provided English text into clean, colloquial Hindi (Devanagari script). 
If it is a product name, keep it natural (e.g., "Mustard Oil" -> "\u0938\u0930\u0938\u094B\u0902 \u0915\u093E \u0924\u0947\u0932", "Desi Ghee" -> "\u0926\u0947\u0938\u0940 \u0918\u0940", "Potato" -> "\u0906\u0932\u0942"). 
Output ONLY the translated text. Do not write any explanation, intro, or extra characters.`;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: text2,
      config: {
        systemInstruction,
        temperature: 0.3
      }
    });
    const translatedText = response.text ? response.text.trim() : text2;
    res.json({ translatedText });
  } catch (error) {
    console.error("Error in /api/translate:", error);
    res.status(500).json({ error: error.message || "An error occurred during translation." });
  }
});
app.post("/api/voice-search", async (req, res) => {
  try {
    const { prompt, language, products } = req.body;
    if (!apiKey) {
      return res.json({
        reply: language === "hi" ? "\u092E\u093E\u092B\u093C \u0915\u0930\u0947\u0902, \u0905\u092D\u0940 \u092E\u0947\u0930\u093E AI \u0905\u0938\u093F\u0938\u094D\u091F\u0947\u0902\u091F \u0915\u093E\u092E \u0928\u0939\u0940\u0902 \u0915\u0930 \u0930\u0939\u093E \u0939\u0948\u0964 \u0915\u0943\u092A\u092F\u093E GEMINI_API_KEY \u0938\u0947\u091F \u0915\u0930\u0947\u0902\u0964" : "Sorry, my AI assistant is currently unavailable. Please set the GEMINI_API_KEY."
      });
    }
    const productContext = products.map((p) => `- ${p.name} (${p.category}): \u20B9${p.price} | ${p.description}`).join("\n");
    const systemInstruction = `You are a smart, friendly shopping assistant for Maudaha Mart. 
The user is speaking to you via voice search. Keep your answer brief, conversational, and helpful (1-3 sentences maximum).
If the user asks for health-related products (e.g. healthy, health, immunity, organic, vitamins, medicine), aggressively suggest relevant items from the store's inventory.
Store Inventory:
${productContext}

Language requested: ${language === "hi" ? "Hindi" : "English"}`;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7
      }
    });
    res.json({ reply: response.text });
  } catch (error) {
    console.error("Error in /api/voice-search:", error);
    res.json({
      reply: req.body?.language === "hi" ? `"${req.body?.prompt || ""}" \u0915\u0947 \u0932\u093F\u090F \u0909\u0924\u094D\u092A\u093E\u0926 \u0938\u0930\u094D\u091A \u0915\u093F\u090F \u091C\u093E \u0930\u0939\u0947 \u0939\u0948\u0902\u0964` : `Searching catalog products for "${req.body?.prompt || ""}".`
    });
  }
});
app.post("/api/db/users", requireAuth, async (req, res) => {
  try {
    const { name, phone, email, location, locationHi, role, serviceAreaId } = req.body;
    const uid = req.user?.uid;
    if (!uid) {
      return res.status(400).json({ error: "UID is required." });
    }
    const user = await upsertUser({
      uid,
      name: name || "User",
      phone,
      email: email || req.user?.email || void 0,
      location,
      locationHi,
      role,
      serviceAreaId: serviceAreaId || req.serviceAreaId
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/db/users/me", requireAuth, async (req, res) => {
  try {
    const uid = req.user?.uid;
    if (!uid) {
      return res.status(400).json({ error: "UID is required." });
    }
    const user = await getUser(uid);
    res.json(user || { error: "User not found." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/db/orders", requireAuth, async (req, res) => {
  try {
    const { id, storeId, storeName, total, discount, paymentMethod, paymentStatus, deliveryStatus, date, items, serviceAreaId } = req.body;
    const uid = req.user?.uid;
    if (!uid) {
      return res.status(400).json({ error: "UID is required." });
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
      serviceAreaId: serviceAreaId || req.serviceAreaId
    });
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/db/orders/me", requireAuth, async (req, res) => {
  try {
    const uid = req.user?.uid;
    if (!uid) {
      return res.status(400).json({ error: "UID is required." });
    }
    const orders2 = await getUserOrders(uid);
    res.json(orders2);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/db/orders/all", requireAuth, async (req, res) => {
  try {
    const orders2 = await getAllOrders();
    res.json(orders2);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/orders/track/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "Order ID is required." });
    }
    const order = await getOrderById(id);
    if (!order) {
      return res.status(404).json({ error: "Order not found." });
    }
    const statusTimeline = [
      { status: "pending", label: "Order Placed", labelHi: "\u0911\u0930\u094D\u0921\u0930 \u0926\u093F\u092F\u093E \u0917\u092F\u093E", time: order.date, completed: true },
      { status: "accepted", label: "Accepted by Merchant", labelHi: "\u0935\u093F\u0915\u094D\u0930\u0947\u0924\u093E \u0926\u094D\u0935\u093E\u0930\u093E \u0938\u094D\u0935\u0940\u0915\u0943\u0924", time: order.date, completed: ["accepted", "preparing", "dispatched", "arrived"].includes(order.deliveryStatus) },
      { status: "preparing", label: "Preparing Items", labelHi: "\u0938\u093E\u092E\u0917\u094D\u0930\u0940 \u0924\u0948\u092F\u093E\u0930 \u0915\u0940 \u091C\u093E \u0930\u0939\u0940 \u0939\u0948", time: order.date, completed: ["preparing", "dispatched", "arrived"].includes(order.deliveryStatus) },
      { status: "dispatched", label: "Out for Delivery", labelHi: "\u0935\u093F\u0924\u0930\u0923 \u0915\u0947 \u0932\u093F\u090F \u0928\u093F\u0915\u0932\u093E", time: order.date, completed: ["dispatched", "arrived"].includes(order.deliveryStatus) },
      { status: "arrived", label: "Delivered", labelHi: "\u092A\u0939\u0941\u0902\u091A\u093E \u0926\u093F\u092F\u093E \u0917\u092F\u093E", time: order.date, completed: order.deliveryStatus === "arrived" }
    ];
    let etaMinutes = 30;
    if (order.deliveryStatus === "pending") etaMinutes = 45;
    else if (order.deliveryStatus === "accepted") etaMinutes = 35;
    else if (order.deliveryStatus === "preparing") etaMinutes = 25;
    else if (order.deliveryStatus === "dispatched") etaMinutes = 10;
    else if (order.deliveryStatus === "arrived") etaMinutes = 0;
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
        latitude: 25.6844,
        // Maudaha default coords approximately
        longitude: 80.1167
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/db/tickets", requireAuth, async (req, res) => {
  try {
    const { id, subject, category, status, messages } = req.body;
    const uid = req.user?.uid;
    if (!uid) {
      return res.status(400).json({ error: "UID is required." });
    }
    const ticket = await saveSupportTicket({
      id,
      userId: uid,
      subject,
      category,
      status,
      messages
    });
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/db/tickets/me", requireAuth, async (req, res) => {
  try {
    const uid = req.user?.uid;
    if (!uid) {
      return res.status(400).json({ error: "UID is required." });
    }
    const tickets = await getUserSupportTickets(uid);
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/db/tickets/all", requireAuth, async (req, res) => {
  try {
    const tickets = await getAllSupportTickets();
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/stores", (req, res) => {
  res.json(INITIAL_STORES);
});
app.get("/api/products", (req, res) => {
  res.json(INITIAL_PRODUCTS);
});
app.post("/api/chat", async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message parameter is required." });
    }
    if (!apiKey) {
      return res.status(200).json({
        text: "Maudaha AI Assistant Offline: GEMINI_API_KEY is not configured in Secrets. Please configure it in Settings > Secrets to enable instant replies!",
        offline: true
      });
    }
    const contentsPayload = [];
    if (history && Array.isArray(history)) {
      for (const turn of history) {
        contentsPayload.push({
          role: turn.role === "user" ? "user" : "model",
          parts: [{ text: turn.text }]
        });
      }
    }
    contentsPayload.push({
      role: "user",
      parts: [{ text: message }]
    });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
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
  } catch (error) {
    console.error("Error in /api/chat:", error);
    res.status(500).json({ error: error.message || "An error occurred during generation." });
  }
});
app.post("/api/ai-parse-list", async (req, res) => {
  try {
    const { textList } = req.body;
    if (!textList) {
      return res.status(400).json({ error: "textList parameter is required." });
    }
    if (!apiKey) {
      return res.status(200).json({
        items: [],
        offline: true,
        error: "GEMINI_API_KEY is not configured."
      });
    }
    const simplifiedCatalog = INITIAL_PRODUCTS.map((p) => ({
      id: p.id,
      name: p.name,
      nameHi: p.nameHi,
      price: p.price,
      unit: p.unit,
      storeId: p.storeId
    }));
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `You are a shopping list parsing engine for Maudaha Mart.
The user wrote/pasted this raw list: "${textList}"
Your job is to parse each item they wanted and find the best match in our catalog of products:
${JSON.stringify(simplifiedCatalog)}

Match smartly, taking into account translations (e.g. "atta" -> Fortune Premium Chakki Atta, "milk" -> Maudaha Dairy Milk, "oil" -> Mustard Oil).
Return a JSON object conforming exactly to the responseSchema.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: import_genai.Type.OBJECT,
          properties: {
            items: {
              type: import_genai.Type.ARRAY,
              items: {
                type: import_genai.Type.OBJECT,
                properties: {
                  itemName: {
                    type: import_genai.Type.STRING,
                    description: "The name of the item from the user's input"
                  },
                  quantity: {
                    type: import_genai.Type.STRING,
                    description: "The quantity requested, or '1' if unspecified"
                  },
                  matchedProductId: {
                    type: import_genai.Type.STRING,
                    description: "The ID of the matched product (e.g. 'g1'), or null if no product in catalog is a close match"
                  },
                  matchedProductName: {
                    type: import_genai.Type.STRING,
                    description: "The name of the matched product, or null"
                  },
                  matchedStoreId: {
                    type: import_genai.Type.STRING,
                    description: "The store ID of the matched product, or null"
                  },
                  price: {
                    type: import_genai.Type.NUMBER,
                    description: "The price of the matched product, or null"
                  }
                },
                required: ["itemName", "quantity"]
              }
            }
          },
          required: ["items"]
        }
      }
    });
    const parsedResponse = JSON.parse(response.text || '{"items":[]}');
    res.json({
      items: parsedResponse.items || [],
      offline: false
    });
  } catch (error) {
    console.error("Error in /api/ai-parse-list:", error);
    res.status(500).json({ error: error.message || "An error occurred during list parsing." });
  }
});
app.post("/api/ai-search", async (req, res) => {
  try {
    const { query, language, allProducts } = req.body;
    if (!query) {
      return res.status(400).json({ error: "Query parameter is required." });
    }
    if (!apiKey) {
      return res.json({
        explanation: "Maudaha AI Search is currently offline. Please configure your GEMINI_API_KEY in Secrets to enable semantic search!",
        explanationHi: "\u092E\u094C\u0926\u0939\u093E \u090F\u0906\u0908 \u0938\u0930\u094D\u091A \u0935\u0930\u094D\u0924\u092E\u093E\u0928 \u092E\u0947\u0902 \u0911\u092B\u0932\u093E\u0907\u0928 \u0939\u0948\u0964 \u0938\u093F\u092E\u0947\u0902\u091F\u093F\u0915 \u0938\u0930\u094D\u091A \u0915\u094B \u0938\u0915\u094D\u0937\u092E \u0915\u0930\u0928\u0947 \u0915\u0947 \u0932\u093F\u090F \u0915\u0943\u092A\u092F\u093E \u0938\u0940\u0915\u094D\u0930\u0947\u091F\u094D\u0938 \u092E\u0947\u0902 \u0905\u092A\u0928\u093E GEMINI_API_KEY \u0915\u0949\u0928\u094D\u092B\u093C\u093F\u0917\u0930 \u0915\u0930\u0947\u0902!",
        recommendedProductIds: [],
        offline: true
      });
    }
    const catalogToUse = allProducts || INITIAL_PRODUCTS;
    const simplifiedCatalog = catalogToUse.map((p) => ({
      id: p.id,
      name: p.name,
      nameHi: p.nameHi,
      category: p.category,
      categoryHi: p.categoryHi || "",
      price: p.price,
      description: p.description || "",
      descriptionHi: p.descriptionHi || ""
    }));
    const systemInstruction = `You are the Maudaha Mart semantic product search engine.
Analyze the user's natural language shopping query and select the most relevant products from our catalog.
Explain your choices briefly in a warm, helpful, hyper-local tone, using Hinglish (mix of Hindi and English) or English depending on the language preference.
Return a JSON object with:
1. explanation: Your explanation of the search results in English.
2. explanationHi: Your explanation of the search results in Hindi.
3. recommendedProductIds: Array of product ID strings that match the query (e.g. ["g1", "g2"]). Limit to 6 product IDs.`;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `User Query: "${query}"
Selected Language: "${language || "en"}"
Product Catalog:
${JSON.stringify(simplifiedCatalog)}

Provide your smart recommendations according to the response schema.`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: import_genai.Type.OBJECT,
          properties: {
            explanation: { type: import_genai.Type.STRING },
            explanationHi: { type: import_genai.Type.STRING },
            recommendedProductIds: {
              type: import_genai.Type.ARRAY,
              items: { type: import_genai.Type.STRING }
            }
          },
          required: ["explanation", "explanationHi", "recommendedProductIds"]
        }
      }
    });
    const result = JSON.parse(response.text || '{"explanation":"","explanationHi":"","recommendedProductIds":[]}');
    res.json({
      ...result,
      offline: false
    });
  } catch (error) {
    console.error("Error in /api/ai-search:", error);
    const catalogToUse = req.body?.allProducts || INITIAL_PRODUCTS;
    const queryLower = (req.body?.query || "").toLowerCase().trim();
    const fallbackIds = catalogToUse.filter(
      (p) => p.name && p.name.toLowerCase().includes(queryLower) || p.nameHi && p.nameHi.includes(queryLower) || p.category && p.category.toLowerCase().includes(queryLower)
    ).slice(0, 6).map((p) => p.id);
    res.json({
      explanation: `Found items matching "${req.body?.query || ""}" in local catalog.`,
      explanationHi: `\u0938\u094D\u0925\u093E\u0928\u0940\u092F \u0915\u0948\u091F\u0932\u0949\u0917 \u092E\u0947\u0902 "${req.body?.query || ""}" \u0938\u0947 \u092E\u0947\u0932 \u0916\u093E\u0924\u0947 \u0909\u0924\u094D\u092A\u093E\u0926 \u092E\u093F\u0932\u0947\u0964`,
      recommendedProductIds: fallbackIds,
      offline: true
    });
  }
});
app.post("/api/ai-recommendations", async (req, res) => {
  try {
    const { searchHistory, watchlist, recentCategories, trendingProducts, recommendedProducts, language } = req.body;
    if (!apiKey) {
      return res.json({
        explanation: "Based on your active interests in Maudaha Mart, we picked some fresh & trending items from local shops! (Connect GEMINI_API_KEY for personalized explanations)",
        explanationHi: "\u092E\u094C\u0926\u0939\u093E \u092E\u093E\u0930\u094D\u091F \u092E\u0947\u0902 \u0906\u092A\u0915\u0940 \u0938\u0915\u094D\u0930\u093F\u092F \u0930\u0941\u091A\u093F\u092F\u094B\u0902 \u0915\u0947 \u0906\u0927\u093E\u0930 \u092A\u0930, \u0939\u092E\u0928\u0947 \u0938\u094D\u0925\u093E\u0928\u0940\u092F \u0926\u0941\u0915\u093E\u0928\u094B\u0902 \u0938\u0947 \u0915\u0941\u091B \u0924\u093E\u091C\u093C\u093E \u0914\u0930 \u091F\u094D\u0930\u0947\u0902\u0921\u093F\u0902\u0917 \u0909\u0924\u094D\u092A\u093E\u0926 \u091A\u0941\u0928\u0947 \u0939\u0948\u0902! (\u0935\u094D\u092F\u0915\u094D\u0924\u093F\u0917\u0924 \u0938\u094D\u092A\u0937\u094D\u091F\u0940\u0915\u0930\u0923 \u0915\u0947 \u0932\u093F\u090F GEMINI_API_KEY \u0915\u0928\u0947\u0915\u094D\u091F \u0915\u0930\u0947\u0902)",
        marketTrendAlert: "Siddiqui Fresh Fruits and Maudaha Dairy are currently seeing peak weekend demand from Bhatipura and Rahmaniya Ward.",
        marketTrendAlertHi: "\u0938\u093F\u0926\u094D\u0926\u0940\u0915\u0940 \u092B\u094D\u0930\u0947\u0936 \u092B\u094D\u0930\u0942\u091F\u094D\u0938 \u0914\u0930 \u092E\u094C\u0926\u0939\u093E \u0921\u0947\u092F\u0930\u0940 \u092E\u0947\u0902 \u0935\u0930\u094D\u0924\u092E\u093E\u0928 \u092E\u0947\u0902 \u092D\u091F\u0940\u092A\u0941\u0930\u093E \u0914\u0930 \u0930\u0939\u092E\u093E\u0928\u093F\u092F\u093E \u0935\u093E\u0930\u094D\u0921 \u0938\u0947 \u0938\u092A\u094D\u0924\u093E\u0939\u093E\u0902\u0924 \u0915\u0940 \u091A\u0930\u092E \u092E\u093E\u0902\u0917 \u0926\u0947\u0916\u0940 \u091C\u093E \u0930\u0939\u0940 \u0939\u0948\u0964",
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

Selected Language: "${language || "en"}"

Return a friendly explanation of why these match their needs, and provide a general market trend alert for Maudaha.`;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: import_genai.Type.OBJECT,
          properties: {
            explanation: { type: import_genai.Type.STRING },
            explanationHi: { type: import_genai.Type.STRING },
            marketTrendAlert: { type: import_genai.Type.STRING },
            marketTrendAlertHi: { type: import_genai.Type.STRING }
          },
          required: ["explanation", "explanationHi", "marketTrendAlert", "marketTrendAlertHi"]
        }
      }
    });
    const result = JSON.parse(response.text || "{}");
    res.json({
      ...result,
      offline: false
    });
  } catch (error) {
    console.error("Error in /api/ai-recommendations:", error);
    res.json({
      explanation: "Based on your active interests in Maudaha Mart, we picked some fresh & trending items from local shops!",
      explanationHi: "\u092E\u094C\u0926\u0939\u093E \u092E\u093E\u0930\u094D\u091F \u092E\u0947\u0902 \u0906\u092A\u0915\u0940 \u0938\u0915\u094D\u0930\u093F\u092F \u0930\u0941\u091A\u093F\u092F\u094B\u0902 \u0915\u0947 \u0906\u0927\u093E\u0930 \u092A\u0930, \u0939\u092E\u0928\u0947 \u0938\u094D\u0925\u093E\u0928\u0940\u092F \u0926\u0941\u0915\u093E\u0928\u094B\u0902 \u0938\u0947 \u0915\u0941\u091B \u0924\u093E\u091C\u093C\u093E \u0914\u0930 \u091F\u094D\u0930\u0947\u0902\u0921\u093F\u0902\u0917 \u0909\u0924\u094D\u092A\u093E\u0926 \u091A\u0941\u0928\u0947 \u0939\u0948\u0902!",
      marketTrendAlert: "Siddiqui Fresh Fruits and Maudaha Dairy are currently seeing peak demand.",
      marketTrendAlertHi: "\u0938\u093F\u0926\u094D\u0926\u0940\u0915\u0940 \u092B\u094D\u0930\u0947\u0936 \u092B\u094D\u0930\u0942\u091F\u094D\u0938 \u0914\u0930 \u092E\u094C\u0926\u0939\u093E \u0921\u0947\u092F\u0930\u0940 \u092E\u0947\u0902 \u0935\u0930\u094D\u0924\u092E\u093E\u0928 \u092E\u0947\u0902 \u0909\u091A\u094D\u091A \u092E\u093E\u0902\u0917 \u0926\u0947\u0916\u0940 \u091C\u093E \u0930\u0939\u0940 \u0939\u0948\u0964",
      offline: true
    });
  }
});
var mockAreas = [
  { id: "1", name: "Noida Sector 62", status: "Active", radius: "5km", polygon_coordinates: [] },
  { id: "2", name: "South Delhi", status: "Closed", radius: "8km", polygon_coordinates: [] },
  { id: "3", name: "Indirapuram", status: "Active", radius: "4km", polygon_coordinates: [] }
];
app.get("/api/admin/service-areas", (req, res) => {
  res.json(mockAreas);
});
app.post("/api/admin/service-areas", (req, res) => {
  const { name, status, radius } = req.body;
  const newArea = {
    id: String(mockAreas.length + 1),
    name: name || "New Area",
    status: status || "Active",
    radius: radius || "5km",
    polygon_coordinates: []
  };
  mockAreas.push(newArea);
  res.status(201).json(newArea);
});
app.patch("/api/admin/service-areas/:id/status", (req, res) => {
  const area = mockAreas.find((a) => a.id === req.params.id);
  if (area) {
    area.status = area.status === "Active" ? "Closed" : "Active";
    res.json(area);
  } else {
    res.status(404).json({ error: "Not found" });
  }
});
app.put("/api/admin/service-areas/:id", (req, res) => {
  const area = mockAreas.find((a) => a.id === req.params.id);
  if (area) {
    Object.assign(area, req.body);
    res.json(area);
  } else {
    res.status(404).json({ error: "Not found" });
  }
});
app.delete("/api/admin/service-areas/:id", (req, res) => {
  const initialLength = mockAreas.length;
  mockAreas = mockAreas.filter((a) => a.id !== req.params.id);
  if (mockAreas.length < initialLength) {
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "Not found" });
  }
});
app.get("/api/admin/service-areas/:id/users", (req, res) => {
  res.json([
    { id: "u1", name: "Amit Kumar", location: "Noida" },
    { id: "u2", name: "Rahul Sharma", location: "Noida" }
  ]);
});
app.get("/api/admin/service-areas/:id/vendors", (req, res) => {
  res.json([
    { id: "v1", name: "Sharma Sweets", type: "Restaurant" },
    { id: "v2", name: "Grocers Hub", type: "Shop" }
  ]);
});
app.get("/api/admin/service-areas/:id/products", (req, res) => {
  res.json({ total: 1240, message: "Items Available" });
});
app.get("/api/admin/service-areas/:id/orders", (req, res) => {
  res.json({ totalActive: 48, message: "Active Orders Right Now" });
});
app.put("/api/admin/service-areas/:id/delivery-settings", (req, res) => {
  res.json({ success: true, message: "Delivery settings updated" });
});
app.get("/api/admin/service-areas/:id/delivery-partners", (req, res) => {
  res.json({ online: 12, message: "Boys Online" });
});
app.get("/api/admin/service-areas/:id/coupons", (req, res) => {
  res.json([
    { code: "NOIDANEW50" },
    { code: "WELCOME100" }
  ]);
});
app.post("/api/admin/service-areas/:id/coupons", (req, res) => {
  res.status(201).json({ success: true, message: "Coupon created" });
});
app.get("/api/admin/service-areas/:id/support-tickets", (req, res) => {
  res.json([
    { id: "TK-902", subject: "Delivery delay issue", status: "open" }
  ]);
});
app.post("/api/admin/trend-analysis", async (req, res) => {
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
Product Categories: ${JSON.stringify(allProducts?.map((p) => p.category) || [])}

Provide detailed strategic demand insights and merchant advice.`;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: import_genai.Type.OBJECT,
          properties: {
            summary: { type: import_genai.Type.STRING },
            topDemands: {
              type: import_genai.Type.ARRAY,
              items: {
                type: import_genai.Type.OBJECT,
                properties: {
                  category: { type: import_genai.Type.STRING },
                  keyword: { type: import_genai.Type.STRING },
                  estimatedGrowth: { type: import_genai.Type.STRING },
                  actionItem: { type: import_genai.Type.STRING }
                },
                required: ["category", "keyword", "estimatedGrowth", "actionItem"]
              }
            },
            restockAdvice: {
              type: import_genai.Type.ARRAY,
              items: {
                type: import_genai.Type.OBJECT,
                properties: {
                  merchantName: { type: import_genai.Type.STRING },
                  suggestedAction: { type: import_genai.Type.STRING },
                  reason: { type: import_genai.Type.STRING }
                },
                required: ["merchantName", "suggestedAction", "reason"]
              }
            }
          },
          required: ["summary", "topDemands", "restockAdvice"]
        }
      }
    });
    const result = JSON.parse(response.text || "{}");
    res.json({
      ...result,
      offline: false
    });
  } catch (error) {
    console.error("Error in /api/admin/trend-analysis:", error);
    res.status(500).json({ error: error.message || "An error occurred during trend analysis." });
  }
});
var razorpayInstance = null;
function getRazorpay() {
  if (!razorpayInstance) {
    if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
      razorpayInstance = new import_razorpay.default({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
      });
    }
  }
  return razorpayInstance;
}
app.post("/api/payment/razorpay-order", async (req, res) => {
  try {
    const { amount, transfers } = req.body;
    const rzp = getRazorpay();
    if (!rzp) {
      return res.status(200).json({
        success: true,
        mock: true,
        orderId: "mock_order_" + Date.now(),
        amount
      });
    }
    const options = {
      amount: Math.round(amount * 100),
      currency: "INR",
      transfers: transfers?.map((t) => ({
        account: t.account,
        amount: Math.round(t.amount * 100),
        currency: "INR",
        notes: t.notes || {},
        linked_account_notes: ["branch"],
        on_hold: 0
      })) || []
    };
    const order = await rzp.orders.create(options);
    res.json({
      success: true,
      mock: false,
      orderId: order.id,
      amount,
      order
    });
  } catch (err) {
    console.error("Razorpay Error:", err);
    res.status(500).json({ error: err.message });
  }
});
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}
setupServer();
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
//# sourceMappingURL=server.cjs.map
