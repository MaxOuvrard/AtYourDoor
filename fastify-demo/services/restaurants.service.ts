import { hash } from "bcryptjs";
import { PrismaClient } from "../generated/prisma/client.js";
import { ConflictError, ForbiddenError, NotFoundError } from "../common/exceptions.js";
import type {
  CreateRestaurantRequest,
  UpdateRestaurantRequest,
  RestaurantListQuery,
} from "../schemas/restaurants.schema.js";

const OWNER_SELECT = {
  select: { id: true, email: true, firstName: true, lastName: true },
} as const;

export class RestaurantService {
  constructor(private prisma: PrismaClient) {}

  async getAllRestaurants(params: RestaurantListQuery = {}) {
    const limit = params.limit ?? 20;
    const offset = params.offset ?? 0;
    const where = params.name
      ? { name: { contains: params.name } }
      : {};

    const [data, total] = await Promise.all([
      this.prisma.restaurant.findMany({
        where,
        skip: offset,
        take: limit,
        include: { owner: OWNER_SELECT.select as any },
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.restaurant.count({ where }),
    ]);

    return { data, pagination: { total, limit, offset } };
  }

  async getRestaurantById(id: string) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id },
      include: {
        owner: OWNER_SELECT.select as any,
        plats: {
          where: { available: true },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!restaurant) throw new NotFoundError("Restaurant non trouvé");
    return restaurant;
  }

  async getMyRestaurant(ownerId: string) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { ownerId },
      include: { owner: OWNER_SELECT.select as any },
    });

    if (!restaurant) throw new NotFoundError("Aucun restaurant associé à ce compte");
    return restaurant;
  }

  async createRestaurant(data: CreateRestaurantRequest) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) throw new ConflictError("Un utilisateur avec cet email existe déjà");

    const hashedPassword = await hash(data.password, 10);

    return this.prisma.restaurant.create({
      data: {
        name: data.name,
        address: data.address,
        description: data.description,
        phone: data.phone,
        imageUrl: data.imageUrl,
        owner: {
          create: {
            email: data.email,
            password: hashedPassword,
            role: "RESTAURANT",
          },
        },
      },
      include: { owner: OWNER_SELECT.select as any },
    });
  }

  async updateMyRestaurant(ownerId: string, data: UpdateRestaurantRequest) {
    const restaurant = await this.prisma.restaurant.findUnique({ where: { ownerId } });
    if (!restaurant) throw new NotFoundError("Aucun restaurant associé à ce compte");

    return this.prisma.restaurant.update({
      where: { ownerId },
      data,
      include: { owner: OWNER_SELECT.select as any },
    });
  }

  async deleteRestaurant(restaurantId: string, requesterId: string, requesterRole: string) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!restaurant) throw new NotFoundError("Restaurant non trouvé");

    if (requesterRole !== "ADMIN" && restaurant.ownerId !== requesterId) {
      throw new ForbiddenError("Accès non autorisé");
    }

    await this.prisma.restaurant.delete({ where: { id: restaurantId } });
  }
}
