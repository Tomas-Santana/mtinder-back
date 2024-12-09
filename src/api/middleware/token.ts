// json web token
import jwt from "jsonwebtoken";
import e from "express";
import JwtPayloadWithUser from "../../types/api/jwtPayload";
import { ExtendedError, Socket } from "socket.io";

export function token(req: e.Request, res: e.Response, next: e.NextFunction) {
  const token = req.header("Authorization")?.split(" ")[1];

  if (!token) {
    res.status(401).json({ error: "No token provided" });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "") as JwtPayloadWithUser

    res.locals.user = decoded;

    next();
  } catch (err) {
    res.status(400).json({ error: "Invalid token" });
  }
}

export function socketToken(socket: Socket, next: (err?: ExtendedError) => void) {
  const token = socket.handshake.auth.token;

  if (!token || typeof token !== "string") {
    next(new Error("No token provided"));
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "") as JwtPayloadWithUser
    socket.data.user = decoded.user;
    next();
  }
  catch (err) {
    next(new Error("Invalid token"));
  }
}