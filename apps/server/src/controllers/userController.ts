import {
  loginResponse,
  loginSchema,
  publicUserSchema,
  publicUserSuccessResponse,
  registrationResponse,
  registrationSchema,
} from '@repo/schemas/user';
import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { User } from '../models';
import Follow from '../models/follow';
import Post from '../models/post';
import { comparePassword, generateSalt, hashPassword } from '../utils/crypto';
import { generateToken } from '../utils/jwt';
import { normalizePost, normalizeUser } from '../utils/normalizations';

const userController = {
  register: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const validationResult = registrationSchema.safeParse(req.body);
      if (!validationResult.success) {
        const firstError = validationResult.error.errors[0]?.message || 'Invalid registration data';
        res.status(400).json(firstError);
        return;
      }

      const { username, email, password, name, bio, profilePicture } =
        validationResult.data;

      const existingUser = await User.findOne({
        $or: [{ email: email }, { username: username }],
      });

      if (existingUser) {
        res.status(409).json('User already exists with this email or username');
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
        res.status(409).json('User already exists with this email or username');
        return;
      }

      if (error instanceof ZodError) {
        const firstError = error.errors[0]?.message || 'Invalid registration data';
        res.status(400).json(firstError);
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
        const firstError = validationResult.error.errors[0]?.message || 'Invalid login data';
        res.status(400).json(firstError);
        return;
      }

      const { username, password } = validationResult.data;

      const user = await User.findOne({
        $or: [{ username: username }],
      });

      if (!user) {
        res.status(401).json('Invalid credentials');
        return;
      }

      if (!(await comparePassword(password, user.salt, user.password))) {
        res.status(401).json('Invalid credentials');
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
        const firstError = error.errors[0]?.message || 'Invalid login data';
        res.status(400).json(firstError);
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
        const firstError = parseResult.error.errors[0]?.message || 'Invalid username';
        res.status(400).json(firstError);
        return;
      }

      const username = parseResult.data;
      const user = await User.findOne({ username });

      if (!user) {
        res.status(404).json('User not found');
        return;
      }

      // Fetch followers (users who follow this user)
      const followersDocs = await Follow.find({ following: user._id }).populate(
        'follower',
      );
      const followers = followersDocs.map((f) => normalizeUser(f.follower));

      // Fetch following (users this user follows)
      const followingDocs = await Follow.find({ follower: user._id }).populate(
        'following',
      );
      const following = followingDocs.map((f) => normalizeUser(f.following));

      // Fetch posts by this user
      const postsDocs = await Post.find({ author: user._id })
        .populate('author')
        .sort({ createdAt: -1 });
      const posts = postsDocs.map((post) => normalizePost(post));

      res.status(200).json(
        publicUserSuccessResponse.parse({
          success: true,
          message: 'User found',
          user: publicUserSchema.parse({
            username: user.username,
            name: user.name,
            bio: user.bio || '',
            profilePicture: user.profilePicture || '',
            followers,
            following,
            posts,
          }),
        }),
      );
    } catch (error) {
      next(error);
    }
  },
};

export default userController;
