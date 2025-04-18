const mongoose = require("mongoose");
// creat schema
const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: [true, "Category required"],
      unique: [true, "Category must be unique"],
      minlenght: [3, "Too short category name"],
      maxlenght: [32, "Too long category name"],
    },

    slug: {
      type: String,
      lowercase: true,
    },
  },
  { timestamps: true }
);

//creat model
const categoryModel = mongoose.model("Category", categorySchema);
module.exports = categoryModel;
