import e from "express";
import type { RouterGroup } from "../../types/server/RouterGroup";
import { token } from "../middleware/token";
import { getChats } from "./GetChats";

class ChatGroup implements RouterGroup {
  public path = "/chat";
  public router = e.Router();

  getRouter(): e.Router {
    this.router.use(token);
    this.router.get("/", getChats);
    return this.router;
}
}

export default ChatGroup;