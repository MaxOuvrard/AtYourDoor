import { promises as fs } from 'fs';
import path from 'path';
import type { Restaurant } from '../../../app/modules/restaurant/types';

export default defineEventHandler(async (event) => {
  if (event.method !== 'DELETE') {
    throw createError({ status: 405, statusMessage: 'Method Not Allowed' });
  }
  // Récupérer l'id depuis la query string
  const query = getQuery(event);
  const restaurantId = Number(query?.restaurant_id);
  if (!restaurantId) {
    throw createError({ status: 400, statusMessage: 'Missing restaurant_id' });
  }
  const filePath = path.resolve('server/data/restaurants.json');
  const platsPath = path.resolve('server/data/plats.json');

  // Lire les restaurants
  const data = await fs.readFile(filePath, 'utf-8');
  let restaurants: Restaurant[] = JSON.parse(data);


  // Trouver le restaurant supprimé pour retrouver l'utilisateur associé
  const deletedRestaurant = restaurants.find(r => r.id === restaurantId);
  const newRestaurants = restaurants.filter(r => r.id !== restaurantId);

  if (newRestaurants.length === restaurants.length) {
    throw createError({ status: 404, statusMessage: 'Restaurant not found' });
  }

  // Écrire le nouveau tableau de restaurants
  await fs.writeFile(filePath, JSON.stringify(newRestaurants, null, 2), 'utf-8');

  // Supprimer l'utilisateur associé (même nom et/ou email que le restaurant supprimé)
  if (deletedRestaurant) {
    const usersPath = path.resolve('server/data/user.json');
    try {
      const usersData = await fs.readFile(usersPath, 'utf-8');
      let users = JSON.parse(usersData);
      // On supprime l'utilisateur owner qui a le même nom que le restaurant (et role OWNER)
      users = users.filter((u: any) => !(u.role && u.role.toUpperCase() === 'OWNER' && u.name === deletedRestaurant.name));
      await fs.writeFile(usersPath, JSON.stringify(users, null, 2), 'utf-8');
    } catch (e) {
      // On ignore l'erreur si le fichier n'existe pas
    }
  }

  // Supprimer les plats liés à ce restaurant
  try {
    const platsData = await fs.readFile(platsPath, 'utf-8');
    let plats = JSON.parse(platsData);
    const newPlats = plats.filter((p: any) => p.id_restaurant !== restaurantId);
    await fs.writeFile(platsPath, JSON.stringify(newPlats, null, 2), 'utf-8');
  } catch (e) {
    // On ignore l'erreur plats si le fichier n'existe pas
  }

  return { success: true };
});
