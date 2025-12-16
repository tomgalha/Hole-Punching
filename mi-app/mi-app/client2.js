import dgram from "dgram";
const socket = dgram.createSocket("udp4");

import net from "net";

let peerIp;
let peerPort;

let punched = false;
let punchAttempts = 0;
let punchInterval;

// HELLO
socket.send(Buffer.from("HELLO mili"), 4000, "127.0.0.1");

// PING
setInterval(() => {
  socket.send(Buffer.from("PING mili"), 4000, "127.0.0.1");
}, 20000);

// Obtener peer y arrancar punch
setTimeout(() => {
  fetch("http://localhost:3000/peer/tom")
    .then(r => r.json())
    .then(data => {
      peerIp = data.ip;
      peerPort = data.port;

      console.log("Peer:", peerIp, peerPort);

      startPunch();
    });
}, 6000);

function startPunch() {
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

// MENSAJES
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
  }

  if(text.startsWith("OFFER_TCP")){
    const TCP_PORT = text.split(" ")[1];
    socket.send(Buffer.from("ACCEPT_TCP"),  peerPort, peerIp);

    ConnectTCP(TCP_PORT);
  }
});


function ConnectTCP(PORT){
    const socketTCP = net.connect(PORT, peerIp, () => {
        console.log("Conectado por TCP");

        socketTCP.on("data", data => {
            console.log("Recibido: ", data.toString());
        })
    })
}

