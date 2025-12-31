import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

// import telegramRoutes from "./routes/telegram.routes.js";
import router from "./routes/approutes.js";

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cors({ origin: "*", methods: ["GET", "POST"] }));

// app.use("/auth/telegram", telegramRoutes);
app.use("/auth", router);

app.get("/", (_, res) => res.send("Backend OK"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on ${PORT}`));
