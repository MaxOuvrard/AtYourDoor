import { proxyToBackend } from '../utils/proxy'

// Catch-all : toutes les routes /api/* sans handler explicite
// (auth, orders, dishes, users, graphql…) sont proxifiées vers Fastify.
export default defineEventHandler((event) => proxyToBackend(event))
