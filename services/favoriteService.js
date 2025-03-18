const mongoose = require("mongoose");
const Favorite = require("../models/Favorite"); // تأكد من أن لديك هذا الموديل
const Product = require("../models/productModel"); // في حالة إضافة منتجات
//const Course = require("../models/Course"); // في حالة إضافة دورات

// @desc    Add to favorites
// @route   POST /api/favorites
// @access  Private
exports.addFavorite = async (req, res) => {
    try {
        const { itemId} = req.body;

        // التحقق من وجود البيانات المطلوبة
        if (!itemId ) {
            return res.status(400).json({
                success: false,
                message: "itemId is required.",
            });
        }


        // البحث عن العنصر المراد إضافته للمفضلة
        const item = await Product.findById(itemId);
        
        // إذا لم يتم العثور على العنصر
        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Item not found.",
            });
        }

        // التحقق مما إذا كان العنصر مضافًا مسبقًا
        const exists = await Favorite.findOne({
            user: req.user.id,
            item: itemId
        });

        if (exists) {
            return res.status(400).json({
                success: false,
                message: "Item already in favorites.",
            });
        }

        // إضافة العنصر إلى المفضلة
        const favorite = await Favorite.create({
            user: req.user.id,
            item: itemId
        });

        res.status(201).json({ success: true, data: favorite });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Get user favorites
// @route   GET /api/favorites
// @access  Private
exports.getFavorites = async (req, res) => {
    try {
        
        const favorites = await Favorite.find({ user: req.user.id }).populate(
            "item"
        );

        res.status(200).json({ success: true, data: favorites });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};



// @desc    Remove from favorites
// @route   DELETE /api/favorites/:id
// @access  Private



exports.removeFavorite = async (req, res) => {
    try {
        const { id: favoriteId } = req.params;
        const userId = req.user.id;

        // ✅ التحقق من أن المعرفات صحيحة
        if (!mongoose.isValidObjectId(favoriteId)) {
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
            _id: favoriteId,
            user: userId,
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





