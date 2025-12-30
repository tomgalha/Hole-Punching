import {ipcMain} from 'electron';

import {PeerUDP} from './p2p-core/PeerUDP/Client.js';

let peer = null;
let OwnerUsername = null;

ipcMain.handle("p2p:set-username", (event, username)=>{
    peer = new PeerUDP(username);
    peer.startHello();
    
})

ipcMain.handle("p2p:set-username-owner", (_, username)=>{
    console.log(`Owner of the files: ${username}`);
    OwnerUsername = username;
})

ipcMain.handle("p2p:fetch-data", ()=>{
    console.log('fetching data..');
    peer.fetchpeer(OwnerUsername);
})

ipcMain.handle("p2p:send-message", (_, message)=>{
    peer.SendMessage(message);
})


ipcMain.handle('p2p:list-files', ()=>{
    peer.ListFiles();
})