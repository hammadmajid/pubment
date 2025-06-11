import z from 'zod';

export const commentSchema = z.object({
  authorId: z.string(),
  postId: z.string(),
  content: z.string().min(1, 'Content is required'),
});
