import e from "express";
import type { RouterGroup } from "../../types/server/RouterGroup";
import { token } from "../middleware/token";
import { getChats } from "./GetChats";
import { getMessages } from "./GetMessages";
import { sendMessage } from "./SendMessage";
import { Server } from "socket.io";

class ChatGroup implements RouterGroup {
  public path = "/chat";
  public router = e.Router();
  private io: Server;

  constructor(io: Server) {
    this.io = io;
  }

  getRouter(): e.Router {
    this.router.use(token);
    this.router.get("/", getChats);
    this.router.get("/:chatId/messages", getMessages);
    this.router.post("/:chatId/messages", 
      (req, res) => {
        sendMessage(req, res, this.io);
      }
    );
    return this.router;
  }
}

export default ChatGroup;