<template>
    <header class="site-header" role="banner">
        <div class="container">
            <NuxtLink to="/" class="brand" :aria-label="$t('header.home')">
                <img src="/images/Logo_header.png" alt="AtYourDoor" class="logo" />
            </NuxtLink>
            <nav class="nav" role="navigation" aria-label="Main navigation">
                <template v-if="isAuthenticated">
                    <template v-if="userRole === 'USER'">
                        <NuxtLink to="/restaurants" class="nav-link">{{ $t('header.restaurants') }}</NuxtLink>
                        <NuxtLink to="/profile" class="nav-link">{{ $t('header.profile') }}</NuxtLink>
                        <NuxtLink to="/commandes" class="nav-link">{{ $t('header.orders') }}</NuxtLink>
                    </template>
                    <template v-else-if="userRole === 'ADMIN'">
                        <NuxtLink to="/admin" class="nav-link">{{ $t('header.admin') }}</NuxtLink>
                    </template>
                    <template v-else-if="userRole === 'OWNER'">
                        <NuxtLink to="/owner" class="nav-link">{{ $t('header.my_restaurant') }}</NuxtLink>
                        <NuxtLink to="/plats/mesplats" class="nav-link">{{ $t('header.my_dishes') }}</NuxtLink>
                        <NuxtLink to="/commandes" class="nav-link">{{ $t('header.orders') }}</NuxtLink>
                    </template>
                    <!-- Bouton déconnexion sous forme de logo -->
                    <button class="logout-btn" @click="logout" :aria-label="$t('header.logout')">
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-log-out">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                            <polyline points="16 17 21 12 16 7"/>
                            <line x1="21" y1="12" x2="9" y2="12"/>
                        </svg>
                    </button>
                </template>
                <template v-else>
                    <NuxtLink to="/login" class="nav-link">{{ $t('header.login') }}</NuxtLink>
                    <NuxtLink to="/register" class="nav-link">{{ $t('header.register') }}</NuxtLink>
                </template>
            </nav>
            <!-- Toggle langue switch -->
            <div class="lang-switch" :aria-label="$t('toggle_lang')" @click="toggleLocale">
                <span :class="['lang-label', { active: currentLocale === 'fr' }]">FR</span>
                <span class="lang-slider" :class="{ right: currentLocale === 'en' }"></span>
                <span :class="['lang-label', { active: currentLocale === 'en' }]">EN</span>
            </div>
        </div>
    </header>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useUserStore } from '../../stores/userStore'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const userStore = useUserStore()
const { user, isAuthenticated } = storeToRefs(userStore)
// Le rôle est bien défini dans le JSON comme 'role'
const userRole = computed(() => user.value?.role || null)

// Fonction de déconnexion
function logout() {
        userStore.logout()
}

// Langue
const { locale } = useI18n()
const currentLocale = computed(() => locale.value)
function toggleLocale() {
    locale.value = locale.value === 'fr' ? 'en' : 'fr'
}
</script>
<style scoped>
/* Toggle langue */

/* Switch langue glissant */
.lang-switch {
    display: inline-flex;
    align-items: center;
    position: relative;
    width: 64px;
    height: 32px;
    background: #f3f4f6;
    border-radius: 16px;
    border: 1px solid #ddd;
    margin-left: 16px;
    cursor: pointer;
    user-select: none;
    transition: background 0.2s;
}
.lang-label {
    flex: 1;
    text-align: center;
    font-size: 14px;
    font-weight: 600;
    color: #888;
    z-index: 2;
    transition: color 0.2s;
}
.lang-label.active {
    color: #0f172a;
}
.lang-slider {
    position: absolute;
    top: 3px;
    left: 3px;
    width: 26px;
    height: 26px;
    background: #fff;
    border-radius: 50%;
    box-shadow: 0 1px 4px rgba(0,0,0,0.07);
    transition: left 0.25s cubic-bezier(.4,2,.6,1);
    z-index: 1;
}
.lang-slider.right {
    left: 35px;
}
/* Fond clair pour s'accorder à la charte (utilise --card / --bg du site) */
.site-header {
    /* Fond très clair — blanc cassé / carte — pour s'assurer d'un rendu clair et contrasté */
    background: #ffffff;
    color: var(--text, #0f172a);
    padding: 10px 0;
    box-shadow: 0 1px 3px rgba(15,23,42,0.03);
    border-bottom: 1px solid rgba(15,23,42,0.03);
}
.container {
    max-width: 1100px;
    margin: 0 auto;
    padding: 0 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
}
.brand {
    display: flex;
    align-items: center;
    text-decoration: none;
}
.logo {
    height: 48px;
    width: auto;
    display: block;
}
.nav {
    display: flex;
    gap: 18px;
    align-items: center;
}
.nav-link {
    /* Remonter le contraste en utilisant la variable --text plus foncée
       (évite l'utilisation de la variante semi-transparente --muted qui baisse le contraste). */
    color: var(--text, #0f172a);
    text-decoration: none;
    font-weight: 600;
    padding: 6px 10px;
    border-radius: 8px;
    transition: background .12s ease, color .12s ease, transform .08s ease;
}
.nav-link:focus-visible {
    /* Visibilité clavier / accessibilité : outline net et offset. */
    outline: 3px solid rgba(229,57,53,0.18); /* nuance tomate claire */
    outline-offset: 3px;
    border-radius: 8px;
}
.nav-link:hover {
    background: rgba(69,90,100,0.06);
    color: var(--accent, #E53935);
    transform: translateY(-1px);
}
.nav-link.router-link-exact-active,
.nav-link.active {
    background: rgba(69,90,100,0.06);
    color: var(--accent, #E53935);
}

.logout-btn {
    background: none;
    border: none;
    padding: 6px 10px;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    transition: background .12s ease, color .12s ease, transform .08s ease;
    color: var(--text, #0f172a);
}
.logout-btn:focus-visible {
    outline: 3px solid rgba(229,57,53,0.18);
    outline-offset: 3px;
    border-radius: 8px;
}
.logout-btn:hover {
    background: rgba(69,90,100,0.06);
    color: var(--accent, #E53935);
    transform: translateY(-1px);
}

@media (max-width: 640px) {
    .container { padding: 0 12px; }
    .logo { height: 32px; }
    .nav { gap: 10px; }
    .nav-link { padding: 6px 8px; font-size: 14px; }
}
</style>