# Draggable Popup

This Extension demonstrates how to create a draggable popup that can be repositioned anywhere on the screen using the `getPopupPosition()` and `setPopupPosition()` APIs.

#### Key Points

- **Position APIs**: Uses `browser.browserAction.getPopupPosition()` to retrieve the current position and `browser.browserAction.setPopupPosition()` to update it during dragging.
- **Mouse Events**: Tracks `mousedown`, `mousemove`, and `mouseup` events to handle the drag interaction.
- **Delta Calculation**: Calculates the distance the mouse has moved from the initial click position to determine the new popup position.
- **Boundary Prevention**: Uses `Math.max(0, ...)` to prevent the popup from being dragged off-screen (negative coordinates).
