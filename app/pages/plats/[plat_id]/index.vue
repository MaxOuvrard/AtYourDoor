<script setup lang="ts">

import type { Plat } from "~/modules/plat/types";
import { ref, computed, watch } from 'vue';
import LazyImage from '~/components/LazyImage.vue'
import { useGlobalStore } from '../../../../stores/globalStore'
import { useUserStore } from '../../../../stores/userStore'
import { storeToRefs } from 'pinia'
import { useSeoMeta } from 'nuxt/app';
import useResource from '../../../../composables/useResource'

const route = useRoute();
const platId = Number(route.params.plat_id);

const { data: plat, error: platError, refresh: refreshPlat } = await useResource<Plat | null>(
    `plat-${platId}`,
    () => $fetch(`/api/plats/${platId}`),
    null
);

// SEO dynamique selon les données du plat
watch(
    () => plat.value,
    (p) => {
        if (p) {
            useSeoMeta({
                title: `${p.name} - Plat sur AtYourDoor`,
                description: `${p.description || 'Découvrez ce plat disponible à la commande sur AtYourDoor.'}`,
                ogTitle: `${p.name} - Plat sur AtYourDoor`,
                ogDescription: `${p.description || 'Découvrez ce plat disponible à la commande sur AtYourDoor.'}`,
                ogImage: p.image || '/images/home/menu_pizza.jpg',
                twitterCard: 'summary_large_image'
            });
        }
    },
    { immediate: true }
);

// Suppléments fictifs (à remplacer par une vraie API ou data si besoin)
const supplements = ref([
    { id: 1, name: 'Frites', price: 2 },
    { id: 2, name: 'Salade', price: 1.5 },
    { id: 3, name: 'Sauce maison', price: 1 },
    { id: 4, name: 'Fromage râpé', price: 1 },
]);
const selectedSupplements = ref<number[]>([]);

const totalPrice = computed(() => {
    if (!plat.value) return 0;
    const suppTotal = supplements.value
        .filter(s => selectedSupplements.value.includes(s.id))
        .reduce((sum, s) => sum + s.price, 0);
    return plat.value.price + suppTotal;
});

function toggleSupplement(id: number) {
    if (selectedSupplements.value.includes(id)) {
        selectedSupplements.value = selectedSupplements.value.filter(sid => sid !== id);
    } else {
        selectedSupplements.value.push(id);
    }
}

function addToCart() {
    const userStore = useUserStore()
    const { isAuthenticated, user } = storeToRefs(userStore)
    if (!isAuthenticated.value || user.value?.role !== 'USER') {
        cartMessage.value = 'Veuillez vous connecter en tant qu\'utilisateur pour ajouter au panier.'
        setTimeout(() => { cartMessage.value = ''; }, 3000)
        return
    }

    const globalStore = useGlobalStore()
    const supplementsSelected = supplements.value.filter(s => selectedSupplements.value.includes(s.id))
    const item = {
        id: plat.value?.id,
        name: plat.value?.name,
        price: Number(totalPrice.value.toFixed ? totalPrice.value.toFixed(2) : totalPrice.value),
        id_restaurant: plat.value?.id_restaurant,
        image: plat.value?.image,
        supplements: supplementsSelected
    }
    // Ajouter au panier et afficher confirmation
    globalStore.ajouterAuPanier(item as any)
    cartMessage.value = 'Ajouté au panier ! Suppléments : ' + supplementsSelected.map(s => s.name).join(', ') + ' • Total : ' + Number(item.price).toFixed(2) + ' €';
    setTimeout(() => { cartMessage.value = ''; }, 3000);
}

const cartMessage = ref('');
</script>

<template>
    <Header />
    <div class="plat-detail-page">
        <section v-if="plat">
                <div v-if="platError" class="fetch-error" style="padding:12px; text-align:center; color:var(--error);">
                    <div>Erreur lors du chargement du plat : {{ platError.message || platError }}</div>
                    <button @click="refreshPlat?.()" style="margin-top:8px;">Réessayer</button>
                </div>
            <NuxtLink :to="`/restaurants/${plat.id_restaurant}`" class="nuxt-link-back">← Voir le restaurant</NuxtLink>
            <div class="plat-detail">
                <LazyImage class="plat-detail-image" :src="plat.image" :alt="plat.name" />
                <div class="plat-detail-info">
                    <h1>{{ plat.name }}</h1>
                    <p class="plat-price">{{ plat.price + ' €' }}</p>
                    <p class="plat-description">{{ plat.description }}</p>

                    <div class="supplements-section">
                        <h2 class="supplements-title">Suppléments</h2>
                        <ul class="supplements-list">
                            <li v-for="supp in supplements" :key="supp.id">
                                <label class="supplement-item">
                                    <input type="checkbox" :value="supp.id" v-model="selectedSupplements" />
                                    <span>{{ supp.name }} <span class="supplement-price">+{{ supp.price }} €</span></span>
                                </label>
                            </li>
                        </ul>
                    </div>

                    <div v-if="cartMessage" class="cart-message">{{ cartMessage }}</div>
                    <button class="add-to-cart-btn" @click="addToCart">
                        Ajouter au panier — {{ totalPrice.toFixed(2) }} €
                    </button>
                </div>
            </div>
        </section>
        <section v-else>
            <p>Chargement du plat...</p>
        </section>
    </div>
</template>
