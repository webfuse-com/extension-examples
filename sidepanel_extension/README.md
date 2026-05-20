# Sidepanel Extension

This Extension demonstrates how to use the Side Panel API to create a persistent side panel that can be opened alongside web pages. The extension includes controls to toggle the side panel position (left/right) and configure whether clicking the extension icon opens the sidepanel instead of the popup.

#### Key Points

- **Side Panel Configuration**: The `side_panel` property in `manifest.json` defines the default side panel HTML file:
```json
"side_panel": {
  "default_path": "sidepanel.html"
}
```

- **Opening the Side Panel**: From the popup, you can programmatically open the side panel:
```js
browser.action.closePopup();
browser.sidePanel.open();
```

- **Setting Side Panel Position**: Use `browser.sidePanel.setLayout()` to control whether the side panel appears on the left or right:
```js
browser.sidePanel.setLayout({ side: 'right' }); // or 'left'
```

- **Configuring Icon Click Behavior**: Control whether clicking the extension icon opens the sidepanel instead of the popup:
```js
browser.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
```

- **Monitoring Side Panel Events**: Listen for side panel open/close events in the background script:
```js
browser.sidePanel.onOpened.addListener(() => {
  // Handle side panel opened
});

browser.sidePanel.onClosed.addListener(() => {
  // Handle side panel closed
});
```
