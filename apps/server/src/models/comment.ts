import mongoose, { type Document, Schema } from 'mongoose';
import type { IPost } from './post';
import type { IUser } from './user';

// Define the interface for Comment document
export interface IComment extends Document {
  content: string;
  author: IUser['_id'];
  post: IPost['_id'];
  likes: IUser['_id'][];
  createdAt: Date;
  updatedAt: Date;
}

// Create the Comment schema
const CommentSchema: Schema = new Schema(
  {
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
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

// Create and export the Comment model
export default mongoose.model<IComment>('Comment', CommentSchema);
