// tests/setup.ts
import { PrismaClient } from "@prisma/client";

process.env.ENCRYPTION_KEY ||=
	"0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
process.env.PHONE_HASH_PEPPER ||= "dakha_qlnn_test_pepper";

const prisma = new PrismaClient();

beforeAll(async () => {
	// Setup logic for tests
});

afterAll(async () => {
	await prisma.$disconnect();
});
