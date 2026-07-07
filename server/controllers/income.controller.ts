import { Response } from "express";
import Income from "../models/Income";
import { AuthRequest } from "../middleware/auth.middleware";

// Get All Income
export const getIncome = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const income = await Income.find({
            userId: req.user._id,
        }).sort({ date: -1 });

        res.status(200).json(income);
    } catch (error) {
        res.status(500).json({
            message: "Unable to fetch income",
        });
    }
};

// Add Income
export const addIncome = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const {
            source,
            amount,
            date,
            description,
        } = req.body;

        const income = await Income.create({
            userId: req.user._id,
            source,
            amount,
            date,
            description,
        });

        res.status(201).json(income);
    } catch (error) {
        res.status(500).json({
            message: "Unable to add income",
        });
    }
};

// Update Income
export const updateIncome = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const income = await Income.findOneAndUpdate(
            {
                _id: req.params.id,
                userId: req.user._id,
            },
            req.body,
            {
                new: true,
            }
        );

        if (!income) {
            return res.status(404).json({
                message: "Income not found",
            });
        }

        res.status(200).json(income);
    } catch (error) {
        res.status(500).json({
            message: "Unable to update income",
        });
    }
};

// Delete Income
export const deleteIncome = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const income = await Income.findOneAndDelete({
            _id: req.params.id,
            userId: req.user._id,
        });

        if (!income) {
            return res.status(404).json({
                message: "Income not found",
            });
        }

        res.json({
            message: "Income deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            message: "Unable to delete income",
        });
    }
};