import { SendMessages, FetchData, HandleMessages} from "./Client.js";
import readline from "readline";
import { peerEvents, StartTCPServer } from "../PeerTCP/TCPConnection.js";

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

rl.question("Ingrese el numero de puerto TCP: ", ans =>{
    StartTCPServer(ans);

    HandleMessages();

rl.question("Ingrese su nombre de usuario: ", (nombre) => {
    SendMessages(nombre.toLocaleLowerCase());  // HELLO + PING
    

    rl.question("Ingrese el nombre del usuario para ver sus temas: ", (peerName) => {
        FetchData(peerName.toLowerCase());    

        peerEvents.once("LIST_READY", ()=>{
            rl.question("1- Descargar archivo \n2- Descargar carpeta: ", ans =>{
                if(ans == 1){
                    rl.question("Ingrese el nombre del archivo: ", filename =>{
                        //RequestFile(filename);
                        //Socket.write(`DOWNLOADFILE ${filename}`)
                        // Download File
                    })
                }else if(ans ==2){
                    // Download Folder
                }
            })
        })
    });
});
})


