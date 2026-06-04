# AtYourDoor — Guide de démo & soutenance

> Application de livraison de repas · Fastify + Prisma + Nuxt 3

---

## Démarrage rapide

```bash
# Backend
cd fastify-demo && npm run dev

# Frontend (autre terminal)
cd front && npm run dev
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3002 |
| API | http://127.0.0.1:3000 |
| Swagger UI | http://127.0.0.1:3000/docs |
| GraphQL | http://127.0.0.1:3000/graphql |

---

## Comptes de démo

| Rôle | Email | Mot de passe |
|---|---|---|
| 👑 Admin | `admin@atyourdoor.fr` | `Admin1234!` |
| 👤 Client | `client@atyourdoor.fr` | `Client1234!` |
| 🍕 Restaurant | `mario@atyourdoor.fr` | `Mario1234!` |
| 🍣 Restaurant | `akira@atyourdoor.fr` | `Akira1234!` |
| 🥙 Restaurant | `leila@atyourdoor.fr` | `Leila1234!` |
| 🥐 Restaurant | `thomas@atyourdoor.fr` | `Thomas1234!` |

> Pour réinitialiser les données : `cd fastify-demo && npx prisma db seed`

---

## Commandes de démo

### 1. Authentification (Register / Login / Refresh)

```bash
# Inscription
curl -X POST http://127.0.0.1:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@test.fr","password":"Demo1234!"}'

# Connexion → retourne { token, refreshToken, user }
curl -X POST http://127.0.0.1:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"client@atyourdoor.fr","password":"Client1234!"}'

# Profil connecté
curl http://127.0.0.1:3000/api/auth/me \
  -H "Authorization: Bearer <token>"

# Refresh token (renouvelle l'access token sans se reconnecter)
curl -X POST http://127.0.0.1:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"<refreshToken>"}'

# Déconnexion (révoque le refresh token)
curl -X POST http://127.0.0.1:3000/api/auth/logout \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"<refreshToken>"}'
```

---

### 2. Restaurants (liste, détail, filtres, pagination)

```bash
# Lister tous les restaurants (public)
curl "http://127.0.0.1:3000/api/restaurants"

# Pagination + recherche par nom
curl "http://127.0.0.1:3000/api/restaurants?limit=2&offset=0"
curl "http://127.0.0.1:3000/api/restaurants?name=sushi"

# Détail d'un restaurant
curl "http://127.0.0.1:3000/api/restaurants/<id>"

# Voir son restaurant (compte RESTAURANT requis)
curl http://127.0.0.1:3000/api/restaurants/me \
  -H "Authorization: Bearer <token_mario>"

# Modifier son restaurant
curl -X PATCH http://127.0.0.1:3000/api/restaurants/me \
  -H "Authorization: Bearer <token_mario>" \
  -H "Content-Type: application/json" \
  -d '{"description":"Nouvelle description."}'
```

---

### 3. Plats (CRUD, filtres)

```bash
# Plats d'un restaurant (public)
curl "http://127.0.0.1:3000/api/restaurants/<restaurantId>/dishes"

# Créer un plat (compte RESTAURANT)
curl -X POST http://127.0.0.1:3000/api/dishes \
  -H "Authorization: Bearer <token_mario>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Napolitaine","description":"Tomate, anchois, olives.","price":13.5}'

# Modifier un plat
curl -X PATCH http://127.0.0.1:3000/api/dishes/<dishId> \
  -H "Authorization: Bearer <token_mario>" \
  -H "Content-Type: application/json" \
  -d '{"price":14.0}'

# Supprimer un plat
curl -X DELETE http://127.0.0.1:3000/api/dishes/<dishId> \
  -H "Authorization: Bearer <token_mario>"
```

---

### 4. Commandes (cycle de vie complet)

```bash
# Créer une commande (compte USER)
curl -X POST http://127.0.0.1:3000/api/orders \
  -H "Authorization: Bearer <token_client>" \
  -H "Content-Type: application/json" \
  -d '{
    "restaurantId": "<restaurantId>",
    "deliveryAddress": "5 rue de la Paix, 75001 Paris",
    "items": [{"dishId": "<dishId>", "quantity": 2}]
  }'

# Voir ses commandes (USER)
curl http://127.0.0.1:3000/api/orders/me \
  -H "Authorization: Bearer <token_client>"

# Filtrer par statut
curl "http://127.0.0.1:3000/api/orders/me?status=PENDING" \
  -H "Authorization: Bearer <token_client>"

# Commandes reçues par le restaurant (RESTAURANT)
curl http://127.0.0.1:3000/api/restaurants/me/orders \
  -H "Authorization: Bearer <token_mario>"

# Faire avancer le statut (RESTAURANT)
# PENDING → CONFIRMED → PREPARING → READY → ON_DELIVERY → DELIVERED
curl -X PATCH http://127.0.0.1:3000/api/orders/<orderId>/status \
  -H "Authorization: Bearer <token_mario>" \
  -H "Content-Type: application/json" \
  -d '{"status":"CONFIRMED"}'

