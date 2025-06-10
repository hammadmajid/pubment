import z from 'zod';

export const postSchema = z.object({
  authorId: z.string(),
  content: z.string().min(1, 'Content is required'),
  image: z.string().url('Image must be a valid URL').optional(),
});
