import { FastifyInstance } from "fastify";
import { Type } from "@sinclair/typebox";
import { DishService } from "../../services/dishes.service.js";
import {
  CreateDishSchema,
  UpdateDishSchema,
  DishResponseSchema,
  type CreateDishRequest,
  type UpdateDishRequest,
} from "../../schemas/dishes.schema.js";
import { ErrorResponseSchema } from "../../schemas/error.schema.js";

export const dishRoutes = async (app: FastifyInstance) => {
  const service = new DishService(app.prisma);

  // GET /restaurants/:restaurantId/dishes — public
  app.get<{ Params: { restaurantId: string } }>(
    "/restaurants/:restaurantId/dishes",
    {
      schema: {
        params: Type.Object({ restaurantId: Type.String() }),
        response: {
          200: Type.Array(DishResponseSchema),
          404: ErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const dishes = await service.getDishesByRestaurant(
        request.params.restaurantId,
      );
      return reply.send(dishes);
    },
  );

  // GET /dishes/:id — public
  app.get<{ Params: { id: string } }>(
    "/dishes/:id",
    {
      schema: {
        params: Type.Object({ id: Type.String() }),
        response: {
          200: DishResponseSchema,
          404: ErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const dish = await service.getDishById(request.params.id);
      return reply.send(dish);
    },
  );

  // POST /dishes — RESTAURANT seulement
  app.post<{ Body: CreateDishRequest }>(
    "/dishes",
    {
      preHandler: app.authorize(["RESTAURANT"]),
      schema: {
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

  // PATCH /dishes/:id — RESTAURANT seulement (propriétaire du restaurant)
  app.patch<{ Params: { id: string }; Body: UpdateDishRequest }>(
    "/dishes/:id",
    {
      preHandler: app.authorize(["RESTAURANT"]),
      schema: {
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
      const dish = await service.updateDish(
        request.params.id,
        request.user.id,
        request.body,
      );
      return reply.send(dish);
    },
  );

  // DELETE /dishes/:id — RESTAURANT seulement (propriétaire du restaurant)
  app.delete<{ Params: { id: string } }>(
    "/dishes/:id",
    {
      preHandler: app.authorize(["RESTAURANT"]),
      schema: {
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
