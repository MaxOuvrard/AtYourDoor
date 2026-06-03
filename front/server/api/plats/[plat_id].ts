import { readBody, getHeader, H3Event } from 'h3';
import { promises as fs } from 'fs';
import path from 'path';
import { readData, writeData } from '../../utils/jsonStore';
import type { Plat } from "../../../app/modules/plat/types";

const PLATS_PATH = path.resolve(process.cwd(), 'server/data/plats.json');

export default defineEventHandler(async (event: H3Event) => {
  const params = event.context.params;
  const platId = Number(params?.plat_id);

  // GET: retourner le plat
  const method = (event.node.req as any)?.method || 'GET';
  if (method === 'GET') {
    const platsDataArr = await readData('plats') as Plat[]
    const foundPlat = (platsDataArr as Plat[])?.find?.((plat) => plat.id == platId);
    if (!foundPlat) {
      throw createError({ status: 404 });
    }
    return foundPlat;
  }

  // PUT: mettre à jour le plat (propriétaire seulement)
  if (method === 'PUT' || method === 'PATCH') {
    const authHeader = getHeader(event, 'authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { error: 'Non autorisé', status: 401 };
    }
    const token = authHeader.replace('Bearer ', '');

    // Décode le token Base64 généré côté login
    let user: any | undefined = undefined;
    try {
      const decoded = Buffer.from(token, 'base64').toString('utf-8');
      const usersArr = await readData('user')
      user = usersArr.find((u: any) => decoded.startsWith(String(u.email)));
    } catch (e) {
      return { error: 'Token invalide', status: 401 };
    }
    if (!user || user.role !== 'OWNER') {
      return { error: 'Accès réservé aux propriétaires', status: 403 };
    }

    // Vérifier que le plat appartient bien au restaurant du propriétaire
    const restaurantsArr = await readData('restaurants')
    const restaurant = (restaurantsArr as any[]).find(r => r.name.trim().toLowerCase() === user.name.trim().toLowerCase());
    if (!restaurant) {
      return { error: 'Aucun restaurant associé au propriétaire', status: 404 };
    }

    // Lire le fichier plats.json actuel
    let platsArr: Plat[] = [];
    try {
      platsArr = await readData('plats') as Plat[]
    } catch (e) {
      return { error: 'Erreur serveur lors de la lecture des plats', status: 500 };
    }

    const platIndex = platsArr.findIndex(p => p.id === platId);
    if (platIndex === -1) {
      return { error: 'Plat non trouvé', status: 404 };
    }

    const existing = platsArr[platIndex];
    if (existing.id_restaurant !== restaurant.id) {
      return { error: 'Ce plat n\'appartient pas à votre restaurant', status: 403 };
    }

    const body = await readBody(event);
    // Autoriser seulement certains champs
    const allowed = ['name', 'price', 'description', 'image', 'category', 'available'];
    for (const key of Object.keys(body)) {
      if (!allowed.includes(key)) delete body[key];
    }

    const updatedPlat = { ...existing, ...body };
    platsArr[platIndex] = updatedPlat;

    try {
      await writeData('plats', platsArr)
    } catch (e) {
      return { error: 'Writes disabled on this deployment', status: 503 };
    }

    return updatedPlat;
  }

  // DELETE: supprimer un plat (propriétaire seulement)
  if (method === 'DELETE') {
    const authHeader = getHeader(event, 'authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { error: 'Non autorisé', status: 401 };
    }
    const token = authHeader.replace('Bearer ', '');
    let user: any | undefined = undefined;
    try {
      const decoded = Buffer.from(token, 'base64').toString('utf-8');
      user = users.find(u => decoded.startsWith(u.email));
    } catch (e) {
      return { error: 'Token invalide', status: 401 };
    }
    if (!user || user.role !== 'OWNER') {
      return { error: 'Accès réservé aux propriétaires', status: 403 };
    }

    // Trouver restaurant du propriétaire
    const restaurant = restaurants.find(r => r.name.trim().toLowerCase() === user.name.trim().toLowerCase());
    if (!restaurant) {
      return { error: 'Aucun restaurant associé au propriétaire', status: 404 };
    }

    // Lire le fichier plats.json actuel
    let platsArr: Plat[] = [];
    try {
      platsArr = await readData('plats') as Plat[]
    } catch (e) {
      return { error: 'Erreur serveur lors de la lecture des plats', status: 500 };
    }

    const platIndex = platsArr.findIndex(p => p.id === platId);
    if (platIndex === -1) {
      return { error: 'Plat non trouvé', status: 404 };
    }

    const existing = platsArr[platIndex];
    if (existing.id_restaurant !== restaurant.id) {
      return { error: 'Ce plat n\'appartient pas à votre restaurant', status: 403 };
    }

    // Supprimer le fichier image associé si présent
    try {
      if (existing.image) {
        const imgPath = path.join(process.cwd(), 'public', existing.image.replace(/^\//, ''));
        await fs.rm(imgPath).catch(() => {});
      }
    } catch (e) {
      // ignore image delete errors
    }

    // Retirer et sauvegarder
    platsArr.splice(platIndex, 1);
    try {
      await writeData('plats', platsArr)
    } catch (e) {
      return { error: 'Writes disabled on this deployment', status: 503 };
    }

    return { success: true };
  }

  // Méthode non supportée
  throw createError({ status: 405, statusMessage: 'Method Not Allowed' });
});
