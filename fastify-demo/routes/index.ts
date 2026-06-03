import type { FastifyInstance } from "fastify";
import { userRoutes } from "./users/index.js";
import { postRoutes } from "./posts/index.js";
import { commentRoutes } from "./comments/index.js";
import { authRoutes } from "./auth/index.js";
import { restaurantRoutes } from "./restaurants/index.js";
import { dishRoutes } from "./dishes/index.js";

export const registerRoutes = async (app: FastifyInstance) => {
  await app.register(
    async (fastify) => {
      await fastify.register(authRoutes, { prefix: "/auth" });
      await fastify.register(userRoutes);
      await fastify.register(restaurantRoutes);
      await fastify.register(dishRoutes);
      await fastify.register(postRoutes);
      await fastify.register(commentRoutes);
    },
    { prefix: "/api" },
  );
};
