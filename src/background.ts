'use strict';

// With background scripts you can communicate with popup
// and contentScript files.
// For more information on background script,
// See https://developer.chrome.com/extensions/background_pages

const HOST = 'localhost:1234';
const PORT = 1234;

// const ws = new WebSocket(`ws://${HOST}:${PORT}`);
// console.log('opened websocket', ws);

// event listener on tab switching
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
});

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
