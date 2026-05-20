let highlightsState = [];

function addToHighlights(text) {
  highlightsState.unshift(text.trim());
  if (highlightsState.length > 10) highlightsState.pop();
}

const highlightsEvents = ['getHighlights', 'saveSelection', 'clearAll', 'deleteEntry'];
browser.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (!highlightsEvents.includes(msg.type)) {
    return;
  }

  if (msg.type === 'saveSelection' && msg.text) {
    addToHighlights(msg.text);
  } else if (msg.type === 'clearAll') {
    highlightsState = [];
  } else if (msg.type === 'deleteEntry' && msg.index > -1) {
    highlightsState.splice(msg.index, 1);
  }
  
  browser.runtime.sendMessage({type: 'receiveHighlights', to: 'popup', items: highlightsState});
});
