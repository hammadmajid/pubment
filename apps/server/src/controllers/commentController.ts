import {
  commentCreateResponse,
  commentErrorResponse,
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
};

export default commentController;
