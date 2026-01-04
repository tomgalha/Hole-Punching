import dgram from 'dgram';
import express from 'express';

const udp = dgram.createSocket('udp4');
const app = express();

const HTTP_PORT = 3000;
const UDP_PORT = 4000;

const onlineUsers = new Map();

// HTTP
app.get('/', (req, res) => {
  res.send('OK');
});

app.get('/peer/:userId', (req, res) => {
  const user = onlineUsers.get(req.params.userId);
  if (!user) {
    return res.status(404).json({ error: 'offline' });
  }
  res.json({ ip: user.ip, udp_port: user.udp_port });
});

app.listen(HTTP_PORT, () => {
  console.log('HTTP en', HTTP_PORT);
});

app.get('/usersConnected', (req, res) => {
  res.json([...onlineUsers]);
});

// UDP
udp.on('message', (msg, rinfo) => {
  const text = msg.toString();
  const [cmd, targetUser, senderUser] = text.split(' ');

  // SOLO presencia
  if (cmd === 'HELLO' && targetUser) {
    const n_of_files = text.split(' ')[2]; 

    onlineUsers.set(targetUser, {
      ip: rinfo.address,
      udp_port: rinfo.port,
      number_of_files: n_of_files,
      lastSeen: Date.now()
    });
    console.log('HELLO', targetUser);
  }

  if (cmd === 'REQUEST') {
    // Estructura: "REQUEST targetUser senderUser"

    const target = onlineUsers.get(targetUser);
    const sender = onlineUsers.get(senderUser);

    if (target && sender) {
        console.log(`Conectando ${senderUser} -> ${targetUser}`);

        udp.send(Buffer.from('REQUEST_ACK'), rinfo.port, rinfo.address);

        const wakeUpMsg = Buffer.from(`START_PUNCH_WITH ${senderUser} ${sender.udp_port} ${sender.ip}`);
        
        udp.send(wakeUpMsg, target.udp_port, target.ip);
    } else {
        console.log('Usuario no encontrado o desconectado');
    }
}

  if (cmd === 'PING' && targetUser) {
    const user = onlineUsers.get(targetUser);
    if (user) {
      user.lastSeen = Date.now();
    }
  }
  if(cmd === 'CHANGE_FOLDER'){
    const [_,userName, newSize] = text.split(' ');
    console.log(userName);
    console.log(newSize);
    onlineUsers.get(userName).number_of_files = newSize;
  }
});

// limpieza
setInterval(() => {
  const now = Date.now();
  for (const [userId, user] of onlineUsers) {
    if (now - user.lastSeen > 9000) {
      onlineUsers.delete(userId);
      console.log('OFFLINE', userId);
    }
  }
}, 3000);

udp.bind(UDP_PORT, () => {
  console.log('UDP en', UDP_PORT);
});
