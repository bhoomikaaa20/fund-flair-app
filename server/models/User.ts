import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
    fullName: string;
    email: string;
    password: string;
    phone: string;
    avatarUrl: string;
    role: string;
    status: string;
}

const userSchema = new Schema<IUser>(
    {
        fullName: {
            type: String,
            required: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
        },

        password: {
            type: String,
            required: true,
        },

        phone: {
            type: String,
            default: "",
        },

        avatarUrl: {
            type: String,
            default: "",
        },

        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user",
        },

        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active",
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model<IUser>("User", userSchema);