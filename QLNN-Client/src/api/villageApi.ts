import type { Village } from "../types";
import { apiClient } from "./apiClient";

export const villageApi = {
	async getAll(): Promise<Village[]> {
		const res = await apiClient.get("/villages");
		return res.data.data || res.data;
	},

	async create(name: string): Promise<Village> {
		const res = await apiClient.post("/villages", { name });
		return res.data.data || res.data;
	},

	async update(id: string, name: string): Promise<Village> {
		const res = await apiClient.put(`/villages/${id}`, { name });
		return res.data.data || res.data;
	},

	async delete(id: string, force?: boolean): Promise<void> {
		await apiClient.delete(`/villages/${id}${force ? "?force=true" : ""}`);
	},
};
