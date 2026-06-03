import type { FastifyInstance } from "fastify";
import type WebSocket from "ws";
import type { User } from "../generated/prisma/client.js";
import {
  registerRestaurantConnection,
  unregisterRestaurantConnection,
} from "../services/websocket.service.js";

export interface AuthenticatedSocket {
  user: Omit<User, "password">;
  restaurantId: string;
  socket: WebSocket;
}

export const websocketRoutes = async (app: FastifyInstance) => {
  app.get(
    "/ws/restaurant",
    { websocket: true },
    (socket: WebSocket) => {
      const authSocket: Partial<AuthenticatedSocket> = { socket };
      let authenticated = false;

      socket.on("message", async (raw: Buffer) => {
        let message: { event?: string; token?: string } = {};

        try {
          message = JSON.parse(raw.toString());
        } catch {
          socket.close(1011, "Invalid JSON");
          return;
        }

        // ── Flux d'authentification ──────────────────────────────────────────
        if (!authenticated) {
          if (message.event !== "authenticate" || !message.token) {
            socket.close(1008, "First message must be {event:'authenticate', token}");
            return;
          }

          let payload: { id: string };
          try {
            payload = app.jwt.verify<{ id: string }>(message.token);
          } catch {
            socket.close(1008, "Invalid or expired token");
            return;
          }

          const user = await app.prisma.user.findUnique({
            where: { id: payload.id },
            omit: { password: true },
          });

          if (!user || user.role !== "RESTAURANT") {
            socket.close(1008, "Unauthorized: RESTAURANT role required");
            return;
          }

          const restaurant = await app.prisma.restaurant.findUnique({
            where: { ownerId: user.id },
          });

          if (!restaurant) {
            socket.close(1008, "No restaurant found for this user");
            return;
          }

          authSocket.user = user;
          authSocket.restaurantId = restaurant.id;
          authenticated = true;

          registerRestaurantConnection(restaurant.id, socket);

          socket.send(
            JSON.stringify({
              event: "connected",
              data: {
                restaurantId: restaurant.id,
                message: "Connexion établie avec succès",
              },
              timestamp: new Date().toISOString(),
            }),
          );
          return;
        }

        // ── Messages post-authentification ───────────────────────────────────
        if (message.event === "ping") {
          socket.send(
            JSON.stringify({ event: "pong", timestamp: new Date().toISOString() }),
          );
        }
      });

      socket.on("close", () => {
        if (authSocket.restaurantId) {
          unregisterRestaurantConnection(authSocket.restaurantId, socket);
        }
      });

      socket.on("error", (err: Error) => {
        app.log.error({ err }, "WebSocket error");
        if (authSocket.restaurantId) {
          unregisterRestaurantConnection(authSocket.restaurantId, socket);
        }
      });
    },
  );
};
