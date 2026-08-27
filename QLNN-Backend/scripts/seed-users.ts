import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.users.findUnique({ where: { username: 'admin' } });
  if (existing) {
    console.log('Admin already exists.');
    return;
  }

  const hashedPassword = await bcrypt.hash('admin123', 10);
  await prisma.users.create({
    data: {
      username: 'admin',
      password: hashedPassword,
      role: 'admin'
    }
  });

  console.log('Created default admin user: admin / admin123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
