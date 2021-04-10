"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const WebSocket = require("ws");
// define count to give out different client ids
let clientIdCounter = 0;
// get port from shell or set default (8000)
const port = Number(process.env.PORT) || 8000;
// create WebSocket server
const server = new WebSocket.Server({ port: port });
// list of client messages
const messageList = [];
// list of connected sockets
const clientSockets = new Set();
server.on("connection", (socket) => {
    clientSockets.add(socket);
    const initMessageObj = {
        id: ++clientIdCounter,
        messages: messageList,
    };
    const initCarrierMessage = {
        selector: "init",
        data: JSON.stringify(initMessageObj),
    };
    socket.send(JSON.stringify(initCarrierMessage));
    socket.on("message", (message) => {
        const carrierMessage = JSON.parse(message);
        const selector = carrierMessage.selector;
        const data = carrierMessage.data;
        switch (selector) {
            case "text-message": {
                const textMessage = JSON.parse(data);
                // add message to message list
                messageList.push(textMessage);
                console.log(`#${textMessage.client}: "${textMessage.text}"`);
                // broadcast message to all connected clients
                for (let socket of clientSockets) {
                    socket.send(message);
                }
                break;
            }
            case "clear": {
                messageList.length = 0;
                // send clear message to all connected clients
                for (let socket of clientSockets) {
                    socket.send(message);
                }
                break;
            }
            default:
                break;
        }
    });
    socket.on("close", () => {
        clientSockets.delete(socket);
    });
});
//# sourceMappingURL=server.js.map