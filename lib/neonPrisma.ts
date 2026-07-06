import { PrismaClient } from "@prisma/client";

export const neonPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL, // Neon
    },
  },
});