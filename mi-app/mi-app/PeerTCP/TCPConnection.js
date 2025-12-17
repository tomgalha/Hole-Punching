import fs from "fs";
import net from "net";

// --- TCP como requester ---
export function ConnectTCP(PORT, peerIp){
    const socketTCP = net.connect(PORT, peerIp, () => {
        console.log("Conectado por TCP al owner");

        console.log("Archivos del owner: ");
        socketTCP.on("data", data => {
            console.log(data.toString());
        });
    });
}

// --- TCP como owner ---
export function StartTCPServer(TCP_PORT){
    const server = net.createServer(socket => {
        console.log("Cliente TCP conectado (owner)");
        //Listar archivos
        const BasePath = "C:/Users/totog/Music/Music/Dad's rock";
        const files = fs.readdirSync(BasePath);

        files.forEach(f => {
            const fullPath = `${BasePath}/${f}`;
            const stats = fs.statSync(fullPath);

            socket.write(f + "\n");
            socket.write("File size: " + (stats.size / (1024 * 1024)).toFixed(2)  +" MB"+ "\n");
        });
        socket.end();
    });

    server.listen(TCP_PORT, () => console.log("TCP escuchando en puerto", TCP_PORT));
}