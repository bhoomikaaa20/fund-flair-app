import { Router } from "express";
import upload from "../config/multer";
import {
    getProfile,
    updateProfile,
    changePassword,
    uploadAvatar,
} from "../controllers/profile.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();

// Get Logged-in User Profile
router.get("/", protect, getProfile);

// Update Profile
router.put("/", protect, updateProfile);

// Change Password
router.put("/password", protect, changePassword);

// Upload Profile Picture
router.post(
    "/avatar",
    protect,
    upload.single("avatar"),
    uploadAvatar
);

export default router;