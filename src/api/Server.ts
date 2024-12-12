import e from "express";
import { PhotosGroup } from "./photos/Group";
import AuthGroup from "./auth/Group";
import UserGroup from "./users/Group";
import ChatGroup from "./chat/Group";
import MatchGroup from "./match/Group";
import * as http from "http";
import { DefaultEventsMap, Server as SocketServer } from "socket.io";
import { createRouteHandler } from "uploadthing/express";
import Chat from "../database/models/chat";
import Message from "../database/models/message";
import mongoose from "mongoose";
import { socketToken } from "./middleware/token";
import { JwtUser } from "../types/api/jwtPayload";
import { ServerToClientEvents, SocketData } from "../types/socket";
import TwoWayMap from "../helpers/twoWayMap";
import { SocketGroup } from "./socket/Group";

export class Server {
  private app: e.Application;
  private port: number;
  private address?: string;
  private static DEFAULT_ADDRESS = "127.0.0.1";
  private serverHttp: http.Server;
  private io: SocketServer;
  socketUsers: TwoWayMap<string, string> = new TwoWayMap();

  constructor(port: number, address?: string) {
    this.app = e();
    this.port = port;
    this.address = address;
    this.serverHttp = http.createServer(this.app);
    this.io = new SocketServer<
      ServerToClientEvents,
      DefaultEventsMap,
      DefaultEventsMap,
      SocketData
    >(this.serverHttp);
  }

  public start() {
    this.app.use(e.json({ limit: "50mb" }));
    this.app.use("/resources", e.static("data"));
    this.app.use((req, res, next) => {
      console.log(`${req.method} ${req.path}`);
      next();
    });

    const authGroup = new AuthGroup();
    this.app.use(authGroup.path, authGroup.getRouter());

    const photosGroup = new PhotosGroup();
    this.app.use(photosGroup.path, photosGroup.getRouter());

    const userGroup = new UserGroup(this.io);
    this.app.use(userGroup.path, userGroup.getRouter());

    this.app.get("/", (_, res) => {
      res.send("Hello World");
    });

    const chatGroup = new ChatGroup(this.io);
    this.app.use(chatGroup.path, chatGroup.getRouter());

    const matchGroup = new MatchGroup(this.io, this.socketUsers);
    this.app.use(matchGroup.path, matchGroup.getRouter());

    this.io.use(socketToken);

    this.io.on("connection", (socket) => {
      const user = socket.data.user as JwtUser;

      this.socketUsers.set(socket.id, user.id);

      SocketGroup.joinHandler(socket); // adds the user to all chats they are in

      console.log("New client connected", socket.id, user.firstName);

      socket.on("join", async ({ roomId, participants }) => {
        socket.join(roomId);
        console.log(`Client ${socket.id} joined room ${roomId}`);

        let chat = await Chat.findOne({ participants: participants });
        if (!chat) {
          chat = new Chat({ roomId: roomId, participants: participants });
          await chat.save();
          console.log("Created new chat for room", roomId);
        }
      });

      socket.on("leaveRoom", ({ roomId }) => {
        socket.leave(roomId);
        console.log(`Client ${socket.id} left room ${roomId}`);
      });

      socket.on("sendMessage", async ({ roomId, message }) => {
        console.log(`Message received in room ${roomId}:`, message);
        const newMessage = new Message({
          content: message.content,
          userId: message.userId,
          timestamp: message.timestamp,
          roomId: roomId,
        });
        await newMessage.save();

        const chat = await Chat.findOne({ roomId: roomId });
        if (chat) {
          chat.messages.push(
            new mongoose.Types.ObjectId(newMessage._id as string)
          );
          await chat.save();
        }
        this.io.to(roomId).emit("receiveMessage", message);
      });

      socket.on("disconnect", () => {
        console.log("Client disconnected", socket.id);
      });
    });

    this.serverHttp.listen(this.port, () => {
      console.log(
        `Server listening on ${JSON.stringify(this.serverHttp.address())}:${
          this.port
        }`
      );
    });
    
  }
}
