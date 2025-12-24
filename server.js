const express = require("express");
const crypto = require("crypto");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const BOT_TOKEN = "8223804455:AAG1eJFJ8XDK7QMS6K_RMLhwqcQB0ZxrXz8"; // from BotFather

function verifyTelegramLogin(data) {
  const secret = crypto
    .createHash("sha256")
    .update(BOT_TOKEN)
    .digest();

  const checkString = Object.keys(data)
    .filter(key => key !== "hash")
    .sort()
    .map(key => `${key}=${data[key]}`)
    .join("\n");

  const hmac = crypto
    .createHmac("sha256", secret)
    .update(checkString)
    .digest("hex");

  return hmac === data.hash;
}

app.post("/auth/telegram", (req, res) => {
  const data = req.body;

  if (!verifyTelegramLogin(data)) {
    return res.status(401).json({ success: false, message: "Invalid Telegram login" });
  }

  // ✅ VERIFIED USER DATA
  res.json({
    success: true,
    user: {
      id: data.id,
      first_name: data.first_name,
      last_name: data.last_name,
      username: data.username,
      photo_url: data.photo_url
    }
  });
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
