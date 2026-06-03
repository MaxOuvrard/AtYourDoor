import { Type, Static } from "@sinclair/typebox";

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
    restaurantId: Type.String(),
    deliveryAddress: Type.String({ minLength: 1 }),
    items: Type.Array(
      Type.Object(
        {
          dishId: Type.String(),
          quantity: Type.Integer({ minimum: 1 }),
        },
        { additionalProperties: false },
      ),
      { minItems: 1 },
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

const OrderItemResponseSchema = Type.Object({
  id: Type.String(),
  quantity: Type.Integer(),
  unitPrice: Type.Number(),
  platId: Type.String(),
  plat: Type.Object({
    id: Type.String(),
    name: Type.String(),
  }),
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

export type CreateOrderRequest = Static<typeof CreateOrderSchema>;
export type StatusUpdateRequest = Static<typeof StatusUpdateSchema>;
export type OrderResponse = Static<typeof OrderResponseSchema>;
