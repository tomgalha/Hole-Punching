import dgram from "dgram";
import {ConnectTCP} from "../PeerTCP/TCPConnection.js"


export class PeerUDP{
    constructor(nombreUser, tcp_port){
        this.nombreUser = nombreUser;
        this.tcp_port = tcp_port;

        this.peerIp = null;
        this.peerUDPPort = null;
        this.peerTCPPort = null;

        this.punched = false;
        this.punchAttempts = 0;
        
        this.socket = dgram.createSocket("udp4");
        this.socket.bind(0, ()=>{
            console.log(`UDP puerto: ${this.socket.address().port}`);
        })

        this.socket.on("message", this.HandleMessages.bind(this));
    }

    startHello(){
        this.socket.send(
            Buffer.from(`HELLO ${this.nombreUser} ${this.tcp_port}`), 4000, "127.0.0.1"
        );

        this.helloInterval = setInterval(()=>{
            this.socket.send(
                Buffer.from(`PING ${this.nombreUser}`),4000,"127.0.0.1"
            );
        },1000)
    }

    async fetchpeer(peername){
        const r = await fetch(`http://localhost:3000/peer/${peername}`);
        const data = await r.json();

        console.log("EL NOMBRE DEL PEER ES: " + peername);

        this.peerIp = data.ip;
        this.peerUDPPort = data.udp_port;
        this.peerTCPPort = data.tcp_port;



        this.startPunch();
    }

    startPunch(){
        this.punchAttempts = 0;
        this.punched = false;

        this.punchInterval = setInterval(()=>{
            if(this.punched || this.punchAttempts >=10){
                return;
            }


            this.socket.send(
                Buffer.from("PUNCH"),
                Number(this.peerUDPPort),
                this.peerIp
            );
            this.punchAttempts++;
            console.log("PUNCH intento", this.punchAttempts);

        },800)
    }

    HandleMessages(msg,rinfo){
        const text = msg.toString();

        if(text === "PUNCH"){
            this.socket.send("PUNCH_ACK", this.peerUDPPort, this.peerIp);
        }

        if(text === "PUNCH_ACK" && !this.punched){
            this.punched = true;
            console.log("UDP HOLE OPEN");

            ConnectTCP(this.peerTCPPort, this.peerIp);
        }
    }
}
