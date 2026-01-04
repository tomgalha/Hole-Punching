import { PeerUDP } from "./p2p-core/PeerUDP/Client.js";
import {emmiter} from "./p2p-core/PeerUDP/Client.js";
import os from 'os';
import {Header,colors, GetUsername, AskUsername, OptionsUsername, HandleMessage, RequestFolderPath} from "./visuals.js";

let peer = null;

async function getUsersOnline(){
    const data = await fetch("http://18.118.150.53:3000/usersConnected");
    const json = await data.json();
    return {
        online_lenght: json.length,
        users : json
    }
}

async function RegisterUser(){
    const username = await GetUsername();
    // const username = await rl.question("Insert username: ");
    peer = new PeerUDP(username);
    peer.SetFolder(`C:/Users/${os.userInfo().username}/Music/Music/Dad's rock`);
    peer.startHello();
}

await RegisterUser();

async function Main(){
  const usersOnline = await getUsersOnline();
  const number_users_online = usersOnline.online_lenght;
  Header(usersOnline, number_users_online);
}

export async function HandleOptions(option){
    if(option == 1){
        const username = await AskUsername();
        const answer = await OptionsUsername();
        
        emmiter.once('list-ready', ()=>{
          console.log("lista emitida.")
          Main();
        });
        emmiter.once('hole-open', async()=>{
          if(answer == 1){
            while(true){
              const message = await HandleMessage();
  
             if(message === "/exit"){
               Main();
               return
             }
              peer.SendMessage(message);
           }
          }else if(answer == 2){
             // Un await quizas;
             // peer.ListFiles();
             peer.ListFiles();
              // Actualmente, luego van a tner que estar un handle 
          }
        })
        await peer.fetchpeer(username)
    }
    if(option == 2){
        console.clear();
        Main();
    }
    if(option == 3){
        console.log(`Current folder: ${peer.ReturnFolder()}`);
        const folder_path = await RequestFolderPath();
        const setFolder = peer.SetFolder(folder_path);

        if(setFolder){
          console.log(`Folder updated to: ${peer.ReturnFolder()}`)
          peer.NotifyFolderServer();
        }else{
          console.log("No existe esa carpeta!")
        };
        Main();
    }

    if(option == 5){
        process.exit();
    }
}

Main();
