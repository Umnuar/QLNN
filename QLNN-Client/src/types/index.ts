export interface User {
  id: string;
  username: string;
  role: 'admin' | 'user';
  village_id: string | null;
  created_at?: string;
}

export interface Village {
  id: string;
  name: string;
  created_at?: string;
  updated_at?: string;
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

export interface HouseholdFlat {
  id?: string;
  village_id?: string;
  village_name?: string;
  stt?: number | null;
  full_name: string;
  name_unaccented?: string;
  notes?: string | null;

  // 18 chỉ số nông nghiệp
  cafe_household?: number | null;
  cafe_contracted?: number | null;
  rubber_household?: number | null;
  rubber_contracted?: number | null;
  fruit_tree?: number | null;
  macadamia?: number | null;
  herb_dinh_lang?: number | null;
  herb_gung?: number | null;
  herb_nghe?: number | null;
  herb_sa?: number | null;
  wet_rice?: number | null;
  other_annual_crops?: number | null;

  buffalo?: number | null;
  cow?: number | null;
  pig?: number | null;
  poultry?: number | null;

  fish_pond?: number | null;
  fish_cage?: number | null;

  created_at?: string;
  updated_at?: string;
}

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
