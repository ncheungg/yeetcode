'use strict';

import { Message, MessageType, UserInfo } from './types';
import { delay } from './utils';

const getUserInfo = (): UserInfo => {
  // css for profile dropdown, makes it invisible when we're programmatically clicking it
  const stylesheet = document.createElement('style');
  stylesheet.innerHTML = '.ant-dropdown { display: none; }';
  const head = document.getElementsByTagName('head')[0];
  head.appendChild(stylesheet);

  // programmatically load the profile dropdown
  const profileDropdown: HTMLElement | null = document.querySelector(
    '#navbar-right-container > div:nth-child(4) > a'
  );
  profileDropdown?.click();
  profileDropdown?.click();

  // remove invisible css rule
  stylesheet.remove();

  // on load grab the leetcode username
  const avatarUrl: string | null = document
    .getElementsByClassName('h-6 w-6 rounded-full object-cover')[0]
    ?.getAttribute('src');
  const userId: string | undefined =
    document.getElementsByClassName('user-name__35Mk')[0]?.textContent ||
    avatarUrl?.split('/')[4];

  // sends a message to background js with avatar and userId
  const userInfo: UserInfo = { userId, avatarUrl };

  return userInfo;
};

// runs function with a 1 second delay
(async () => {
  await delay(1000);

  let userInfo: UserInfo | undefined;

  // does 20 attempts in 500ms intervals to try to get the userinfo
  for (let i = 0; i < 20; i++) {
    userInfo = getUserInfo();
    console.log(userInfo);

    if (userInfo.userId) break;

    await delay(500);
  }

  const message: Message = {
    type: MessageType.FetchUserInfo,
    params: {
      userInfo,
    },
    ts: new Date(),
  };
  chrome.runtime.sendMessage(message);
})();
