'use strict';

// With background scripts you can communicate with popup
// and contentScript files.
// For more information on background script,
// See https://developer.chrome.com/extensions/background_pages

const HOST = 'localhost:1234';
const PORT = 1234;
const ws = new WebSocket(`ws://${HOST}:${PORT}`);

console.log('opened websocket', ws);
