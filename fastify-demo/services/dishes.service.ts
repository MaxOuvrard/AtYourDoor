import { PrismaClient } from "../generated/prisma/client.js";
import { ForbiddenError, NotFoundError } from "../common/exceptions.js";
import type { CreateDishRequest, UpdateDishRequest } from "../schemas/dishes.schema.js";
import type { PaginationParams } from "../schemas/pagination.schema.js";

export class DishService {
  constructor(private prisma: PrismaClient) {}

  async getDishesByRestaurant(restaurantId: string, params: PaginationParams = {}) {
    const limit = params.limit ?? 20;
    const offset = params.offset ?? 0;

    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });
    if (!restaurant) throw new NotFoundError("Restaurant non trouvé");

    const [data, total] = await Promise.all([
      this.prisma.plat.findMany({
        where: { restaurantId },
        skip: offset,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.plat.count({ where: { restaurantId } }),
    ]);

    return { data, pagination: { total, limit, offset } };
  }

  async getDishById(dishId: string) {
    const dish = await this.prisma.plat.findUnique({
      where: { id: dishId },
      include: {
        restaurant: { select: { id: true, name: true, ownerId: true } },
      },
    });
    if (!dish) throw new NotFoundError("Plat non trouvé");
    return dish;
  }

  async createDish(ownerId: string, data: CreateDishRequest) {
    const restaurant = await this.prisma.restaurant.findUnique({ where: { ownerId } });
    if (!restaurant) throw new NotFoundError("Aucun restaurant associé à ce compte");

    return this.prisma.plat.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        imageUrl: data.imageUrl,
        restaurantId: restaurant.id,
      },
    });
  }

  async updateDish(dishId: string, ownerId: string, data: UpdateDishRequest) {
    const dish = await this.prisma.plat.findUnique({
      where: { id: dishId },
      include: { restaurant: { select: { ownerId: true } } },
    });
    if (!dish) throw new NotFoundError("Plat non trouvé");
    if (dish.restaurant.ownerId !== ownerId) {
      throw new ForbiddenError("Vous n'avez pas la permission de modifier ce plat");
    }

    return this.prisma.plat.update({ where: { id: dishId }, data });
  }

  async deleteDish(dishId: string, ownerId: string) {
    const dish = await this.prisma.plat.findUnique({
      where: { id: dishId },
      include: { restaurant: { select: { ownerId: true } } },
    });
    if (!dish) throw new NotFoundError("Plat non trouvé");
    if (dish.restaurant.ownerId !== ownerId) {
      throw new ForbiddenError("Vous n'avez pas la permission de supprimer ce plat");
    }

    return this.prisma.plat.delete({ where: { id: dishId } });
  }
}
