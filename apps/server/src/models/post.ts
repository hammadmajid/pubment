import mongoose, { type Document, Schema } from 'mongoose';
import type { IUser } from './user';

// Define the interface for Post document
export interface IPost extends Document {
  content: string;
  author: IUser['_id'];
  likes: IUser['_id'][];
  createdAt: Date;
  updatedAt: Date;
}

// Create the Post schema
const PostSchema: Schema = new Schema(
  {
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  },
);

// Create and export the Post model
export default mongoose.model<IPost>('Post', PostSchema);
