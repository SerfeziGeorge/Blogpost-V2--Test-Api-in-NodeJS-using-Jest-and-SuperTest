//require('dotenv').config();
const dotenv = require("dotenv");
dotenv.config({
  path: "./config.env",
});

const express = require("express");
const cors = require("cors");
const createHttpError = require("http-errors");
const path = require("path");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");

//  routers
const authRouter = require("./routes/auth.route");
const userRouter = require("./routes/user.route");
const blogRouter = require("./routes/blog.route");

const app = express();

//middleware
const errorHandler = require("./middleware/errorHandler");

app.use(cors());
// Development logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// test route
app.get("/", (req, res) => {
  res.json({
    message: "Oh, Hello!",
  });
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/blog", blogRouter);

// handling 404 errors
app.use(function (req, res, next) {
  next(createHttpError(404));
});
app.use(errorHandler);

module.exports = app;
