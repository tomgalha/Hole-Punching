import { UDPMESSAGE, FetchData, HandleMessages,OnlineUsers} from "./Client.js";
import readline from "readline";
import { peerEvents, StartTCPServer,RequestFile, RequestFolder } from "../PeerTCP/TCPConnection.js";

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

let tcp_port_ans;
let username;

function MainClient(){
    InitSTP();
}

function InitSTP(){
    rl.question("\nIngrese el numero de puerto TCP: ", ans =>{
        tcp_port_ans = ans;
        StartTCPServer(ans);
        HandleMessages();

        rl.question("Ingrese su nombre de usuario: ", (nombre) => { // HELLO + PING
            username = nombre.toLowerCase();
            UDPMESSAGE(username, tcp_port_ans);
            Menu(); 
        })
    });
}

function Menu(){
    OnlineUsers();
    
    rl.question("Ingrese el nombre del usuario para ver sus temas: ", (peerName) => {
        FetchData(peerName.toLowerCase());    

        peerEvents.once("LIST_READY", ()=>{
            rl.question("1- Descargar archivo \n2- Descargar carpeta: ", ans =>{
                   if(ans == 1){
                       rl.question("Ingrese el nombre del archivo: ", filename =>{
                           RequestFile(filename);
                           peerEvents.once("FILESENT",()=>{
                                Menu();
                           })
                           // MainClient();
                       })
                   }else if(ans ==2){
                        RequestFolder();
                       // Download Folder
                   }
               })
           })
       });        
}

MainClient();

