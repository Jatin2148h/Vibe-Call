import mongoose, { Schema } from "mongoose";

const meetingSchema = new Schema({
    user_id: { type: String, required: true },

    meetingCode: { type: String },
    meeting_code: { type: String },

    date: { type: Date, default: Date.now, required: true }
});

meetingSchema.pre("save", function (next) {
    if (this.meetingCode && !this.meeting_code) {
        this.meeting_code = this.meetingCode;
    }
    if (this.meeting_code && !this.meetingCode) {
        this.meetingCode = this.meeting_code;
    }
    next();
});

const Meeting = mongoose.model("meeting", meetingSchema);

export { Meeting };
