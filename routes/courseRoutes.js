const express = require("express");
const {
  createCourse,
  getCourses,
  getCourse,
  updateCourse,
  deleteCourse,
  requestEnrollment,
  approveEnrollment,
  uploadProductImages,
  resizeProductImages,
} = require("../services/courseService");
const { protect } = require("../middelwares/authMiddleware");

const router = express.Router();

// إضافة كورس جديد
router.post(
  "/",
  protect,
  uploadProductImages,
  resizeProductImages,
  createCourse
);

// جلب جميع الكورسات
router.get("/", getCourses);

// جلب كورس معين حسب الـ ID
router.get("/:id", getCourse);

// تحديث بيانات الكورس
router.put("/:id", protect, updateCourse);

// حذف كورس
router.delete("/:id", protect, deleteCourse);

// 🔒 إرسال طلب اشتراك في الكورس
router.post("/:id/request", protect, requestEnrollment);

// 🔒 قبول الطلب (متاح فقط لناشر الكورس)
router.post("/:id/approve", protect, approveEnrollment);

module.exports = router;
