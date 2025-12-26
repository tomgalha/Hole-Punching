import {BrowserWindow, ipcMain} from 'electron';
import {
    StartTCPServer,
    ConnectTCP,
    RequestFile,
    peerEvents
} from "./mi-app/PeerTCP/TCPConnection.js"

import {PeerUDP} from './mi-app/PeerUDP/Client.js';

let peer = null;
let OwnerUsername = null;

ipcMain.handle("p2p:set-username", (_, username)=>{
    console.log(username);
})

ipcMain.handle("p2p:set-username-owner", (_, username)=>{
    console.log(`Owner of the files: ${username}`);
    OwnerUsername = username;
})

ipcMain.handle("p2p:udpmessage", (_, username)=>{
    peer = new PeerUDP(username,5001);
    peer.startHello();
})

ipcMain.handle("p2p:fetch-data", ()=>{
    console.log('fetching data..');
    peer.fetchpeer(OwnerUsername);
})

ipcMain.handle("p2p:start-server", (_, port)=>{
    StartTCPServer(port);
});

ipcMain.handle("p2p:connect", (_, port, ip)=>{
    ConnectTCP(port,ip);
})

ipcMain.handle("p2p:request-file", (_, filename)=>{
    RequestFile(filename);
})


peerEvents.on("LIST_READY", ()=>{
    BrowserWindow.getAllWindows()[0]?.webContents.send("p2p:event:_LIST_READY");
})