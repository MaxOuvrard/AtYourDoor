import { FastifyInstance } from "fastify";
import { Type } from "@sinclair/typebox";
import { OrderService } from "../../services/orders.service.js";
import {
  CreateOrderSchema,
  StatusUpdateSchema,
  OrderResponseSchema,
  type CreateOrderRequest,
  type StatusUpdateRequest,
} from "../../schemas/orders.schema.js";
import { ErrorResponseSchema } from "../../schemas/error.schema.js";

export const orderRoutes = async (app: FastifyInstance) => {
  const service = new OrderService(app.prisma);

  // POST /orders — USER crée une commande
  app.post<{ Body: CreateOrderRequest }>(
    "/orders",
    {
      preHandler: app.authorize(["USER"]),
      schema: {
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

  // GET /orders/me — USER liste ses commandes
  app.get(
    "/orders/me",
    {
      preHandler: app.authorize(["USER"]),
      schema: {
        response: {
          200: Type.Array(OrderResponseSchema),
          401: ErrorResponseSchema,
          403: ErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const orders = await service.getUserOrders(request.user.id);
      return reply.send(orders);
    },
  );

  // GET /orders/:id — USER ou RESTAURANT consulte une commande
  app.get<{ Params: { id: string } }>(
    "/orders/:id",
    {
      preHandler: app.authorize(["USER", "RESTAURANT", "ADMIN"]),
      schema: {
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

  // GET /restaurants/me/orders — RESTAURANT liste les commandes de son resto
  app.get(
    "/restaurants/me/orders",
    {
      preHandler: app.authorize(["RESTAURANT"]),
      schema: {
        response: {
          200: Type.Array(OrderResponseSchema),
          401: ErrorResponseSchema,
          403: ErrorResponseSchema,
          404: ErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const orders = await service.getRestaurantOrders(request.user.id);
      return reply.send(orders);
    },
  );

  // PATCH /orders/:id/status — RESTAURANT met à jour le statut
  app.patch<{ Params: { id: string }; Body: StatusUpdateRequest }>(
    "/orders/:id/status",
    {
      preHandler: app.authorize(["RESTAURANT"]),
      schema: {
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

  // DELETE /orders/:id — USER annule sa commande (PENDING uniquement)
  app.delete<{ Params: { id: string } }>(
    "/orders/:id",
    {
      preHandler: app.authorize(["USER"]),
      schema: {
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
      const order = await service.cancelOrder(
        request.params.id,
        request.user.id,
      );
      return reply.send(order);
    },
  );
};
