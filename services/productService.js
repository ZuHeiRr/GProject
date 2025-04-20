const asyncHandler = require("express-async-handler");
const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const factory = require("./handlerFactory");
const productModel = require("../models/productModel");
const cloudinary = require("../cloudinary/cloudi");

const { uploadMixOfImages } = require("../middelwares/uploadImageMiddleware");

exports.uploadProductImages = uploadMixOfImages([
  // {
  //   name: "imageCover",
  //   maxCount: 1,
  // },
  {
    name: "images",
    maxCount: 5,
  },
]);

// exports.resizeProductImages = asyncHandler(async (req, res, next) => {
//   // console.log(req.files);
//   //1- Image processing for imageCover
//   // if (req.files.imageCover) {
//   //   const imageCoverFileName = `product-${uuidv4()}-${Date.now()}-cover.jpeg`;

//   //   await sharp(req.files.imageCover[0].buffer)
//   //     .resize(2000, 1333)
//   //     .toFormat("jpeg")
//   //     .jpeg({ quality: 95 })
//   //     .toFile(`upload/products/${imageCoverFileName}`);

//   //   // Save image into our db
//   //   req.body.imageCover = imageCoverFileName;
//   // }
//   //2- Image processing for images
//   if (req.files.images) {
//     req.body.images = [];
//     await Promise.all(
//       req.files.images.map(async (img, index) => {
//         const imageName = `product-${uuidv4()}-${Date.now()}-${index + 1}.jpeg`;

//         await sharp(img.buffer)
//           .resize(2000, 1333)
//           .toFormat("jpeg")
//           .jpeg({ quality: 95 })
//           .toFile(`upload/products/${imageName}`);

//         // Save image into our db
//         req.body.images.push(imageName);
//       })
//     );

//     next();
//   }
// });


exports.resizeProductImages = asyncHandler(async (req, res, next) => {
  if (req.files.images) {
    req.body.images = [];

    await Promise.all(
      req.files.images.map(async (img, index) => {
        const imageName = `product-${uuidv4()}-${Date.now()}-${index + 1}`;

        // تعديل الصورة باستخدام sharp
        const resizedImageBuffer = await sharp(img.buffer)
          .resize(2000, 1333)
          .toFormat("jpeg")
          .jpeg({ quality: 95 })
          .toBuffer();

        // رفع الصورة على Cloudinary باستخدام Promise
        const imageUploadResult = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: "products",
              public_id: imageName,
              resource_type: "image",
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );

          stream.end(resizedImageBuffer);
        });

        // حفظ الرابط في الـ body
        req.body.images.push(imageUploadResult.secure_url);
      })
    );
  }

  next();
});


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
