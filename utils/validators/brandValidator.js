const { check, body } = require("express-validator");
const { default: slugify } = require("slugify");
const validatorMiddleware = require("../../middelwares/validatorMiddleware");

exports.getBrandValidator = [
  check("id").isMongoId().withMessage("invalid Brand id format"),
  validatorMiddleware,
];

exports.creatBrandValidator = [
  check("name")
    .notEmpty()
    .withMessage("Brand required")
    .isLength({ min: 3 })
    .withMessage("too short Brand name")
    .isLength({ max: 32 })
    .withMessage("too long Brand name")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  validatorMiddleware,
];

exports.updateBrandValidator = [
  check("id").isMongoId().withMessage("invalid Brand id format"),
  body("name").custom((val, { req }) => {
    req.body.slug = slugify(val);
    return true;
  }),
  validatorMiddleware,
];

exports.deletBrandValidator = [
  check("id").isMongoId().withMessage("invalid Brand id format"),
  validatorMiddleware,
];
