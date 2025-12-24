import { SendMessages, FetchData, HandleMessages,OnlineUsers} from "./Client.js";
import readline from "readline";
import { peerEvents, StartTCPServer,RequestFile } from "../PeerTCP/TCPConnection.js";

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
OnlineUsers();

function MainClient(){

    rl.question("\nIngrese el numero de puerto TCP: ", tcp_port_ans =>{
        StartTCPServer(tcp_port_ans);

        HandleMessages();

    rl.question("Ingrese su nombre de usuario: ", (nombre) => {
        SendMessages(nombre.toLocaleLowerCase(), tcp_port_ans);  // HELLO + PING
        

        rl.question("Ingrese el nombre del usuario para ver sus temas: ", (peerName) => {
            FetchData(peerName.toLowerCase());    

            peerEvents.once("LIST_READY", ()=>{
                rl.question("1- Descargar archivo \n2- Descargar carpeta: ", ans =>{
                    if(ans == 1){
                        rl.question("Ingrese el nombre del archivo: ", filename =>{
                            RequestFile(filename);
                           // MainClient();
                        })
                    }else if(ans ==2){
                        // Download Folder
                    }
                })
            })
        });
    });
    })
}

MainClient();

