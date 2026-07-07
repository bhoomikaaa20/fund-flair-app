import mongoose, { Schema, Document } from "mongoose";

export interface IExpense extends Document {
    userId: mongoose.Types.ObjectId;
    category: string;
    amount: number;
    paymentMethod: string;
    date: Date;
    description?: string;
}

const expenseSchema = new Schema<IExpense>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        category: {
            type: String,
            required: true,
            trim: true,
        },

        amount: {
            type: Number,
            required: true,
            min: 0,
        },

        paymentMethod: {
            type: String,
            required: true,
        },

        date: {
            type: Date,
            required: true,
        },

        description: {
            type: String,
            default: "",
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model<IExpense>(
    "Expense",
    expenseSchema
);