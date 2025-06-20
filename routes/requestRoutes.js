const express = require("express");
const {
    sendRequest,
    getRequests,
    approveRequest,
    rejectRequest,
    getUserRequests,
    cancelRequest,
    checkMyRequestStatus,
} = require("../services/requestserveice");
const { protect } = require("../middelwares/authMiddleware");

const router = express.Router();

router.get("/my-requests", protect, getUserRequests);
// 📌 إرسال طلب انضمام للكورس
router.post("/:courseId", protect, sendRequest);

// 📌 جلب الطلبات المعلقة للكورس (للمحاضر فقط)
router.get("/:courseId", protect, getRequests);

// 📌 قبول الطلب
router.post("/approve/:requestId", protect, approveRequest);

// 📌 رفض الطلب
router.post("/reject/:requestId", protect, rejectRequest);

router.delete("/:requestId/cancel", protect, cancelRequest);

// ✅ Endpoint للتحقق من حالة المستخدم في كورس معين
router.get("/check-status/:courseId", protect, checkMyRequestStatus);


module.exports = router;
