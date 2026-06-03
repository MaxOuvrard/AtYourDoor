import { Type, Static } from "@sinclair/typebox";

export const CreateDishSchema = Type.Object(
  {
    name: Type.String({ minLength: 1 }),
    description: Type.Optional(Type.String()),
    price: Type.Number({ exclusiveMinimum: 0 }),
    imageUrl: Type.Optional(Type.String()),
  },
  { additionalProperties: false },
);

export const UpdateDishSchema = Type.Object(
  {
    name: Type.Optional(Type.String({ minLength: 1 })),
    description: Type.Optional(Type.String()),
    price: Type.Optional(Type.Number({ exclusiveMinimum: 0 })),
    imageUrl: Type.Optional(Type.String()),
    available: Type.Optional(Type.Boolean()),
  },
  { additionalProperties: false },
);

export const DishResponseSchema = Type.Object({
  id: Type.String(),
  name: Type.String(),
  description: Type.Union([Type.String(), Type.Null()]),
  price: Type.Number(),
  imageUrl: Type.Union([Type.String(), Type.Null()]),
  available: Type.Boolean(),
  restaurantId: Type.String(),
  createdAt: Type.String({ format: "date-time" }),
  updatedAt: Type.String({ format: "date-time" }),
});

export type CreateDishRequest = Static<typeof CreateDishSchema>;
export type UpdateDishRequest = Static<typeof UpdateDishSchema>;
export type DishResponse = Static<typeof DishResponseSchema>;
