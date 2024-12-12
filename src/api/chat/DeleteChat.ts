import { Request, Response } from "express";
import Chat from "../../database/models/chat";
import { DeleteChatResponseSchema, DeleteChatRequest, DeleteChatRequestSchema } from "../../types/api/deleteChat";
import JwtPayloadWithUser from "../../types/api/jwtPayload";
import mongoose from "mongoose";
import { Server} from "socket.io";

export const deleteChat = async (req: Request, res: Response, io: Server) => {
  const { id } = req.params;

  const user = res.locals.user as JwtPayloadWithUser;

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
    const stringParticipants = toDelete?.participants.map((p) => p.toString());
    const isMember = stringParticipants?.includes(user.user.id);

    if (!isMember) {
      res.status(403).json({ error: "You are not a member of this chat" });
      return;
    }

    if(!toDelete) {
      res.status(404).json({ error: "Chat not found" });
      return;
    }


    await toDelete.deleteOne()

    // Emit to all users in the chat that the chat was deleted
    io.to(data._id).emit("deleteChat", data._id);

    res.status(200).json({ _id: toDelete.id });
  } catch (error) {
    res.status(500).json({ error: "Error deleting the chat" });
  }
}