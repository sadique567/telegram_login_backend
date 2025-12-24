require("dotenv").config();
const express = require("express");
const crypto = require("crypto");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());
app.use(cors());

const BOT_TOKEN = process.env.BOT_TOKEN;
const JWT_SECRET = process.env.JWT_SECRET;

function verifyTelegramAuth(data) {
  const secret = crypto
    .createHash("sha256")
    .update(BOT_TOKEN)
    .digest();

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

  if (!verifyTelegramAuth(data)) {
    return res.status(401).json({
      success: false,
      message: "Invalid Telegram login",
    });
  }

  // ⏱️ auth_date validation
  const now = Math.floor(Date.now() / 1000);
  if (now - data.auth_date > 86400) {
    return res.status(401).json({
      success: false,
      message: "Login expired",
    });
  }

  // 🔑 Create JWT
  const token = jwt.sign(
    { telegramId: data.id },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  return res.json({
    success: true,
    user: {
      telegramId: data.id,
      firstName: data.first_name,
      username: data.username,
      photo: data.photo_url,
    },
    token,
  });
});

app.use(express.static("public"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);
