const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp");
const asyncHandler = require("express-async-handler");
// const factory = require("./handlerFactory");
const Course = require("../models/Course");
const cloudinary = require("../cloudinary/cloudi");

const Category = require("../models/categoryModel");
const { uploadMixOfImages } = require("../middelwares/uploadImageMiddleware");

exports.uploadCourseImages = uploadMixOfImages([
  {
    name: "images",
    maxCount: 5,
  },
]);

exports.resizeCourseImages = asyncHandler(async (req, res, next) => {
  if (req.files.images) {
    req.body.images = [];

    await Promise.all(
      req.files.images.map(async (img, index) => {
        const imageName = `product-${uuidv4()}-${Date.now()}-${index + 1}`;

        // تعديل الصورة باستخدام sharp
        const resizedImageBuffer = await sharp(img.buffer)
          .resize(2000, 1333)
          .toFormat("jpeg")
          .jpeg({ quality: 95 })
          .toBuffer();

        // رفع الصورة على Cloudinary باستخدام Promise
        const imageUploadResult = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: "courses",
              public_id: imageName,
              resource_type: "image",
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );

          stream.end(resizedImageBuffer);
        });

        // حفظ الرابط في الـ body
        req.body.images.push(imageUploadResult.secure_url);
      })
    );
  }

  next();
});

// 🟢 إضافة كورس جديد
// 🟢 إضافة كورس جديد

exports.createCourse = async (req, res) => {
  try {
      const {
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
      } = req.body;
      // ✅ تحويل بعض الحقول إلى JSON إن كانت موجودة كسلاسل نصية
      if (typeof req.body.lessons === "string") {
          try {
              req.body.lessons = JSON.parse(req.body.lessons);
          } catch (e) {
              return res
                  .status(400)
                  .json({ success: false, message: "Invalid lessons format" });
          }
      }
      // لو details وصلت كـ string
      if (typeof req.body.details === "string") {
          try {
              const obj = JSON.parse(req.body.details);
              // نستخدم Map عشان يتوافق مع schema الـ Map
              req.body.details = new Map(Object.entries(obj));
          } catch (err) {
              return res
                  .status(400)
                  .json({ success: false, message: "Invalid details JSON" });
          }
      }

      // 🔍 التحقق مما إذا كانت الفئة موجودة في قاعدة البيانات
      const existingCategory = await Category.findById(category);
      if (!existingCategory) {
          return res
              .status(400)
              .json({ success: false, message: "معرف الفئة غير صالح" });
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
          details: req.body.details,
      });

      if (typeof req.body.pendingRequests === "string") {
          req.body.pendingRequests = JSON.parse(req.body.pendingRequests);
      }

      if (typeof req.body.students === "string") {
          req.body.students = JSON.parse(req.body.students);
      }

      if (typeof req.body.reviews === "string") {
          req.body.reviews = JSON.parse(req.body.reviews);
      }

      res.status(201).json({ success: true, data: course });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// 🟢 الحصول على جميع الكورسات مع الفلترة والترتيب
exports.getCourses = async (req, res) => {
  try {
      const query = {};

      if (req.query.title) {
          query.title = { $regex: req.query.title, $options: "i" };
      }

      // الفلترة حسب الفئة
      if (req.query.category) {
          if (!mongoose.isValidObjectId(req.query.category)) {
              return res
                  .status(400)
                  .json({ success: false, message: "معرف الفئة غير صالح" });
          }
          query.category = req.query.category;
      }
      // 🟣 فلترة بالانستراكتور
      if (req.query.instructor) {
          if (!mongoose.isValidObjectId(req.query.instructor)) {
              return res
                  .status(400)
                  .json({ success: false, message: "Invalid instructor ID" });
          }
          query.instructor = req.query.instructor;
      }

      // ترتيب النتائج حسب عدد المشاهدات
      const sortOption = {};
      if (req.query.views) {
          sortOption.views = -1; // ترتيب تنازلي (الأكثر مشاهدة أولًا)
      }

      // التقسيم إلى صفحات
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 10;
      const skip = (page - 1) * limit;

      const totalCourses = await Course.countDocuments();
      const courses = await Course.find(query)
          .populate("instructor", "name phone")
          .populate("category", "id name")
          .sort(sortOption)
          .skip(skip)
          .limit(limit);

      if (!courses.length) {
          return res.status(404).json({
              success: false,
              message: "لا توجد كورسات تطابق معايير البحث",
          });
      }

      const total = await Course.countDocuments(query);

      res.status(200).json({
          success: true,
          totalPages: Math.ceil(total / limit),
          currentPage: page,
          totalCourses,
          countInPage: courses.length,
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
      .populate("instructor", "name phone")
      .populate("category", "id name")
      .populate("reviews.user", "name");

    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "الكورس غير موجود" });
    }

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

    if (course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "ليس لديك إذن لتعديل هذا الكورس",
      });
    }

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

// 🟢 طلب الانضمام إلى كورس
exports.requestEnrollment = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "الكورس غير موجود" });
    }

    if (course.students.includes(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: "أنت مشترك بالفعل في هذا الكورس",
      });
    }

    if (course.pendingRequests.includes(req.user._id)) {
      return res
        .status(400)
        .json({ success: false, message: "طلبك قيد الانتظار بالفعل" });
    }

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

// 🟢 الموافقة على طلب الانضمام
exports.approveEnrollment = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "الكورس غير موجود" });
    }

    if (course.instructor.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "غير مصرح لك بقبول الطلبات" });
    }

    const { userId } = req.body;
    if (!course.pendingRequests.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: "هذا المستخدم لم يقدم طلبًا",
      });
    }

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

// 🔥 لزيادة عدد المشاهدات
exports.increaseCourseViews = async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "الكورس غير موجود",
      });
    }

    res.status(200).json({
      success: true,
      message: "تم تحديث عدد المشاهدات",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
