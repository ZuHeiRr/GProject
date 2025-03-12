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

const router = express.Router();

router.route("/").get(getBrands).post(creatBrandValidator, creatBrand);
router
  .route("/:id")
  .get(getBrandValidator, getBrand)
  .put(updateBrandValidator, updateBrand)
  .delete(deletBrandValidator, deleteBrand);
module.exports = router;
