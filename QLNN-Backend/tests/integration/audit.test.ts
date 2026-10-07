import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../src/index';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

describe('Audit API (Phần 1.3)', () => {
  let adminToken = '';
  let userToken = '';
  let testVillageId1 = '';
  let testVillageId2 = '';

  beforeAll(async () => {
    const village1 = await prisma.villages.create({ data: { name: 'Thôn 1 Test' } });
    const village2 = await prisma.villages.create({ data: { name: 'Thôn 2 Test' } });
    testVillageId1 = village1.id;
    testVillageId2 = village2.id;

    const passwordHash = await bcrypt.hash('password123', 10);

    const adminUser = await prisma.users.create({
      data: {
        username: 'admin_audit_test',
        password: passwordHash,
        role: 'admin',
      },
    });

    const normalUser = await prisma.users.create({
      data: {
        username: 'user_audit_test',
        password: passwordHash,
        role: 'user',
        village_id: testVillageId1,
      },
    });

    const resAdmin = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin_audit_test', password: 'password123' });
    adminToken = resAdmin.body.accessToken;

    const resUser = await request(app)
      .post('/api/auth/login')
      .send({ username: 'user_audit_test', password: 'password123' });
    userToken = resUser.body.accessToken;

    await prisma.audit_logs.create({
      data: {
        user_id: normalUser.id,
        username: 'user_audit_test',
        action: 'CREATE',
        entity_type: 'households',
        village_id: testVillageId1,
        details: { note: 'Tạo thử' },
      },
    });

    await prisma.audit_logs.create({
      data: {
        user_id: adminUser.id,
        username: 'admin_audit_test',
        action: 'UPDATE',
        entity_type: 'households',
        village_id: testVillageId2,
        details: { note: 'Sửa thử' },
      },
    });
  });

  afterAll(async () => {
    await prisma.audit_logs.deleteMany({
      where: { village_id: { in: [testVillageId1, testVillageId2] } },
    });
    await prisma.users.deleteMany({
      where: { username: { in: ['admin_audit_test', 'user_audit_test'] } },
    });
    await prisma.villages.deleteMany({
      where: { id: { in: [testVillageId1, testVillageId2] } },
    });
    await prisma.$disconnect();
  });

  it('1. Admin lấy tất cả audit logs', async () => {
    const res = await request(app)
      .get('/api/audit')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
  });

  it('2. Admin lấy audit logs theo village_id', async () => {
    const res = await request(app)
      .get(`/api/audit/${testVillageId1}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.every((l: any) => l.village_id === testVillageId1)).toBe(true);
  });

  it('3. User lấy audit logs chỉ thấy thôn của mình', async () => {
    const res = await request(app)
      .get('/api/audit')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.every((l: any) => l.village_id === testVillageId1)).toBe(true);
  });

  it('4. User bị từ chối khi cố lấy audit logs thôn khác (403)', async () => {
    const res = await request(app)
      .get(`/api/audit/${testVillageId2}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(403);
  });
});
