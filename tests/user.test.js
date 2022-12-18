// it("should pass true tobe thruty", () => {
//   expect(true).toBeTruthy();
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

// test getAllUsers
describe("Get all users", () => {
  describe("Success case", () => {
    it("should get all users and respond with status 200", async () => {
      // login admin
      const res = await request(app).post("/api/v1/auth/login").send({
        // user with role:user, valencia@test.com, was created manually with postman before the first test run
        // user with role:admin, matrix@test.com, was created manually with postman before the first test run
        //email: 'valencia@test.com',
        email: "matrix@test.com",
        password: "password",
      });
      // expect(res.body).toHaveProperty("message");
      // expect(res.body.message).toBe("Success for login!");
      // expect(res.body).toHaveProperty("token");
      // expect(res.body).toHaveProperty("user");
      // expect(res.body.token).toEqual(expect.any(String));
      // expect(res.body.user).toEqual(expect.any(Object));
      expect(res.statusCode).toBe(200);

      // get users if user is admin(adminGuard)
      const response = await request(app)
        .get("/api/v1/users")
        .set("Authorization", `Bearer ${res.body.token}`);
      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toBe("All users retrieved");
      expect(response.body).toHaveProperty("users");
      expect(response.statusCode).toBe(200);
    });
  });
});

// test getUser
describe("Get user by id", () => {
  describe("Success Case", () => {
    it("should return the specified user and status 200", async () => {
      // login user
      const res = await request(app).post("/api/v1/auth/login").send({
        // user with role:user, valencia@test.com, was created manually with postman before the first test run
        // user with role:admin, matrix@test.com, was created manually with postman before the first test run
        email: "valencia@test.com",
        //email: 'matrix@test.com',
        password: "password",
      });
      expect(res.statusCode).toBe(200);

      // get the user
      const response = await request(app)
        .get("/api/v1/users/6395ffb13f2da5deeeb1caa8")
        .set("Authorization", `Bearer ${res.body.token}`);

      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toBe("We found the user");
      expect(response.body).toHaveProperty("user");
      expect(response.statusCode).toBe(200);
    });
  });

  describe("Failed case - Validation Erros", () => {
    it("should respond with not authorized and status 400", async () => {
      const res = await request(app).post("/api/v1/auth/login").send({
        // users with role:user, valencia@test.com and Balencia@test.com, were created manually with postman before the first test run
        // user with role:admin, matrix@test.com, was created manually with postman before the first test run
        email: "balencia@test.com",
        password: "password",
      });
      expect(res.statusCode).toBe(200);

      // got the user valencia@test.com
      const response = await request(app)
        .get("/api/v1/users/6395ffb13f2da5deeeb1caa8")
        .set("Authorization", `Bearer ${res.body.token}`);

      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toBe(
        "Not authorized, the auth user must match the user from mongodb"
      );
      expect(response.statusCode).toBe(400);
    });
  });
});

// test getUserbyAdmin
describe("Admin get user by id", () => {
  describe("Success case", () => {
    it("should return the specified user and status 200", async () => {
      // admin login
      const res = await request(app).post("/api/v1/auth/login").send({
        email: "matrix@test.com",
        password: "password",
      });
      expect(res.statusCode).toBe(200);

      const response = await request(app)
        .get("/api/v1/users/admin/6395ffb13f2da5deeeb1caa8")
        .set("Authorization", `Bearer ${res.body.token}`);

      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toBe("We found the user");
      expect(response.body).toHaveProperty("user");
      expect(response.statusCode).toBe(200);
    });
  });

  describe("Failed case - Validation Erros", () => {
    it("should respond with not authorized and status 403", async () => {
      const res = await request(app).post("/api/v1/auth/login").send({
        // users with role:user, valencia@test.com and Balencia@test.com, were created manually with postman before the first test run
        // user with role:admin, matrix@test.com, was created manually with postman before the first test run
        email: "balencia@test.com",
        password: "password",
      });
      expect(res.statusCode).toBe(200);

      // got the user valencia@test.com
      const response = await request(app)
        .get("/api/v1/users/admin/6395ffb13f2da5deeeb1caa8")
        .set("Authorization", `Bearer ${res.body.token}`);

      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toBe(
        "Unauthorized! Resource reserved for admin"
      );
      expect(response.statusCode).toBe(403);
    });
  });
});

// test updateUser, the conditional checks are identical to getUser, so we only tested the success case
describe("Update user", () => {
  describe("Success case", () => {
    it("should update the specified user and status 200", async () => {
      //  login
      const res = await request(app).post("/api/v1/auth/login").send({
        email: "valencia@test.com",
        password: "password",
      });
      expect(res.statusCode).toBe(200);

      const response = await request(app)
        .patch("/api/v1/users/6395ffb13f2da5deeeb1caa8")
        .set("Authorization", `Bearer ${res.body.token}`)
        .send({
          firstName: "Nulova",
          lastName: "Test",
        });

      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toBe("User was updated");
      expect(response.body).toHaveProperty("user");
      expect(response.statusCode).toBe(200);
    });
  });
});

// test deleteUser the conditional checks are identical to getUser, so we only tested the success case
describe("User deletes the account, in the db we just change the status from active to inactive", () => {
  describe("Success case", () => {
    it("should set the status of the user to inactive and status 204", async () => {
      const res = await request(app).post("/api/v1/auth/login").send({
        email: "balencia@test.com",
        password: "password",
      });
      expect(res.statusCode).toBe(200);

      const response = await request(app)
        .delete("/api/v1/users/639b8b52fcc65b7bfec5545f")
        .set("Authorization", `Bearer ${res.body.token}`);

      expect(response.statusCode).toBe(204);
    });
  });
});
