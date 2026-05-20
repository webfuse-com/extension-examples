browser.sidePanel.onOpened.addListener(async () => {
  const { text } = await browser.action.getPopupBadgeText();
  const count = +(text || 0);
  browser.action.setPopupBadgeText(String(count + 1));
});

browser.sidePanel.onClosed.addListener(async () => {
  const { text } = await browser.action.getPopupBadgeText();
  const count = +(text || 0);
  browser.action.setPopupBadgeText(String(count + 1));
});
