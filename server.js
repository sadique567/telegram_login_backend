const express = require("express");
const crypto = require("crypto");
const path = require("path");
const app = express();

const BOT_TOKEN =
  process.env.BOT_TOKEN || "7806810087:AAHoSW2W3Lo8eRc0SgJ6qRqqXRH497j2y2Y";
function verifyTelegram(data) {
  const { hash, ...dataFields } = data;
  const authDate = Number(dataFields.auth_date);
  const now = Math.floor(Date.now() / 1000);

  if (!authDate || now - authDate > 86400) {
    console.log("❌ Auth date invalid or expired");
    return false;
  }

  const secretKey = crypto.createHash("sha256").update(BOT_TOKEN).digest();
  const dataCheckString = Object.keys(dataFields)
    .sort()
    .map((k) => `${k}=${dataFields[k]}`)
    .join("\n");

  const calculatedHash = crypto
    .createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  const isValid = calculatedHash === hash;
  if (!isValid) {
    console.log("🔍 Verification failed:", {
      receivedHash: hash,
      calculatedHash,
      dataCheckString,
    });
  } else {
    console.log("🔍 Verification passed! Data check string:", dataCheckString);
  }

  return isValid;
}

// Serve static files (for HTML)
app.use(express.static(__dirname));

// Root route: Serve telegram_login.html automatically
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/index.html"));
});

app.get("/telegram-login", (req, res) => {
  const data = { ...req.query };
  console.log("📥 Received data:", data);

  if (!verifyTelegram(data)) {
    console.log("❌ Invalid Login", data);
    return res
      .status(403)
      .json({ success: false, error: "Invalid Telegram auth" });
  }

  console.log("✅ Telegram Login Success", data);

  // For testing: Return JSON with user data (easy for Postman/Chrome)
  const user = {
    id: data.id,
    first_name: data.first_name,
    last_name: data.last_name || null,
    username: data.username || null,
    photo_url: data.photo_url || null,
    auth_date: data.auth_date,
  };

  return res.json({
    success: true,
    message: "Telegram auth verified!",
    user,
  });
});

// Render uses dynamic port; fallback for local
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(
    `Visit: http://localhost:3000/ (local) or https://your-app.onrender.com/ (Render)`
  );
});

// const express = require("express");
// const crypto = require("crypto");
// const app = express();

// const BOT_TOKEN = "7806810087:AAHoSW2W3Lo8eRc0SgJ6qRqqXRH497j2y2Y";

// function verifyTelegram(data) {
//   const { hash, ...rest } = data;

//   const checkString = Object.keys(rest)
//     .sort()
//     .map(k => `${k}=${rest[k]}`)
//     .join("\n");

//   const secretKey = crypto
//     .createHash("sha256")
//     .update(BOT_TOKEN)
//     .digest();

//   const calculatedHash = crypto
//     .createHmac("sha256", secretKey)
//     .update(checkString)
//     .digest("hex");

//   return calculatedHash === hash;
// }

// app.get("/auth-callback", (req, res) => {
//   const data = req.query;

//   if (!data.hash) {
//     return res.send("❌ No Telegram data received");
//   }

//   const now = Math.floor(Date.now() / 1000);
//   if (now - Number(data.auth_date) > 86400) {
//     return res.send("❌ Auth expired");
//   }

//   if (!verifyTelegram(data)) {
//     return res.send("❌ Invalid hash");
//   }

//   // ✅ SUCCESS
//   res.send(`
//     <h1>✅ LOGIN SUCCESS</h1>
//     <pre>${JSON.stringify(data, null, 2)}</pre>
//   `);
// });

// app.listen(3000, () =>
//   console.log("Backend running on port 3000")
// );
