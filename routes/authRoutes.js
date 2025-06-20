const express = require("express");
const {
  signupValidator,
  loginValidator,
} = require("../utils/validators/authValidator");

const {
  signup,
  login,
  forgotPassword,
  verifyPassResetCode,
  resetPassword,
} = require("../services/authService");

const router = express.Router();

router.post("/signup", signupValidator, signup);
router.post("/login", login);
router.post("/forgotPassword", forgotPassword);
router.post("/verifyPassResetCode", verifyPassResetCode);
router.put("/resetPassword", resetPassword);

module.exports = router;
