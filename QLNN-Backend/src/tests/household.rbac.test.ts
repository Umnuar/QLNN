import request from 'supertest';
import app from '../index';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

describe('Household RBAC & Multi-tenant Scoping (TASK-P3-03)', () => {
  let userTokenThon1 = '';
  let adminToken = '';
  let village1Id = '';
  let village2Id = '';
  let householdThon2Id = '';

  beforeAll(async () => {
    // 1. Tạo 2 thôn: Thôn 1 và Thôn 2
    const v1 = await prisma.villages.create({
      data: { name: 'Thôn 1 - Test RBAC Scope' },
    });
    village1Id = v1.id;

    const v2 = await prisma.villages.create({
      data: { name: 'Thôn 2 - Test RBAC Scope' },
    });
    village2Id = v2.id;

    // 2. Tạo User Thôn 1 và User Admin
    const passwordHash = await bcrypt.hash('password123', 10);

    await prisma.users.create({
      data: {
        username: 'user_rbac_thon1',
        password: passwordHash,
        role: 'user',
        village_id: village1Id,
      },
    });

    await prisma.users.create({
      data: {
        username: 'admin_rbac_test',
        password: passwordHash,
        role: 'admin',
      },
    });

    // 3. Đăng nhập lấy token cho cả 2 tài khoản
    const loginUserRes = await request(app)
      .post('/api/auth/login')
      .send({ username: 'user_rbac_thon1', password: 'password123' });
    userTokenThon1 = loginUserRes.body.accessToken;

    const loginAdminRes = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin_rbac_test', password: 'password123' });
    adminToken = loginAdminRes.body.accessToken;

    // 4. Tạo 1 hộ dân thuộc Thôn 2
    const hh2 = await prisma.households.create({
      data: {
        village_id: village2Id,
        stt: 1,
        full_name: 'Hộ Dân Thôn 2 Mẫu',
        name_unaccented: 'Ho Dan Thon 2 Mau',
        phone: '0987654321',
        address: 'Khu dân cư Thôn 2',
        crop_items: {
          create: [
            { crop_type: 'Cà phê', area: 1.5, ownership_type: 'household' },
          ],
        },
        livestock_items: {
          create: [{ animal_type: 'Bò', quantity: 5 }],
        },
      },
    });
    householdThon2Id = hh2.id;
  });

  afterAll(async () => {
    // Dọn dẹp dữ liệu kiểm thử
    await prisma.crop_items.deleteMany({
      where: { household: { village_id: { in: [village1Id, village2Id] } } },
    });
    await prisma.livestock_items.deleteMany({
      where: { household: { village_id: { in: [village1Id, village2Id] } } },
    });
    await prisma.aquaculture_items.deleteMany({
      where: { household: { village_id: { in: [village1Id, village2Id] } } },
    });
    await prisma.audit_logs.deleteMany({
      where: { village_id: { in: [village1Id, village2Id] } },
    });
    await prisma.households.deleteMany({
      where: { village_id: { in: [village1Id, village2Id] } },
    });
    await prisma.users.deleteMany({
      where: { username: { in: ['user_rbac_thon1', 'admin_rbac_test'] } },
    });
    await prisma.villages.deleteMany({
      where: { id: { in: [village1Id, village2Id] } },
    });
    await prisma.$disconnect();
  });

  it('1. GET /api/households/:id của Thôn 2 bằng token user Thôn 1 -> 403 Forbidden', async () => {
    const res = await request(app)
      .get(`/api/households/${householdThon2Id}`)
      .set('Authorization', `Bearer ${userTokenThon1}`);

    expect(res.status).toBe(403);
    expect(res.body.error).toContain('Không có quyền xem dữ liệu thôn khác');
  });

  it('2. PUT /api/households/:id của Thôn 2 bằng token user Thôn 1 -> 403 Forbidden', async () => {
    const res = await request(app)
      .put(`/api/households/${householdThon2Id}`)
      .set('Authorization', `Bearer ${userTokenThon1}`)
      .send({
        full_name: 'Cố tình sửa tên Thôn 2',
        cow: 10,
      });

    expect(res.status).toBe(403);
    expect(res.body.error).toContain('Không có quyền sửa dữ liệu thôn khác');
  });

  it('3. DELETE /api/households/:id của Thôn 2 bằng token user Thôn 1 -> 403 Forbidden', async () => {
    const res = await request(app)
      .delete(`/api/households/${householdThon2Id}`)
      .set('Authorization', `Bearer ${userTokenThon1}`);

    expect(res.status).toBe(403);
    expect(res.body.error).toContain('Không có quyền xóa dữ liệu thôn khác');
  });

  it('4. POST /api/households/bulk-delete chứa ID của Thôn 2 bằng token user Thôn 1 -> 403 Forbidden', async () => {
    const res = await request(app)
      .post('/api/households/bulk-delete')
      .set('Authorization', `Bearer ${userTokenThon1}`)
      .send({ ids: [householdThon2Id] });

    expect(res.status).toBe(403);
    expect(res.body.error).toContain('Không có quyền xóa hộ dân thuộc thôn khác');
  });

  it('5. DELETE /api/households/:id/permanent bằng token user -> 403 Forbidden (Chỉ Admin mới có quyền)', async () => {
    const res = await request(app)
      .delete(`/api/households/${householdThon2Id}/permanent`)
      .set('Authorization', `Bearer ${userTokenThon1}`);

    expect(res.status).toBe(403);
    expect(res.body.error).toContain('Chỉ Admin mới có quyền xóa vĩnh viễn');
  });

  it('6. Đăng nhập tài khoản admin và thao tác các endpoint trên -> Thành công (không bị 403)', async () => {
    // 6.1. Admin GET hộ Thôn 2 -> 200
    const getRes = await request(app)
      .get(`/api/households/${householdThon2Id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(getRes.status).toBe(200);
    expect(getRes.body.data.id).toBe(householdThon2Id);

    // 6.2. Admin PUT sửa hộ Thôn 2 -> 200
    const putRes = await request(app)
      .put(`/api/households/${householdThon2Id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        full_name: 'Hộ Dân Thôn 2 - Đã Được Admin Cập Nhật',
        cow: 12,
      });

    expect(putRes.status).toBe(200);
    expect(putRes.body.data.full_name).toBe('Hộ Dân Thôn 2 - Đã Được Admin Cập Nhật');
    expect(putRes.body.data.cow).toBe(12);

    // Tạo thêm 1 hộ trong Thôn 2 để Admin test bulk-delete và permanent delete
    const extraHh = await prisma.households.create({
      data: {
        village_id: village2Id,
        full_name: 'Hộ Thôn 2 Phục Vụ Xóa Admin',
        name_unaccented: 'Ho Thon 2 Phuc Vu Xoa Admin',
      },
    });

    // 6.3. Admin POST bulk-delete chứa ID Thôn 2 -> 200
    const bulkRes = await request(app)
      .post('/api/households/bulk-delete')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ ids: [extraHh.id] });

    expect(bulkRes.status).toBe(200);
    expect(bulkRes.body.count).toBe(1);

    // 6.4. Admin DELETE permanent -> 200
    const permRes = await request(app)
      .delete(`/api/households/${extraHh.id}/permanent`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(permRes.status).toBe(200);
    expect(permRes.body.status).toBe('ok');

    // Xác nhận hộ đã bị xóa khỏi CSDL
    const checkDb = await prisma.households.findUnique({
      where: { id: extraHh.id },
    });
    expect(checkDb).toBeNull();
  });
});
