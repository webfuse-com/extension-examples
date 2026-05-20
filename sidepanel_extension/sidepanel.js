// DOM elements
const sideToggle = document.getElementById('sideToggle');
const behaviorToggle = document.getElementById('behaviorToggle');
const sideIndicator = document.getElementById('sideIndicator');

// Side toggle (right = checked, left = unchecked)
sideToggle.addEventListener('change', () => {
  const side = sideToggle.checked ? 'right' : 'left';
  updateSideIndicator(side);

  browser.sidePanel.setLayout({ side });
});

// Behavior toggle
behaviorToggle.addEventListener('change', () => {
  const openOnClick = behaviorToggle.checked;

  browser.sidePanel.setPanelBehavior({ openPanelOnActionClick: openOnClick });
});

// Update side indicator visual
function updateSideIndicator(side) {
  sideIndicator.className = `side-indicator ${side}`;
}
