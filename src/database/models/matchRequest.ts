import mongoose from "mongoose";

export interface IMatchRequest extends mongoose.Document {
  from: mongoose.Schema.Types.ObjectId;
  to: mongoose.Schema.Types.ObjectId;
  status: "pending" | "accepted" 
}

interface MatchRequestModel extends mongoose.Model<IMatchRequest>{
  toJSON(): IMatchRequest
}

const MatchRequestSchema = new mongoose.Schema({
  from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  to: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, required: true, default: "pending" }
}, {
  methods: {
    toJSON(){
      return {
        _id: this._id,
        from: this.from,
        to: this.to,
        status: this.status
      }
    }
  }
}
)

const MatchRequest = mongoose.model<IMatchRequest, MatchRequestModel>("MatchRequest", MatchRequestSchema);

export default MatchRequest