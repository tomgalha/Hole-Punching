import { PeerUDP } from "./p2p-core/PeerUDP/Client.js";
import * as readline from "node:readline/promises";
import {stdin as input,stdout as output} from "node:process";

import {emmiter} from "./p2p-core/PeerUDP/Client.js";

const rl = readline.createInterface({input,output});

let peer = null;

const colors = {
    cyan: '\x1b[36m',
    green: '\x1b[32m',
    reset: '\x1b[0m',
    dim: '\x1b[2m'
};


async function getUsersOnline(){
    const data = await fetch("http://18.118.150.53:3000/usersConnected");
    const json = await data.json();
    return {
        online_lenght: json.length,
        users : json
    }
}

async function RegisterUser(){
    const username = await rl.question("Insert username: ");
    peer = new PeerUDP(username);
    peer.startHello();
}


async function Header(){
    await RegisterUser();
    const users_online = await getUsersOnline();
    const number_users_online = users_online.online_lenght;

    console.log(`${colors.cyan}┌───────────────────────────────────────────────────────────┐${colors.reset}`);
    console.log(`${colors.cyan}│${colors.reset}  VIA MUSIC P2P - [ Peers: ${number_users_online} ] [ Status: ONLINE ]          ${colors.cyan}│${colors.reset}`);
    console.log(`${colors.cyan}├───────┬───────────────────────────────────────────────────┤${colors.reset}`);

    for(let i=0; i<number_users_online;i++){
        const nombreRaw= users_online.users[i][0];
        const nombreFijo = nombreRaw.padEnd(5);
        console.log(`${colors.cyan}│${colors.reset} ${nombreFijo} ${colors.cyan}│${colors.reset} `);
    }

    Bottom();
}


async function Bottom(){
    console.log(`${colors.cyan}├───────┴───────────────────────────────────────────────────┤${colors.reset}`);
    console.log(`${colors.cyan}│${colors.reset} [1] Search user  [2] Refresh  [3] Files  [5] Exit         ${colors.cyan}│${colors.reset}`);
    console.log(`${colors.cyan}└───────────────────────────────────────────────────────────┘${colors.reset}`);

    const answer = await rl.question("> ");
    HandleOptions(answer);
}

async function HandleOptions(option){
    if(option == 1){
        const username = await rl.question("Insert username: ");
      //  const peer_data = await peer.fetchpeer(username);

      const answer = await rl.question("> ");
        emmiter.once('hole-open', async()=>{
            if(answer==1){
                while(true){
                    const message =  await rl.question("You: ");
                    peer.SendMessage(message);
                }
            }  
        })

        await peer.fetchpeer(username)

      console.log(`${colors.cyan}1${colors.reset}-Chat`);
      console.log(`${colors.cyan}1${colors.reset}-List files`);


      
      
    }
}

Header();