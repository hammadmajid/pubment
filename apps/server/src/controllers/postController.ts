import type { NextFunction, Request, Response } from 'express';
import mongoose, { Types } from 'mongoose';
import { ZodError } from 'zod';
import { type IPost, Post } from '../models';
import {
  postSchema,
  postData,
  postCreateResponse,
  postResponse,
  postListResponse,
  postLikeResponse,
  postLikesListResponse,
  postErrorResponse,
} from '@repo/schemas/post';

const postController = {
  create: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const validationResult = postSchema.safeParse(req.body);
      if (!validationResult.success) {
        res.status(400).json(
          postErrorResponse.parse({
            success: false,
            message: 'Validation failed',
            errors: validationResult.error.errors,
          }),
        );
        return;
      }
      const { authorId, content } = validationResult.data;
      if (!mongoose.Types.ObjectId.isValid(authorId)) {
        res.status(400).json(
          postErrorResponse.parse({
            success: false,
            message: 'Invalid author ID format',
          }),
        );
        return;
      }
      const User = mongoose.model('User');
      const authorExists = await User.findById(authorId);
      if (!authorExists) {
        res.status(404).json(
          postErrorResponse.parse({
            success: false,
            message: 'Author not found',
          }),
        );
        return;
      }
      const newPost = new Post({
        author: authorId,
        content: content.trim(),
      });
      const savedPost = await newPost.save();
      await savedPost.populate('author', 'username name profilePicture');
      res.status(201).json(
        postCreateResponse.parse({
          success: true,
          message: 'Post created successfully',
          data: savedPost,
        }),
      );
    } catch (error) {
      if (error instanceof mongoose.Error.ValidationError) {
        const errors = Object.values(error.errors).map((err) => err.message);
        res.status(400).json(
          postErrorResponse.parse({
            success: false,
            message: 'Database validation failed',
            errors: errors,
          }),
        );
        return;
      }
      if (
        error instanceof mongoose.Error &&
        error.name === 'MongoServerError' &&
        (error as { code: number }).code === 11000
      ) {
        res.status(409).json(
          postErrorResponse.parse({
            success: false,
            message: 'Duplicate entry detected',
          }),
        );
        return;
      }
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => err.message);
        res.status(400).json(
          postErrorResponse.parse({
            success: false,
            message: 'Validation failed',
            errors: errors,
          }),
        );
        return;
      }
      next(error);
    }
  },

  getAll: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const page = Number.parseInt(req.query.page as string) || 1;
      const limit = Number.parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;
      const posts = await Post.find()
        .populate('author', 'username name profilePicture')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      const total = await Post.countDocuments();
      res.status(200).json(
        postListResponse.parse({
          success: true,
          data: posts,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        }),
      );
    } catch (error) {
      next(error);
    }
  },

  getById: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json(
          postErrorResponse.parse({
            success: false,
            message: 'Invalid post ID format',
          }),
        );
        return;
      }
      const post = await Post.findById(id).populate(
        'author',
        'username name profilePicture',
      );
      if (!post) {
        res.status(404).json(
          postErrorResponse.parse({
            success: false,
            message: 'Post not found',
          }),
        );
        return;
      }
      res.status(200).json(
        postResponse.parse({
          success: true,
          data: post,
        }),
      );
    } catch (error) {
      next(error);
    }
  },

  toggleLike: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { postId } = req.params;
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json(
          postErrorResponse.parse({
            success: false,
            message: 'Authentication required',
          }),
        );
        return;
      }
      if (!postId || !Types.ObjectId.isValid(postId)) {
        res.status(400).json(
          postErrorResponse.parse({
            success: false,
            message: 'Invalid post ID format',
          }),
        );
        return;
      }
      const post: IPost | null = await Post.findById(postId);
      if (!post) {
        res.status(404).json(
          postErrorResponse.parse({
            success: false,
            message: 'Post not found',
          }),
        );
        return;
      }
      const userObjectId = new Types.ObjectId(userId);
      const isLiked = (post.likes as Types.ObjectId[]).some((like) =>
        like.equals(userObjectId),
      );
      let updatedPost: IPost | null;
      let action: 'liked' | 'unliked';
      if (isLiked) {
        updatedPost = (await Post.findByIdAndUpdate(
          postId,
          { $pull: { likes: userObjectId } },
          { new: true },
        ).populate('author', 'username name profilePicture')) as IPost | null;
        action = 'unliked';
      } else {
        updatedPost = (await Post.findByIdAndUpdate(
          postId,
          { $addToSet: { likes: userObjectId } },
          { new: true },
        ).populate('author', 'username name profilePicture')) as IPost | null;
        action = 'liked';
      }
      if (!updatedPost) {
        res.status(500).json(
          postErrorResponse.parse({
            success: false,
            message: 'Failed to update post',
          }),
        );
        return;
      }
      res.status(200).json(
        postLikeResponse.parse({
          success: true,
          message: `Post ${action} successfully`,
          data: {
            ...updatedPost.toObject(),
            likesCount: updatedPost.likes.length,
            isLikedByUser: action === 'liked',
          },
        }),
      );
    } catch (error) {
      next(error);
    }
  },

  getLikes: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { postId } = req.params;
      const page = Number.parseInt(req.query.page as string) || 1;
      const limit = Number.parseInt(req.query.limit as string) || 20;
      if (!mongoose.Types.ObjectId.isValid(postId)) {
        res.status(400).json(
          postErrorResponse.parse({
            success: false,
            message: 'Invalid post ID format',
          }),
        );
        return;
      }
      const post = await Post.findById(postId).populate({
        path: 'likes',
        select: 'username name profilePicture',
        options: {
          skip: (page - 1) * limit,
          limit: limit,
        },
      });
      if (!post) {
        res.status(404).json(
          postErrorResponse.parse({
            success: false,
            message: 'Post not found',
          }),
        );
        return;
      }
      const totalLikes = await Post.findById(postId).select('likes');
      const total = totalLikes?.likes.length || 0;
      res.status(200).json(
        postLikesListResponse.parse({
          success: true,
          data: {
            postId: post._id,
            likes: post.likes,
            totalLikes: total,
          },
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        }),
      );
    } catch (error) {
      next(error);
    }
  },
};

