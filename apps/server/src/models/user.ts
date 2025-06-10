import mongoose, { type Document, Schema } from 'mongoose';

// Define the interface for User document
export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  salt: string;
  name: string;
  bio?: string;
  profilePicture?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Create the User schema
const UserSchema: Schema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    salt: {
      type: String,
      required: true,
      minlength: 32,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    bio: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    profilePicture: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  },
);

export default mongoose.model<IUser>('User', UserSchema);
