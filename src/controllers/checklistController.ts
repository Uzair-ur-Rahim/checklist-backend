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

    await Task.create({
      title,
      userId: req.userId,
    });

    res.status(201).json({
      success: true,
      message: "Task created successfully",
    });
  }
);

export const createCheckList = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { taskId } = req.params;
      const { name, items } = req.body;

      if (!name || !Array.isArray(items) || !taskId) {
        throw new ApiError(400, "Name, items, and taskId are required");
      }

      const [checkList] = await Checklist.create([{ name, items }], {
        session,
      });

      if (!checkList) {
        throw new ApiError(400, "Failed to Create Checklist");
      }

      const taskUpdate = await Task.findByIdAndUpdate(
        taskId,
        { $addToSet: { checklistIds: checkList._id } },
        { session }
      );

      if (!taskUpdate) {
        throw new ApiError(404, "Task not found");
      }

      await session.commitTransaction();
      session.endSession();

      res.status(201).json({
        success: true,
        message: "Checklist created successfully",
        checkList,
      });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
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

export const updateChecklistItem = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { checklistId, itemId } = req.params;
    const { isChecked } = req.body;

    // Validate ObjectId format
    if (
      !mongoose.Types.ObjectId.isValid(checklistId) ||
      !mongoose.Types.ObjectId.isValid(itemId)
    ) {
      throw new ApiError(400, "Invalid checklistId or itemId");
    }

    if (typeof isChecked !== "boolean") {
      throw new ApiError(400, "isChecked must be a boolean");
    }

    const checklist = await Checklist.findOneAndUpdate(
      { _id: checklistId, "items._id": itemId },
      { $set: { "items.$.isChecked": isChecked } },
      { new: true }
    );

    if (!checklist) {
      throw new ApiError(404, "Checklist or item not found");
    }

    const updatedItem = checklist.items.find(
      (item) => item._id.toString() === itemId
    );

    if (!updatedItem) {
      throw new ApiError(404, "Updated item not found");
    }

    res.status(200).json({
      success: true,
      message: "Checklist item updated successfully",
      updatedItem,
    });
  }
);
