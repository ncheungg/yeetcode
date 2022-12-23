import './sidebar.css';
import { Message, MessageType } from './types';

// TODO: replace temp variables
const user1 = 'USER1';
const message1 = 'message1';
const user2 = 'you';
const message2 = 'message2';

document.body.style.setProperty('width', '80%');

const iframe = createIFrame();
document.body.appendChild(iframe);

const main = document.createElement('main');
addSidebar();

function addSidebar() {
  addStyleSheet(iframe);

  var section = document.createElement('section');
  section.classList.add('msger');

  var header = createHeader();
  section.appendChild(header);

  var main = createMain();
  section.appendChild(main);

  var form = createForm();
  section.appendChild(form);

  iframe.contentWindow?.document.body.appendChild(section);
}

function createMessage(
  username: string,
  timestamp: Date,
  message: string,
  isIncoming: boolean = false,
  italics: boolean = false
) {
  var textDiv = document.createElement('div');
  textDiv.classList.add('msg');

  if (isIncoming) {
    // left
    textDiv.classList.add('left-msg');
  } else {
    // right
    textDiv.classList.add('right-msg');
  }

  var bubble = document.createElement('div');
  bubble.classList.add('msg-bubble');

  var info = document.createElement('div');
  info.classList.add('msg-info');

  var name = document.createElement('div');
  name.classList.add('msg-info-name');
  name.appendChild(document.createTextNode(username));

  var time = document.createElement('div');
  time.classList.add('msg-info-time');
  time.appendChild(document.createTextNode(timestamp.toLocaleTimeString()));

  info.appendChild(name);
  info.appendChild(time);

  var text = document.createElement('div');
  text.classList.add('msg-text');

  var messageText = document.createTextNode(message);
  if (italics) {
    var it = document.createElement('i');
    it.appendChild(messageText);
    text.appendChild(it);
  } else {
    text.appendChild(messageText);
  }
  bubble.appendChild(info);
  bubble.appendChild(text);

  textDiv.appendChild(bubble);

  return textDiv;
}

export function sendMessage(text: string, username: string = user2) {
  const message = createMessage(username, new Date(), text);
  main.appendChild(message);
  main.scrollTop += 500;
}

export function recieveMessage(
  text: string,
  username: string,
  timestamp: Date,
  italics: boolean = false
) {
  const message = createMessage(username, timestamp, text, true, italics);
  main.appendChild(message);
  main.scrollTop += 500;
}

function createReadyButton() {
  var form = document.createElement('form');

  var button = document.createElement('button');
  button.setAttribute('type', 'submit');
  button.classList.add('msger-send-btn');
  button.appendChild(document.createTextNode('Ready'));

  form.appendChild(button);

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const message: Message = {
      type: MessageType.Ready,
      params: {},
      ts: new Date(),
    };

    chrome.runtime.sendMessage(message);
  });
  return form;
}

function createMain() {
  main.classList.add('msger-chat');

  recieveMessage(message1, user1, new Date());
  sendMessage(message2, user2);

  return main;
}

function createForm() {
  var form = document.createElement('form');
  form.classList.add('msger-inputarea');

  var input = document.createElement('input');
  input.setAttribute('type', 'text');
  input.setAttribute('placeholder', 'Enter your message...');
  input.classList.add('msger-input');

  var button = document.createElement('button');
  button.setAttribute('type', 'submit');
  button.classList.add('msger-send-btn');
  button.appendChild(document.createTextNode('Send'));

  form.appendChild(input);
  form.appendChild(button);

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const text = input.value;
    if (!text) return;

    const message: Message = {
      type: MessageType.Message,
      params: { message: text },
      ts: new Date(),
    };

    chrome.runtime.sendMessage(message);

    sendMessage(text);

    input.value = '';
  });

  return form;
}

