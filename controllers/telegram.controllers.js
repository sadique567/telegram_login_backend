import jwt from "jsonwebtoken";
import telegramSchema from "../models/telegramlogin.models.js";
import { verifyTelegramData } from "../utils/telegramVerify.js";

export const telegramLogin = async (req, res) => {
  try {
    const data = req.body;

    const isValid = verifyTelegramData(data, process.env.BOT_TOKEN);
    if (!isValid) {
      return res.status(401).json({ message: "Telegram auth failed" });
    }

    let user = await telegramSchema.findOne({ telegramId: data.id });

    if (!user) {
      user = await User.create({
        telegramId: data.id,
        username: data.username,
        firstName: data.first_name,
        photoUrl: data.photo_url,
        provider: "telegram",
      });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({ success: true, token, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
