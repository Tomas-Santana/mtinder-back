import { Request, Response } from "express";
import Chat from "../../database/models/chat";
import { DeleteChatResponseSchema, DeleteChatRequest, DeleteChatRequestSchema } from "../../types/api/deleteChat";

export const deleteChat = async (req: Request, res: Response) => {
  const { id } = req.params;

  const { success, data, error } = DeleteChatRequestSchema.safeParse({
    _id: id,
  });

  if (!success || !data) {
    res.status(400).json({ error: error.message ?? "Invalid request." });
    return;
  }

  if (!data._id) {
    res.status(400).json({ error: "Valid id not founded." });
    return;
  }

  try {
    const toDelete = await Chat.findById(data._id);

    if(!toDelete) {
      res.status(404).json({ error: "Chat not founded" });
      return;
    }

    await toDelete.deleteOne()

    res.status(200).json({ _id: toDelete.id });
  } catch (error) {
    res.status(500).json({ error: "Error deleting the chat" });
  }
}