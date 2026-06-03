import { FastifyInstance } from "fastify/types/instance";
import { login, register } from "../../services/auth.service.js";
import {
  LoginSchema,
  RegisterSchema,
  AuthResponseSchema,
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
        tags: ["auth"],
        summary: "Inscription",
        body: RegisterSchema,
        response: {
          201: AuthResponseSchema,
          409: ErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const user = await register(app.prisma, request.body);
      const token = app.jwt.sign({ id: user.id });
      return reply.status(201).send({
        token,
        user: { id: user.id, email: user.email, firstName: null, role: user.role },
      });
    },
  );

  app.post<{ Body: LoginRequest }>(
    "/login",
    {
      schema: {
        tags: ["auth"],
        summary: "Connexion",
        body: LoginSchema,
        response: {
          200: AuthResponseSchema,
          401: ErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const user = await login(app.prisma, request.body);
      // Récupère le profil complet pour avoir firstName
      const fullUser = await app.prisma.user.findUnique({
        where: { id: user.id },
        select: { id: true, email: true, firstName: true, role: true },
      });
      const token = app.jwt.sign({ id: user.id });
      return reply.status(200).send({
        token,
        user: fullUser ?? { id: user.id, email: user.email, firstName: null, role: user.role },
      });
    },
  );

  app.get(
    "/me",
    {
      preHandler: app.authenticate,
      schema: {
        tags: ["auth"],
        summary: "Profil connecté",
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
