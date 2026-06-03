import "./config/dotenvx.js";
import fastify from "fastify";
import cors from "@fastify/cors";
import { registerRoutes } from "./routes/index.js";
import { buildErrorHandler } from "./common/errorHandler.js";
import jwtDecorator from "./decorators/jwtDecorator.js";
import { prisma } from "./prisma/prismaInstance.js";

const server = fastify({ logger: true });

server.setErrorHandler(buildErrorHandler());

server.get("/health", async () => ({ status: "ok" }));

const start = async () => {
  try {
    const port = Number(process.env.PORT) || 3000;
    const host = "0.0.0.0";

    server.decorate("prisma", prisma);

    await server.register(cors, {});
    await server.register(jwtDecorator);
    await registerRoutes(server);
    await server.ready();
    await server.listen({ port, host });

    server.log.info(`Server running on http://${host}:${port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
