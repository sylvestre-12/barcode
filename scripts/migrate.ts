import { PrismaClient } from "@prisma/client";

// LOCAL DB (old data)
const local = new PrismaClient({
  datasources: {
    db: {
      url: process.env.LOCAL_DATABASE_URL,
    },
  },
});

// NEON DB (new production)
const neon = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

async function migrate() {
  console.log("🚀 Migration started...");

  const users = await local.profile.findMany();
  console.log("📦 Local users found:", users.length);

  for (const user of users) {
    await neon.profile.create({
      data: {
        ...user,
        id: undefined, // let Neon generate new UUID
      },
    });
  }

  console.log("✅ Migration finished!");
}

migrate()
  .catch((e) => {
    console.error("❌ Migration error:", e);
  })
  .finally(async () => {
    await local.$disconnect();
    await neon.$disconnect();
  });