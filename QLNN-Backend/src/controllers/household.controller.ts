import { Response } from 'express';
import { prisma } from '../config/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';
import { removeAccents } from '../utils/textUtils';

// Helper serialize household into 18 metrics for frontend
export function serializeHousehold(hh: any) {
  const getCropArea = (type: string, subtype: string | null = null, own: string | null = null): number => {
    if (!hh.crop_items) return 0;
    const item = hh.crop_items.find(
      (c: any) =>
        c.crop_type === type &&
        (subtype === null || c.crop_subtype === subtype) &&
        (own === null || c.ownership_type === own)
    );
    return item ? Number(item.area) : 0;
  };

  const getLivestock = (type: string): number => {
    if (!hh.livestock_items) return 0;
    const item = hh.livestock_items.find((l: any) => l.animal_type === type);
    return item ? item.quantity : 0;
  };

  const getAqua = (type: string): number => {
    if (!hh.aquaculture_items) return 0;
    const item = hh.aquaculture_items.find((a: any) => a.aquaculture_type === type);
    return item ? Number(item.value) : 0;
  };

  return {
    id: hh.id,
    village_id: hh.village_id,
    village_name: hh.village ? hh.village.name : null,
    stt: hh.stt,
    full_name: hh.full_name,
    name_unaccented: hh.name_unaccented,
    phone: hh.phone,
    address: hh.address,
    notes: hh.notes,
    version: hh.version,
    created_at: hh.created_at,
    updated_at: hh.updated_at,

    // 18 chỉ số nông nghiệp
    cafe_household: getCropArea('Cà phê', null, 'household'),
    cafe_contracted: getCropArea('Cà phê', null, 'contracted'),
    rubber_household: getCropArea('Cao su', null, 'household'),
    rubber_contracted: getCropArea('Cao su', null, 'contracted'),
    fruit_tree: getCropArea('Cây ăn quả', null, null),
    macadamia: getCropArea('Cây Mắc Ca', null, null),
    herb_dinh_lang: getCropArea('Cây dược liệu', 'Đinh lăng', null),
    herb_gung: getCropArea('Cây dược liệu', 'Gừng', null),
    herb_nghe: getCropArea('Cây dược liệu', 'Nghệ', null),
    herb_sa: getCropArea('Cây dược liệu', 'Sả', null),
    wet_rice: getCropArea('Lúa nước', null, null),
    other_annual_crops: getCropArea('Cây hàng năm khác', null, null),

    buffalo: getLivestock('Trâu'),
    cow: getLivestock('Bò'),
    pig: getLivestock('Heo'),
    poultry: getLivestock('Gia cầm'),

    fish_pond: getAqua('Nuôi cá ao'),
    fish_cage: getAqua('Nuôi cá lồng bè'),

    // Relations gốc (khi cần chi tiết)
    raw_crop_items: hh.crop_items || [],
    raw_livestock_items: hh.livestock_items || [],
    raw_aquaculture_items: hh.aquaculture_items || [],
  };
}

/**
 * GET /api/households
 * Lấy danh sách hộ theo Thôn (Trưởng thôn tự động bị scoped, Admin xem được tất cả)
 */
export const getHouseholds = async (req: AuthRequest, res: Response) => {
  try {
    const { villageId, search, page = '1', limit = '50' } = req.query;

    const where: any = {
      is_deleted: false,
    };

    if (villageId) {
      where.village_id = String(villageId);
    }

    if (search) {
      const searchNormalized = removeAccents(String(search));
      where.name_unaccented = { contains: searchNormalized };
    }

    const pageNum = parseInt(String(page), 10) || 1;
    const limitNum = parseInt(String(limit), 10) || 50;
    const skip = (pageNum - 1) * limitNum;

    const [total, households] = await Promise.all([
      prisma.households.count({ where }),
      prisma.households.findMany({
        where,
        include: {
          village: true,
          crop_items: true,
          livestock_items: true,
          aquaculture_items: true,
        },
        orderBy: [{ village_id: 'asc' }, { stt: 'asc' }, { created_at: 'asc' }],
        skip,
        take: limitNum,
      }),
    ]);

    const data = households.map(serializeHousehold);

    res.json({
      data,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    console.error('getHouseholds error:', error);
    res.status(500).json({ error: error.message || 'Lỗi lấy danh sách hộ' });
  }
};

/**
 * GET /api/households/:id
 */
export const getHouseholdById = async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const hh = await prisma.households.findFirst({
      where: { id, is_deleted: false },
      include: {
        village: true,
        crop_items: true,
        livestock_items: true,
        aquaculture_items: true,
      },
    });

    if (!hh) {
      res.status(404).json({ error: 'Không tìm thấy hộ nông nghiệp' });
      return;
    }

    // RBAC Check
    if (req.user?.role === 'user' && req.user.village_id && hh.village_id !== req.user.village_id) {
      res.status(403).json({ error: 'Không có quyền truy cập dữ liệu thôn khác' });
      return;
    }

    res.json({ data: serializeHousehold(hh) });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Lỗi lấy thông tin hộ' });
  }
};

