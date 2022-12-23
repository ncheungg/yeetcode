'use strict';

import { Message, MessageParams, MessageType, UserInfo } from './types';

import { HOST, PORT } from './consts';

// states
let isInRoomState: boolean = false;
let roomIdState: string | undefined;
let url: URL | undefined;
let userInfo: UserInfo | undefined;

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
    switch (type) {
      case MessageType.Create:
        if (request.params) request.params.userInfo = userInfo;

        injectSidebar();
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

      // updates userInfo state
      case MessageType.FetchUserInfo:
        userInfo = params?.userInfo as UserInfo;
        switchPopup();
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
    }
  }
);

// TODO:: call this function on message recieved from popup
const injectSidebar = async () => {
  try {
    let queryOptions = { active: true, lastFocusedWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    // console.log(tab);
    if (!tab) return false;

    // chrome.scripting.insertCSS({
    //   target: { tabId: tab.id as number },
    //   files: ['sidebar.css'],
    // });

    chrome.scripting.executeScript({
      target: { tabId: tab.id as number },
      files: ['sidebar.js'],
    });

    return true;
  } catch {
    return false;
  }
};

const reciever = (msg: MessageEvent<any>) => {
  // TODO
  console.log('handle messages', msg);

  const { type, params, ts } = JSON.parse(msg.data) as Message;

  switch (type) {
    case MessageType.Create:
      const { roomId } = params as MessageParams;
      roomIdState = roomId;
      break;
    case MessageType.Join:
      break;
    case MessageType.Message:
      // recieveMessage(params?.userInfo?.userId, , ts);

      break;
    case MessageType.Leave:
      break;

    case MessageType.Hint:
      break;

    case MessageType.Submit:
      break;

    case MessageType.Finished:
      break;

    case MessageType.Failed:
      break;

    case MessageType.Discussion:
      break;

    case MessageType.Solutions:
      break;
  }
};

const openSocket = (initialCreateRequest: Message) => {
  ws = new WebSocket(`ws://${HOST}:${PORT}`);
  console.log('Attempting Connection...', ws);

  ws.onopen = () => {
    console.log('Successfully Connected');
    ws?.send(JSON.stringify(initialCreateRequest));
  };

  ws.onmessage = (msg) => {
    reciever(msg);
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
