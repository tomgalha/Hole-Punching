import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("p2p", {
  startServer: (port) => ipcRenderer.invoke("p2p:start-server", port),
  connect: (port, ip) => ipcRenderer.invoke("p2p:connect", port, ip),
  requestFile: (filename) => ipcRenderer.invoke("p2p:request-file", filename),

  setUsername: (username) =>{
    ipcRenderer.invoke('p2p:set-username', username);
  },

  setUsernameOwner: (username) => {
    ipcRenderer.invoke('p2p:set-username-owner', username);
  },

  setTCP: (tcp_value) =>{
    ipcRenderer.invoke('p2p:set_tcp', tcp_value);
  },

  fetchData: () => {
    ipcRenderer.invoke('p2p:fetch-data');
  },

  sendMessage: (message)=>{
    ipcRenderer.invoke('p2p:send-message', message);
  },

  getFiles: () =>{
    ipcRenderer.invoke('p2p:list-files');
  },

  onEvent: (event, cb) => {
    ipcRenderer.on(`p2p:event:${event}`, (_, data) => cb(data));
  }
});
