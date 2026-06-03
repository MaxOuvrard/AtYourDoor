import { Type, Static } from "@sinclair/typebox";

export const LoginSchema = Type.Object(
  {
    email: Type.String({ format: "email" }),
    password: Type.String({ minLength: 2 }),
  },
  { additionalProperties: false }
);

export const RegisterSchema = Type.Object(
  {
    email: Type.String({ format: "email" }),
    password: Type.String({ minLength: 2 }),
  },
  { additionalProperties: false }
);

export const TokenResponseSchema = Type.Object({
  token: Type.String(),
});

export const ProfileResponseSchema = Type.Object({
  id: Type.String(),
  email: Type.String(),
  firstName: Type.Union([Type.String(), Type.Null()]),
  lastName: Type.Union([Type.String(), Type.Null()]),
  phone: Type.Union([Type.String(), Type.Null()]),
  role: Type.Union([
    Type.Literal("USER"),
    Type.Literal("ADMIN"),
    Type.Literal("RESTAURANT"),
  ]),
  createdAt: Type.String({ format: "date-time" }),
  updatedAt: Type.String({ format: "date-time" }),
});

export type LoginRequest = Static<typeof LoginSchema>;
export type RegisterRequest = Static<typeof RegisterSchema>;
export type TokenResponse = Static<typeof TokenResponseSchema>;
export type ProfileResponse = Static<typeof ProfileResponseSchema>;
