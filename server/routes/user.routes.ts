import { Router } from "express";

import {
    getUser,
    updateUser,
} from "../controllers/user.controller";

import { protect } from "../middleware/auth.middleware";

const router = Router();

// Get Logged-in User
router.get("/", protect, getUser);

// Update Logged-in User
router.put("/", protect, updateUser);

export default router;