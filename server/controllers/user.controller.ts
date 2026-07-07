import { Response } from "express";
import User from "../models/User";
import { AuthRequest } from "../middleware/auth.middleware";

// Get Logged-in User
export const getUser = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const user = await User.findById(req.user._id).select(
            "-password"
        );

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({
            message: "Unable to fetch user",
        });
    }
};

// Update Logged-in User
export const updateUser = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const {
            fullName,
            phone,
        } = req.body;

        const user = await User.findByIdAndUpdate(
            req.user._id,
            {
                fullName,
                phone,
            },
            {
                new: true,
            }
        ).select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({
            message: "Unable to update user",
        });
    }
};