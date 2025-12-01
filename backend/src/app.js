import express from "express";
import { createServer } from "http";
import { connectToSocket } from "./controllers/socketManagers.js";
import cors from "cors";
import mongoose from "mongoose";
import userRoute from "./routes/user.route.js";

const app = express();
const server = createServer(app);

// SOCKET CONNECTION
connectToSocket(server);

// ⭐ FIXED CORS — RENDER SAFE
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ extended: true, limit: "40kb" }));

// ⭐ ROUTE
app.use("/api/users", userRoute);

// ⭐ MONGO URL
const MONGO_URL =
  "mongodb+srv://agrawaljatin157_db_user:dSHC2dtd2KlYOk4L@zoomclone.y6muepb.mongodb.net/vibecall?retryWrites=true&w=majority";

const start = async () => {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("MongoDB Connected");

    const PORT = process.env.PORT || 3000;

    // ⭐ LISTEN MUST BE THIS (Render handles PORT dynamically)
    server.listen(PORT, "0.0.0.0", () => {
      console.log("Server running:", PORT);
    });

  } catch (err) {
    console.log("DB Error:", err);
  }
};

start();
