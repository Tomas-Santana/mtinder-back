import mongoose from "mongoose";

export interface IChat extends mongoose.Document {
  roomId:string;
  participants: mongoose.Schema.Types.ObjectId[];
  participantsInfo: {
    _id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  }[];
  messages: mongoose.Types.ObjectId[]
  lastMessage?: {
    message: string;
    senderName: string;
    timestamp: Date;
  };
}

export interface ChatModel extends mongoose.Model<IChat> {
  findChat(chatId: string): Promise<IChat | null>
  findAllChats(userId: string): Promise<IChat[] | null>
  findByUserId(userId: string): Promise<IChat[] | null>
  toJSON(): IChat
}

const ChatSchema = new mongoose.Schema({
  roomId: { type: String, required: true },
  participants: { type: [mongoose.Schema.Types.ObjectId], ref: "User", required: true },
  participantsInfo: {type: [{
    _id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    profilePicture: { type: String }
  }], required: true},
  messages: { type: [mongoose.Types.ObjectId], ref: "Message" },
  lastMessage: {
    message: { type: String, required: true },
    senderName: { type: String, required: true },
    timestamp: { type: Date, required: true }
  }
}, {
  methods: {
    toJSON(){
      return {
        _id: this._id,
        roomId: this.roomId,
        participants: this.participants,
        participantsInfo: this.participantsInfo,
        messages: this.messages
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
      return this.find({ participants: userId });
    }
  }
})

const Chat = mongoose.model<IChat, ChatModel>("Chat", ChatSchema)

export default Chat