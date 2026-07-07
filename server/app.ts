import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";

import profileRoutes from "./routes/profile.routes";

dotenv.config();

const app = express();

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// Serve uploaded profile pictures
app.use(
    "/uploads",
    express.static(path.join(__dirname, "../uploads"))
);

// Profile APIs
app.use("/api/profile", profileRoutes);

export default app;