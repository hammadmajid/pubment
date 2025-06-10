import mongoose, { type Document, Schema } from 'mongoose';
import type { IUser } from './user';

// Define the interface for Follow document
export interface IFollow extends Document {
  follower: IUser['_id'];
  following: IUser['_id'];
  createdAt: Date;
}

// Create the Follow schema
const FollowSchema: Schema = new Schema(
  {
    follower: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    following: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Only add createdAt field
  },
);

// Add a compound index to ensure a user can only follow another user once
FollowSchema.index({ follower: 1, following: 1 }, { unique: true });

// Create and export the Follow model
export default mongoose.model<IFollow>('Follow', FollowSchema);
