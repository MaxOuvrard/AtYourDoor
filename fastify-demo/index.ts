import "./config/dotenvx.js";
import fastify from "fastify";
import cors from "@fastify/cors";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import websocketPlugin from "@fastify/websocket";
import { registerRoutes } from "./routes/index.js";
import { websocketRoutes } from "./routes/websocket.js";
import { registerGraphQL } from "./graphql/index.js";
import { buildErrorHandler } from "./common/errorHandler.js";
import jwtDecorator from "./decorators/jwtDecorator.js";
import { prisma } from "./prisma/prismaInstance.js";

const server = fastify({ logger: true });

server.setErrorHandler(buildErrorHandler());

// ── Security headers ───────────────────────────────────────────────────────
server.addHook("onSend", async (_req, reply) => {
  reply.header("X-Content-Type-Options", "nosniff");
  reply.header("X-Frame-Options", "DENY");
  reply.header("X-XSS-Protection", "1; mode=block");
  reply.header("Referrer-Policy", "strict-origin-when-cross-origin");
});

server.get("/health", async () => ({ status: "ok" }));

const start = async () => {
  try {
    const port = Number(process.env.PORT) || 3000;
    const host = "0.0.0.0";

    server.decorate("prisma", prisma);

    await server.register(cors, { origin: true, credentials: true });

    // ── Swagger / OpenAPI ──────────────────────────────────────────────────
    await server.register(swagger, {
      openapi: {
        openapi: "3.0.0",
        info: {
          title: "AtYourDoor API",
          description: "API de livraison de repas — Fastify + Prisma + MariaDB",
          version: "1.0.0",
        },
        components: {
          securitySchemes: {
            bearerAuth: {
              type: "http",
              scheme: "bearer",
              bearerFormat: "JWT",
            },
          },
        },
        security: [{ bearerAuth: [] }],
      },
    });

    await server.register(swaggerUi, {
      routePrefix: "/docs",
      uiConfig: { docExpansion: "list", deepLinking: true },
    });

    await server.register(jwtDecorator);
    await server.register(websocketPlugin);
    await server.register(websocketRoutes);
    await registerRoutes(server);
    await registerGraphQL(server);
    await server.ready();
    await server.listen({ port, host });

    server.log.info(`Server running on http://${host}:${port}`);
    server.log.info(`Swagger UI: http://${host}:${port}/docs`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
