import e from "express";
import type { RouterGroup } from "../../types/server/RouterGroup";
import { token } from "../middleware/token";
import { Server } from "socket.io";
import TwoWayMap from "../../helpers/twoWayMap";
import { requestMatch } from "./RequestMatch";
import { getMatchRequests } from "./getMatchRequests";

class MatchGroup implements RouterGroup {
  public path = "/match";
  public router = e.Router();
  private io: Server;
  private socketUsers: TwoWayMap<string, string>;

  constructor(io: Server, socketUsers: TwoWayMap<string, string>) {
    this.io = io;
    this.socketUsers = socketUsers;
  }

  getRouter(): e.Router {
    this.router.use(token);
    this.router.get("/", getMatchRequests);
    this.router.post("/request", (req, res) => {
      requestMatch(req, res, this.io, this.socketUsers);  
    });
    
    return this.router;
  }
}

export default MatchGroup;
