import { FastifyInstance } from "fastify";
import { RestaurantService } from "../../services/restaurants.service.js";
import {
  CreateRestaurantSchema,
  UpdateRestaurantSchema,
  RestaurantResponseSchema,
  type CreateRestaurantRequest,
  type UpdateRestaurantRequest,
} from "../../schemas/restaurants.schema.js";
import { ErrorResponseSchema } from "../../schemas/error.schema.js";
import { Type } from "@sinclair/typebox";

export const restaurantRoutes = async (app: FastifyInstance) => {
  const service = new RestaurantService(app.prisma);

  // GET /restaurants — public
  app.get(
    "/restaurants",
    {
      schema: {
        response: {
          200: Type.Array(RestaurantResponseSchema),
        },
      },
    },
    async (_request, reply) => {
      const restaurants = await service.getAllRestaurants();
      return reply.send(restaurants);
    },
  );

  // GET /restaurants/me — propriétaire uniquement
  app.get(
    "/restaurants/me",
    {
      preHandler: app.authorize(["RESTAURANT"]),
      schema: {
        response: {
          200: RestaurantResponseSchema,
          401: ErrorResponseSchema,
          403: ErrorResponseSchema,
          404: ErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const restaurant = await service.getMyRestaurant(request.user.id);
      return reply.send(restaurant);
    },
  );

  // POST /restaurants — ADMIN seulement
  app.post<{ Body: CreateRestaurantRequest }>(
    "/restaurants",
    {
      preHandler: app.authorize(["ADMIN"]),
      schema: {
        body: CreateRestaurantSchema,
        response: {
          201: RestaurantResponseSchema,
          401: ErrorResponseSchema,
          403: ErrorResponseSchema,
          409: ErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const restaurant = await service.createRestaurant(request.body);
      return reply.status(201).send(restaurant);
    },
  );

  // PATCH /restaurants/me — propriétaire uniquement
  app.patch<{ Body: UpdateRestaurantRequest }>(
    "/restaurants/me",
    {
      preHandler: app.authorize(["RESTAURANT"]),
      schema: {
        body: UpdateRestaurantSchema,
        response: {
          200: RestaurantResponseSchema,
          401: ErrorResponseSchema,
          403: ErrorResponseSchema,
          404: ErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const restaurant = await service.updateMyRestaurant(
        request.user.id,
        request.body,
      );
      return reply.send(restaurant);
    },
  );
};
