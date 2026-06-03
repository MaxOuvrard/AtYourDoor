import { Type, Static } from "@sinclair/typebox";

export const UserSchema = Type.Object({
  id: Type.String({ format: "uuid" }),
  email: Type.String({ format: "email" }),
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

export const CreateUserSchema = Type.Object(
  {
    email: Type.String({ format: "email" }),
    firstName: Type.String({ minLength: 1 }),
    password: Type.String({ minLength: 6 }),
  },
  { additionalProperties: false },
);

export const UpdateUserSchema = Type.Object(
  {
    email: Type.Optional(Type.String({ format: "email" })),
    firstName: Type.Optional(Type.String({ minLength: 1 })),
    lastName: Type.Optional(Type.String({ minLength: 1 })),
    phone: Type.Optional(Type.String()),
    password: Type.Optional(Type.String({ minLength: 6 })),
  },
  { additionalProperties: false },
);

export const UserResponseSchema = UserSchema;

export type UserRequest = Static<typeof CreateUserSchema>;
export type UserUpdateRequest = Static<typeof UpdateUserSchema>;
export type UserResponse = Static<typeof UserResponseSchema>;
