'use strict';

import {
  Message,
  MessageParams,
  MessageType,
  UserInfo,
  Problem,
  MessageTypeInternal,
  ChatMessage,
} from '../types';
import { WS_HOST } from '../consts';

// states
let isInRoomState: boolean = false;
let roomIdState: string | undefined;
let url: URL | undefined;
let userInfo: UserInfo | undefined;
let chatHistory: ChatMessage[] = [];

// variables that resolve joining room with a url
let joinWithUrlPromise: Promise<void> | undefined;
let joinWithUrlPromiseResolver:
  | ((value: void | PromiseLike<void>) => void)
  | undefined;

// connect to websocket
var ws: WebSocket | null = null;

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
const getTab = async () => {
  const tabs = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true,
  });
  return tabs[0];
};

// event listeners that trigger the popup switching
chrome.tabs.onActivated.addListener(async () => {
  const tab = await getTab();
  if (!tab.url) return;

  url = new URL(tab.url);
  switchPopup();
});
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status !== 'complete' || !tab.url) return;

  url = new URL(tab.url);
  switchPopup();
});

// set initial popup
chrome.action.setPopup({ popup: 'not-leetcode.html' });

// handles messages sent by popup, content-scripts, and backend
chrome.runtime.onMessage.addListener(
  (request: Message, sender, sendResponse) => {
    const { type, params } = request;

    // add the userInfo to all requests
    if (type !== MessageTypeInternal.FetchUserInfo && request.params)
      request.params.userInfo = userInfo;

    switch (type) {
      case MessageType.Create:
        isInRoomState = true;
        injectSidebar();
        openSocket(request);
        break;

      case MessageType.Join:
        isInRoomState = true;
        injectSidebar();
        openSocket(request);
        break;

      case MessageType.Leave:
        break;

      case MessageType.Message:
        chatHistory.push({ message: request, isOutgoing: true });
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

        // if we have a pending promise resolver (aka. we are waiting to fetch the userId to join via url)
        if (joinWithUrlPromiseResolver !== undefined) {
          joinWithUrlPromiseResolver();
          joinWithUrlPromiseResolver = undefined;
        }
        break;

      case MessageTypeInternal.FetchIsInRoomState:
        const roomStateMessage: Message = {
          type: MessageTypeInternal.FetchIsInRoomState,
          params: {
            isInRoom: isInRoomState,
            chatHistory,
          },
          ts: new Date(),
        };
        sendMessageToContentScript(roomStateMessage);
        break;

      // create a promise that resolves when a userId is properly fetched
      case MessageTypeInternal.JoinWithUrl:
        joinWithUrlPromise = new Promise((resolve, reject) => {
          joinWithUrlPromiseResolver = resolve;
        });

        // when the promise has been resolved, we set the userId and open the socket
        joinWithUrlPromise.then(() => {
          isInRoomState = true;
          injectSidebar();

          const joinMessage: Message = {
            type: MessageType.Join,
            params: {
              roomId: params?.roomId,
              userInfo,
            },
            ts: new Date(),
          };
          console.log({ joinMessage });
          openSocket(joinMessage);
        });
        break;

      case MessageTypeInternal.FetchRoomId:
        const roomIdMessage: Message = {
          type: MessageTypeInternal.FetchRoomId,
          params: {
            roomId: roomIdState,
          },
          ts: new Date(),
        };
        chrome.runtime.sendMessage(roomIdMessage);
        break;

      default:
        console.error(`Error: could not process action of type ${type}`);
    }
  }
);

const injectSidebar = () => {
  const roomStateMessage: Message = {
    type: MessageTypeInternal.FetchIsInRoomState,
    params: {
      isInRoom: isInRoomState,
      chatHistory,
    },
    ts: new Date(),
  };
  sendMessageToContentScript(roomStateMessage);

  // should do more here idfk
};

const sendMessageToContentScript = async (message: Message) => {
  const tab = await getTab();
  const tabId = tab.id as number;

  await chrome.tabs.sendMessage(tabId, message);
};

// handles incoming messages received by the ws
const wsMessageHandler = async (msg: MessageEvent<any>) => {
  // TODO
  console.log('handle messages', msg);

  const message = JSON.parse(msg.data) as Message;
  const { type, params, ts } = message;

  switch (type) {
    case MessageType.Create:
      const { roomId } = params as MessageParams;
      roomIdState = roomId;

      switchPopup();
      break;

    case MessageType.StartGame:
      console.log('problem:', params?.problem);
      const { problem } = params as MessageParams;
      const { url, id, difficulty, name, premium, topics } = problem as Problem;
      const urlString = url as string;

      chrome.tabs.update({ url: urlString });
      sendMessageToContentScript(message);
      break;

    case MessageType.EndGame:
      sendMessageToContentScript(message);
      break;

    case MessageType.Action:
      chatHistory.push({ message, isOutgoing: false });
      sendMessageToContentScript(message);
      break;

    case MessageType.Message:
      chatHistory.push({ message, isOutgoing: false });
      sendMessageToContentScript(message);
      break;

    default:
      console.error(`Error: could not process action of type ${type}`);
  }
};

const openSocket = (initialRequest: Message): void => {
  ws = new WebSocket(`wss://${WS_HOST}`);
  console.log('Attempting Connection...', ws);

  ws.onopen = () => {
    console.log('Successfully Connected');
    ws?.send(JSON.stringify(initialRequest));
  };

  ws.onmessage = (msg) => {
    wsMessageHandler(msg);
  };

  ws.onclose = (event) => {
    console.log('Socket Closed Connection: ', event);
    ws?.close();
  };

  ws.onerror = (error) => {
    console.log('Socket Error: ', error);
  };
};
