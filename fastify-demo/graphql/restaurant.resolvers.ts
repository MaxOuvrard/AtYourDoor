import type { PrismaClient } from "../generated/prisma/client.js";

export interface GqlContext {
  prisma: PrismaClient;
  user: { id: string; role: string } | null;
}

type RestaurantParent = { id: string };
type OrderParent = { id: string; commandePlats?: unknown[] };

export const restaurantResolvers = {
  Query: {
    restaurants: async (_: unknown, __: unknown, ctx: GqlContext) => {
      return ctx.prisma.restaurant.findMany({ orderBy: { createdAt: "desc" } });
    },

    restaurant: async (_: unknown, args: { id: string }, ctx: GqlContext) => {
      return ctx.prisma.restaurant.findUnique({ where: { id: args.id } });
    },

    dishes: async (
      _: unknown,
      args: { restaurantId?: string },
      ctx: GqlContext,
    ) => {
      const dishes = await ctx.prisma.plat.findMany({
        where: args.restaurantId ? { restaurantId: args.restaurantId } : {},
        orderBy: { createdAt: "desc" },
      });
      return dishes.map((d) => ({ ...d, price: Number(d.price) }));
    },

    orders: async (_: unknown, __: unknown, ctx: GqlContext) => {
      if (!ctx.user) throw new Error("Unauthorized: authentication required");

      let where: Record<string, unknown> = {};

      if (ctx.user.role === "USER") {
        where = { userId: ctx.user.id };
      } else if (ctx.user.role === "RESTAURANT") {
        const restaurant = await ctx.prisma.restaurant.findUnique({
          where: { ownerId: ctx.user.id },
        });
        if (!restaurant) return [];
        where = { restaurantId: restaurant.id };
      }
      // ADMIN sees all orders

      const orders = await ctx.prisma.commande.findMany({
        where,
        include: {
          commandePlats: {
            include: { plat: { select: { id: true, name: true } } },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return orders.map((o) => ({
        ...o,
        totalPrice: Number(o.totalPrice),
        commandePlats: o.commandePlats.map((cp) => ({
          ...cp,
          unitPrice: Number(cp.unitPrice),
        })),
      }));
    },
  },

  Restaurant: {
    dishes: async (parent: RestaurantParent, _: unknown, ctx: GqlContext) => {
      const dishes = await ctx.prisma.plat.findMany({
        where: { restaurantId: parent.id },
        orderBy: { createdAt: "desc" },
      });
      return dishes.map((d) => ({ ...d, price: Number(d.price) }));
    },
  },

  Order: {
    items: (parent: OrderParent) => parent.commandePlats ?? [],
  },
};
