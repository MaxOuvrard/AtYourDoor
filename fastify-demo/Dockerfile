# ── Stage 1 : Build ───────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# DATABASE_URL fictive : prisma generate lit le schéma, pas la DB
ENV DATABASE_URL=mysql://build:build@localhost:3306/build

# Génère le client Prisma (type-check uniquement, erreurs non bloquantes)
RUN npx prisma generate
RUN npm run build

# ── Stage 2 : Runtime ─────────────────────────────────────────────────────────
# On utilise tsx (comme en dev) pour éviter les problèmes d'imports ESM
# des fichiers TypeScript générés par Prisma 7.
FROM node:22-alpine AS runtime

WORKDIR /app

# Dépendances (inclut tsx, prisma, etc.)
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

# Sources TypeScript
COPY --from=builder /app/index.ts        ./
COPY --from=builder /app/tsconfig.json   ./
COPY --from=builder /app/prisma.config.ts ./
COPY --from=builder /app/config          ./config
COPY --from=builder /app/common          ./common
COPY --from=builder /app/decorators      ./decorators
COPY --from=builder /app/graphql         ./graphql
COPY --from=builder /app/routes          ./routes
COPY --from=builder /app/schemas         ./schemas
COPY --from=builder /app/services        ./services
COPY --from=builder /app/types           ./types

# Prisma : schéma + migrations + client généré
COPY --from=builder /app/prisma          ./prisma
COPY --from=builder /app/generated       ./generated

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && npx tsx index.ts"]
