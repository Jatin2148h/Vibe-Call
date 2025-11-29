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
// CORS MIDDLEWARE (MUST BE FIRST)
// =========================
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://vibecallfrontend.onrender.com"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// ⭐ FIX for preflight
app.options("*", cors());


// ⭐ UNIVERSAL OPTIONS HANDLER (REQUIRED)
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
// DATABASE
// =========================
const MONGO_URL =
  "mongodb+srv://agrawaljatin157_db_user:dSHC2dtd2KlYOk4L@zoomclone.y6muepb.mongodb.net/vibecall?retryWrites=true&w=majority";

// =========================
// CONNECT + START
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
