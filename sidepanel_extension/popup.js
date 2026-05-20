document.getElementById('openSidepanel').addEventListener('click', async () => {
  browser.action.closePopup();
  browser.sidePanel.open();
});
