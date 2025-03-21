const factory = require("./handlerFactory");
const productModel = require("../models/productModel");

//@desc Getlist of product
//@route GET/api/v1/products
//@access public
exports.getProducts = factory.getAll(productModel, "products");
//@desc get spacific product by id
//@route GET /api/v1/products/:id
//@access public
exports.getProduct = factory.getOne(productModel, "product");

//@desc Creagt product
//@route POST /api/v1/products
//@access Private
exports.creatProduct = factory.creatOne(productModel);

//@desc update spacific product
//@route PUT /api/v1/products/:id
//@access private
exports.updateProduct = factory.updateOne(productModel);
//@desc delet spacific product
//@route DELET /api/v1/products/:id
//@access private

exports.deletProduct = factory.deleteOne(productModel);

// exports.deletProduct = asyncHandler(async (req, res, next) => {
//   const { id } = req.params;
//   // const { name } = req.body;
//   const product = await productModel.findByIdAndDelete(id);
//   if (!product) {
//     return next(new ApiError(`No product for this id ${id}`, 404));
//   }
//   res.status(204).send();
// });
