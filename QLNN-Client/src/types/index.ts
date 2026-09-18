export interface User {
  id: string;
  username: string;
  full_name?: string;
  role: 'admin' | 'user';
  village_id: string | null;
  created_at?: string;
  is_online?: boolean;
}

export interface Village {
  id: string;
  name: string;
  created_at?: string;
  updated_at?: string;
}

export interface AuditLog {
  id: string;
  village_id: string;
  user_id: string;
  username: string;
  action: string;
  entity_type: string;
  entity_id: string;
  details: any;
  created_at: string;
}

export interface CropItem {
  id?: string;
  crop_type: string;
  crop_subtype?: string | null;
  ownership_type?: 'household' | 'contracted' | null;
  area: number;
}

export interface LivestockItem {
  id?: string;
  animal_type: string;
  quantity: number;
}

export interface AquacultureItem {
  id?: string;
  aquaculture_type: string;
  value: number;
  unit: string;
}

/**
 * Cấu trúc phẳng của Hộ Nông Nghiệp phục vụ hiển thị bảng, tìm kiếm, lọc và xuất Excel.
 * Bao gồm đầy đủ 18 chỉ tiêu nông nghiệp và trường `version` phục vụ Optimistic Concurrency Control (OCC).
 */
export interface HouseholdFlat {
  id?: string;
  village_id?: string;
  village_name?: string;
  stt?: number | null;
  full_name: string;
  name_unaccented?: string;
  phone?: string | null;
  address?: string | null;
  notes?: string | null;

  // Optimistic Concurrency Control (OCC) version
  version?: number | null;

  // Trạng thái thùng rác (Soft-delete)
  is_deleted?: boolean | null;
  deleted_at?: string | null;

  // 18 chỉ số nông nghiệp
  // 1. Nhóm Cây công nghiệp lâu năm (ha)
  cafe_household?: number | null;
  cafe_contracted?: number | null;
  rubber_household?: number | null;
  rubber_contracted?: number | null;

  // 2. Nhóm Cây ăn quả & Mắc ca (ha)
  fruit_tree?: number | null;
  macadamia?: number | null;

  // 3. Nhóm Cây lương thực & hàng năm (ha)
  wet_rice?: number | null;
  other_annual_crops?: number | null;

  // 4. Nhóm Cây dược liệu (ha)
  herb_dinh_lang?: number | null;
  herb_gung?: number | null;
  herb_nghe?: number | null;
  herb_sa?: number | null;

  // 5. Nhóm Chăn nuôi gia súc, gia cầm (con)
  buffalo?: number | null;
  cow?: number | null;
  pig?: number | null;
  poultry?: number | null;

  // 6. Nhóm Nuôi trồng thủy sản
  fish_pond?: number | null; // Diện tích ao hồ (ha)
  fish_cage?: number | null; // Số lồng bè (lồng)

  created_at?: string;
  updated_at?: string;
}

/**
 * Type alias tiện ích cho Household
 */
export type Household = HouseholdFlat;

export interface OverviewAnalytics {
  household_count: number;
  crops: {
    cafe_household: number;
    cafe_contracted: number;
    total_cafe: number;
    rubber_household: number;
    rubber_contracted: number;
    total_rubber: number;
    fruit_tree: number;
    macadamia: number;
    herb_dinh_lang: number;
    herb_gung: number;
    herb_nghe: number;
    herb_sa: number;
    total_herb_area: number;
    wet_rice: number;
    other_annual_crops: number;
    total_crops_area: number;
  };
  livestock: {
    buffalo: number;
    cow: number;
    total_cattle: number;
    pig: number;
    poultry: number;
    total_animals: number;
  };
  aquaculture: {
    fish_pond: number;
    fish_cage: number;
  };
}

export interface VillageAnalytics extends OverviewAnalytics {
  village_id: string;
  village_name: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

export interface ExcelPreviewItem {
  stt: number;
  full_name: string;
  action: 'create' | 'update';
  existingId: string | null;
  cropCount: number;
  livestockCount: number;
  aquaCount: number;
  notes?: string;
}

export interface ExcelPreviewResponse {
  status: string;
  villageName: string;
  totalRowsParsed: number;
  createCount: number;
  updateCount: number;
  previewList: ExcelPreviewItem[];
}
