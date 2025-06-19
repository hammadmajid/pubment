import {
  commentCreateResponse,
  commentErrorResponse,
  commentListResponse,
  commentResponse,
  commentSchema,
} from '@repo/schemas/comment';
import type { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import Comment from '../models/comment';
import Post from '../models/post';
import { normalizeComment } from '../utils/normalizations';

const commentController = {
  create: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const validationResult = commentSchema.safeParse(req.body);
      if (!validationResult.success) {
        res.status(400).json(
          commentErrorResponse.parse({
            success: false,
            message: 'Invalid input',
            errors: validationResult.error.errors,
          }),
        );
        return;
      }
      const { authorId, postId, content } = validationResult.data;
      if (
        !mongoose.Types.ObjectId.isValid(authorId) ||
        !mongoose.Types.ObjectId.isValid(postId)
      ) {
        res.status(400).json(
          commentErrorResponse.parse({
            success: false,
            message: 'Invalid authorId or postId',
          }),
        );
        return;
      }
      const post = await Post.findById(postId);
      if (!post) {
        res.status(404).json(
          commentErrorResponse.parse({
            success: false,
            message: 'Post not found',
          }),
        );
        return;
      }
      const newComment = new Comment({
        author: authorId,
        post: postId,
        content: content.trim(),
      });
      const savedComment = await newComment.save();
      await savedComment.populate('author', 'username name profilePicture');
      res.status(201).json(
        commentCreateResponse.parse({
          success: true,
          message: 'Comment created successfully',
          data: normalizeComment(savedComment),
        }),
      );
      return;
    } catch (error) {
      next(error);
    }
  },

  getByPostId: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { postId } = req.params;
      if (!mongoose.Types.ObjectId.isValid(postId)) {
        res.status(400).json(
          commentErrorResponse.parse({
            success: false,
            message: 'Invalid postId',
          }),
        );
        return;
      }
      const comments = await Comment.find({ post: postId })
        .populate('author', 'username name profilePicture')
        .sort({ createdAt: -1 });
      res.status(200).json(
        commentListResponse.parse({
          success: true,
          data: comments.map(normalizeComment),
        }),
      );
      return;
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
          commentErrorResponse.parse({
            success: false,
            message: 'Invalid comment id',
          }),
        );
        return;
      }
      const comment = await Comment.findById(id).populate(
        'author',
        'username name profilePicture',
      );
      if (!comment) {
        res.status(404).json(
          commentErrorResponse.parse({
            success: false,
            message: 'Comment not found',
          }),
        );
        return;
      }
      res.status(200).json(
        commentResponse.parse({
          success: true,
          data: normalizeComment(comment),
        }),
      );
      return;
    } catch (error) {
      next(error);
    }
  },
};

export default commentController;
