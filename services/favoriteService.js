const mongoose = require("mongoose");
const Favorite = require("../models/Favorite"); // تأكد من أن لديك هذا الموديل
const Product = require("../models/productModel"); // في حالة إضافة منتجات
const Course = require("../models/Course"); // في حالة إضافة دورات

// @desc    Add to favorites
// @route   POST /api/favorites
// @access  Private
// 📌 إضافة عنصر إلى المفضلة (منتج أو كورس)
exports.addFavorite = async (req, res) => {
  try {
    const { itemId } = req.body; // ✅ استلام `id` فقط من الطلب
    const userId = req.user.id; // ✅ المستخدم مأخوذ من `auth`

    let item = null;
    let itemType = null;

    // ✅ التحقق مما إذا كان `id` يخص منتج
    item = await Product.findById(itemId);
    if (item) {
      itemType = "Product";
    } else {
      // ✅ إذا لم يكن منتجًا، تحقق مما إذا كان `id` يخص كورس
      item = await Course.findById(itemId);
      if (item) {
        itemType = "Course";
      }
    }

    // ❌ إذا لم يتم العثور على العنصر، أعد رسالة خطأ
    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found." });
    }

    // ✅ التحقق مما إذا كان العنصر مضافًا مسبقًا إلى المفضلة
    const exists = await Favorite.findOne({ user: userId, item: itemId });
    if (exists) {
      return res
        .status(400)
        .json({ success: false, message: "Item already in favorites." });
    }

    // ✅ إضافة العنصر إلى المفضلة
    await Favorite.create({ user: userId, item: itemId, itemType });

    res
      .status(201)
      .json({ success: true, message: "تمت الإضافة إلى المفضلة بنجاح" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get user favorites
// @route   GET /api/favorites
// @access  Private
exports.getFavorites = async (req, res) => {
  try {
    const userId = req.user.id; // جلب المستخدم من auth

    // تحقق من وجود المستخدم
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "يجب تسجيل الدخول.",
      });
    }

    // تحديد الصفحة والحد الأقصى من النتائج
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // جلب المفضلات مع فلترة المنتجات أو الكورسات المحذوفة
    const favorites = await Favorite.find({ user: userId })
        .populate({
            path: "item",
            select: "-__v", // تجاهل الـ __v في البيانات المسترجعة
            strictPopulate: false, //  ده المهم
            populate: [
                {
                    path: "category",
                    select: "name",
                },
            ],
        })
        .skip(skip)
        .limit(limit);

    // تصفية العناصر التي تكون غير موجودة (أي `null`)
    const validFavorites = favorites.filter((fav) => fav.item !== null);
        await Promise.all(
            validFavorites.map(async (fav) => {
                const { item, itemType } = fav;


                if (itemType === "Product") {
                    await item.populate({
                        path: "user",
                        select: "name phone profileImg",
                        strictPopulate: false,
                    });
                } else if (itemType === "Course") {
                    await item.populate({
                        path: "instructor",
                        select: "name phone profileImg",
                        strictPopulate: false,
                    });
                }
            })
        );

    // حساب العدد الإجمالي للمفضلات بعد التصفية
    const totalFavorites = await Favorite.countDocuments({ user: userId });

    // إرجاع البيانات في الاستجابة
    res.status(200).json({
      success: true,
      currentPage: page,
      totalPages: Math.ceil(totalFavorites / limit),
      totalFavorites: validFavorites.length,
      data: validFavorites.map((fav) => fav.item),
    });
  } catch (error) {
    // التعامل مع الأخطاء
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Remove from favorites
// @route   DELETE /api/favorites/:id
// @access  Private
exports.removeFavorite = async (req, res) => {
  try {
    const { id: productId } = req.params;
    const userId = req.user.id;

    // ✅ التحقق من أن المعرفات صحيحة
    if (!mongoose.isValidObjectId(productId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid favorite ID." });
    }

    if (!mongoose.isValidObjectId(userId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid user ID." });
    }

    // ✅ البحث عن المفضلة وإزالتها
    const favorite = await Favorite.findOneAndDelete({
      item: productId,
      user: req.user.id,
    });

    if (!favorite) {
      return res
        .status(404)
        .json({ success: false, message: "Favorite item not found." });
    }

    return res.status(200).json({
      success: true,
      message: "Removed from favorites successfully!",
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
