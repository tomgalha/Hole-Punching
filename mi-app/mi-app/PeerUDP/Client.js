import dgram from "dgram";
const socket = dgram.createSocket("udp4");
import fs from "fs";
import net from "net";

let peerIp;
let peerPort;

let punched = false;
let punchAttempts = 0;
let punchInterval;



export function SendMessages(nombreUser){
    // HELLO
    socket.send(Buffer.from(`HELLO ${nombreUser}`), 4000, "127.0.0.1");

    // PING
    setInterval(() => {
    socket.send(Buffer.from(`PING ${nombreUser}`), 4000, "127.0.0.1");
    }, 20000);
}


export function FetchData(user){
    // Obtener peer y arrancar punch
    // El timeout es para que llegue a correr el codigo de cliente en dos consolas
    setTimeout(() => {
    fetch(`http://localhost:3000/peer/${user}`)
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
        if(role === "OWNER"){
          HandleTCP();
        }else if(role==="REQUESTER"){
          ConnectTCP();
        }
    }

    });
}

const TCP_PORT = 5001;

export function ConnectTCP(PORT){
    const socketTCP = net.connect(PORT, peerIp, () => {
        console.log("Conectado por TCP");

        socketTCP.on("data", data => {
            console.log("Recibido: ", data.toString());
        })
    })
  }

export function StartTCPServer(){
    const server = net.createServer(socket => {
        console.log("Cliente TCP conectado");

        // Leer archivos de la carpeta
        const files = fs.readdirSync("C:\Users\totog\Music\Music\Dad's rock");
        socket.write("FILE_LISTS\n");
        files.forEach(file =>{
          socket.write(file + "\n");
        })
        socket.end();
    })

    server.listen(TCP_PORT, () =>{
        console.log("TCP escuchando en: " + TCP_PORT);
    })
}

function HandleTCP(){
    StartTCPServer();
    socket.send(`OFFER_TCP ${TCP_PORT}`, peerPort, peerIp);
}