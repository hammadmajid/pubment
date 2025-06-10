import { Router, type Router as RouterType } from 'express';
import { ZodError } from 'zod';
import { User } from '../models';
import { loginSchema, registrationSchema } from '../schemas/user';
import {
  comparePassword,
  generateSalt,
  hashPassword,
} from '../utils/crypto.ts';

const router: RouterType = Router();

router.post('/register', async (req, res) => {
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

    // Save user to a database
    const savedUser = await newUser.save();

    // Return success response (excluding password)
    const userResponse = {
      id: savedUser._id,
      username: savedUser.username,
      email: savedUser.email,
      name: savedUser.name,
      bio: savedUser.bio,
      profilePicture: savedUser.profilePicture,
      createdAt: savedUser.createdAt,
      updatedAt: savedUser.updatedAt,
    };

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: userResponse,
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

    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
    return;
  }
});

router.post('/login', async (req, res) => {
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

    if (await comparePassword(password, user.salt, user.password)) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
      return;
    }

    const userResponse = {
      id: user._id,
      username: user.username,
      email: user.email,
      name: user.name,
      bio: user.bio,
      profilePicture: user.profilePicture,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    res.status(201).json({
      success: true,
      message: 'User logged in successfully',
      user: userResponse,
    });
  } catch (error) {}
});

export default router;
