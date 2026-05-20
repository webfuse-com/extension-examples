# Color Changer

This Extension allows you to change the color of the background of the page currently opened in the tab.

#### Key Points

- Listening for Messages: Utilizes `browser.runtime.onMessage.addListener` to listen for messages from the Popup HTML.
- Dynamic Style Changes: Based on the type of message received (`body_color`, `text_color`, `div_color`), the script dynamically updates the webpage's styles accordingly.
