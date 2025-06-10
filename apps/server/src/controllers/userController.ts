import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { User } from '../models';
import { loginSchema, registrationSchema } from '../schemas/userSchema.ts';
import { comparePassword, generateSalt, hashPassword } from '../utils/crypto';
import { generateToken } from '../utils/jwt';

const userController = {
  register: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const validationResult = registrationSchema.safeParse(req.body);

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

      const { username, email, password, name, bio, profilePicture } =
        validationResult.data;

      const existingUser = await User.findOne({
        $or: [{ email: email }, { username: username }],
      });

      if (existingUser) {
        res.status(409).json({
          success: false,
          message: 'User already exists with this email or username',
        });
        return;
      }

      const salt = generateSalt();
      const hashedPassword = await hashPassword(password, salt);

      const newUser = new User({
        username: username,
        email: email,
        password: hashedPassword,
        salt: salt,
        name: name,
        bio: bio || '',
        profilePicture: profilePicture || '',
      });

      // Save userController to a database
      const savedUser = await newUser.save();

      // Generate JWT token
      const token = generateToken(savedUser);

      // Set token as an HTTP-only cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      });

      // Return success response with a token
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        token: token,
      });
    } catch (error) {
      console.error('Registration error:', error);

      if (error instanceof Error && 'code' in error && error.code === 11000) {
        res.status(409).json({
          success: false,
          message: 'User already exists with this email or username',
        });
        return;
      }

      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: Object.values(error.errors.map((err) => err.message)).join(),
        });
        return;
      }

      next(error);
    }
  },

  login: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const validationResult = loginSchema.safeParse(req.body);

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

      const { username, password } = validationResult.data;

      const user = await User.findOne({
        $or: [{ username: username }],
      });

      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Invalid credentials',
        });
        return;
      }

      if (!(await comparePassword(password, user.salt, user.password))) {
        res.status(401).json({
          success: false,
          message: 'Invalid credentials',
        });
        return;
      }

      // Generate JWT token
      const token = generateToken(user);

      // Set token as an HTTP-only cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      });

      // Return success response with a token
      res.status(200).json({
        success: true,
        message: 'User logged in successfully',
        token: token,
      });
    } catch (error) {
      console.error('Login error:', error);

      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: Object.values(error.errors.map((err) => err.message)).join(),
        });
        return;
      }

      next(error);
    }
  },
};

export default userController;
