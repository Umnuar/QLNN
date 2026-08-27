import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { generateAccessToken, generateRefreshToken } from './src/config/jwt';

const prisma = new PrismaClient();

async function testLogin() {
  try {
    const user = await prisma.users.findUnique({ where: { username: 'admin' } });
    if (!user) { console.log('no user'); return; }
    
    const isValid = await bcrypt.compare('admin123', user.password);
    console.log('isValid', isValid);

    const payload = {
      id: user.id,
      username: user.username,
      role: user.role as 'admin' | 'user',
      village_id: user.village_id,
    };
    
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);
    console.log('success');
  } catch (e) {
    console.error('ERROR', e);
  }
}
testLogin().finally(() => prisma.$disconnect());
