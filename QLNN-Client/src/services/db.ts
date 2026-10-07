import { type DBSchema, type IDBPDatabase, openDB } from "idb";
import { decryptData, encryptData } from "../utils/cryptoHelper";

export interface CacheItem<T = any> {
	key: string;
	data: T;
	updatedAt: number;
}

export interface DraftItem<T = any> {
	formId: string;
	data: T;
	updatedAt: number;
}

export interface SyncQueueItem<T = any> {
	id?: number;
	action: "CREATE" | "UPDATE" | "DELETE" | "BULK_IMPORT" | "BULK_STATUS";
	entity: "household" | "village";
	data: T;
	timestamp: number;
	retryCount: number;
}

export interface QLNNDB extends DBSchema {
	cache: {
		key: string;
		value: {
			key: string;
			data: any;
			updatedAt: number;
		};
	};
	drafts: {
		key: string;
		value: {
			formId: string;
			data: any;
			updatedAt: number;
		};
	};
	syncQueue: {
		key: number;
		value: SyncQueueItem;
		indexes: { "by-timestamp": number };
	};
}

const DB_NAME = "qlnn_client_db";
const DB_VERSION = 2;

let dbPromise: Promise<IDBPDatabase<QLNNDB>> | null = null;

// ================= Fallback In-Memory Stores =================
const memoryCache = new Map<string, { key: string; data: any; updatedAt: number }>();
const memoryDrafts = new Map<string, { formId: string; data: any; updatedAt: number }>();
const memorySyncQueue: SyncQueueItem[] = [];
let syncAutoIncId = 1;

export function getDB(): Promise<IDBPDatabase<QLNNDB>> {
	if (!dbPromise) {
		try {
			if (typeof window === "undefined" && typeof indexedDB === "undefined") {
				return Promise.reject(new Error("IndexedDB is not supported in this environment"));
			}
			dbPromise = openDB<QLNNDB>(DB_NAME, DB_VERSION, {
				upgrade(db) {
					if (!db.objectStoreNames.contains("cache")) {
						db.createObjectStore("cache", { keyPath: "key" });
					}
					if (!db.objectStoreNames.contains("drafts")) {
						db.createObjectStore("drafts", { keyPath: "formId" });
					}
					if (!db.objectStoreNames.contains("syncQueue")) {
						const syncStore = db.createObjectStore("syncQueue", {
							keyPath: "id",
							autoIncrement: true,
						});
						syncStore.createIndex("by-timestamp", "timestamp");
					}
				},
			});
		} catch (e) {
			return Promise.reject(e);
		}
	}
	return dbPromise;
}

// ---------------- 1. Cache Operations ----------------
export async function setCache(key: string, data: any): Promise<void> {
	let encryptedData: any;
	try {
		encryptedData = await encryptData(data);
	} catch {
		encryptedData = data;
	}

	const item = {
		key,
		data: encryptedData,
		updatedAt: Date.now(),
	};

	try {
		const db = await getDB();
		await db.put("cache", item);
	} catch {
		memoryCache.set(key, item);
	}
}

export async function getCache<T = any>(key: string): Promise<T | null> {
	try {
		const db = await getDB();
		const item = await db.get("cache", key);
		if (!item) {
			const inMem = memoryCache.get(key);
			if (!inMem) return null;
			return (await decryptData(inMem.data)) as T;
		}
		const decrypted = await decryptData(item.data);
		return decrypted as T;
	} catch {
		const inMem = memoryCache.get(key);
		if (!inMem) return null;
		try {
			return (await decryptData(inMem.data)) as T;
		} catch {
			return inMem.data as T;
		}
	}
}

export async function getCacheMeta(
	key: string,
): Promise<{ updatedAt: number } | null> {
	try {
		const db = await getDB();
		const item = await db.get("cache", key);
		if (item) return { updatedAt: item.updatedAt };
		const inMem = memoryCache.get(key);
		return inMem ? { updatedAt: inMem.updatedAt } : null;
	} catch {
		const inMem = memoryCache.get(key);
		return inMem ? { updatedAt: inMem.updatedAt } : null;
	}
}

