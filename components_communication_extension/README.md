# Components Communication

In this Extension we will demonstrate how to communicate between different components of the Extension and the Session.

- We will use the `browser.runtime.sendMessage` method to send a message to the Popup html and the Background.
- We will use the `browser.tabs.sendMessage` method to send a message to the Content script.
- And the `browser.runtime.onMessage.addListener` method to listen to messages from any Extension component.
- And the `browser.webfuseSession.broadcastMessage` method to broadcast a message to all participants in the Session.
- And the `browser.webfuseSession.on.addListener` method to listen to messages from the Session and broadcast messages from the Extension.

#### Key Points

- Listening for Webfuse Session Events:
    - The Extension components utilize the `browser.webfuseSession.on.addListener()` method to listen for `chat_message` events from the Session
    - The Extension components utilize the `browser.runtime.onMessage.addListener()` method to listen for `forecast` events from the Extension.
``` js
browser.webfuseSession.on.addListener(chatMessageHandler);
browser.runtime.onMessage.addListener(getForecast);
```

- Sending Messages and Receiving Responses:
    - The Extension components utilize `browser.runtime.sendMessage()` to send a message and `await` the response from the background script.
    - The background handler returns the forecast data directly — the sender's Promise resolves with the return value.
``` js
// sender (popup or content script)
const response = await browser.runtime.sendMessage({event_type: 'forecast'});

// background handler — return value becomes the response
return { forecast };
```

- Triggering Webfuse Session API methods:
    - The Extension components utilize the `browser.webfuseSession.apiRequest()` or `browser.webfuseSession.sendChatMessage()` method to trigger the `send_chat_message` method to send a message to the chat.
``` js
browser.webfuseSession.apiRequest({
    cmd: 'send_chat_message',
    message: 'Ping from extension content script',
});
// OR
browser.webfuseSession.sendChatMessage('Ping from extension content script');
```

- Broadcasting messages to all participants:
    - The Extension popup utilizes the `browser.webfuseSession.broadcastMessage()` method to broadcast a message to all participants in the Session.
``` js
browser.webfuseSession.broadcastMessage(`extension_popup_${ev.type}`);
```

- Listening to broadcast messages:
    - The Extension background script utilizes the `browser.webfuseSession.on.addListener()` method to listen for broadcast messages from the Extension Popup.
``` js
browser.webfuseSession.on.addListener((message, sender) => {
  if (message === 'extension_popup_DOMContentLoaded') {
    console.log('### Broadcasted message from popup ###', message, sender);
  }
});
```
