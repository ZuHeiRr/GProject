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

const router = express.Router();
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
