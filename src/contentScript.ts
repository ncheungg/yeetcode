'use strict';

// Content script file will run in the context of web page.
// With content script you can manipulate the web pages using
// Document Object Model (DOM).
// You can also pass information to the parent extension.

// We execute this script by making an entry in manifest.json file
// under `content_scripts` property

// For more information on Content Scripts,
// See https://developer.chrome.com/extensions/content_scripts

const getSubmitButtonIdle = (): Element =>
  document.getElementsByClassName(
    'px-3 py-1.5 font-medium items-center whitespace-nowrap transition-all focus:outline-none inline-flex text-label-r bg-green-s dark:bg-dark-green-s hover:bg-green-3 dark:hover:bg-dark-green-3 rounded-lg'
  )[0];

const getSubmitButtonRunning = (): Element =>
  document.getElementsByClassName(
    'px-3 py-1.5 font-medium items-center whitespace-nowrap transition-all focus:outline-none cursor-not-allowed opacity-50 inline-flex text-label-r bg-green-s dark:bg-dark-green-s hover:bg-green-3 dark:hover:bg-dark-green-3 rounded-lg'
  )[0];

const answerIsAccepted = (): boolean =>
  document.getElementsByClassName(
    'text-green-s dark:text-dark-green-s flex items-center gap-2 text-[16px] font-medium leading-6'
  )[0] !== undefined;

const submitButton = getSubmitButtonIdle();
const sectionTabs = document.getElementsByClassName(
  'flex h-11 w-full items-center pt-2'
)[0];

// resolves submit button change (checks when solution has finished submitting)
const resolveSubmitButtonChange = (mutationRecords: MutationRecord[]): void => {
  for (const mutation of mutationRecords) {
    console.log(mutation.target);

    // make sure its actually done submitting
    if (mutation.target === getSubmitButtonRunning()) continue;
    if (mutation.target !== getSubmitButtonIdle()) continue;

    console.log('finished submitting');
    console.log('accepted:', answerIsAccepted());

    // stops observing until the next button click
    submitButtonObserver.disconnect();
    break;
  }
};

// checks whether 'discussion' or 'solutions' tab has been clicked
const resolveSectionTabsChange = (mutationRecords: MutationRecord[]): void => {
  for (const mutation of mutationRecords) {
    if (mutation.target === null) continue;
    if ((mutation.target as HTMLElement).className.includes('cursor-pointer'))
      continue;

    if (mutation.target.textContent?.startsWith('Discussion')) {
      console.log('opened discussions');
    }

    if (mutation.target.textContent?.startsWith('Solutions')) {
      console.log('opened solutions');
    }
  }
};

// observers
const submitButtonObserver = new MutationObserver(resolveSubmitButtonChange);
const sectionTabsObserver = new MutationObserver(resolveSectionTabsChange);

const handleSubmitButtonClick = () => {
  console.log('submitted');

  // begin observing
  submitButtonObserver.observe(submitButton, { attributeFilter: ['class'] });
};

// Event listeners
submitButton.addEventListener('click', handleSubmitButtonClick);
sectionTabsObserver.observe(sectionTabs as Element, {
  childList: true,
  subtree: true,
  attributeFilter: ['class'],
});
