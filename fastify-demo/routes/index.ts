import type { FastifyInstance } from "fastify";
import { userRoutes } from "./users/index.js";
import { postRoutes } from "./posts/index.js";
import { commentRoutes } from "./comments/index.js";
import { authRoutes } from "./auth/index.js";

export const registerRoutes = async (app: FastifyInstance) => {
  // Routes API
  await app.register(
    async (fastify) => {
      await fastify.register(authRoutes, { prefix: "/auth" });
      await fastify.register(userRoutes);
      await fastify.register(postRoutes);
      await fastify.register(commentRoutes);
    },
    { prefix: "/api" },
  );
};
