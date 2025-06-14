import type { NextFunction, Request, Response } from 'express';
import mongoose, { Types } from 'mongoose';
import { ZodError } from 'zod';
import { type IPost, Post } from '../models';
import {
  postSchema,
  postCreateResponse,
  postResponse,
  postListResponse,
  postLikeResponse,
  postLikesListResponse,
  postErrorResponse,
} from '@repo/schemas/post';
import { normalizePost, normalizeUser } from '../utils/normalizations';

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
          data: normalizePost(savedPost),
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
        ((error as unknown) as { code: number }).code === 11000
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
          data: posts.map(normalizePost),
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
          data: normalizePost(post),
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
      const normalized = normalizePost(updatedPost);
      res.status(200).json(
        postLikeResponse.parse({
          success: true,
          message: `Post ${action} successfully`,
          data: {
            ...normalized,
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
            postId: post._id.toString(),
            likes: Array.isArray(post.likes)
              ? post.likes.map(normalizeUser)
              : [],
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

export default postController;
