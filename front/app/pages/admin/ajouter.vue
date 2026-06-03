<script setup lang="ts">
// middleware expects NavigationGuard types in TS; cast string to any to keep runtime behavior
definePageMeta({ middleware: ('auth' as unknown) as any })

import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useRestaurantStore } from '../../../stores/restaurantStore';
import { apiFetch } from '../../../utils/api'


const router = useRouter();
const restaurantStore = useRestaurantStore();

// Liste des catégories extraites des restaurants.json
const categories = [
  'french',
  'pizza',
  'tapas',
  'sandwich',
  'asian',
  'burger'
];

const form = ref({
  name: '',
  category: categories[0],
  city: '',
  email: '',
  password: '',
  image: null as File | null
});

const error = ref('');
const success = ref('');

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target && target.files && target.files[0]) {
    form.value.image = target.files[0];
  } else {
    form.value.image = null;
  }
}

async function submitForm() {
  error.value = '';
  success.value = '';
  try {
    const response = await apiFetch('/api/restaurants', {
      method: 'POST',
      body: {
        name: form.value.name ?? '',
        address: form.value.city ?? '',
        email: form.value.email ?? '',
        password: form.value.password ?? '',
        description: form.value.category ? `Catégorie: ${form.value.category}` : undefined,
        description: form.value.category ? `Category: ${form.value.category}` : undefined,
      }
    });
    const newRestaurant = response as any;
    restaurantStore.addRestaurant(newRestaurant);
    success.value = 'Restaurant added!';
    // Reset du formulaire
    form.value = {
      name: '',
      category: categories[0],
      city: '',
      email: '',
      password: '',
      image: null
    };
    // Optionnel : reset du champ file input
    const fileInput = document.getElementById('image') as HTMLInputElement | null;
    if (fileInput) fileInput.value = '';
  } catch (e) {
    error.value = 'Error while adding the restaurant';
  }
}
</script>

<template>
  <Header/>
  <div class="back-btn-wrapper">
    <button class="btn-primary" @click="router.push('/admin')">
      <span class="arrow-left">&#8592;</span>
      <span class="btn-text">Back</span>
    </button>
    </div>
  <div class="profile-container">
    <form class="profile-form" @submit.prevent="submitForm">
      <h1>Add a restaurant</h1>
      <div v-if="error" style="color: #b71c1c; font-weight: 600; margin-bottom: 10px;">{{ error }}</div>
      <div v-if="success" style="color: #388e3c; font-weight: 600; margin-bottom: 10px;">{{ success }}</div>
      <div class="form-group">
        <label for="name">Name</label>
        <input id="name" v-model="form.name" type="text" required placeholder="Restaurant name" class="input-style" />
      </div>

      <div class="form-group">
        <label for="category">Category</label>
        <select id="category" v-model="form.category" required class="input-style">
          <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
        </select>
      </div>
      <div class="form-group">
        <label for="city">City</label>
        <input id="city" v-model="form.city" type="text" required placeholder="Paris" class="input-style" />
      </div>
      <div class="form-group">
        <label for="email">Email</label>
        <input id="email" v-model="form.email" type="email" required placeholder="exemple@mail.com" class="input-style" />
      </div>
      <div class="form-group">
        <label for="password">Password</label>
        <input id="password" v-model="form.password" type="password" required placeholder="Password" class="input-style" />
      </div>
      <div class="form-group">
        <label for="image">Restaurant image</label>
        <input id="image" type="file" accept="image/*" @change="handleFileChange" class="input-style file-input" />
      </div>
      <button type="submit" class="add-to-cart-btn">Add</button>
    </form>
  </div>
</template>

<style scoped>
/* Bouton retour en haut à gauche */
.back-btn {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 10;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 2rem;
  color: var(--accent, #007bff);
  padding: 0;
  transition: color 0.2s;
}
.back-btn:hover {
  color: var(--accent-600, #0056b3);
}
/* Pour styliser tous les champs du formulaire de façon cohérente */
.input-style,
input[type="email"].input-style {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 16px;
  transition: border-color 0.2s;
  background: #f9f9f9;
  box-sizing: border-box;
}
.input-style:focus,
input[type="email"].input-style:focus {
  border-color: #007bff;
  outline: none;
  background: #fff;
}
/* Pour styliser le bouton de fichier de façon moderne et cohérente */
.file-input::-webkit-file-upload-button {
  background: linear-gradient(90deg, var(--accent), var(--accent-600));
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 18px;
  font-size: 15px;
  font-family: inherit;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.18s;
}
.file-input::-webkit-file-upload-button:hover {
  background: linear-gradient(90deg, var(--accent-600), var(--accent));
}
.file-input::file-selector-button {
  background: linear-gradient(90deg, var(--accent), var(--accent-600));
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 18px;
  font-size: 15px;
  font-family: inherit;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.18s;
}
.file-input::file-selector-button:hover {
  background: linear-gradient(90deg, var(--accent-600), var(--accent));
}

.back-btn-wrapper {
    margin: 1.5rem 0 1rem 0;
    padding-left: 1rem;
  }
  .btn-primary {
    display: inline-flex;
    align-items: center;
    gap: 0.6em;
    background: linear-gradient(90deg, var(--accent), var(--accent-600));
    color: #fff;
    border: none;
    border-radius: 10px;
    padding: 0.5rem 1.4rem 0.5rem 1.4rem;
    font-size: 1.08rem;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 4px 16px rgba(229,57,53,0.10);
    transition: background 0.18s, box-shadow 0.18s, transform 0.12s;
    outline: none;
  }
  .arrow-left {
    font-size: 1.1em;
    pointer-events: none;
    margin-right: 0.1em;
  }
  .btn-text {
    display: inline-block;
  }
  .btn-primary:hover {
    background: linear-gradient(90deg, var(--accent-600), var(--accent));
    transform: translateY(-2px);
  }
</style>
