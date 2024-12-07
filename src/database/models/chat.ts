import mongoose from "mongoose";

export interface IChat extends mongoose.Document {
  roomId:string;
  participants: mongoose.Schema.Types.ObjectId[];
  messages: mongoose.Types.ObjectId[]
}

export interface ChatModel extends mongoose.Model<IChat> {
  findChat(chatId: string): Promise<IChat | null>
  findAllChats(userId: string): Promise<IChat[] | null>
  toJSON(): IChat
}

const ChatSchema = new mongoose.Schema({
  roomId: { type: String, required: true },
  participants: { type: [mongoose.Schema.Types.ObjectId], ref: "User", required: true },
  messages: { type: [mongoose.Types.ObjectId], ref: "Message" }
}, {
  methods: {
    toJSON(){
      return {
        _id: this._id,
        roomId: this.roomId,
        participants: this.participants,
        messages: this.messages
      }
    }, 
  }, statics: {
    findChat(chatId: string): Promise<IChat | null> {
      return this.findById(chatId);
    },
    findAllChats(userId: string): Promise<IChat[] | null> {
      return this.find({ participants: userId });
    }
  }
})

const Chat = mongoose.model<IChat, ChatModel>("Chat", ChatSchema)

export default Chat