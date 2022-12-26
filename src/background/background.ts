'use strict';

import {
  Message,
  MessageParams,
  MessageType,
  UserInfo,
  Problem,
  MessageTypeInternal,
} from '../types';

import { HOST, PORT } from '../consts';

// states
let isInRoomState: boolean = false;
let roomIdState: string | undefined;
let url: URL | undefined;
let userInfo: UserInfo | undefined;

// connect to websocket
var ws: WebSocket | null = null;

// sends message to activate tab's content script
const sendMessageToContentScript = (message: Message): void => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs[0].id) {
      console.error(`Error: could not send message to tab ${tabs[0]}`);
      return;
    }

    chrome.tabs.sendMessage(tabs[0].id, message);
  });
};

// programmatically switch popup file based on states
const switchPopup = (): void => {
  if (!url) return;

  if (url.hostname === 'leetcode.com' && isInRoomState) {
    chrome.action.setPopup({ popup: 'in-room.html' });
  } else if (url.hostname === 'leetcode.com' && userInfo?.userId) {
    chrome.action.setPopup({ popup: 'not-in-room.html' });
  } else if (url.hostname === 'leetcode.com') {
    chrome.action.setPopup({ popup: 'not-logged-in.html' });
  } else {
    chrome.action.setPopup({ popup: 'not-leetcode.html' });
  }
};
const getTab = async (): Promise<string | undefined> => {
  const tabs = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true,
  });
  return tabs[0].url;
};
chrome.tabs.onActivated.addListener(async () => {
  const tabUrl = await getTab();
  if (!tabUrl) return;

  url = new URL(tabUrl);

  switchPopup();
});

// handles messages sent by popup, content-scripts, and backend
chrome.runtime.onMessage.addListener(
  (request: Message, sender, sendResponse) => {
    const { type, params } = request;

    console.log(request);

    switch (type) {
      case MessageType.Create:
        if (request.params) request.params.userInfo = userInfo;

        // injectSidebar();
        isInRoomState = true;
        injectSidebar2();
        openSocket(request);

        break;
      case MessageType.Join:
        break;
      case MessageType.Leave:
        break;
      case MessageType.Message:
        if (request.params) request.params.userInfo = userInfo;
        ws?.send(JSON.stringify(request));

        break;

      case MessageType.Hint:
        ws?.send(JSON.stringify(request));
        break;

      case MessageType.Submit:
        ws?.send(JSON.stringify(request));
        break;

      case MessageType.Finished:
        ws?.send(JSON.stringify(request));
        break;

      case MessageType.Failed:
        ws?.send(JSON.stringify(request));
        break;

      case MessageType.Discussion:
        ws?.send(JSON.stringify(request));
        break;

      case MessageType.Solutions:
        ws?.send(JSON.stringify(request));
        break;
      case MessageType.Ready:
        ws?.send(JSON.stringify(request));
        break;

      // internal states
      case MessageTypeInternal.FetchUserInfo:
        userInfo = params?.userInfo as UserInfo;
        switchPopup();
        break;

      case MessageTypeInternal.FetchIsInRoomState:
        const roomStateMessage: Message = {
          type: MessageTypeInternal.FetchIsInRoomState,
          params: {
            isInRoom: isInRoomState,
          },
          ts: new Date(),
        };
        sendMessageToContentScript(roomStateMessage);
        break;

      default:
        console.error(`Error: could not process action of type ${type}`);
    }
  }
);

const getTabId = async () => {
  let queryOptions = { active: true, lastFocusedWindow: true };
  const [tab] = await chrome.tabs.query(queryOptions);
  return tab.id as number;
};

const injectSidebar2 = () => {
  const roomStateMessage: Message = {
    type: MessageTypeInternal.FetchIsInRoomState,
    params: {
      isInRoom: isInRoomState,
    },
    ts: new Date(),
  };
  sendMessageToContentScript(roomStateMessage);

  // should do more here idfk
};

// TODO:: call this function on message recieved from popup
const injectSidebar = async () => {
  let tabId = await getTabId();

  chrome.scripting.executeScript({
    target: { tabId },
    files: ['sidebar.js'],
  });
};

const sendMessageToSidebar = async (message: Message) => {
  let tabId = await getTabId();
  // const message: Message = {
  //   type: MessageType.ChatMessage,
  //   params: { message: text, userInfo: { userId } },
  //   ts,
  // };
  await chrome.tabs.sendMessage(tabId, message);
};

// handles incoming messages received by the ws
const wsMessageHandler = (msg: MessageEvent<any>) => {
  // TODO
  console.log('handle messages', msg);

  const message = JSON.parse(msg.data) as Message;
  const { type, params, ts } = message;

  switch (type) {
    case MessageType.Create:
      const { roomId } = params as MessageParams;
      roomIdState = roomId;
      break;

    case MessageType.StartGame:
      console.log('problem:', params?.problem);
      const { problem } = params as MessageParams;
      const { url, id, difficulty, name, premium, topics } = problem as Problem;
      const urlString = url as string;

      chrome.tabs.update({ url: urlString });
      break;
    default:
      console.error(`Error: could not process action of type ${type}`);
  }
};

const openSocket = (initialCreateRequest: Message): void => {
  ws = new WebSocket(`ws://${HOST}:${PORT}`);
  console.log('Attempting Connection...', ws);

  ws.onopen = () => {
    console.log('Successfully Connected');
    ws?.send(JSON.stringify(initialCreateRequest));
  };

  ws.onmessage = (msg) => {
    wsMessageHandler(msg);
  };

  ws.onclose = (event) => {
    console.log('Socket Closed Connection: ', event);
  };

  ws.onerror = (error) => {
    console.log('Socket Error: ', error);
  };
};

const closeSocket = () => {
  console.log('socket closed');

  ws?.close();
};
