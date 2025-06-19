import z from 'zod';
import { commentData } from './comment.js';

export const postSchema = z.object({
  authorId: z.string(),
  content: z.string().min(1, 'Content is required'),
});

// Post data with populated author fields
export const postData = z.object({
  _id: z.string(),
  content: z.string(),
  author: z.object({
    _id: z.string(),
    username: z.string(),
    name: z.string(),
    profilePicture: z.string().nullable().optional(),
  }),
  likes: z.array(z.string()),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const postCreateResponse = z.object({
  success: z.literal(true),
  message: z.string(),
  data: postData,
});

export const postResponse = z.object({
  success: z.literal(true),
  data: z.object({
    post: postData,
    comments: z.array(commentData),
  }),
});

export const postListResponse = z.object({
  success: z.literal(true),
  data: z.array(postData),
  pagination: z
    .object({
      page: z.number(),
      limit: z.number(),
      total: z.number(),
      pages: z.number(),
    })
    .optional(),
});

export const postLikeResponse = z.object({
  success: z.literal(true),
  message: z.string(),
  data: postData.extend({
    likesCount: z.number(),
    isLikedByUser: z.boolean(),
  }),
});

export const postLikesListResponse = z.object({
  success: z.literal(true),
  data: z.object({
    postId: z.string(),
    likes: z.array(
      z.object({
        _id: z.string(),
        username: z.string(),
        name: z.string(),
        profilePicture: z.string().nullable().optional(),
      }),
    ),
    totalLikes: z.number(),
  }),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    pages: z.number(),
  }),
});

export const postErrorResponse = z.string();
