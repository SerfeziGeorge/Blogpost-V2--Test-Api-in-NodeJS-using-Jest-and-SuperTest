// it("should pass true tobe thruty", () => {
//   expect(true).toBeTruthy();
// });
// it("should pass true tobe thruty", () => {
//   expect(true).toBe(false);
// });

const dotenv = require("dotenv");
dotenv.config({
  path: "./config.env",
});

const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../app");
const jwt = require("jsonwebtoken");

const mongoDB = process.env.Database;

const user = mongoose.model("User");

jest.setTimeout(20000);

beforeAll(async () => {
  token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
});

// how to connect to db https://dev.to/mhmdlotfy96/testing-nodejs-express-api-with-jest-and-supertest-1bk0
beforeAll(async () => {
  await mongoose.connect(mongoDB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  // Close open connection in mongoose
  await mongoose.connection.close();
});

describe("Signup user", () => {
  describe("Success case", () => {
    it("should respond with a new user object and status 201", async () => {
      // some test
      const res = await request(app)
        .post("/api/v1/auth/signup")
        //.set('accept', 'application/json') // This is the line you should set
        //.set('Authorization', `Bearer ${token}`)
        .send({
          firstName: "Madrid",
          lastName: "Test",
          email: "madrid@test.com",
          password: "password",
        });

      expect(res.body).toHaveProperty("message");
      expect(res.body.message).toBe("Sign up successful, please login.");
      expect(res.body).toHaveProperty("token");
      expect(res.body).toHaveProperty("user");
      expect(res.body.token).toEqual(expect.any(String));
      expect(res.body.user).toEqual(expect.any(Object));
      expect(res.statusCode).toBe(201);
    });
  });

  describe("Failed case - Validation Errors", () => {
    it("should respond with user already exist and status 409", async () => {
      const res = await request(app).post("/api/v1/auth/signup").send({
        firstName: "Madrid",
        lastName: "Test",
        email: "madrid@test.com",
        password: "password",
      });
      expect(res.body).toHaveProperty("message");
      expect(res.body.message).toBe("User Already Exist. Please Login!");
      expect(res.statusCode).toBe(409);
    });
    it("should respond with validation error for min char lenght and status 400", async () => {
      const res = await request(app).post("/api/v1/auth/signup").send({
        firstName: "Test",
        lastName: "C",
        email: "cc@test.com",
        password: "password",
      });

      expect(res.body).toHaveProperty("message");
      expect(res.body.message).toBe(
        "Last name has more or equal then 4 characters"
      );
      expect(res.statusCode).toBe(400);
    });
    it("should respond with validation error for missing input and status 400", async () => {
      const res = await request(app).post("/api/v1/auth/signup").send({
        firstName: "",
        lastName: "Random",
        email: "random@test.com",
        password: "password",
      });

      expect(res.body).toHaveProperty("message");
      expect(res.body.message).toBe(
        "All fields required! Please provide firstName, lastName and valid email address."
      );
      expect(res.statusCode).toBe(400);
    });
    it("should respond with validation error for invalid email input and status 400", async () => {
      const res = await request(app).post("/api/v1/auth/signup").send({
        firstName: "test",
        lastName: "Random",
        email: "random-test.com",
        password: "password",
      });

      expect(res.body).toHaveProperty("message");
      expect(res.body.message).toBe("Valid email address is required!");
      expect(res.statusCode).toBe(400);
    });
    it("should respond with validation error for min password lenght and status 400", async () => {
      const res = await request(app).post("/api/v1/auth/signup").send({
        firstName: "test",
        lastName: "Random",
        email: "random@test.com",
        password: "pas",
      });

      expect(res.body).toHaveProperty("message");
      expect(res.body.message).toBe(
        "Password must be at least 8 characters long."
      );
      expect(res.statusCode).toBe(400);
    });
  });
});

describe("Login user", () => {
  describe("Success case", () => {
    it("should log in user and respond with 200", async () => {
      //some test
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({
          email: "madrid@test.com",
          //email: 'matrix@test.com', //admin role received 200
          password: "password",
        });

      expect(res.body).toHaveProperty("message");
      expect(res.body.message).toBe("Success for login!");
      expect(res.body).toHaveProperty("token");
      expect(res.body).toHaveProperty("user");
      expect(res.body.token).toEqual(expect.any(String));
      expect(res.body.user).toEqual(expect.any(Object));
      // console.log(res.body.token);
      // console.log(res.body.user);
      expect(res.statusCode).toBe(200);

      // the admin protection is set, and it is status 403
      const response = await request(app)
        .get("/api/v1/users")
        .set("Authorization", `Bearer ${res.body.token}`);
      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toBe(
        "Unauthorized! Resource reserved for admin"
      );
      expect(response.statusCode).toBe(403);
      //expect(response.body.message).toBe('All users retrieved');
      //expect(response.body).toHaveProperty('users');

      // console.log(response.body.message);
      // console.log(response.body);
      //expect(response.statusCode).toBe(200);
    });
  });
  describe("Failed case - Validation Errors", () => {
    it("should not log in user and respond with a 401 User not found", async () => {
      const res = await request(app).post("/api/v1/auth/login").send({
        email: "halamadrid@test.com",
        password: "password",
      });

      expect(res.body).toHaveProperty("message");
      expect(res.body.message).toBe("User not found!");
      expect(res.statusCode).toBe(401);
    });
    it("should respond with validation error for missing input and status 400", async () => {
      const res = await request(app).post("/api/v1/auth/login").send({
        email: "",
        password: "password",
      });

      expect(res.body).toHaveProperty("message");
      expect(res.body.message).toBe(
        "All fields required! Please provide valid email address."
      );
      expect(res.statusCode).toBe(400);
    });
    it("should respond with validation error for min password lenght and status 400", async () => {
      const res = await request(app).post("/api/v1/auth/login").send({
        email: "madrid@test.com",
        password: "pass",
      });

      expect(res.body).toHaveProperty("message");
      expect(res.body.message).toBe(
        "Password must be at least 8 characters long."
      );
      expect(res.statusCode).toBe(400);
    });
  });
});
