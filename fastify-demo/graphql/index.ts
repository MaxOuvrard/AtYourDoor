import mercurius from "mercurius";
import type { FastifyInstance } from "fastify";
import type { PrismaClient } from "../generated/prisma/client.js";
import { restaurantSchema } from "./restaurant.schema.js";
import { restaurantResolvers } from "./restaurant.resolvers.js";

// Étend MercuriusContext avec prisma + user pour que les resolvers soient typés
declare module "mercurius" {
  interface MercuriusContext {
    prisma: PrismaClient;
    user: { id: string; role: string } | null;
  }
}

export async function registerGraphQL(app: FastifyInstance) {
  await app.register(mercurius, {
    schema: restaurantSchema,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolvers: restaurantResolvers as any,
    graphiql: true,
    context: async (request) => {
      let user: { id: string; role: string } | null = null;

      const auth = request.headers.authorization;
      if (auth?.startsWith("Bearer ")) {
        try {
          const token = auth.slice(7);
          const payload = app.jwt.verify<{ id: string }>(token);
          const found = await app.prisma.user.findUnique({
            where: { id: payload.id },
            select: { id: true, role: true },
          });
          user = found ?? null;
        } catch {
          // token invalide → user reste null
        }
      }

      return { prisma: app.prisma, user };
    },
  });
}
