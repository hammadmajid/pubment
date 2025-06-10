import { z } from 'zod';

// Username validation regex: starts with a lowercase letter, can contain lowercase letters, numbers, underscore, dot
const usernameRegex = /^[a-z][a-z0-9._]*$/;

// Password validation regex: at least one uppercase, one lowercase, one number, one special character
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;

export const accountFormSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name must not exceed 50 characters')
    .trim(),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must not exceed 50 characters')
    .trim(),
  email: z.string().email('Please provide a valid email address').toLowerCase(),
  username: z
    .string()
    .min(4, 'Username must be at least 4 characters long')
    .max(20, 'Username must not exceed 20 characters')
    .regex(
      usernameRegex,
      'Username must start with a lowercase letter and can only contain lowercase letters, numbers, underscores, and dots',
    ),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(
      passwordRegex,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)',
    ),
});

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

export const loginSchema = z.object({
  username: z.string().min(1, 'Username or email is required'),
  password: z.string().min(1, 'Password is required'),
});

// Type exports for TypeScript
export type AccountFormData = z.infer<typeof accountFormSchema>;
export type RegistrationData = z.infer<typeof registrationSchema>;
export type LoginData = z.infer<typeof loginSchema>;
