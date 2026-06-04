import { FastifyInstance } from "fastify/types/instance";
import {
  login,
  register,
  createRefreshToken,
  rotateRefreshToken,
  revokeRefreshToken,
} from "../../services/auth.service.js";
import {
  LoginSchema,
  RegisterSchema,
  AuthResponseSchema,
  ProfileResponseSchema,
  RefreshRequestSchema,
  RefreshResponseSchema,
  LogoutRequestSchema,
  type LoginRequest,
  type RegisterRequest,
  type RefreshRequest,
  type LogoutRequest,
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
      const refreshToken = await createRefreshToken(app.prisma, user.id);
      return reply.status(201).send({
        token,
        refreshToken,
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
      const fullUser = await app.prisma.user.findUnique({
        where: { id: user.id },
        select: { id: true, email: true, firstName: true, role: true },
      });
      const token = app.jwt.sign({ id: user.id });
      const refreshToken = await createRefreshToken(app.prisma, user.id);
      return reply.status(200).send({
        token,
        refreshToken,
        user: fullUser ?? { id: user.id, email: user.email, firstName: null, role: user.role },
      });
    },
  );

  app.post<{ Body: RefreshRequest }>(
    "/refresh",
    {
      schema: {
        tags: ["auth"],
        summary: "Renouveler l'access token",
        body: RefreshRequestSchema,
        response: {
          200: RefreshResponseSchema,
          401: ErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { userId, newRefreshToken } = await rotateRefreshToken(
        app.prisma,
        request.body.refreshToken,
      );
      const token = app.jwt.sign({ id: userId });
      return reply.send({ token, refreshToken: newRefreshToken });
    },
  );

  app.post<{ Body: LogoutRequest }>(
    "/logout",
    {
      schema: {
        tags: ["auth"],
        summary: "Déconnexion (révocation du refresh token)",
        body: LogoutRequestSchema,
        response: {
          200: { type: "object", properties: { message: { type: "string" } } },
        },
      },
    },
    async (request, reply) => {
      await revokeRefreshToken(app.prisma, request.body.refreshToken);
      return reply.send({ message: "Déconnecté avec succès" });
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
