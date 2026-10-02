import path from "node:path";
import { fileURLToPath } from "node:url";
import { app, BrowserWindow, dialog, ipcMain, Menu, safeStorage } from "electron";
import Store from "electron-store";

const store = new Store({ name: "qlnn-secure-tokens" });

function encryptSafe(text: string): string {
	if (safeStorage.isEncryptionAvailable()) {
		return safeStorage.encryptString(text).toString("base64");
	}
	return Buffer.from(text).toString("base64");
}

function decryptSafe(encryptedBase64: string): string {
	try {
		if (safeStorage.isEncryptionAvailable()) {
			return safeStorage.decryptString(Buffer.from(encryptedBase64, "base64"));
		}
		return Buffer.from(encryptedBase64, "base64").toString("utf-8");
	} catch {
		return "";
	}
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
ipcMain.handle("secure-store:get", (_e, key: string) => {
	const val = store.get(key) as string | undefined;
	if (!val) return null;
	const decrypted = decryptSafe(val);
	try {
		return JSON.parse(decrypted);
	} catch {
		return decrypted;
	}
});

ipcMain.handle(
	"secure-store:set",
	(_e, { key, value }: { key: string; value: any }) => {
		const strValue = typeof value === "string" ? value : JSON.stringify(value);
		store.set(key, encryptSafe(strValue));
		return true;
	},
);

ipcMain.handle("secure-store:delete", (_e, key: string) => {
	store.delete(key);
	return true;
});

ipcMain.handle("secure-store:clear", () => {
	store.clear();
	return true;
});

// IPC: App dialogs
ipcMain.handle(
	"dialog:open-file",
	async (_e, filters: { name: string; extensions: string[] }[]) => {
		if (!win) return null;
		const result = await dialog.showOpenDialog(win, {
			properties: ["openFile"],
			filters,
		});
		return result.filePaths[0] || null;
	},
);

ipcMain.handle("get-app-version", () => app.getVersion());

ipcMain.handle("app:set-zoom", (_e, level: number) => {
	if (win && win.webContents) {
		// Zoom level 100% -> 1.0, 80% -> 0.8
		win.webContents.setZoomFactor(level / 100);
	}
});

app.whenReady().then(() => {
	Menu.setApplicationMenu(null);
	createWindow();
});
