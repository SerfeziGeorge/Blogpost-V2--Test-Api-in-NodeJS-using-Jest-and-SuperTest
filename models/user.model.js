const mongoose = require("mongoose");
//const findOrCreate = require('mongoose-findorcreate');
const validator = require("validator");
const Schema = mongoose.Schema;
const bcrypt = require("bcryptjs");

const UserSchema = new Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      maxlength: [18, "First name has less or equal then 18 characters"],
      minlength: [4, "First name has more or equal then 4 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      maxlength: [18, "Last name has less or equal then 18 characters"],
      minlength: [4, "Last name has more or equal then 4 characters"],
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: [true, "The email address provided is already in use!"],
      lowercase: true,
      validate: [validator.isEmail, "Valid email address is required!"],
    },
    password: {
      type: String,
      required: true,
      trim: true,
      select: false, //Set to true if this path should always be included in the results, false if it should be excluded by default.  If it was set to true, and got allUsers, it would show all the encrypted passwords for the users in the db.
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
  },

  {
    timestamps: true,
  }
);

UserSchema.set("toObject", { virtuals: true });
UserSchema.set("toJSON", { virtuals: true });

UserSchema.virtual("full_name")
  .get(function () {
    return this.firstName + " " + this.lastName;
  })
  .set(function (newName) {
    var nameParts = newName.split(" ");
    this.firstName = nameParts[0];
    this.lastName = nameParts[1];
  });

UserSchema.methods.comparePassword = async function (canditatePassword) {
  const isMatch = await bcrypt.compare(canditatePassword, this.password);
  return isMatch;
};

//Export model
module.exports = mongoose.model("User", UserSchema);
