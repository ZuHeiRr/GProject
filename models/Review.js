const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        }, // المستخدم الذي كتب المراجعة
        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
            required: true,
        }, // الكورس الذي تمت مراجعته
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String, required: true },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Review", reviewSchema);
