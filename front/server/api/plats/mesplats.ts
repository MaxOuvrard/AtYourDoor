import { getHeader, H3Event } from 'h3';
import plats from '../../data/plats.json';
import users from '../../data/user.json';
import restaurants from '../../data/restaurants.json';

export default defineEventHandler(async (event: H3Event) => {
  const authHeader = getHeader(event, 'authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: 'Non autorisé', status: 401 };
  }

  const token = authHeader.replace('Bearer ', '');

  // Le token est généré côté login avec: base64(user.email + Date.now())
  // On peut décoder le token et chercher l'utilisateur par email au début de la chaîne décodée.
  let decoded = '';
  try {
    decoded = Buffer.from(token, 'base64').toString('utf-8');
  } catch (e) {
    return { error: 'Token invalide', status: 401 };
  }

  const user = (users as any[]).find(u => decoded.startsWith(String(u.email)));
  if (!user) {
    return { error: 'Utilisateur non trouvé', status: 401 };
  }
  if (user.role !== 'OWNER') {
    return { error: 'Accès réservé aux propriétaires', status: 403 };
  }

  // Déterminer l'id du restaurant lié à l'utilisateur.
  // Priorité: propriété `id_restaurant` sur l'utilisateur, sinon recherche par nom de restaurant correspondant au nom d'utilisateur.
  let restaurantId: number | null = null;
  if (user.id_restaurant) {
    restaurantId = Number(user.id_restaurant);
  } else {
    const restaurant = (restaurants as any[]).find(r => r.name && String(r.name).trim().toLowerCase() === String(user.name).trim().toLowerCase());
    if (restaurant) restaurantId = Number(restaurant.id);
  }

  if (!restaurantId) {
    return { error: 'Aucun restaurant trouvé pour ce propriétaire', status: 404 };
  }

  const platsDuResto = (plats as any[]).filter(plat => Number(plat.id_restaurant) === restaurantId);
  return platsDuResto;
});
