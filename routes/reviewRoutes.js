const express = require("express");
const {
    addReview,
    getCourseReviews,
    // updateReview,
    // deleteReview,
} = require("../services/reviewService");
const { protect } = require("../middelwares/authMiddleware");

const router = express.Router();

// 🔒 إضافة تقييم لكورس معين
router.post("/:courseId", protect, addReview);

// // ✅ تعديل التقييم الخاص بالمستخدم
// router.put("/:courseId/:reviewId", protect, updateReview);

// // ✅ حذف التقييم (يجب أن يكون صاحب التقييم أو صاحب الكورس)
// router.delete("/:courseId/:reviewId", protect, deleteReview);

// ✅ جلب جميع الريفيوهات لكورس معين
router.get("/:courseId/reviews", getCourseReviews);

module.exports = router;
