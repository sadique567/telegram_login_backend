import express from "express";
import { telegramLogin } from "../controllers/telegram.controllers.js";
import { signup } from "../controllers/usersingup.controllers.js";
import { login } from "../controllers/userlogin.controllers.js";

const router = express.Router();
// router.post("/", telegramLogin);
router.post("/signup", signup);
router.post("/login", login);
router.post("/telegram", telegramLogin);
export default router;
