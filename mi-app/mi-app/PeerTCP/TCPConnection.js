import fs from "fs";
import net from "net";
import { EventEmitter } from "events";

export const peerEvents = new EventEmitter();

let inboundSocket = null;
let outboundSocket = null;
let activeSocket = null;

let role = null;

function trySelectActive(socket){
    if(activeSocket) return;

    activeSocket = socket;
    console.log("Socket elegido");

    // Cerrar el otro si existe
    if(socket !== inboundSocket && inboundSocket){
        inboundSocket.end();
        inboundSocket=null;
    }
    if(socket !== outboundSocket && outboundSocket){
        outboundSocket.end();
        outboundSocket = null;
    }

    if(role === "REQUESTER"){
        socket.write("LIST\n");
    }
}

function handleCommands(data){
    const msg = data.trim();

    if(msg === "LIST"){
        console.log("Quiere ver los archivos")
        sendList(activeSocket);
    }
    else if(msg.startsWith("DOWNLOADFILE")){
        const filename = msg.split(" ")[1];
        console.log("El archivo que quiere descargar es: " + filename);
    }else if(msg.includes("END_LIST")) peerEvents.emit("LIST_READY");
    else{
        console.log(msg);
    }
}

function sendList(socket){
    const basePath = "C:/Users/totog/Music/Music/Dad's rock";
    const files = fs.readdirSync(basePath);

    files.forEach(f =>{
        const fullPath = `${basePath}/${f}`;
        const stats = fs.statSync(fullPath);

        socket.write(`${f}\n`);
        socket.write("File size: " + (stats.size / (1024 * 1024)).toFixed(2)  +" MB"+ "\n");
    });

    socket.write("END_LIST");
}

export function StartTCPServer(TCP_PORT){
    const server = net.createServer(socket =>{
        console.log("Inbound TCP aceptado");
        role = "OWNER";

        socket.setKeepAlive(true,10000);
        socket.setEncoding('utf-8');

        inboundSocket = socket;

        socket.once('data', data =>{
            console.log(data);
            if(!data.startsWith("HELLO")){
                socket.end();
                return;
            }

            socket.write("HELLO OWNER\n");
            trySelectActive(socket);
            socket.on("data", handleCommands);
        });

        socket.on('close', ()=>{
            if(socket === inboundSocket) inboundSocket=null;
            if(socket === activeSocket) activeSocket = null;
        });
    });

    server.listen(TCP_PORT, ()=>{
        console.log("TCP escuchando en: ", TCP_PORT);
    })
}


export function ConnectTCP(PORT, peerIp){
    const socket = net.connect(PORT,peerIp, ()=>{
        role="REQUESTER"
        console.log("Outbound TCP conectado");

        socket.setKeepAlive(true,10000);
        socket.setEncoding('utf-8');

        outboundSocket = socket;
        socket.write("HELLO REQUESTER\n");
    });

    socket.once('data', data =>{
        console.log(data);
        if(!data.startsWith("HELLO")){
            socket.end();
            return;
        }

        trySelectActive(socket);

        socket.on("data", handleCommands);
    });

    socket.on('close', ()=>{
        if(socket === outboundSocket) outboundSocket = null;
        if(socket === activeSocket) activeSocket = null;
    });

    return socket;
}