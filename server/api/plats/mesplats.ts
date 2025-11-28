import { readBody, getHeader, H3Event } from 'h3';
import plats from '../../data/plats.json';
import users from '../../data/user.json';
import restaurants from '../../data/restaurants.json';

export default defineEventHandler(async (event: H3Event) => {
  // Récupérer le token d'authentification
  const authHeader = getHeader(event, 'authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: 'Non autorisé', status: 401 };
  }
  const token = authHeader.replace('Bearer ', '');

  const user = users.find(u => String(u.id) === token);
  if (!user || user.role !== 'OWNER') {
    return { error: 'Accès réservé aux propriétaires', status: 403 };
  }

  // Chercher le restaurant qui a le même nom que l'utilisateur OWNER
  const restaurant = restaurants.find(r => r.name.trim().toLowerCase() === user.name.trim().toLowerCase());
  if (!restaurant) {
    return { error: 'Aucun restaurant trouvé pour ce propriétaire', status: 404 };
  }
  const platsDuResto = plats.filter(plat => plat.id_restaurant === restaurant.id);
  return platsDuResto;
});
