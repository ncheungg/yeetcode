'use strict';

import { PopupState, Message, MessageType } from './types';
import { HOST, PORT } from './consts';

// states
let urlState: URL;
let isInRoomState: boolean = false;
let popupState: PopupState = PopupState.NotLeetcode;

// With background scripts you can communicate with popup
// and contentScript files.
// For more information on background script,
// See https://developer.chrome.com/extensions/background_pages

// const ws = new WebSocket(`ws://${HOST}:${PORT}`);
// console.log('opened websocket', ws);

// programmatically switch popup file based on the active tab
const getTab = async () => {
  const tabs = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true,
  });
  return tabs[0].url;
};
chrome.tabs.onActivated.addListener(async () => {
  const url = await getTab();
  console.log(url);
  if (!url) return;

  urlState = new URL(url);

  if (urlState.hostname === 'leetcode.com' && isInRoomState) {
    // popupState = PopupState.InRoom;
    chrome.action.setPopup({ popup: 'in-room.html' });
  } else if (urlState.hostname === 'leetcode.com') {
    // popupState = PopupState.NotInRoom;
    chrome.action.setPopup({ popup: 'not-in-room.html' });
  } else {
    // popupState = PopupState.NotLeetcode;
    chrome.action.setPopup({ popup: 'not-leetcode.html' });
  }

  // const message: Message = {
  //   type: MessageType.TabChange,
  //   data: popupState,
  // };

  // chrome.runtime.sendMessage(message);
});

// TODO:: call this function on message recieved from popup
const injectSidebar = async () => {
  let queryOptions = { active: true, lastFocusedWindow: true };
  // `tab` will either be a `tabs.Tab` instance or `undefined`.
  let [tab] = await chrome.tabs.query(queryOptions);
  console.log(tab);
  chrome.scripting.executeScript({
    target: { tabId: tab.id as number },
    files: ['sidebar.js'],
  });
};
