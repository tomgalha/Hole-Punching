import dgram from "dgram";
import {ConnectTCP} from "../PeerTCP/TCPConnection.js"

const socket = dgram.createSocket("udp4");
socket.bind();
//const TCP_PORT = 5001;

let peerIp, peerUDPPort, peerTCPPort;
let punched = false;
let punchAttempts = 0;
let punchInterval;

// --- UDP HELLO / PING ---
export function SendMessages(nombreUser, tcp_port){
    socket.send(Buffer.from(`HELLO ${nombreUser} ${tcp_port}`), 4000, "127.0.0.1");

    setInterval(() => {
        socket.send(Buffer.from(`PING ${nombreUser}`), 4000, "127.0.0.1");
    }, 1000);
}

// --- Obtener datos de peer y arrancar punch ---
export function FetchData(peerName){
    setTimeout(() => {
        fetch(`http://localhost:3000/peer/${peerName}`)
        .then(r => r.json())
        .then(data => {
            peerIp = data.ip;
            peerUDPPort = data.udp_port;
            peerTCPPort = data.tcp_port;
            console.log(`Peer: ${peerIp}, UDP PORT: ${peerUDPPort}, TCP PORT: ${peerTCPPort}`);
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

        socket.send(Buffer.from("PUNCH"), peerUDPPort, peerIp);
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

            // 5001 para probar desde la misma pc 
            ConnectTCP(5001, peerIp);

            //  punched = true;
            //console.log("UDP hole abierto");
            //StartTCPServer(TCP_PORT);
            //ConnectTCP(TCP_PORT,peerIp);
        }
    });
}


// --- Mostrar usuarios conectados
export async function OnlineUsers(){
    const data = await fetch("http://localhost:3000/usersConnected");
    const json = await data.json();

    for(const user of json){
        console.log(user);
    }
}