# Annuler une commande PENDING (USER)
curl -X DELETE http://127.0.0.1:3000/api/orders/<orderId> \
  -H "Authorization: Bearer <token_client>"
```

---

### 5. Sécurité — démonstration des contrôles d'accès

```bash
# 401 : accès sans token
curl http://127.0.0.1:3000/api/orders/me

# 403 : USER qui tente de modifier un statut (rôle RESTAURANT requis)
curl -X PATCH http://127.0.0.1:3000/api/orders/<orderId>/status \
  -H "Authorization: Bearer <token_client>" \
  -H "Content-Type: application/json" \
  -d '{"status":"CONFIRMED"}'

# 403 : RESTAURANT qui tente de modifier le restaurant d'un autre
curl -X PATCH http://127.0.0.1:3000/api/restaurants/me \
  -H "Authorization: Bearer <token_akira>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Piratage"}'

# 409 : email déjà utilisé
curl -X POST http://127.0.0.1:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"client@atyourdoor.fr","password":"Test1234!"}'

# 400 : données invalides (email mal formé)
curl -X POST http://127.0.0.1:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"pas-un-email","password":"Test1234!"}'
```

---

### 6. GraphQL

```bash
# Lister les restaurants avec leurs plats
curl -X POST http://127.0.0.1:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ restaurants { id name description dishes { name price } } }"}'

# Restaurant par ID
curl -X POST http://127.0.0.1:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ restaurant(id: \"<id>\") { name address dishes { name price available } } }"}'

# Commandes (authentifié)
curl -X POST http://127.0.0.1:3000/graphql \
  -H "Authorization: Bearer <token_client>" \
  -H "Content-Type: application/json" \
  -d '{"query":"{ orders { id status totalPrice items { quantity unitPrice } } }"}'
```

---

### 7. WebSocket (notifications temps réel)

Se connecter en tant que restaurant et ouvrir la console du navigateur sur la page `/commandes` — une notification apparaît dès qu'un client passe commande.

Protocol d'authentification WebSocket :
```
1. Connexion → ws://127.0.0.1:3000/ws/restaurant
2. Envoyer   → { "event": "authenticate", "token": "<jwt>" }
3. Recevoir  → { "event": "connected", "data": { "restaurantId": "...", "message": "Connexion établie" } }
4. Recevoir  → { "event": "new-order", "data": { "orderId": "...", "totalPrice": 27.0, "itemCount": 2 } }
```

---

### 8. Tests & CI

```bash
# Lancer les tests (base atdoor_test, données de dev non touchées)
cd fastify-demo && npm test

# Avec coverage
cd fastify-demo && npx vitest run --coverage

# Lancer les tests frontend
cd front && npx vitest run
```

---

## Architecture du projet

```
AtYourDoor/
├── fastify-demo/          # API REST + GraphQL + WebSocket
│   ├── routes/            # Endpoints REST (auth, restaurants, dishes, orders, users)
│   ├── services/          # Logique métier
│   ├── schemas/           # Validation TypeBox (request/response)
│   ├── decorators/        # JWT + authorize middleware
│   ├── graphql/           # Mercurius (schema + resolvers)
│   ├── prisma/            # Schéma BD, migrations, seed
│   └── __tests__/         # Tests unitaires + intégration
└── front/                 # SPA Nuxt 3
    ├── app/pages/         # Vues (login, register, restaurants, commandes...)
    ├── app/components/    # Header, RestaurantItem, AppImage...
    ├── stores/            # Pinia (user, commande, global)
    └── utils/             # apiFetch, mappers, errors
```

---

## Points clés à mentionner en soutenance

### Sécurité
- **JWT** avec expiration 15 min + **Refresh Token** (7 jours, hashé en base, rotation à chaque usage)
- **RBAC** : `USER`, `RESTAURANT`, `ADMIN` — middleware `authorize([roles])` sur chaque route
- **Ownership** : un restaurant ne voit que ses propres commandes/plats
- **Validation TypeBox** sur toutes les entrées (body, query, params) → 400 automatique
- **Headers** : `X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`, CORS configuré

### Conception API
- **REST** strict : verbes HTTP, codes de statut RFC corrects, format erreur RFC 7807
- **Pagination** `{data, pagination: {total, limit, offset}}` sur toutes les listes
- **Transactions Prisma** pour les commandes (calcul totalPrice atomique)

### CI/CD
- **GitHub Actions** : tests → build Docker → push GHCR (`:latest` + `:sha`)
- **Base séparée** `atdoor_test` pour les tests, `atdoor` pour le dev
- **Coverage** > 50% sur le code métier

### Limites & améliorations possibles
- Pas de rate limiting (ex: `@fastify/rate-limit`)
- Pas de notifications push (service worker actif mais sans push API)
- Images des restaurants stockées par URL externe, pas d'upload
- Refresh token sans blacklist globale (révocation unitaire seulement)
- GraphQL sans mutations (queries uniquement)
