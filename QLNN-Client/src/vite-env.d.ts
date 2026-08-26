/// <reference types="vite/client" />

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
      setZoom: (level: number) => Promise<void>
    }
  }
}
