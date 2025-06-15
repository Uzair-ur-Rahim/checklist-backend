// import "module-alias/register";

import express, { Application, NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import ApiError from "@/utils/ApiError";
import errorHandler from "@/middlewares/errorHandler";
import routes from "@/routes";

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 8080;
const MONGO_URI = process.env.MONGO_URI as string;

// Middleware
app.use(express.json());
app.use(cors());


// Default Route
app.get("/", (req, res) => {
  res.send("App is working properly!");
});

// Main Routes
app.use("/api", routes);

app.use((req: Request, res: Response, next: NextFunction) => {
  throw new ApiError(404, "Double check your API route")
});

//  Global Error Handler
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1);
  });
