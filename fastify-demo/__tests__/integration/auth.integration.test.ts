import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { FastifyInstance } from "fastify";
import { createTestServer, closeTestServer } from "../utils/test-setup.js";
import { prisma } from "../../prisma/prismaInstance.js";

describe("Authentication Integration Tests", () => {
  let server: FastifyInstance;

  beforeAll(async () => {
    server = await createTestServer();
  });

  afterAll(async () => {
    await closeTestServer(server);
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    await prisma.commandePlat.deleteMany();
    await prisma.commande.deleteMany();
    await prisma.plat.deleteMany();
    await prisma.restaurant.deleteMany();
    await prisma.user.deleteMany();
  });

  describe("POST /api/auth/register", () => {
    it("should register a new user and return a valid JWT token", async () => {
      const response = await server.inject({
        method: "POST",
        url: "/api/auth/register",
        payload: {
          email: "test@example.com",
          password: "password123",
        },
      });

      expect(response.statusCode).toBe(201);
      expect(response.json()).toHaveProperty("token");

      const token = response.json().token;
      expect(token).toBeTruthy();
      expect(typeof token).toBe("string");

      const user = await prisma.user.findUnique({
        where: { email: "test@example.com" },
      });
      expect(user).toBeDefined();
      expect(user?.email).toBe("test@example.com");
      expect(user?.password).not.toBe("password123");
    });

    it("should reject registration with invalid email format", async () => {
      const response = await server.inject({
        method: "POST",
        url: "/api/auth/register",
        payload: {
          email: "invalid-email",
          password: "password123",
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it("should return 409 when email already exists", async () => {
      await server.inject({
        method: "POST",
        url: "/api/auth/register",
        payload: {
          email: "duplicate@example.com",
          password: "password123",
        },
      });

      const response = await server.inject({
        method: "POST",
        url: "/api/auth/register",
        payload: {
          email: "duplicate@example.com",
          password: "password456",
        },
      });

      expect(response.statusCode).toBe(409);
      expect(response.json()).toHaveProperty("type");
      expect(response.json().type).toContain("conflict");
    });

    it("should reject registration with missing password", async () => {
      const response = await server.inject({
        method: "POST",
        url: "/api/auth/register",
        payload: { email: "test@example.com" },
      });

      expect(response.statusCode).toBe(400);
    });

    it("should reject registration with missing email", async () => {
      const response = await server.inject({
        method: "POST",
        url: "/api/auth/register",
        payload: { password: "password123" },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe("POST /api/auth/login", () => {
    beforeEach(async () => {
      await server.inject({
        method: "POST",
        url: "/api/auth/register",
        payload: {
          email: "login@example.com",
          password: "correctpassword",
        },
      });
    });

    it("should login with valid credentials and return JWT token", async () => {
      const response = await server.inject({
        method: "POST",
        url: "/api/auth/login",
        payload: {
          email: "login@example.com",
          password: "correctpassword",
        },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toHaveProperty("token");
      expect(typeof response.json().token).toBe("string");
    });

    it("should return 401 for non-existent user", async () => {
      const response = await server.inject({
        method: "POST",
        url: "/api/auth/login",
        payload: {
          email: "nonexistent@example.com",
          password: "password123",
        },
      });

      expect(response.statusCode).toBe(401);
    });

    it("should return 401 for incorrect password", async () => {
      const response = await server.inject({
        method: "POST",
        url: "/api/auth/login",
        payload: {
          email: "login@example.com",
          password: "wrongpassword",
        },
      });

      expect(response.statusCode).toBe(401);
    });

    it("should return 400 for missing email", async () => {
      const response = await server.inject({
        method: "POST",
        url: "/api/auth/login",
        payload: { password: "password123" },
      });

      expect(response.statusCode).toBe(400);
    });

    it("should return 400 for missing password", async () => {
      const response = await server.inject({
        method: "POST",
        url: "/api/auth/login",
        payload: { email: "login@example.com" },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe("GET /api/auth/me", () => {
    let authToken: string;

    beforeEach(async () => {
      const registerResponse = await server.inject({
        method: "POST",
        url: "/api/auth/register",
        payload: {
          email: "me@example.com",
          password: "password123",
        },
      });

      authToken = registerResponse.json().token;
    });

    it("should return user profile with valid token", async () => {
      const response = await server.inject({
        method: "GET",
        url: "/api/auth/me",
        headers: { authorization: `Bearer ${authToken}` },
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body).toHaveProperty("id");
      expect(body.email).toBe("me@example.com");
      expect(body.role).toBe("USER");
      expect(body).not.toHaveProperty("password");
    });

    it("should return 401 without token", async () => {
      const response = await server.inject({
        method: "GET",
        url: "/api/auth/me",
      });

      expect(response.statusCode).toBe(401);
    });

    it("should return 401 with invalid token", async () => {
      const response = await server.inject({
        method: "GET",
        url: "/api/auth/me",
        headers: { authorization: "Bearer invalid-token" },
      });

      expect(response.statusCode).toBe(401);
    });

    it("should return 401 with malformed authorization header", async () => {
      const response = await server.inject({
        method: "GET",
        url: "/api/auth/me",
        headers: { authorization: "InvalidFormat token" },
      });

      expect(response.statusCode).toBe(401);
    });
  });
});
