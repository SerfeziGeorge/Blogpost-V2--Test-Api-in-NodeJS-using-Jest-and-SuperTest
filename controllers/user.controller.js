const User = require("../models/user.model");

exports.getAllUsers = async (req, res, next) => {
  try {
    //	console.log(req.user);
    const users = await User.find({ role: "user" }).select("-password");
    //.sort({ _id: -1 });
    res.status(200).json({ users, message: "All users retrieved" });
  } catch (err) {
    next(err);
  }
};

exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.params.id }).select("-password");

    if (!user) {
      return res.status(401).json({
        message: "User not found!",
      });
    }

    if (req.user.id !== req.params.id) {
      return res.status(400).json({
        message:
          "Not authorized, the auth user must match the user from mongodb",
      });
    }

    res.status(200).json({
      message: "We found the user",
      user: user,
    });
  } catch (err) {
    next(err);
  }
};

exports.getUserbyAdmin = async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.params.id }).select("-password");

    if (!user) {
      return res.status(401).json({
        message: "User not found!",
      });
    }

    res.status(200).json({
      message: "We found the user",
      user: user,
    });
  } catch (err) {
    next(err);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    //
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;

    if (!firstName || !lastName) {
      return res.status(400).json({
        message: "All fields required! Please provide firstName and lastName.",
      });
    }

    const user = await User.findOne({ _id: req.params.id }).select("-password");

    if (!user) {
      return res.status(401).json({
        message: "User not found!",
      });
    }

    if (req.user.id !== req.params.id) {
      return res.status(400).json({
        message:
          "Not authorized, the auth user must match the user from mongodb",
      });
    }

    user.firstName = firstName;
    user.lastName = lastName;

    await user.save();

    res.status(200).json({
      message: "User was updated",
      user: user,
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    //selecting the active property from user model to false
    await User.findByIdAndUpdate(req.user.id, { active: false });

    if (req.user.id !== req.params.id) {
      return res.status(400).json({
        message:
          "Not authorized, the auth user must match the user from mongodb",
      });
    }

    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (err) {
    next(err);
  }
};
