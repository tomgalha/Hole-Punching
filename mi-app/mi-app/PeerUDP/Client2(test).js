import dgram from "dgram";
const socket = dgram.createSocket("udp4");

import fetch from "node-fetch";

let peerIp;
let peerPort;

let punched = false;
let punchAttempts = 0;
let punchInterval;


export function SendMessages(){
    // HELLO
    socket.send(Buffer.from("HELLO mili"), 4000, "127.0.0.1");

    // PING
    setInterval(() => {
    socket.send(Buffer.from("PING mili"), 4000, "127.0.0.1");
    }, 20000);
}


export function FetchData(){
    // Obtener peer y arrancar punch
    // El timeout es para que llegue a correr el codigo de cliente en dos consolas
    setTimeout(() => {
    fetch("http://localhost:3000/peer/tom")
        .then(r => r.json())
        .then(data => {
        peerIp = data.ip;
        peerPort = data.port;


        console.log("Peer:", peerIp, peerPort);

        StartPunch();
        });
    }, 6000);
}

function StartPunch() {
  punchInterval = setInterval(() => {
    if (punched || punchAttempts >= 10) {
      clearInterval(punchInterval);
      return;
    }

    socket.send(
      Buffer.from("PUNCH"),
      peerPort,
      peerIp
    );

    punchAttempts++;
    console.log("PUNCH intento", punchAttempts);
  }, 800);
}


export function HandleMessages(){
    socket.on("message", (msg, rinfo) => {
    const text = msg.toString();

    if (text === "PUNCH") {
        console.log("PUNCH recibido de", rinfo.address, rinfo.port);

        socket.send(
        Buffer.from("PUNCH_ACK"),
        rinfo.port,
        rinfo.address
        );
    }

    if (text === "PUNCH_ACK") {
        punched = true;
        console.log("Recibí ACK, conexión establecida");

        HandleTCP();
    }
    if(text.startsWith("OFFER_TCP")){
        const TCP_PORT = text.split(" ")[1];
        socket.send(Buffer.from("ACCEPT_TCP"),  peerPort, peerIp);

       // ConnectTCP(TCP_PORT);
    }
  });
}