/**
 * Helper build items array from flat 18 metrics
 */
function buildItemsFromPayload(body: any) {
  const getVal = (key: string, group?: string) => (group && body[group] ? body[group][key] : undefined) ?? body[key];

  const crop_items: Array<{
    crop_type: string;
    crop_subtype: string | null;
    ownership_type: string | null;
    area: number;
  }> = [];

  const addCrop = (type: string, subtype: string | null, own: string | null, val: any) => {
    const num = parseFloat(val) || 0;
    if (num > 0) crop_items.push({ crop_type: type, crop_subtype: subtype, ownership_type: own, area: num });
  };

  addCrop('Cà phê', null, 'household', getVal('cafe_household', 'crops'));
  addCrop('Cà phê', null, 'contracted', getVal('cafe_contracted', 'crops'));
  addCrop('Cao su', null, 'household', getVal('rubber_household', 'crops'));
  addCrop('Cao su', null, 'contracted', getVal('rubber_contracted', 'crops'));
  addCrop('Cây ăn quả', null, null, getVal('fruit_tree', 'crops'));
  addCrop('Cây Mắc Ca', null, null, getVal('macadamia', 'crops'));
  addCrop('Cây dược liệu', 'Đinh lăng', null, getVal('herb_dinh_lang', 'crops'));
  addCrop('Cây dược liệu', 'Gừng', null, getVal('herb_gung', 'crops'));
  addCrop('Cây dược liệu', 'Nghệ', null, getVal('herb_nghe', 'crops'));
  addCrop('Cây dược liệu', 'Sả', null, getVal('herb_sa', 'crops'));
  addCrop('Lúa nước', null, null, getVal('wet_rice', 'crops'));
  addCrop('Cây hàng năm khác', null, null, getVal('other_annual_crops', 'crops'));

  const livestock_items: Array<{ animal_type: string; quantity: number }> = [];
  const addLivestock = (type: string, val: any) => {
    const num = parseInt(val, 10) || 0;
    if (num > 0) livestock_items.push({ animal_type: type, quantity: num });
  };
  addLivestock('Trâu', getVal('buffalo', 'livestock'));
  addLivestock('Bò', getVal('cow', 'livestock'));
  addLivestock('Heo', getVal('pig', 'livestock'));
  addLivestock('Gia cầm', getVal('poultry', 'livestock'));

  const aquaculture_items: Array<{ aquaculture_type: string; value: number; unit: string }> = [];
  const addAqua = (type: string, unit: string, val: any) => {
    const num = parseFloat(val) || 0;
    if (num > 0) aquaculture_items.push({ aquaculture_type: type, value: num, unit });
  };
  addAqua('Nuôi cá ao', 'ha', getVal('fish_pond', 'aquaculture'));
  addAqua('Nuôi cá lồng bè', 'lồng', getVal('fish_cage', 'aquaculture'));

  return { crop_items, livestock_items, aquaculture_items };
}

/**
 * POST /api/households
 * Tạo mới hộ nông nghiệp
 */
