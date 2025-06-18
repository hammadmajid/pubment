import { z } from 'zod';
import { userSummary } from './follow.js';
import { postData } from './post.js';

// Username validation regex: starts with a lowercase letter, can contain lowercase letters, numbers, underscore, dot
const usernameRegex = /^[a-z][a-z0-9._]*$/;

// Password validation regex: at least one uppercase, one lowercase, one number, one special character
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;

export const registrationSchema = z.object({
  username: z
    .string()
    .min(4, 'Username must be at least 4 characters long')
    .max(20, 'Username must not exceed 20 characters')
    .regex(
      usernameRegex,
      'Username must start with a lowercase letter and can only contain lowercase letters, numbers, underscores, and dots',
    ),
  email: z.string().email('Please provide a valid email address').toLowerCase(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(
      passwordRegex,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)',
    ),
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must not exceed 100 characters')
    .trim(),
  bio: z
    .string()
    .max(500, 'Bio must not exceed 500 characters')
    .trim()
    .optional(),
  profilePicture: z
    .string()
    .url('Profile picture must be a valid URL')
    .optional()
    .or(z.literal('')),
});

export const registrationResponse = z.object({
  success: z.boolean(),
  message: z.string(),
  userId: z.string(),
  username: z.string(),
  token: z.string(),
});

export const loginSchema = z.object({
  username: z.string().min(1, 'Username or email is required'),
  password: z.string().min(1, 'Password is required'),
});

export const loginResponse = z.object({
  success: z.boolean(),
  message: z.string(),
  userId: z.string(),
  username: z.string(),
  token: z.string(),
});

export const userIdRequest = z.object({
  userId: z.string(),
});

export const userErrorResponse = z.object({
  success: z.literal(false),
  message: z.string(),
  errors: z.array(z.any()).optional(),
});

export const publicUserSchema = z.object({
  username: registrationSchema.shape.username,
  name: registrationSchema.shape.name,
  bio: registrationSchema.shape.bio.default(''),
  profilePicture: registrationSchema.shape.profilePicture.default(''),
  followers: z.array(userSummary),
  following: z.array(userSummary),
  posts: z.array(postData),
});

export const publicUserSuccessResponse = z.object({
  success: z.literal(true),
  message: z.string(),
  user: publicUserSchema,
});

// Type exports for TypeScript
export type RegistrationData = z.infer<typeof registrationSchema>;
export type RegistrationResponse = z.infer<typeof registrationResponse>;
export type LoginData = z.infer<typeof loginSchema>;
export type LoginResponse = z.infer<typeof loginResponse>;
export type UserIdRequest = z.infer<typeof userIdRequest>;
export type UserErrorResponse = z.infer<typeof userErrorResponse>;
export type UserSuccessResponse = z.infer<typeof publicUserSuccessResponse>;
export type PublicUser = z.infer<typeof publicUserSchema>;
