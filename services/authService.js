const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiErrors");
const createToken = require("../utils/createToken");

const User = require("../models/userModel");

// @desc     Signup
// @route   GET /api/v1/auth/signup
// @access  Public
exports.signup = asyncHandler(async (req, res, next) => {
  // 1- Create user
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  });

  // 2- Generate token
  const token = createToken(user._id);

  res.status(201).json({ data: user, token });
});
