import path from "node:path";
import { fileURLToPath } from "node:url";
import { app, BrowserWindow, dialog, ipcMain, Menu, safeStorage } from "electron";
import Store from "electron-store";

const store = new Store({ name: "qlnn-secure-tokens" });
const inMemoryFallbackStore = new Map<string, string>();
const ALLOWED_STORE_KEYS = [
	"auth_token",
	"refresh_token",
	"current_user",
	"selected_village_id",
	"theme",
];

function setSecureItem(key: string, value: string): void {
	if (safeStorage.isEncryptionAvailable()) {
		const encrypted = safeStorage.encryptString(value).toString("base64");
		store.set(key, encrypted);
	} else {
		// Bảo mật: Nếu DPAPI không khả dụng, chỉ lưu trong RAM phiên làm việc, không lưu Base64 xuống đĩa
		inMemoryFallbackStore.set(key, value);
	}
}

function getSecureItem(key: string): string | null {
	if (safeStorage.isEncryptionAvailable()) {
		const encrypted = store.get(key) as string | undefined;
		if (!encrypted) return null;
		try {
			return safeStorage.decryptString(Buffer.from(encrypted, "base64"));
		} catch {
			return null;
		}
	}
	return inMemoryFallbackStore.get(key) || null;
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));

process.env.APP_ROOT = path.join(__dirname, "..");

export const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
	? path.join(process.env.APP_ROOT, "public")
	: RENDERER_DIST;

let win: BrowserWindow | null;

function validateSender(event: Electron.IpcMainInvokeEvent): boolean {
	if (!win || event.sender !== win.webContents) {
		return false;
	}
	return true;
}

function createWindow() {
	win = new BrowserWindow({
		width: 1366,
		height: 850,
		minWidth: 1024,
		minHeight: 650,
		autoHideMenuBar: true,
		title: "Quản Lý Nông Nghiệp - Xã Đăk Hà",
		webPreferences: {
			preload: path.join(__dirname, "preload.mjs"),
			contextIsolation: true,
			nodeIntegration: false,
			sandbox: true,
		},
	});

	win.removeMenu();
	win.setMenu(null);
	win.setMenuBarVisibility(false);

	// Chặn mở cửa sổ mới trái phép (SEC-04)
	win.webContents.setWindowOpenHandler(() => {
		return { action: "deny" };
	});

	// Chặn điều hướng ngoài ứng dụng (will-navigate)
	win.webContents.on("will-navigate", (event, url) => {
		if (VITE_DEV_SERVER_URL && url.startsWith(VITE_DEV_SERVER_URL)) return;
		event.preventDefault();
	});

	win.webContents.on("before-input-event", (event, input) => {
		if (input.type === "keyDown") {
			if (
				input.key === "F12" ||
				(input.control && input.shift && input.key.toLowerCase() === "i")
			) {
				if (!app.isPackaged || VITE_DEV_SERVER_URL) {
					win?.webContents.toggleDevTools();
				}
				event.preventDefault();
			}
			if (
				input.key === "F5" ||
				(input.control && !input.shift && input.key.toLowerCase() === "r")
			) {
				win?.webContents.reload();
				event.preventDefault();
			}
		}
	});

	if (VITE_DEV_SERVER_URL) {
		win.loadURL(VITE_DEV_SERVER_URL);
	} else {
		win.loadFile(path.join(RENDERER_DIST, "index.html"));
	}

	win.webContents.on("console-message", (_e, level, msg) => {
		console.log(`[Renderer ${level}] ${msg}`);
	});
}

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit();
		win = null;
	}
});

app.on("activate", () => {
	if (BrowserWindow.getAllWindows().length === 0) {
		createWindow();
	}
});

// IPC: Secure Token Store (Windows DPAPI via Electron safeStorage)
ipcMain.handle("secure-store:get", (event, key: string) => {
	if (!validateSender(event)) return null;
	if (!ALLOWED_STORE_KEYS.includes(key)) return null;
	const decrypted = getSecureItem(key);
	if (!decrypted) return null;
	try {
		return JSON.parse(decrypted);
	} catch {
		return decrypted;
	}
});

ipcMain.handle(
	"secure-store:set",
	(event, { key, value }: { key: string; value: any }) => {
		if (!validateSender(event)) return false;
		if (!ALLOWED_STORE_KEYS.includes(key)) return false;
		const strValue = typeof value === "string" ? value : JSON.stringify(value);
		setSecureItem(key, strValue);
		return true;
	},
);

ipcMain.handle("secure-store:delete", (event, key: string) => {
	if (!validateSender(event)) return false;
	if (!ALLOWED_STORE_KEYS.includes(key)) return false;
	store.delete(key);
	inMemoryFallbackStore.delete(key);
	return true;
});

ipcMain.handle("secure-store:clear", (event) => {
	if (!validateSender(event)) return false;
	store.clear();
	inMemoryFallbackStore.clear();
	return true;
});

// IPC: App dialogs
ipcMain.handle(
	"dialog:open-file",
	async (event, filters: { name: string; extensions: string[] }[]) => {
		if (!validateSender(event)) return null;
		if (!win) return null;
		const result = await dialog.showOpenDialog(win, {
			properties: ["openFile"],
			filters,
		});
		return result.filePaths[0] || null;
	},
);

ipcMain.handle("get-app-version", (event) => {
	if (!validateSender(event)) return "";
	return app.getVersion();
});

ipcMain.handle("app:set-zoom", (event, level: number) => {
	if (!validateSender(event)) return;
	if (win && win.webContents) {
		// Zoom level 100% -> 1.0, 80% -> 0.8
		win.webContents.setZoomFactor(level / 100);
	}
});

app.whenReady().then(() => {
	Menu.setApplicationMenu(null);
	createWindow();
});

