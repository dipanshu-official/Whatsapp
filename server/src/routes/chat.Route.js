import { Router } from "express";
import { sendMessage, getConversation , getMessages ,deleteMessage ,markMessagesAsRead } from "../controllers/chat.Controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { multerMiddleware } from "../config/cloudinary.js";

const router = Router();

// Protected route

router.post("/send-message", authMiddleware, multerMiddleware, sendMessage);
router.get("/conversation", authMiddleware, getConversation);
router.get("/messages/:conversationId", authMiddleware, getMessages);
router.delete("/message/delete/:messageId", authMiddleware, deleteMessage);
router.put("/message/read", authMiddleware, markMessagesAsRead);


export default router;
