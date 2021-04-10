// const socket: WebSocket = new WebSocket("ws://localhost:8000/");
const socket: WebSocket = new WebSocket("wss://counter-pads.herokuapp.com/");

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

// client id retrieved from server
let id: number = null;
let messageList: TextMessage[] = null;

// get div elements of client id, message list and message field
const idDiv: HTMLDivElement = <HTMLDivElement>document.getElementById("id");
const messageListDiv: HTMLDivElement = <HTMLInputElement>document.getElementById("message-list");
const textField: HTMLInputElement = <HTMLInputElement>document.getElementById("text-field");

// listen to connection open
// socket.addEventListener("open", (event) => {
// });

// listen to message from server
socket.addEventListener("message", (event) => {
  const carrier: CarrierMessage = <CarrierMessage>JSON.parse(event.data);
  const selector: string = carrier.selector;
  const data: string = carrier.data;

  switch (selector) {
    case "init": {
      const initMessage: InitMessage = <InitMessage>JSON.parse(data);

      // store id and message list
      id = initMessage.id;
      messageList = initMessage.messages;

      // display id and message list
      idDiv.innerHTML = `#${id}`;
      displayMessageList();
      break;
    }

    case "text-message": {
      const textMessage: TextMessage = <TextMessage>JSON.parse(<string>data);
      messageList.push(textMessage); // add message to message list
      displayMessageList();
      break;
    }

    case "clear":
      messageList = []; // clear message list
      displayMessageList();
      break;
  }
});

// send text message on enter key
textField.addEventListener("keyup", function (evt: KeyboardEvent): void {
  if (evt.key === "Enter") {
    sendText();
  }
});

document.body.addEventListener("touchstart", sendText);

function displayMessageList(): void {
  let htmlStr: string = "<table>";

  // compose list of text paragraphs from message list
  for (let message of messageList) {
    const textClass: string = (message.client == id) ? "self" : "others";
    const idStr: string = (message.client == id) ? "myself" : `#${message.client}`;
    htmlStr += `<tr class=${textClass}><td class="col-0">${idStr}:</td><td>${message.text}</td></tr>`;
  }

  htmlStr += "</table>";
  // display message list in div in HTML
  messageListDiv.innerHTML = htmlStr;

  window.scrollTo(0, document.body.scrollHeight);
}

function sendText(): void {
  const text: string = textField.value;

  if (text === "#clear") {
    // clear chat
    const clearCarrier: CarrierMessage = {
      selector: "clear",
    };

    socket.send(JSON.stringify(clearCarrier));
  } else if (text !== "") {
    const message: TextMessage = {
      client: id,
      text: text,
    };

    const textCarrier: CarrierMessage = {
      selector: "text-message",
      data: JSON.stringify(message),
    };

    socket.send(JSON.stringify(textCarrier));
  }

  textField.value = ""; // clear message text field
}
