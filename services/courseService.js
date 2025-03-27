const mongoose = require("mongoose");

const Course = require("../models/Course");
const Category = require("../models/categoryModel"); // استدعاء موديل الفئات

// 🟢 إضافة كورس جديد
exports.createCourse = async (req, res) => {
    try {
        const {
            title,
            description,
            price,
            category, // ✅ التحقق من هذه الفئة
            lessons,
            location,
            language,
            access,
            certificate,
            images,
        } = req.body;

        // 🔍 التحقق مما إذا كانت الفئة موجودة في قاعدة البيانات
        const existingCategory = await Category.findById(category);
        if (!existingCategory) {
            return res
                .status(400)
                .json({ success: false, message: "Invalid category ID" });
        }

        // ✅ إنشاء الكورس فقط إذا كانت الفئة صحيحة
        const course = await Course.create({
            title,
            description,
            price,
            category,
            lessons,
            location,
            language,
            access,
            certificate,
            images,
            instructor: req.user._id, // ربط الكورس بالمستخدم الذي أنشأه
        });

        res.status(201).json({ success: true, data: course });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.getCourses = async (req, res) => {
    try {
        const query = {};

        if (req.query.title) {
            query.title = { $regex: req.query.title, $options: "i" };
        }

        // 🟠 2️⃣ الفلترة حسب الفئة (`category` يجب أن يكون `ObjectId`)
        if (req.query.category) {
            if (!mongoose.isValidObjectId(req.query.category)) {
                return res
                    .status(400)
                    .json({ success: false, message: "Invalid category ID" });
            }
            query.category = req.query.category;
        }

        // 🔵 3️⃣ ترتيب النتائج حسب عدد المشاهدات (`views`)
        const sortOption = {};
        if (req.query.views) {
            sortOption.views = -1; // ترتيب تنازلي (الأكثر مشاهدة أولًا)
        }

        // 🟣 4️⃣ `Pagination`
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;

        // ✅ حساب العدد الإجمالي للكورسات
        const totalCourses = await Course.countDocuments();

        // 🔍 تنفيذ الاستعلام
        const courses = await Course.find(query)
            .populate("instructor", "name")
            .populate("category", "id name") // ✅ جلب اسم الـ category و الـ ID فقط
            .sort(sortOption)
            .skip(skip)
            .limit(limit);

        // 🛑 إذا لم يتم العثور على أي نتائج
        if (!courses.length) {
            return res.status(404).json({
                success: false,
                message: "No courses found matching the criteria",
            });
        }

        // 🔍 حساب عدد الصفحات
        const total = await Course.countDocuments(query);

        res.status(200).json({
            success: true,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            totalCourses, // ✅ العدد الإجمالي للكورسات
            countInPage: courses.length, // ✅ عدد الكورسات في الصفحة الحالية

            data: courses,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 🟢 جلب كورس معين حسب الـ ID
exports.getCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id)
            .populate("instructor", "name ")
            .populate("category", "id name") // ✅ جلب اسم الـ category و الـ ID فقط
            .populate("reviews.user", "name "); // جلب بيانات المستخدمين الذين أضافوا تقييمات;
        if (!course) {
            return res
                .status(404)
                .json({ success: false, message: "الكورس غير موجود" });
        }
        // ✅ زيادة عدد المشاهدات وجعل الكورس أكثر شهرة
        course.views += 1;
        await course.save();
        res.status(200).json({ success: true, data: course });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 🟢 تحديث بيانات الكورس
exports.updateCourse = async (req, res) => {
    try {
        let course = await Course.findById(req.params.id);

        if (!course) {
            return res
                .status(404)
                .json({ success: false, message: "الكورس غير موجود" });
        }

        // التحقق من أن المستخدم هو من أنشأ الكورس
        if (course.instructor.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "ليس لديك إذن لتعديل هذا الكورس",
            });
        }

        // تحديث بيانات الكورس
        course = await Course.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        res.status(200).json({ success: true, data: course });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// 🟢 حذف كورس
exports.deleteCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);

        if (!course) {
            return res
                .status(404)
                .json({ success: false, message: "الكورس غير موجود" });
        }

        // التحقق من أن المستخدم هو من أنشأ الكورس
        if (course.instructor.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "ليس لديك إذن لحذف هذا الكورس",
            });
        }

        await course.deleteOne();

        res.status(200).json({ success: true, message: "تم حذف الكورس بنجاح" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.requestEnrollment = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course)
            return res
                .status(404)
                .json({ success: false, message: "الكورس غير موجود" });

        // التحقق إذا كان المستخدم مشترك بالفعل
        if (course.students.includes(req.user._id)) {
            return res.status(400).json({
                success: false,
                message: "أنت مشترك بالفعل في هذا الكورس",
            });
        }

        // التحقق إذا كان المستخدم أرسل طلبًا مسبقًا
        if (course.pendingRequests.includes(req.user._id)) {
            return res
                .status(400)
                .json({ success: false, message: "طلبك قيد الانتظار بالفعل" });
        }

        // إضافة المستخدم إلى الطلبات المعلقة
        course.pendingRequests.push(req.user._id);
        await course.save();

        res.status(200).json({
            success: true,
            message: "تم إرسال طلب الاشتراك بنجاح، في انتظار الموافقة",
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.approveEnrollment = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course)
            return res
                .status(404)
                .json({ success: false, message: "الكورس غير موجود" });

        // التحقق إذا كان المستخدم هو صاحب الكورس
        if (course.instructor.toString() !== req.user._id.toString()) {
            return res
                .status(403)
                .json({ success: false, message: "غير مصرح لك بقبول الطلبات" });
        }

        // التحقق إذا كان الطالب في قائمة الطلبات المعلقة
        const { userId } = req.body;
        if (!course.pendingRequests.includes(userId)) {
            return res.status(400).json({
                success: false,
                message: "هذا المستخدم لم يقدم طلبًا",
            });
        }

        // نقل المستخدم إلى قائمة الطلاب
        course.pendingRequests = course.pendingRequests.filter(
            (id) => id.toString() !== userId
        );
        course.students.push(userId);
        await course.save();

        res.status(200).json({
            success: true,
            message: "تم قبول المستخدم في الكورس بنجاح",
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
