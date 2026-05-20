# Custom Screensharing

In this Extension we insert a button in the web page. This button when clicked calls the Session API's `startScreensharing()` method. This extension only has a Content script and Manifest. The extension will work only if the `Screen sharing` app is installed in the Space.

#### Key Points

- Dynamically Inserting HTML: JavaScript is used within the content script to dynamically add a screensharing button to the webpage.
``` js
const button = document.createElement('button');
button.innerHTML = '📺';
document.body.appendChild(button);
```

- Triggering Surfly API Calls: The extension leverages the `browser.webfuseSession.startScreensharing()` method to invoke Surfly's screensharing functionality when the button is clicked.
``` js
button.addEventListener('click', function() {
    browser.webfuseSession.startScreensharing();
});
```
