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
  document.body.style.setProperty('max-width', 'calc(100%-300px)');

  const sidebar = document.createElement('div');
  sidebar.style.setProperty('id', 'yeetcode-sidebar');
  sidebar.classList.add('yeetcode-sidebar');

  // the fukin sidebar html
  const sidebarHtml: string = `<section class="msger">
    <header class="msger-header">
      <div class="msger-header-title">Yeetcode</div>
      <div class="msger-header-options">
        <form id="yeetcode-ready"><button type="submit" id="yeetcode-ready-button" class="msger-send-btn">Ready</button></form>
      </div>
    </header>
    <main class="msger-chat" id="yeetcode-chat">
    <p id="yeetcode-timer">00m 00s</p>
      
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

    toggleButton();
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

const toggleButton = () => {
  const readyButton = document.querySelector(
    '#yeetcode-ready-button'
  ) as HTMLButtonElement;

  if (readyButton.textContent == 'Unready') {
    readyButton.textContent = 'Ready';
    readyButton.setAttribute('style', 'background:rgb(256, 0, 0) !important');
  } else {
    // 'Ready';
    readyButton.textContent = 'Unready';
    readyButton.setAttribute('style', 'background:rgb(0, 196, 65) !important');
  }
};
const setTimer = (endDate: Date) => {
  var countDownDate = endDate.getTime();

  var x = setInterval(function () {
    // Get today's date and time
    var now = new Date().getTime();

    // Find the distance between now and the count down date
    var distance = countDownDate - now;

    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((distance % (1000 * 60)) / 1000);

    // Output the result in an element with id="demo"
    const timer = document.getElementById('yeetcode-timer');

    if (!timer) return;

    timer.innerHTML = minutes + 'm ' + seconds + 's ';

    // If the count down is over, write some text
    if (distance < 0) {
      clearInterval(x);
      timer.innerHTML = '00m 00s';
    }
  }, 1000);
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

          // setTimer()
          // TODO: how to check if game ready?
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
