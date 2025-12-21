import dgram from "dgram";
import {ConnectTCP,StartTCPServer} from "../PeerTCP/TCPConnection.js"

const socket = dgram.createSocket("udp4");
const TCP_PORT = 5001;

let peerIp, peerPort;
let punched = false;
let punchAttempts = 0;
let punchInterval;

// --- UDP HELLO / PING ---
export function SendMessages(nombreUser){
    socket.send(Buffer.from(`HELLO ${nombreUser}`), 4000, "127.0.0.1");

    setInterval(() => {
        socket.send(Buffer.from(`PING ${nombreUser}`), 4000, "127.0.0.1");
    }, 20000);
}

// --- Obtener datos de peer y arrancar punch ---
export function FetchData(peerName){
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
function StartPunch(){
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
           // StartTCPServer(TCP_PORT);
        }

        if(text === "PUNCH_ACK"){
            if(punched) return;

            punched=true;
            console.log("UDP hole abierto");

            ConnectTCP(TCP_PORT, peerIp);

          //  punched = true;
            //console.log("UDP hole abierto");
            //StartTCPServer(TCP_PORT);
            //ConnectTCP(TCP_PORT,peerIp);
        }
    });
}
