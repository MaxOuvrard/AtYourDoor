<template>
    <header class="site-header" role="banner">
        <div class="container">
                <NuxtLink to="/" class="brand" :aria-label="$t('header.home')">
                <LazyImage src="/images/Logo_header.png" alt="AtYourDoor" class="logo" />
            </NuxtLink>
            <nav class="nav" role="navigation" aria-label="Main navigation">
                <template v-if="isAuthenticated">
                    <template v-if="userRole === 'USER'">
                        <!-- Cart button visible only for users with role USER -->
                        <div class="cart-wrapper">
                            <button class="cart-btn" @click="toggleCart" :aria-label="$t('header.cart')">
                                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-shopping-cart">
                                    <circle cx="9" cy="21" r="1"></circle>
                                    <circle cx="20" cy="21" r="1"></circle>
                                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                                </svg>
                                <span v-if="panierCount > 0" class="cart-badge">{{ panierCount }}</span>
                            </button>
                            <div v-if="showCart" class="cart-dropdown" role="dialog" aria-label="Panier">
                                <div class="cart-items">
                                    <template v-if="panier && panier.length">
                                        <div v-for="(item, idx) in panier" :key="idx" class="cart-item">
                                            <div class="item-name">{{ item.name }}</div>
                                            <div class="item-meta">{{ item.price }} €</div>
                                            <button class="item-remove" @click.prevent="removeFromCart(item.id)">×</button>
                                        </div>
                                        <div class="cart-total">{{ $t('header.total') }}: <strong>{{ totalPrice }} €</strong></div>
                                        <button class="checkout-btn" @click="openCheckout">{{ $t('header.checkout') }}</button>
                                    </template>
                                    <template v-else>
                                        <div class="empty">{{ $t('header.cart_empty') }}</div>
                                    </template>
                                </div>
                            </div>
                        </div>
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
            <!-- Checkout modal -->
            <div v-if="showCheckout" class="modal-backdrop" @click.self="closeCheckout">
                <div class="modal">
                    <h3>{{ $t('header.cart') }}</h3>
                    <label>{{ $t('header.order_name') }}</label>
                    <input v-model="orderName" placeholder="Nom de la commande" />
                    <div class="modal-items">
                        <div v-for="(it, idx) in panier" :key="idx" class="modal-item">
                            <span>{{ it.name }}</span>
                            <span>{{ it.price }} €</span>
                        </div>
                    </div>
                    <div class="modal-total">{{ $t('header.total') }}: <strong>{{ totalPrice }} €</strong></div>
                    <div class="modal-actions">
                        <button class="btn" @click="closeCheckout">{{ $t('header.cancel') || 'Annuler' }}</button>
                        <button class="btn primary" @click="confirmCheckout">{{ $t('header.checkout') }}</button>
                    </div>
                </div>
            </div>
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
import { useGlobalStore } from '../../stores/globalStore'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ref, onMounted, watch } from 'vue'

const userStore = useUserStore()
const { user, isAuthenticated } = storeToRefs(userStore)
// Le rôle est bien défini dans le JSON comme 'role'
const userRole = computed(() => user.value?.role || null)
const globalStore = useGlobalStore()
const { panier } = storeToRefs(globalStore)
const showCart = ref(false)
const panierCount = computed(() => panier.value ? panier.value.length : 0)
const totalPrice = computed(() => ((panier.value || []).reduce((s, p) => s + (p.price || 0), 0)).toFixed(2))

function toggleCart() { showCart.value = !showCart.value }
function closeCart() { showCart.value = false }
function removeFromCart(id: number) { globalStore.retirerDuPanier(id) }
// Checkout modal
const showCheckout = ref(false)
const orderName = ref('')
function openCheckout() { showCheckout.value = true }
function closeCheckout() { showCheckout.value = false }
import { useCommandeStore } from '../../stores/commandeStore'
const commandeStore = useCommandeStore()
async function confirmCheckout() {
    // build commande from panier
    if (!panier.value || !panier.value.length) return
    const firstRestoId = panier.value[0]?.id_restaurant ?? null
    const cmd = {
        id: Date.now(),
        userId: user.value?.id || null,
        plats: panier.value.map((p:any) => ({ id: p.id, name: p.name, price: p.price, quantity: 1 })),
        total: Number(((panier.value || []).reduce((s:any,p:any) => s + (p.price||0),0)).toFixed(2)),
        status: 'pending',
        createdAt: new Date().toISOString(),
        id_restaurant: firstRestoId,
        name: orderName.value || ('Commande ' + new Date().toLocaleString())
    } as any
    await commandeStore.createCommande(cmd)
    // vider panier
    globalStore.viderPanier()
    closeCheckout()
    closeCart()
}

