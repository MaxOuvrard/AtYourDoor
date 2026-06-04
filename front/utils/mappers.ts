// Mapping Backend (Fastify) → Frontend (Nuxt)
// Le backend utilise des UUID strings, camelCase, imageUrl, restaurantId, totalPrice…
// Le frontend attend des fields comme image, id_restaurant, total…

export function mapRole(backendRole: string): string {
  return backendRole === 'RESTAURANT' ? 'OWNER' : backendRole
}

export function mapRoleToBackend(frontRole: string): string {
  return frontRole === 'OWNER' ? 'RESTAURANT' : frontRole
}

export function mapUser(u: any) {
  if (!u) return null
  return {
    id: u.id,
    name: u.firstName || u.email?.split('@')[0] || '',
    email: u.email,
    role: mapRole(u.role),
    firstName: u.firstName,
    lastName: u.lastName,
    phone: u.phone,
  }
}

export function mapRestaurant(r: any) {
  if (!r) return null
  return {
    id: r.id,
    name: r.name,
    city: r.address || '',
    image: r.imageUrl || '',
    category: r.description ? r.description.split(' ')[0].toLowerCase() : 'restaurant',
    description: r.description,
    status: r.status,
    ownerId: r.ownerId,
    address: r.address,
    phone: r.phone,
  }
}

export function mapPlat(p: any) {
  if (!p) return null
  return {
    id: p.id,
    name: p.name,
    description: p.description || '',
    price: Number(p.price),
    id_restaurant: p.restaurantId,
    image: p.imageUrl || '',
    available: p.available !== false,
    category: '',
  }
}

const STATUS_MAP: Record<string, string> = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  READY: 'ready',
  ON_DELIVERY: 'delivering',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
}

const STATUS_MAP_REVERSE: Record<string, string> = {
  pending: 'PENDING',
  confirmed: 'CONFIRMED',
  preparing: 'PREPARING',
  ready: 'READY',
  delivering: 'ON_DELIVERY',
  delivered: 'DELIVERED',
  cancelled: 'CANCELLED',
}

export function mapStatus(backendStatus: string): string {
  if (!backendStatus) return ''
  return STATUS_MAP[backendStatus] ?? backendStatus.toLowerCase()
}

export function mapStatusToBackend(frontStatus: string): string {
  return STATUS_MAP_REVERSE[frontStatus] ?? frontStatus.toUpperCase()
}

export function mapCommande(c: any) {
  if (!c) return null
  return {
    id: c.id,
    userId: c.userId,
    id_restaurant: c.restaurantId,
    plats: (c.commandePlats || []).map((cp: any) => ({
      id: cp.platId,
      name: cp.plat?.name || '',
      price: Number(cp.unitPrice),
      quantity: cp.quantity,
    })),
    total: Number(c.totalPrice),
    status: mapStatus(c.status),
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
    deliveryAddress: c.deliveryAddress,
  }
}

export function mapPaginatedCommandes(res: any) {
  if (!res) return []
  const list = Array.isArray(res) ? res : (res.data || [])
  return list.map(mapCommande).filter(Boolean)
}

export function mapPaginatedRestaurants(res: any) {
  if (!res) return []
  const list = Array.isArray(res) ? res : (res.data || [])
  return list.map(mapRestaurant).filter(Boolean)
}

export function mapPaginatedPlats(res: any) {
  if (!res) return []
  const list = Array.isArray(res) ? res : (res.data || [])
  return list.map(mapPlat).filter(Boolean)
}
