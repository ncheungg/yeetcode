'use strict';

// With background scripts you can communicate with popup
// and contentScript files.
// For more information on background script,
// See https://developer.chrome.com/extensions/background_pages

const address = 'localhost:1234';
const ws = new WebSocket(`ws://${address}`);

console.log('opened websocket', ws);
