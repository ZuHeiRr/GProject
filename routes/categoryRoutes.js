const express = require("express");
const {
  getCategoryValidator,
  creatCategoryValidator,
  updateCategoryValidator,
  deletCategoryValidator,
} = require("../utils/validators/categoryValidator");
const {
  getCategories,
  creatCategory,
  getCategory,
  updateCategory,
  deletCategory,
} = require("../services/categoryService");
// const { getSubCategories } = require("../services/subCategoryService");

const subCategoriesRoute = require("./subCategoryRoute");

const router = express.Router();

router.use("/:categoryId/subcategories", subCategoriesRoute);

router
  .route("/")
  .get(getCategories)
  .post(creatCategoryValidator, creatCategory);
router
  .route("/:id")
  .get(getCategoryValidator, getCategory)
  .put(updateCategoryValidator, updateCategory)
  .delete(deletCategoryValidator, deletCategory);
module.exports = router;
