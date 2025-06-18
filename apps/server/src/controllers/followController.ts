import type { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Follow from '../models/follow';
import {
  toggleFollowRequest,
  toggleFollowResponse,
  followErrorResponse,
} from '@repo/schemas/follow';

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
        res.status(400).json(
          followErrorResponse.parse({
            success: false,
            message: 'Invalid user ID or request body',
            errors: validationResult.success
              ? undefined
              : validationResult.error.errors,
          }),
        );
        return;
      }
      const { targetUsername } = validationResult.data;
      // Find the target user by username
      const targetUser = await mongoose
        .model('User')
        .findOne({ username: targetUsername });
      if (!targetUser) {
        res.status(404).json(
          followErrorResponse.parse({
            success: false,
            message: 'Target user not found',
          }),
        );
        return;
      }
      const targetUserId = targetUser._id.toString();
      if (userId === targetUserId) {
        res.status(400).json(
          followErrorResponse.parse({
            success: false,
            message: 'Cannot follow yourself',
          }),
        );
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
      next(error);
    }
  },
};

export default followController;
