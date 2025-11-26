import express from "express";
import { createServer } from "http";
import  {connectToSocket}  from "./controllers/socketManagers.js"; 
import cors from "cors";
import mongoose from "mongoose";
import userRoute from "./routes/user.route.js";

const app = express();
const server = createServer(app);

// SOCKET.IO INIT
connectToSocket(server);

app.set("port", process.env.PORT || 3000);

// CORS
app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true,
    })
);

app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: true }));

// API routes
app.use("/api/users", userRoute);

const start = async () => {
    const connectionDb = await mongoose.connect(
        "mongodb+srv://agrawaljatin157_db_user:dSHC2dtd2KlYOk4L@zoomclone.y6muepb.mongodb.net/"
    );

    console.log(`MongoDB connected at: ${connectionDb.connection.host}`);

    server.listen(app.get("port"), () => {
        console.log("Server running on PORT:", app.get("port"));
    });
};

start();
