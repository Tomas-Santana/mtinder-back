import { sendMessage as sendMessageRequest } from "../../types/api/sendMessage";
import { Server } from "socket.io";
import { Request, Response } from "express";
import Message from "../../database/models/message";
import JwtPayloadWithUser from "../../types/api/jwtPayload";

export async function sendMessage(
  req: Request,
  res: Response,
  io: Server
) {
  const chatId = req.params.chatId;
  if (!chatId) {
    res.status(400).json({ error: "Invalid request." });

    return;
  }
  const { success, data } = sendMessageRequest.safeParse(req.body);

  const user = res.locals.user as JwtPayloadWithUser;

  if (!success) {
    res.status(400).json({ error: "Invalid request." });
    return;
  }

  const newMessage = new Message({
    content: data.content,
    contentType: data.contentType,
    userId: user.user.id,
    timestamp: new Date(),
    chatId: chatId,
  });

  await newMessage.save();

  io.to(chatId).emit("newMessage", newMessage.toJSON());

  res.status(200).json({ message: newMessage.toJSON() });

}