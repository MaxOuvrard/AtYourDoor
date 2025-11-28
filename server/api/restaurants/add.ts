import { promises as fs } from 'fs';
import path from 'path';

export default defineEventHandler(async (event) => {
	const form = await readMultipartFormData(event);
	if (!form) {
		return { status: 400, error: 'Formulaire invalide' };
	}

	// Extraction des champs
	const fields: Record<string, string> = {};
	let imageFile: any = null;
	for (const entry of form) {
		if (entry.type === 'file') {
			imageFile = entry;
		} else if (typeof entry.name === 'string') {
			// Corrige le problème Buffer -> string
			if (Buffer.isBuffer(entry.data)) {
				fields[entry.name] = entry.data.toString('utf-8');
			} else {
				fields[entry.name] = typeof entry.data === 'string' ? entry.data : String(entry.data);
			}
		}
	}

	// Vérification des champs obligatoires (sans 'address')
	const required = ['name', 'category', 'city', 'email', 'password'];
	for (const key of required) {
		if (!fields[key]) {
			return { status: 400, error: `Champ manquant: ${key}` };
		}
	}

	// Chemins des fichiers JSON
	const usersPath = path.resolve(process.cwd(), 'server/data/user.json');
	const restaurantsPath = path.resolve(process.cwd(), 'server/data/restaurants.json');

	// Lecture des utilisateurs
	let users = [];
	try {
		users = JSON.parse(await fs.readFile(usersPath, 'utf-8'));
	} catch {
		users = [];
	}

	// Vérifie si l'utilisateur existe déjà
	if (users.some((u: any) => u.email === fields.email)) {
		return { status: 400, error: 'Cet email existe déjà.' };
	}

	// Ajout de l'utilisateur (sans 'city' ni 'category')
	const newUser = {
		id: users.length ? Math.max(...users.map((u: any) => u.id || 0)) + 1 : 1,
		name: fields.name,
		email: fields.email,
		password: fields.password,
		role: 'OWNER'
	};
	users.push(newUser);
	await fs.writeFile(usersPath, JSON.stringify(users, null, 2), 'utf-8');

	// Lecture des restaurants
	let restaurants = [];
	try {
		restaurants = JSON.parse(await fs.readFile(restaurantsPath, 'utf-8'));
	} catch {
		restaurants = [];
	}

	// Gestion de l'image
	let imageUrl = '';
	if (imageFile) {
		const ext = path.extname(imageFile.filename) || '.png';
		const fileName = `${fields.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}${ext}`;
		const imageDir = path.resolve(process.cwd(), 'public/images/restaurants');
		await fs.mkdir(imageDir, { recursive: true });
		const imagePath = path.join(imageDir, fileName);
		await fs.writeFile(imagePath, imageFile.data);
		imageUrl = `/images/restaurants/${fileName}`;
	}

	// Ajout du restaurant
	const newRestaurant = {
		id: restaurants.length ? Math.max(...restaurants.map((r: any) => r.id || 0)) + 1 : 1,
		name: fields.name,
		city: fields.city,
		image: imageUrl,
		category: fields.category || 'autre'
	};
	restaurants.push(newRestaurant);
	await fs.writeFile(restaurantsPath, JSON.stringify(restaurants, null, 2), 'utf-8');

	return newRestaurant;
});
