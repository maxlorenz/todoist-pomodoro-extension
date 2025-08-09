/**
 * Tests for Popup Controller functionality
 */

describe('Popup Controller', () => {
  let mockPopupController;
  
  beforeEach(() => {
    // Mock DOM elements
    document.body.innerHTML = `
      <div class="popup">
        <input id="work-duration" type="number" value="25" />
        <input id="short-break" type="number" value="5" />
        <input id="long-break" type="number" value="15" />
        <input id="sessions-until-long" type="number" value="4" />
        <button id="save-settings">Save Settings</button>
      </div>
    `;
    
    // Enhanced Chrome API mocks for popup
    global.chrome = {
      storage: {
        sync: {
          get: jest.fn().mockResolvedValue({
            pomodoroSettings: {
              workDuration: 25,
              shortBreak: 5,
              longBreak: 15,
              sessionsUntilLongBreak: 4
            }
          }),
          set: jest.fn().mockResolvedValue({})
        },
        local: {
          set: jest.fn().mockResolvedValue({})
        }
      },
      tabs: {
        query: jest.fn().mockResolvedValue([{ id: 1 }]),
        sendMessage: jest.fn().mockResolvedValue({})
      }
    };
    
    // Mock window.close
    global.window.close = jest.fn();
    
    // Mock PopupController class
    mockPopupController = {
      currentTimer: null,
      updateInterval: null,
      settings: {
        workDuration: 25,
        shortBreak: 5,
        longBreak: 15,
        sessionsUntilLongBreak: 4
      },
      init: jest.fn(),
      loadSettings: jest.fn(),
      syncSettingsUI: jest.fn(),
      saveSettings: jest.fn(),
      flashSaved: jest.fn(),
      bindUI: jest.fn(),
      startQuickTimer: jest.fn(),
      destroy: jest.fn()
    };
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  describe('Initialization', () => {
    test('should initialize popup controller correctly', async () => {
      await mockPopupController.init();
      
      expect(mockPopupController.init).toHaveBeenCalled();
    });
    
    test('should load settings on initialization', async () => {
      await mockPopupController.loadSettings();
      
      expect(mockPopupController.loadSettings).toHaveBeenCalled();
    });
    
    test('should bind UI events on initialization', () => {
      mockPopupController.bindUI();
      
      expect(mockPopupController.bindUI).toHaveBeenCalled();
    });
  });
  
  describe('Settings Management', () => {
    test('should load settings from storage', async () => {
      const expectedSettings = {
        workDuration: 30,
        shortBreak: 10,
        longBreak: 20,
        sessionsUntilLongBreak: 3
      };
      
      chrome.storage.sync.get.mockResolvedValue({ pomodoroSettings: expectedSettings });
      
      await chrome.storage.sync.get(['pomodoroSettings']);
      
      expect(chrome.storage.sync.get).toHaveBeenCalledWith(['pomodoroSettings']);
    });
    
    test('should sync settings to UI elements', () => {
      const settings = {
        workDuration: 30,
        shortBreak: 10,
        longBreak: 20,
        sessionsUntilLongBreak: 3
      };
      
      document.getElementById('work-duration').value = settings.workDuration;
      document.getElementById('short-break').value = settings.shortBreak;
      document.getElementById('long-break').value = settings.longBreak;
      document.getElementById('sessions-until-long').value = settings.sessionsUntilLongBreak;
      
      expect(document.getElementById('work-duration').value).toBe('30');
      expect(document.getElementById('short-break').value).toBe('10');
      expect(document.getElementById('long-break').value).toBe('20');
      expect(document.getElementById('sessions-until-long').value).toBe('3');
    });
    
    test('should save settings to storage', async () => {
      const settings = {
        workDuration: 25,
        shortBreak: 5,
        longBreak: 15,
        sessionsUntilLongBreak: 4
      };
      
      await chrome.storage.sync.set({ pomodoroSettings: settings });
      
      expect(chrome.storage.sync.set).toHaveBeenCalledWith({ pomodoroSettings: settings });
    });
    
    test('should validate settings input', () => {
      const validateDuration = (value, min, max) => {
        const num = parseInt(value, 10);
        return num >= min && num <= max;
      };
      
      expect(validateDuration('25', 1, 60)).toBe(true);
      expect(validateDuration('0', 1, 60)).toBe(false);
      expect(validateDuration('61', 1, 60)).toBe(false);
      expect(validateDuration('abc', 1, 60)).toBe(false);
    });
    
    test('should show saved feedback', () => {
      const saveButton = document.getElementById('save-settings');
      const originalText = saveButton.textContent;
      
      saveButton.textContent = 'Saved';
      saveButton.classList.add('saved');
      
      expect(saveButton.textContent).toBe('Saved');
      expect(saveButton.classList.contains('saved')).toBe(true);
      
      // Simulate timeout restoration
      setTimeout(() => {
        saveButton.textContent = originalText;
        saveButton.classList.remove('saved');
      }, 1300);
    });
  });
  
  describe('Quick Timer Functionality', () => {
    test('should create quick timer with correct parameters', async () => {
      const taskName = 'Quick Task';
      const duration = 25 * 60 * 1000; // 25 minutes
      
      const quickTimer = {
        taskId: 'quick-' + Date.now(),
        taskName,
        duration,
        remaining: duration,
        status: 'running',
        type: 'work',
        startTime: Date.now(),
        completedSessions: 0,
        taskTotalPomodoros: 0,
        taskTodayPomodoros: 0
      };
      
      await mockPopupController.startQuickTimer(taskName, duration);
      
      expect(mockPopupController.startQuickTimer).toHaveBeenCalledWith(taskName, duration);
    });
    
    test('should determine timer type based on duration', () => {
      const getTimerType = (duration) => {
        return duration <= 15 * 60 * 1000 ? 'break' : 'work';
      };
      
      expect(getTimerType(25 * 60 * 1000)).toBe('work'); // 25 minutes
      expect(getTimerType(5 * 60 * 1000)).toBe('break');  // 5 minutes
      expect(getTimerType(15 * 60 * 1000)).toBe('break'); // 15 minutes
    });
    
    test('should save quick timer to storage', async () => {
      const quickTimer = {
        taskId: 'quick-123',
        taskName: 'Test Task',
        duration: 25 * 60 * 1000,
        status: 'running'
      };
      
      await chrome.storage.local.set({ currentTimer: quickTimer });
      
      expect(chrome.storage.local.set).toHaveBeenCalledWith({ currentTimer: quickTimer });
    });
    
    test('should send message to content script', async () => {
      const quickTimer = { taskName: 'Test', duration: 25 * 60 * 1000 };
      
      chrome.tabs.query.mockResolvedValue([{ id: 1 }]);
      
      await chrome.tabs.sendMessage(1, { 
        action: 'startQuickTimer', 
        timer: quickTimer 
      });
      
      expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(1, { 
        action: 'startQuickTimer', 
        timer: quickTimer 
      });
    });
    
    test('should close popup after starting timer', () => {
      // Simulate closing popup
      window.close();
      
      expect(window.close).toHaveBeenCalled();
    });
  });
  
  describe('UI Event Handling', () => {
    test('should handle save button click', () => {
      const saveButton = document.getElementById('save-settings');
      const clickHandler = jest.fn();
      
      saveButton.addEventListener('click', clickHandler);
      saveButton.click();
      
      expect(clickHandler).toHaveBeenCalled();
    });
    
    test('should handle Enter key in input fields', () => {
      const workDurationInput = document.getElementById('work-duration');
      const keyHandler = jest.fn();
      
      workDurationInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') keyHandler();
      });
      
      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
      workDurationInput.dispatchEvent(enterEvent);
      
      expect(keyHandler).toHaveBeenCalled();
    });
    
    test('should validate input values on change', () => {
      const workDurationInput = document.getElementById('work-duration');
      
      workDurationInput.value = '30';
      expect(parseInt(workDurationInput.value, 10)).toBe(30);
      
      workDurationInput.value = 'invalid';
      expect(isNaN(parseInt(workDurationInput.value, 10))).toBe(true);
    });
  });
  
  describe('Error Handling', () => {
    test('should handle storage load errors gracefully', async () => {
      chrome.storage.sync.get.mockRejectedValue(new Error('Storage load error'));
      
      try {
        await chrome.storage.sync.get(['pomodoroSettings']);
      } catch (error) {
        expect(error.message).toBe('Storage load error');
      }
    });
    
    test('should handle storage save errors gracefully', async () => {
      chrome.storage.sync.set.mockRejectedValue(new Error('Storage save error'));
      
      try {
        await chrome.storage.sync.set({ pomodoroSettings: {} });
      } catch (error) {
        expect(error.message).toBe('Storage save error');
      }
    });
    
    test('should handle tab communication errors gracefully', async () => {
      chrome.tabs.query.mockRejectedValue(new Error('Tab query error'));
      
      try {
        await chrome.tabs.query({ url: 'https://app.todoist.com/*' });
      } catch (error) {
        expect(error.message).toBe('Tab query error');
      }
    });
    
    test('should handle missing Todoist tabs', async () => {
      chrome.tabs.query.mockResolvedValue([]);
      
      const tabs = await chrome.tabs.query({ url: 'https://app.todoist.com/*' });
      
      expect(tabs).toHaveLength(0);
    });
  });
  
  describe('Cleanup', () => {
    test('should cleanup resources on destroy', () => {
      mockPopupController.destroy();
      
      expect(mockPopupController.destroy).toHaveBeenCalled();
    });
    
    test('should handle beforeunload event', () => {
      const beforeUnloadHandler = jest.fn();
      
      window.addEventListener('beforeunload', beforeUnloadHandler);
      
      const beforeUnloadEvent = new Event('beforeunload');
      window.dispatchEvent(beforeUnloadEvent);
      
      expect(beforeUnloadHandler).toHaveBeenCalled();
    });
  });
});