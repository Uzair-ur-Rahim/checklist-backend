import { Response } from "express";
import mongoose from "mongoose";
import asyncHandler from "express-async-handler";
import ApiError from "@/utils/ApiError";
import { AuthenticatedRequest } from "@/middlewares/auth";
import { Checklist, Task } from "@/models";
import { getPagination } from "@/utils";

export const createTask = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { title } = req.body;

    if (!title) throw new ApiError(400, "Title is required");

    const task = await Task.create({
      title,
      userId: req.userId,
    });

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      task,
    });
  }
);

export const getTask = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { taskId } = req.params;

    if (taskId) {
      const task = await Task.findById(taskId)
        .populate("checklists")
        .select("-__v");

      if (!task) {
        throw new ApiError(404, "No task found");
      }

      res.status(200).json({
        success: true,
        message: "Task fetched successfully",
        task,
      });
      return;
    }

    const { skip, limit, page } = getPagination(req);

    const [tasks, total] = await Promise.all([
      Task.find()
        .populate("checklists")
        .select("-__v")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      Task.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      message: "Tasks fetched successfully",
      tasks,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  }
);
