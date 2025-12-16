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
  res.json({ ip: user.ip, port: user.port });
});

app.listen(HTTP_PORT, () => {
  console.log("HTTP en", HTTP_PORT);
});

// UDP
udp.on("message", (msg, rinfo) => {
  const text = msg.toString();
  const [cmd, userId] = text.split(" ");

  // SOLO presencia
  if (cmd === "HELLO" && userId) {
    onlineUsers.set(userId, {
      ip: rinfo.address,
      port: rinfo.port,
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
    if (now - user.lastSeen > 90_000) {
      onlineUsers.delete(userId);
      console.log("OFFLINE", userId);
    }
  }
}, 30_000);

udp.bind(UDP_PORT, () => {
  console.log("UDP en", UDP_PORT);
});
