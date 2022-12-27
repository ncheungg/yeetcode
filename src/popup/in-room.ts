import { HOST, PORT } from '../consts';
import { Message, MessageParams, MessageTypeInternal } from '../types';

chrome.runtime.onMessage.addListener(
  (request: Message, sender, sendResponse) => {
    const { type, params } = request;

    switch (type) {
      case MessageTypeInternal.FetchRoomId:
        const { roomId } = params as MessageParams;
        const url = `${HOST}:${PORT}/join/${roomId}`;

        const p = document.getElementById('join-room-url');
        if (p) p.innerHTML = url;
        break;

      default:
        console.error(`Error: could not process action of type ${type}`);
    }
  }
);

// fetches the room id
const fetchRoomIdMessage: Message = {
  type: MessageTypeInternal.FetchRoomId,
  ts: new Date(),
};
chrome.runtime.sendMessage(fetchRoomIdMessage);
