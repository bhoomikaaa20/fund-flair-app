import { Router } from "express";

import {
    getIncome,
    addIncome,
    updateIncome,
    deleteIncome,
} from "../controllers/income.controller";

import { protect } from "../middleware/auth.middleware";

const router = Router();

// Get All Income
router.get("/", protect, getIncome);

// Add Income
router.post("/", protect, addIncome);

// Update Income
router.put("/:id", protect, updateIncome);

// Delete Income
router.delete("/:id", protect, deleteIncome);

export default router; 