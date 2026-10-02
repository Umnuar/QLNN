import { type DBSchema, type IDBPDatabase, openDB } from "idb";
import { decryptData, encryptData } from "../utils/cryptoHelper";

interface QLNNDB extends DBSchema {
	cache: {
		key: string;
		value: {
			key: string;
			data: string; // Encrypted data string
			updatedAt: number;
		};
	};
}

const DB_NAME = "qlnn_client_db";
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<QLNNDB>> | null = null;

export function getDB(): Promise<IDBPDatabase<QLNNDB>> {
	if (!dbPromise) {
		dbPromise = openDB<QLNNDB>(DB_NAME, DB_VERSION, {
			upgrade(db) {
				if (!db.objectStoreNames.contains("cache")) {
					db.createObjectStore("cache", { keyPath: "key" });
				}
			},
		});
	}
	return dbPromise;
}

export async function setCache(key: string, data: any): Promise<void> {
	try {
		const db = await getDB();
		const encryptedData = await encryptData(data);

		await db.put("cache", {
			key,
			data: encryptedData,
			updatedAt: Date.now(),
		});
	} catch (error) {
		console.error("Failed to set cache", error);
	}
}

export async function getCache<T = any>(key: string): Promise<T | null> {
	try {
		const db = await getDB();
		const item = await db.get("cache", key);
		if (!item) return null;

		const decryptedData = await decryptData(item.data);
		return decryptedData as T;
	} catch (error) {
		console.error("Failed to get cache", error);
		return null;
	}
}

export async function clearCache(): Promise<void> {
	try {
		const db = await getDB();
		await db.clear("cache");
	} catch (error) {
		console.error("Failed to clear cache", error);
	}
}
