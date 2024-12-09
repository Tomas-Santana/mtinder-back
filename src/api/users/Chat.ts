import { Request, Response } from "express";
import Chat from "../../database/models/chat";

export const getChats = async (_req: Request, res: Response) => {
  const { id } = _req.params

  try {
    const chats = await Chat.findAllChats(id)
    if (!chats) {
      res.status(404).json({ error: "Chats not found." });
    }

  } catch (error) {
    
  }
}