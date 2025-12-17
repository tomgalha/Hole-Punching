import { SendMessages, FetchData, HandleMessages, StartTCPServer, ConnectTCP, StartPunch} from "./Client.js";
import readline from "readline";

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

rl.question("Ingrese su nombre de usuario: ", (nombre) => {
    SendMessages(nombre);  // HELLO + PING
    HandleMessages();
    
    rl.question("Ingrese el nombre del usuario para ver sus temas: ", (peerName) => {
        FetchData(peerName);
        
    });
});
