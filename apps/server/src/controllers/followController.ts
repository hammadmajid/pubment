import {
  followErrorResponse,
  toggleFollowRequest,
  toggleFollowResponse,
} from '@repo/schemas/follow';
import type { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import Follow from '../models/follow';

const followController = {
  toggleFollow: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = req.user?.id;
      const validationResult = toggleFollowRequest.safeParse(req.body);
      if (!userId || !validationResult.success) {
        const firstError = validationResult.success
          ? 'Invalid user ID'
          : validationResult.error.errors[0]?.message || 'Invalid request body';
        res.status(400).json(firstError);
        return;
      }
      const { targetUsername } = validationResult.data;
      // Find the target user by username
      const targetUser = await mongoose
        .model('User')
        .findOne({ username: targetUsername });
      if (!targetUser) {
        res.status(404).json('Target user not found');
        return;
      }
      const targetUserId = targetUser._id.toString();
      if (userId === targetUserId) {
        res.status(400).json('Cannot follow yourself');
        return;
      }
      const existing = await Follow.findOne({
        follower: userId,
        following: targetUserId,
      });
      if (existing) {
        await Follow.deleteOne({ _id: existing._id });
        res.status(200).json(
          toggleFollowResponse.parse({
            success: true,
            message: 'Unfollowed user',
          }),
        );
      } else {
        await Follow.create({ follower: userId, following: targetUserId });
        res.status(200).json(
          toggleFollowResponse.parse({
            success: true,
            message: 'Followed user',
          }),
        );
      }
    } catch (error) {
      if (error instanceof mongoose.Error.ValidationError) {
        const errors = Object.values(error.errors).map(
          (err: { message: string }) => err.message,
        );
        res.status(400).json(errors[0] || 'Database validation failed');
        return;
      }
      if (
        error instanceof Error &&
        'code' in error &&
        (error as unknown as { code: number }).code === 11000
      ) {
        res.status(409).json('Duplicate follow entry');
        return;
      }
      if (error instanceof Error) {
        res.status(400).json(error.message || 'Unknown error');
        return;
      }
      next(error);
    }
  },
};

export default followController;
