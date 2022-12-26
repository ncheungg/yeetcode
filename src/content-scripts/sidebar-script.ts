import { Message, MessageType, MessageTypeInternal } from '../types';

console.log('got to sidebar-script');

const YOU = 'you';
const createSidebar = (): boolean => {
  console.log('created sidebar');

  // place to insert
  document.body.style.setProperty('width', '80%');

  const sidebar = document.createElement('div');
  sidebar.style.setProperty('id', 'sidebar');
  sidebar.classList.add('sidebar');

  // the fukin sidebar html
  const sidebarHtml: string = `<section class="msger">
    <header class="msger-header">
      <div class="msger-header-title">Yeetcode</div>
      <div class="msger-header-options">
        <form><button type="submit" class="msger-send-btn">Ready</button></form>
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

  const form = document.getElementById(
    'yeetcode-msger-form'
  ) as HTMLFormElement;
  const input = document.getElementById(
    'yeetcode-msger-input'
  ) as HTMLInputElement;

  console.log('form', form);

  // event listener for user submitted messages
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const text = input?.value;
    if (!text) return;

    const message: Message = {
      type: MessageType.Message,
      params: { message: text },
      ts: new Date(),
    };
    chrome.runtime.sendMessage(message);

    const messageHTML = createMessage(YOU, new Date(), text);

    const chat = document.getElementById('yeetcode-chat') as HTMLFormElement;
    chat.insertAdjacentHTML('beforeend', messageHTML);
    chat.scrollTop += 500;

    input.value = '';
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
  //   Simple solution for small apps
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

chrome.runtime.onMessage.addListener(
  (request: Message, sender, sendResponse) => {
    const { type, params, ts } = request;

    switch (type) {
      case MessageTypeInternal.FetchIsInRoomState:
        if (params?.isInRoom) {
          createSidebar();
        } else {
          removeSidebar();
        }
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
