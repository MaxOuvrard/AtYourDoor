import { Type, Static } from "@sinclair/typebox";
import { paginatedSchema } from "./pagination.schema.js";

const OrderStatusEnum = Type.Union([
  Type.Literal("PENDING"),
  Type.Literal("CONFIRMED"),
  Type.Literal("PREPARING"),
  Type.Literal("READY"),
  Type.Literal("ON_DELIVERY"),
  Type.Literal("DELIVERED"),
  Type.Literal("CANCELLED"),
]);

export const CreateOrderSchema = Type.Object(
  {
    restaurantId: Type.String({ description: "ID du restaurant" }),
    deliveryAddress: Type.String({ minLength: 1, description: "Adresse de livraison" }),
    items: Type.Array(
      Type.Object(
        {
          dishId: Type.String(),
          quantity: Type.Integer({ minimum: 1 }),
        },
        { additionalProperties: false },
      ),
      { minItems: 1, description: "Articles de la commande" },
    ),
  },
  { additionalProperties: false },
);

export const StatusUpdateSchema = Type.Object(
  {
    status: Type.Union([
      Type.Literal("CONFIRMED"),
      Type.Literal("PREPARING"),
      Type.Literal("READY"),
      Type.Literal("ON_DELIVERY"),
      Type.Literal("DELIVERED"),
    ]),
  },
  { additionalProperties: false },
);

export const OrderFilterQuerySchema = Type.Object(
  {
    limit: Type.Optional(Type.Integer({ minimum: 1, maximum: 100, default: 20 })),
    offset: Type.Optional(Type.Integer({ minimum: 0, default: 0 })),
    status: Type.Optional(OrderStatusEnum),
  },
  { additionalProperties: false },
);

const OrderItemResponseSchema = Type.Object({
  id: Type.String(),
  quantity: Type.Integer(),
  unitPrice: Type.Number(),
  platId: Type.String(),
  plat: Type.Object({ id: Type.String(), name: Type.String() }),
});

export const OrderResponseSchema = Type.Object({
  id: Type.String(),
  status: OrderStatusEnum,
  totalPrice: Type.Number(),
  deliveryAddress: Type.String(),
  userId: Type.String(),
  restaurantId: Type.String(),
  createdAt: Type.String({ format: "date-time" }),
  updatedAt: Type.String({ format: "date-time" }),
  commandePlats: Type.Array(OrderItemResponseSchema),
});

export const PaginatedOrdersSchema = paginatedSchema(OrderResponseSchema);

export type CreateOrderRequest = Static<typeof CreateOrderSchema>;
export type StatusUpdateRequest = Static<typeof StatusUpdateSchema>;
export type OrderFilterQuery = Static<typeof OrderFilterQuerySchema>;
export type OrderResponse = Static<typeof OrderResponseSchema>;
