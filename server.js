const express = require("express");
const crypto = require("crypto");
const cors = require("cors");

const app = express();
app.use(cors());

/**
 * 🔴 BOT TOKEN
 * Render / Production: ENV variable use karo
 * Local test ke liye token yahin daal sakte ho
 */
const BOT_TOKEN = process.env.BOT_TOKEN || "7806810087:AAHoSW2W3Lo8eRc0SgJ6qRqqXRH497j2y2Y";

if (!BOT_TOKEN) {
  throw new Error("BOT_TOKEN missing");
}

/**
 * ✅ Telegram hash verification
 */
function verifyTelegramData(originalData) {
  const data = { ...originalData }; // COPY
  const hash = data.hash;
  delete data.hash;

  const checkString = Object.keys(data)
    .sort()
    .map(key => `${key}=${data[key]}`)
    .join("\n");

  const secretKey = crypto
    .createHash("sha256")
    .update(BOT_TOKEN)
    .digest();

  const calculatedHash = crypto
    .createHmac("sha256", secretKey)
    .update(checkString)
    .digest("hex");

  return calculatedHash === hash;
}

/**
 * ✅ Telegram redirect yahin hota hai
 */
app.get("/auth-callback", (req, res) => {
  const data = req.query;

  if (!data || !data.hash) {
    return res.send("❌ No Telegram data received");
  }

  // Expiry check (24h)
  const authDate = Number(data.auth_date);
  const now = Math.floor(Date.now() / 1000);
  if (now - authDate > 86400) {
    return res.send("❌ Login expired");
  }

  // Hash verify
  if (!verifyTelegramData(data)) {
    return res.send("❌ Invalid Telegram login");
  }

  // ✅ SUCCESS
  res.send(`
    <h1 style="color:green">🎉 Telegram Login Successful</h1>
    <p><b>ID:</b> ${data.id}</p>
    <p><b>Name:</b> ${data.first_name} ${data.last_name || ""}</p>
    <p><b>Username:</b> @${data.username || "N/A"}</p>
    ${
      data.photo_url
        ? `<img src="${data.photo_url}" width="120" style="border-radius:50%">`
        : ""
    }
  `);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log("🚀 Server running on port " + PORT)
);
