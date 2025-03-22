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
const { protect, allowedTo } = require("../services/authService");

//merg params: allow us to access parameters on other routers
//ex: we need to access categoryId from category router
const router = express.Router({ mergeParams: true });

router
  .route("/")
  .post(
    protect,
    allowedTo("admin", "manager"),
    setCategoryIdToBody,
    creatSubCategoryValidator,
    creatSubCategory
  )
  .get(createFilterObj, getSubCategories);
router
  .route("/:id")
  .get(getSubCategoryValidator, getSubCategory)
  .put(
    protect,
    allowedTo("admin", "manager"),
    updateSubCategoryValidator,
    updateSubCategory
  )
  .delete(
    protect,
    allowedTo("admin", "manager"),
    deletSubCategoryValidator,
    deletSubCategory
  );

module.exports = router;
