import { Request, Response } from "express";
import User from "../../database/models/user";
import JwtPayloadWithUser from "../../types/api/jwtPayload";

export async function me(req: Request, res: Response) {
  const user = res.locals.user as JwtPayloadWithUser | undefined;
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const userRecord = await User.findById(user.user.id);
  if (!userRecord) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json({me: userRecord.toJSON()});
}