import dgram from "dgram";
import fs from 'fs';
import EventEmitter from "events";

const emmiter = new EventEmitter();

export class PeerUDP{
    constructor(nombreUser){
        this.nombreUser = nombreUser;

        this.shared_folder = "C:/Users/totog/Music/Music";

        this.peerIp = null;
        this.peerUDPPort = null;

        this.punched = false;
        this.punchAttempts = 0;
        
        this.socket = dgram.createSocket("udp4");
        this.socket.bind(0, ()=>{
            console.log(`UDP puerto: ${this.socket.address().port}`);
        })

        this.socket.on("message", this.HandleMessages.bind(this));
    }

    startHello(){
        console.log("Starting hello..");
        this.socket.send(
            Buffer.from(`HELLO ${this.nombreUser}`), 4000, "18.118.150.53"
        );

        this.helloInterval = setInterval(()=>{
            this.socket.send(
                Buffer.from(`PING ${this.nombreUser}`),4000,"18.118.150.53"
            );
        },1000)
    }

    async fetchpeer(peername){
        const r = await fetch(`http://18.118.150.53:3000/peer/${peername}`);
        const data = await r.json();

        console.log(data);

        this.peerIp = data.ip;
        this.peerUDPPort = data.udp_port;

        
        // Aca le comunico al server que quiero los datos de el otro usuario
        // Cuando el server recibe ambos mensajes, envia un mensaje a los usuarios diciendo que arranquen

        this.socket.send(Buffer.from(`REQUEST ${peername} ${this.nombreUser}`), 4000, "18.118.150.53");
    }

    startPunch(){
        this.punchAttempts = 0;
        this.punched = false;

        console.log(`El puerto UDP del peer es: ${this.peerUDPPort} y su ip: ${this.peerIp}`);


        this.punchInterval = setInterval(()=>{
            if(this.punched || this.punchAttempts >=10){
                return;
            }
            this.socket.send(
                Buffer.from("PUNCH"),
                this.peerUDPPort,
                this.peerIp,
                (err)=>{
                    if(err) console.log("Error enviando punch",err)
                }
            );

            console.log(`Disparando PUNCH a ${this.peerIp}:${this.peerUDPPort} (Intento ${this.punchAttempts})`);
            this.punchAttempts++;
        },800)
    }

    // Setter
    SetFolder(folder_path){
        this.shared_folder = folder_path; 
    }
    //Getter
    ReturnFolder(){
        return this.shared_folder;
    }

    HandleMessages(msg,rinfo){
        const text = msg.toString();
        const parts = text.split(" ");
        const cmd = parts[0];
        const data = parts.slice(1).join(" ");

        if(cmd === "REQUEST_ACK"){
            this.startPunch();
        }

        if(cmd === "START_PUNCH_WITH"){
            const [_,name,port,ip] = text.split(" ");
            this.peerUDPPort=port;
            this.peerIp=ip;
            
            console.log(`El usuario ${name} quiere conectar.. Iniciando punch`);
            this.startPunch();
        }

        if(cmd === "PUNCH"){
            this.socket.send("PUNCH_ACK", rinfo.port, rinfo.address);
        }

        if(cmd === "PUNCH_ACK" && !this.punched){
            this.punched = true;
            console.log("UDP HOLE OPEN");
            emmiter.emit('hole-open');
            //this.SendMessage("Hola!!");
        }
        
        if(cmd === "MESSAGE"){
            console.log(data);
        }

        if(cmd === "LIST-FILES"){
            const folder_path = "C:/Users/totog/Music/Music/Dad's rock";
            fs.readdir(folder_path, (err, files)=>{
                if(err) {
                    console.log(err);
                    return
                }

                for(const file of files){
                    this.socket.send(Buffer.from(`FILE ${file}`), this.peerUDPPort, this.peerIp);
                }
            })
        }

        if(cmd.startsWith("FILE")){
            console.log(data);
        }
    }

    SendMessage(message){
        this.socket.send(Buffer.from(`MESSAGE ${message}`), this.peerUDPPort,this.peerIp);
    }

    ListFiles(){
        this.socket.send(Buffer.from("LIST-FILES"), this.peerUDPPort,this.peerIp);
    }
}
