const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");
const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp");
const ApiError = require("../utils/apiErrors");
const { uploadSingleImage } = require("../middelwares/uploadImageMiddleware");
const createToken = require("../utils/createToken");

const factory = require("./handlerFactory");
const cloudinary = require("../cloudinary/cloudi");

const userModel = require("../models/userModel");

// Upload single image
exports.uploadUserImage = uploadSingleImage("profileImg");

// Image processing
// exports.resizeImage = asyncHandler(async (req, res, next) => {
//   const filename = `user-${uuidv4()}-${Date.now()}.jpeg`;

//   if (req.file) {
//     await sharp(req.file.buffer)
//       .resize(600, 600)
//       .toFormat("jpeg")
//       .jpeg({ quality: 95 })
//       .toFile(`upload/user/${filename}`);

//     // Save image into our db
//     req.body.profileImg = filename;
//   }

//   next();
// });
exports.resizeUserImage = asyncHandler(async (req, res, next) => {
  //const file = req.file; // ✅ تم التعديل هنا
  const { file } = req;

  if (file) {
    const imageName = `user-${uuidv4()}-${Date.now()}`;

    const resizedImageBuffer = await sharp(file.buffer)
      .resize(500, 500)
      .toFormat("jpeg")
      .jpeg({ quality: 90 })
      .toBuffer();

    const imageUploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "users",
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

    req.body.profileImg = imageUploadResult.secure_url;
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

// @desc    Get Logged user data
// @route   GET /api/v1/users/getMe
// @access  Private/Protect
exports.getLoggedUserData = asyncHandler(async (req, res, next) => {
  req.params.id = req.user._id;
  next();
});

// @desc    Update logged user password
// @route   PUT /api/v1/users/updateMyPassword
// @access  Private/Protect
exports.updateLoggedUserPassword = asyncHandler(async (req, res, next) => {
  console.log(req.user._id);

  // 1) Update user password based user payload (req.user._id)
  const user = await userModel.findByIdAndUpdate(
    req.user._id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordChangedAt: Date.now(),
    },
    {
      new: true,
    }
  );
  console.log(req.user._id);

  // 2) Generate token
  const token = createToken(user._id);

  res.status(200).json({ data: user, token });
});

// @desc    Update logged user data (without password, role)
// @route   PUT /api/v1/users/updateMe
// @access  Private/Protect
exports.updateLoggedUserData = asyncHandler(async (req, res, next) => {
    const updateFields = {};

    // فقط حدث الحقول المرسلة
    if (req.body.name) updateFields.name = req.body.name;
    if (req.body.email) updateFields.email = req.body.email;
    if (req.body.phone) updateFields.phone = req.body.phone;
    if (req.body.profileImg) updateFields.profileImg = req.body.profileImg;
    if (req.body.notificationToken)
        updateFields.notificationToken = req.body.notificationToken;

    const updatedUser = await userModel.findByIdAndUpdate(
        req.user._id,
        updateFields,
        {
            new: true,
            runValidators: true,
        }
    );

    if (!updatedUser) {
        return next(new ApiError("المستخدم غير موجود", 404));
    }

    res.status(200).json({ data: updatedUser });
});
  

// @desc    Deactivate logged user
// @route   DELETE /api/v1/users/deleteMe
// @access  Private/Protect
exports.deleteLoggedUserData = asyncHandler(async (req, res, next) => {
    const user = await userModel.findById(req.user._id);

    if (!user) {
        return next(new ApiError("المستخدم غير موجود", 404));
    }

    // تشغيل middleware لحذف المنتجات والكورسات
    await user.deleteOne();

    res.status(200).json({ message: "تم حذف الحساب بنجاح" });
});
  