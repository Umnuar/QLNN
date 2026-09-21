import { app, BrowserWindow, ipcMain, dialog, Menu } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import Store from 'electron-store'

const secureStore = new Store({
  name: 'qlnn-secure-tokens',
  encryptionKey: 'QLNN_ENCRYPTED_STORE_KEY_SECURE_2026'
})

const __dirname = path.dirname(fileURLToPath(import.meta.url))

process.env.APP_ROOT = path.join(__dirname, '..')

export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null

function createWindow() {
  win = new BrowserWindow({
    width: 1366,
    height: 850,
    minWidth: 1024,
    minHeight: 650,
    autoHideMenuBar: true,
    title: 'Quản Lý Nông Nghiệp - Xã Đăk Hà',
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  win.removeMenu()
  win.setMenu(null)
  win.setMenuBarVisibility(false)

  win.webContents.on('before-input-event', (event, input) => {
    if (input.type === 'keyDown') {
      if (input.key === 'F12' || (input.control && input.shift && input.key.toLowerCase() === 'i')) {
        win?.webContents.toggleDevTools();
        event.preventDefault();
      }
      if (input.key === 'F5' || (input.control && !input.shift && input.key.toLowerCase() === 'r')) {
        win?.webContents.reload();
        event.preventDefault();
      }
    }
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }

  win.webContents.on('console-message', (_e, level, msg) => {
    console.log(`[Renderer ${level}] ${msg}`)
  })
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// IPC: Secure Token Store (AES Encrypted)
ipcMain.handle('secure-store:get', (_e, key: string) => {
  return secureStore.get(key)
})

ipcMain.handle('secure-store:set', (_e, { key, value }: { key: string; value: any }) => {
  secureStore.set(key, value)
  return true
})

ipcMain.handle('secure-store:delete', (_e, key: string) => {
  secureStore.delete(key)
  return true
})

ipcMain.handle('secure-store:clear', () => {
  secureStore.clear()
  return true
})

// IPC: App dialogs
ipcMain.handle('dialog:open-file', async (_e, filters: { name: string; extensions: string[] }[]) => {
  if (!win) return null
  const result = await dialog.showOpenDialog(win, {
    properties: ['openFile'],
    filters,
  })
  return result.filePaths[0] || null
})

ipcMain.handle('get-app-version', () => app.getVersion())

ipcMain.handle('app:set-zoom', (_e, level: number) => {
  if (win && win.webContents) {
    // Zoom level 100% -> 1.0, 80% -> 0.8
    win.webContents.setZoomFactor(level / 100)
  }
})

app.whenReady().then(() => {
  Menu.setApplicationMenu(null)
  createWindow()
})
