import { commentCreateResponse, commentSchema } from '@repo/schemas/comment';
import type { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import Comment from '../models/comment';
import Post from '../models/post';
import { normalizeComment } from '../utils/normalizations';
import { ZodError } from 'zod';

const commentController = {
  create: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const validationResult = commentSchema.safeParse(req.body);
      if (!validationResult.success) {
        const firstError =
          validationResult.error.errors[0]?.message || 'Invalid comment data';
        res.status(400).json(firstError);
        return;
      }
      const { authorId, postId, content } = validationResult.data;
      if (
        !mongoose.Types.ObjectId.isValid(authorId) ||
        !mongoose.Types.ObjectId.isValid(postId)
      ) {
        res.status(400).json('Invalid authorId or postId');
        return;
      }
      const post = await Post.findById(postId);
      if (!post) {
        res.status(404).json('Post not found');
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
        res.status(409).json('Duplicate comment entry');
        return;
      }
      if (error instanceof ZodError) {
        const firstError = error.errors[0]?.message || 'Invalid comment data';
        res.status(400).json(firstError);
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

export default commentController;
