import { FastifyInstance } from "fastify";
import { Type } from "@sinclair/typebox";
import { RestaurantService } from "../../services/restaurants.service.js";
import {
  CreateRestaurantSchema,
  UpdateRestaurantSchema,
  RestaurantListQuerySchema,
  RestaurantResponseSchema,
  PaginatedRestaurantsSchema,
  type CreateRestaurantRequest,
  type UpdateRestaurantRequest,
  type RestaurantListQuery,
} from "../../schemas/restaurants.schema.js";
import { ErrorResponseSchema } from "../../schemas/error.schema.js";

export const restaurantRoutes = async (app: FastifyInstance) => {
  const service = new RestaurantService(app.prisma);

  // GET /restaurants — public, paginé, filtrable
  app.get<{ Querystring: RestaurantListQuery }>(
    "/restaurants",
    {
      schema: {
        tags: ["restaurants"],
        summary: "Lister tous les restaurants",
        querystring: RestaurantListQuerySchema,
        response: { 200: PaginatedRestaurantsSchema },
      },
    },
    async (request, reply) => {
      const result = await service.getAllRestaurants(request.query);
      return reply.send(result);
    },
  );

  // GET /restaurants/me — propriétaire
  app.get(
    "/restaurants/me",
    {
      preHandler: app.authorize(["RESTAURANT"]),
      schema: {
        tags: ["restaurants"],
        summary: "Récupérer son restaurant",
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

  // GET /restaurants/:id — public
  app.get<{ Params: { id: string } }>(
    "/restaurants/:id",
    {
      schema: {
        tags: ["restaurants"],
        summary: "Détails d'un restaurant",
        params: Type.Object({ id: Type.String() }),
        response: {
          200: RestaurantResponseSchema,
          404: ErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const restaurant = await service.getRestaurantById(request.params.id);
      return reply.send(restaurant);
    },
  );

  // POST /restaurants — ADMIN
  app.post<{ Body: CreateRestaurantRequest }>(
    "/restaurants",
    {
      preHandler: app.authorize(["ADMIN"]),
      schema: {
        tags: ["restaurants"],
        summary: "Créer un restaurant (ADMIN)",
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

  // PATCH /restaurants/me — propriétaire
  app.patch<{ Body: UpdateRestaurantRequest }>(
    "/restaurants/me",
    {
      preHandler: app.authorize(["RESTAURANT"]),
      schema: {
        tags: ["restaurants"],
        summary: "Modifier son restaurant",
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
      const restaurant = await service.updateMyRestaurant(request.user.id, request.body);
      return reply.send(restaurant);
    },
  );

  // DELETE /restaurants/:id — propriétaire ou ADMIN
  app.delete<{ Params: { id: string } }>(
    "/restaurants/:id",
    {
      preHandler: app.authorize(["RESTAURANT", "ADMIN"]),
      schema: {
        tags: ["restaurants"],
        summary: "Supprimer un restaurant",
        params: Type.Object({ id: Type.String() }),
        response: {
          200: RestaurantResponseSchema,
          401: ErrorResponseSchema,
          403: ErrorResponseSchema,
          404: ErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const restaurant = await service.deleteRestaurant(
        request.params.id,
        request.user.id,
        request.user.role,
      );
      return reply.send(restaurant);
    },
  );
};
