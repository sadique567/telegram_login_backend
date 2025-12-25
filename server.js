const express = require("express");
const crypto = require("crypto");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const BOT_TOKEN = process.env.BOT_TOKEN || "YOUR_REAL_BOT_TOKEN";

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

app.post("/telegram-login", (req, res) => {
  const data = req.body;

  if (!data || !data.hash) {
    return res.status(400).json({ success: false, message: "Invalid payload" });
  }

  const authDate = Number(data.auth_date);
  const now = Math.floor(Date.now() / 1000);
  if (now - authDate > 86400) {
    return res.status(401).json({ success: false, message: "Auth expired" });
  }

  if (!verifyTelegram(data)) {
    return res.status(401).json({ success: false, message: "Invalid hash" });
  }

  return res.json({
    success: true,
    user: {
      id: data.id,
      first_name: data.first_name,
      last_name: data.last_name || "",
      username: data.username || "",
      photo_url: data.photo_url || ""
    }
  });
});

app.listen(3000, () =>
  console.log("✅ Backend running on http://localhost:3000")
);
