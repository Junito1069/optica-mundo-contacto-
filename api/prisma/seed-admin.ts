import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const name = process.env.INITIAL_ADMIN_NAME?.trim();
const email = process.env.INITIAL_ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.INITIAL_ADMIN_PASSWORD;
const databaseUrl = process.env.DATABASE_URL;

async function main() {
  if (!databaseUrl || !name || !email || !password) {
    throw new Error("Define DATABASE_URL, INITIAL_ADMIN_NAME, INITIAL_ADMIN_EMAIL e INITIAL_ADMIN_PASSWORD antes de ejecutar el seed.");
  }

  if (password.length < 12) throw new Error("INITIAL_ADMIN_PASSWORD debe tener al menos 12 caracteres.");

  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl }) });
  try {
    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.adminUser.upsert({
      where: { email },
      create: { name, email, passwordHash, role: "ADMIN", active: true },
      update: { name, passwordHash, role: "ADMIN", active: true },
    });
    console.log(`Administrador inicial preparado: ${email}`);
  } finally {
    await prisma.$disconnect();
  }
}

void main();