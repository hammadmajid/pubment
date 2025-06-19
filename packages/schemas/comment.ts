import z from 'zod';

export const commentSchema = z.object({
  authorId: z.string(),
  postId: z.string(),
  content: z.string().min(1, 'Content is required'),
});

export const commentData = z.object({
  _id: z.string(),
  author: z.object({
    _id: z.string(),
    username: z.string(),
    name: z.string(),
    profilePicture: z.string().nullable().optional(),
  }),
  post: z.string(),
  content: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const commentCreateResponse = z.object({
  success: z.literal(true),
  message: z.string(),
  data: commentData,
});

export const commentResponse = z.object({
  success: z.literal(true),
  data: commentData,
});

export const commentListResponse = z.object({
  success: z.literal(true),
  data: z.array(commentData),
});

export const commentErrorResponse = z.string();
