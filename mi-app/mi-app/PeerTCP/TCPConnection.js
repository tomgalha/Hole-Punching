import fs from "fs";
import net from "net";

// --- TCP como requester ---
export function ConnectTCP(PORT, peerIp){
    const socketTCP = net.connect(PORT, peerIp, () => {
        console.log("Conectado por TCP al owner");

        socketTCP.on("data", data => {
            console.log("Archivos del owner:\n", data.toString());
        });
    });
}

// --- TCP como owner ---
export function StartTCPServer(TCP_PORT){
    const server = net.createServer(socket => {
        console.log("Cliente TCP conectado (owner)");
        //Listar archivos
        const files = fs.readdirSync("C:/Users/totog/Music/Music/Dad's rock");
        files.forEach(f => socket.write(f + "\n"));
        socket.end();
    });

    server.listen(TCP_PORT, () => console.log("TCP escuchando en puerto", TCP_PORT));
}