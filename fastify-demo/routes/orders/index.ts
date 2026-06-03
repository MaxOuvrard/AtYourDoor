import { FastifyInstance } from "fastify";
import { Type } from "@sinclair/typebox";
import { OrderService } from "../../services/orders.service.js";
import {
  CreateOrderSchema,
  StatusUpdateSchema,
  OrderFilterQuerySchema,
  OrderResponseSchema,
  PaginatedOrdersSchema,
  type CreateOrderRequest,
  type StatusUpdateRequest,
  type OrderFilterQuery,
} from "../../schemas/orders.schema.js";
import { ErrorResponseSchema } from "../../schemas/error.schema.js";

export const orderRoutes = async (app: FastifyInstance) => {
  const service = new OrderService(app.prisma);

  // POST /orders — USER
  app.post<{ Body: CreateOrderRequest }>(
    "/orders",
    {
      preHandler: app.authorize(["USER"]),
      schema: {
        tags: ["orders"],
        summary: "Créer une commande",
        body: CreateOrderSchema,
        response: {
          201: OrderResponseSchema,
          400: ErrorResponseSchema,
          401: ErrorResponseSchema,
          403: ErrorResponseSchema,
          404: ErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const order = await service.createOrder(request.user.id, request.body);
      return reply.status(201).send(order);
    },
  );

  // GET /orders/me — USER (paginé + filtrable)
  app.get<{ Querystring: OrderFilterQuery }>(
    "/orders/me",
    {
      preHandler: app.authorize(["USER"]),
      schema: {
        tags: ["orders"],
        summary: "Mes commandes",
        querystring: OrderFilterQuerySchema,
        response: {
          200: PaginatedOrdersSchema,
          401: ErrorResponseSchema,
          403: ErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const result = await service.getUserOrders(request.user.id, request.query);
      return reply.send(result);
    },
  );

  // GET /orders/:id — USER / RESTAURANT / ADMIN
  app.get<{ Params: { id: string } }>(
    "/orders/:id",
    {
      preHandler: app.authorize(["USER", "RESTAURANT", "ADMIN"]),
      schema: {
        tags: ["orders"],
        summary: "Détails d'une commande",
        params: Type.Object({ id: Type.String() }),
        response: {
          200: OrderResponseSchema,
          401: ErrorResponseSchema,
          403: ErrorResponseSchema,
          404: ErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const order = await service.getOrderById(
        request.params.id,
        request.user.id,
        request.user.role,
      );
      return reply.send(order);
    },
  );

  // GET /restaurants/me/orders — RESTAURANT (paginé + filtrable)
  app.get<{ Querystring: OrderFilterQuery }>(
    "/restaurants/me/orders",
    {
      preHandler: app.authorize(["RESTAURANT"]),
      schema: {
        tags: ["orders"],
        summary: "Commandes de mon restaurant",
        querystring: OrderFilterQuerySchema,
        response: {
          200: PaginatedOrdersSchema,
          401: ErrorResponseSchema,
          403: ErrorResponseSchema,
          404: ErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const result = await service.getRestaurantOrders(request.user.id, request.query);
      return reply.send(result);
    },
  );

  // PATCH /orders/:id/status — RESTAURANT
  app.patch<{ Params: { id: string }; Body: StatusUpdateRequest }>(
    "/orders/:id/status",
    {
      preHandler: app.authorize(["RESTAURANT"]),
      schema: {
        tags: ["orders"],
        summary: "Changer le statut d'une commande",
        params: Type.Object({ id: Type.String() }),
        body: StatusUpdateSchema,
        response: {
          200: OrderResponseSchema,
          400: ErrorResponseSchema,
          401: ErrorResponseSchema,
          403: ErrorResponseSchema,
          404: ErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const order = await service.updateOrderStatus(
        request.params.id,
        request.user.id,
        request.body,
      );
      return reply.send(order);
    },
  );

  // DELETE /orders/:id — USER (annulation PENDING)
  app.delete<{ Params: { id: string } }>(
    "/orders/:id",
    {
      preHandler: app.authorize(["USER"]),
      schema: {
        tags: ["orders"],
        summary: "Annuler une commande (PENDING uniquement)",
        params: Type.Object({ id: Type.String() }),
        response: {
          200: OrderResponseSchema,
          400: ErrorResponseSchema,
          401: ErrorResponseSchema,
          403: ErrorResponseSchema,
          404: ErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const order = await service.cancelOrder(request.params.id, request.user.id);
      return reply.send(order);
    },
  );
};