export const createHousehold = async (req: AuthRequest, res: Response) => {
  try {
    const { full_name, stt, phone, address, notes } = req.body;
    const village_id = req.user?.role === 'user' ? req.user.village_id! : req.body.village_id;

    if (!full_name || !full_name.trim()) {
      res.status(400).json({ error: 'Họ và tên chủ hộ là bắt buộc' });
      return;
    }

    if (!village_id) {
      res.status(400).json({ error: 'Vui lòng chọn Thôn' });
      return;
    }

    // Kiểm tra trùng tên trong cùng thôn
    const trimmedName = full_name.trim();
    const existing = await prisma.households.findFirst({
      where: {
        village_id,
        full_name: trimmedName,
        is_deleted: false,
      },
    });

    if (existing) {
      res.status(409).json({
        error: `Hộ "${trimmedName}" đã tồn tại trong thôn này.`,
        duplicate: true,
        existing_household_id: existing.id,
      });
      return;
    }

    const { crop_items, livestock_items, aquaculture_items } = buildItemsFromPayload(req.body);

    const newHh = await prisma.$transaction(async (tx) => {
      const hh = await tx.households.create({
        data: {
          village_id,
          stt: stt ? parseInt(stt, 10) : null,
          full_name: trimmedName,
          name_unaccented: removeAccents(trimmedName),
          phone: phone ? String(phone).trim() : null,
          address: address ? String(address).trim() : null,
          notes: notes ? String(notes).trim() : '',
          crop_items: { create: crop_items },
          livestock_items: { create: livestock_items },
          aquaculture_items: { create: aquaculture_items },
        },
        include: {
          village: true,
          crop_items: true,
          livestock_items: true,
          aquaculture_items: true,
        },
      });

      // Ghi audit log
      await tx.audit_logs.create({
        data: {
          user_id: req.user?.id || null,
          username: req.user?.username || 'System',
          village_id,
          action: 'CREATE',
          entity_type: 'households',
          entity_id: hh.id,
          details: JSON.stringify({ name: hh.full_name }),
        },
      });

      return hh;
    });

    res.status(201).json({ data: serializeHousehold(newHh) });
  } catch (error: any) {
    console.error('createHousehold error:', error);
    res.status(500).json({ error: error.message || 'Lỗi tạo hộ nông nghiệp' });
  }
};

/**
 * PUT /api/households/:id
 * Cập nhật hộ nông nghiệp
 */
export const updateHousehold = async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const { full_name, stt, phone, address, notes, version } = req.body;

    const existing = await prisma.households.findFirst({
      where: { id, is_deleted: false },
      include: {
        crop_items: true,
        livestock_items: true,
        aquaculture_items: true,
      }
    });

    if (!existing) {
      res.status(404).json({ error: 'Không tìm thấy hộ nông nghiệp' });
      return;
    }

    // RBAC Check
    if (req.user?.role === 'user' && req.user.village_id && existing.village_id !== req.user.village_id) {
      res.status(403).json({ error: 'Không có quyền sửa dữ liệu thôn khác' });
      return;
    }

    // Optimistic locking check
    if (version !== undefined && existing.version !== version) {
      res.status(409).json({ error: 'Dữ liệu đã bị thay đổi bởi người khác. Vui lòng tải lại.' });
      return;
    }

    const { crop_items, livestock_items, aquaculture_items } = buildItemsFromPayload(req.body);

    const updatedHh = await prisma.$transaction(async (tx) => {
      // Xóa các items cũ
      await tx.crop_items.deleteMany({ where: { household_id: id } });
      await tx.livestock_items.deleteMany({ where: { household_id: id } });
      await tx.aquaculture_items.deleteMany({ where: { household_id: id } });

      // Cập nhật thông tin hộ + tạo mới items
      const hh = await tx.households.update({
        where: { id },
        data: {
          stt: stt !== undefined ? (stt ? parseInt(stt, 10) : null) : existing.stt,
          full_name: full_name ? full_name.trim() : existing.full_name,
          name_unaccented: full_name ? removeAccents(full_name) : existing.name_unaccented,
          phone: phone !== undefined ? (phone ? String(phone).trim() : null) : existing.phone,
          address: address !== undefined ? (address ? String(address).trim() : null) : existing.address,
          notes: notes !== undefined ? String(notes).trim() : existing.notes,
          version: { increment: 1 },
          crop_items: { create: crop_items },
          livestock_items: { create: livestock_items },
          aquaculture_items: { create: aquaculture_items },
        },
        include: {
          village: true,
          crop_items: true,
          livestock_items: true,
          aquaculture_items: true,
        },
      });

      // So sánh tạo diff chi tiết từng field
      const diff: any = {};
      
      const oldData = serializeHousehold(existing);
      const newData = serializeHousehold(hh);

      const fieldLabels: Record<string, string> = {
        full_name: 'Họ và tên',
        phone: 'Số điện thoại',
        address: 'Địa chỉ',
        notes: 'Ghi chú',
        stt: 'Số thứ tự',
        cafe_household: 'Cà phê (Hộ gia đình) (ha)',
        cafe_contracted: 'Cà phê (Nhận khoán) (ha)',
        rubber_household: 'Cao su (Hộ gia đình) (ha)',
        rubber_contracted: 'Cao su (Nhận khoán) (ha)',
        fruit_tree: 'Cây ăn quả (ha)',
        macadamia: 'Cây Mắc Ca (ha)',
        herb_dinh_lang: 'Đinh lăng (ha)',
        herb_gung: 'Gừng (ha)',
        herb_nghe: 'Nghệ (ha)',
        herb_sa: 'Sả (ha)',
        wet_rice: 'Lúa nước (ha)',
        other_annual_crops: 'Cây hàng năm khác (ha)',
        buffalo: 'Trâu (con)',
        cow: 'Bò (con)',
        pig: 'Heo (con)',
        poultry: 'Gia cầm (con)',
        fish_pond: 'Nuôi cá ao (ha)',
        fish_cage: 'Nuôi cá lồng bè (lồng)'
      };

      for (const [key, label] of Object.entries(fieldLabels)) {
        const oldVal = (oldData as any)[key];
        const newVal = (newData as any)[key];
        
        if (oldVal !== newVal) {
          // Bỏ qua nếu cả 2 đều không có ý nghĩa thay đổi (null -> '', 0 -> null, v.v)
          if ((!oldVal && !newVal) || (oldVal === 0 && !newVal) || (!oldVal && newVal === 0)) {
            continue;
          }
          diff[label] = { old: oldVal ?? 'Trống', new: newVal ?? 'Trống' };
        }
      }

      // Ghi audit log
      await tx.audit_logs.create({
        data: {
          user_id: req.user?.id || null,
          username: req.user?.username || 'System',
          village_id: existing.village_id,
          action: 'UPDATE',
          entity_type: 'households',
          entity_id: hh.id,
          details: JSON.stringify(diff),
        },
      });

      return hh;
    });

    res.json({ data: serializeHousehold(updatedHh) });
  } catch (error: any) {
    console.error('updateHousehold error:', error);
    res.status(500).json({ error: error.message || 'Lỗi cập nhật hộ' });
  }
};

