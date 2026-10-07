import type { OverviewAnalytics, VillageAnalytics } from "../types";
import { apiClient } from "./apiClient";

export const analyticsApi = {
	async getOverview(villageId?: string): Promise<{
		status: string;
		scope: { village_id: string | null; village_name: string };
		data: OverviewAnalytics;
	}> {
		const res = await apiClient.get("/analytics/overview", {
			params: villageId ? { villageId } : undefined,
		});
		return res.data;
	},

	async getByVillage(): Promise<{
		status: string;
		data: VillageAnalytics[];
	}> {
		const res = await apiClient.get("/analytics/by-village");
		return res.data;
	},

	async exportComparison(): Promise<Blob> {
		const res = await apiClient.get("/analytics/export-comparison", {
			responseType: "blob",
		});
		return res.data;
	},
};
