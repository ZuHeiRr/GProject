const mongoose = require("mongoose");
const Favorite = require("./Favorite");

const productSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            minlength: [3, "Too short product title"],
            maxlength: [100, "Too long product title"],
        },
        user: {
            type: mongoose.Schema.ObjectId,
            ref: "User",
            required: [true, "Product must be belong to seller"],
        },
        slug: {
            type: String,
            required: true,
            lowercase: true,
        },
        description: {
            type: String,
            required: [true, "Product description is required"],
            minlength: [20, "Too short product description"],
        },
        price: {
            type: Number,
            required: [true, "Product price is required"],
            trim: true,
            max: [200000, "Too long product price"],
        },
        images: [String],
        category: {
            type: mongoose.Schema.ObjectId,
            ref: "Category",
            required: [true, "Product must be belong to category"],
        },

        visit: {
            type: Number,
            default: 0,
        },
        details: {
            type: Map, // ✅ الآن يمكن أن يحتوي على أي مفاتيح ديناميكية
            of: mongoose.Schema.Types.Mixed, // ✅ يسمح بأي نوع من القيم
            default: {}, // ✅ الافتراضي أن يكون كائن فارغ
        },
        location: {
            type: String,
            required: [true, "Product location is required"],
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

// Mongoose query middleware
productSchema.pre(/^find/, function (next) {
  this.populate({
    path: "category",
    select: "name _id",
  });
  next();
});
// ✅ حذف المنتج من المفضلة إذا تم حذفه من قاعدة البيانات
productSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function (next) {
    try {
      await Favorite.deleteMany({ item: this._id }); // ✅ حذف كل المفضلات المرتبطة
      next();
    } catch (error) {
      next(error);
    }
  }
);

module.exports = mongoose.model("Product", productSchema);
