// src/Routes/chatRoutes.js
import express from "express";
import { handleChat,getChatHistory } from "../Controller/chc.js";

const router = express.Router();

router.post("/chat", handleChat);
router.get("/chat/history", getChatHistory);

export default router;
