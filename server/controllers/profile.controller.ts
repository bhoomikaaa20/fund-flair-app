import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User";

// ==============================
// Get Logged-in User Profile
// ==============================
export const getProfile = async (req: any, res: Response) => {
    try {
        const user = await User.findById(req.user._id).select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({
            message: "Server Error",
        });
    }
};

// ==============================
// Update Profile
// ==============================
export const updateProfile = async (req: any, res: Response) => {
    try {
        const { fullName, phone } = req.body;

        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            {
                fullName,
                phone,
            },
            {
                new: true,
            }
        ).select("-password");

        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({
            message: "Unable to update profile",
        });
    }
};

// ==============================
// Change Password
// ==============================
export const changePassword = async (req: any, res: Response) => {
    try {
        const { password } = req.body;

        if (password.length < 6) {
            return res.status(400).json({
                message: "Password should be at least 6 characters",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await User.findByIdAndUpdate(req.user._id, {
            password: hashedPassword,
        });

        res.status(200).json({
            message: "Password updated successfully",
        });
    } catch (error) {
        res.status(500).json({
            message: "Unable to update password",
        });
    }
};

// ==============================
// Upload Avatar
// ==============================
export const uploadAvatar = async (req: any, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                message: "No image uploaded",
            });
        }

        const avatarUrl = req.file.filename;

        await User.findByIdAndUpdate(req.user._id, {
            avatarUrl,
        });

        res.status(200).json({
            message: "Avatar uploaded successfully",
            avatarUrl,
        });
    } catch (error) {
        res.status(500).json({
            message: "Unable to upload avatar",
        });
    }
};