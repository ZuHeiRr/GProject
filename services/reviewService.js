const mongoose = require("mongoose");

const Review = require("../models/Review");
const Course = require("../models/Course");

// ✅ إضافة تقييم جديد
exports.addReview = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { rating, comment } = req.body;
        const userId = req.user.id;

        // التحقق من أن الكورس موجود
        const course = await Course.findById(courseId).populate(
            "students",
            "_id"
        ); // ✅ جلب `students` فقط
        if (!course) {
            return res
                .status(404)
                .json({ success: false, message: "Course not found" });
        }

        // التحقق من أن المستخدم مسجل في هذا الكورس
        if (
            !course.students.some(
                (student) => student._id.toString() === userId.toString()
            )
        ) {
            return res.status(403).json({
                success: false,
                message: "You are not enrolled in this course",
            });
        }

        // التحقق مما إذا كان المستخدم قد قام بمراجعة الكورس من قبل
        const existingReview = await Review.findOne({
            user: userId,
            course: courseId,
        });
        if (existingReview) {
            return res.status(400).json({
                success: false,
                message: "You have already reviewed this course",
            });
        }

        // إنشاء التقييم
        const review = await Review.create({
            user: userId,
            course: courseId,
            rating,
            comment,
        });

        // إضافة التقييم إلى الكورس
        course.reviews.push(review._id);
        course.ratingsQuantity += 1;
        course.ratingsAverage = (course.ratingsAverage + rating) / 2; // تحديث المتوسط
        await course.save();

        res.status(201).json({ success: true, data: review });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// ✅ تعديل التقييم
exports.updateReview = async (req, res) => {
    try {
        const { courseId, reviewId } = req.params;
        const { rating, comment } = req.body;
        const userId = req.user.id;

        // البحث عن التقييم
        const review = await Review.findOne({
            _id: reviewId,
            course: courseId,
            user: userId,
        });
        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review not found or not authorized",
            });
        }

        // تحديث التقييم
        review.rating = rating;
        review.comment = comment;
        await review.save();

        res.status(200).json({ success: true, data: review });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// ✅ حذف التقييم
exports.deleteReview = async (req, res) => {
    try {
        const { courseId, reviewId } = req.params;
        const userId = req.user.id;

        // البحث عن التقييم
        const review = await Review.findOne({
            _id: reviewId,
            course: courseId,
        });
        if (!review) {
            return res
                .status(404)
                .json({ success: false, message: "Review not found" });
        }

        // التأكد أن المستخدم هو صاحب التقييم أو صاحب الكورس
        const course = await Course.findById(courseId);
        if (
            review.user.toString() !== userId &&
            course.instructor.toString() !== userId
        ) {
            return res
                .status(403)
                .json({ success: false, message: "Not authorized" });
        }

        // حذف التقييم من قاعدة البيانات
        await review.deleteOne();

        // حذف التقييم من الكورس
        course.reviews = course.reviews.filter(
            (r) => r.toString() !== reviewId
        );
        course.ratingsQuantity -= 1;
        await course.save();

        res.status(200).json({
            success: true,
            message: "Review deleted successfully",
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.getCourseReviews = async (req, res) => {
    try {
        const { courseId } = req.params;

        // ✅ التحقق من أن الـ ID صحيح
        if (!mongoose.isValidObjectId(courseId)) {
            return res
                .status(400)
                .json({ success: false, message: "Invalid course ID" });
        }

        // 📌 **Pagination Variables**
        const page = parseInt(req.query.page, 10) || 1; // الصفحة الافتراضية 1
        const limit = parseInt(req.query.limit, 10) || 5; // عدد الريفيوهات في الصفحة
        const skip = (page - 1) * limit; // حساب عدد الريفيوهات التي يجب تخطيها

        // 🔍 **جلب العدد الإجمالي للتقييمات**
        const totalReviews = await Review.countDocuments({ course: courseId });

        // 🔍 **جلب الريفيوهات مع الترقيم**
        const reviews = await Review.find({ course: courseId })
            .populate("user", "name") // ✅ جلب اسم المستخدم فقط
            .sort({ createdAt: -1 }) // ✅ ترتيب من الأحدث إلى الأقدم
            .skip(skip) // ✅ تخطي الريفيوهات حسب الصفحة
            .limit(limit); // ✅ تحديد عدد الريفيوهات في كل صفحة

        // ✅ التحقق إذا لم يكن هناك تقييمات
        if (!reviews.length) {
            return res.status(404).json({
                success: false,
                message: "لا توجد تقييمات لهذا الكورس",
            });
        }

        res.status(200).json({
            success: true,
            totalReviews,
            totalPages: Math.ceil(totalReviews / limit),
            currentPage: page,
            countInPage: reviews.length,
            data: reviews,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

