import { RequestMatch, requestMatchSchema } from "../../types/api/requestMatch";
import { Request, Response } from "express";
import MatchRequest from "../../database/models/matchRequest";
import JwtPayloadWithUser from "../../types/api/jwtPayload";
import { JwtUser } from "../../types/api/jwtPayload";
import TwoWayMap from "../../helpers/twoWayMap";
import { Server } from "socket.io";

export async function requestMatch(req: Request, res: Response, io: Server, socketUsers: TwoWayMap<string, string>) {
  const { success, data } = requestMatchSchema.safeParse(req.body);
  const user = res.locals.user as JwtPayloadWithUser;

  if (!success) {
    res.status(400).json({ error: "Invalid request." });
    return;
  }

  let existingMatchRequest = await MatchRequest.findOne({
    from: data.userId,
    to: user.user.id,
  });

  if (existingMatchRequest) {
    res.status(200).json({ status: "existed" });
    existingMatchRequest.status = "accepted";
    await existingMatchRequest.save();
    return;
  }

  existingMatchRequest = await MatchRequest.findOne({
    from: user.user.id,
    to: data.userId,
  });

  if (existingMatchRequest) {
    res.status(400).json({ error: "Match request already exists." });
    return;
  }

  const newMatchRequest = new MatchRequest({
    from: user.user.id,
    to: data.userId,
  });

  await newMatchRequest.save();

  // Send a notification to the user that received the match request
  const toSocketId = socketUsers.getKey(data.userId);

  if (toSocketId) {
    io.to(toSocketId).emit("match-request", {
      from: user.user.id,
    });
  }

  res.status(200).json({ status: "created" });
}
