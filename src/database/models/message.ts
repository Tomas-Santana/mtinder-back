import mongoose from "mongoose";

export interface IMessage extends mongoose.Document {
  content: string;
  contentType: "text" | "image"
  userId: string;
  timestamp: Date;
  chatId: string;
}

interface MessageModel extends mongoose.Model<IMessage>{
  toJSON(): IMessage
  // Some methods that i cant think of right now
  getChatMessages(chatId: string): Promise<IMessage[]>
}

const MessageSchema = new mongoose.Schema({
  content: { type: String, required: true, ref: "Chat" },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  timestamp: { type: Date, default: Date.now },
  chatId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat', required: true },
  contentType: { type: String, required: true }
}, {
  methods: {
    toJSON(){
      return {
        _id: this._id,
        content: this.content,
        userId: this.userId,
        timestamp: this.timestamp,
        chatId: this.chatId,
        contentType: this.contentType
      }
    }
  },
  statics: {
    getChatMessages(chatId: string): Promise<IMessage[]> {
      return this.find({ chatId })
    }
  }
}
)

const Message = mongoose.model<IMessage, MessageModel>("Message", MessageSchema);

export default Message