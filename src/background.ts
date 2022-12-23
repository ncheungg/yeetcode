'use strict';

import { Message, MessageType, UserInfo } from './types';

import { HOST, PORT } from './consts';

// states
let isInRoomState: boolean = false;

let url: URL | undefined;
let userInfo: UserInfo | undefined;

// connect to websocket
const ws = new WebSocket(`ws://${HOST}:${PORT}`);
console.log('opened websocket', ws);

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
        // TODO: send room creation request to backend and check if successful
        const roomCreated = true; // replace

        if (!roomCreated) {
          sendResponse({ status: 'room not created' });
          return;
        }

        injectSidebar().then(function (result) {
          if (result) {
            sendResponse({ status: 'could not create chat' });
          } else {
            sendResponse({ status: 'room created' });
          }
        });

        break;
      case MessageType.Join:
        break;
      case MessageType.Leave:
        break;

      // updates userInfo state
      case MessageType.FetchUserInfo:
        userInfo = params?.userInfo as UserInfo;
        switchPopup();
        break;

      case MessageType.Hint:
        ws.send(JSON.stringify(request));
        break;

      case MessageType.Submit:
        ws.send(JSON.stringify(request));
        break;

      case MessageType.Finished:
        ws.send(JSON.stringify(request));
        break;

      case MessageType.Failed:
        ws.send(JSON.stringify(request));
        break;

      case MessageType.Discussion:
        ws.send(JSON.stringify(request));
        break;

      case MessageType.Solutions:
        ws.send(JSON.stringify(request));
        break;
    }
  }
);

// TODO:: call this function on message recieved from popup
const injectSidebar = async () => {
  try {
    let queryOptions = { active: true, lastFocusedWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    console.log(tab);
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
