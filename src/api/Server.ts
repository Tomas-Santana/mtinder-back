import e from "express";
import { PhotosGroup } from "./photos/Group";
import AuthGroup from "./auth/Group";
import UserGroup from "./users/Group";
import * as http from "http";
import { Server as SocketServer } from "socket.io";
import { createRouteHandler } from "uploadthing/express";
import Chat from "../database/models/chat";
import Message from "../database/models/message";
import mongoose from "mongoose";

export class Server {
  private app: e.Application;
  private port: number;
  private address?: string;
  private static DEFAULT_ADDRESS = "127.0.0.1";
  private serverHttp: http.Server;
  private io: SocketServer;

  constructor(port: number, address?: string) {
    this.app = e();
    this.port = port;
    this.address = address;
    this.serverHttp = http.createServer(this.app);
    this.io = new SocketServer(this.serverHttp);
  }

  public start() {
    this.app.use(e.json({limit: "50mb"})); 
    this.app.use("/resources", e.static("data"));
    this.app.use((req, res, next) => {
      console.log(`${req.method} ${req.path}`);
      next();
    });

    const authGroup = new AuthGroup();
    this.app.use(authGroup.path, authGroup.getRouter())

    const photosGroup = new PhotosGroup();
    this.app.use(photosGroup.path, photosGroup.getRouter());

    const userGroup = new UserGroup()
    this.app.use(userGroup.path, userGroup.getRouter());

    this.app.get("/", (_, res) => {
      res.send("Hello World");
    });
    
    this.io.on("connection", (socket) => {
      console.log("New client connected", socket.id);
    
      socket.on("joinRoom", async ({ roomId, participants }) => {
        socket.join(roomId);
        console.log(`Client ${socket.id} joined room ${roomId}`);

        let chat = await Chat.findOne({ participants: participants })
        if(!chat) {
          chat = new Chat({ roomId: roomId, participants: participants })
          await chat.save()
          console.log("Created new chat for room", roomId)
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
        })
        await newMessage.save()
        
        const chat = await Chat.findOne({roomId: roomId});
        if (chat) {
          chat.messages.push(new mongoose.Types.ObjectId(newMessage._id as string));
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
        `Server listening on ${this.address || Server.DEFAULT_ADDRESS}:${
          this.port
        }`
      );
    });
  }
}
