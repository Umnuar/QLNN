/// <reference types="vite-plugin-electron/electron-env" />

declare namespace NodeJS {
  interface ProcessEnv {
    VSCODE_DEBUG?: 'true'
    DIST_ELECTRON: string
    DIST: string
    VITE_DEV_SERVER_URL: string
    APP_ROOT: string
    VITE_PUBLIC: string
  }
}

interface Window {
  api: {
    store: {
      get: (key: string) => Promise<any>
      set: (key: string, value: any) => Promise<boolean>
      delete: (key: string) => Promise<boolean>
      clear: () => Promise<boolean>
    }
    dialog: {
      openFile: (filters: { name: string; extensions: string[] }[]) => Promise<string | null>
    }
    app: {
      getVersion: () => Promise<string>
    }
  }
}
