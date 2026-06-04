import type { PrismaClient } from "../generated/prisma/client.js";
import { hash, compare } from "bcryptjs";
import { randomBytes } from "crypto";
import { ConflictError, UnauthorizedError } from "../common/exceptions.js";

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  id: string;
  email: string;
  role: string;
}

const REFRESH_TOKEN_EXPIRY_DAYS = 7;

export const register = async (
  prisma: PrismaClient,
  input: RegisterInput
): Promise<AuthResponse> => {
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existingUser) {
    throw new ConflictError("Un utilisateur avec cet email existe déjà");
  }

  const hashedPassword = await hash(input.password, 10);

  const user = await prisma.user.create({
    data: {
      email: input.email,
      password: hashedPassword,
    },
  });

  return { id: user.id, email: user.email, role: user.role };
};

export const login = async (
  prisma: PrismaClient,
  input: LoginInput
): Promise<AuthResponse> => {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (!user) throw new UnauthorizedError();

  const isPasswordValid = await compare(input.password, user.password);
  if (!isPasswordValid) throw new UnauthorizedError();

  return { id: user.id, email: user.email, role: user.role };
};

export const createRefreshToken = async (
  prisma: PrismaClient,
  userId: string
): Promise<string> => {
  const plain = randomBytes(64).toString("hex");
  const tokenHash = await hash(plain, 10);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

  await prisma.refreshToken.create({
    data: { tokenHash, userId, expiresAt },
  });

  return plain;
};

export const rotateRefreshToken = async (
  prisma: PrismaClient,
  plainToken: string
): Promise<{ userId: string; newRefreshToken: string }> => {
  const tokens = await prisma.refreshToken.findMany({
    where: { expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  let matched: (typeof tokens)[0] | null = null;
  for (const t of tokens) {
    if (await compare(plainToken, t.tokenHash)) {
      matched = t;
      break;
    }
  }

  if (!matched) throw new UnauthorizedError("Refresh token invalide ou expiré");

  await prisma.refreshToken.delete({ where: { id: matched.id } });

  const newPlain = randomBytes(64).toString("hex");
  const newHash = await hash(newPlain, 10);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

  await prisma.refreshToken.create({
    data: { tokenHash: newHash, userId: matched.userId, expiresAt },
  });

  return { userId: matched.userId, newRefreshToken: newPlain };
};

export const revokeRefreshToken = async (
  prisma: PrismaClient,
  plainToken: string
): Promise<void> => {
  const tokens = await prisma.refreshToken.findMany({
    where: { expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  for (const t of tokens) {
    if (await compare(plainToken, t.tokenHash)) {
      await prisma.refreshToken.delete({ where: { id: t.id } });
      return;
    }
  }
};
