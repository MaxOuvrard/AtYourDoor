import { defineStore } from 'pinia';

// Types de base (à adapter selon tes modèles)
interface User {
  id: number;
  name: string;
  email: string;
  // ...autres champs
}

interface Restaurant {
  id: number;
  name: string;
  // ...autres champs
}

interface Plat {
  id: number;
  name: string;
  price: number;
  // ...autres champs
}

interface Commande {
  id: number;
  plats: Plat[];
  total: number;
  // ...autres champs
}

export const useGlobalStore = defineStore('global', {
  state: () => ({
    user: null as User | null,
    isAuthenticated: false,
    panier: [] as Plat[],
    commandes: [] as Commande[],
    restaurants: [] as Restaurant[],
  }),
  actions: {
    // Authentification
    login(user: User) {
      this.user = user;
      this.isAuthenticated = true;
    },
    logout() {
      this.user = null;
      this.isAuthenticated = false;
      this.panier = [];
    },
    // Panier
    ajouterAuPanier(plat: Plat) {
      this.panier.push(plat);
    },
    retirerDuPanier(platId: number) {
      this.panier = this.panier.filter(p => p.id !== platId);
    },
    viderPanier() {
      this.panier = [];
    },
    // Commandes
    ajouterCommande(commande: Commande) {
      this.commandes.push(commande);
      this.viderPanier();
    },
    // Restaurants
    setRestaurants(restaurants: Restaurant[]) {
      this.restaurants = restaurants;
    },
    ajouterRestaurant(restaurant: Restaurant) {
      this.restaurants.push(restaurant);
    },
    retirerRestaurant(restaurantId: number) {
      this.restaurants = this.restaurants.filter(r => r.id !== restaurantId);
    },
  },
});
