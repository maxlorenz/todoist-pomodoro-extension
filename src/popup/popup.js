/**
 * Popup controller for managing extension settings and quick timer functionality
 * Handles user preferences, settings persistence, and quick timer creation
 */
class PopupController {
  /**
   * Initialize the popup controller with default settings
   */
  constructor() {
    /** @type {Object|null} Current timer state reference */
    this.currentTimer = null;
    /** @type {number|null} Update interval ID for UI refresh */
    this.updateInterval = null;
    /** @type {Object} Pomodoro timer settings */
    this.settings = {
      workDuration: 25,
      shortBreak: 5,
      longBreak: 15,
      sessionsUntilLongBreak: 4
    };
    this.init();
  }

  async init() {
    await this.loadSettings();
    this.bindUI();
  }

  // ---------- Settings ----------
  async loadSettings() {
    try {
      const { pomodoroSettings } = await chrome.storage.sync.get(['pomodoroSettings']);
      if (pomodoroSettings) {
        this.settings = { ...this.settings, ...pomodoroSettings };
      }
      this.syncSettingsUI();
    } catch (e) {
      console.warn('Settings load failed:', e);
    }
  }

  syncSettingsUI() {
    const S = this.settings;
    document.getElementById('work-duration').value = S.workDuration;
    document.getElementById('short-break').value = S.shortBreak;
    document.getElementById('long-break').value = S.longBreak;
    document.getElementById('sessions-until-long').value = S.sessionsUntilLongBreak;
  }

  async saveSettings() {
    try {
      this.settings = {
        workDuration: parseInt(document.getElementById('work-duration').value, 10),
        shortBreak: parseInt(document.getElementById('short-break').value, 10),
        longBreak: parseInt(document.getElementById('long-break').value, 10),
        sessionsUntilLongBreak: parseInt(document.getElementById('sessions-until-long').value, 10)
      };
      
      console.log('Saving settings:', this.settings);
      await chrome.storage.sync.set({ pomodoroSettings: this.settings });
      console.log('Settings saved to storage');
      
      // Also update content script settings
      try {
        const tabs = await chrome.tabs.query({ url: 'https://app.todoist.com/*' });
        if (tabs.length > 0) {
          console.log('Sending settings to content script:', this.settings);
          chrome.tabs.sendMessage(tabs[0].id, { 
            action: 'updateSettings', 
            settings: this.settings 
          });
        }
      } catch (e) {
        console.warn('Could not update content script:', e);
      }
      
      this.flashSaved();
      
      // Close popup after saving settings
      setTimeout(() => {
        window.close();
      }, 800); // Wait a bit to show the "Saved" feedback
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }

  flashSaved() {
    const btn = document.getElementById('save-settings');
    const prev = btn.textContent;
    btn.textContent = 'Saved';
    btn.classList.add('saved');
    setTimeout(() => { btn.textContent = prev; btn.classList.remove('saved'); }, 1300);
  }

  // ---------- UI events ----------
  bindUI() {
    document.getElementById('save-settings').addEventListener('click', () => this.saveSettings());

    // Save on Enter in any settings input
    ['work-duration','short-break','long-break','sessions-until-long'].forEach(id => {
      document.getElementById(id).addEventListener('keydown', (e) => {
        if (e.key === 'Enter') this.saveSettings();
      });
    });
  }



  /**
   * Start a quick timer with specified task name and duration
   * @param {string} taskName - Name of the task for the timer
   * @param {number} duration - Timer duration in milliseconds
   */
  async startQuickTimer(taskName, duration) {
    try {
      const quickTimer = {
        taskId: 'quick-' + Date.now(),
        taskName,
        duration,
        remaining: duration,
        status: 'running',
        type: duration <= 15 * 60 * 1000 ? 'break' : 'work',
        startTime: Date.now(),
        completedSessions: 0,
        taskTotalPomodoros: 0,
        taskTodayPomodoros: 0
      };

      await chrome.storage.local.set({ currentTimer: quickTimer });
      
      // Tell content script to start the timer
      try {
        const tabs = await chrome.tabs.query({ url: 'https://app.todoist.com/*' });
        if (tabs.length > 0) {
          chrome.tabs.sendMessage(tabs[0].id, { 
            action: 'startQuickTimer', 
            timer: quickTimer 
          });
        }
      } catch (e) {
        console.warn('Could not communicate with Todoist tab:', e);
      }
      
      // Close popup after starting timer
      window.close();
    } catch (e) {
      console.error('quick start failed', e);
    }
  }

  destroy() {
    // Cleanup if needed
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.popupController = new PopupController();
});
window.addEventListener('beforeunload', () => {
  if (window.popupController) window.popupController.destroy();
});