/**
 * DELETE /api/households/:id (Soft delete)
 */
export const deleteHousehold = async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);

    const existing = await prisma.households.findFirst({
      where: { id, is_deleted: false },
    });

    if (!existing) {
      res.status(404).json({ error: 'Không tìm thấy hộ' });
      return;
    }

    if (req.user?.role === 'user' && req.user.village_id && existing.village_id !== req.user.village_id) {
      res.status(403).json({ error: 'Không có quyền xóa dữ liệu thôn khác' });
      return;
    }

    await prisma.$transaction(async (tx) => {
      await tx.households.update({
        where: { id },
        data: {
          is_deleted: true,
          deleted_at: new Date(),
        },
      });
      await tx.audit_logs.create({
        data: {
          user_id: req.user?.id || null,
          username: req.user?.username || 'System',
          village_id: existing.village_id,
          action: 'DELETE',
          entity_type: 'households',
          entity_id: id,
          details: JSON.stringify({ name: existing.full_name }),
        },
      });
    });

    res.json({ status: 'ok', message: 'Đã xóa hộ thành công' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Lỗi xóa hộ' });
  }
};


export const bulkDeleteHouseholds = async (req: AuthRequest, res: Response) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      res.status(400).json({ error: 'Danh sách ID không hợp lệ' });
      return;
    }

    const households = await prisma.households.findMany({
      where: { id: { in: ids }, is_deleted: false },
    });

    if (households.length === 0) {
      res.status(404).json({ error: 'Không tìm thấy hộ nông nghiệp nào để xóa' });
      return;
    }

    // RBAC Check
    if (req.user?.role === 'user' && req.user.village_id) {
      const invalid = households.some(hh => hh.village_id !== req.user!.village_id);
      if (invalid) {
        res.status(403).json({ error: 'Không có quyền xóa dữ liệu thôn khác' });
        return;
      }
    }

    await prisma.$transaction(async (tx) => {
      await tx.households.updateMany({
        where: { id: { in: ids } },
        data: { is_deleted: true, deleted_at: new Date() },
      });

      // Group by village to record audit logs appropriately
      const byVillage: Record<string, string[]> = {};
      households.forEach(hh => {
        if (!byVillage[hh.village_id]) byVillage[hh.village_id] = [];
        byVillage[hh.village_id].push(hh.full_name);
      });

      for (const [village_id, names] of Object.entries(byVillage)) {
        await tx.audit_logs.create({
          data: {
            user_id: req.user?.id || null,
            username: req.user?.username || 'System',
            village_id,
            action: 'DELETE',
            entity_type: 'households',
            entity_id: null,
            details: JSON.stringify({ message: `Xóa hàng loạt ${names.length} hộ dân`, names }),
          },
        });
      }
    });

    res.json({ count: households.length });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Lỗi xóa hàng loạt' });
  }
};


