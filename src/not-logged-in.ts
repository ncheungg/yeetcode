function reloadAndClose() {
  chrome.tabs.reload();
  window.close();
}
document
  .getElementById('reload-page')
  ?.addEventListener('click', reloadAndClose);
