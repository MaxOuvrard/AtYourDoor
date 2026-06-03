import { hash } from "bcryptjs";
import { PrismaClient } from "../generated/prisma/client.js";
import { ConflictError, NotFoundError } from "../common/exceptions.js";
import type {
  CreateRestaurantRequest,
  UpdateRestaurantRequest,
} from "../schemas/restaurants.schema.js";

export class RestaurantService {
  constructor(private prisma: PrismaClient) {}

  async getAllRestaurants() {
    return this.prisma.restaurant.findMany({
      include: {
        owner: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async getMyRestaurant(ownerId: string) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { ownerId },
      include: {
        owner: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
      },
    });

    if (!restaurant) {
      throw new NotFoundError("Aucun restaurant associé à ce compte");
    }

    return restaurant;
  }

  async createRestaurant(data: CreateRestaurantRequest) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictError("Un utilisateur avec cet email existe déjà");
    }

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
      include: {
        owner: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
      },
    });
  }

  async updateMyRestaurant(ownerId: string, data: UpdateRestaurantRequest) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { ownerId },
    });

    if (!restaurant) {
      throw new NotFoundError("Aucun restaurant associé à ce compte");
    }

    return this.prisma.restaurant.update({
      where: { ownerId },
      data,
      include: {
        owner: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
      },
    });
  }
}
