import z from 'zod';

// Request body for toggling follow/unfollow
export const toggleFollowRequest = z.object({
  targetUsername: z.string(),
});

// Response for toggle follow/unfollow
export const toggleFollowResponse = z.object({
  success: z.boolean(),
  message: z.string(),
});

// Response for list of users (followers/following)
export const userSummary = z.object({
  _id: z.string(),
  username: z.string(),
  name: z.string(),
  profilePicture: z.string().nullable().optional(),
});

export type UserSummary = z.infer<typeof userSummary>;

// Error response
export const followErrorResponse = z.string();
