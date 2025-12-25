const express = require("express");
const crypto = require("crypto");
const app = express();

const BOT_TOKEN = "7806810087:AAHoSW2W3Lo8eRc0SgJ6qRqqXRH497j2y2Y";

function verifyTelegram(data) {
  const { hash, ...rest } = data;

  const checkString = Object.keys(rest)
    .sort()
    .map(k => `${k}=${rest[k]}`)
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

app.get("/auth-callback", (req, res) => {
  const data = req.query;

  if (!data.hash) {
    return res.send("❌ No Telegram data received");
  }

  const now = Math.floor(Date.now() / 1000);
  if (now - Number(data.auth_date) > 86400) {
    return res.send("❌ Auth expired");
  }

  if (!verifyTelegram(data)) {
    return res.send("❌ Invalid hash");
  }

  // ✅ SUCCESS
  res.send(`
    <h1>✅ LOGIN SUCCESS</h1>
    <pre>${JSON.stringify(data, null, 2)}</pre>
  `);
});

app.listen(3000, () =>
  console.log("Backend running on port 3000")
);
