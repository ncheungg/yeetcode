'use strict';

import { PopupState, MessageType, SocketMessageType } from './types';
import { HOST, PORT } from './consts';

// states
// let urlState: URL;
let isInRoomState: boolean = false;
let popupState: PopupState = PopupState.NotLeetcode;
// todo: add state
let userID: string | undefined = '';
let avatarImgUrl: string | null;

// With background scripts you can communicate with popup
// and contentScript files.
// For more information on background script,
// See https://developer.chrome.com/extensions/background_pages

const ws = new WebSocket(`ws://${HOST}:${PORT}`);
console.log('opened websocket', ws);

// programmatically switch popup file based on the active tab
const getTab = async () => {
  const tabs = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true,
  });
  return tabs[0].url;
};
chrome.tabs.onActivated.addListener(async () => {
  const tabUrl = await getTab();
  if (!tabUrl) return;

  const url = new URL(tabUrl);

  if (url.hostname === 'leetcode.com' && isInRoomState) {
    chrome.action.setPopup({ popup: 'in-room.html' });
  } else if (url.hostname === 'leetcode.com' && userID && avatarImgUrl) {
    chrome.action.setPopup({ popup: 'not-in-room.html' });
  } else if (url.hostname === 'leetcode.com') {
    chrome.action.setPopup({ popup: 'not-logged-in.html' });
  } else {
    chrome.action.setPopup({ popup: 'not-leetcode.html' });
  }
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  // console.log(
  //   sender.tab
  //     ? 'from a content script:' + sender.tab.url
  //     : 'from the extension'
  // );

  switch (request.type) {
    case SocketMessageType.Create:
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
    case SocketMessageType.Join:
      break;
    case SocketMessageType.Leave:
      break;
    case SocketMessageType.Message:
      break;
    case SocketMessageType.Action:
      break;
    default:
      break;
  }
});

// TODO:: call this function on message recieved from popup
const injectSidebar = async () => {
  try {
    let queryOptions = { active: true, lastFocusedWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    console.log(tab);
    if (!tab) return false;

    chrome.scripting.executeScript({
      target: { tabId: tab.id as number },
      files: ['sidebar.js'],
    });
    return true;
  } catch {
    return false;
  }
};
