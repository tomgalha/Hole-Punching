import {HandleOptions} from './main.js';
import * as readline from 'node:readline/promises';
import {stdin as input,stdout as output} from 'node:process';
const rl = readline.createInterface({input,output});

export const colors = {
    cyan: '\x1b[36m',
    green: '\x1b[32m',
    reset: '\x1b[0m',
    dim: '\x1b[2m'
};

export async function Header(users_online, number_users_online){
    console.log(`${colors.cyan}┌───────────────────────────────────────────────────────────┐${colors.reset}`);
    console.log(`${colors.cyan}│${colors.reset}  VIA MUSIC P2P - [ Peers: ${number_users_online} ] [ Status: ${colors.green}ONLINE ${colors.reset}]          ${colors.cyan}│${colors.reset}`);
    console.log(`${colors.cyan}├───────┬───────────────────────────────────────────────────┤${colors.reset}`);

    for(let i=0; i<number_users_online;i++){
        const nombreRaw= users_online.users[i][0];
        const n_files = users_online.users[i][1].number_of_files;
        const nombreFijo = nombreRaw.padEnd(5);
        console.log(`${colors.cyan}│${colors.reset} ${nombreFijo} ${colors.cyan}│${colors.reset}  Files shared: ${n_files}`);
    }

    Bottom();
}


async function Bottom(){
    console.log(`${colors.cyan}├───────┴───────────────────────────────────────────────────┤${colors.reset}`);
    console.log(`${colors.cyan}│${colors.reset} [1] Search user  [2] Refresh  [3] Set folder  [5] Exit    ${colors.cyan}│${colors.reset}`);
    console.log(`${colors.cyan}└───────────────────────────────────────────────────────────┘${colors.reset}`);

    const answer = await rl.question('> ');
    HandleOptions(answer);
}

export async function GetUsername(){
  const username = await rl.question('Insert username: ');
  return username;
}


export async function AskUsername(){
  const username = await rl.question('Insert username: ');
  return username;
}

export async function OptionsUsername(){
  console.log(`${colors.cyan}1${colors.reset}-Chat`);
  console.log(`${colors.cyan}2${colors.reset}-List files`);
  
  const answer = await rl.question('> ');
  return answer;
}

export async function HandleMessage(){
  const message = await rl.question('You: ');
  return message;
}

export async function RequestFolderPath(){
  const folderpath = await rl.question('Write the folder path: ');
  return folderpath;
}

export async function TwoOptions(option1, option2){
  console.log(option1);
  console.log(option2);

  const answer = await rl.question('> ');
  return answer;
}

