import {app,BrowserWindow} from "electron";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import "./handle.js"

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
      sandbox: false
    }
  });

  win.loadFile("index.html");
}


app.whenReady().then(()=>{
  createWindow('user1');
  createWindow('user2');
});