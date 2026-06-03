import "../../config/dotenvx.js";
import fastify, { FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import { registerRoutes } from "../../routes/index.js";
import { buildErrorHandler } from "../../common/errorHandler.js";
import jwtDecorator from "../../decorators/jwtDecorator.js";
import { prisma } from "../../prisma/prismaInstance.js";

export async function createTestServer(): Promise<FastifyInstance> {
  const server = fastify({ logger: false });

  server.setErrorHandler(buildErrorHandler());

  server.decorate("prisma", prisma);

  await server.register(cors, {});
  await server.register(jwtDecorator);
  await registerRoutes(server);

  return server;
}

export async function closeTestServer(server: FastifyInstance) {
  await server.close();
}