function createIFrame() {
  var iframe = document.createElement('iframe');
  iframe.style.setProperty('width', '20%');
  iframe.style.setProperty('height', '100%');
  iframe.style.setProperty('top', '0px');
  iframe.style.setProperty('right', '0px');
  iframe.style.setProperty('zIndex', '9000000000000000000');
  iframe.style.setProperty('position', 'fixed');
  return iframe;
}

function createHeader() {
  var header = document.createElement('header');
  header.classList.add('msger-header');

  var divTitle = document.createElement('div');
  divTitle.classList.add('msger-header-title');
  divTitle.appendChild(document.createTextNode('Yeetcode'));

  var button = createReadyButton();

  var divLink = document.createElement('div');
  divLink.classList.add('msger-header-options');
  divLink.appendChild(button);

  header.appendChild(divTitle);
  header.appendChild(divLink);

  return header;
}

function addStyleSheet(iframe: HTMLIFrameElement) {
  var style = document.createElement('style');

  const cssRules = `
      :root {
      --body-bg: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      --msger-bg: #fff;
      --border: 2px solid #ddd;
      --left-msg-bg: #ececec;
      --right-msg-bg: #579ffb;
      }
      
      *,
      *:before,
      *:after {
      margin: 0;
      padding: 0;
      box-sizing: inherit;
      }
      
      body {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      background-image: var(--body-bg);
      font-family: Helvetica, sans-serif;
      }
      
      .msger {
          display: flex;
          flex-flow: column wrap;
          justify-content: space-between;
          width: 100%;
          max-width: 867px;
          margin: 25px 10px;
          height: calc(100% - 50px);
          border: var(--border);
          border-radius: 5px;
          background: var(--msger-bg);
          box-shadow: 0 15px 15px -5px rgba(0, 0, 0, 0.2);
      }
      
      .msger-header {
          display: flex;
          justify-content: space-between;
          padding: 10px;
          border-bottom: var(--border);
          background: #eee;
          color: #666;
      }
      
      .msger-chat {
      flex: 1;
      overflow-y: auto;
      padding: 10px;
      }
      .msger-chat::-webkit-scrollbar {
      width: 6px;
      }
      .msger-chat::-webkit-scrollbar-track {
      background: #ddd;
      }
      .msger-chat::-webkit-scrollbar-thumb {
      background: #bdbdbd;
      }
      .msg {
      display: flex;
      align-items: flex-end;
      margin-bottom: 10px;
      }
      .msg:last-of-type {
      margin: 0;
      }
      .msg-img {
      width: 50px;
      height: 50px;
      margin-right: 10px;
      background: #ddd;
      background-repeat: no-repeat;
      background-position: center;
      background-size: cover;
      border-radius: 50%;
      }
      .msg-bubble {
      max-width: 450px;
      padding: 15px;
      border-radius: 15px;
      background: var(--left-msg-bg);
      }
      .msg-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
      }
      .msg-info-name {
      margin-right: 10px;
      font-weight: bold;
      }
      .msg-info-time {
      font-size: 0.85em;
      }
      
      .left-msg .msg-bubble {
      border-bottom-left-radius: 0;
      }
      
      .right-msg {
      flex-direction: row-reverse;
      }
      .right-msg .msg-bubble {
      background: var(--right-msg-bg);
      color: #fff;
      border-bottom-right-radius: 0;
      }
      .right-msg .msg-img {
      margin: 0 0 0 10px;
      }
      
      .msger-inputarea {
      display: flex;
      padding: 10px;
      border-top: var(--border);
      background: #eee;
      }
      .msger-inputarea * {
      padding: 10px;
      border: none;
      border-radius: 3px;
      font-size: 1em;
      }
      .msger-input {
      flex: 1;
      background: #ddd;
      }
      .msger-send-btn {
      margin-left: 10px;
      background: rgb(0, 196, 65);
      color: #fff;
      font-weight: bold;
      }
      .msger-send-btn:hover {
      background: rgb(0, 180, 50);
      }
      
      .msger-chat {
      background-color: #fcfcfe;
      }`;

  style.innerHTML = cssRules;

  iframe.contentWindow?.document.head.appendChild(style);
}
