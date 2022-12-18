//const { DateTime } = require("luxon");
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const BlogSchema = new Schema(
  {
    blog: {
      type: String,
      required: [true, "Text is required"],
      minlength: [6, "The blog must have at least 6 characters"],
    },
    photo_url: { type: String, required: false },
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

BlogSchema.set("toObject", { virtuals: true });
BlogSchema.set("toJSON", { virtuals: true });

// Sets the createdAt parameter equal to the current time
// BlogSchema.pre('save', (next) => {
// 	now = new Date();
// 	if (!this.createdAt) {
// 		this.createdAt = now;
// 	}
// 	next();
// });

// BlogSchema.virtual('added_formatted').get(function () {
// 	return DateTime.fromJSDate(this.added).toLocaleString(DateTime.DATE_MED);
// });

//Export model
module.exports = mongoose.model("Blog", BlogSchema);
