import mongoose from "mongoose";

export interface IMessage extends mongoose.Document {
  content: string;
  userId: string;
  timestamp: Date;
  rommId: string
}

interface MessageModel extends mongoose.Model<IMessage>{
  toJSON(): IMessage
  // Some methods that i cant think of right now
}

const MessageSchema = new mongoose.Schema({
  content: { type: String, required: true, ref: "Chat" },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  timestamp: { type: Date, default: Date.now },
  roomId: { type: String, required: true },
}, {
  methods: {
    toJSON(){
      return {
        _id: this._id,
        content: this.content,
        userId: this.userId,
        timestamp: this.timestamp,
        roomId: this.roomId,
      }
    }
  }
}
)

const Message = mongoose.model<IMessage, MessageModel>("Message", MessageSchema);

export default Message