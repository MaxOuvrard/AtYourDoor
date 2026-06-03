import dotenvx from "@dotenvx/dotenvx";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../generated/prisma/client.js";
import bcrypt from "bcryptjs";

dotenvx.config();

const adapter = new PrismaMariaDb(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

async function main() {
  const hash = (pwd: string) => bcrypt.hash(pwd, 10);

  // ── Users ──────────────────────────────────────────────────────────────────

  const admin = await prisma.user.upsert({
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

  const adminLogin = await prisma.user.upsert({
    where: { email: "admin@admin.com" },
    update: {},
    create: {
      email: "admin@admin.com",
      password: await hash("admin"),
      firstName: "Admin",
      lastName: "User",
      role: "ADMIN",
    },
  });

  const ownerMario = await prisma.user.upsert({
    where: { email: "mario@pizzeria.fr" },
    update: {},
    create: {
      email: "mario@pizzeria.fr",
      password: await hash("Mario1234!"),
      firstName: "Mario",
      lastName: "Rossi",
      phone: "0601020304",
      role: "RESTAURANT",
    },
  });

  const ownerAkira = await prisma.user.upsert({
    where: { email: "akira@sushi.fr" },
    update: {},
    create: {
      email: "akira@sushi.fr",
      password: await hash("Akira1234!"),
      firstName: "Akira",
      lastName: "Tanaka",
      phone: "0605060708",
      role: "RESTAURANT",
    },
  });

  const userAlice = await prisma.user.upsert({
    where: { email: "alice@example.fr" },
    update: {},
    create: {
      email: "alice@example.fr",
      password: await hash("Alice1234!"),
      firstName: "Alice",
      lastName: "Martin",
      phone: "0610111213",
      role: "USER",
    },
  });

  const userBob = await prisma.user.upsert({
    where: { email: "bob@example.fr" },
    update: {},
    create: {
      email: "bob@example.fr",
      password: await hash("Bob12345!"),
      firstName: "Bob",
      lastName: "Dupont",
      role: "USER",
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

  // ── Plats ──────────────────────────────────────────────────────────────────

  const [margherita, quattroFormaggi, tiramisu] = await Promise.all([
    prisma.plat.upsert({
      where: { id: "plat-margherita-001" },
      update: {},
      create: {
        id: "plat-margherita-001",
        name: "Margherita",
        description: "Tomate, mozzarella, basilic frais.",
        price: 12.5,
        restaurantId: pizzeria.id,
      },
    }),
    prisma.plat.upsert({
      where: { id: "plat-4formaggi-001" },
      update: {},
      create: {
        id: "plat-4formaggi-001",
        name: "Quattro Formaggi",
        description: "Mozzarella, gorgonzola, parmesan, ricotta.",
        price: 14.9,
        restaurantId: pizzeria.id,
      },
    }),
    prisma.plat.upsert({
      where: { id: "plat-tiramisu-001" },
      update: {},
      create: {
        id: "plat-tiramisu-001",
        name: "Tiramisu maison",
        description: "Recette traditionnelle au mascarpone.",
        price: 6.5,
        restaurantId: pizzeria.id,
      },
    }),
  ]);

  const [salmonMaki, thonSashimi, edamame] = await Promise.all([
    prisma.plat.upsert({
      where: { id: "plat-salmon-maki-001" },
      update: {},
      create: {
        id: "plat-salmon-maki-001",
        name: "Maki Saumon (8 pcs)",
        description: "Riz vinaigré, saumon frais, nori.",
        price: 9.0,
        restaurantId: sushiBar.id,
      },
    }),
    prisma.plat.upsert({
      where: { id: "plat-thon-sashimi-001" },
      update: {},
      create: {
        id: "plat-thon-sashimi-001",
        name: "Sashimi Thon (6 pcs)",
        description: "Tranches de thon rouge premium.",
        price: 13.5,
        restaurantId: sushiBar.id,
      },
    }),
    prisma.plat.upsert({
      where: { id: "plat-edamame-001" },
      update: {},
      create: {
        id: "plat-edamame-001",
        name: "Edamame",
        description: "Fèves de soja vapeur, fleur de sel.",
        price: 4.5,
        restaurantId: sushiBar.id,
      },
    }),
  ]);

  // ── Commandes ──────────────────────────────────────────────────────────────

  const commandeAlice = await prisma.commande.upsert({
    where: { id: "commande-alice-001" },
    update: {},
    create: {
      id: "commande-alice-001",
      status: "DELIVERED",
      totalPrice: 33.9,
      deliveryAddress: "5 rue Victor Hugo, 75016 Paris",
      userId: userAlice.id,
      restaurantId: pizzeria.id,
      commandePlats: {
        create: [
          { quantity: 2, unitPrice: 12.5, platId: margherita.id },
          { quantity: 1, unitPrice: 6.5,  platId: tiramisu.id   },
        ],
      },
    },
  });

  await prisma.commande.upsert({
    where: { id: "commande-bob-001" },
    update: {},
    create: {
      id: "commande-bob-001",
      status: "PREPARING",
      totalPrice: 27.0,
      deliveryAddress: "22 boulevard Haussmann, 75009 Paris",
      userId: userBob.id,
      restaurantId: sushiBar.id,
      commandePlats: {
        create: [
          { quantity: 2, unitPrice: 9.0, platId: salmonMaki.id  },
          { quantity: 2, unitPrice: 4.5, platId: edamame.id     },
        ],
      },
    },
  });

  console.log("✓ Seed terminé —", {
    users: [admin.email, adminLogin.email, ownerMario.email, ownerAkira.email, userAlice.email, userBob.email],
    restaurants: [pizzeria.name, sushiBar.name],
    plats: [margherita.name, quattroFormaggi.name, tiramisu.name, salmonMaki.name, thonSashimi.name, edamame.name],
    commandes: [commandeAlice.id],
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
