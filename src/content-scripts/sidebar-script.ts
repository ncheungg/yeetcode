import { Message, MessageType, MessageTypeInternal } from '../types';

console.log('got to sidebar-script');

const createSidebar = (): boolean => {
  console.log('created sidebar');

  // place to insert
  document.body.style.setProperty('width', 'calc(100% - 350px)');

  const iframe = document.createElement('iframe');
  iframe.style.setProperty('width', '350px');
  iframe.style.setProperty('height', '100%');
  iframe.style.setProperty('top', '0px');
  iframe.style.setProperty('right', '0px');
  iframe.style.setProperty('z-index', '9000000000000000000');
  iframe.style.setProperty('position', 'fixed');

  // the fukin sidebar html
  const sidebarHtml: string = `<section class="msger">
    <header class="msger-header">
      <div class="msger-header-title">Yeetcode</div>
      <div class="msger-header-options">
        <form><button type="submit" class="msger-send-btn">Ready</button></form>
      </div>
    </header>
    <main class="msger-chat">
      
    </main>
    <form class="msger-inputarea" id="yeetcode-msger-form">
      <input
        type="text"
        placeholder="Enter your message..."
        class="msger-input"
        id="yeetcode-msger-form"
      /><button type="submit" class="msger-send-btn">Send</button>
    </form>
  </section>`;

  document.body.appendChild(iframe);

  if (iframe.contentWindow) {
    iframe.contentWindow.document.body.innerHTML = sidebarHtml;
  } else {
    console.error('Error: could not get iframe:', iframe);
    return false;
  }

  const form = document.getElementById(
    'yeetcode-msger-input'
  ) as HTMLFormElement;
  const input = document.getElementById(
    'yeetcode-msger-form'
  ) as HTMLInputElement;

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

    input.value = '';
  });

  return true;
};

const removeSidebar = (): boolean => {
  console.log('removed sidebar');
  return true;
};

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
