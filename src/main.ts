import { app, BrowserWindow, Menu, dialog, nativeImage } from "electron";
import { ipcMain } from 'electron';
import * as path from "path";
import * as SqliteElectron from 'sqlite-electron';

let trophyPath = path.join(__dirname, '../icons/trophy.png');
let trophyIcon = nativeImage.createFromPath(trophyPath);

class Database {
  private static instance: Database;

  private constructor() {
    SqliteElectron.setdbPath('cuong.sqlite', true);
    // Khởi tạo bảng nếu chưa có
    SqliteElectron.executeScript('CREATE TABLE IF NOT EXISTS winners (name TEXT, moves INT)');
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public async getWinners(): Promise<{ name: string; moves: number }[]> {
    try {
      return await SqliteElectron.fetchAll('SELECT * FROM winners ORDER BY moves ASC, name ASC');
    } catch (error) {
      throw new Error('Lỗi khi lấy dữ liệu');
    }
  }

  // Phương thức để lưu tên người chơi và số nước đi
  public async saveWinner(name: string, moves: number): Promise<string> {
    try {
      await SqliteElectron.executeQuery('INSERT INTO winners (name, moves) VALUES (?, ?)', [name, moves]);
      return 'Lưu thành công';
    } catch (error) {
      throw new Error('Lỗi khi lưu');
    }
  }

  // ...các phương thức khác nếu cần...
}
const db = Database.getInstance();
ipcMain.handle('save-winner', async (_, name, moves) => {
  return db.saveWinner(name, moves);
});


function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
    width: 800,
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, "../index.html"));

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  app.on("activate", function () {

    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

const showWinnersDialog = async () => {
  const winners = await db.getWinners();
  const messageContent = winners.map(winner => `${winner.name}: ${winner.moves} nước`).join('\n');
  dialog.showMessageBox({
    type: "none",
    icon: trophyIcon,
    title: 'Bảng thành tích',
    message: 'Top người chơi Tic Tac Toe',
    detail: messageContent,
    buttons: ['OK']
  });
}

const showInfoDialog = () => {
  let infor:string;
  infor = 'Trường Đại học Bách Khoa Hà Nội - Khoa Khoa học Công nghệ giáo dục'+
              '\nMôn học: Phát triển ứng dụng'+
              '\nGiáo viên hướng dẫn: TS. Nguyễn Việt Tùng'+
              '\nNhóm 1: '+
              '\n  -  Nguyễn Văn Cường       MSSV: 20212289'+
              '\n  -  Vũ Đức Tài                     MSSV: 20212337'+
              '\nNgày hoàn thành: 18/06/2024';
  dialog.showMessageBox({
    type: "info",
    title: 'Thông tin game',
    message: 'Game Tic Tac Toe 1.0.0',
    detail: infor,
    buttons: ['OK']
  })
}

const menuTemplate = [
  {
    label: 'Game',
    submenu: [
      {
        label: 'Chơi lại',
        accelerator: 'Ctrl+S',
        click: () => BrowserWindow.getFocusedWindow().reload()
      },
      {
        label: 'Khởi động lại game',
        accelerator: 'Ctrl+R',
        click: () => {
          app.relaunch(),
          app.exit(0)
        }
      },
      {
        label: 'Thoát game',
        accelerator: 'Ctrl+O',
        click: () => app.quit()
      }
    ]
  },
  {
    label: 'View',
    submenu: [
      {
        label: 'Bảng thành tích',
        accelerator: 'Ctrl+T',
        click: showWinnersDialog
      },
      {
        label: 'Thông tin Game',
        accelerator: 'Ctrl+I',
        click: showInfoDialog
      }
    ]
  }
];

const menu = Menu.buildFromTemplate(menuTemplate);
Menu.setApplicationMenu(menu);
