const categoryModel = require("../models/categoryModel");
const factory = require("./handlerFactory");

//@desc Getlist of category
//@route GET/api/v1/categories
//@access public
exports.getCategories = factory.getAll(categoryModel);

//@desc get spacific category by id
//@route GET /api/v1/categories/:id
//@access public
exports.getCategory = factory.getOne(categoryModel);

//@desc Creagt category
//@route POST /api/v1/categories
//@access Private
exports.creatCategory = factory.creatOne(categoryModel);
//@desc update spacific category
//@route PUT /api/v1/categories/:id
//@access private
exports.updateCategory = factory.updateOne(categoryModel);

//@desc delet spacific category
//@route DELET /api/v1/categories/:id
//@access private

exports.deletCategory = factory.deleteOne(categoryModel);
