sed -i '/\/\/ --- Vite Dev Middleware \/ Production Static Asset Hosting ---/i \
import Razorpay from "razorpay";\
\
let razorpayInstance: Razorpay | null = null;\
function getRazorpay() {\
  if (!razorpayInstance) {\
    if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {\
      razorpayInstance = new Razorpay({\
        key_id: process.env.RAZORPAY_KEY_ID,\
        key_secret: process.env.RAZORPAY_KEY_SECRET,\
      });\
    }\
  }\
  return razorpayInstance;\
}\
\
// Razorpay Split Payment Route\
app.post("/api/payment/razorpay-order", async (req, res) => {\
  try {\
    const { amount, transfers } = req.body;\
    const rzp = getRazorpay();\
    if (!rzp) {\
      return res.status(200).json({\
        success: true,\
        mock: true,\
        orderId: "mock_order_" + Date.now(),\
        amount,\
      });\
    }\
    const options = {\
      amount: Math.round(amount * 100),\
      currency: "INR",\
      transfers: transfers?.map((t: any) => ({\
        account: t.account,\
        amount: Math.round(t.amount * 100),\
        currency: "INR",\
        notes: t.notes || {},\
        linked_account_notes: ["branch"],\
        on_hold: 0,\
      })) || [],\
    };\
    const order = await rzp.orders.create(options);\
    res.json({\
      success: true,\
      mock: false,\
      orderId: order.id,\
      amount,\
      order,\
    });\
  } catch (err: any) {\
    console.error("Razorpay Error:", err);\
    res.status(500).json({ error: err.message });\
  }\
});\
\
' server.ts
