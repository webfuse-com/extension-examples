let lastSelection = '';

document.addEventListener('mouseup', () => {
  const selection = window.getSelection().toString().trim();
  if (selection && selection !== lastSelection) {
    lastSelection = selection;
    browser.runtime.sendMessage({ type: 'saveSelection', text: selection });
    showNotification('Saved to Highlights Manager');
  }
});

function showNotification(message) {
  // Avoid stacking: remove existing
  const existing = document.getElementById('highlights-ext-notification');
  if (existing) existing.remove();

  const div = document.createElement('span');
  div.id = 'highlights-ext-notification';
  div.textContent = message;

  Object.assign(div.style, {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    background: 'rgba(0,0,0,0.8)',
    color: 'white',
    padding: '8px 12px',
    borderRadius: '6px',
    fontSize: '14px',
    zIndex: '999999',
    fontFamily: 'sans-serif',
    display: 'inline-block',
  });

  document.body.appendChild(div);

  setTimeout(() => {
    div.remove();
  }, 3000);
}
