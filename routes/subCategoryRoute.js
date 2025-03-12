const express = require("express");

const {
  creatSubCategoryValidator,
  getSubCategoryValidator,
  updateSubCategoryValidator,
  deletSubCategoryValidator,
} = require("../utils/validators/subCategoryValidator");
const {
  creatSubCategory,
  getSubCategory,
  getSubCategories,
  updateSubCategory,
  deletSubCategory,
  setCategoryIdToBody,
  createFilterObj,
} = require("../services/subCategoryService");

//merg params: allow us to access parameters on other routers
//ex: we need to access categoryId from category router
const router = express.Router({ mergeParams: true });

router
  .route("/")
  .post(setCategoryIdToBody, creatSubCategoryValidator, creatSubCategory)
  .get(createFilterObj, getSubCategories);
router
  .route("/:id")
  .get(getSubCategoryValidator, getSubCategory)
  .put(updateSubCategoryValidator, updateSubCategory)
  .delete(deletSubCategoryValidator, deletSubCategory);

module.exports = router;
