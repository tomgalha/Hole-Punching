const log = (msg) => {
  document.getElementById("log").textContent += msg + "\n";
};
const usernameInput = document.getElementById('username');
const acceptBtn = document.getElementById('send-username');
const usernameOwnerInput = document.getElementById('username-owner');
const acceptOwnerBtn = document.getElementById('send-username-owner');
const fetchDataBtn = document.getElementById('fetch-data');

acceptBtn.onclick = () =>{
    const username = usernameInput.value.trim();
    if(!username) return;

    window.p2p.setUsername(username);
    usernameInput.disabled = true;
    acceptBtn.disabled = true;
}

acceptOwnerBtn.onclick = ()=>{
    const usernameOwner = usernameOwnerInput.value.trim();
    if(!usernameOwner) return;

    window.p2p.setUsernameOwner(usernameOwner);
}

fetchDataBtn.onclick = ()=>{
    window.p2p.fetchData();
}