// Fonction de déconnexion
function logout() {
        userStore.logout()
}

// Langue
const { locale } = useI18n()
const currentLocale = computed(() => locale.value)

// Ensure HTML lang attribute matches current locale for accessibility/SEO
onMounted(() => {
    try { if (typeof document !== 'undefined') document.documentElement.lang = String(locale.value || 'fr') } catch (e) {}
})

watch(locale, (val) => {
    try { if (typeof document !== 'undefined') document.documentElement.lang = String(val || 'fr') } catch (e) {}
})

function toggleLocale() {
    locale.value = locale.value === 'fr' ? 'en' : 'fr'
    try { if (typeof document !== 'undefined') document.documentElement.lang = String(locale.value) } catch (e) {}
}
import LazyImage from '~/components/LazyImage.vue'
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
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    width: 100%;
    z-index: 100;
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

/* Cart styles */
.cart-wrapper { position: relative; display: inline-block; margin-right: 8px; }
.cart-btn { background: transparent; border: 1px solid transparent; padding: 6px 8px; display:flex; align-items:center; gap:8px; cursor:pointer; border-radius:10px; transition:all .12s ease }
.cart-btn:hover { background: rgba(15,23,42,0.03); transform: translateY(-2px) }
.cart-badge { background: var(--accent, #E53935); color: #fff; font-weight:700; font-size:12px; padding:3px 7px; border-radius:999px; margin-left:-8px; margin-top:-12px; position:relative; box-shadow: 0 4px 12px rgba(15,23,42,0.08) }
.cart-dropdown { position: absolute; right: 0; top: 46px; width: 340px; max-width: calc(100vw - 32px); background: #fff; border: 1px solid rgba(15,23,42,0.06); box-shadow: 0 12px 36px rgba(2,6,23,0.10); border-radius: 12px; padding: 12px; z-index: 40; }
.cart-item { display:flex; align-items:center; gap:8px; padding:10px 8px; border-bottom:1px solid rgba(15,23,42,0.04); }
.item-name { flex:1; font-weight:600; font-size:14px }
.item-meta { color:#6b7280; font-size:13px; margin-left:6px; }
.item-remove { background:none; border:none; font-size:18px; color:var(--error, #E53935); cursor:pointer; padding:6px; border-radius:8px }
.item-remove:hover { background: rgba(229,57,53,0.06) }
.cart-total { padding:8px 6px; text-align:right; font-weight:700; color:var(--text, #0f172a) }
.checkout-btn { display:inline-block; margin:8px 6px 0 6px; text-align:center; background:var(--accent, #E53935); color:#fff; padding:8px 12px; border-radius:10px; text-decoration:none; border:none; cursor:pointer }
.empty { padding:12px; text-align:center; color:#6b7280; }

/* Modal */
.modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display:flex; align-items:center; justify-content:center; z-index:60; }
.modal { background:#fff; padding:16px; border-radius:10px; width: min(600px, 94vw); max-height: 80vh; overflow:auto; }
.modal input { width:100%; padding:8px 10px; margin:8px 0 12px 0; border-radius:8px; border:1px solid #ddd }
.modal-items { max-height: 40vh; overflow:auto; margin-bottom:8px; }
.modal-item { display:flex; justify-content:space-between; padding:6px 0; border-bottom:1px dashed #eee }
.modal-total { text-align:right; margin-top:8px; font-weight:700 }
.modal-actions { display:flex; gap:8px; justify-content:flex-end; margin-top:12px }
.btn { padding:8px 12px; border-radius:8px; border:none; cursor:pointer }
.btn.primary { background:var(--accent, #E53935); color:#fff }

@media (max-width: 640px) {
    .container { padding: 0 12px; }
    .logo { height: 32px; }
    .nav { gap: 10px; }
    .nav-link { padding: 6px 8px; font-size: 14px; }
}
</style>