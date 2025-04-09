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
  uploadProductImages,
  resizeProductImages,
} = require("../services/productService");
const { protect, allowedTo } = require("../services/authService");

const router = express.Router();

router
  .route("/")
  .get(getProducts)
  .post(
    uploadProductImages,
    resizeProductImages,
    protect,
    creatProductValidator,
    creatProduct
  );
router
  .route("/:id")
  .get(getProductValidator, getProduct)
  .put(
    protect,
    allowedTo("admin", "manager"),
    updateProductValidator,
    updateProduct
  )
  .delete(
    protect,
    allowedTo("admin", "manager"),
    deletProductValidator,
    deletProduct
  );
module.exports = router;
