import mongoose from "mongoose";
import { IUser } from "./user";

export interface IChat extends mongoose.Document {
  participants: mongoose.Schema.Types.ObjectId[];
  messages: mongoose.Types.ObjectId[]
  lastMessage?: {
    message: string;
    timestamp: Date;
    senderId: string
  };
}

export interface ChatModel extends mongoose.Model<IChat> {
  findChat(chatId: string): Promise<IChat | null>
  findAllChats(userId: string): Promise<IChat[] | null>
  findByUserId(userId: string): Promise<IChat[] | null>
  toJSON(): IChat
}

const ChatSchema = new mongoose.Schema({
  participants: { type: [mongoose.Schema.Types.ObjectId], ref: "User", required: true },
  messages: { type: [mongoose.Types.ObjectId], ref: "Message" },
  lastMessage: {
    message: { type: String, required: true },
    timestamp: { type: Date, required: true },
    senderId: { type: String, required: true }
  }
}, {
  methods: {
    toJSON(){
      return {
        _id: this._id,
        participants: this.participants,
        messages: this.messages,
        lastMessage: this.lastMessage
      }
    }, 
  }, statics: {
    findChat(chatId: string): Promise<IChat | null> {
      return this.findById(chatId);
    },
    findAllChats(userId: string): Promise<IChat[] | null> {
      return this.find({ participants: userId });
    },
    findByUserId(userId: string): Promise<IChat[] | null> {
      return this.find({ participants: userId }).populate("participants") as unknown as Promise<IChat[] | null>;
    }
  }
})

const Chat = mongoose.model<IChat, ChatModel>("Chat", ChatSchema)

export default Chat