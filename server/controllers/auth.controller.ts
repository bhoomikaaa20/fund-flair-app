import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User";
import { generateToken } from "../utils/generateToken";

export const register = async (req: Request, res: Response) => {
    try {
        const { name, email, password } = req.body;

        const exists = await User.findOne({ email });

        if (exists)
            return res.status(400).json({
                message: "User already exists",
            });

        const hashed = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashed,
        });

        const token = generateToken(user.id);

        res.status(201).json({
            token,
            user,
        });
    } catch (err) {
        res.status(500).json(err);
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user)
            return res.status(404).json({
                message: "User not found",
            });

        const valid = await bcrypt.compare(password, user.password);

        if (!valid)
            return res.status(401).json({
                message: "Invalid credentials",
            });

        const token = generateToken(user.id);

        res.json({
            token,
            user,
        });
    } catch (err) {
        res.status(500).json(err);
    }
};

export const getMe = async (req: any, res: Response) => {
    res.json(req.user);
};