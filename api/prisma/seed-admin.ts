import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const fallbackName = "Administrador";
const fallbackEmail = "admin@admin.com";
const fallbackPassword = "admin";

const name = process.env.INITIAL_ADMIN_NAME?.trim() ?? fallbackName;
const email = (process.env.INITIAL_ADMIN_EMAIL?.trim().toLowerCase() ?? fallbackEmail).toLowerCase();
const password = process.env.INITIAL_ADMIN_PASSWORD ?? fallbackPassword;
const databaseUrl = process.env.DATABASE_URL;

async function main() {
  if (!databaseUrl) {
    throw new Error("Define DATABASE_URL antes de ejecutar el seed del administrador.");
  }

  if (password.length < 4) {
    throw new Error("La contraseña del administrador debe tener al menos 4 caracteres.");
  }

  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl }) });
  try {
    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.adminUser.upsert({
      where: { email },
      create: { name, email, passwordHash, role: "ADMIN", active: true },
      update: { name, passwordHash, role: "ADMIN", active: true },
    });
    console.log(`Administrador inicial preparado: ${email} / ${password}`);
  } finally {
    await prisma.$disconnect();
  }
}

void main();