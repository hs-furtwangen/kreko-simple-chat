"use strict";
var simpleChat;
(function (simpleChat) {
    const socket = new WebSocket("ws://localhost:8000/");
    // client id retrieved from server
    let id = null;
    let messageList = null;
    // get div elements of client id, message list and message field
    const idDiv = document.getElementById("id");
    const messageListDiv = document.getElementById("message-list");
    const textField = document.getElementById("text-field");
    // listen to connection open
    // socket.addEventListener("open", (event) => {
    // });
    // listen to message from server
    socket.addEventListener("message", (event) => {
        const carrier = JSON.parse(event.data);
        const selector = carrier.selector;
        const data = carrier.data;
        switch (selector) {
            case "init": {
                const initMessage = JSON.parse(data);
                // store id and message list
                id = initMessage.id;
                messageList = initMessage.messages;
                // display id and message list
                idDiv.innerHTML = `#${id}`;
                displayMessageList();
                break;
            }
            case "text-message": {
                const textMessage = JSON.parse(data);
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
    textField.addEventListener("keyup", function (evt) {
        if (evt.key === "Enter") {
            sendText();
        }
    });
    document.body.addEventListener("touchstart", sendText);
    function displayMessageList() {
        let htmlStr = "<table>";
        // compose list of text paragraphs from message list
        for (let message of messageList) {
            const textClass = (message.client == id) ? "self" : "others";
            const idStr = (message.client == id) ? "myself" : `#${message.client}`;
            htmlStr += `<tr class=${textClass}><td class="col-0">${idStr}:</td><td>${message.text}</td></tr>`;
        }
        htmlStr += "</table>";
        // display message list in div in HTML
        messageListDiv.innerHTML = htmlStr;
        window.scrollTo(0, document.body.scrollHeight);
    }
    function sendText() {
        const text = textField.value;
        if (text === "#clear") {
            // clear chat
            const clearCarrier = {
                selector: "clear",
            };
            socket.send(JSON.stringify(clearCarrier));
        }
        else if (text !== "") {
            const message = {
                client: id,
                text: text,
            };
            const textCarrier = {
                selector: "text-message",
                data: JSON.stringify(message),
            };
            socket.send(JSON.stringify(textCarrier));
        }
        textField.value = ""; // clear message text field
    }
})(simpleChat || (simpleChat = {}));
//# sourceMappingURL=client.js.map