import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import type { FastifyInstance } from "fastify";
import { hash } from "bcryptjs";
import { createTestServer, closeTestServer } from "../utils/test-setup.js";
import { prisma } from "../../prisma/prismaInstance.js";

/**
 * Tests d'intégration — Commandes
 * Couvre : création, lecture, changement de statut, annulation, permissions.
 */
describe("Orders Integration Tests", () => {
  let server: FastifyInstance;
  let userToken: string;
  let restaurantToken: string;
  let restaurantId: string;
  let dishId: string;

  beforeAll(async () => {
    server = await createTestServer();
  });

  afterAll(async () => {
    await closeTestServer(server);
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Nettoyage dans l'ordre des dépendances
    await prisma.commandePlat.deleteMany();
    await prisma.commande.deleteMany();
    await prisma.plat.deleteMany();
    await prisma.restaurant.deleteMany();
    await prisma.user.deleteMany();

    // Utilisateur régulier
    const userPwd = await hash("UserPass1!", 10);
    const user = await prisma.user.create({
      data: { email: "user@test.com", password: userPwd, role: "USER" },
    });
    userToken = server.jwt.sign({ id: user.id });

    // Propriétaire de restaurant
    const ownerPwd = await hash("OwnerPass1!", 10);
    const owner = await prisma.user.create({
      data: { email: "owner@test.com", password: ownerPwd, role: "RESTAURANT" },
    });
    restaurantToken = server.jwt.sign({ id: owner.id });

    // Restaurant + plat
    const restaurant = await prisma.restaurant.create({
      data: {
        name: "Test Resto",
        address: "1 rue Test",
        ownerId: owner.id,
      },
    });
    restaurantId = restaurant.id;

    const dish = await prisma.plat.create({
      data: {
        name: "Burger",
        price: 12.5,
        restaurantId: restaurant.id,
      },
    });
    dishId = dish.id;
  });

  // ── Création ───────────────────────────────────────────────────────────────

  describe("POST /api/orders", () => {
    it("should create an order and return 201", async () => {
      const response = await server.inject({
        method: "POST",
        url: "/api/orders",
        headers: { authorization: `Bearer ${userToken}` },
        payload: {
          restaurantId,
          deliveryAddress: "2 rue Livraison",
          items: [{ dishId, quantity: 2 }],
        },
      });

      expect(response.statusCode).toBe(201);
      const order = response.json();
      expect(order).toHaveProperty("id");
      expect(order.status).toBe("PENDING");
      expect(Number(order.totalPrice)).toBeCloseTo(25);
      expect(order.commandePlats).toHaveLength(1);
      expect(order.commandePlats[0].quantity).toBe(2);
    });

    it("should return 400 when dish belongs to another restaurant", async () => {
      const otherOwner = await prisma.user.create({
        data: {
          email: "other@test.com",
          password: await hash("p", 10),
          role: "RESTAURANT",
        },
      });
      const otherResto = await prisma.restaurant.create({
        data: { name: "Other", address: "3 rue Autre", ownerId: otherOwner.id },
      });
      const otherDish = await prisma.plat.create({
        data: { name: "Pizza", price: 10, restaurantId: otherResto.id },
      });

      const response = await server.inject({
        method: "POST",
        url: "/api/orders",
        headers: { authorization: `Bearer ${userToken}` },
        payload: {
          restaurantId,
          deliveryAddress: "2 rue Livraison",
          items: [
            { dishId, quantity: 1 },
            { dishId: otherDish.id, quantity: 1 },
          ],
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it("should return 401 without authentication", async () => {
      const response = await server.inject({
        method: "POST",
        url: "/api/orders",
        payload: {
          restaurantId,
          deliveryAddress: "2 rue Livraison",
          items: [{ dishId, quantity: 1 }],
        },
      });

      expect(response.statusCode).toBe(401);
    });

    it("should return 403 when RESTAURANT role tries to create an order", async () => {
      const response = await server.inject({
        method: "POST",
        url: "/api/orders",
        headers: { authorization: `Bearer ${restaurantToken}` },
        payload: {
          restaurantId,
          deliveryAddress: "2 rue Livraison",
          items: [{ dishId, quantity: 1 }],
        },
      });

      expect(response.statusCode).toBe(403);
    });
  });

  // ── Lecture ────────────────────────────────────────────────────────────────

  describe("GET /api/orders/me", () => {
    it("should return the user's orders", async () => {
      // Créer une commande
      await server.inject({
        method: "POST",
        url: "/api/orders",
        headers: { authorization: `Bearer ${userToken}` },
        payload: {
          restaurantId,
          deliveryAddress: "2 rue Livraison",
          items: [{ dishId, quantity: 1 }],
        },
      });

      const response = await server.inject({
        method: "GET",
        url: "/api/orders/me",
        headers: { authorization: `Bearer ${userToken}` },
      });

      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.json().data)).toBe(true);
      expect(response.json().data.length).toBe(1);
    });

    it("should not see orders from another user", async () => {
      const otherPwd = await hash("p", 10);
      const other = await prisma.user.create({
        data: { email: "other2@test.com", password: otherPwd, role: "USER" },
      });
      const otherToken = server.jwt.sign({ id: other.id });

      await server.inject({
        method: "POST",
        url: "/api/orders",
        headers: { authorization: `Bearer ${userToken}` },
        payload: {
          restaurantId,
          deliveryAddress: "Adresse",
          items: [{ dishId, quantity: 1 }],
        },
      });

      const response = await server.inject({
        method: "GET",
        url: "/api/orders/me",
        headers: { authorization: `Bearer ${otherToken}` },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json().data.length).toBe(0);
    });
  });

  describe("GET /api/restaurants/me/orders", () => {
    it("should return orders for the restaurant owner", async () => {
      await server.inject({
        method: "POST",
        url: "/api/orders",
        headers: { authorization: `Bearer ${userToken}` },
        payload: {
          restaurantId,
          deliveryAddress: "Adresse",
          items: [{ dishId, quantity: 1 }],
        },
      });

      const response = await server.inject({
        method: "GET",
        url: "/api/restaurants/me/orders",
        headers: { authorization: `Bearer ${restaurantToken}` },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json().data.length).toBe(1);
    });
  });

  // ── Changement de statut ───────────────────────────────────────────────────

  describe("PATCH /api/orders/:id/status", () => {
    it("should advance order status through valid transitions", async () => {
      const create = await server.inject({
        method: "POST",
        url: "/api/orders",
        headers: { authorization: `Bearer ${userToken}` },
        payload: {
          restaurantId,
          deliveryAddress: "Adresse",
          items: [{ dishId, quantity: 1 }],
        },
      });
      const orderId = create.json().id;

      for (const status of ["CONFIRMED", "PREPARING", "READY"] as const) {
        const res = await server.inject({
          method: "PATCH",
          url: `/api/orders/${orderId}/status`,
          headers: { authorization: `Bearer ${restaurantToken}` },
          payload: { status },
        });
        expect(res.statusCode).toBe(200);
        expect(res.json().status).toBe(status);
      }
    });

    it("should return 400 for invalid status transition", async () => {
      const create = await server.inject({
        method: "POST",
        url: "/api/orders",
        headers: { authorization: `Bearer ${userToken}` },
        payload: {
          restaurantId,
          deliveryAddress: "Adresse",
          items: [{ dishId, quantity: 1 }],
        },
      });
      const orderId = create.json().id;

      // PENDING → DELIVERED est invalide (saute des étapes)
      const response = await server.inject({
        method: "PATCH",
        url: `/api/orders/${orderId}/status`,
        headers: { authorization: `Bearer ${restaurantToken}` },
        payload: { status: "DELIVERED" },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  // ── Annulation ─────────────────────────────────────────────────────────────

  describe("DELETE /api/orders/:id", () => {
    it("should cancel a PENDING order", async () => {
      const create = await server.inject({
        method: "POST",
        url: "/api/orders",
        headers: { authorization: `Bearer ${userToken}` },
        payload: {
          restaurantId,
          deliveryAddress: "Adresse",
          items: [{ dishId, quantity: 1 }],
        },
      });
      const orderId = create.json().id;

      const response = await server.inject({
        method: "DELETE",
        url: `/api/orders/${orderId}`,
        headers: { authorization: `Bearer ${userToken}` },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json().status).toBe("CANCELLED");
    });

    it("should return 400 when trying to cancel a non-PENDING order", async () => {
      const create = await server.inject({
        method: "POST",
        url: "/api/orders",
        headers: { authorization: `Bearer ${userToken}` },
        payload: {
          restaurantId,
          deliveryAddress: "Adresse",
          items: [{ dishId, quantity: 1 }],
        },
      });
      const orderId = create.json().id;

      // Avancer à CONFIRMED
      await server.inject({
        method: "PATCH",
        url: `/api/orders/${orderId}/status`,
        headers: { authorization: `Bearer ${restaurantToken}` },
        payload: { status: "CONFIRMED" },
      });

      const response = await server.inject({
        method: "DELETE",
        url: `/api/orders/${orderId}`,
        headers: { authorization: `Bearer ${userToken}` },
      });

      expect(response.statusCode).toBe(400);
    });

    it("should return 403 when user tries to cancel another user's order", async () => {
      const create = await server.inject({
        method: "POST",
        url: "/api/orders",
        headers: { authorization: `Bearer ${userToken}` },
        payload: {
          restaurantId,
          deliveryAddress: "Adresse",
          items: [{ dishId, quantity: 1 }],
        },
      });
      const orderId = create.json().id;

      const other = await prisma.user.create({
        data: {
          email: "thief@test.com",
          password: await hash("p", 10),
          role: "USER",
        },
      });
      const otherToken = server.jwt.sign({ id: other.id });

      const response = await server.inject({
        method: "DELETE",
        url: `/api/orders/${orderId}`,
        headers: { authorization: `Bearer ${otherToken}` },
      });

      expect(response.statusCode).toBe(403);
    });
  });
});
