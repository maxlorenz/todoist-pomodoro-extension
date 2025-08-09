/**
 * Background service for managing Pomodoro timer notifications and tab interactions
 * Handles timer state persistence, notifications, and communication with content scripts
 */
class BackgroundService {
  /**
   * Initialize the background service
   */
  constructor() {
    /** @type {Object|null} Current active timer state */
    this.currentTimer = null;
    /** @type {string} Notification ID for Chrome notifications API */
    this.notificationId = 'pomodoro-notification';
    
    this.init();
  }
  
  /**
   * Initialize background service components
   * Sets up message listeners, notification handlers, and restores timer state
   */
  init() {
    this.setupMessageListeners();
    this.setupNotificationListeners();
    this.restoreTimerState();
  }
  
  /**
   * Set up message listeners for communication with content scripts and popup
   * Handles timer events, notification requests, and state queries
   */
  setupMessageListeners() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      switch (message.action) {
      case 'timerStarted':
        this.handleTimerStarted(message.timer);
        break;
      case 'showNotification':
        this.showNotification(message.title, message.message);
        break;
      case 'getBackgroundTimerState':
        sendResponse({ currentTimer: this.currentTimer });
        break;
      }
    });
  }
  
  setupNotificationListeners() {
    chrome.notifications.onClicked.addListener((notificationId) => {
      if (notificationId === this.notificationId) {
        this.focusTodoistTab();
      }
    });
    
    chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
      if (notificationId === this.notificationId) {
        if (buttonIndex === 0) {
          this.startBreakTimer();
        }
      }
    });
  }
  
  async restoreTimerState() {
    try {
      const result = await chrome.storage.local.get(['currentTimer']);
      if (result.currentTimer) {
        this.currentTimer = result.currentTimer;
      }
    } catch (error) {
      console.warn('Failed to restore timer state:', error);
    }
  }
  
  handleTimerStarted(timer) {
    this.currentTimer = timer;
    this.clearExistingNotifications();
  }
  
  /**
   * Display a Chrome notification with the given title and message
   * @param {string} title - Notification title
   * @param {string} message - Notification message
   * @param {Array<Object>} [buttons=null] - Optional notification buttons
   */
  async showNotification(title, message, buttons = null) {
    try {
      await this.clearExistingNotifications();
      
      const options = {
        type: 'basic',
        iconUrl: 'assets/icon48.png',
        title,
        message,
        priority: 2,
        requireInteraction: true
      };
      
      if (buttons) {
        options.buttons = buttons;
      }
      
      chrome.notifications.create(this.notificationId, options);
    } catch (error) {
      console.warn('Failed to show notification:', error);
    }
  }
  
  async clearExistingNotifications() {
    try {
      await chrome.notifications.clear(this.notificationId);
    } catch (error) {
      console.warn('Failed to clear notifications:', error);
    }
  }
  
  async focusTodoistTab() {
    try {
      const tabs = await chrome.tabs.query({ url: 'https://app.todoist.com/*' });
      
      if (tabs.length > 0) {
        const tab = tabs[0];
        await chrome.windows.update(tab.windowId, { focused: true });
        await chrome.tabs.update(tab.id, { active: true });
      } else {
        await chrome.tabs.create({ url: 'https://app.todoist.com' });
      }
    } catch (error) {
      console.warn('Failed to focus Todoist tab:', error);
    }
  }
  
  async startBreakTimer() {
    try {
      const tabs = await chrome.tabs.query({ url: 'https://app.todoist.com/*' });
      
      if (tabs.length > 0) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'startBreak'
        });
      }
    } catch (error) {
      console.warn('Failed to start break timer:', error);
    }
  }
  

}

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.tabs.create({ url: 'https://app.todoist.com' });
  }
});

chrome.action.onClicked.addListener(async (tab) => {
  if (tab.url && tab.url.includes('app.todoist.com')) {
    return;
  }
  
  const todoistTabs = await chrome.tabs.query({ url: 'https://app.todoist.com/*' });
  
  if (todoistTabs.length > 0) {
    const todoistTab = todoistTabs[0];
    await chrome.windows.update(todoistTab.windowId, { focused: true });
    await chrome.tabs.update(todoistTab.id, { active: true });
  } else {
    chrome.tabs.create({ url: 'https://app.todoist.com' });
  }
});

new BackgroundService();