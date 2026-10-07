import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../src/index';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

describe('Village API (Phần 1.4)', () => {
  let adminToken = '';
  let userToken = '';
  let testVillageId = '';

  beforeAll(async () => {
    const passwordHash = await bcrypt.hash('password123', 10);

    await prisma.users.create({
      data: {
        username: 'admin_village_test',
        password: passwordHash,
        role: 'admin',
      },
    });

    await prisma.users.create({
      data: {
        username: 'user_village_test',
        password: passwordHash,
        role: 'user',
      },
    });

    const resAdmin = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin_village_test', password: 'password123' });
    adminToken = resAdmin.body.accessToken;

    const resUser = await request(app)
      .post('/api/auth/login')
      .send({ username: 'user_village_test', password: 'password123' });
    userToken = resUser.body.accessToken;
  });

  afterAll(async () => {
    await prisma.users.deleteMany({
      where: { username: { in: ['admin_village_test', 'user_village_test'] } },
    });
    if (testVillageId) {
      await prisma.households.deleteMany({ where: { village_id: testVillageId } });
      await prisma.villages.deleteMany({ where: { id: testVillageId } });
    }
    await prisma.$disconnect();
  });

  it('1. User/Khách có thể lấy danh sách thôn', async () => {
    const res = await request(app).get('/api/villages');
    expect(res.status).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
  });

  it('2. Admin tạo thôn mới', async () => {
    const res = await request(app)
      .post('/api/villages')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Thôn Mới Test' });

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Thôn Mới Test');
    testVillageId = res.body.data.id;
  });

  it('3. User thường bị chặn khi tạo thôn mới (403)', async () => {
    const res = await request(app)
      .post('/api/villages')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ name: 'Thôn Bất Hợp Pháp' });

    expect(res.status).toBe(403);
  });

  it('4. Admin đổi tên thôn', async () => {
    const res = await request(app)
      .put(`/api/villages/${testVillageId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Thôn Đã Đổi Tên' });

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Thôn Đã Đổi Tên');
  });

  it('5. Admin xóa thôn', async () => {
    const res = await request(app)
      .delete(`/api/villages/${testVillageId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    testVillageId = '';
  });
});