export const getDeletedHouseholds = async (req: AuthRequest, res: Response) => {
  try {
    const { villageId, search, page = '1', limit = '50' } = req.query;

    const where: any = {
      is_deleted: true,
    };

    if (villageId) {
      where.village_id = String(villageId);
    }

    if (search) {
      const searchNormalized = removeAccents(String(search));
      where.name_unaccented = { contains: searchNormalized };
    }

    const pageNum = parseInt(String(page), 10) || 1;
    const limitNum = parseInt(String(limit), 10) || 50;
    const skip = (pageNum - 1) * limitNum;

    const [total, households] = await Promise.all([
      prisma.households.count({ where }),
      prisma.households.findMany({
        where,
        include: {
          village: true,
          crop_items: true,
          livestock_items: true,
          aquaculture_items: true,
        },
        orderBy: [{ deleted_at: 'desc' }, { village_id: 'asc' }],
        skip,
        take: limitNum,
      }),
    ]);

    const data = households.map(serializeHousehold);

    res.json({
      data,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    console.error('getDeletedHouseholds error:', error);
    res.status(500).json({ error: error.message || 'Lỗi lấy danh sách hộ đã xóa' });
  }
};

export const restoreHouseholds = async (req: AuthRequest, res: Response) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      res.status(400).json({ error: 'Danh sách ID không hợp lệ' });
      return;
    }

    const households = await prisma.households.findMany({
      where: { id: { in: ids }, is_deleted: true },
    });

    if (households.length === 0) {
      res.status(404).json({ error: 'Không tìm thấy hộ nông nghiệp nào để khôi phục' });
      return;
    }

    if (req.user?.role === 'user' && req.user.village_id) {
      const invalid = households.some(hh => hh.village_id !== req.user!.village_id);
      if (invalid) {
        res.status(403).json({ error: 'Không có quyền khôi phục dữ liệu thôn khác' });
        return;
      }
    }

    await prisma.$transaction(async (tx) => {
      await tx.households.updateMany({
        where: { id: { in: ids } },
        data: { is_deleted: false, deleted_at: null },
      });

      const byVillage: Record<string, string[]> = {};
      households.forEach(hh => {
        if (!byVillage[hh.village_id]) byVillage[hh.village_id] = [];
        byVillage[hh.village_id].push(hh.full_name);
      });

      for (const [village_id, names] of Object.entries(byVillage)) {
        await tx.audit_logs.create({
          data: {
            user_id: req.user?.id || null,
            username: req.user?.username || 'System',
            village_id,
            action: 'RESTORE',
            entity_type: 'households',
            entity_id: null,
            details: JSON.stringify({ message: `Khôi phục ${names.length} hộ dân`, names }),
          },
        });
      }
    });

    res.json({ status: 'ok', message: 'Đã khôi phục hộ thành công' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Lỗi khôi phục hộ' });
  }
};

export const hardDeleteHouseholds = async (req: AuthRequest, res: Response) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      res.status(400).json({ error: 'Danh sách ID không hợp lệ' });
      return;
    }

    if (req.user?.role !== 'admin') {
      res.status(403).json({ error: 'Chá»‰ Admin má»›i cÃ³ quyá»n xÃ³a vÄ©nh viá»…n' });
      return;
    }

    const households = await prisma.households.findMany({
      where: { id: { in: ids }, is_deleted: true },
    });

    if (households.length === 0) {
      res.status(404).json({ error: 'Không tìm thấy hộ nông nghiệp nào trong thùng rác để xóa vĩnh viễn' });
      return;
    }

    await prisma.$transaction(async (tx) => {
      await tx.crop_items.deleteMany({ where: { household_id: { in: ids } } });
      await tx.livestock_items.deleteMany({ where: { household_id: { in: ids } } });
      await tx.aquaculture_items.deleteMany({ where: { household_id: { in: ids } } });
      await tx.households.deleteMany({
        where: { id: { in: ids } },
      });

      const byVillage: Record<string, string[]> = {};
      households.forEach(hh => {
        if (!byVillage[hh.village_id]) byVillage[hh.village_id] = [];
        byVillage[hh.village_id].push(hh.full_name);
      });

      for (const [village_id, names] of Object.entries(byVillage)) {
        await tx.audit_logs.create({
          data: {
            user_id: req.user?.id || null,
            username: req.user?.username || 'System',
            village_id,
            action: 'HARD_DELETE',
            entity_type: 'households',
            entity_id: null,
            details: JSON.stringify({ message: `Xóa vĩnh viễn ${names.length} hộ dân`, names }),
          },
        });
      }
    });

    res.json({ status: 'ok', message: 'ÄÃ£ xÃ³a vÄ©nh viá»…n há»™ thÃ nh cÃ´ng' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Lỗi xóa vĩnh viễn hộ' });
  }
};

