import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import fp from "fastify-plugin";
import fastifyJwt from "@fastify/jwt";
import { UnauthorizedError, ForbiddenError } from "../common/exceptions.js";

export default fp(async function (fastify: FastifyInstance, _options = {}) {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error("JWT_SECRET environment variable is required");
  }

  await fastify.register(fastifyJwt, {
    secret: jwtSecret,
    sign: { expiresIn: "15m" },
  });

  fastify.decorate(
    "authenticate",
    async (req: FastifyRequest, _res: FastifyReply) => {
      let payload: { id: string };
      try {
        payload = await req.jwtVerify<{ id: string }>();
      } catch {
        throw new UnauthorizedError();
      }

      const foundUser = await fastify.prisma.user.findUnique({
        where: { id: payload.id },
        omit: { password: true },
      });

      if (!foundUser) {
        throw new UnauthorizedError("Utilisateur non trouvé");
      }

      req.user = foundUser;
    },
  );

  fastify.decorate("authorize", (allowedRoles: string[]) => {
    return async (req: FastifyRequest, res: FastifyReply) => {
      await fastify.authenticate(req, res);

      if (!allowedRoles.includes(req.user.role)) {
        throw new ForbiddenError("No enough permissions to access this resource");
      }
    };
  });
});
