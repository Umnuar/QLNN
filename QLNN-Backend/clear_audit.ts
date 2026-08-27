import { prisma } from './src/config/prisma';
prisma.audit_logs.deleteMany().then(() => console.log('Cleared audit_logs')).catch(console.error).finally(() => prisma.$disconnect());
