import dgram from "dgram";
import express from "express";

const udp = dgram.createSocket("udp4");
const app = express();

const HTTP_PORT = 3000;
const UDP_PORT = 4000;

const onlineUsers = new Map();

// HTTP
app.get("/", (req, res) => {
  res.send("OK");
});

app.get("/peer/:userId", (req, res) => {
  const user = onlineUsers.get(req.params.userId);
  if (!user) {
    return res.status(404).json({ error: "offline" });
  }
  res.json({ ip: user.ip, udp_port: user.udp_port, tcp_port: user.tcp_port });
});

app.listen(HTTP_PORT, () => {
  console.log("HTTP en", HTTP_PORT);
});

app.get('/usersConnected', (req, res) => {
  res.json([...onlineUsers]);
});

// UDP
udp.on("message", (msg, rinfo) => {
  const text = msg.toString();
  const [cmd, userId, userTCP] = text.split(" ");

  // SOLO presencia
  if (cmd === "HELLO" && userId && userTCP) {
    onlineUsers.set(userId, {
      ip: rinfo.address,
      udp_port: rinfo.port,
      tcp_port: userTCP,
      lastSeen: Date.now()
    });
    console.log("HELLO", userId);
  }

  if (cmd === "PING" && userId) {
    const user = onlineUsers.get(userId);
    if (user) {
      user.lastSeen = Date.now();
    }
  }
});

// limpieza
setInterval(() => {
  const now = Date.now();
  for (const [userId, user] of onlineUsers) {
    if (now - user.lastSeen > 9000) {
      onlineUsers.delete(userId);
      console.log("OFFLINE", userId);
    }
  }
}, 3000);

udp.bind(UDP_PORT, () => {
  console.log("UDP en", UDP_PORT);
});
