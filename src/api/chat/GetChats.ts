import { Request, Response } from "express";
import Chat from "../../database/models/chat";
import JwtPayloadWithUser from "../../types/api/jwtPayload";

export async function getChats(req: Request, res: Response) {
  const user = res.locals.user as JwtPayloadWithUser;

  const userChats = await Chat.findByUserId(user.user.id)
  console.log("user.chats", userChats)

  res.json({
    chats: userChats
  })
}