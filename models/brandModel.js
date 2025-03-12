const mongoose = require("mongoose");
// creat schema
const brandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: [true, "brand required"],
      unique: [true, "brand must be unique"],
      minlenght: [3, "Too short brand name"],
      maxlenght: [32, "Too long brand name"],
    },

    slug: {
      type: String,
      lowercase: true,
    },

    image: {
      type: String,
    },
  },
  { timestamps: true }
);

//creat model
const brandModel = mongoose.model("brand", brandSchema);
module.exports = brandModel;
