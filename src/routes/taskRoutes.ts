import express from "express";
import { authenticateUser } from "@/middlewares/auth";
import { createTask, getTask } from "@/controllers/checklistController";

const router = express.Router();

router.use(authenticateUser);

router.post("/", createTask);
router.get("/:taskId?", getTask);

export default router;
