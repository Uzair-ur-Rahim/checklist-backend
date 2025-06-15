import { Router } from "express";
import authRoutes from "@/routes/authRoutes";
import taskRoutes from "@/routes/taskRoutes";
import checklistRoutes from "@/routes/checklistRoutes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/task", taskRoutes);
router.use("/checklist", checklistRoutes)


export default router;
