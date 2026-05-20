const list = document.getElementById('list');

function render(items) {
  list.innerHTML = '';
  if (items.length === 0) {
    list.innerHTML = '<p><i>No entries yet</i></p>';
    return;
  }

  items.forEach((text, index) => {
    const div = document.createElement('div');
    div.className = 'entry';

    const span = document.createElement('span');
    span.textContent = text;

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'X';
    deleteBtn.onclick = () => {
      browser.runtime.sendMessage({ type: 'deleteEntry', index });
    };

    div.appendChild(span);
    div.appendChild(deleteBtn);
    list.appendChild(div);
  });
}

browser.runtime.onMessage.addListener((messageData, sender) => {
    if (messageData.type === 'receiveHighlights' && messageData.to === 'popup' && sender.name === 'background') {
        render(messageData.items);
    }
});

function refresh() {
  browser.runtime.sendMessage({ type: 'getHighlights' });
}

document.getElementById('clearBtn').onclick = () => {
  browser.runtime.sendMessage({ type: 'clearAll' });
};

// Load state on popup open
browser.browserAction.resizePopup(600, 300);
refresh();
