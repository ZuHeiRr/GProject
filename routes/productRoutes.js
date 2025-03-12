const express = require("express");
const {
  getProductValidator,
  creatProductValidator,
  updateProductValidator,
  deletProductValidator,
} = require("../utils/validators/productValidator");
const {
  getProducts,
  creatProduct,
  getProduct,
  updateProduct,
  deletProduct,
} = require("../services/productService");

const router = express.Router();

router.route("/").get(getProducts).post(creatProductValidator, creatProduct);
router
  .route("/:id")
  .get(getProductValidator, getProduct)
  .put(updateProductValidator, updateProduct)
  .delete(deletProductValidator, deletProduct);
module.exports = router;
