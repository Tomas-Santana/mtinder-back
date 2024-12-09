import MatchRequest from "../../database/models/matchRequest";
import { Request, Response } from "express";
import JwtPayloadWithUser from "../../types/api/jwtPayload";

export async function getMatchRequests(_req: Request, res: Response) {
  const user = res.locals.user as JwtPayloadWithUser;

  const matchRequests = await MatchRequest.find({
    to: user.user.id,
    status: "pending",
  });

  res.json({
    requests: matchRequests,
  });
}