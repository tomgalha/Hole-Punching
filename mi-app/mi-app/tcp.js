import net from "net";

const TCP_PORT = 5001;


const server = net.createServer(socket => {
    console.log("Cliente TCP contectado");

    socket.write("FILE_START\N");

    socket.write("Hola desde el peer que tiene el archivo\n");

    socket.end();
})

server.listen(TCP_PORT, () =>{
    console.log("TCP escuchando en: " + TCP_PORT);
})