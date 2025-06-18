import type { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Follow from '../models/follow';
import {
  toggleFollowRequest,
  toggleFollowResponse,
  userListResponse,
  followErrorResponse,
} from '@repo/schemas/follow';
import { normalizeUser } from '../utils/normalizations';

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
        res.status(400).json(followErrorResponse.parse({
          success: false,
          message: 'Invalid user ID or request body',
          errors: validationResult.success ? undefined : validationResult.error.errors,
        }));
        return;
      }
      const { targetUserId } = validationResult.data;
      if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
        res.status(400).json(followErrorResponse.parse({
          success: false,
          message: 'Invalid target user ID',
        }));
        return;
      }
      if (userId === targetUserId) {
        res.status(400).json(followErrorResponse.parse({
          success: false,
          message: 'Cannot follow yourself',
        }));
        return;
      }
      const existing = await Follow.findOne({
        follower: userId,
        following: targetUserId,
      });
      if (existing) {
        await Follow.deleteOne({ _id: existing._id });
        res.status(200).json(toggleFollowResponse.parse({
          success: true,
          message: 'Unfollowed user',
        }));
      } else {
        await Follow.create({ follower: userId, following: targetUserId });
        res.status(200).json(toggleFollowResponse.parse({
          success: true,
          message: 'Followed user',
        }));
      }
    } catch (error) {
      next(error);
    }
  },

  getFollowingByUserId: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { userId } = req.params;
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        res.status(400).json(followErrorResponse.parse({
          success: false,
          message: 'Invalid user ID',
        }));
        return;
      }
      const following = await Follow.find({ follower: userId })
        .populate('following', 'username name profilePicture')
        .sort({ createdAt: -1 });
      res.status(200).json(userListResponse.parse({
        success: true,
        data: following.map((f) => normalizeUser(f.following)),
      }));
    } catch (error) {
      next(error);
    }
  },

  getFollowersOfCurrentUser: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json(followErrorResponse.parse({
          success: false,
          message: 'Unauthorized',
        }));
        return;
      }
      const followers = await Follow.find({ following: userId })
        .populate('follower', 'username name profilePicture')
        .sort({ createdAt: -1 });
      res.status(200).json(userListResponse.parse({
        success: true,
        data: followers.map((f) => normalizeUser(f.follower)),
      }));
    } catch (error) {
      next(error);
    }
  },

  getFollowersByUserId: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { userId } = req.params;
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        res.status(400).json(followErrorResponse.parse({
          success: false,
          message: 'Invalid user ID',
        }));
        return;
      }
      const followers = await Follow.find({ following: userId })
        .populate('follower', 'username name profilePicture')
        .sort({ createdAt: -1 });
      res.status(200).json(userListResponse.parse({
        success: true,
        data: followers.map((f) => normalizeUser(f.follower)),
      }));
    } catch (error) {
      next(error);
    }
  },

  getFollowingOfCurrentUser: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json(followErrorResponse.parse({
          success: false,
          message: 'Unauthorized',
        }));
        return;
      }
      const following = await Follow.find({ follower: userId })
        .populate('following', 'username name profilePicture')
        .sort({ createdAt: -1 });
      res.status(200).json(userListResponse.parse({
        success: true,
        data: following.map((f) => normalizeUser(f.following)),
      }));
    } catch (error) {
      next(error);
    }
  },
};

export default followController;
