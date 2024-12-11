import { sendMessage as sendMessageRequest } from "../../types/api/sendMessage";
import { Server } from "socket.io";
import { Request, Response } from "express";
import Message from "../../database/models/message";
import JwtPayloadWithUser from "../../types/api/jwtPayload";
import Chat from "../../database/models/chat";
import { AbstractFileSystem } from "../../storage/AbstractFileSystem";
import { processChatPic } from "../../helpers/processFile";

export async function sendMessage(
  req: Request,
  res: Response,
  io: Server,
  fs: AbstractFileSystem
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

  let realContent = data.content;

  if (data.contentType === "image") {
    console.log("Processing image");
    const buffer = await processChatPic(Buffer.from(data.content, "base64"));
    const url = await fs.create(buffer, "image/webp", `/public/${chatId}`);
    console.log("Image processed", url);
    realContent = url;
  }

  const newMessage = new Message({
    content: realContent,
    contentType: data.contentType,
    userId: user.user.id,
    timestamp: new Date(),
    chatId: chatId,
  });

  await newMessage.save();
  console.log("Sending message to chat", chatId);
  io.to(chatId).emit("newMessage", newMessage.toJSON());

  res.status(200).json({ message: newMessage.toJSON() });

  const chat = await Chat.findById(chatId);

  if (chat) {
    chat.lastMessage = {
      message: data.contentType === "image" ? "📷 Image" : data.content,
      timestamp: new Date(),
      senderId: user.user.id
    };

    await chat.save();
  }
}