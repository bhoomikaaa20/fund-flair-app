import { Response } from "express";
import Expense from "../models/Expense";
import { AuthRequest } from "../middleware/auth.middleware";

// Get All Expenses
export const getExpenses = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const expenses = await Expense.find({
            userId: req.user._id,
        }).sort({ date: -1 });

        res.status(200).json(expenses);
    } catch (error) {
        res.status(500).json({
            message: "Unable to fetch expenses",
        });
    }
};

// Add Expense
export const addExpense = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const {
            category,
            amount,
            paymentMethod,
            date,
            description,
        } = req.body;

        const expense = await Expense.create({
            userId: req.user._id,
            category,
            amount,
            paymentMethod,
            date,
            description,
        });

        res.status(201).json(expense);
    } catch (error) {
        res.status(500).json({
            message: "Unable to add expense",
        });
    }
};

// Update Expense
export const updateExpense = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const expense = await Expense.findOneAndUpdate(
            {
                _id: req.params.id,
                userId: req.user._id,
            },
            req.body,
            {
                new: true,
            }
        );

        if (!expense) {
            return res.status(404).json({
                message: "Expense not found",
            });
        }

        res.status(200).json(expense);
    } catch (error) {
        res.status(500).json({
            message: "Unable to update expense",
        });
    }
};

// Delete Expense
export const deleteExpense = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const expense = await Expense.findOneAndDelete({
            _id: req.params.id,
            userId: req.user._id,
        });

        if (!expense) {
            return res.status(404).json({
                message: "Expense not found",
            });
        }

        res.json({
            message: "Expense deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            message: "Unable to delete expense",
        });
    }
};