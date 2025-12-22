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

export function RequestFile(filename){
    activeSocket.write(`DOWNLOADFILE ${filename}\n`);
}


let state = "TEXT";
let expectedBytes = 0;
let receivedBytes = 0;
let writeStream = null;
let buffer = Buffer.alloc(0);

function handleCommands(data) {
    buffer = Buffer.concat([buffer, data]); // acumula datos TCP

    while (true) {
        if (state === "TEXT") {
            const newlineIndex = buffer.indexOf("\n");
            if (newlineIndex === -1) return; // esperar a la próxima data

            const line = buffer.subarray(0, newlineIndex).toString().trim();
            buffer = buffer.subarray(newlineIndex + 1);


            if (line === "LIST") {
                console.log("Quiere ver los archivos");
                sendList(activeSocket);
            } else if (line.startsWith("DOWNLOADFILE")) {
                const filename = line.split(" ")[1];
                console.log("El archivo que quiere descargar es: " + filename);
                sendFile(filename);
            } else if (line.startsWith("FILESIZE")) {
                expectedBytes = Number(line.split(" ")[1]);
                receivedBytes = 0;
                writeStream = fs.createWriteStream("C:/Users/totog/Music/DownloadedSongs/song.mp3");
                state = "FILE";
            } else if (line === "END_LIST") {
                peerEvents.emit("LIST_READY");
            } else {
                console.log(line);
            }
        } else if (state === "FILE") {
            if (buffer.length === 0) return;

            const remaining = expectedBytes - receivedBytes;
            const chunk = buffer.subarray(0, remaining);
            buffer = buffer.subarray(chunk.length);


            writeStream.write(chunk);
            receivedBytes += chunk.length;

            if (receivedBytes === expectedBytes) {
                writeStream.end();
                console.log("Archivo descargado ✔");
                state = "TEXT";
            }
        }
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

    socket.write("END_LIST\n");
}


function sendFile(filename){
    const filepath = `C:/Users/totog/Music/Music/Dad's rock/${filename}`;

    if(!fs.existsSync(filepath)){
        activeSocket.write("Song not found!");
        return;
    }
    

    const size = fs.statSync(filepath).size;

    //Avisar tamanio

    activeSocket.write(`FILESIZE ${size}\n`);


    // Mandar bytes

    const stream = fs.createReadStream(filepath);
    stream.on('data', chunk => activeSocket.write(chunk));
    stream.on('end', () => {
        activeSocket.write("ENDFILE\n");
        console.log("Archivo enviado");
    });
}

export function StartTCPServer(TCP_PORT){
    const server = net.createServer(socket =>{
        console.log("Inbound TCP aceptado");
        role = "OWNER";

        socket.setKeepAlive(true,10000);
        //socket.setEncoding('utf-8');

        inboundSocket = socket;

        socket.once('data', data =>{
            if(!data.toString().startsWith("HELLO")){
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
    //    socket.setEncoding('utf-8');

        outboundSocket = socket;
        socket.write("HELLO REQUESTER\n");
    });

    socket.once('data', data =>{
        console.log(data);
        if(!data.toString().startsWith("HELLO")){
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