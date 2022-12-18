const dotenv = require("dotenv");
dotenv.config({
  path: "./config.env",
});

const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../app");
const jwt = require("jsonwebtoken");

const mongoDB = process.env.Database;

//const User = mongoose.model('User');
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

// test createBlog
describe("Create blog", () => {
  describe("Success case", () => {
    it("should create blog and have status 201", async () => {
      // login
      const res = await request(app).post("/api/v1/auth/login").send({
        email: "valencia@test.com",
        password: "password",
      });

      expect(res.statusCode).toBe(200);

      const response = await request(app)
        .post("/api/v1/blog/")
        .set("Authorization", `Bearer ${res.body.token}`)
        .send({
          blog: "Lorem Ipsom, Lorem Ipsom",
        });

      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toBe("Blog created!");
      expect(response.body).toHaveProperty("blog");
      expect(response.statusCode).toBe(201);
    });
  });

  describe("Failed case", () => {
    it("should respond with error if there is no text and status 400", async () => {
      // login
      const res = await request(app).post("/api/v1/auth/login").send({
        email: "valencia@test.com",
        password: "password",
      });
      expect(res.statusCode).toBe(200);

      const response = await request(app)
        .post("/api/v1/blog/")
        .set("Authorization", `Bearer ${res.body.token}`)
        .send({
          // blog: "Lorem",
        });

      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toBe("Text is required");
      expect(response.statusCode).toBe(400);
    });
    it("should respond with error for min char and status 400", async () => {
      // login
      const res = await request(app).post("/api/v1/auth/login").send({
        email: "valencia@test.com",
        password: "password",
      });
      expect(res.statusCode).toBe(200);

      const response = await request(app)
        .post("/api/v1/blog/")
        .set("Authorization", `Bearer ${res.body.token}`)
        .send({
          blog: "Lorem",
        });

      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toBe(
        "The blog must have at least 6 characters"
      );
      expect(response.statusCode).toBe(400);
    });
  });
});

// test getAllBlogs
describe("Get all blogs", () => {
  describe("Success case", () => {
    it("should retrieve all blogs and status 200", async () => {
      const response = await request(app).get("/api/v1/blog/");

      expect(response.body).toHaveProperty("blogs");
      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toBe("All blogs retrieved");
      expect(response.statusCode).toBe(200);
    });
  });
});

// test getOneBlog
describe("Get one blog", () => {
  describe("Success case", () => {
    it("should retrieve one blog by id and status 200", async () => {
      const response = await request(app).get(
        "/api/v1/blog/639dd94c792b07b00549dfd1"
      );

      expect(response.body).toHaveProperty("blog");
      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toBe("Success");
      expect(response.statusCode).toBe(200);
    });
  });
  describe("Fail case", () => {
    it("should respond with error and status 401", async () => {
      const response = await request(app).get(
        "/api/v1/blog/639de068a43f7c5bfd98edee"
      );

      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toBe(
        "The blog you tried to find does not exists"
      );
      expect(response.statusCode).toBe(401);
    });
  });
});

// test UpdateBlog
describe("Update one blog", () => {
  describe("Success case", () => {
    it("should retrieve one blog by id and status 200", async () => {
      // login
      const res = await request(app).post("/api/v1/auth/login").send({
        email: "valencia@test.com",
        password: "password",
      });
      expect(res.statusCode).toBe(200);

      const response = await request(app)
        .patch("/api/v1/blog/639dd94c792b07b00549dfd1")
        .set("Authorization", `Bearer ${res.body.token}`)
        .send({
          blog: "Test Lorem Update",
        });

      expect(response.body).toHaveProperty("blog");
      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toBe("Success, updated blog");
      expect(response.statusCode).toBe(200);
    });
  });
  describe("Fail case", () => {
    it("should respond with error, not authorized and status 400", async () => {
      const res = await request(app).post("/api/v1/auth/login").send({
        email: "balencia@test.com",
        password: "password",
      });
      expect(res.statusCode).toBe(200);

      const response = await request(app)
        .patch("/api/v1/blog/639dd94c792b07b00549dfd1")
        .set("Authorization", `Bearer ${res.body.token}`)
        .send({
          blog: "Test Lorem Update Fail",
        });

      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toBe(
        "Not authorized, the auth user must match the owner of the blog"
      );
      expect(response.statusCode).toBe(400);
    });
  });
});

// test deleteBlog
// we must use a blog saved in db for this test to pass with only the owner of the document is auth to delete
// we need to comment out the findBlog variable in the controller in order to run the test without a blog id from mongodb
describe("Delete one blog", () => {
  describe("Success case", () => {
    it("should delete only if user is owner and status 204", async () => {
      // login
      const res = await request(app).post("/api/v1/auth/login").send({
        email: "valencia@test.com",
        password: "password",
      });
      expect(res.statusCode).toBe(200);

      const response = await request(app)
        .delete("/api/v1/blog/639df9f73ea27953ccc231d9")
        .set("Authorization", `Bearer ${res.body.token}`);

      expect(response.statusCode).toBe(204);
    });
    it("should delete blog only if user is admin and status 403", async () => {
      // login
      const res = await request(app).post("/api/v1/auth/login").send({
        email: "valencia@test.com",
        password: "password",
      });
      expect(res.statusCode).toBe(200);

      const response = await request(app)
        .delete("/api/v1/blog/admin/639df9f73ea27953ccc231d9")
        .set("Authorization", `Bearer ${res.body.token}`);

      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toBe(
        "Unauthorized! Resource reserved for admin"
      );
      expect(response.statusCode).toBe(403);
    });
  });
});
