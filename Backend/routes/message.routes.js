import express from "express";
import { getAllMessages, sendMessage } from "../controllers/message.controller.js";
import { isAdminAuthenticated } from "../controllers/user.controller.js";

const messageRouter = express.Router();

messageRouter.post("/send", sendMessage);
messageRouter.get("/getall", isAdminAuthenticated, getAllMessages);

export default messageRouter;