export async function removeCache(key: string): Promise<void> {
	try {
		const db = await getDB();
		await db.delete("cache", key);
	} catch {
		memoryCache.delete(key);
	}
}

export async function clearCache(): Promise<void> {
	try {
		const db = await getDB();
		await db.clear("cache");
	} catch {
		memoryCache.clear();
	}
}

// ---------------- 2. Draft Operations (Auto-save) ----------------
export async function saveDraft(formId: string, data: any): Promise<void> {
	let encryptedData: any;
	try {
		encryptedData = await encryptData(data);
	} catch {
		encryptedData = data;
	}

	const item = {
		formId,
		data: encryptedData,
		updatedAt: Date.now(),
	};

	try {
		const db = await getDB();
		await db.put("drafts", item);
	} catch {
		memoryDrafts.set(formId, item);
	}
}

export async function getDraft<T = any>(formId: string): Promise<T | null> {
	try {
		const db = await getDB();
		const draft = await db.get("drafts", formId);
		if (!draft) {
			const inMem = memoryDrafts.get(formId);
			if (!inMem) return null;
			return (await decryptData(inMem.data)) as T;
		}
		return (await decryptData(draft.data)) as T;
	} catch {
		const inMem = memoryDrafts.get(formId);
		if (!inMem) return null;
		try {
			return (await decryptData(inMem.data)) as T;
		} catch {
			return inMem.data as T;
		}
	}
}

export async function clearDraft(formId: string): Promise<void> {
	try {
		const db = await getDB();
		await db.delete("drafts", formId);
	} catch {
		memoryDrafts.delete(formId);
	}
}

// ---------------- 3. Sync Queue Operations (Offline-first) ----------------
export async function enqueueSync<T = any>(
	action: "CREATE" | "UPDATE" | "DELETE" | "BULK_IMPORT" | "BULK_STATUS",
	entity: "household" | "village",
	data: T,
): Promise<number> {
	const item: Omit<SyncQueueItem<T>, "id"> = {
		action,
		entity,
		data,
		timestamp: Date.now(),
		retryCount: 0,
	};

	try {
		const db = await getDB();
		const id = await db.add("syncQueue", item as SyncQueueItem);
		if (typeof window !== "undefined") {
			window.dispatchEvent(new Event("sync:queued"));
		}
		return id as number;
	} catch {
		const id = syncAutoIncId++;
		memorySyncQueue.push({ ...item, id });
		if (typeof window !== "undefined") {
			window.dispatchEvent(new Event("sync:queued"));
		}
		return id;
	}
}

export async function getSyncQueue(): Promise<SyncQueueItem[]> {
	try {
		const db = await getDB();
		return await db.getAll("syncQueue");
	} catch {
		return [...memorySyncQueue];
	}
}

export async function removeSyncQueueItem(id: number): Promise<void> {
	try {
		const db = await getDB();
		await db.delete("syncQueue", id);
	} catch {
		const idx = memorySyncQueue.findIndex((item) => item.id === id);
		if (idx !== -1) {
			memorySyncQueue.splice(idx, 1);
		}
	}

	if (typeof window !== "undefined") {
		window.dispatchEvent(new Event("sync:updated"));
	}
}

export async function getSyncQueueCount(): Promise<number> {
	try {
		const db = await getDB();
		return await db.count("syncQueue");
	} catch {
		return memorySyncQueue.length;
	}
}

export async function clearSyncQueue(): Promise<void> {
	try {
		const db = await getDB();
		await db.clear("syncQueue");
	} catch {
		memorySyncQueue.length = 0;
	}

	if (typeof window !== "undefined") {
		window.dispatchEvent(new Event("sync:updated"));
	}
}
