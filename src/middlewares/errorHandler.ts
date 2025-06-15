import { Request, Response, NextFunction } from "express";
import ApiError from "@/utils/ApiError";

const errorHandler = (err: ApiError, req: Request, res: Response, next: NextFunction) => {
  console.error("Error:", err); // Log the error for debugging

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

export default errorHandler;
