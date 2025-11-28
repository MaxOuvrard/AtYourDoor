import { readMultipartFormData, getHeader, H3Event } from 'h3';
import { promises as fs } from 'fs';
import path from 'path';
import users from "../../data/user.json";
import restaurants from "../../data/restaurants.json";

const PLATS_PATH = path.resolve(process.cwd(), 'server/data/plats.json');

export default defineEventHandler(async (event: H3Event) => {
	const authHeader = getHeader(event, 'authorization');
	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		return createError({ statusCode: 401, statusMessage: 'Non autorisé' });
	}

	const token = authHeader.replace('Bearer ', '');
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

	const form = await readMultipartFormData(event);
	if (!form) {
		return createError({ statusCode: 400, statusMessage: 'Formulaire invalide' });
	}

	const fields: Record<string, string> = {};
	let imageFile: any = null;
	for (const entry of form) {
		if (entry.type === 'file') {
			imageFile = entry;
		} else if (typeof entry.name === 'string') {
			if (Buffer.isBuffer(entry.data)) {
				fields[entry.name] = entry.data.toString('utf-8');
			} else {
				fields[entry.name] = typeof entry.data === 'string' ? entry.data : String(entry.data);
			}
		}
	}

	// Champs obligatoires
	if (!fields.name || !fields.description || !fields.price) {
		return createError({ statusCode: 400, statusMessage: 'Champs manquants' });
	}

	// Trouver l'id du restaurant lié au propriétaire
	let restaurantId: number | null = null;
	if (user.id_restaurant) {
		restaurantId = Number(user.id_restaurant);
	} else {
		const r = (restaurants as any[]).find(r => r.name && String(r.name).trim().toLowerCase() === String(user.name).trim().toLowerCase());
		if (r) restaurantId = Number(r.id);
	}
	if (!restaurantId) return createError({ statusCode: 404, statusMessage: 'Aucun restaurant trouvé pour ce propriétaire' });

	// Lire plats existants
	let platsArr: any[] = [];
	try {
		const raw = await fs.readFile(PLATS_PATH, 'utf-8');
		platsArr = JSON.parse(raw) as any[];
	} catch (e) {
		platsArr = [];
	}

	// Gérer l'image si présente
	let imageUrl = '';
	if (imageFile) {
		const ext = path.extname(imageFile.filename) || '.png';
		const fileName = `${fields.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}${ext}`;
		const imageDir = path.resolve(process.cwd(), 'public/images/plats');
		await fs.mkdir(imageDir, { recursive: true });
		const imagePath = path.join(imageDir, fileName);
		await fs.writeFile(imagePath, imageFile.data);
		imageUrl = `/images/plats/${fileName}`;
	}

	const newId = platsArr.length ? Math.max(...platsArr.map(p => Number(p.id) || 0)) + 1 : 1;
	const priceNum = Number(fields.price) || 0;

	const newPlat = {
		id: newId,
		name: fields.name,
		description: fields.description,
		price: priceNum,
		id_restaurant: restaurantId,
		image: imageUrl
	};

	platsArr.push(newPlat);

	try {
		await fs.writeFile(PLATS_PATH, JSON.stringify(platsArr, null, 2), 'utf-8');
	} catch (e) {
		return createError({ statusCode: 500, statusMessage: 'Erreur écriture plats' });
	}

	return newPlat;
});

