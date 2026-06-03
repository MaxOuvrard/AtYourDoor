import type { PrismaClient } from "../generated/prisma/client.js";

export interface GqlContext {
  prisma: PrismaClient;
  user: { id: string; role: string } | null;
}

type RestaurantParent = { id: string };

export const restaurantResolvers = {
  Query: {
    restaurants: async (_: unknown, __: unknown, ctx: GqlContext) => {
      return ctx.prisma.restaurant.findMany({
        orderBy: { createdAt: "desc" },
      });
    },

    restaurant: async (
      _: unknown,
      args: { id: string },
      ctx: GqlContext,
    ) => {
      return ctx.prisma.restaurant.findUnique({
        where: { id: args.id },
      });
    },
  },

  Restaurant: {
    dishes: async (parent: RestaurantParent, _: unknown, ctx: GqlContext) => {
      const dishes = await ctx.prisma.plat.findMany({
        where: { restaurantId: parent.id },
        orderBy: { createdAt: "desc" },
      });
      // Convertit Decimal → number pour la sérialisation GraphQL Float
      return dishes.map((d) => ({ ...d, price: Number(d.price) }));
    },
  },
};
