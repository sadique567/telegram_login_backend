const express = require("express");
const crypto = require("crypto");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const BOT_TOKEN = "7806810087:AAHoSW2W3Lo8eRc0SgJ6qRqqXRH497j2y2Y"; // Keep this secret!

app.post("/telegram-login", (req, res) => {
  let data = req.body;

  if (!data || typeof data !== "object" || !data.hash) {
    return res.status(400).json({ success: false, message: "Invalid data" });
  }

  const receivedHash = data.hash;
  delete data.hash; // Remove hash for check string

  // Build check string: only include fields with truthy values (strings/numbers), sorted alphabetically
  const checkString = Object.keys(data)
    .filter(key => data[key] !== null && data[key] !== undefined && data[key] !== "") // Skip empty/undefined
    .sort()
    .map(key => `${key}=${data[key]}`)
    .join("\n");

  const secretKey = crypto.createHash("sha256").update(BOT_TOKEN).digest();

  const calculatedHash = crypto
    .createHmac("sha256", secretKey)
    .update(checkString)
    .digest("hex");

  // Optional: check if auth_date is not too old (e.g., > 1 day)
  const authDate = parseInt(data.auth_date || 0);
  const now = Math.floor(Date.now() / 1000);
  if (now - authDate > 86400) { // 24 hours
    return res.status(401).json({ success: false, message: "Data too old" });
  }

  if (calculatedHash === receivedHash) {
    // Success! Send back useful data if needed
    res.json({ 
      success: true, 
      message: "Login successful",
      user: data // id, first_name, username, etc.
    });
  } else {
    res.status(401).json({ success: false, message: "Invalid hash" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));  