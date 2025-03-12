const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiErrors");

const factory = require("./handlerFactory");

const userModel = require("../models/userModel");

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
