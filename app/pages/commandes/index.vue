<template>
    <div class="commandes-list">
        <Header />
        <h1>{{ $t('commandes.title') }}</h1>
        <ul>
            <li v-for="commande in commandes" :key="commande.id">
                <h2>{{ commande.restaurant.name }}</h2>
                <p>{{ commande.plat.name }}</p>
                <p>{{ $t('commandes.quantity') }} {{ commande.quantite }}</p>
            </li>
        </ul>
    </div>
</template>