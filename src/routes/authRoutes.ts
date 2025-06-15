import express from "express";
import { authenticateUser } from "@/middlewares/auth";
import { getProfile, loginUser, registerUser } from "@/controllers/authController";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser)

router.use(authenticateUser);

router.get("/getProfile", getProfile);

export default router;
