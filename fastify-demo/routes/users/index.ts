import { FastifyInstance } from "fastify";
import { Type } from "@sinclair/typebox";
import { UserService } from "../../services/user.service.js";
import {
  CreateUserSchema,
  UpdateUserSchema,
  UserResponseSchema,
} from "../../schemas/user.schema.js";
import { ErrorResponseSchema } from "../../schemas/error.schema.js";
import type {
  UserRequest,
  UserUpdateRequest,
} from "../../schemas/user.schema.js";

const UserIdParamsSchema = Type.Object({ id: Type.String({ format: "uuid" }) });

export const userRoutes = async (app: FastifyInstance) => {
  const userService = new UserService(app.prisma);

  // GET /users — ADMIN
  app.get(
    "/users",
    {
      preHandler: [app.authenticate, app.authorize(["ADMIN"])],
      schema: {
        tags: ["users"],
        summary: "Lister tous les utilisateurs (ADMIN)",
        response: {
          200: Type.Array(UserResponseSchema),
          401: ErrorResponseSchema,
          403: ErrorResponseSchema,
        },
      },
    },
    async (_request, reply) => {
      const users = await userService.getAllUsers();
      return reply.send(users);
    },
  );

  // GET /users/:id — ADMIN
  app.get<{ Params: { id: string } }>(
    "/users/:id",
    {
      preHandler: [app.authenticate, app.authorize(["ADMIN"])],
      schema: {
        tags: ["users"],
        summary: "Récupérer un utilisateur par ID (ADMIN)",
        params: UserIdParamsSchema,
        response: {
          200: UserResponseSchema,
          401: ErrorResponseSchema,
          403: ErrorResponseSchema,
          404: ErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const user = await userService.getUserById(request.params.id);
      return reply.send(user);
    },
  );

  // POST /users — ADMIN
  app.post<{ Body: UserRequest }>(
    "/users",
    {
      preHandler: [app.authenticate, app.authorize(["ADMIN"])],
      schema: {
        tags: ["users"],
        summary: "Créer un utilisateur (ADMIN)",
        body: CreateUserSchema,
        response: {
          201: UserResponseSchema,
          401: ErrorResponseSchema,
          403: ErrorResponseSchema,
          409: ErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const user = await userService.createUser(request.body);
      return reply.status(201).send(user);
    },
  );

  // PUT /users/:id — ADMIN
  app.put<{ Body: UserUpdateRequest; Params: { id: string } }>(
    "/users/:id",
    {
      preHandler: [app.authenticate, app.authorize(["ADMIN"])],
      schema: {
        tags: ["users"],
        summary: "Mettre à jour un utilisateur (ADMIN)",
        params: UserIdParamsSchema,
        body: UpdateUserSchema,
        response: {
          200: UserResponseSchema,
          401: ErrorResponseSchema,
          403: ErrorResponseSchema,
          404: ErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const updatedUser = await userService.updateUser(
        request.params.id,
        request.user.id,
        request.body,
      );
      return reply.send(updatedUser);
    },
  );

  // DELETE /users/:id — ADMIN
  app.delete<{ Params: { id: string } }>(
    "/users/:id",
    {
      preHandler: [app.authenticate, app.authorize(["ADMIN"])],
      schema: {
        tags: ["users"],
        summary: "Supprimer un utilisateur (ADMIN)",
        params: UserIdParamsSchema,
        response: {
          200: UserResponseSchema,
          401: ErrorResponseSchema,
          403: ErrorResponseSchema,
          404: ErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const deletedUser = await userService.deleteUser(request.params.id, request.user.id);
      return reply.send(deletedUser);
    },
  );
};
