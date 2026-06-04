<template>
    <header class="site-header" role="banner">
        <div class="container">
            <NuxtLink to="/" class="brand" :aria-label="$t('header.home')">
                <AppImage src="/images/Logo_header.png" alt="AtYourDoor" class="logo" />
            </NuxtLink>
            <nav class="nav" role="navigation" aria-label="Main navigation">
                <template v-if="isHydrated && isAuthenticated">
                    <template v-if="userRole === 'USER'">
                        <div class="cart-wrapper">
                            <button class="cart-btn" @click="toggleCart" :aria-label="$t('header.cart')">
                                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle>
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
                        <NuxtLink to="/admin/users" class="nav-link">{{ $t('header.users') }}</NuxtLink>
                    </template>
                    <template v-else-if="userRole === 'OWNER'">
                        <NuxtLink to="/owner" class="nav-link">{{ $t('header.my_restaurant') }}</NuxtLink>
                        <NuxtLink to="/plats/mesplats" class="nav-link">{{ $t('header.my_dishes') }}</NuxtLink>
                        <NuxtLink to="/commandes" class="nav-link">{{ $t('header.orders') }}</NuxtLink>
                    </template>
                    <button class="logout-btn" @click="logout" :aria-label="$t('header.logout')">
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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

            <!-- Checkout modal -->
            <div v-if="showCheckout" class="modal-backdrop" @click.self="closeCheckout">
                <div class="modal">
                    <h3>{{ $t('header.cart') }}</h3>
                    <label>{{ $t('header.order_name') }}</label>
                    <input v-model="orderName" placeholder="Nom de la commande" />
                    <label style="margin-top:8px;display:block;">Adresse de livraison *</label>
                    <input v-model="deliveryAddress" placeholder="Ex: 5 rue de la Paix, Paris" required />
                    <div class="modal-items">
                        <div v-for="(it, idx) in panier" :key="idx" class="modal-item">
                            <span>{{ it.name }}</span>
                            <span>{{ it.price }} €</span>
                        </div>
                    </div>
                    <div class="modal-total">{{ $t('header.total') }}: <strong>{{ totalPrice }} €</strong></div>
                    <div v-if="checkoutError" style="color:var(--error);font-size:13px;margin-top:4px;">{{ checkoutError }}</div>
                    <div class="modal-actions">
                        <button class="btn" @click="closeCheckout">{{ $t('header.cancel') || 'Annuler' }}</button>
                        <button class="btn primary" @click="confirmCheckout" :disabled="checkoutLoading">
                            {{ checkoutLoading ? 'Envoi...' : $t('header.checkout') }}
                        </button>
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
import { useCommandeStore } from '../../stores/commandeStore'
import { computed, ref, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import AppImage from '~/components/AppImage.vue'

const userStore = useUserStore()
const { user, isAuthenticated } = storeToRefs(userStore)
const userRole = computed(() => user.value?.role || null)
const isHydrated = ref(false)

const globalStore = useGlobalStore()
const { panier } = storeToRefs(globalStore)
const commandeStore = useCommandeStore()

const showCart = ref(false)
const panierCount = computed(() => panier.value?.length ?? 0)
const totalPrice = computed(() =>
  ((panier.value || []).reduce((s: number, p: any) => s + (p.price || 0), 0)).toFixed(2)
)

function toggleCart() { showCart.value = !showCart.value }
function removeFromCart(id: any) { globalStore.retirerDuPanier(id) }

// Checkout
const showCheckout = ref(false)
const orderName = ref('')
const deliveryAddress = ref('')
const checkoutLoading = ref(false)
const checkoutError = ref('')

function openCheckout() { showCheckout.value = true; checkoutError.value = '' }
function closeCheckout() { showCheckout.value = false }

async function confirmCheckout() {
  if (!panier.value?.length) return
  if (!deliveryAddress.value.trim()) {
    checkoutError.value = "L'adresse de livraison est requise."
    return
  }
  checkoutLoading.value = true
  checkoutError.value = ''
  try {
    const firstRestoId = (panier.value[0] as any)?.id_restaurant ?? null
    const cmd: any = {
      id: Date.now(),
      userId: user.value?.id || null,
      plats: panier.value.map((p: any) => ({ id: p.id, name: p.name, price: p.price, quantity: 1 })),
      total: Number(((panier.value || []).reduce((s: number, p: any) => s + (p.price || 0), 0)).toFixed(2)),
      status: 'pending',
      createdAt: new Date().toISOString(),
      id_restaurant: firstRestoId,
      name: orderName.value || ('Commande ' + new Date().toLocaleString()),
      deliveryAddress: deliveryAddress.value.trim(),
    }
    await commandeStore.createCommande(cmd)
    globalStore.viderPanier()
    orderName.value = ''
    deliveryAddress.value = ''
    closeCheckout()
    showCart.value = false
  } catch (e: any) {
    checkoutError.value = e?.message || 'Erreur lors de la commande.'
  } finally {
    checkoutLoading.value = false
  }
}

function logout() { userStore.logout() }

const { locale, setLocale } = useI18n()
const currentLocale = computed(() => locale.value)

onMounted(() => {
    isHydrated.value = true
  try { if (typeof document !== 'undefined') document.documentElement.lang = String(locale.value || 'fr') } catch {}
})
watch(locale, (val) => {
  try { if (typeof document !== 'undefined') document.documentElement.lang = String(val || 'fr') } catch {}
})
async function toggleLocale() {
  await setLocale(locale.value === 'fr' ? 'en' : 'fr')
}
</script>

<style scoped>
.lang-switch { display: inline-flex; align-items: center; position: relative; width: 64px; height: 32px; background: #f3f4f6; border-radius: 16px; border: 1px solid #ddd; margin-left: 16px; cursor: pointer; user-select: none; }
.lang-label { flex: 1; text-align: center; font-size: 14px; font-weight: 600; color: #888; z-index: 2; }
.lang-label.active { color: #0f172a; }
.lang-slider { position: absolute; top: 3px; left: 3px; width: 26px; height: 26px; background: #fff; border-radius: 50%; box-shadow: 0 1px 4px rgba(0,0,0,0.07); transition: left 0.25s cubic-bezier(.4,2,.6,1); z-index: 1; }
.lang-slider.right { left: 35px; }
.site-header { background: #ffffff; color: var(--text, #0f172a); padding: 10px 0; box-shadow: 0 1px 3px rgba(15,23,42,0.03); border-bottom: 1px solid rgba(15,23,42,0.03); position: fixed; top: 0; left: 0; right: 0; width: 100%; z-index: 100; }
.container { max-width: 1100px; margin: 0 auto; padding: 0 16px; display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.brand { display: flex; align-items: center; text-decoration: none; }
.logo { height: 48px; width: auto; display: block; }
.brand :deep(img) { height: 48px; width: auto; display: block; }
.nav { display: flex; gap: 18px; align-items: center; }
.nav-link { color: var(--text, #0f172a); text-decoration: none; font-weight: 600; padding: 6px 10px; border-radius: 8px; transition: background .12s ease, color .12s ease; }
.nav-link:hover { background: rgba(69,90,100,0.06); color: var(--accent, #E53935); }
.logout-btn { background: none; border: none; padding: 6px 10px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; color: var(--text, #0f172a); }
.logout-btn:hover { background: rgba(69,90,100,0.06); color: var(--accent, #E53935); }
.cart-wrapper { position: relative; display: inline-block; margin-right: 8px; }
.cart-btn { background: transparent; border: 1px solid transparent; padding: 6px 8px; display:flex; align-items:center; gap:8px; cursor:pointer; border-radius:10px; }
.cart-badge { background: var(--accent, #E53935); color: #fff; font-weight:700; font-size:12px; padding:3px 7px; border-radius:999px; }
.cart-dropdown { position: absolute; right: 0; top: 46px; width: 340px; max-width: calc(100vw - 32px); background: #fff; border: 1px solid rgba(15,23,42,0.06); box-shadow: 0 12px 36px rgba(2,6,23,0.10); border-radius: 12px; padding: 12px; z-index: 40; }
.cart-item { display:flex; align-items:center; gap:8px; padding:10px 8px; border-bottom:1px solid rgba(15,23,42,0.04); }
.item-name { flex:1; font-weight:600; font-size:14px }
.item-meta { color:#6b7280; font-size:13px; }
.item-remove { background:none; border:none; font-size:18px; color:var(--error, #E53935); cursor:pointer; padding:6px; border-radius:8px }
.cart-total { padding:8px 6px; text-align:right; font-weight:700; }
.checkout-btn { display:inline-block; margin:8px 6px 0 6px; text-align:center; background:var(--accent, #E53935); color:#fff; padding:8px 12px; border-radius:10px; border:none; cursor:pointer }
.empty { padding:12px; text-align:center; color:#6b7280; }
.modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display:flex; align-items:center; justify-content:center; z-index:60; }
.modal { background:#fff; padding:16px; border-radius:10px; width: min(600px, 94vw); max-height: 80vh; overflow:auto; }
.modal input { width:100%; padding:8px 10px; margin:8px 0 12px 0; border-radius:8px; border:1px solid #ddd; box-sizing:border-box; }
.modal-items { max-height: 30vh; overflow:auto; margin-bottom:8px; }
.modal-item { display:flex; justify-content:space-between; padding:6px 0; border-bottom:1px dashed #eee }
.modal-total { text-align:right; margin-top:8px; font-weight:700 }
.modal-actions { display:flex; gap:8px; justify-content:flex-end; margin-top:12px }
.btn { padding:8px 12px; border-radius:8px; border:none; cursor:pointer }
.btn.primary { background:var(--accent, #E53935); color:#fff }
.btn:disabled { opacity:0.6; cursor:not-allowed }
</style>
