import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  saveWinner: (name: string, moves: number) => ipcRenderer.invoke('save-winner', name, moves)
});