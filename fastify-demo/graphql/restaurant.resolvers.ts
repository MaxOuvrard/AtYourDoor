import type { PrismaClient } from "../generated/prisma/client.js";
import { RestaurantService } from "../services/restaurants.service.js";
import { DishService } from "../services/dishes.service.js";
import { OrderService } from "../services/orders.service.js";

export interface GqlContext {
  prisma: PrismaClient;
  user: { id: string; role: string } | null;
}

type RestaurantParent = { id: string };
type OrderParent = { id: string; commandePlats?: unknown[] };

export const restaurantResolvers = {
  Query: {
    restaurants: async (_: unknown, __: unknown, ctx: GqlContext) => {
      const service = new RestaurantService(ctx.prisma);
      const result = await service.getAllRestaurants({ limit: 100, offset: 0 });
      return result.data;
    },

    restaurant: async (_: unknown, args: { id: string }, ctx: GqlContext) => {
      const service = new RestaurantService(ctx.prisma);
      return service.getRestaurantById(args.id);
    },

    dishes: async (_: unknown, args: { restaurantId?: string }, ctx: GqlContext) => {
      const service = new DishService(ctx.prisma);
      if (args.restaurantId) {
        const result = await service.getDishesByRestaurant(args.restaurantId, { limit: 100, offset: 0 });
        return result.data.map((d) => ({ ...d, price: Number(d.price) }));
      }
      const dishes = await ctx.prisma.plat.findMany({ orderBy: { createdAt: "desc" } });
      return dishes.map((d) => ({ ...d, price: Number(d.price) }));
    },

    orders: async (_: unknown, __: unknown, ctx: GqlContext) => {
      if (!ctx.user) throw new Error("Unauthorized: authentication required");

      const service = new OrderService(ctx.prisma);

      if (ctx.user.role === "USER") {
        const result = await service.getUserOrders(ctx.user.id, { limit: 100, offset: 0 });
        return result.data.map((o) => ({ ...o, totalPrice: Number(o.totalPrice) }));
      }

      if (ctx.user.role === "RESTAURANT") {
        const result = await service.getRestaurantOrders(ctx.user.id, { limit: 100, offset: 0 });
        return result.data.map((o) => ({ ...o, totalPrice: Number(o.totalPrice) }));
      }

      // ADMIN — all orders
      const orders = await ctx.prisma.commande.findMany({
        include: { commandePlats: { include: { plat: { select: { id: true, name: true } } } } },
        orderBy: { createdAt: "desc" },
      });
      return orders.map((o) => ({
        ...o,
        totalPrice: Number(o.totalPrice),
        commandePlats: o.commandePlats.map((cp) => ({ ...cp, unitPrice: Number(cp.unitPrice) })),
      }));
    },
  },

  Restaurant: {
    dishes: async (parent: RestaurantParent, _: unknown, ctx: GqlContext) => {
      const service = new DishService(ctx.prisma);
      const result = await service.getDishesByRestaurant(parent.id, { limit: 100, offset: 0 });
      return result.data.map((d) => ({ ...d, price: Number(d.price) }));
    },
  },

  Order: {
    items: (parent: OrderParent) => parent.commandePlats ?? [],
  },
};
