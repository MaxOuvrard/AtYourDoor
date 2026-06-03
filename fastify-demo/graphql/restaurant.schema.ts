export const restaurantSchema = /* GraphQL */ `
  type Restaurant {
    id: ID!
    name: String!
    description: String
    address: String!
    phone: String
    imageUrl: String
    status: String!
    ownerId: String!
    createdAt: String!
    updatedAt: String!
    dishes: [Dish!]!
  }

  type Dish {
    id: ID!
    name: String!
    description: String
    price: Float!
    imageUrl: String
    available: Boolean!
    restaurantId: String!
    createdAt: String!
    updatedAt: String!
  }

  type OrderItem {
    id: ID!
    quantity: Int!
    unitPrice: Float!
    platId: String!
  }

  type Order {
    id: ID!
    status: String!
    totalPrice: Float!
    deliveryAddress: String!
    userId: String!
    restaurantId: String!
    createdAt: String!
    updatedAt: String!
    items: [OrderItem!]!
  }

  type Query {
    restaurants: [Restaurant!]!
    restaurant(id: ID!): Restaurant
  }
`;
