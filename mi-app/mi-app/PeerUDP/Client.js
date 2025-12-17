import dgram from "dgram";
import fs from "fs";
import net from "net";

const socket = dgram.createSocket("udp4");
const TCP_PORT = 5001;

let peerIp, peerPort;
let punched = false;
let punchAttempts = 0;
let punchInterval;
let requester = false; // indica si esta instancia es requester

// --- UDP HELLO / PING ---
export function SendMessages(nombreUser){
    socket.send(Buffer.from(`HELLO ${nombreUser}`), 4000, "127.0.0.1");

    setInterval(() => {
        socket.send(Buffer.from(`PING ${nombreUser}`), 4000, "127.0.0.1");
    }, 20000);
}

// --- Obtener datos de peer y arrancar punch ---
export function FetchData(peerName){
    requester = true; // esta acción hace que nos comportemos como requester
    setTimeout(() => {
        fetch(`http://localhost:3000/peer/${peerName}`)
        .then(r => r.json())
        .then(data => {
            peerIp = data.ip;
            peerPort = data.port;
            console.log("Peer:", peerIp, peerPort);
            StartPunch();
        });
    }, 6000);
}

// --- Hole Punching ---
export function StartPunch(){
    punched = false;
    punchAttempts = 0;

    punchInterval = setInterval(() => {
        if(punched || punchAttempts >= 10){
            clearInterval(punchInterval);
            return;
        }

        socket.send(Buffer.from("PUNCH"), peerPort, peerIp);
        punchAttempts++;
        console.log("PUNCH intento", punchAttempts);
    }, 800);
}

// --- Manejo de mensajes UDP ---
export function HandleMessages(){
    socket.on("message", (msg, rinfo) => {
        const text = msg.toString();

        if(text === "PUNCH"){
            socket.send(Buffer.from("PUNCH_ACK"), rinfo.port, rinfo.address);
            StartTCPServer();
        }

        if(text === "PUNCH_ACK"){
            punched = true;
            console.log("Conexión UDP establecida");
                ConnectTCP(TCP_PORT);
            }
    });
}

// --- TCP como requester ---
export function ConnectTCP(PORT){
    const socketTCP = net.connect(PORT, peerIp, () => {
        console.log("Conectado por TCP al owner");

        socketTCP.on("data", data => {
            console.log("Archivos del owner:\n", data.toString());
        });
    });
}

// --- TCP como owner ---
export function StartTCPServer(){
    const server = net.createServer(socket => {
        console.log("Cliente TCP conectado (owner)");

        const files = fs.readdirSync("C:/Users/totog/Music/Music/Dad's rock");
        socket.write("FILE_LISTS\n");
        files.forEach(f => socket.write(f + "\n"));
        socket.end();
    });

    server.listen(TCP_PORT, () => console.log("TCP escuchando en puerto", TCP_PORT));
}