// Utility to convert Mongoose post(s) to plain object(s) with string _id fields
function normalizePost(post: unknown): Record<string, unknown> | undefined {
  if (!post) return post as undefined;
  let obj: Record<string, unknown>;
  if (
    typeof post === 'object' &&
    post !== null &&
    typeof (post as { toObject?: () => unknown }).toObject === 'function'
  ) {
    obj = (post as { toObject: () => unknown }).toObject() as Record<
      string,
      unknown
    >;
  } else {
    obj = post as Record<string, unknown>;
  }
  // Normalize author
  let author = obj.author;
  if (author && typeof author === 'object' && author !== null) {
    const authorObj = author as Record<string, unknown>;
    author = {
      ...(authorObj as Record<string, unknown>),
      _id:
        authorObj._id &&
        typeof authorObj._id === 'object' &&
        authorObj._id !== null &&
        'toString' in authorObj._id
          ? (authorObj._id as { toString: () => string }).toString()
          : authorObj._id,
    };
  }
  // Normalize likes
  let likes = obj.likes;
  if (Array.isArray(likes)) {
    likes = (likes as unknown[]).map((like) => {
      if (
        typeof like === 'object' &&
        like !== null &&
        '_id' in like &&
        typeof (like as Record<string, unknown>)._id === 'object' &&
        (like as Record<string, unknown>)._id !== null &&
        'toString' in (like as Record<string, unknown>)._id
      ) {
        return (
          (like as Record<string, unknown>)._id as { toString: () => string }
        ).toString();
      }
      return typeof like === 'object' && like !== null && 'toString' in like
        ? (like as { toString: () => string }).toString()
        : like;
    });
  }
  return {
    ...obj,
    _id:
      obj._id &&
      typeof obj._id === 'object' &&
      obj._id !== null &&
      'toString' in obj._id
        ? (obj._id as { toString: () => string }).toString()
        : obj._id,
    author,
    likes,
  };
}

export default postController;
