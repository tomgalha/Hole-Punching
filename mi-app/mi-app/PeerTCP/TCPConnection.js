import fs from "fs";
import net from "net";
import { EventEmitter } from "events";

export const peerEvents = new EventEmitter();

// --- TCP como requester ---
export function ConnectTCP(PORT, peerIp){
        const socketTCP = net.connect(PORT, peerIp, () => {
        console.log("Conectado por TCP al owner");

        console.log("Archivos del owner: ");
        
        socketTCP.write("LIST\n")

        socketTCP.on("data",data => {
            if(data === "ENDLIST"){ peerEvents.emit("LIST_READY")}else {
                console.log(data.toString());
            }
          //  peerEvents.on("")
        });
    });
}

export function RequestFile(filename){
    socketTCP.write(`DOWNLOADFILE ${filename}`)
} 

// --- TCP como owner ---
export function StartTCPServer(TCP_PORT){
    const server = net.createServer(socket => {
        console.log("Cliente TCP conectado (owner)");
        socket.on("data", data =>{


            const msg = data.toString().trim();

            const [command, ...rest] = msg.split(" ");
            const filename = rest.join(" "); 

            if(command === "LIST"){
            //Listar archivos
                const BasePath = "C:/Users/totog/Music/Music/Dad's rock";
                const files = fs.readdirSync(BasePath);

                let fileNumber = 1;

                files.forEach(f => {
                    const fullPath = `${BasePath}/${f}`;
                    const stats = fs.statSync(fullPath);

                    socket.write(fileNumber + ":" + f + "\n");
                    socket.write("File size: " + (stats.size / (1024 * 1024)).toFixed(2)  +" MB"+ "\n");
                    fileNumber++;
                });

                socket.write("ENDLIST");
            }
            if(command==="DOWNLOADFILE"){
                const song = filename.toLowerCase().replaceAll(" ", "");
                console.log("El requester quiere la cancion: "+ song);
                DownloadFile(song, BasePath, socket);
            }
            if(msg ==="DOWNLOADFOLDER"){
                console.log("El cliente quiere toda la carpeta");
            }
        })

       // socket.end()
    });

    server.listen(TCP_PORT, () => console.log("TCP escuchando en puerto", TCP_PORT));
}

function DownloadFile(filename, BasePath, socket){
    const filePath = `${BasePath}/${filename}`
    if(!fs.existsSync(filePath)) {
        socket.write("Error, no existe el archivo :(")
        socket.end()
    }
    
    const size = fs.statSync(filePath).size;
    socket.write(`FILESIZE ${size}`);
    const readStream = fs.createReadStream(filePath).pipe(socket)
}