import { Response } from 'express';
import { prisma } from '../config/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

/**
 * Helper tính toán tổng hợp cho 1 danh sách hộ
 */
async function computeAnalyticsForScope(targetVillageId: string | null) {
  const whereHousehold: any = { is_deleted: false };
  if (targetVillageId) {
    whereHousehold.village_id = targetVillageId;
  }

  // 1. Tổng số hộ
  const householdCount = await prisma.households.count({
    where: whereHousehold,
  });

  // 2. Tổng hợp Cây trồng
  const cropsRaw = await prisma.crop_items.findMany({
    where: {
      household: whereHousehold,
    },
    select: {
      crop_type: true,
      crop_subtype: true,
      ownership_type: true,
      area: true,
    },
  });

  let cafe_household = 0;
  let cafe_contracted = 0;
  let rubber_household = 0;
  let rubber_contracted = 0;
  let fruit_tree = 0;
  let macadamia = 0;
  let herb_dinh_lang = 0;
  let herb_gung = 0;
  let herb_nghe = 0;
  let herb_sa = 0;
  let wet_rice = 0;
  let other_annual_crops = 0;

  for (const c of cropsRaw) {
    const area = Number(c.area) || 0;
    if (c.crop_type === 'Cà phê') {
      if (c.ownership_type === 'household') cafe_household += area;
      else if (c.ownership_type === 'contracted') cafe_contracted += area;
    } else if (c.crop_type === 'Cao su') {
      if (c.ownership_type === 'household') rubber_household += area;
      else if (c.ownership_type === 'contracted') rubber_contracted += area;
    } else if (c.crop_type === 'Cây ăn quả') {
      fruit_tree += area;
    } else if (c.crop_type === 'Cây Mắc Ca') {
      macadamia += area;
    } else if (c.crop_type === 'Cây dược liệu') {
      if (c.crop_subtype === 'Đinh lăng') herb_dinh_lang += area;
      else if (c.crop_subtype === 'Gừng') herb_gung += area;
      else if (c.crop_subtype === 'Nghệ') herb_nghe += area;
      else if (c.crop_subtype === 'Sả') herb_sa += area;
    } else if (c.crop_type === 'Lúa nước') {
      wet_rice += area;
    } else if (c.crop_type === 'Cây hàng năm khác') {
      other_annual_crops += area;
    }
  }

  // Làm tròn 3 chữ số thập phân cho diện tích (ha)
  const round3 = (n: number) => Math.round(n * 1000) / 1000;

  const total_herb_area = round3(herb_dinh_lang + herb_gung + herb_nghe + herb_sa);
  const total_crops_area = round3(
    cafe_household +
    cafe_contracted +
    rubber_household +
    rubber_contracted +
    fruit_tree +
    macadamia +
    total_herb_area +
    wet_rice +
    other_annual_crops
  );

  // 3. Tổng hợp Vật nuôi
  const livestockRaw = await prisma.livestock_items.findMany({
    where: {
      household: whereHousehold,
    },
    select: {
      animal_type: true,
      quantity: true,
    },
  });

  let buffalo = 0;
  let cow = 0;
  let pig = 0;
  let poultry = 0;

  for (const l of livestockRaw) {
    const qty = l.quantity || 0;
    if (l.animal_type === 'Trâu') buffalo += qty;
    else if (l.animal_type === 'Bò') cow += qty;
    else if (l.animal_type === 'Heo') pig += qty;
    else if (l.animal_type === 'Gia cầm') poultry += qty;
  }

  // 4. Tổng hợp Thủy sản
  const aquaRaw = await prisma.aquaculture_items.findMany({
    where: {
      household: whereHousehold,
    },
    select: {
      aquaculture_type: true,
      value: true,
      unit: true,
    },
  });

  let fish_pond = 0; // ha
  let fish_cage = 0; // lồng

  for (const a of aquaRaw) {
    const val = Number(a.value) || 0;
    if (a.aquaculture_type === 'Nuôi cá ao') fish_pond += val;
    else if (a.aquaculture_type === 'Nuôi cá lồng bè') fish_cage += val;
  }

  return {
    household_count: householdCount,
    crops: {
      cafe_household: round3(cafe_household),
      cafe_contracted: round3(cafe_contracted),
      total_cafe: round3(cafe_household + cafe_contracted),
      rubber_household: round3(rubber_household),
      rubber_contracted: round3(rubber_contracted),
      total_rubber: round3(rubber_household + rubber_contracted),
      fruit_tree: round3(fruit_tree),
      macadamia: round3(macadamia),
      herb_dinh_lang: round3(herb_dinh_lang),
      herb_gung: round3(herb_gung),
      herb_nghe: round3(herb_nghe),
      herb_sa: round3(herb_sa),
      total_herb_area,
      wet_rice: round3(wet_rice),
      other_annual_crops: round3(other_annual_crops),
      total_crops_area,
    },
    livestock: {
      buffalo,
      cow,
      total_cattle: buffalo + cow, // Tổng đàn gia súc lớn
      pig,
      poultry,
      total_animals: buffalo + cow + pig + poultry,
    },
    aquaculture: {
      fish_pond: round3(fish_pond),
      fish_cage: Math.round(fish_cage),
    },
  };
}

/**
 * GET /api/analytics/overview
 * Tổng hợp tổng thể nông nghiệp theo Thôn hoặc Toàn xã
 */
export const getOverviewAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const targetVillageId = req.user?.role === 'user' ? req.user.village_id : (req.query.villageId ? String(req.query.villageId) : null);

    let villageName = 'Toàn xã Đăk Hà';
    if (targetVillageId) {
      const village = await prisma.villages.findUnique({ where: { id: targetVillageId } });
      if (village) villageName = village.name;
    }

    const data = await computeAnalyticsForScope(targetVillageId);

    res.json({
      status: 'ok',
      scope: {
        village_id: targetVillageId,
        village_name: villageName,
      },
      data,
    });
  } catch (error: any) {
    console.error('getOverviewAnalytics error:', error);
    res.status(500).json({ error: error.message || 'Lỗi thống kê nông nghiệp' });
  }
};

/**
 * GET /api/analytics/by-village
 * So sánh tổng hợp giữa tất cả các thôn trong xã (Dành cho Cán bộ xã / Admin)
 */
export const getAnalyticsByVillage = async (req: AuthRequest, res: Response) => {
  try {
    // Nếu là Trưởng thôn -> Chỉ trả về thôn của mình
    const villages = await prisma.villages.findMany({
      where: req.user?.role === 'user' && req.user.village_id ? { id: req.user.village_id } : undefined,
      orderBy: { name: 'asc' },
    });

    const result = await Promise.all(
      villages.map(async (v) => {
        const stats = await computeAnalyticsForScope(v.id);
        return {
          village_id: v.id,
          village_name: v.name,
          ...stats,
        };
      })
    );

    res.json({
      status: 'ok',
      data: result,
    });
  } catch (error: any) {
    console.error('getAnalyticsByVillage error:', error);
    res.status(500).json({ error: error.message || 'Lỗi thống kê theo thôn' });
  }
};
