import { SendMessages, FetchData, HandleMessages, StartTCPServer, ConnectTCP } from "./Client.js";
import readline from "readline";

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

rl.question("Ingrese su nombre de usuario: ", (nombre) => {
    SendMessages(nombre);  // HELLO + PING

    HandleMessages((msg, peerIp, peerPort) => {
        // Si recibo OFFER_TCP, me conecto
        if(msg.startsWith("OFFER_TCP")) {
            const port = parseInt(msg.split(" ")[1]);
            ConnectTCP(peerIp, port);
        }
    });

    rl.question("Ingrese el nombre del usuario para ver sus temas: ", (peerName) => {
        FetchData(peerName, (peerIp, peerPort) => {
            // Una vez que tenemos al peer, hacemos punch y ofrecemos TCP
            StartPunch(peerIp, peerPort);
            StartTCPServer(5001); // Servidor TCP propio
        });
    });
});
