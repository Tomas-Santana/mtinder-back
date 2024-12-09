import { IChat } from "../database/models/chat"
import { jwtUser } from "./api/jwtPayload"

export interface ServerToClientEvents {
  newChat: (chat: IChat) => void
}
export interface SocketData {
  user: jwtUser
}