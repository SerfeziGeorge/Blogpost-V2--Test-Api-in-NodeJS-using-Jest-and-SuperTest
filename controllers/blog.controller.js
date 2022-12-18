const { body } = require("express-validator");
const Blog = require("../models/blog.model");
const { find } = require("../models/user.model");
const User = require("../models/user.model");

exports.createBlog = async (req, res, next) => {
  try {
    const blog = await Blog.create({
      user: req.user.id,
      blog: req.body.blog,
    });

    //If everything ok, send token to client
    if (blog) {
      return res.status(201).json({
        blog,
        message: "Blog created!",
      });
    }
  } catch (err) {
    next(err);
  }
};

exports.getAllBlogs = async (req, res, next) => {
  try {
    const blogs = await Blog.find();

    res.status(200).json({ blogs, message: "All blogs retrieved" });
  } catch (err) {
    next(err);
  }
};

exports.getOneBlog = async (req, res, next) => {
  const blog = await Blog.findById(req.params.id);

  if (!blog) {
    return res.status(401).json({
      message: "The blog you tried to find does not exists",
    });
  }

  res.status(200).json({ blog, message: "Success" });
};
exports.updateBlog = async (req, res, next) => {
  const findblog = await Blog.findById(req.params.id);

  if (!findblog) {
    return res.status(401).json({
      message: "The blog you tried to find does not exists",
    });
  }
  if (findblog.user.toString() != req.user._id.toString()) {
    return res.status(400).json({
      message: "Not authorized, the auth user must match the owner of the blog",
    });
  }

  const blog = await Blog.findOneAndUpdate(req.params.id, req.body, {
    user: req.user.id,
    new: true,
    runValidators: true,
  });

  res.status(200).json({ blog, message: "Success, updated blog" });
};
exports.deleteBlog = async (req, res, next) => {
  const findblog = await Blog.findById(req.params.id);

  // disable only for test purpose!!!
  // if (findblog.user.toString() != req.user._id.toString()) {
  //   return res.status(400).json({
  //     message: "Not authorized, the auth user must match the owner of the blog",
  //   });
  // }

  await Blog.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: "success",
    data: null,
  });
};
exports.adminDeleteBlog = async (req, res, next) => {
  await Blog.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: "success",
    data: null,
  });
};
