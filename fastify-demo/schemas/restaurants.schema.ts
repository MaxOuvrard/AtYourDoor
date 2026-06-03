import { Type, Static } from "@sinclair/typebox";

export const CreateRestaurantSchema = Type.Object(
  {
    email: Type.String({ format: "email" }),
    password: Type.String({ minLength: 6 }),
    name: Type.String({ minLength: 1 }),
    address: Type.String({ minLength: 1 }),
    description: Type.Optional(Type.String()),
    phone: Type.Optional(Type.String()),
    imageUrl: Type.Optional(Type.String()),
  },
  { additionalProperties: false },
);

export const UpdateRestaurantSchema = Type.Object(
  {
    name: Type.Optional(Type.String({ minLength: 1 })),
    address: Type.Optional(Type.String({ minLength: 1 })),
    description: Type.Optional(Type.String()),
    phone: Type.Optional(Type.String()),
    imageUrl: Type.Optional(Type.String()),
    status: Type.Optional(
      Type.Union([Type.Literal("OPEN"), Type.Literal("CLOSED")]),
    ),
  },
  { additionalProperties: false },
);

export const RestaurantResponseSchema = Type.Object({
  id: Type.String(),
  name: Type.String(),
  description: Type.Union([Type.String(), Type.Null()]),
  address: Type.String(),
  phone: Type.Union([Type.String(), Type.Null()]),
  imageUrl: Type.Union([Type.String(), Type.Null()]),
  status: Type.Union([Type.Literal("OPEN"), Type.Literal("CLOSED")]),
  ownerId: Type.String(),
  createdAt: Type.String({ format: "date-time" }),
  updatedAt: Type.String({ format: "date-time" }),
});

export type CreateRestaurantRequest = Static<typeof CreateRestaurantSchema>;
export type UpdateRestaurantRequest = Static<typeof UpdateRestaurantSchema>;
export type RestaurantResponse = Static<typeof RestaurantResponseSchema>;
