import { FastifyInstance } from "fastify";
import { UserService } from "../../services/user.service.js";
import {
  UpdateUserSchema,
  UserResponseSchema,
  type UserUpdateRequest,
} from "../../schemas/user.schema.js";
import { ErrorResponseSchema } from "../../schemas/error.schema.js";

export const userMeRoutes = async (app: FastifyInstance) => {
  const userService = new UserService(app.prisma);

  // GET /users/me — profil de l'utilisateur connecté
  app.get(
    "/users/me",
    {
      preHandler: app.authenticate,
      schema: {
        response: {
          200: UserResponseSchema,
          401: ErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      return reply.send(request.user);
    },
  );

  // PATCH /users/me — modifier son propre profil
  app.patch<{ Body: UserUpdateRequest }>(
    "/users/me",
    {
      preHandler: app.authenticate,
      schema: {
        body: UpdateUserSchema,
        response: {
          200: UserResponseSchema,
          400: ErrorResponseSchema,
          401: ErrorResponseSchema,
          409: ErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const user = await userService.updateUser(
        request.user.id,
        request.user.id,
        request.body,
      );
      return reply.send(user);
    },
  );

  // DELETE /users/me — supprimer son compte
  app.delete(
    "/users/me",
    {
      preHandler: app.authenticate,
      schema: {
        response: {
          200: UserResponseSchema,
          401: ErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const user = await userService.deleteUser(
        request.user.id,
        request.user.id,
      );
      return reply.send(user);
    },
  );
};
