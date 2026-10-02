import request from 'supertest';
import app from '../../src/index';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

describe('Auth API & RBAC (Phần 1.1)', () => {
  let adminToken = '';
  let userToken = '';
  let testVillageId = '';

  beforeAll(async () => {
    // 1. Tạo thôn test
    const village = await prisma.villages.create({
      data: { name: 'Thôn Test Auth' },
    });
    testVillageId = village.id;

    // 2. Tạo User Admin & User thường
    const passwordHash = await bcrypt.hash('password123', 10);
    await prisma.users.create({
      data: {
        username: 'admin_test_auth',
        password: passwordHash,
        role: 'admin',
      },
    });

    await prisma.users.create({
      data: {
        username: 'user_test_auth',
        password: passwordHash,
        role: 'user',
        village_id: testVillageId,
      },
    });
  });

  afterAll(async () => {
    await prisma.users.deleteMany({
      where: { username: { in: ['admin_test_auth', 'user_test_auth'] } },
    });
    await prisma.villages.deleteMany({ where: { id: testVillageId } });
    await prisma.$disconnect();
  });

  it('1. Đăng nhập thành công với thông tin hợp lệ (Admin)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin_test_auth', password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
    adminToken = res.body.accessToken;
  });

  it('2. Đăng nhập thành công với User thường', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'user_test_auth', password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.user.village_id).toBe(testVillageId);
    userToken = res.body.accessToken;
  });

  it('3. Đăng nhập thất bại khi sai mật khẩu', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin_test_auth', password: 'wrongpassword' });

    expect(res.status).toBe(401);
    expect(res.body.error).toBeDefined();
  });

  it('4. Chặn truy cập API khi không gửi token', async () => {
    const res = await request(app).get('/api/users');
    expect(res.status).toBe(401);
  });

  it('5. Admin được phép truy cập danh sách Users', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toBeInstanceOf(Array);
  });

  it('6. User thường bị từ chối truy cập danh sách Users (403 Forbidden)', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(403);
  });

  it('7. Đăng xuất thu hồi phiên (POST /api/auth/logout) tăng token_version', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ username: 'user_test_auth', password: 'password123' });

    expect(loginRes.status).toBe(200);
    const sessionToken = loginRes.body.accessToken;
    const sessionRefreshToken = loginRes.body.refreshToken;

    const logoutRes = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${sessionToken}`);

    expect(logoutRes.status).toBe(200);
    expect(logoutRes.body.success).toBe(true);

    // 8. Chặn Refresh Token Replay: token cũ bị từ chối cấp token mới sau khi đã logout (SEC-05-A)
    const replayRes = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: sessionRefreshToken });

    expect(replayRes.status).toBe(401);
    expect(replayRes.body.error).toContain('thu hồi');
  });
});
