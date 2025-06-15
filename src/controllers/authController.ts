import { Request, Response, NextFunction } from "express";
import asyncHandler from "express-async-handler";
import dotenv from "dotenv";
import { User } from "@/models";
import ApiError from "@/utils/ApiError";
import { AuthenticatedRequest } from "@/middlewares/auth";
import { LoginSchema, RegisterSchema } from "@/validations";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

dotenv.config();

export const registerUser = asyncHandler(
  async (req: Request, res: Response) => {
    const { email, name, password } = req.body;

    try {
      await RegisterSchema.validate({ email, name, password });
    } catch (validationError: any) {
      throw new ApiError(400, validationError.message || "Validation failed");
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ApiError(400, "User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ name, email, password: hashedPassword });

    res.status(201).json({
      success: true,
      message: "User registered successfully.",
    });
  }
);

export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    await LoginSchema.validate({ email, password });
  } catch (validationError: any) {
    throw new ApiError(400, validationError.message || "Validation failed");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(401, "Invalid credentials");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new ApiError(401, "Invalid credentials");
  }

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, {
    expiresIn: "1d",
  });

  res.status(200).json({
    success: true,
    message: "Logged in successfully.",
    data: {
      token,
    },
  });
});

export const getProfile = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const user = await User.findById(req.userId).select("-password");

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    res.status(200).json({
      success: true,
      message: "User profile retrieved successfully",
      user,
    });
  }
);
