import * as WebSocket from "ws";

// carrier message interface
interface CarrierMessage {
  selector: string;
  data?: string;
}

// client text message interface
interface TextMessage {
  client: number;
  text: string;
}

// client text message interface
interface InitMessage {
  id: number;
  messages: TextMessage[];
}

// define count to give out different client ids
let clientIdCounter: number = 0;

// get port from shell or set default (8000)
const port: number = Number(process.env.PORT) || 8000;

// create WebSocket server
const server: WebSocket.Server = new WebSocket.Server({ port: port });

// list of client messages
const messageList: TextMessage[] = [];

// list of connected sockets
const clientSockets: Set<WebSocket> = new Set();

server.on("connection", (socket) => {
  clientSockets.add(socket);

  const initMessageObj: InitMessage = {
    id: ++clientIdCounter,
    messages: messageList,
  };

  const initCarrierMessage: CarrierMessage = {
    selector: "init",
    data: JSON.stringify(initMessageObj),
  };

  socket.send(JSON.stringify(initCarrierMessage));

  socket.on("message", (message) => {
    const carrierMessage: CarrierMessage = <CarrierMessage>JSON.parse(<string>message);
    const selector: string = carrierMessage.selector;
    const data: string = carrierMessage.data;

    switch (selector) {
      case "text-message": {
        const textMessage: TextMessage = <TextMessage>JSON.parse(<string>data);

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
