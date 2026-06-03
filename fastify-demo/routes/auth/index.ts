import { FastifyInstance } from "fastify/types/instance";
import { login, register } from "../../services/auth.service.js";
import {
  LoginSchema,
  RegisterSchema,
  TokenResponseSchema,
  ProfileResponseSchema,
  type LoginRequest,
  type RegisterRequest,
} from "../../schemas/auth.schema.js";
import { ErrorResponseSchema } from "../../schemas/error.schema.js";

export const authRoutes = async (app: FastifyInstance) => {
  app.post<{ Body: RegisterRequest }>(
    "/register",
    {
      schema: {
        body: RegisterSchema,
        response: {
          201: TokenResponseSchema,
          409: ErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const user = await register(app.prisma, request.body);
      const token = app.jwt.sign({ id: user.id });
      return reply.status(201).send({ token });
    },
  );

  app.post<{ Body: LoginRequest }>(
    "/login",
    {
      schema: {
        body: LoginSchema,
        response: {
          200: TokenResponseSchema,
          401: ErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const user = await login(app.prisma, request.body);
      const token = app.jwt.sign({ id: user.id });
      return reply.status(200).send({ token });
    },
  );

  app.get(
    "/me",
    {
      preHandler: app.authenticate,
      schema: {
        response: {
          200: ProfileResponseSchema,
          401: ErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      return reply.send(request.user);
    },
  );
};
