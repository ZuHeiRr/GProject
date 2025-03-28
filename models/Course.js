const mongoose = require("mongoose");



const courseSchema = new mongoose.Schema(
    {
        title: { type: String, required: true }, // اسم الكورس
        description: { type: String, required: true }, // وصف الكورس
        images: [{ type: String }], // صور الكورس
        price: { type: Number, required: true }, // سعر الكورس
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: true,
        }, // 🔥 مرتبط بـ Category
        lessons: [
            {
                title: { type: String, required: true }, // عنوان الدرس
                description: { type: String }, // وصف الدرس
            },
        ],
        instructor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        }, // المحاضر هو مستخدم
        location: { type: String, required: true }, // موقع الكورس
        ratingsAverage: { type: Number, default: 1, min: 1, max: 5 }, // متوسط التقييمات
        ratingsQuantity: { type: Number, default: 0 }, // عدد التقييمات
        language: { type: String, required: true }, // لغة الكورس
        access: {
            type: String,
            enum: ["Mobile", "Desktop", "Both"],
            default: "Both",
        }, // طريقة الوصول
        certificate: { type: Boolean, default: false }, // هل يوجد شهادة؟
        // 🆕 الطلبات المعلقة
        pendingRequests: [
            { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        ],

        // 🆕 الطلاب المقبولين
        students: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        createdAt: { type: Date, default: Date.now }, // تاريخ الإنشاء
        updatedAt: { type: Date, default: Date.now }, // تاريخ آخر تعديل
        // 🆕 التقييمات والتعليقات
        reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }], // المراجعات مرتبطة كـ `ref`
        // ✅ عدد المشاهدات لجعل الكورس أكثر شهرة
        views: { type: Number, default: 0 },
        // ✅ إضافة قائمة الفيديوهات والملفات المرفوعة
    },

    { timestamps: true }
);

const Course = mongoose.model("Course", courseSchema);
module.exports = Course;


