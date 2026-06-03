import { FastifyInstance } from "fastify";
import { Type } from "@sinclair/typebox";
import { DishService } from "../../services/dishes.service.js";
import {
  CreateDishSchema,
  UpdateDishSchema,
  DishResponseSchema,
  PaginatedDishesSchema,
  type CreateDishRequest,
  type UpdateDishRequest,
} from "../../schemas/dishes.schema.js";
import { PaginationQuerySchema, type PaginationParams } from "../../schemas/pagination.schema.js";
import { ErrorResponseSchema } from "../../schemas/error.schema.js";

export const dishRoutes = async (app: FastifyInstance) => {
  const service = new DishService(app.prisma);

  // GET /restaurants/:restaurantId/dishes — public, paginé
  app.get<{ Params: { restaurantId: string }; Querystring: PaginationParams }>(
    "/restaurants/:restaurantId/dishes",
    {
      schema: {
        tags: ["dishes"],
        summary: "Lister les plats d'un restaurant",
        params: Type.Object({ restaurantId: Type.String() }),
        querystring: PaginationQuerySchema,
        response: {
          200: PaginatedDishesSchema,
          404: ErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const result = await service.getDishesByRestaurant(
        request.params.restaurantId,
        request.query,
      );
      return reply.send(result);
    },
  );

  // GET /dishes/:id — public
  app.get<{ Params: { id: string } }>(
    "/dishes/:id",
    {
      schema: {
        tags: ["dishes"],
        summary: "Détails d'un plat",
        params: Type.Object({ id: Type.String() }),
        response: { 200: DishResponseSchema, 404: ErrorResponseSchema },
      },
    },
    async (request, reply) => {
      const dish = await service.getDishById(request.params.id);
      return reply.send(dish);
    },
  );

  // POST /dishes — RESTAURANT
  app.post<{ Body: CreateDishRequest }>(
    "/dishes",
    {
      preHandler: app.authorize(["RESTAURANT"]),
      schema: {
        tags: ["dishes"],
        summary: "Créer un plat",
        body: CreateDishSchema,
        response: {
          201: DishResponseSchema,
          401: ErrorResponseSchema,
          403: ErrorResponseSchema,
          404: ErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const dish = await service.createDish(request.user.id, request.body);
      return reply.status(201).send(dish);
    },
  );

  // PATCH /dishes/:id — RESTAURANT (propriétaire)
  app.patch<{ Params: { id: string }; Body: UpdateDishRequest }>(
    "/dishes/:id",
    {
      preHandler: app.authorize(["RESTAURANT"]),
      schema: {
        tags: ["dishes"],
        summary: "Modifier un plat",
        params: Type.Object({ id: Type.String() }),
        body: UpdateDishSchema,
        response: {
          200: DishResponseSchema,
          401: ErrorResponseSchema,
          403: ErrorResponseSchema,
          404: ErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const dish = await service.updateDish(request.params.id, request.user.id, request.body);
      return reply.send(dish);
    },
  );

  // DELETE /dishes/:id — RESTAURANT (propriétaire)
  app.delete<{ Params: { id: string } }>(
    "/dishes/:id",
    {
      preHandler: app.authorize(["RESTAURANT"]),
      schema: {
        tags: ["dishes"],
        summary: "Supprimer un plat",
        params: Type.Object({ id: Type.String() }),
        response: {
          200: DishResponseSchema,
          401: ErrorResponseSchema,
          403: ErrorResponseSchema,
          404: ErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const dish = await service.deleteDish(request.params.id, request.user.id);
      return reply.send(dish);
    },
  );
};
