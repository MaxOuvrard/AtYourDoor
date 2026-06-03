import { Type, type TSchema } from "@sinclair/typebox";

export const PaginationQuerySchema = Type.Object(
  {
    limit: Type.Optional(
      Type.Integer({ minimum: 1, maximum: 100, default: 20, description: "Éléments par page" }),
    ),
    offset: Type.Optional(
      Type.Integer({ minimum: 0, default: 0, description: "Index de départ" }),
    ),
  },
  { additionalProperties: false },
);

export const paginatedSchema = <T extends TSchema>(itemSchema: T) =>
  Type.Object({
    data: Type.Array(itemSchema),
    pagination: Type.Object({
      total: Type.Integer({ description: "Nombre total d'éléments" }),
      limit: Type.Integer({ description: "Éléments par page" }),
      offset: Type.Integer({ description: "Index de départ" }),
    }),
  });

export interface PaginationParams {
  limit?: number;
  offset?: number;
}
