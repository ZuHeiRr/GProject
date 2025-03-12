const subCategoryModel = require("../models/subCategoryModel");
const factory = require("./handlerFactory");

exports.setCategoryIdToBody = (req, res, next) => {
  //nested routes
  if (!req.body.category) req.body.category = req.params.categoryId;
  next();
};

//nested routes
//Get /api/categories/:categoryId/subCategories

exports.createFilterObj = (req, res, next) => {
  let filterObject = {};
  if (req.params.categoryId) filterObject = { category: req.params.categoryId };
  req.filterObj = filterObject;
  next();
};

//@desc Getlist of subCategory
//@route GET/api/v1/subCategories
//@access public
exports.getSubCategories = factory.getAll(subCategoryModel);

//@desc get spacific subCategory by id
//@route GET /api/v1/subCategories/:id
//@access public
exports.getSubCategory = factory.getOne(subCategoryModel);
//@desc Creagt subCategory
//@route POST /api/v1/subCategories
//@access Private
exports.creatSubCategory = factory.creatOne(subCategoryModel);

//@desc update spacific subCategory
//@route PUT /api/v1/subCategories/:id
//@access private
exports.updateSubCategory = factory.updateOne(subCategoryModel);

//@desc delet spacific subCategory
//@route DELET /api/v1/subCategories/:id
//@access private
exports.deletSubCategory = factory.deleteOne(subCategoryModel);
