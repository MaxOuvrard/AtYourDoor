import { promises as fs } from 'fs';
import path from 'path';
import { readData, writeData } from '../../utils/jsonStore';
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
  let restaurants: Restaurant[] = await readData('restaurants') as Restaurant[]


  // Trouver le restaurant supprimé pour retrouver l'utilisateur associé
  const deletedRestaurant = restaurants.find(r => r.id === restaurantId);
  const newRestaurants = restaurants.filter(r => r.id !== restaurantId);

  if (newRestaurants.length === restaurants.length) {
    throw createError({ status: 404, statusMessage: 'Restaurant not found' });
  }

  // Écrire le nouveau tableau de restaurants
  try {
    await writeData('restaurants', newRestaurants)
  } catch (e) {
    throw createError({ statusCode: 503, statusMessage: 'Writes disabled on this deployment' })
  }

  // Supprimer l'utilisateur associé (même nom et/ou email que le restaurant supprimé)
  if (deletedRestaurant) {
    try {
      let users = await readData('user')
      // On supprime l'utilisateur owner qui a le même nom que le restaurant (et role OWNER)
      users = users.filter((u: any) => !(u.role && u.role.toUpperCase() === 'OWNER' && u.name === deletedRestaurant.name));
      await writeData('user', users)
    } catch (e) {
      // write may be disabled on serverless; propagate a clear error
      throw createError({ statusCode: 503, statusMessage: 'Writes disabled on this deployment' })
    }
  }

  // Supprimer les plats liés à ce restaurant
  try {
    let plats = await readData('plats')
    const newPlats = plats.filter((p: any) => p.id_restaurant !== restaurantId)
    await writeData('plats', newPlats)
  } catch (e) {
    throw createError({ statusCode: 503, statusMessage: 'Writes disabled on this deployment' })
  }

  return { success: true };
});
