require("dotenv").config();
const express = require("express");
const crypto = require("crypto");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const app = express();

app.use(express.json());
app.use(cors());

// Serve your HTML login page (put index.html in /public folder)
app.use(express.static("public"));

const BOT_TOKEN = process.env.BOT_TOKEN; // Your bot token from @BotFather
const JWT_SECRET = process.env.JWT_SECRET; // Any strong secret, e.g., random 32+ chars

if (!BOT_TOKEN || !JWT_SECRET) {
  console.error("Error: BOT_TOKEN and JWT_SECRET must be set in .env");
  process.exit(1);
}

function verifyTelegramAuth(data) {
  const secret = crypto.createHash("sha256").update(BOT_TOKEN).digest();

  const checkString = Object.keys(data)
    .filter((key) => key !== "hash")
    .sort()
    .map((key) => `${key}=${data[key]}`)
    .join("\n");

  const hmac = crypto
    .createHmac("sha256", secret)
    .update(checkString)
    .digest("hex");

  return hmac === data.hash;
}

app.post("/telegram/login", (req, res) => {
  const data = req.body;

  // Basic validation
  if (!data || !data.id || !data.auth_date || !data.hash) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields",
    });
  }

  // Verify hash (critical for security!)
  if (!verifyTelegramAuth(data)) {
    return res.status(401).json({
      success: false,
      message: "Invalid Telegram authentication data",
    });
  }

  // Check if login is not too old (max 1 day as per Telegram docs)
  const now = Math.floor(Date.now() / 1000);
  if (now - data.auth_date > 86400) {
    return res.status(401).json({
      success: false,
      message: "Authentication data expired",
    });
  }

  // Success → create your app's JWT token
  const token = jwt.sign(
    {
      telegramId: data.id,
      username: data.username || null,
      firstName: data.first_name,
    },
    JWT_SECRET,
    { expiresIn: "7d" } // or whatever you prefer
  );

  res.json({
    success: true,
    message: "Login successful",
    user: {
      telegramId: data.id,
      firstName: data.first_name,
      lastName: data.last_name || null,
      username: data.username || null,
      photoUrl: data.photo_url || null,
    },
    token, // Send to your Flutter app
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
