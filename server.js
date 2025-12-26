const express = require("express");
const crypto = require("crypto");
const cors = require("cors");

const app = express();

/**
 * 🔴 BOT TOKEN
 * Production me ENV variable rakho
 */
const BOT_TOKEN =
  process.env.BOT_TOKEN || "7806810087:AAHoSW2W3Lo8eRc0SgJ6qRqqXRH497j2y2Y";

if (!BOT_TOKEN) {
  throw new Error("BOT_TOKEN missing");
}

/**
 * ✅ ALLOWED CORS ORIGINS
 */
const allowedOrigins = [
  "https://telegram-login-backend-gup5.onrender.com",
  "https://telegram-fontend.vercel.app",
];

/**
 * ✅ CORS CONFIG
 */
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow Postman / server requests
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("❌ Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST"],
    credentials: true,
  })
);

// Preflight
app.options("*", cors());

/**
 * ✅ Telegram hash verification
 */
function verifyTelegramData(originalData) {
  const data = { ...originalData };
  const hash = data.hash;
  delete data.hash;

  const checkString = Object.keys(data)
    .sort()
    .map((key) => `${key}=${data[key]}`)
    .join("\n");

  const secretKey = crypto.createHash("sha256").update(BOT_TOKEN).digest();

  const calculatedHash = crypto
    .createHmac("sha256", secretKey)
    .update(checkString)
    .digest("hex");

  return calculatedHash === hash;
}

/**
 * ✅ TELEGRAM LOGIN CALLBACK
 */
app.get("/auth-callback", (req, res) => {
  const data = req.query;

  if (!data || !data.hash) {
    return res.status(400).send("No Telegram data");
  }

  const authDate = Number(data.auth_date);
  const now = Math.floor(Date.now() / 1000);
  if (now - authDate > 86400) {
    return res.status(401).send("Login expired");
  }

  if (!verifyTelegramData(data)) {
    return res.status(401).send("Invalid Telegram login");
  }

  // 🔁 REDIRECT TO FRONTEND WITH DATA
  const params = new URLSearchParams({
    id: data.id,
    first_name: data.first_name || "",
    last_name: data.last_name || "",
    username: data.username || "",
    photo_url: data.photo_url || "",
  });

  res.redirect(
    `https://telegram-fontend.vercel.app/success.html?${params.toString()}`
  );
});

/**
 * ✅ HEALTH CHECK
 */
app.get("/", (req, res) => {
  res.send("🚀 Telegram Auth Backend Running");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("🚀 Server running on port " + PORT));
