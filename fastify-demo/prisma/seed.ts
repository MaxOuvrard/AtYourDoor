import dotenvx from "@dotenvx/dotenvx";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../generated/prisma/client.js";
import bcrypt from "bcryptjs";

dotenvx.config();

const adapter = new PrismaMariaDb(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

const hash = (pwd: string) => bcrypt.hash(pwd, 10);

async function main() {

  // ── Comptes ────────────────────────────────────────────────────────────────

  await prisma.user.upsert({
    where: { email: "admin@atyourdoor.fr" },
    update: {},
    create: {
      email: "admin@atyourdoor.fr",
      password: await hash("Admin1234!"),
      firstName: "Super",
      lastName: "Admin",
      role: "ADMIN",
    },
  });

  await prisma.user.upsert({
    where: { email: "client@atyourdoor.fr" },
    update: {},
    create: {
      email: "client@atyourdoor.fr",
      password: await hash("Client1234!"),
      firstName: "Sophie",
      lastName: "Dubois",
      phone: "0610111213",
      role: "USER",
    },
  });

  const ownerMario = await prisma.user.upsert({
    where: { email: "mario@atyourdoor.fr" },
    update: {},
    create: {
      email: "mario@atyourdoor.fr",
      password: await hash("Mario1234!"),
      firstName: "Mario",
      lastName: "Rossi",
      phone: "0601020304",
      role: "RESTAURANT",
    },
  });

  const ownerAkira = await prisma.user.upsert({
    where: { email: "akira@atyourdoor.fr" },
    update: {},
    create: {
      email: "akira@atyourdoor.fr",
      password: await hash("Akira1234!"),
      firstName: "Akira",
      lastName: "Tanaka",
      phone: "0605060708",
      role: "RESTAURANT",
    },
  });

  const ownerLeila = await prisma.user.upsert({
    where: { email: "leila@atyourdoor.fr" },
    update: {},
    create: {
      email: "leila@atyourdoor.fr",
      password: await hash("Leila1234!"),
      firstName: "Leila",
      lastName: "Benali",
      phone: "0611223344",
      role: "RESTAURANT",
    },
  });

  const ownerThomas = await prisma.user.upsert({
    where: { email: "thomas@atyourdoor.fr" },
    update: {},
    create: {
      email: "thomas@atyourdoor.fr",
      password: await hash("Thomas1234!"),
      firstName: "Thomas",
      lastName: "Bernard",
      phone: "0622334455",
      role: "RESTAURANT",
    },
  });

  // ── Restaurants ────────────────────────────────────────────────────────────

  const pizzeria = await prisma.restaurant.upsert({
    where: { ownerId: ownerMario.id },
    update: {},
    create: {
      name: "Chez Mario",
      description: "Pizzas napolitaines cuites au feu de bois.",
      address: "12 rue de la Paix, 75001 Paris",
      phone: "0142010203",
      status: "OPEN",
      ownerId: ownerMario.id,
    },
  });

  const sushiBar = await prisma.restaurant.upsert({
    where: { ownerId: ownerAkira.id },
    update: {},
    create: {
      name: "Sushi Akira",
      description: "Sushis et makis préparés à la minute.",
      address: "8 avenue Montaigne, 75008 Paris",
      phone: "0143040506",
      status: "OPEN",
      ownerId: ownerAkira.id,
    },
  });

  const tagine = await prisma.restaurant.upsert({
    where: { ownerId: ownerLeila.id },
    update: {},
    create: {
      name: "Les Saveurs du Maghreb",
      description: "Cuisine marocaine traditionnelle. Tagines, couscous et pâtisseries orientales.",
      address: "34 rue Oberkampf, 75011 Paris",
      phone: "0144556677",
      status: "OPEN",
      ownerId: ownerLeila.id,
    },
  });

  const brasserie = await prisma.restaurant.upsert({
    where: { ownerId: ownerThomas.id },
    update: {},
    create: {
      name: "Le Comptoir Français",
      description: "Brasserie traditionnelle. Tartines, salades et plats du marché.",
      address: "5 place du Marché, 69001 Lyon",
      phone: "0478998877",
      status: "OPEN",
      ownerId: ownerThomas.id,
    },
  });

  // ── Plats — Chez Mario ─────────────────────────────────────────────────────

  await Promise.all([
    prisma.plat.upsert({
      where: { id: "seed-margherita" },
      update: {},
      create: { id: "seed-margherita", name: "Margherita", description: "Tomate, mozzarella fior di latte, basilic frais.", price: 12.5, restaurantId: pizzeria.id },
    }),
    prisma.plat.upsert({
      where: { id: "seed-4formaggi" },
      update: {},
      create: { id: "seed-4formaggi", name: "Quattro Formaggi", description: "Mozzarella, gorgonzola, parmesan, ricotta.", price: 14.9, restaurantId: pizzeria.id },
    }),
    prisma.plat.upsert({
      where: { id: "seed-diavola" },
      update: {},
      create: { id: "seed-diavola", name: "Diavola", description: "Tomate, mozzarella, chorizo piquant, piment.", price: 13.5, restaurantId: pizzeria.id },
    }),
    prisma.plat.upsert({
      where: { id: "seed-calzone" },
      update: {},
      create: { id: "seed-calzone", name: "Calzone", description: "Pizza fermée, jambon, champignons, fromage.", price: 13.0, restaurantId: pizzeria.id },
    }),
    prisma.plat.upsert({
      where: { id: "seed-tiramisu" },
      update: {},
      create: { id: "seed-tiramisu", name: "Tiramisu maison", description: "Recette traditionnelle au mascarpone et café.", price: 6.5, restaurantId: pizzeria.id },
    }),
  ]);

  // ── Plats — Sushi Akira ────────────────────────────────────────────────────

  await Promise.all([
    prisma.plat.upsert({
      where: { id: "seed-maki-saumon" },
      update: {},
      create: { id: "seed-maki-saumon", name: "Maki Saumon (8 pcs)", description: "Riz vinaigré, saumon frais, nori.", price: 9.0, restaurantId: sushiBar.id },
    }),
    prisma.plat.upsert({
      where: { id: "seed-sashimi-thon" },
      update: {},
      create: { id: "seed-sashimi-thon", name: "Sashimi Thon (6 pcs)", description: "Tranches de thon rouge premium.", price: 13.5, restaurantId: sushiBar.id },
    }),
    prisma.plat.upsert({
      where: { id: "seed-california" },
      update: {},
      create: { id: "seed-california", name: "California Roll (6 pcs)", description: "Crabe, avocat, concombre, sésame.", price: 10.5, restaurantId: sushiBar.id },
    }),
    prisma.plat.upsert({
      where: { id: "seed-edamame" },
      update: {},
      create: { id: "seed-edamame", name: "Edamame", description: "Fèves de soja vapeur, fleur de sel.", price: 4.5, restaurantId: sushiBar.id },
    }),
    prisma.plat.upsert({
      where: { id: "seed-miso" },
      update: {},
      create: { id: "seed-miso", name: "Soupe Miso", description: "Bouillon dashi, tofu soyeux, wakamé.", price: 3.5, restaurantId: sushiBar.id },
    }),
  ]);

  // ── Plats — Les Saveurs du Maghreb ─────────────────────────────────────────

  await Promise.all([
    prisma.plat.upsert({
      where: { id: "seed-tagine-agneau" },
      update: {},
      create: { id: "seed-tagine-agneau", name: "Tagine Agneau & Pruneaux", description: "Agneau fondant, pruneaux, amandes grillées, épices ras-el-hanout.", price: 16.9, restaurantId: tagine.id },
    }),
    prisma.plat.upsert({
      where: { id: "seed-couscous-royal" },
      update: {},
      create: { id: "seed-couscous-royal", name: "Couscous Royal", description: "Semoule, merguez, poulet, légumes, brochette d'agneau.", price: 19.5, restaurantId: tagine.id },
    }),
    prisma.plat.upsert({
      where: { id: "seed-briouats" },
      update: {},
      create: { id: "seed-briouats", name: "Briouats au Fromage (4 pcs)", description: "Feuilletés croustillants, fromage frais, menthe.", price: 7.0, restaurantId: tagine.id },
    }),
    prisma.plat.upsert({
      where: { id: "seed-pastilla" },
      update: {},
      create: { id: "seed-pastilla", name: "Pastilla au Poulet", description: "Feuilleté sucré-salé, poulet, amandes, cannelle.", price: 14.0, restaurantId: tagine.id },
    }),
    prisma.plat.upsert({
      where: { id: "seed-cornes-gazelle" },
      update: {},
      create: { id: "seed-cornes-gazelle", name: "Cornes de Gazelle (3 pcs)", description: "Pâtisserie à la pâte d'amande et fleur d'oranger.", price: 5.5, restaurantId: tagine.id },
    }),
  ]);

  // ── Plats — Le Comptoir Français ───────────────────────────────────────────

  await Promise.all([
    prisma.plat.upsert({
      where: { id: "seed-tartine-chevre" },
      update: {},
      create: { id: "seed-tartine-chevre", name: "Tartine Chèvre & Miel", description: "Pain de campagne grillé, chèvre frais, miel d'acacia, noix.", price: 10.5, restaurantId: brasserie.id },
    }),
    prisma.plat.upsert({
      where: { id: "seed-salade-cesar" },
      update: {},
      create: { id: "seed-salade-cesar", name: "Salade César", description: "Romaine, poulet grillé, parmesan, croûtons, sauce césar.", price: 12.0, restaurantId: brasserie.id },
    }),
    prisma.plat.upsert({
      where: { id: "seed-boeuf-bourguignon" },
      update: {},
      create: { id: "seed-boeuf-bourguignon", name: "Bœuf Bourguignon", description: "Bœuf mijoté au vin rouge, carottes, champignons, lardons.", price: 17.5, restaurantId: brasserie.id },
    }),
    prisma.plat.upsert({
      where: { id: "seed-quiche-lorraine" },
      update: {},
      create: { id: "seed-quiche-lorraine", name: "Quiche Lorraine", description: "Pâte brisée, lardons fumés, crème, gruyère.", price: 11.0, restaurantId: brasserie.id },
    }),
    prisma.plat.upsert({
      where: { id: "seed-creme-brulee" },
      update: {},
      create: { id: "seed-creme-brulee", name: "Crème Brûlée", description: "Vanille de Madagascar, sucre caramélisé à la flamme.", price: 6.0, restaurantId: brasserie.id },
    }),
  ]);

  console.log("\n✅ Seed terminé\n");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  COMPTES");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  👑 ADMIN    admin@atyourdoor.fr    Admin1234!");
  console.log("  👤 CLIENT   client@atyourdoor.fr   Client1234!");
  console.log("  🍕 RESTO    mario@atyourdoor.fr    Mario1234!");
  console.log("  🍣 RESTO    akira@atyourdoor.fr    Akira1234!");
  console.log("  🥙 RESTO    leila@atyourdoor.fr    Leila1234!");
  console.log("  🥐 RESTO    thomas@atyourdoor.fr   Thomas1234!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  RESTAURANTS & PLATS");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  🍕 Chez Mario              — 5 plats");
  console.log("  🍣 Sushi Akira             — 5 plats");
  console.log("  🥙 Les Saveurs du Maghreb  — 5 plats");
  console.log("  🥐 Le Comptoir Français    — 5 plats");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
