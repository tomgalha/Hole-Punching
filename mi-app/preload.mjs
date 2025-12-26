import { contextBridge, ipcRenderer } from "electron";

let OwnerUsername = null;
let RequesterUsername = null;

contextBridge.exposeInMainWorld("p2p", {
  startServer: (port) => ipcRenderer.invoke("p2p:start-server", port),
  connect: (port, ip) => ipcRenderer.invoke("p2p:connect", port, ip),
  requestFile: (filename) => ipcRenderer.invoke("p2p:request-file", filename),

  setUsername: (username) =>{
    RequesterUsername = username 
    console.log(RequesterUsername);

    ipcRenderer.invoke("p2p:udpmessage", username);
  },

  setUsernameOwner: (username) => {
    ipcRenderer.invoke('p2p:set-username-owner', username);
  },

  fetchData: () => {
    ipcRenderer.invoke('p2p:fetch-data');
  },

  onEvent: (event, cb) => {
    ipcRenderer.on(`p2p:event:${event}`, (_, data) => cb(data));
  }
});
