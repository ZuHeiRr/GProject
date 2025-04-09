const { check, body } = require("express-validator");
const { default: slugify } = require("slugify");

const validatorMiddleware = require("../../middelwares/validatorMiddleware");
const Category = require("../../models/categoryModel");
// const { translateAliases } = require("../../models/productModel");

exports.getProductValidator = [
  check("id").isMongoId().withMessage("invalid product id format"),
  validatorMiddleware,
];

exports.creatProductValidator = [
  check("title")
    .isLength({ min: 3 })
    .withMessage("too short product name")

    .notEmpty()
    .withMessage("product required")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  check("user")
    .notEmpty()
    .withMessage("Product must be belong to a user")
    .isMongoId()
    .withMessage("Invalid ID formate"),
  check("description")
    .notEmpty()
    .withMessage("Product description is required")
    .isLength({ max: 2000 })
    .withMessage("Too long description"),
  check("price")
    .notEmpty()
    .withMessage("Product price is required")
    .isNumeric()
    .withMessage("Product price must be a number")
    .isLength({ max: 32 })
    .withMessage("To long price"),
  check("images")
    .optional()
    .isArray()
    .withMessage("images should be array of string"),
  check("category")
    .notEmpty()
    .withMessage("Product must be belong to a category")
    .isMongoId()
    .withMessage("Invalid ID formate")
    .custom((categoryId) =>
      Category.findById(categoryId).then((category) => {
        if (!category) {
          return Promise.reject(
            new Error(`No category for this id:${categoryId}`)
          );
        }
      })
    ),

  validatorMiddleware,
];

exports.updateProductValidator = [
  check("id").isMongoId().withMessage("invalid product id format"),
  body("title")
    .optional()
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  validatorMiddleware,
];

exports.deletProductValidator = [
  check("id").isMongoId().withMessage("invalid product id format"),
  validatorMiddleware,
];
