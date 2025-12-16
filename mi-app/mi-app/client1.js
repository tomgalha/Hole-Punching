import dgram from "dgram";
const socket = dgram.createSocket("udp4");

let peerIp;
let peerPort;

let punched = false;
let punchAttempts = 0;
let punchInterval;



import net from "net";

const TCP_PORT = 5001;


// HELLO
socket.send(Buffer.from("HELLO tom"), 4000, "127.0.0.1");

// PING
setInterval(() => {
  socket.send(Buffer.from("PING tom"), 4000, "127.0.0.1");
}, 20000);

// Obtener peer y arrancar punch
setTimeout(() => {
  fetch("http://localhost:3000/peer/mili")
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

    HandleTCP();
  }

});

function StartTCP(){
    const server = net.createServer(socket => {
        console.log("Cliente TCP contectado");

        socket.write("FILE_START\n");

        socket.write("Hola desde el peer que tiene el archivo\n");

        socket.end();
    })

    server.listen(TCP_PORT, () =>{
        console.log("TCP escuchando en: " + TCP_PORT);
    })
}



function HandleTCP(){
    StartTCP();
    socket.send(`OFFER_TCP ${TCP_PORT}`, peerPort, peerIp);
}

