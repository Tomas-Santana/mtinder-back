import User from "../../database/models/user";
import { Request, Response } from "express";
import JwtPayloadWithUser from "../../types/api/jwtPayload";
import MatchRequest from "../../database/models/matchRequest";
import Chat from "../../database/models/chat";
import mongoose from "mongoose";
import { Server } from "socket.io";

export const deleteUser = async (_req: Request, res: Response, io: Server) => {
  const user = res.locals.user as JwtPayloadWithUser | undefined;
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const id = user.user.id;
 
  if (!id) {
    res.status(400).json({ error: "Valid id not founded." });
    return;
  }

  try {
    
    const deleted = await User.findByIdAndDelete(id);
  
    if (!deleted) {
      res.status(404).json({ error: "User not found." });
      return;
    }
  
    res.status(200).json({ _id: deleted.id });

    await MatchRequest.deleteMany({ $or: [{ from: id }, { to: id }] });
    const chats = await Chat.find({ participants: id }).select("_id");
    await Chat.deleteMany({ participants: id });    
    chats.forEach((chat) => {
      const stringId = chat.id
      if (!stringId) {
        return;
      }
      console.log("deleteChat", stringId);
      io.to(stringId).emit("deleteChat", stringId);
    });

  } catch (error) {
    res.status(500).json({ error: "Internal server error." });
  }
}

export const getUsers = async (_req: Request, res: Response) => {
  const user = res.locals.user as JwtPayloadWithUser 

  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  // get possible matches
  try {
    const possibleMatches = await getPossibleMatches(
      user.user.id
    );
    res.status(200).json(possibleMatches);
  } catch (err) {
    res.status(500).json({ error: "Internal server error." });
  }
}

export const updateUser = async (req: Request, res: Response) => {
  
  const { _id, firstName, lastName, favoriteGenres } = req.body

  if(!_id || !firstName || !lastName || !favoriteGenres) {
    res.status(400).json({ error: "Invalid request." });
    return;
  }

  const updateData: Partial<{ firstName: string; lastName: string; favoriteGenres: string[] }> ={};

  if(firstName) updateData.firstName = firstName;
  if(lastName) updateData.lastName = lastName;
  if(favoriteGenres) updateData.favoriteGenres = favoriteGenres;

  try {
    const updated = await User.findByIdAndUpdate(_id, updateData, { new: true });
    if(!updated) {
      res.status(404).json({ error: "User not found." });
      return;
    }
    
    res.status(200).json({ _id: updated.id, firstName: updated.firstName, lastName: updated.lastName, favoriteGenres: updated.favoriteGenres});
  } catch(err) {
    res.status(500).json({ error: "Internal server error." })
  }
}

async function getPossibleMatches(userId:string) {

  const userDoc = await User.findById(userId).select("favoriteGenres");
  console.log(userDoc);

  if (!userDoc) {
    throw new Error("User not found.");
  }

  

  const pendingMatchRequests = await MatchRequest.find({
    from: userId,
    status: "pending",
  }).select("to");

  const userIdsWithPendingRequests = new Set(
    pendingMatchRequests.map((request) => request.to.toString())
  );

  // get all match request accepted where the user is the sender or the receiver

  const acceptedMatchRequests = await MatchRequest.find({
    $or: [{ from: userId }, { to: userId }],
    status: "accepted",
  }).select("from to");

  const userIdsThatUserHasMatchedWith = new Set(
    acceptedMatchRequests.map((request) => {
      if (request.from.toString() === userId) {
        return request.to.toString();
      }
      return request.from.toString();
    })
  );
  console.log(userIdsThatUserHasMatchedWith);


  const possibleMatches = await User.find({
    _id: {
      $nin: Array.from(userIdsThatUserHasMatchedWith).concat(Array.from(userIdsWithPendingRequests)).concat([userId]),
    },
    favoriteGenres: { $in: userDoc.favoriteGenres },
  })

  console.log(possibleMatches);


  return possibleMatches;
}