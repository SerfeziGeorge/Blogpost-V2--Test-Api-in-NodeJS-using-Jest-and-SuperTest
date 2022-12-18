const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");
const userController = require("../controllers/user.controller");

// user must be logged in for access route below
//router.use(authController.adminGuards('admin'));
router.route("/").get(
  authController.authenticatedUser,
  // This route is for admin
  authController.adminGuard("admin"),
  userController.getAllUsers
);

router
  .route("/:id")
  .get(authController.authenticatedUser, userController.getUser)
  .patch(authController.authenticatedUser, userController.updateUser)
  .delete(authController.authenticatedUser, userController.deleteUser);
router
  .route("/admin/:id")
  .get(
    authController.authenticatedUser,
    authController.adminGuard("admin"),
    userController.getUserbyAdmin
  );

module.exports = router;
