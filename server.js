const express = require("express");
const crypto = require("crypto");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const BOT_TOKEN = "7806810087:AAHoSW2W3Lo8eRc0SgJ6qRqqXRH497j2y2Y"
// "YOUR_BOT_TOKEN";

app.post("/telegram-login", (req, res) => {
  const data = req.body;
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

  if (calculatedHash === hash) {
    return res.json({ success: true, user: data });
  } else {
    return res.status(401).json({ success: false });
  }
});

app.listen(3000, () => console.log("Server running"));

