import 'dotenv/config';
import jwt from 'jsonwebtoken';
import { prisma } from '../src/config/prisma';

const sharedJwtSecret = 'qlcs_jwt_secret_2025_a8f3b7c9d4e1f2g6h5';
const village1Id = '0ad6217e-0999-47a0-acc2-e9378372b4b8';

// Tạo token chuẩn SSO
const adminToken = jwt.sign(
  { id: 'admin-uuid', username: 'admin', role: 'admin', village_id: null },
  sharedJwtSecret,
  { expiresIn: '1h' }
);

const thon1Token = jwt.sign(
  { id: 'thon1-uuid', username: 'thon1', role: 'user', village_id: village1Id },
  sharedJwtSecret,
  { expiresIn: '1h' }
);

// Bảng số liệu tính tay dự kiến đối chiếu (8 hộ thật tại Thôn 1)
const expected = {
  household_count: 8,
  crops: {
    cafe_household: 4.5,
    cafe_contracted: 1.2,
    total_cafe: 5.7,
    rubber_household: 2.0,
    rubber_contracted: 3.5,
    total_rubber: 5.5,
    fruit_tree: 2.3,
    macadamia: 1.0,
    herb_dinh_lang: 0.1,
    herb_gung: 0.3,
    herb_nghe: 0.2,
    herb_sa: 0.2,
    total_herb_area: 0.8,
    wet_rice: 2.3,
    other_annual_crops: 0.4,
    total_crops_area: 18.0,
  },
  livestock: {
    buffalo: 5,
    cow: 12,
    total_cattle: 17,
    pig: 35,
    poultry: 250,
    total_animals: 302,
  },
  aquaculture: {
    fish_pond: 0.7,
    fish_cage: 4,
  },
};

