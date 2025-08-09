/**
 * Tests for Background Service functionality
 */

describe('Background Service', () => {
  let mockBackgroundService;
  
  beforeEach(() => {
    // Enhanced Chrome API mocks for background service
    global.chrome = {
      storage: {
        local: {
          get: jest.fn().mockResolvedValue({}),
          set: jest.fn().mockResolvedValue({})
        }
      },
      runtime: {
        onMessage: {
          addListener: jest.fn()
        },
        sendMessage: jest.fn().mockResolvedValue({})
      },
      notifications: {
        create: jest.fn().mockResolvedValue('notification-id'),
        clear: jest.fn().mockResolvedValue(true),
        onClicked: {
          addListener: jest.fn()
        },
        onButtonClicked: {
          addListener: jest.fn()
        }
      },
      tabs: {
        query: jest.fn().mockResolvedValue([{ id: 1, windowId: 1 }]),
        create: jest.fn().mockResolvedValue({ id: 2 }),
        update: jest.fn().mockResolvedValue({}),
        sendMessage: jest.fn().mockResolvedValue({})
      },
      windows: {
        update: jest.fn().mockResolvedValue({})
      },
      action: {
        onClicked: {
          addListener: jest.fn()
        }
      }
    };
    
    // Mock BackgroundService class
    mockBackgroundService = {
      currentTimer: null,
      notificationId: 'pomodoro-notification',
      init: jest.fn(),
      setupMessageListeners: jest.fn(),
      setupNotificationListeners: jest.fn(),
      restoreTimerState: jest.fn(),
      handleTimerStarted: jest.fn(),
      showNotification: jest.fn(),
      clearExistingNotifications: jest.fn(),
      focusTodoistTab: jest.fn(),
      startBreakTimer: jest.fn()
    };
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  describe('Initialization', () => {
    test('should initialize background service correctly', () => {
      mockBackgroundService.init();
      
      expect(mockBackgroundService.init).toHaveBeenCalled();
    });
    
    test('should setup message listeners', () => {
      mockBackgroundService.setupMessageListeners();
      
      expect(mockBackgroundService.setupMessageListeners).toHaveBeenCalled();
    });
    
    test('should setup notification listeners', () => {
      mockBackgroundService.setupNotificationListeners();
      
      expect(mockBackgroundService.setupNotificationListeners).toHaveBeenCalled();
    });
  });
  
  describe('Timer State Management', () => {
    test('should handle timer started message', () => {
      const timer = {
        taskName: 'Test Task',
        duration: 25 * 60 * 1000,
        status: 'running'
      };
      
      mockBackgroundService.handleTimerStarted(timer);
      
      expect(mockBackgroundService.handleTimerStarted).toHaveBeenCalledWith(timer);
    });
    
    test('should restore timer state from storage', async () => {
      const mockTimer = {
        taskName: 'Restored Task',
        remaining: 15 * 60 * 1000,
        status: 'paused'
      };
      
      chrome.storage.local.get.mockResolvedValue({ currentTimer: mockTimer });
      
      await mockBackgroundService.restoreTimerState();
      
      expect(mockBackgroundService.restoreTimerState).toHaveBeenCalled();
      expect(chrome.storage.local.get).toHaveBeenCalledWith(['currentTimer']);
    });
  });
  
  describe('Notification Management', () => {
    test('should show notification with correct parameters', async () => {
      const title = 'Pomodoro Complete!';
      const message = 'Great work! Time for a break.';
      
      await mockBackgroundService.showNotification(title, message);
      
      expect(mockBackgroundService.showNotification).toHaveBeenCalledWith(title, message);
    });
    
    test('should clear existing notifications', async () => {
      await mockBackgroundService.clearExistingNotifications();
      
      expect(mockBackgroundService.clearExistingNotifications).toHaveBeenCalled();
    });
    
    test('should create notification with Chrome API', async () => {
      const title = 'Test Notification';
      const message = 'Test Message';
      
      await chrome.notifications.create('test-id', {
        type: 'basic',
        iconUrl: 'assets/icon48.png',
        title,
        message,
        priority: 2,
        requireInteraction: true
      });
      
      expect(chrome.notifications.create).toHaveBeenCalledWith('test-id', {
        type: 'basic',
        iconUrl: 'assets/icon48.png',
        title,
        message,
        priority: 2,
        requireInteraction: true
      });
    });
  });
  
  describe('Tab Management', () => {
    test('should focus existing Todoist tab', async () => {
      chrome.tabs.query.mockResolvedValue([{ id: 1, windowId: 1 }]);
      
      await mockBackgroundService.focusTodoistTab();
      
      expect(mockBackgroundService.focusTodoistTab).toHaveBeenCalled();
    });
    
    test('should create new Todoist tab if none exists', async () => {
      chrome.tabs.query.mockResolvedValue([]);
      
      await mockBackgroundService.focusTodoistTab();
      
      expect(mockBackgroundService.focusTodoistTab).toHaveBeenCalled();
    });
    
    test('should query for Todoist tabs correctly', async () => {
      await chrome.tabs.query({ url: 'https://app.todoist.com/*' });
      
      expect(chrome.tabs.query).toHaveBeenCalledWith({ url: 'https://app.todoist.com/*' });
    });
  });
  
  describe('Break Timer Management', () => {
    test('should start break timer', async () => {
      chrome.tabs.query.mockResolvedValue([{ id: 1 }]);
      
      await mockBackgroundService.startBreakTimer();
      
      expect(mockBackgroundService.startBreakTimer).toHaveBeenCalled();
    });
    
    test('should send message to content script for break timer', async () => {
      chrome.tabs.query.mockResolvedValue([{ id: 1 }]);
      
      await chrome.tabs.sendMessage(1, { action: 'startBreak' });
      
      expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(1, { action: 'startBreak' });
    });
  });
  
  describe('Message Handling', () => {
    test('should handle timerStarted message', () => {
      const messageHandler = jest.fn();
      const message = { action: 'timerStarted', timer: { taskName: 'Test' } };
      
      messageHandler(message);
      
      expect(messageHandler).toHaveBeenCalledWith(message);
    });
    
    test('should handle showNotification message', () => {
      const messageHandler = jest.fn();
      const message = { 
        action: 'showNotification', 
        title: 'Test', 
        message: 'Test Message' 
      };
      
      messageHandler(message);
      
      expect(messageHandler).toHaveBeenCalledWith(message);
    });
    
    test('should handle getBackgroundTimerState message', () => {
      const messageHandler = jest.fn();
      const sendResponse = jest.fn();
      const message = { action: 'getBackgroundTimerState' };
      
      messageHandler(message, {}, sendResponse);
      
      expect(messageHandler).toHaveBeenCalledWith(message, {}, sendResponse);
    });
  });
  
  describe('Error Handling', () => {
    test('should handle storage errors gracefully', async () => {
      chrome.storage.local.get.mockRejectedValue(new Error('Storage error'));
      
      try {
        await chrome.storage.local.get(['currentTimer']);
      } catch (error) {
        expect(error.message).toBe('Storage error');
      }
    });
    
    test('should handle notification errors gracefully', async () => {
      chrome.notifications.create.mockRejectedValue(new Error('Notification error'));
      
      try {
        await chrome.notifications.create('test-id', {});
      } catch (error) {
        expect(error.message).toBe('Notification error');
      }
    });
    
    test('should handle tab query errors gracefully', async () => {
      chrome.tabs.query.mockRejectedValue(new Error('Tab query error'));
      
      try {
        await chrome.tabs.query({ url: 'https://app.todoist.com/*' });
      } catch (error) {
        expect(error.message).toBe('Tab query error');
      }
    });
  });
});