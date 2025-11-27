<template>
    <Header />
    <div class="profile-container">
        <form class="profile-form" @submit.prevent="updateProfile">
            <h1>Modifier Nom et Mot de passe</h1>
            <div class="form-group">
                <label for="email">Email</label>
                <input disabled type="text" id="email" name="email" v-model="email" />
            </div>
            <div class="form-group">
                <label for="name">Nom</label>
                <input type="text" id="name" name="name" v-model="name" />
            </div>
            <div class="form-group">
                <label for="password">Mot de passe</label>
                <input type="password" id="password" name="password" v-model="password" />
            </div>
            <div class="form-group">
                <label for="confirmPassword">Confirmer le mot de passe</label>
                <input type="password" id="confirmPassword" name="confirmPassword" v-model="confirmPassword" />
            </div>
            <div v-if="error" class="error-message">{{ error }}</div>
            <div v-if="success" class="success-message">{{ success }}</div>
            <button type="submit">Mettre à jour le profil</button>
        </form>
    </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUserStore } from '../../../stores/userStore'

const userStore = useUserStore()
const email = ref('')
const name = ref('')
const password = ref('')
const confirmPassword = ref('')
const error = ref('')
const success = ref('')

onMounted(() => {
    if (userStore.user) {
        email.value = userStore.user.email || ''
        name.value = userStore.user.name || ''
        password.value = userStore.user.password || ''
    }
})

const updateProfile = async () => {
    error.value = ''
    success.value = ''
    if (password.value !== confirmPassword.value) {
        error.value = 'Les mots de passe ne correspondent pas.'
        return
    }
    try {
        const res = await userStore.update({
            email: email.value,
            name: name.value,
            password: password.value
        })
        if (res && res.error) {
            error.value = res.error
            return
        }
        success.value = 'Profil mis à jour avec succès !'
    } catch (e) {
        error.value = 'Erreur lors de la mise à jour du profil.'
    }
}
</script>