# Highlights Manager

This Extension allows you to save highlights made by a user on a page, save them to state in extension background script and display them in a Popup window.

#### Key Points

- Listening for messages in various extension components:
    - The extension components utilize the `browser.runtime.onMessage.addListener()` method to listen for various events from the extension.
``` js
browser.runtime.onMessage.addListener();
```
- Sending Messages to the extension components:
    - The extension components utilize the `browser.runtime.sendMessage()` method to send a message to the popup html (and any other extension component).
``` js
browser.runtime.sendMessage();
```
- Keeping state in the background script and manipulateing it via messages from various extension components:
``` js
highlightsState = [];
```
- Including the popup.js script in the popup.html file with a regular script tag:
```html
<script src="popup.js"></script>
```
