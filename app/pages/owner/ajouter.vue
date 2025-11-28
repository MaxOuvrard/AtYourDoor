<script setup lang="ts">
import { ref } from 'vue';
import { useUserStore } from '../../../stores/userStore';
import { useRouter } from 'vue-router';

const userStore = useUserStore();
const router = useRouter();

const name = ref('');
const description = ref('');
const price = ref<number|null>(null);
const image = ref<File|null>(null);
const imagePreview = ref('');
const error = ref('');
const loading = ref(false);

async function ajouterPlat() {
  error.value = '';
  if (!name.value || !description.value || price.value === null || !image.value) {
    error.value = 'Tous les champs sont obligatoires.';
    return;
  }
  loading.value = true;
  try {
    const formData = new FormData();
    formData.append('name', name.value);
    formData.append('description', description.value);
    formData.append('price', String(price.value));
    if (image.value) {
      formData.append('image', image.value);
    }
    const res = await fetch('/api/plats/ajouter', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${userStore.token}`,
      },
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) {
      error.value = data.error || 'Erreur lors de l\'ajout du plat.';
    } else {
      // Afficher un message de succès, ne pas rediriger
      error.value = '';
      name.value = '';
      description.value = '';
      price.value = null;
      image.value = null;
      imagePreview.value = '';
      alert('Plat ajouté avec succès !');
    }
  } catch (e) {
    error.value = 'Erreur réseau.';
  } finally {
    loading.value = false;
  }
}

function onImageChange(e: Event) {
  const target = e.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    const file = target.files[0];
    image.value = file;
    const reader = new FileReader();
    reader.onload = (ev) => {
      imagePreview.value = String(ev.target?.result);
    };
    reader.readAsDataURL(file);
  }
}
</script>

<template>
    <Header/>
    <div class="back-btn-wrapper">
    <button class="btn-primary" @click="router.push('/plats/mesplats')">
      <span class="arrow-left">&#8592;</span>
      <span class="btn-text">Retour</span>
    </button>
    </div>
    <div class="ajouter-plat-container">
      <form @submit.prevent="ajouterPlat" class="ajouter-plat-form">
        <h1>Ajouter un plat</h1>
        <div>
          <label for="name">Nom du plat</label>
          <input id="name" v-model="name" type="text" required />
        </div>
        <div>
          <label for="description">Description</label>
          <textarea id="description" v-model="description" required class="no-padding"></textarea>
        </div>
        <div>
          <label for="price">Prix (€)</label>
          <input id="price" v-model.number="price" type="number" min="0" step="0.01" required />
        </div>
        <div>
          <label for="image">Image (fichier)</label>
          <input id="image" type="file" accept="image/*" @change="onImageChange" required class="input-style file-input" />
          <div v-if="imagePreview" style="margin-top:10px;">
            <img :src="imagePreview" alt="Aperçu" style="max-width:100%;max-height:120px;border-radius:8px;" />
          </div>
        </div>
        <div v-if="error" class="error">{{ error }}</div>
        <button type="submit" :disabled="loading">{{ loading ? 'Ajout en cours...' : 'Ajouter' }}</button>
      </form>
    </div>
</template>


<style scoped>
.ajouter-plat-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
}

.ajouter-plat-form {
  width: 100%;
  max-width: 420px;
  background: linear-gradient(180deg, rgba(255,255,255,0.98), rgba(255,251,244,0.96));
  border-radius: calc(var(--radius) + 4px);
  box-shadow: 0 14px 40px rgba(12,14,20,0.18);
  padding: 28px 28px;
  box-sizing: border-box;
  border: 1px solid rgba(15,23,42,0.12);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  position: relative;
  z-index: 30;
}

.ajouter-plat-form h1 {
  margin: 0 0 18px 0;
  font-size: 22px;
  font-weight: 600;
  color: var(--text);
  text-align: center;
}

.ajouter-plat-form label {
  font-size: 13px;
  color: #000;
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

.ajouter-plat-form input[type="text"],
.ajouter-plat-form input[type="number"],
.ajouter-plat-form textarea {
  width: 100%;
  padding: 10px 12px;
  font-size: 15px;
  border-radius: 8px;
  border: 1px solid #aaaaaa;
  background: linear-gradient(180deg, rgba(245,245,245,0.95), rgba(235,235,235,0.95));
  color: var(--text);
  box-shadow: inset 0 3px 8px rgba(0,0,0,0.10);
  box-sizing: border-box;
  margin-bottom: 14px;
  transition: box-shadow 150ms ease, border-color 150ms ease, transform 80ms ease;
}

.ajouter-plat-form textarea.no-padding {
  padding: 0;
}

.ajouter-plat-form textarea {
  resize: none;
  min-height: 80px;
}

.ajouter-plat-form input[type="text"]:focus,
.ajouter-plat-form input[type="number"]:focus,
.ajouter-plat-form textarea:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 6px 18px rgba(69,90,100,0.10);
  transform: translateY(-1px);
}

.ajouter-plat-form button[type="submit"] {
  width: 100%;
  padding: 10px 14px;
  font-size: 15px;
  font-weight: 600;
  color: white;
  background: linear-gradient(180deg, var(--accent), var(--accent-600));
  border: none;
  border-radius: 10px;
  cursor: pointer;
  box-shadow: 0 8px 20px rgba(69,90,100,0.10);
  transition: transform 120ms ease, box-shadow 120ms ease, opacity 120ms;
}

.ajouter-plat-form button[type="submit"]:hover:not(:disabled) {
  transform: translateY(-2px);
}

.ajouter-plat-form button[type="submit"]:active:not(:disabled) {
  transform: translateY(0);
}

.ajouter-plat-form button[disabled] {
  opacity: 0.7;
  cursor: not-allowed;
  box-shadow: none;
}

.ajouter-plat-form .error {
  color: var(--error);
  font-weight: 600;
  margin-bottom: 12px;
  text-align: center;
}

@media (max-width: 480px) {
  .ajouter-plat-form {
    padding: 20px;
    border-radius: 12px;
  }
  .ajouter-plat-form h1 {
    font-size: 20px;
  }
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
