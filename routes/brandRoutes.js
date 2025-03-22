const express = require("express");
const {
  getBrandValidator,
  creatBrandValidator,
  updateBrandValidator,
  deletBrandValidator,
} = require("../utils/validators/brandValidator");
const {
  getBrands,
  creatBrand,
  getBrand,
  updateBrand,
  deleteBrand,
} = require("../services/brandService");
const { protect, allowedTo } = require("../services/authService");

const router = express.Router();

router
  .route("/")
  .get(getBrands)
  .post(
    protect,
    allowedTo("admin", "manager"),
    creatBrandValidator,
    creatBrand
  );
router
  .route("/:id")
  .get(getBrandValidator, getBrand)
  .put(
    protect,
    allowedTo("admin", "manager"),
    updateBrandValidator,
    updateBrand
  )
  .delete(
    protect,
    allowedTo("admin", "manager"),
    deletBrandValidator,
    deleteBrand
  );
module.exports = router;
