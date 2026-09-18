// tests/setup.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

beforeAll(async () => {
  // Setup logic for tests (e.g., connect to a test database if needed)
});

afterAll(async () => {
  await prisma.$disconnect();
});
