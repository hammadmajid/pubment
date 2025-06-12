import type { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Follow from '../models/follow';
import User from '../models/user';

const followController = {
  toggleFollow: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = req.user?.id;
      const { targetUserId } = req.body;

      if (!userId || !mongoose.Types.ObjectId.isValid(targetUserId)) {
        res.status(400).json({ success: false, message: 'Invalid user ID' });
        return;
      }
      if (userId === targetUserId) {
        res
          .status(400)
          .json({ success: false, message: 'Cannot follow yourself' });
        return;
      }

      const existing = await Follow.findOne({
        follower: userId,
        following: targetUserId,
      });
      if (existing) {
        await Follow.deleteOne({ _id: existing._id });
        res.status(200).json({ success: true, message: 'Unfollowed user' });
      } else {
        await Follow.create({ follower: userId, following: targetUserId });
        res.status(200).json({ success: true, message: 'Followed user' });
      }
    } catch (error) {
      next(error);
    }
  },

  getFollowing: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { userId } = req.params;
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        res.status(400).json({ success: false, message: 'Invalid user ID' });
        return;
      }
      const following = await Follow.find({ follower: userId })
        .populate('following', 'username name profilePicture')
        .sort({ createdAt: -1 });
      res.status(200).json({
        success: true,
        data: following.map((f) => f.following),
      });
    } catch (error) {
      next(error);
    }
  },

  getFollowers: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }
      const followers = await Follow.find({ following: userId })
        .populate('follower', 'username name profilePicture')
        .sort({ createdAt: -1 });
      res.status(200).json({
        success: true,
        data: followers.map((f) => f.follower),
      });
    } catch (error) {
      next(error);
    }
  },

  getFollowersOfUser: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { userId } = req.params;
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        res.status(400).json({ success: false, message: 'Invalid user ID' });
        return;
      }
      const followers = await Follow.find({ following: userId })
        .populate('follower', 'username name profilePicture')
        .sort({ createdAt: -1 });
      res.status(200).json({
        success: true,
        data: followers.map((f) => f.follower),
      });
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
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }
      const following = await Follow.find({ follower: userId })
        .populate('following', 'username name profilePicture')
        .sort({ createdAt: -1 });
      res.status(200).json({
        success: true,
        data: following.map((f) => f.following),
      });
    } catch (error) {
      next(error);
    }
  },
};

export default followController;
