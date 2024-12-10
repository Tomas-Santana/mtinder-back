import Chat from "../../database/models/chat";
import MatchRequest from "../../database/models/matchRequest";
import { Request, Response } from "express";
import { createChatSchema } from "../../types/api/createChat";

export async function createChat(req: Request, res: Response) {
  const { success, data } = createChatSchema.safeParse(req.body);

  if (!success) {
    res.status(400).json({ error: "Invalid request." });
    return;
  }

  const existingChat = await Chat.findOne({
    users: {
      $all: [data.userId, res.locals.user.user.id],
    },
  });

  if (existingChat) {
    res.status(200).json({ status: "accepted" });
    return;
  }

  const existingMatchRequest = await MatchRequest.findOne({
    from: data.userId,
    to: res.locals.user.user.id,
    status: "accepted",
  });

  if (!existingMatchRequest) {
    res.status(400).json({ error: "Match request does not exist." });
    return;
  }

  const chat = new Chat({
    users: [data.userId, res.locals.user.user.id],
  });

  await chat.save();

  res.status(200).json({ status: "created" });
}