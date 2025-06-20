const Request = require("../models/Request");
const Course = require("../models/Course");

// 📌 إرسال طلب انضمام إلى الكورس
exports.sendRequest = async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.user.id; // المستخدم الذي يرسل الطلب

        // 🔍 التحقق من وجود الكورس
        const course = await Course.findById(courseId);
        if (!course)
            return res.status(404).json({ message: "الكورس غير موجود" });

        // ✅ التأكد أن المستخدم ليس هو صاحب الكورس
        if (course.instructor.toString() === userId)
            return res
                .status(400)
                .json({ message: "لا يمكنك طلب الانضمام لكورسك الخاص" });

        // 🔍 التأكد من أن المستخدم لم يرسل طلبًا سابقًا
        const existingRequest = await Request.findOne({
            sender: userId,
            course: courseId,
        });

        if (existingRequest)
            return res
                .status(400)
                .json({ message: "لقد أرسلت طلبًا بالفعل لهذا الكورس" });

        // 🆕 إنشاء الطلب الجديد
        const newRequest = await Request.create({
            sender: userId,
            receiver: course.instructor,
            course: courseId,
        });

        // ✅ إضافة المستخدم إلى `pendingRequests` داخل الكورس
        course.pendingRequests.push(userId);
        await course.save();

        res.status(201).json(newRequest);
    } catch (error) {
        res.status(500).json({ message: "حدث خطأ", error: error.message });
    }
};

// 📌 جلب الطلبات المعلقة لكورس معين (للمحاضر فقط)
exports.getRequests = async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.user.id;

        // 🔍 البحث عن الكورس
        const course = await Course.findById(courseId);
        if (!course)
            return res.status(404).json({ message: "الكورس غير موجود" });

        // ✅ التأكد أن المستخدم هو المحاضر
        if (course.instructor.toString() !== userId)
            return res
                .status(403)
                .json({ message: "ليس لديك صلاحية لرؤية هذه الطلبات" });

        // 🔍 جلب جميع الطلبات المعلقة لهذا الكورس
        const requests = await Request.find({
            course: courseId,
            status: "pending",
        }).populate("sender", "name ");

        res.status(200).json({ success: true, data: requests });
    } catch (error) {
        res.status(500).json({ message: "حدث خطأ", error: error.message });
    }
};

// 📌 قبول طلب انضمام
exports.approveRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const userId = req.user.id;

        // 🔍 البحث عن الطلب
        const request = await Request.findById(requestId);
        if (!request)
            return res.status(404).json({ message: "الطلب غير موجود" });

        // 🔍 البحث عن الكورس
        const course = await Course.findById(request.course);
        if (!course)
            return res.status(404).json({ message: "الكورس غير موجود" });

        // ✅ التأكد أن المستخدم هو المحاضر
        if (course.instructor.toString() !== userId) {
            return res
                .status(403)
                .json({ message: "ليس لديك صلاحية لقبول الطلبات" });
        }

        // ✅ تحديث حالة الطلب إلى "مقبول"
        request.status = "accepted";
        await request.save();

        // ✅ نقل المستخدم من `pendingRequests` إلى `students` مع التحقق من عدم التكرار
        course.pendingRequests = course.pendingRequests.filter(
            (id) => id.toString() !== request.sender.toString()
        );

        if (
            !course.students.some(
                (studentId) =>
                    studentId.toString() === request.sender.toString()
            )
        ) {
            course.students.push(request.sender);
            await course.save();
        }

        res.status(200).json({ message: "تم قبول الطلب بنجاح", request });
    } catch (error) {
        res.status(500).json({ message: "حدث خطأ", error: error.message });
    }
};

// 📌 رفض طلب انضمام
exports.rejectRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const userId = req.user.id;

        // 🔍 البحث عن الطلب
        const request = await Request.findById(requestId);
        if (!request)
            return res.status(404).json({ message: "الطلب غير موجود" });

        // 🔍 البحث عن الكورس
        const course = await Course.findById(request.course);
        if (!course)
            return res.status(404).json({ message: "الكورس غير موجود" });

        // ✅ التأكد أن المستخدم هو صاحب الكورس
        if (course.instructor.toString() !== userId)
            return res
                .status(403)
                .json({ message: "ليس لديك صلاحية لرفض الطلبات" });

        // ✅ تحديث حالة الطلب إلى "مرفوض"
        request.status = "rejected";
        await request.save();

        // ✅ حذف المستخدم من `pendingRequests`
        course.pendingRequests = course.pendingRequests.filter(
            (id) => id.toString() !== request.sender.toString()
        );
        await course.save();

        res.status(200).json({ message: "تم رفض الطلب بنجاح", request });
    } catch (error) {
        res.status(500).json({ message: "حدث خطأ", error: error.message });
    }
};
exports.getUserRequests = async (req, res) => {
    try {
        const userId = req.user.id;

        // 🔍 جلب الطلبات مع تصفية الكورسات المحذوفة أثناء `populate`
        const requests = await Request.find({ sender: userId })
            .populate({
                path: "course",
                select: "title description",
                match: { _id: { $ne: null } }, // ✅ استبعاد الكورسات المحذوفة
            })
            .select("status course createdAt");

        res.status(200).json({ success: true, data: requests });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 📌 إلغاء طلب انضمام من قبل المستخدم
exports.cancelRequest = async (req, res) => {
    try {
        const userId = req.user.id;
        const { requestId } = req.params;

        // 🔍 التحقق من وجود الطلب
        const request = await Request.findById(requestId);
        if (!request) {
            return res.status(404).json({ message: "الطلب غير موجود" });
        }

        // ✅ التحقق أن هذا الطلب خاص بالمستخدم الحالي
        if (request.sender.toString() !== userId) {
            return res
                .status(403)
                .json({ message: "لا يمكنك إلغاء هذا الطلب" });
        }

        // ✅ حذف الطلب
        await request.deleteOne();

        // ✅ حذف المستخدم من pendingRequests داخل الكورس
        const course = await Course.findById(request.course);
        if (course) {
            course.pendingRequests = course.pendingRequests.filter(
                (id) => id.toString() !== userId
            );
            await course.save();
        }

        res.status(200).json({ message: "تم إلغاء الطلب بنجاح" });
    } catch (error) {
        res.status(500).json({ message: "حدث خطأ", error: error.message });
    }
};

// ✅ التحقق من حالة المستخدم بالنسبة لكورس معين (هل هو طالب، ولا بعت طلب، ولا مرفوض، ولا مفيش حاجة)
exports.checkMyRequestStatus = async (req, res) => {
    try {
        const { id: userId } = req.user;
        const { courseId } = req.params;

        // 🔍 تحقق من وجود الكورس
        const course = await Course.findById(courseId);
        if (!course) {
            return res
                .status(404)
                .json({ success: false, message: "الكورس غير موجود" });
        }

        // ✅ تحقق هل المستخدم بالفعل طالب مقبول
        if (course.students.includes(userId)) {
            return res.status(200).json({ success: true, status: "accepted" });
        }

        // 🔍 تحقق هل عنده طلب مسبقًا
        const request = await Request.findOne({
            sender: userId,
            course: courseId,
        });
        if (!request) {
            return res
                .status(200)
                .json({ success: true, status: "not requested" }); // 🚫 مفيش طلب
        }

        // ✅ رجع حالة الطلب سواء pending أو rejected
        return res.status(200).json({ success: true, status: request.status });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
