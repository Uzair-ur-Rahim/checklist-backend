import express from "express";
import { authenticateUser } from "@/middlewares/auth";
import {
  createCheckList,
  updateChecklistItem,
} from "@/controllers/checklistController";

const router = express.Router();

router.use(authenticateUser);

router.post("/:taskId", createCheckList);
router.patch("/:checklistId/item/:itemId", updateChecklistItem);

export default router;
