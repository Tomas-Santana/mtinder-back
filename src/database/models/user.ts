import mongoose from "mongoose";

export interface IUser extends mongoose.Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  imageUrls?: string
  profileReady?: boolean;
}

interface UserModel extends mongoose.Model<IUser> {
  findByEmail(email: string): Promise<IUser | null>;
  toJSON(): Omit<IUser, "password">;
}

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    profileReady: { type: Boolean, default: false },
    imageUrls: { type: [String], default: [] },
  },
  {
    methods: {
      toJSON() {  
        return {
          _id: this._id,
          email: this.email,
          firstName: this.firstName,
          lastName: this.lastName,
          imageUrls: this.imageUrls,
          profileReady: this.profileReady,
        };
      },
    },
    statics: {
      findByEmail: function (email: string) {
        return this.findOne({ email });
      },
    },
    virtuals: {
      fullName: {
        get() {
          return `${this.firstName} ${this.lastName}`;
        },
      }
    },
  }
);

const User = mongoose.model<IUser, UserModel>("User", UserSchema);

export default User;