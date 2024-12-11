import { RequestMatch, requestMatchSchema } from "../../types/api/requestMatch";
import { Request, Response } from "express";
import MatchRequest from "../../database/models/matchRequest";
import JwtPayloadWithUser from "../../types/api/jwtPayload";
import { JwtUser } from "../../types/api/jwtPayload";
import TwoWayMap from "../../helpers/twoWayMap";
import { Server } from "socket.io";
import Chat from "../../database/models/chat";
import User from "../../database/models/user";

export async function requestMatch(
  req: Request,
  res: Response,
  io: Server,
  socketUsers: TwoWayMap<string, string>
) {
  const { success, data } = requestMatchSchema.safeParse(req.body);
  const user = res.locals.user as JwtPayloadWithUser;

  if (!success) {
    res.status(400).json({ error: "Invalid request." });
    return;
  }

  const otherUser = await User.findById(data.userId);
  const fullUser = await User.findById(user.user.id);



  if (!otherUser || !fullUser) {
    res.status(404).json({ error: "User not found." });
    return;
  }

  let existingMatchRequest = await MatchRequest.findOne({
    from: data.userId,
    to: user.user.id,
  });

  if (existingMatchRequest) {
    existingMatchRequest.status = "accepted";

    const existingChat = await Chat.findOne({
      participants: [data.userId, user.user.id],
    });

    if (existingChat) {
      res.status(200).json({ status: "accepted", chatId: existingChat._id });
      return;
    }

    const newChat = new Chat({
      participants: [data.userId, user.user.id],
      roomId: `${data.userId}-${user.user.id}`,
      participantsInfo: [{
        _id: data.userId,
        firstName: otherUser.firstName,
        lastName: otherUser.lastName,
        profilePicture: otherUser.imageUrls?.[0],
      }, {
        _id: user.user.id,
        firstName: user.user.firstName,
        lastName: user.user.lastName,
        profilePicture: fullUser.imageUrls?.[0],
      }],
      
      lastMessage: {
        message: "Say hi to your new friend!",
        senderName: "Mellow Mates",
        timestamp: new Date(),
      },
    });

    await newChat.save();

    res.status(200).json({ status: "accepted", chatId: newChat._id });

    // notify both users that they have a new chat
    const toSocketId = socketUsers.getKey(data.userId);
    const fromSocketId = socketUsers.getKey(user.user.id);

    if (fromSocketId) {
      const NOTOAST = true; // since app already shows a banner, prevent a toast
      console.log("emitting new chat to", fromSocketId);
      io.to(fromSocketId).emit("newChat", newChat, NOTOAST);
    }
    if (toSocketId) {
      console.log("emitting new chat to", toSocketId);
      io.to(toSocketId).emit("newChat", newChat);
    }

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
    io.to(toSocketId).emit("matchRequest", newMatchRequest);
  }

  res.status(200).json({ status: "created" });
}
