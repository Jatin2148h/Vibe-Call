import express from "express";
import { createServer } from "http";
import { connectToSocket } from "./controllers/socketManagers.js";
import cors from "cors";
import mongoose from "mongoose";
import userRoute from "./routes/user.route.js";

const app = express();
const server = createServer(app);

// SOCKET.IO INIT
connectToSocket(server);

// PORT
app.set("port", process.env.PORT || 3000);

// CORS FIX FOR BOTH LOCAL + RENDER
app.use(
  cors({
    origin: [
      "http://localhost:5173",                   // local dev
      "https://vibecallfrontend.onrender.com",   // deployed frontend
    ],
    methods: ["GET", "POST", "DELETE", "PUT"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);


app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: true }));

// ROUTES
app.use("/api/users", userRoute);

// ⭐ DIRECT MONGODB URL — NO .env REQUIRED
const MONGO_URL =
  "mongodb+srv://agrawaljatin157_db_user:dSHC2dtd2KlYOk4L@zoomclone.y6muepb.mongodb.net/vibecall?retryWrites=true&w=majority";

// CONNECT + START SERVER
const start = async () => {
  try {
    const conn = await mongoose.connect(MONGO_URL);
    console.log(`MongoDB connected: ${conn.connection.host}`);

    server.listen(app.get("port"), () => {
      console.log("Server running at PORT:", app.get("port"));
    });
  } catch (err) {
    console.log("Database connection failed:", err.message);
  }
};

start();
