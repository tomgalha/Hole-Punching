const colors = {
    cyan: '\x1b[36m',
    green: '\x1b[32m',
    reset: '\x1b[0m',
    dim: '\x1b[2m'
};


async function getUsersOnline(){
    const data = await fetch("http://18.118.150.53:3000/usersConnected");
    const json = await data.json();
    console.log(json);
}


function Header(){
    getUsersOnline();
    console.log(`${colors.cyan}┌───────────────────────────────────────────────────────────┐${colors.reset}`);
    console.log(`${colors.cyan}│${colors.reset}  VIA MUSIC P2P - [ Peers: 0 ] [ Status: ONLINE ]      ${colors.cyan}│${colors.reset}`);
    console.log(`${colors.cyan}├───────┬───────────────────────────────────────────────────┤${colors.reset}`);
}
