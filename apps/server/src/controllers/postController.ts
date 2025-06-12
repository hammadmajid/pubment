import type { NextFunction, Request, Response } from 'express';
import mongoose, { Types } from 'mongoose';
import { ZodError } from 'zod';
import { type IPost, Post } from '../models';
import { postSchema } from '../schemas/postSchema';

const postController = {
  create: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      // Validate request body
      const validationResult = postSchema.safeParse(req.body);

      if (!validationResult.success) {
        const errors = validationResult.error.errors.map(
          (err) => `${err.path.join('.')}: ${err.message}`,
        );

        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors,
        });
        return;
      }

      const { authorId, content } = validationResult.data;

      // Validate ObjectId format
      if (!mongoose.Types.ObjectId.isValid(authorId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid author ID format',
        });
        return;
      }

      // Check if author exists (optional but recommended)
      const User = mongoose.model('User');
      const authorExists = await User.findById(authorId);
      if (!authorExists) {
        res.status(404).json({
          success: false,
          message: 'Author not found',
        });
        return;
      }

      // Create new post
      const newPost = new Post({
        author: authorId,
        content: content.trim(), // Ensure content is trimmed
      });

      const savedPost = await newPost.save();

      // Populate author information for response
      await savedPost.populate('author', 'username name profilePicture');

      res.status(201).json({
        success: true,
        message: 'Post created successfully',
        data: {
          _id: savedPost._id,
          content: savedPost.content,
          author: savedPost.author,
          likes: savedPost.likes,
          createdAt: savedPost.createdAt,
          updatedAt: savedPost.updatedAt,
        },
      });
    } catch (error) {
      console.error('Post creation error:', error);

      // Handle MongoDB validation errors
      if (error instanceof mongoose.Error.ValidationError) {
        const errors = Object.values(error.errors).map((err) => err.message);
        res.status(400).json({
          success: false,
          message: 'Database validation failed',
          errors: errors,
        });
        return;
      }

      // Handle MongoDB duplicate key errors
      if (
        error instanceof mongoose.Error &&
        error.name === 'MongoServerError' &&
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        (error as any).code === 11000
      ) {
        res.status(409).json({
          success: false,
          message: 'Duplicate entry detected',
        });
        return;
      }

      // Handle Zod errors (redundant but defensive)
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => err.message);
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors,
        });
        return;
      }

      // Pass other errors to error handling middleware
      next(error);
    }
  },

  // Additional controller methods you might want to add
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

      res.status(200).json({
        success: true,
        data: posts,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error('Get posts error:', error);
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
        res.status(400).json({
          success: false,
          message: 'Invalid post ID format',
        });
        return;
      }

      const post = await Post.findById(id).populate(
        'author',
        'username name profilePicture',
      );

      if (!post) {
        res.status(404).json({
          success: false,
          message: 'Post not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: post,
      });
    } catch (error) {
      console.error('Get post by ID error:', error);
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

      // Validate user is authenticated
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      // Validate post ID format
      if (!postId || !Types.ObjectId.isValid(postId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid post ID format',
        });
        return;
      }

      // Find the post
      const post: IPost | null = await Post.findById(postId);
      if (!post) {
        res.status(404).json({
          success: false,
          message: 'Post not found',
        });
        return;
      }

      // Check if user already liked the post
      const userObjectId = new Types.ObjectId(userId);
      const isLiked = (post.likes as Types.ObjectId[]).some((like) =>
        like.equals(userObjectId),
      );

      let updatedPost: IPost | null;
      let action: 'liked' | 'unliked';

      if (isLiked) {
        // Unlike the post
        updatedPost = (await Post.findByIdAndUpdate(
          postId,
          { $pull: { likes: userObjectId } },
          { new: true },
        ).populate('author', 'username name profilePicture')) as IPost | null;
        action = 'unliked';
      } else {
        // Like the post
        updatedPost = (await Post.findByIdAndUpdate(
          postId,
          { $addToSet: { likes: userObjectId } },
          { new: true },
        ).populate('author', 'username name profilePicture')) as IPost | null;
        action = 'liked';
      }

      // Handle case where update failed
      if (!updatedPost) {
        res.status(500).json({
          success: false,
          message: 'Failed to update post',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: `Post ${action} successfully`,
        data: {
          _id: updatedPost._id,
          content: updatedPost.content,
          author: updatedPost.author,
          likes: updatedPost.likes,
          likesCount: updatedPost.likes.length,
          isLikedByUser: action === 'liked',
          createdAt: updatedPost.createdAt,
          updatedAt: updatedPost.updatedAt,
        },
      });
    } catch (error) {
      console.error('Toggle like error:', error);
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
        res.status(400).json({
          success: false,
          message: 'Invalid post ID format',
        });
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
        res.status(404).json({
          success: false,
          message: 'Post not found',
        });
        return;
      }

      const totalLikes = await Post.findById(postId).select('likes');
      const total = totalLikes?.likes.length || 0;

      res.status(200).json({
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
      });
    } catch (error) {
      console.error('Get post likes error:', error);
      next(error);
    }
  },
};

export default postController;
