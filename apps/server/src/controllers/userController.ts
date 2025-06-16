import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { User } from '../models';
import {
  loginSchema,
  registrationSchema,
  registrationResponse,
  loginResponse,
  userErrorResponse,
  publicUserSuccessResponse,
  publicUserSchema,
} from '@repo/schemas/user';
import { comparePassword, generateSalt, hashPassword } from '../utils/crypto';
import { generateToken } from '../utils/jwt';
import { success } from 'zod/v4';

const userController = {
  register: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const validationResult = registrationSchema.safeParse(req.body);
      if (!validationResult.success) {
        res.status(400).json(
          userErrorResponse.parse({
            success: false,
            message: 'Validation failed',
            errors: validationResult.error.errors,
          }),
        );
        return;
      }

      const { username, email, password, name, bio, profilePicture } =
        validationResult.data;

      const existingUser = await User.findOne({
        $or: [{ email: email }, { username: username }],
      });

      if (existingUser) {
        res.status(409).json(
          userErrorResponse.parse({
            success: false,
            message: 'User already exists with this email or username',
          }),
        );
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
      res.status(201).json(
        registrationResponse.parse({
          success: true,
          message: 'User registered successfully',
          userId: savedUser._id.toString(),
          username: savedUser.username,
          token: token,
        }),
      );
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 11000) {
        res.status(409).json(
          userErrorResponse.parse({
            success: false,
            message: 'User already exists with this email or username',
          }),
        );
        return;
      }

      if (error instanceof ZodError) {
        res.status(400).json(
          userErrorResponse.parse({
            success: false,
            message: 'Validation failed',
            errors: error.errors,
          }),
        );
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
        res.status(400).json(
          userErrorResponse.parse({
            success: false,
            message: 'Validation failed',
            errors: validationResult.error.errors,
          }),
        );
        return;
      }

      const { username, password } = validationResult.data;

      const user = await User.findOne({
        $or: [{ username: username }],
      });

      if (!user) {
        res.status(401).json(
          userErrorResponse.parse({
            success: false,
            message: 'Invalid credentials',
          }),
        );
        return;
      }

      if (!(await comparePassword(password, user.salt, user.password))) {
        res.status(401).json(
          userErrorResponse.parse({
            success: false,
            message: 'Invalid credentials',
          }),
        );
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
      res.status(200).json(
        loginResponse.parse({
          success: true,
          message: 'User logged in successfully',
          userId: user._id.toString(),
          username: user.username,
          token: token,
        }),
      );
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json(
          userErrorResponse.parse({
            success: false,
            message: 'Validation failed',
            errors: error.errors,
          }),
        );
        return;
      }

      next(error);
    }
  },

  getByUsername: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const usernameSchema = registrationSchema.shape.username;
      const parseResult = usernameSchema.safeParse(req.params.username);
      if (!parseResult.success) {
        res.status(400).json(
          userErrorResponse.parse({
            success: false,
            message: 'Invalid username',
            errors: parseResult.error.errors,
          }),
        );
        return;
      }

      const username = parseResult.data;
      const user = await User.findOne({ username });

      if (!user) {
        res.status(404).json(
          userErrorResponse.parse({
            success: false,
            message: 'User not found',
          }),
        );
        return;
      }

      res.status(200).json(
        publicUserSuccessResponse.parse({
          success: true,
          message: 'User found',
          user: publicUserSchema.parse({
            username: user.username,
            name: user.name,
            bio: user.bio || '',
            profilePicture: user.profilePicture || '',
          }),
        }),
      );
    } catch (error) {
      next(error);
    }
  },
};

export default userController;
