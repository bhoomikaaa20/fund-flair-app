import { Router } from "express";

import {
    getExpenses,
    addExpense,
    updateExpense,
    deleteExpense,
} from "../controllers/expense.controller";

import { protect } from "../middleware/auth.middleware";

const router = Router();

// Get All Expenses
router.get("/", protect, getExpenses);

// Add Expense
router.post("/", protect, addExpense);

// Update Expense
router.put("/:id", protect, updateExpense);

// Delete Expense
router.delete("/:id", protect, deleteExpense);

export default router;