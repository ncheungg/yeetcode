import { Message, MessageTypeInternal } from '../types';

const { pathname } = window.location;
const pathnameArr = pathname.split('/');

// script runs only when in a joinroom url under localhost:1234
// parses the roomId and invokes a joinroom request
if (pathnameArr.length === 3 && pathnameArr[1] === 'join') {
  const message: Message = {
    type: MessageTypeInternal.JoinWithUrl,
    params: {
      roomId: pathnameArr[2],
    },
    ts: new Date(),
  };
  chrome.runtime.sendMessage(message);

  window.location.href = 'https://leetcode.com/';
}
