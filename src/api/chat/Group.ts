import e from "express";
import type { RouterGroup } from "../../types/server/RouterGroup";
import { token } from "../middleware/token";
import { getChats } from "./GetChats";
import { deleteChat } from "./DeleteChat";
import { getMessages } from "./GetMessages";
import { sendMessage } from "./SendMessage";
import { Server } from "socket.io";
import { FirebaseFS } from "../../storage/FirebaseFS";

class ChatGroup implements RouterGroup {
  public path = "/chat";
  public router = e.Router();
  private io: Server;

  constructor(io: Server) {
    this.io = io;

  }

  getRouter(): e.Router {
    const fs = new FirebaseFS();
    this.router.use(token);
    this.router.get("/", getChats);
    this.router.delete("/:id", 
      (req, res) => {
        deleteChat(req, res, this.io);
      }
    );
    this.router.get("/:chatId/messages", getMessages);
    this.router.post("/:chatId/messages", 
      (req, res) => {
        sendMessage(req, res, this.io, fs);
      }
    );
    return this.router;
  }
}

export default ChatGroup;
