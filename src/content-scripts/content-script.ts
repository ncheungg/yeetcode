'use strict';

import { Message, MessageType } from '../types';
import { delay } from '../utils';

const getSubmitButton = (): Element | undefined => {
  for (const btn of document.getElementsByTagName('button')) {
    if (btn.innerText === 'Submit') return btn;
  }
};

const submitButtonIsRunning = (): boolean => {
  const submitButton = getSubmitButton() as Element;
  return (
    submitButton.className.includes('cursor-not-allowed') &&
    submitButton.className.includes('opacity-50')
  );
};

const getHintButton = (): Element | undefined =>
  document.getElementsByClassName(
    'px-2 py-1 hover:text-blue-s dark:hover:text-dark-blue-s cursor-pointer rounded transition-colors text-gray-6 dark:text-dark-gray-6 hover:bg-fill-3 dark:hover:bg-dark-fill-3'
  )[0];

// accepted checkmark is seen && in submissions tab
const answerIsAccepted = (): boolean =>
  document.getElementsByClassName(
    'text-xl font-medium text-red-s dark:text-dark-red-s'
  )[0] === undefined;

const sectionTabs = document.getElementsByClassName(
  'flex h-11 w-full items-center pt-2'
)[0];
let submitButton: Node | undefined;
let hintButton: Node | undefined;

// resolves submit button change (checks when solution has finished submitting)
const resolveSubmitButtonChange = (): void => {
  if (submitButtonIsRunning()) return;

  // sends a finished/failed messaged to background.js based on outcome
  const message: Message = {
    type: answerIsAccepted() ? MessageType.Finished : MessageType.Failed,
    ts: new Date(),
  };
  chrome.runtime.sendMessage(message);

  // stops observing until the next button click
  submitButtonObserver.disconnect();
};

// checks whether 'discussion' or 'solutions' tab has been clicked
const resolveSectionTabsChange = async (
  mutationRecords: MutationRecord[]
): Promise<void> => {
  for (const mutation of mutationRecords) {
    hintButton?.removeEventListener('click', handleHintButtonClick);

    if (
      mutation.target === null ||
      (mutation.target as HTMLElement).className.includes('cursor-pointer')
    )
      continue;

    if (mutation.target.textContent?.startsWith('Discussion')) {
      const message: Message = {
        type: MessageType.Discussion,
        ts: new Date(),
      };
      chrome.runtime.sendMessage(message);
    }

    if (mutation.target.textContent?.startsWith('Solutions')) {
      const message: Message = {
        type: MessageType.Solutions,
        ts: new Date(),
      };
      chrome.runtime.sendMessage(message);
    }

    // reset hint button event listener when entering description tab
    if (mutation.target.textContent?.startsWith('Description')) {
      await delay(500);
      hintButton = getHintButton();
      hintButton?.addEventListener('click', handleHintButtonClick);
      break;
    }
  }
};

// observers
const submitButtonObserver = new MutationObserver(resolveSubmitButtonChange);
const sectionTabsObserver = new MutationObserver(resolveSectionTabsChange);

const handleSubmitButtonClick = () => {
  const message: Message = {
    type: MessageType.Submit,
    ts: new Date(),
  };
  chrome.runtime.sendMessage(message);

  // begin observing
  submitButtonObserver.observe(submitButton as Node, {
    attributeFilter: ['class'],
  });
};

// if hintPopup was not present when button was clicked,
// then user clicked it to show hintPopup
const handleHintButtonClick = () => {
  const hintPopup = document.getElementsByClassName(
    'arrow-bottom fixed z-modal md:block shadow-level3 dark:shadow-dark-level3 w-[228px] p-4 rounded-lg bg-layer-2 dark:bg-dark-layer-2 opacity-100 translate-y-0'
  )[0];
  if (hintPopup !== undefined) return;

  // sends message to background.js
  const message: Message = {
    type: MessageType.Hint,
    ts: new Date(),
  };
  chrome.runtime.sendMessage(message);
};

// keep trying to grab the buttons until DOM fully loads
// try for 20 iterations with 500ms intervals

// submit button event listener
(async () => {
  for (let i = 0; i < 20; i++) {
    submitButton = getSubmitButton();
    submitButton?.addEventListener('click', handleSubmitButtonClick);

    if (submitButton) return;
    await delay(500);
  }
})();

// hint button event listener
(async () => {
  for (let i = 0; i < 20; i++) {
    hintButton = getHintButton();
    hintButton?.addEventListener('click', handleHintButtonClick);

    if (hintButton) return;
    await delay(500);
  }
})();

sectionTabsObserver.observe(sectionTabs as Element, {
  childList: true,
  subtree: true,
  attributeFilter: ['class'],
});
