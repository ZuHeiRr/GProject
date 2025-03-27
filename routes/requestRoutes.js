const express = require("express");
const {
    sendRequest,
    getRequests,
    approveRequest,
    rejectRequest,
    getUserRequests,
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




module.exports = router;
