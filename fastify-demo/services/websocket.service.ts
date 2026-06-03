import type WebSocket from "ws";

// Map<restaurantId, Set<WebSocket>>
const connections = new Map<string, Set<WebSocket>>();

export function registerRestaurantConnection(
  restaurantId: string,
  socket: WebSocket,
) {
  if (!connections.has(restaurantId)) {
    connections.set(restaurantId, new Set());
  }
  connections.get(restaurantId)!.add(socket);
}

export function unregisterRestaurantConnection(
  restaurantId: string,
  socket: WebSocket,
) {
  const sockets = connections.get(restaurantId);
  if (!sockets) return;
  sockets.delete(socket);
  if (sockets.size === 0) connections.delete(restaurantId);
}

export function notifyRestaurant(
  restaurantId: string,
  event: string,
  data: unknown,
) {
  const sockets = connections.get(restaurantId);
  if (!sockets || sockets.size === 0) return;

  const message = JSON.stringify({
    event,
    data,
    timestamp: new Date().toISOString(),
  });

  for (const socket of sockets) {
    if (socket.readyState === 1 /* OPEN */) {
      socket.send(message);
    }
  }
}
