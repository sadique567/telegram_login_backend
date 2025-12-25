const express = require("express");
const crypto = require("crypto");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// BOT_TOKEN environment variable mein set karo Render dashboard pe (security ke liye)
const BOT_TOKEN = process.env.BOT_TOKEN || "7806810087:AAHoSW2W3Lo8eRc0SgJ6qRqqXRH497j2y2Y";

function verifyTelegramData(data) {
  const hash = data.hash;
  delete data.hash;

  const checkString = Object.keys(data)
    .filter(key => data[key] !== null && data[key] !== undefined && data[key] !== "")
    .sort()
    .map(k => `${k}=${data[k]}`)
    .join("\n");

  const secretKey = crypto.createHash("sha256").update(BOT_TOKEN).digest();
  const calculatedHash = crypto.createHmac("sha256", secretKey).update(checkString).digest("hex");

  return calculatedHash === hash;
}

// New route for Telegram widget redirect
app.get("/auth-callback", (req, res) => {
  const data = req.query; // Query params mein data aayega

  if (!data || !data.hash) {
    return res.send("<h1 style='color:red'>Login Failed: No data received</h1>");
  }

  const authDate = Number(data.auth_date);
  const now = Math.floor(Date.now() / 1000);
  if (now - authDate > 86400) {
    return res.send("<h1 style='color:red'>Login Failed: Data expired</h1>");
  }

  if (!verifyTelegramData(data)) {
    return res.send("<h1 style='color:red'>Login Failed: Invalid hash</h1>");
  }

  // Success – data dikhao
  let html = `
    <div style="font-family: Arial; text-align: center; margin-top: 50px;">
      <h1 style="color: green;">🎉 Login Successful!</h1>
      <p><strong>ID:</strong> ${data.id}</p>
      <p><strong>First Name:</strong> ${data.first_name}</p>
  `;

  if (data.last_name) html += `<p><strong>Last Name:</strong> ${data.last_name}</p>`;
  if (data.username) html += `<p><strong>Username:</strong> @${data.username}</p>`;
  if (data.photo_url) html += `<img src="${data.photo_url}" width="150" height="150" alt="Profile Photo">`;
  html += `<p><strong>Auth Date:</strong> ${new Date(authDate * 1000).toLocaleString()}</p>`;

  // Flutter redirect (agar WebView mein use kar rahe ho)
  html += `
      <script>
        window.location.href = "flutter://login-success?user=${encodeURIComponent(JSON.stringify({
          id: data.id,
          first_name: data.first_name,
          last_name: data.last_name || "",
          username: data.username || "",
          photo_url: data.photo_url || ""
        }))}";
      </script>
    </div>
  `;

  res.send(html);
});

// Optional: old POST route agar future mein use karna ho
app.post("/telegram-login", (req, res) => {
  // same code as before...
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));