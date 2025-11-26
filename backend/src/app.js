import express from "express";
import { createServer } from "http";
import { connectToSocket } from "./controllers/socketManagers.js";
import cors from "cors";
import mongoose from "mongoose";
import userRoute from "./routes/user.route.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const server = createServer(app);

// SOCKET.IO INIT
connectToSocket(server);

// PORT
app.set("port", process.env.PORT || 3000);

// CORS
app.use(
    cors({
        origin: process.env.CLIENT_URL, // 🔥 dynamic frontend url
        credentials: true,
    })
);

// BODY PARSERS
app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: true }));

// ROUTES
app.use("/api/users", userRoute);

// START SERVER + DB CONNECT
const start = async () => {
    try {
        const connectionDb = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB connected at: ${connectionDb.connection.host}`);

        server.listen(app.get("port"), () => {
            console.log("Server running on PORT:", app.get("port"));
        });
    } catch (err) {
        console.error("Database connection failed:", err.message);
    }
};

start();
