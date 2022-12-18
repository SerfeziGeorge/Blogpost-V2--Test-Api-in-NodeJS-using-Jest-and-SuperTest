const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");
const blogCrontroller = require("../controllers/blog.controller");

router
  .route("/")
  .get(blogCrontroller.getAllBlogs)
  .post(authController.authenticatedUser, blogCrontroller.createBlog);

router
  .route("/:id")
  .get(blogCrontroller.getOneBlog)
  .patch(authController.authenticatedUser, blogCrontroller.updateBlog)
  .delete(authController.authenticatedUser, blogCrontroller.deleteBlog);
router
  .route("/admin/:id")
  .delete(
    authController.authenticatedUser,
    authController.adminGuard("admin"),
    blogCrontroller.adminDeleteBlog
  );
module.exports = router;
