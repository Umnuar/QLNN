import { ipcRenderer, contextBridge } from 'electron'

const api = {
  store: {
    get: (key: string) => ipcRenderer.invoke('secure-store:get', key),
    set: (key: string, value: any) => ipcRenderer.invoke('secure-store:set', { key, value }),
    delete: (key: string) => ipcRenderer.invoke('secure-store:delete', key),
    clear: () => ipcRenderer.invoke('secure-store:clear'),
  },
  dialog: {
    openFile: (filters: { name: string; extensions: string[] }[]) =>
      ipcRenderer.invoke('dialog:open-file', filters),
  },
  app: {
    getVersion: () => ipcRenderer.invoke('get-app-version'),
    setZoom: (level: number) => ipcRenderer.invoke('app:set-zoom', level),
  },
}

contextBridge.exposeInMainWorld('api', api)
