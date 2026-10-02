import crypto from "node:crypto";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.users.findUnique({ where: { username: "admin" } });
  if (existing) {
    console.log("Admin already exists.");
    return;
  }

  const initialPassword = process.env.INITIAL_ADMIN_PASSWORD || crypto.randomBytes(8).toString("hex") + "A1!";
  const hashedPassword = await bcrypt.hash(initialPassword, 10);
  await prisma.users.create({
    data: {
      username: "admin",
      password: hashedPassword,
      role: "admin",
      token_version: 1,
    },
  });

  console.log("Created default admin user: admin");
  console.log(`Generated Password: ${initialPassword}`);
  console.log("NOTE: Save this initial password and change it after first login.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
