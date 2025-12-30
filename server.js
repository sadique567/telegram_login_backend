import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({ origin: "*", methods: ["GET", "POST"] }));

const BOT_TOKEN = process.env.BOT_TOKEN;
if (!BOT_TOKEN) throw new Error("BOT_TOKEN missing");

function verifyTelegramData(data) {
  const secret = crypto.createHash("sha256").update(BOT_TOKEN).digest();
  const checkString = Object.keys(data)
    .filter(k => k !== "hash")
    .sort()
    .map(k => `${k}=${data[k]}`)
    .join("\n");

  const hash = crypto
    .createHmac("sha256", secret)
    .update(checkString)
    .digest("hex");

  return hash === data.hash;
}

app.post("/auth/telegram", (req, res) => {
  const data = req.body;

  if (!data?.hash) {
    return res.status(400).json({ success: false });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now - Number(data.auth_date) > 86400) {
    return res.status(401).json({ success: false });
  }

  if (!verifyTelegramData(data)) {
    return res.status(401).json({ success: false });
  }

  res.json({
    success: true,
    user: {
      id: data.id,
      first_name: data.first_name,
      username: data.username,
      photo_url: data.photo_url
    }
  });
});

app.get("/", (_, res) => res.send("Backend OK"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Running on", PORT));
