'use strict';

import { Message, MessageTypeInternal, UserInfo } from '../types';
import { delay } from '../utils';

const getUserInfo = (): UserInfo => {
  // css for profile dropdown, makes it invisible when we're programmatically clicking it
  const stylesheet = document.createElement('style');
  stylesheet.innerHTML =
    '.z-nav { display: none !important; } .ant-dropdown { display: none !important; } ';
  const head = document.getElementsByTagName('head')[0];
  head.appendChild(stylesheet);

  // programmatically load the profile dropdown
  const profileDropdown: HTMLElement | null = document.querySelector(
    '#navbar-right-container > div:nth-child(4) > a'
  );
  profileDropdown?.click();
  profileDropdown?.click();

  // on load grab the leetcode username
  const avatarElement = document.getElementsByClassName(
    'h-6 w-6 rounded-full object-cover'
  )[0];
  const avatarUrl: string | null = avatarElement?.getAttribute('src');
  const avatarButton =
    avatarElement?.parentElement?.parentElement?.parentElement;

  avatarButton?.click();

  const userNameElement = document.getElementsByClassName(
    'relative flex h-14 w-14 shrink-0 cursor-pointer'
  )[0];

  const userId: string | undefined =
    document.getElementsByClassName('user-name__35Mk')[0]?.textContent ||
    userNameElement?.getAttribute('href')?.split('/')[1];

  avatarButton?.click();

  // remove invisible css rule after a 50ms delay
  setTimeout(() => {
    stylesheet.remove();
  }, 50);

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
    type: MessageTypeInternal.FetchUserInfo,
    params: {
      userInfo,
    },
    ts: new Date(),
  };
  chrome.runtime.sendMessage(message);
})();
