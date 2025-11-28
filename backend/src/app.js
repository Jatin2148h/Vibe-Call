import express from "express";
import { createServer } from "http";
import { connectToSocket } from "./controllers/socketManagers.js";
import cors from "cors";
import mongoose from "mongoose";
import userRoute from "./routes/user.route.js";

const app = express();
const server = createServer(app);

// =========================
// SOCKET.IO INIT
// =========================
connectToSocket(server);

// =========================
// PORT
// =========================
app.set("port", process.env.PORT || 3000);

// =========================
// FIXED CORS FOR RENDER
// =========================
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://vibecallfrontend.onrender.com",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// ⭐⭐ DO NOT USE app.options("*") — Node v22 ERROR ⭐⭐
// ⭐⭐ Instead use this universal OPTIONS handler ⭐⭐
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    return res.sendStatus(200);
  }
  next();
});

// =========================
// BODY PARSER
// =========================
app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ extended: true, limit: "40kb" }));

// =========================
// ROUTES
// =========================
app.use("/api/users", userRoute);

// =========================
// MONGODB
// =========================
const MONGO_URL =
  "mongodb+srv://agrawaljatin157_db_user:dSHC2dtd2KlYOk4L@zoomclone.y6muepb.mongodb.net/vibecall?retryWrites=true&w=majority";

// =========================
// CONNECT + START SERVER
// =========================
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
