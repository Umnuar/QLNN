/**
 * Secure Storage wrapper for token and sensitive session data.
 * Ưu tiên sử dụng Tauri Store (@tauri-apps/plugin-store) lưu trữ bền vững.
 * Tương thích ngược với window.api và fallback sang localStorage trong môi trường web/test.
 */
import { isTauri } from "@tauri-apps/api/core";
import { LazyStore } from "@tauri-apps/plugin-store";

let tauriStore: LazyStore | null = null;

function getStore(): LazyStore | null {
	if (typeof window !== "undefined" && isTauri()) {
		if (!tauriStore) {
			tauriStore = new LazyStore("qlnn-secure-tokens.json");
		}
		return tauriStore;
	}
	return null;
}

export const secureStorage = {
	async getItem(key: string): Promise<string | null> {
		try {
			const store = getStore();
			if (store) {
				const val = await store.get<string>(key);
				return val !== undefined && val !== null ? String(val) : null;
			}
			if (typeof window !== "undefined" && (window as unknown as { api?: { store?: { get?: (k: string) => Promise<unknown> } } }).api?.store?.get) {
				const val = await (window as unknown as { api: { store: { get: (k: string) => Promise<unknown> } } }).api.store.get(key);
				return val !== undefined && val !== null ? String(val) : null;
			}
		} catch (err) {
			console.warn("Error reading from secure store:", err);
		}
		return typeof localStorage !== "undefined"
			? localStorage.getItem(key)
			: null;
	},

	async setItem(key: string, value: string): Promise<void> {
		try {
			const store = getStore();
			if (store) {
				await store.set(key, value);
				await store.save();
				if (typeof localStorage !== "undefined") {
					localStorage.removeItem(key);
				}
				return;
			}
			if (typeof window !== "undefined" && (window as unknown as { api?: { store?: { set?: (k: string, v: unknown) => Promise<boolean> } } }).api?.store?.set) {
				await (window as unknown as { api: { store: { set: (k: string, v: unknown) => Promise<boolean> } } }).api.store.set(key, value);
				if (typeof localStorage !== "undefined") {
					localStorage.removeItem(key);
				}
				return;
			}
		} catch (err) {
			console.warn("Error writing to secure store:", err);
		}
		if (typeof localStorage !== "undefined") {
			localStorage.setItem(key, value);
		}
	},

	async removeItem(key: string): Promise<void> {
		try {
			const store = getStore();
			if (store) {
				await store.delete(key);
				await store.save();
			} else if (typeof window !== "undefined" && (window as unknown as { api?: { store?: { delete?: (k: string) => Promise<boolean> } } }).api?.store?.delete) {
				await (window as unknown as { api: { store: { delete: (k: string) => Promise<boolean> } } }).api.store.delete(key);
			}
		} catch (err) {
			console.warn("Error deleting from secure store:", err);
		}
		if (typeof localStorage !== "undefined") {
			localStorage.removeItem(key);
		}
	},

	async clear(): Promise<void> {
		try {
			const store = getStore();
			if (store) {
				await store.clear();
				await store.save();
			} else if (typeof window !== "undefined" && (window as unknown as { api?: { store?: { clear?: () => Promise<boolean> } } }).api?.store?.clear) {
				await (window as unknown as { api: { store: { clear: () => Promise<boolean> } } }).api.store.clear();
			}
		} catch (err) {
			console.warn("Error clearing secure store:", err);
		}
		if (typeof localStorage !== "undefined") {
			localStorage.removeItem("accessToken");
			localStorage.removeItem("refreshToken");
			localStorage.removeItem("user");
		}
	},
};
