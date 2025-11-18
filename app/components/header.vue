<template>
    <header class="site-header" role="banner">
        <div class="container">
            <NuxtLink to="/" class="brand" aria-label="Accueil">
                <img src="/images/Logo_header.png" alt="AtYourDoor" class="logo" />
            </NuxtLink>

            <nav class="nav" role="navigation" aria-label="Main navigation">
                <NuxtLink to="/restaurants" class="nav-link">Restaurants</NuxtLink>
                <NuxtLink to="/profile" class="nav-link">Profil</NuxtLink>
                <NuxtLink to="/commandes" class="nav-link">Commandes</NuxtLink>
            </nav>
        </div>
    </header>
</template>

<style scoped>
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
    height: 36px;
    width: auto;
    display: block;
}
.nav {
    display: flex;
    gap: 18px;
    align-items: center;
}
.nav-link {
    color: var(--muted, rgba(69,90,100,0.6));
    text-decoration: none;
    font-weight: 600;
    padding: 6px 10px;
    border-radius: 8px;
    transition: background .12s ease, color .12s ease, transform .08s ease;
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

@media (max-width: 640px) {
    .container { padding: 0 12px; }
    .logo { height: 32px; }
    .nav { gap: 10px; }
    .nav-link { padding: 6px 8px; font-size: 14px; }
}
</style>