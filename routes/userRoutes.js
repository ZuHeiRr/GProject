const express = require("express");
const {
  getUserValidator,
  createUserValidator,
  updateUserValidator,
  deleteUserValidator,
  changeUserPasswordValidator,
} = require("../utils/validators/userValidation");
const {
  getUsers,
  creatUser,
  getUser,
  updateUser,
  changeUserPassword,
  deleteUser,
} = require("../services/userService");
const { protect, allowedTo } = require("../services/authService");

const router = express.Router();
router.use(protect);

router.use(allowedTo("admin", "manager"));

router.put(
  "/changePassword/:id",
  changeUserPasswordValidator,
  changeUserPassword
);

router.route("/").get(getUsers).post(createUserValidator, creatUser);
router
  .route("/:id")
  .get(getUserValidator, getUser)
  .put(updateUserValidator, updateUser)
  .delete(deleteUserValidator, deleteUser);
module.exports = router;
