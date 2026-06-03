import { PrismaClient } from "../generated/prisma/client.js";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "../common/exceptions.js";
import type { CreateOrderRequest, StatusUpdateRequest } from "../schemas/orders.schema.js";

const VALID_TRANSITIONS: Record<string, string[]> = {
  PENDING: ["CONFIRMED"],
  CONFIRMED: ["PREPARING"],
  PREPARING: ["READY"],
  READY: ["ON_DELIVERY"],
  ON_DELIVERY: ["DELIVERED"],
};

const ORDER_INCLUDE = {
  commandePlats: {
    include: {
      plat: { select: { id: true, name: true } },
    },
  },
} as const;

export class OrderService {
  constructor(private prisma: PrismaClient) {}

  async createOrder(userId: string, data: CreateOrderRequest) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: data.restaurantId },
    });

    if (!restaurant) {
      throw new NotFoundError("Restaurant non trouvé");
    }

    const dishIds = data.items.map((i) => i.dishId);
    const dishes = await this.prisma.plat.findMany({
      where: { id: { in: dishIds } },
    });

    if (dishes.length !== dishIds.length) {
      throw new NotFoundError("Un ou plusieurs plats sont introuvables");
    }

    const wrongRestaurant = dishes.some(
      (d) => d.restaurantId !== data.restaurantId,
    );
    if (wrongRestaurant) {
      throw new BadRequestError(
        "Tous les plats doivent appartenir au même restaurant",
      );
    }

    const unavailable = dishes.filter((d) => !d.available);
    if (unavailable.length > 0) {
      throw new BadRequestError(
        `Plat(s) indisponible(s) : ${unavailable.map((d) => d.name).join(", ")}`,
      );
    }

    const totalPrice = data.items.reduce((sum, item) => {
      const dish = dishes.find((d) => d.id === item.dishId)!;
      return sum + Number(dish.price) * item.quantity;
    }, 0);

    return this.prisma.commande.create({
      data: {
        userId,
        restaurantId: data.restaurantId,
        deliveryAddress: data.deliveryAddress,
        totalPrice,
        commandePlats: {
          create: data.items.map((item) => {
            const dish = dishes.find((d) => d.id === item.dishId)!;
            return {
              platId: item.dishId,
              quantity: item.quantity,
              unitPrice: Number(dish.price),
            };
          }),
        },
      },
      include: ORDER_INCLUDE,
    });
  }

  async getOrderById(
    orderId: string,
    requesterId: string,
    requesterRole: string,
  ) {
    const order = await this.prisma.commande.findUnique({
      where: { id: orderId },
      include: {
        ...ORDER_INCLUDE,
        restaurant: { select: { ownerId: true } },
      },
    });

    if (!order) {
      throw new NotFoundError("Commande non trouvée");
    }

    if (requesterRole === "USER" && order.userId !== requesterId) {
      throw new ForbiddenError("Accès non autorisé à cette commande");
    }

    if (
      requesterRole === "RESTAURANT" &&
      order.restaurant.ownerId !== requesterId
    ) {
      throw new ForbiddenError("Accès non autorisé à cette commande");
    }

    const { restaurant: _, ...orderWithoutRestaurant } = order;
    return orderWithoutRestaurant;
  }

  async getUserOrders(userId: string) {
    return this.prisma.commande.findMany({
      where: { userId },
      include: ORDER_INCLUDE,
      orderBy: { createdAt: "desc" },
    });
  }

  async getRestaurantOrders(ownerId: string) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { ownerId },
    });

    if (!restaurant) {
      throw new NotFoundError("Aucun restaurant associé à ce compte");
    }

    return this.prisma.commande.findMany({
      where: { restaurantId: restaurant.id },
      include: ORDER_INCLUDE,
      orderBy: { createdAt: "desc" },
    });
  }

  async updateOrderStatus(
    orderId: string,
    ownerId: string,
    data: StatusUpdateRequest,
  ) {
    const order = await this.prisma.commande.findUnique({
      where: { id: orderId },
      include: { restaurant: { select: { ownerId: true } } },
    });

    if (!order) {
      throw new NotFoundError("Commande non trouvée");
    }

    if (order.restaurant.ownerId !== ownerId) {
      throw new ForbiddenError("Accès non autorisé à cette commande");
    }

    const allowed = VALID_TRANSITIONS[order.status] ?? [];
    if (!allowed.includes(data.status)) {
      throw new BadRequestError(
        `Transition invalide : ${order.status} → ${data.status}`,
      );
    }

    return this.prisma.commande.update({
      where: { id: orderId },
      data: { status: data.status },
      include: ORDER_INCLUDE,
    });
  }

  async cancelOrder(orderId: string, userId: string) {
    const order = await this.prisma.commande.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundError("Commande non trouvée");
    }

    if (order.userId !== userId) {
      throw new ForbiddenError("Accès non autorisé à cette commande");
    }

    if (order.status !== "PENDING") {
      throw new BadRequestError(
        "Seules les commandes en attente peuvent être annulées",
      );
    }

    return this.prisma.commande.update({
      where: { id: orderId },
      data: { status: "CANCELLED" },
      include: ORDER_INCLUDE,
    });
  }
}
