import request from 'supertest';
import app from '../../src/index';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

describe('Household API (Phần 1.2)', () => {
  let token = '';
  let testVillageId = '';
  let testHouseholdId = '';

  beforeAll(async () => {
    // 1. Tạo Village
    const village = await prisma.villages.create({
      data: { name: 'Thôn Test Household API' },
    });
    testVillageId = village.id;

    // 2. Tạo User Admin
    const passwordHash = await bcrypt.hash('password123', 10);
    await prisma.users.create({
      data: {
        username: 'admin_hh_test_v2',
        password: passwordHash,
        role: 'admin',
      },
    });

    // 3. Lấy Token
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin_hh_test_v2', password: 'password123' });
    token = res.body.accessToken;
  });

  afterAll(async () => {
    await prisma.households.deleteMany({ where: { village_id: testVillageId } });
    await prisma.users.deleteMany({ where: { username: 'admin_hh_test_v2' } });
    await prisma.villages.deleteMany({ where: { id: testVillageId } });
    await prisma.$disconnect();
  });

  it('1. Thêm mới Hộ Nông Nghiệp', async () => {
    const payload = {
      village_id: testVillageId,
      stt: 1,
      full_name: 'Nguyễn Văn Test',
      phone: '0901234567',
      address: 'Đội 1',
      notes: 'Hộ mẫu thử nghiệm',
      cafe_household: 1.5,
      cow: 5,
      fish_pond: 0.2,
    };

    const res = await request(app)
      .post('/api/households')
      .set('Authorization', `Bearer ${token}`)
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body.data.full_name).toBe('Nguyễn Văn Test');
    expect(res.body.data.cafe_household).toBe(1.5);
    expect(res.body.data.cow).toBe(5);
    expect(res.body.data.fish_pond).toBe(0.2);
    testHouseholdId = res.body.data.id;
  });

  it('2. Lấy danh sách Hộ (có lọc theo thôn)', async () => {
    const res = await request(app)
      .get(`/api/households?villageId=${testVillageId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data[0].id).toBe(testHouseholdId);
  });

  it('3. Lấy chi tiết 1 hộ', async () => {
    const res = await request(app)
      .get(`/api/households/${testHouseholdId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(testHouseholdId);
  });

  it('4. Cập nhật Hộ (Test thuật toán Diff & Version)', async () => {
    const detailRes = await request(app)
      .get(`/api/households/${testHouseholdId}`)
      .set('Authorization', `Bearer ${token}`);
    const currentVersion = detailRes.body.data.version;

    const updatePayload = {
      full_name: 'Nguyễn Văn Test Đã Đổi',
      version: currentVersion,
      cafe_household: 2.0,
      cow: 10,
    };

    const res = await request(app)
      .put(`/api/households/${testHouseholdId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(updatePayload);

    expect(res.status).toBe(200);
    expect(res.body.data.full_name).toBe('Nguyễn Văn Test Đã Đổi');
    expect(res.body.data.cafe_household).toBe(2.0);
    expect(res.body.data.cow).toBe(10);
    expect(res.body.data.version).toBe(currentVersion + 1);
  });

  it('5. Cập nhật Hộ: Khóa đồng thời (Optimistic Locking 409)', async () => {
    const updatePayload = {
      full_name: 'Thử xung đột',
      version: 999, // Sai version
    };

    const res = await request(app)
      .put(`/api/households/${testHouseholdId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(updatePayload);

    expect(res.status).toBe(409);
    expect(res.body.error).toContain('thay đổi bởi người khác');
  });

  it('6. Xóa mềm (Soft Delete)', async () => {
    const res = await request(app)
      .delete(`/api/households/${testHouseholdId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);

    const getRes = await request(app)
      .get(`/api/households/${testHouseholdId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(getRes.status).toBe(404);
  });

  it('7. Khôi phục (Restore)', async () => {
    const res = await request(app)
      .put('/api/households/restore')
      .set('Authorization', `Bearer ${token}`)
      .send({ ids: [testHouseholdId] });

    expect(res.status).toBe(200);

    const getRes = await request(app)
      .get(`/api/households/${testHouseholdId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(getRes.status).toBe(200);
  });

  it('8. Xóa vĩnh viễn (Hard Delete)', async () => {
    // Phải soft delete lại trước để vào thùng rác
    await request(app)
      .delete(`/api/households/${testHouseholdId}`)
      .set('Authorization', `Bearer ${token}`);

    const res = await request(app)
      .delete('/api/households/hard-delete')
      .set('Authorization', `Bearer ${token}`)
      .send({ ids: [testHouseholdId] });

    expect(res.status).toBe(200);

    const check = await prisma.households.findUnique({ where: { id: testHouseholdId } });
    expect(check).toBeNull();
  });
});
