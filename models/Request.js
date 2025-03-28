const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    }, // المستخدم الذي أرسل الطلب
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    }, // صاحب الكورس
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true,
    }, // الكورس
    status: {
        type: String,
        enum: ["pending", "accepted", "rejected"],
        default: "pending",
    },
    createdAt: { type: Date, default: Date.now },
});

const Request = mongoose.model("Request", requestSchema);

module.exports = Request;
