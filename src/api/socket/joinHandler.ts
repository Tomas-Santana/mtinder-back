import { Socket } from "socket.io";
import TwoWayMap from "../../helpers/twoWayMap";
import Chat from "../../database/models/chat";
import { JwtUser } from "../../types/api/jwtPayload";

export async function joinHandler(socket: Socket) {
  const user = socket.data.user as JwtUser;

  const chats = await Chat.find({ participants: user.id });

  if (!chats) {
    return;
  }
  chats.forEach((chat) => {
    socket.join(chat.id);
  });
}