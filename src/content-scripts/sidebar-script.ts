import {
  Message,
  MessageType,
  MessageTypeInternal,
  MessageParams,
  ChatMessage,
} from '../types';

console.log('got to sidebar-script');

const YOU = 'you';
const createSidebar = (): boolean => {
  console.log('created sidebar');

  // place to insert
  document.body.style.setProperty('width', '80%');

  const sidebar = document.createElement('div');
  sidebar.style.setProperty('id', 'yeetcode-sidebar');
  sidebar.classList.add('yeetcode-sidebar');

  // the fukin sidebar html
  const sidebarHtml: string = `<section class="msger">
    <header class="msger-header">
      <div class="msger-header-title">Yeetcode</div>
      <div class="msger-header-options">
        <form id="yeetcode-ready"><button type="submit" class="msger-send-btn">Ready</button></form>
      </div>
    </header>
    <main class="msger-chat" id="yeetcode-chat">
      
    </main>
    <form class="msger-inputarea" id="yeetcode-msger-form">
      <input
        type="text"
        placeholder="Enter your message..."
        class="msger-input"
        id="yeetcode-msger-input"
      /><button type="submit" class="msger-send-btn">Send</button>
    </form>
  </section>`;

  document.body.appendChild(sidebar);

  sidebar.innerHTML = sidebarHtml;

  const messageForm = document.getElementById(
    'yeetcode-msger-form'
  ) as HTMLFormElement;
  const messageInput = document.getElementById(
    'yeetcode-msger-input'
  ) as HTMLInputElement;

  // event listener for user submitted messages
  messageForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const text = messageInput?.value;
    if (!text) return;

    const ts = new Date();
    const message: Message = {
      type: MessageType.Message,
      params: { message: text },
      ts,
    };
    chrome.runtime.sendMessage(message);

    outgoingChat(text, ts);

    messageInput.value = '';
  });

  const readyForm = document.getElementById(
    'yeetcode-ready'
  ) as HTMLFormElement;

  readyForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const message: Message = {
      type: MessageType.Ready,
      params: {},
      ts: new Date(),
    };

    chrome.runtime.sendMessage(message);
  });

  return true;
};

const removeSidebar = (): boolean => {
  console.log('removed sidebar');
  return true;
};

function createMessage(
  username: string,
  timestamp: Date,
  message: string,
  isIncoming: boolean = false,
  italics: boolean = false
) {
  if (!username) username = '';
  var ts = new Date(timestamp as unknown as string);

  var text = message;

  if (italics) {
    text = `<i>${message}</i>`;
  }
  const msgHTML = `
      <div class="msg ${isIncoming ? 'left' : 'right'}-msg">
  
        <div class="msg-bubble">
          <div class="msg-info">
            <div class="msg-info-name">${username}</div>
            <div class="msg-info-time">${ts.toLocaleTimeString()}</div>
          </div>
  
          <div class="msg-text">${text}</div>
        </div>
      </div>
    `;

  return msgHTML;
}
const outgoingChat = (text: string, ts: Date) => {
  const messageHTML = createMessage(YOU, ts, text);
  const chat = document.getElementById('yeetcode-chat') as HTMLFormElement;
  chat.insertAdjacentHTML('beforeend', messageHTML);
  chat.scrollTop += 500;
};

const incomingChat = (
  text: string,
  username: string,
  timestamp: Date,
  italics: boolean = false
) => {
  const messageHTML = createMessage(username, timestamp, text, true, italics);
  const chat = document.getElementById('yeetcode-chat') as HTMLFormElement;
  chat.insertAdjacentHTML('beforeend', messageHTML);
  chat.scrollTop += 500;
};

const restoreChatHistory = (chatHistory: ChatMessage[] | undefined) => {
  if (!chatHistory) return;
  for (const chatMessage of chatHistory) {
    let { type, params, ts } = chatMessage.message;
    let { message, userInfo } = params as MessageParams;

    let text = message as string;
    let username = userInfo?.userId as string;
    let italics = type == MessageType.Action;

    if (chatMessage.isOutgoing) {
      outgoingChat(text, ts);
    } else {
      incomingChat(text, username, ts, italics);
    }
  }
};

chrome.runtime.onMessage.addListener(
  (request: Message, sender, sendResponse) => {
    const { type, params, ts } = request;

    switch (type) {
      case MessageTypeInternal.FetchIsInRoomState:
        if (params?.isInRoom) {
          createSidebar();

          // add history
          const chatHistory = params.chatHistory;
          restoreChatHistory(chatHistory);
        } else {
          removeSidebar();
        }
        break;
      case MessageType.Message:
        var { message, userInfo } = params as MessageParams;

        var userName = userInfo?.userId as string;

        incomingChat(message as string, userName, ts);
        break;

      case MessageType.Action:
        var { message } = params as MessageParams;

        console.log(message);
        incomingChat(message as string, '', ts, true);
        break;
      case MessageType.StartGame:
        // set timer

        break;
      case MessageType.EndGame:
        // clear timer

        break;
      default:
        console.error(`Error: could not process action of type ${type}`);
    }
  }
);

// asks background.ts if we're connected to a room -- if so we inject the sidebar
const fetchRoomStateMessage: Message = {
  type: MessageTypeInternal.FetchIsInRoomState,
  ts: new Date(),
};
chrome.runtime.sendMessage(fetchRoomStateMessage);
