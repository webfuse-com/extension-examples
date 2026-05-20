# Start Page

This Extension allows you to create a Newtab page which will replace the default page that loads in a new tab in your Webfuse Sessions.

#### Key Points
- Using the `chrome_url_overrides` property to override the default new tab page:
```json
"chrome_url_overrides": {
    "newtab": "new_tab.html"
}
```
- Using [Webfuse JS API](/session-api/#relocate) to navigate to a new tab depending on the leader of the tab:
``` js
browser.webfuseSession.apiRequest({
    cmd: "relocate",
    url: url,
    newTab: false,
});
// OR
browser.runtime.sendMessage({
    type: "navigate",
    url: url,
    clientIndex: controlIndex,
});
```

- Listening for [Webfuse Session Events](/session-events/) to get the leader of the tab and current user index:
``` js
browser.webfuseSession.onMessage.addListener(message => {
    if (message?.event_type === 'host_changed') {
        myIndex = message.my_index;
    } else if (message?.event_type === 'tab_control') {
        controlIndex = message.controlIndex;
    }
});
```

- `styles.css` is included as a regular style tag in the `new_tab.html` file:
```html
<link rel="stylesheet" href="styles.css" />
```
