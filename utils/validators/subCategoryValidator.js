const { check, body } = require("express-validator");
const slugify = require("slugify");
const validatorMiddleware = require("../../middelwares/validatorMiddleware");

exports.creatSubCategoryValidator = [
  check("name")
    .notEmpty()
    .withMessage("subCategory required")
    .isLength({ min: 2 })
    .withMessage("too short subCategory name")
    .isLength({ max: 32 })
    .withMessage("too long subCategory name")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  check("category")
    .notEmpty()
    .withMessage("subCategory must be belong to category")
    .isMongoId()
    .withMessage("invalid category id fomat"),
  validatorMiddleware,
];

exports.getSubCategoryValidator = [
  check("id").isMongoId().withMessage("invalid subCategory id format"),
];

exports.updateSubCategoryValidator = [
  check("id").isMongoId().withMessage("invalid category id format"),
  body("name").custom((val, { req }) => {
    req.body.slug = slugify(val);
    return true;
  }),
  validatorMiddleware,
];

exports.deletSubCategoryValidator = [
  check("id").isMongoId().withMessage("invalid category id format"),
  validatorMiddleware,
];
