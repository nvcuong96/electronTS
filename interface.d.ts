export interface IElectronAPI {
    saveWinner: (name: string, moves: number) => Promise<void>,
  }
  
  declare global {
    interface Window {
      electronAPI: IElectronAPI
    }
  }