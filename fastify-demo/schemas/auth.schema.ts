import { Type, Static } from "@sinclair/typebox";

export const LoginSchema = Type.Object(
  {
    email: Type.String({ format: "email" }),
    password: Type.String({ minLength: 1 }),
  },
  { additionalProperties: false }
);

export const RegisterSchema = Type.Object(
  {
    email: Type.String({ format: "email" }),
    password: Type.String({ minLength: 6 }),
  },
  { additionalProperties: false }
);

export const TokenResponseSchema = Type.Object({
  token: Type.String(),
});

const UserInTokenSchema = Type.Object({
  id: Type.String(),
  email: Type.String(),
  firstName: Type.Union([Type.String(), Type.Null()]),
  role: Type.Union([Type.Literal("USER"), Type.Literal("ADMIN"), Type.Literal("RESTAURANT")]),
});

export const AuthResponseSchema = Type.Object({
  token: Type.String(),
  refreshToken: Type.String(),
  user: UserInTokenSchema,
});

export const RefreshRequestSchema = Type.Object(
  { refreshToken: Type.String() },
  { additionalProperties: false },
);

export const RefreshResponseSchema = Type.Object({
  token: Type.String(),
  refreshToken: Type.String(),
});

export const LogoutRequestSchema = Type.Object(
  { refreshToken: Type.String() },
  { additionalProperties: false },
);

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
export type RefreshRequest = Static<typeof RefreshRequestSchema>;
export type LogoutRequest = Static<typeof LogoutRequestSchema>;
