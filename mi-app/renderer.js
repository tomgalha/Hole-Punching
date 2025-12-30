const log = (msg) => {
  document.getElementById("log").textContent += msg + "\n";
};
const usernameInput = document.getElementById('username');
const acceptBtn = document.getElementById('send-username');
const usernameOwnerInput = document.getElementById('username-owner');
const acceptOwnerBtn = document.getElementById('send-username-owner');
const fetchDataBtn = document.getElementById('fetch-data');

const messageInput = document.getElementById('message');
const messageBtn = document.getElementById('send-message');

const listFilesBtn = document.getElementById('list_files');

acceptBtn.onclick = () =>{
    const username = usernameInput.value.replace(" ","");
    if(!username) return;

    window.p2p.setUsername(username);
    usernameInput.disabled = true;
    acceptBtn.disabled = true;
}

acceptOwnerBtn.onclick = ()=>{
    const usernameOwner = usernameOwnerInput.value.replace(" ","");
    if(!usernameOwner) return;

    window.p2p.setUsernameOwner(usernameOwner);
}

messageBtn.onclick = ()=>{
    const message = messageInput.value;
    
    window.p2p.sendMessage(message);
}


fetchDataBtn.onclick = ()=>{
    window.p2p.fetchData();
}

listFilesBtn.onclick = ()=>{
    window.p2p.getFiles();
}

