import { Type, Static } from "@sinclair/typebox";
import { paginatedSchema } from "./pagination.schema.js";

export const CreateRestaurantSchema = Type.Object(
  {
    email: Type.String({ format: "email", description: "Email du propriétaire" }),
    password: Type.String({ minLength: 6, description: "Mot de passe du propriétaire" }),
    name: Type.String({ minLength: 1, description: "Nom du restaurant" }),
    address: Type.String({ minLength: 1, description: "Adresse du restaurant" }),
    description: Type.Optional(Type.String({ description: "Description" })),
    phone: Type.Optional(Type.String({ description: "Téléphone" })),
    imageUrl: Type.Optional(Type.String({ description: "URL de l'image" })),
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

export const RestaurantListQuerySchema = Type.Object(
  {
    limit: Type.Optional(Type.Integer({ minimum: 1, maximum: 100, default: 20 })),
    offset: Type.Optional(Type.Integer({ minimum: 0, default: 0 })),
    name: Type.Optional(Type.String({ description: "Filtre par nom (contient)" })),
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

export const PaginatedRestaurantsSchema = paginatedSchema(RestaurantResponseSchema);

export type CreateRestaurantRequest = Static<typeof CreateRestaurantSchema>;
export type UpdateRestaurantRequest = Static<typeof UpdateRestaurantSchema>;
export type RestaurantListQuery = Static<typeof RestaurantListQuerySchema>;
export type RestaurantResponse = Static<typeof RestaurantResponseSchema>;
