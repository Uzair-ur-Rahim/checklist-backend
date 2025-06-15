import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import ApiError from "@/utils/ApiError";
import { User } from "@/models";
import { IUser } from "@/models/user";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET!;

export interface AuthenticatedRequest extends Request {
  userId?: string;
  dbUser?: IUser;
}

export const authenticateUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ApiError(401, "Unauthorized: No token provided");
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    req.userId = decoded.userId;

    const dbUser = await User.findById(decoded.userId).select("-password");
    if (!dbUser) {
      throw new ApiError(404, "User not found");
    }

    req.dbUser = dbUser;

    next();
  } catch (error) {
    console.error("Auth error:", error);
    next(new ApiError(401, "Unauthorized: Invalid or expired token"));
  }
};
