const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");
const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp");
const ApiError = require("../utils/apiErrors");
const { uploadSingleImage } = require("../middelwares/uploadImageMiddleware");

const factory = require("./handlerFactory");

const userModel = require("../models/userModel");

// Upload single image
exports.uploadUserImage = uploadSingleImage("profileImg");

// Image processing
exports.resizeImage = asyncHandler(async (req, res, next) => {
  const filename = `user-${uuidv4()}-${Date.now()}.jpeg`;

  if (req.file) {
    await sharp(req.file.buffer)
      .resize(600, 600)
      .toFormat("jpeg")
      .jpeg({ quality: 95 })
      .toFile(`upload/user/${filename}`);

    // Save image into our db
    req.body.profileImg = filename;
  }

  next();
});

//@desc Getlist of user
//@route GET/api/v1/users
//@access private
exports.getUsers = factory.getAll(userModel);
//@desc get spacific user by id
//@route GET /api/v1/users/:id
//@access private
exports.getUser = factory.getOne(userModel);

//@desc Creagt user
//@route POST /api/v1/users
//@access Private
exports.creatUser = factory.creatOne(userModel);

//@desc update spacific user
//@route PUT /api/v1/users/:id
//@access private
exports.updateUser = asyncHandler(async (req, res, next) => {
  const document = await userModel.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      slug: req.body.slug,
      phone: req.body.phone,
      email: req.body.email,
      profileImg: req.body.profileImg,
      role: req.body.role,
    },
    {
      new: true,
    }
  );

  if (!document) {
    return next(new ApiError(`No document for this id ${req.params.id}`, 404));
  }
  res.status(200).json({ data: document });
});

exports.changeUserPassword = asyncHandler(async (req, res, next) => {
  const document = await userModel.findByIdAndUpdate(
    req.params.id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordChangedAt: Date.now(),
    },
    {
      new: true,
    }
  );

  if (!document) {
    return next(new ApiError(`No document for this id ${req.params.id}`, 404));
  }
  res.status(200).json({ data: document });
});

//@desc delet spacific user
//@route DELET /api/v1/users/:id
//@access private

exports.deleteUser = factory.deleteOne(userModel);
