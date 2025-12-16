// main.js
import { app, BrowserWindow, ipcMain } from "electron"; 
import path from "path"; import { fileURLToPath } from "url"; 
import { SendMessages, FetchData, HandleMessages } from "./PeerUDP/Client.js";

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  win.loadFile("index.html");

  // Comunicar backend UDP/TCP con UI
  HandleMessages((peerIp, peerPort) => {
    win.webContents.send("udp-connected", { peerIp, peerPort });
  });
}

// Cuando Electron esté listo
app.whenReady().then(() => {
  createWindow();
  SendMessages();
  FetchData();
});

// Cerrar app en macOS
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
