import { readBody } from 'h3'
import { promises as fs } from 'fs'
import path from 'path'
import { readData, writeData } from '../../utils/jsonStore'

export default defineEventHandler(async (event) => {
	const body = await readBody(event)
	const { email, name, password } = body

	if (!email || !name || !password) {
		return { error: 'Tous les champs sont obligatoires.' }
	}

	let users = []
	try {
		users = await readData('user')
	} catch (e) {
		return { error: 'Erreur serveur lors de la lecture des utilisateurs.' }
	}

	const userIndex = users.findIndex((u) => u.email === email)
	if (userIndex === -1) {
		return { error: "Utilisateur non trouvé." }
	}

	// Mettre à jour les champs
	users[userIndex].name = name
	users[userIndex].password = password // En prod, il faut hasher le mot de passe !

	try {
		await writeData('user', users)
	} catch (e) {
		return { error: 'Writes disabled on this deployment' }
	}

	// Retourner l'utilisateur mis à jour (sans le mot de passe)
	const updatedUser = { ...users[userIndex] }
	delete updatedUser.password
	return { user: updatedUser }
})
