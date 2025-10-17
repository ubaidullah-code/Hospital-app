
import { Message } from "../models/message.model.js";

// ===============================
// SEND MESSAGE


// ===============================
export const sendMessage = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, message } = req.body;

    if (!firstName || !lastName || !email || !phone || !message) {
      return res
        .status(400)
        .json({ success: false, message: "Please fill the full form!" });
    }

    await Message.create({ firstName, lastName, email, phone, message });

    res.status(200).json({
      success: true,
      message: "Message sent successfully!",
    });
  } catch (error) {
    console.error("sendMessageError:", error);
    res
      .status(500)
      .json({ success: false, message: "Internal server error!" });
  }
};

// ===============================
// GET ALL MESSAGES
// ===============================
export const getAllMessages = async (req, res) => {
  try {
    const messages = await Message.find();
    res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error("getAllMessagesError:", error);
    res
      .status(500)
      .json({ success: false, message: "Internal server error!" });
  }
};
