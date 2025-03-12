const factory = require("./handlerFactory");
const brandModel = require("../models/brandModel");

//@desc Getlist of brand
//@route GET/api/v1/brands
//@access public
exports.getBrands = factory.getAll(brandModel);
//@desc get spacific brand by id
//@route GET /api/v1/brands/:id
//@access public
exports.getBrand = factory.getOne(brandModel);

//@desc Creagt brand
//@route POST /api/v1/brands
//@access Private
exports.creatBrand = factory.creatOne(brandModel);

//@desc update spacific brand
//@route PUT /api/v1/brands/:id
//@access private
exports.updateBrand = factory.updateOne(brandModel);

//@desc delet spacific brand
//@route DELET /api/v1/brands/:id
//@access private

exports.deleteBrand = factory.deleteOne(brandModel);
