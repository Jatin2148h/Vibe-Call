import httpStatus from "http-status";
import { user as User } from "../models/user.models.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { Meeting } from "../models/meeting.model.js";

// LOGIN
const login = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password)
        return res.status(400).json({ message: "Username and password required" });

    try {
        const found = await User.findOne({ username });

        if (!found)
            return res.status(httpStatus.NOT_FOUND).json({ message: "User not found" });

        const match = await bcrypt.compare(password, found.password);
        if (!match)
            return res.status(401).json({ message: "Invalid password" });

        const token = crypto.randomBytes(20).toString("hex");
        found.token = token;
        await found.save();

        return res.status(200).json({ token });
    } catch (e) {
        return res.json({ message: `Error: ${e}` });
    }
};

// REGISTER
const register = async (req, res) => {
    const { name, username, password } = req.body;

    try {
        const exists = await User.findOne({ username });

        if (exists)
            return res.status(409).json({ message: "Username already exists" });

        const hash = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            username,
            password: hash,
        });

        await newUser.save();

        res.status(201).json({ message: "User registered successfully" });
    } catch (e) {
        res.json({ message: `Error: ${e}` });
    }
};

// GET HISTORY
const getUserHistory = async (req, res) => {
    let headerToken = null;

    if (req.headers.authorization) {
        headerToken = req.headers.authorization.split(" ")[1];
    }

    const queryToken = req.query.token;
    const bodyToken = req.body?.token;

    const finalToken = headerToken || queryToken || bodyToken;

    try {
        const foundUser = await User.findOne({ token: finalToken });

        if (!foundUser)
            return res.status(404).json({ message: "Invalid token" });

        const meetings = await Meeting.find({ user_id: foundUser.username });

        res.json(meetings);
    } catch (e) {
        res.json({ message: `Something went wrong ${e}` });
    }
};

// ADD HISTORY
const addToHistory = async (req, res) => {
    let headerToken = null;

    if (req.headers.authorization) {
        headerToken = req.headers.authorization.split(" ")[1];
    }

    const { token, meeting_code, meetingCode } = req.body;

    const finalToken = headerToken || token;

    try {
        const foundUser = await User.findOne({ token: finalToken });

        if (!foundUser)
            return res.status(404).json({ message: "Invalid token" });

        const newMeeting = new Meeting({
            user_id: foundUser.username,
            meetingCode: meetingCode || meeting_code,
            meeting_code: meeting_code || meetingCode
        });

        await newMeeting.save();

        res.status(httpStatus.CREATED).json({ message: "Added code to history" });
    } catch (e) {
        res.json({ message: `Something went wrong ${e}` });
    }
};

// ⭐ DELETE HISTORY
const deleteHistoryItem = async (req, res) => {
    const meetingId = req.params.id;

    try {
        await Meeting.findByIdAndDelete(meetingId);

        res.json({
            success: true,
            message: "Meeting deleted successfully"
        });

    } catch (e) {
        res.status(500).json({
            success: false,
            message: "Delete failed",
            error: e
        });
    }
};

export { 
    login, 
    register, 
    getUserHistory, 
    addToHistory,
    deleteHistoryItem
};
