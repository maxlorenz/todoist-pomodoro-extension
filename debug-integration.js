// Debug script to test sidebar integration
// Run this in the browser console on Todoist to debug integration issues

console.log('=== Todoist Pomodoro Extension Debug ===');

// Check if extension is loaded
const extensionLoaded = !!document.querySelector('.pomodoro-timer-widget') || 
                       !!document.querySelector('.pomodoro-sidebar-container');
console.log('Extension loaded:', extensionLoaded);

// Check DOM structure
console.log('\n=== DOM Structure Analysis ===');

// Navigation elements
const allNavs = document.querySelectorAll('[role="navigation"]');
console.log('Navigation elements found:', allNavs.length);
allNavs.forEach((nav, i) => {
  console.log(`Nav ${i}:`, nav.getAttribute('aria-label'), nav.className);
});

// Scrollable container
const scrollableContainer = document.querySelector('[data-testid="app-sidebar-scrollable-container"]');
console.log('Scrollable container:', !!scrollableContainer);

// Top menu
const topMenu = document.querySelector('#top-menu');
console.log('Top menu found:', !!topMenu);
if (topMenu) {
  console.log('Top menu parent:', topMenu.parentElement?.className);
  console.log('Top menu siblings:', topMenu.parentElement?.children.length);
}

// Projects section
const projectsSelectors = [
  '.om0jL2_',
  '[data-expansion-panel-header="true"]',
  '[aria-label="Projects"]'
];

console.log('\n=== Projects Section Search ===');
projectsSelectors.forEach(selector => {
  const element = document.querySelector(selector);
  console.log(`${selector}:`, !!element);
  if (element) {
    console.log(`  - Parent:`, element.parentElement?.className);
    console.log(`  - Text content:`, element.textContent?.substring(0, 50));
  }
});

// Check for existing timer widgets
console.log('\n=== Timer Widget Status ===');
const timerWidget = document.querySelector('.pomodoro-timer-widget');
const sidebarContainer = document.querySelector('.pomodoro-sidebar-container');
console.log('Timer widget:', !!timerWidget);
console.log('Sidebar container:', !!sidebarContainer);

if (timerWidget) {
  console.log('Widget position:', timerWidget.style.position);
  console.log('Widget parent:', timerWidget.parentElement?.className);
}

// Check for content script
console.log('\n=== Content Script Status ===');
console.log('PomodoroTimer class available:', typeof window.PomodoroTimer !== 'undefined');

// Suggest next steps
console.log('\n=== Recommendations ===');
if (!extensionLoaded) {
  console.log('1. Make sure extension is loaded in Chrome');
  console.log('2. Check if content script is injected');
  console.log('3. Reload the page and check console for errors');
} else if (!sidebarContainer && timerWidget) {
  console.log('1. Timer widget exists but not in sidebar');
  console.log('2. Check sidebar integration logic');
  console.log('3. Look for console errors during integration');
} else {
  console.log('Extension appears to be working correctly!');
}