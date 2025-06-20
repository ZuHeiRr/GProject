const bcrypt = require("bcryptjs");

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
            required: [true, "name required"],
        },
        slug: {
            type: String,
            lowercase: true,
        },
        email: {
            type: String,
            required: [true, "email required"],
            unique: true,
            lowercase: true,
        },
        phone: String,
        profileImg: String,

        password: {
            type: String,
            required: [true, "password required"],
            minlength: [6, "Too short password"],
        },
        passwordChangedAt: Date,
        passwordResetCode: String,
        passwordResetExpires: Date,
        passwordResetVerified: Boolean,
        role: {
            type: String,
            enum: ["user", "manager", "admin"],
            default: "user",
        },
        active: {
            type: Boolean,
            default: true,
        },
        notificationToken: {
            type: String,
            default: null, // ✅ يقبل null افتراضيًا
        },
    },
    { timestamps: true }
);

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    // Hashing user password
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// ❗ حذف المنتجات والكورسات لما يتم حذف المستخدم
userSchema.pre("deleteOne", { document: true, query: false }, async function (next) {
    try {
      const userId = this._id;
  
      // حذف كل المنتجات المرتبطة بالمستخدم
      await mongoose.model("Product").deleteMany({ user: userId });
  
      // حذف كل الكورسات اللي هو عاملها كمحاضر
      await mongoose.model("Course").deleteMany({ instructor: userId });
  
      next();
    } catch (error) {
      next(error);
    }
  });
  

const User = mongoose.model("User", userSchema);

module.exports = User;
