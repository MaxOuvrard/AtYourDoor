import { readBody, getHeader, H3Event } from 'h3';
import { promises as fs } from 'fs';
import path from 'path';
import platsData from "../../data/plats.json";
import users from "../../data/user.json";
import restaurants from "../../data/restaurants.json";
import type { Plat } from "../../../app/modules/plat/types";

const PLATS_PATH = path.resolve(process.cwd(), 'server/data/plats.json');

export default defineEventHandler(async (event: H3Event) => {
  const authHeader = getHeader(event, 'authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return createError({ statusCode: 401, statusMessage: 'Non autorisé' });
  }

  const token = authHeader.replace('Bearer ', '');
  // decode token (base64 email + timestamp)
  let user: any | undefined = undefined;
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    user = (users as any[]).find(u => decoded.startsWith(String(u.email)));
  } catch (e) {
    return createError({ statusCode: 401, statusMessage: 'Token invalide' });
  }
  if (!user || user.role !== 'OWNER') {
    return createError({ statusCode: 403, statusMessage: 'Accès réservé aux propriétaires' });
  }

  const body = await readBody(event) as Partial<Plat> | any;
  if (!body || typeof body.id === 'undefined') {
    return createError({ statusCode: 400, statusMessage: 'ID du plat requis' });
  }

  // find restaurant for owner
  let restaurantId: number | null = null;
  if (user.id_restaurant) {
    restaurantId = Number(user.id_restaurant);
  } else {
    const r = (restaurants as any[]).find(r => r.name && String(r.name).trim().toLowerCase() === String(user.name).trim().toLowerCase());
    if (r) restaurantId = Number(r.id);
  }
  if (!restaurantId) return createError({ statusCode: 404, statusMessage: 'Aucun restaurant trouvé pour ce propriétaire' });

  // read current plats
  let platsArr: Plat[] = [];
  try {
    const raw = await fs.readFile(PLATS_PATH, 'utf-8');
    platsArr = JSON.parse(raw) as Plat[];
  } catch (e) {
    return createError({ statusCode: 500, statusMessage: 'Erreur lecture plats' });
  }

  const id = Number(body.id);
  const idx = platsArr.findIndex(p => p.id === id);
  if (idx === -1) return createError({ statusCode: 404, statusMessage: 'Plat non trouvé' });

  const existing = platsArr[idx];
  if (Number(existing.id_restaurant) !== restaurantId) {
    return createError({ statusCode: 403, statusMessage: 'Ce plat n\'appartient pas à votre restaurant' });
  }

  // Allow only certain fields
  const allowed = ['name','price','description','image','category','available'];
  for (const k of Object.keys(body)) {
    if (!allowed.includes(k)) delete body[k];
  }

  const updated = { ...existing, ...body };
  platsArr[idx] = updated;

  try {
    await fs.writeFile(PLATS_PATH, JSON.stringify(platsArr, null, 2), 'utf-8');
  } catch (e) {
    return createError({ statusCode: 500, statusMessage: 'Erreur écriture plats' });
  }

  return updated;
});
