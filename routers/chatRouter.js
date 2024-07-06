import express from "express";
import authenticate from "./../middleware/authenticate.js";
import { createChat, getChats } from "../controllers/chatController.js";

const router = express.Router();

router.get("/", authenticate, getChats);
router.post("/create", authenticate, createChat);

export default router;
