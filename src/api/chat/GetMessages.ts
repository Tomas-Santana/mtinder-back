import Message from "../../database/models/message";
import { Request, Response } from "express";


export async function getMessages(req: Request, res: Response) {
  const chatId = req.params.chatId;

  if (!chatId) {
    res.status(400).json({
      message: "ChatId is required"
    })
  }

  const messages = await Message.getChatMessages(chatId);
  res.json({
    messages
  })
}