async function main() {
  console.log('🚀 BẮT ĐẦU KIỂM THỬ API HTTP ANALYTICS (GỌI THỰC TẾ ĐẾN CỔNG 5001)...');

  const baseUrl = 'http://localhost:5001';

  try {
    // 1. Kiểm tra health check server cổng 5001
    const healthRes = await fetch(`${baseUrl}/api/health`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!healthRes.ok) {
      throw new Error(`Server QLNN-Backend chưa phản hồi tại ${baseUrl}/api/health`);
    }
    console.log('✅ Server QLNN-Backend (Port 5001) đang hoạt động bình thường.');

    // 2. Test Overview API với Token Thôn 1 (Trưởng thôn tự động bị filter)
    console.log('\n=== TEST 1: GỌI GET /api/analytics/overview (HTTP FETCH VỚI TOKEN TRƯỞNG THÔN 1) ===');
    const resThon1 = await fetch(`${baseUrl}/api/analytics/overview`, {
      headers: { Authorization: `Bearer ${thon1Token}` },
      signal: AbortSignal.timeout(5000), // Timeout 5s chống treo
    });

    if (!resThon1.ok) {
      throw new Error(`HTTP Error ${resThon1.status}: ${await resThon1.text()}`);
    }

    const dataThon1 = await resThon1.json();
    console.log('HTTP Status:', resThon1.status);
    console.log('Response Scope:', dataThon1.scope);

    const actual = dataThon1.data;

    console.log('\n=========================================================================');
    console.log('📊 BẢNG ĐỐI CHIẾU SỐ LIỆU: TÍNH TAY vs KẾT QUẢ API THỰC TẾ (25 CHỈ SỐ)');
    console.log('=========================================================================');
    console.log(
      'Chỉ số'.padEnd(35) + 'Tính tay'.padStart(12) + 'API trả về'.padStart(12) + 'Khớp 100%?'.padStart(14)
    );
    console.log('-'.repeat(73));

    let allMatched = true;

    const checkMetric = (label: string, expVal: number, actVal: number) => {
      const isMatch = Math.abs(expVal - actVal) < 0.0001;
      if (!isMatch) allMatched = false;
      const status = isMatch ? '✅ KHỚP' : '❌ LỆCH';
      console.log(
        label.padEnd(35) +
          String(expVal).padStart(12) +
          String(actVal).padStart(12) +
          status.padStart(14)
      );
    };

    checkMetric('1. Tổng số hộ (hộ)', expected.household_count, actual.household_count);
    checkMetric('2. Cà phê - Hộ gia đình (ha)', expected.crops.cafe_household, actual.crops.cafe_household);
    checkMetric('3. Cà phê - Nhận khoán (ha)', expected.crops.cafe_contracted, actual.crops.cafe_contracted);
    checkMetric('4. Tổng diện tích Cà phê (ha)', expected.crops.total_cafe, actual.crops.total_cafe);
    checkMetric('5. Cao su - Hộ gia đình (ha)', expected.crops.rubber_household, actual.crops.rubber_household);
    checkMetric('6. Cao su - Nhận khoán (ha)', expected.crops.rubber_contracted, actual.crops.rubber_contracted);
    checkMetric('7. Tổng diện tích Cao su (ha)', expected.crops.total_rubber, actual.crops.total_rubber);
    checkMetric('8. Cây ăn quả (ha)', expected.crops.fruit_tree, actual.crops.fruit_tree);
    checkMetric('9. Cây Mắc Ca (ha)', expected.crops.macadamia, actual.crops.macadamia);
    checkMetric('10. Dược liệu - Đinh lăng (ha)', expected.crops.herb_dinh_lang, actual.crops.herb_dinh_lang);
    checkMetric('11. Dược liệu - Gừng (ha)', expected.crops.herb_gung, actual.crops.herb_gung);
    checkMetric('12. Dược liệu - Nghệ (ha)', expected.crops.herb_nghe, actual.crops.herb_nghe);
    checkMetric('13. Dược liệu - Sả (ha)', expected.crops.herb_sa, actual.crops.herb_sa);
    checkMetric('14. Tổng Cây dược liệu (ha)', expected.crops.total_herb_area, actual.crops.total_herb_area);
    checkMetric('15. Lúa nước (ha)', expected.crops.wet_rice, actual.crops.wet_rice);
    checkMetric('16. Cây hàng năm khác (ha)', expected.crops.other_annual_crops, actual.crops.other_annual_crops);
    checkMetric('17. Tổng diện tích cây trồng (ha)', expected.crops.total_crops_area, actual.crops.total_crops_area);
    console.log('-'.repeat(73));
    checkMetric('18. Đàn Trâu (con)', expected.livestock.buffalo, actual.livestock.buffalo);
    checkMetric('19. Đàn Bò (con)', expected.livestock.cow, actual.livestock.cow);
    checkMetric('20. Tổng gia súc lớn (Trâu+Bò)', expected.livestock.total_cattle, actual.livestock.total_cattle);
    checkMetric('21. Đàn Heo (con)', expected.livestock.pig, actual.livestock.pig);
    checkMetric('22. Đàn Gia cầm (con)', expected.livestock.poultry, actual.livestock.poultry);
    checkMetric('23. Tổng đàn vật nuôi (con)', expected.livestock.total_animals, actual.livestock.total_animals);
    console.log('-'.repeat(73));
    checkMetric('24. Nuôi cá ao (ha)', expected.aquaculture.fish_pond, actual.aquaculture.fish_pond);
    checkMetric('25. Nuôi cá lồng bè (lồng)', expected.aquaculture.fish_cage, actual.aquaculture.fish_cage);
    console.log('='.repeat(73));

    if (!allMatched) {
      throw new Error('❌ Có chỉ số thống kê không khớp giữa tính tay và API!');
    }
    console.log('🎉 XÁC NHẬN: TẤT CẢ 25 CHỈ SỐ THỐNG KÊ KHỚP 100% VỚI TÍNH TAY!');

    // 3. Test By-Village API với Token Admin
    console.log('\n=== TEST 2: GỌI GET /api/analytics/by-village (HTTP FETCH VỚI TOKEN ADMIN) ===');
    const resByVillage = await fetch(`${baseUrl}/api/analytics/by-village`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      signal: AbortSignal.timeout(5000), // Timeout 5s chống treo
    });

    if (!resByVillage.ok) {
      throw new Error(`HTTP Error ${resByVillage.status}: ${await resByVillage.text()}`);
    }

    const dataByVillage = await resByVillage.json();
    console.log('HTTP Status:', resByVillage.status);
    console.log(`Số lượng thôn được tổng hợp: ${dataByVillage.data.length} thôn`);
    const thon1InVillageList = dataByVillage.data.find((v: any) => v.village_id === village1Id);
    console.log(`Số liệu Thôn 1 trong bảng so sánh toàn xã:`, {
      village_name: thon1InVillageList.village_name,
      household_count: thon1InVillageList.household_count,
      total_crops_area: thon1InVillageList.crops.total_crops_area,
      total_animals: thon1InVillageList.livestock.total_animals,
    });

    console.log('\n======================================================');
    console.log('✅ TEST ANALYTICS HTTP API ĐÃ HOÀN TẤT VÀ PASS 100%!');
    console.log('======================================================\n');
  } catch (err: any) {
    console.error('Lỗi khi gọi API:', err.message || err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

main();
