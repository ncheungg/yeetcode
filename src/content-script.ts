'use strict';

// Content script file will run in the context of web page.
// With content script you can manipulate the web pages using
// Document Object Model (DOM).
// You can also pass information to the parent extension.

// We execute this script by making an entry in manifest.json file
// under `content_scripts` property

// For more information on Content Scripts,
// See https://developer.chrome.com/extensions/content_scripts

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

// accepted checkmark is seen && in submissions tab
const answerIsAccepted = (): boolean =>
  document.getElementsByClassName(
    'text-xl font-medium text-red-s dark:text-dark-red-s'
  )[0] === undefined;

const submitButton = getSubmitButton();
const sectionTabs = document.getElementsByClassName(
  'flex h-11 w-full items-center pt-2'
)[0];
const hintButton = document.getElementsByClassName(
  'px-2 py-1 hover:text-blue-s dark:hover:text-dark-blue-s cursor-pointer rounded transition-colors text-gray-6 dark:text-dark-gray-6 hover:bg-fill-3 dark:hover:bg-dark-fill-3'
)[0];

// resolves submit button change (checks when solution has finished submitting)
const resolveSubmitButtonChange = (mutationRecords: MutationRecord[]): void => {
  for (const mutation of mutationRecords) {
    console.log(mutation.target);

    // make sure its actually done submitting
    if (submitButtonIsRunning()) continue;
    // if (mutation.target === getSubmitButtonRunning()) continue;
    // if (mutation.target !== getSubmitButtonIdle()) continue;

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

  console.log('hint');
};

// Event listeners
(submitButton as Node).addEventListener('click', handleSubmitButtonClick);

if (hintButton)
  (hintButton as Node).addEventListener('click', handleHintButtonClick);

sectionTabsObserver.observe(sectionTabs as Element, {
  childList: true,
  subtree: true,
  attributeFilter: ['class'],
});
