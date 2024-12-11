import Message from "../../database/models/message";
import { Request, Response } from "express";
import Chat from "../../database/models/chat";


export async function getMessages(req: Request, res: Response) {
  const chatId = req.params.chatId;

  if (!chatId) {
    res.status(400).json({
      message: "ChatId is required"
    })
  }

  const chat = await Chat.findById(chatId);

  if (!chat) {
    res.status(200).json({
      deleted: true,
      messages: []
    })
  }

  const messages = await Message.getChatMessages(chatId);
  res.json({
    messages
  })
}