const WebSocket = require("ws");
const wss = new WebSocket.Server({ port: 3000 });

let players = {};

wss.on("connection", ws => {
    const id = Math.random().toString(36).substr(2, 9);
    players[id] = { x: 0, z: 0 };

    ws.send(JSON.stringify({ type: "init", id }));

    ws.on("message", msg => {
        const data = JSON.parse(msg);

        if (data.type === "move") {
            players[id] = data.pos;
        }

        if (data.type === "chat") {
            broadcast({ type: "chat", msg: data.msg });
        }
    });

    ws.on("close", () => {
        delete players[id];
    });
});

function broadcast(data) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
                type: "update",
                players
            }));
        }
    });
}

setInterval(() => {
    broadcast({});
}, 50);

console.log("Server running on ws://localhost:3000");
