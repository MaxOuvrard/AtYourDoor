import { hash } from "bcryptjs";
import { PrismaClient } from "../generated/prisma/client.js";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from "../common/exceptions.js";
import type { UserRequest, UserUpdateRequest } from "../schemas/user.schema.js";

export class UserService {
  constructor(private prisma: PrismaClient) {}

  async getAllUsers() {
    return this.prisma.user.findMany({
      omit: { password: true },
    });
  }

  async getUserById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      omit: { password: true },
    });

    if (!user) {
      throw new NotFoundError("Utilisateur non trouvé");
    }

    return user;
  }

  async createUser(data: UserRequest) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictError("Un utilisateur avec cet email existe déjà");
    }

    return this.prisma.user.create({
      data: {
        email: data.email,
        firstName: data.firstName,
        password: await hash(data.password, 10),
      },
      omit: { password: true },
    });
  }

  async updateUser(
    userId: string,
    currentUserId: string,
    data: UserUpdateRequest,
  ) {
    if (userId !== currentUserId) {
      throw new ForbiddenError(
        "Vous n'avez pas la permission de modifier cet utilisateur",
      );
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new NotFoundError("Utilisateur non trouvé");
    }

    if (data.email && data.email !== user.email) {
      const emailTaken = await this.prisma.user.findUnique({
        where: { email: data.email },
      });
      if (emailTaken) {
        throw new ConflictError("Cet email est déjà utilisé");
      }
    }

    const updateData: Record<string, unknown> = { ...data };
    if (data.password) {
      updateData.password = await hash(data.password, 10);
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: updateData,
      omit: { password: true },
    });
  }

  async deleteUser(userId: string, currentUserId: string) {
    if (userId !== currentUserId) {
      throw new ForbiddenError(
        "Vous n'avez pas la permission de supprimer cet utilisateur",
      );
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new NotFoundError("Utilisateur non trouvé");
    }

    return this.prisma.user.delete({
      where: { id: userId },
      omit: { password: true },
    });
  }
}
