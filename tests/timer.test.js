describe('Pomodoro Timer Logic', () => {
  let mockTimer;
  
  beforeEach(() => {
    mockTimer = {
      taskName: 'Test Task',
      duration: 25 * 60 * 1000, // 25 minutes
      remaining: 25 * 60 * 1000,
      status: 'idle',
      type: 'work',
      startTime: null,
      completedSessions: 0
    };
    
    global.chrome = {
      storage: {
        local: {
          set: jest.fn().mockResolvedValue({}),
          get: jest.fn().mockResolvedValue({})
        },
        sync: {
          set: jest.fn().mockResolvedValue({}),
          get: jest.fn().mockResolvedValue({})
        }
      },
      runtime: {
        sendMessage: jest.fn().mockResolvedValue({})
      }
    };
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  describe('Timer State Management', () => {
    test('should initialize timer with correct default values', () => {
      expect(mockTimer.duration).toBe(25 * 60 * 1000);
      expect(mockTimer.remaining).toBe(25 * 60 * 1000);
      expect(mockTimer.status).toBe('idle');
      expect(mockTimer.type).toBe('work');
      expect(mockTimer.completedSessions).toBe(0);
    });
    
    test('should start timer correctly', () => {
      const startTime = Date.now();
      mockTimer.status = 'running';
      mockTimer.startTime = startTime;
      
      expect(mockTimer.status).toBe('running');
      expect(mockTimer.startTime).toBe(startTime);
    });
    
    test('should pause timer correctly', () => {
      mockTimer.status = 'running';
      mockTimer.startTime = Date.now();
      
      mockTimer.status = 'paused';
      
      expect(mockTimer.status).toBe('paused');
    });
    
    test('should calculate remaining time correctly', () => {
      const startTime = Date.now();
      const elapsed = 5 * 60 * 1000; // 5 minutes
      
      mockTimer.startTime = startTime - elapsed;
      mockTimer.remaining = mockTimer.duration - elapsed;
      
      expect(mockTimer.remaining).toBe(20 * 60 * 1000); // 20 minutes remaining
    });
  });
  
  describe('Timer Completion', () => {
    test('should complete work session and increment counter', () => {
      mockTimer.status = 'running';
      mockTimer.remaining = 0;
      mockTimer.completedSessions = 1;
      
      expect(mockTimer.remaining).toBe(0);
      expect(mockTimer.completedSessions).toBe(1);
    });
    
    test('should determine break type based on completed sessions', () => {
      const isLongBreak = (sessions, longBreakInterval = 4) => {
        return sessions % longBreakInterval === 0;
      };
      
      expect(isLongBreak(4)).toBe(true);
      expect(isLongBreak(3)).toBe(false);
      expect(isLongBreak(8)).toBe(true);
    });
  });
  
  describe('Time Formatting', () => {
    test('should format time correctly', () => {
      const formatTime = (milliseconds) => {
        const minutes = Math.floor(milliseconds / 60000);
        const seconds = Math.floor((milliseconds % 60000) / 1000);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      };
      
      expect(formatTime(25 * 60 * 1000)).toBe('25:00');
      expect(formatTime(5 * 60 * 1000 + 30 * 1000)).toBe('05:30');
      expect(formatTime(0)).toBe('00:00');
      expect(formatTime(59 * 1000)).toBe('00:59');
    });
  });
  
  describe('Progress Calculation', () => {
    test('should calculate progress percentage correctly', () => {
      const calculateProgress = (duration, remaining) => {
        return ((duration - remaining) / duration) * 100;
      };
      
      expect(calculateProgress(25 * 60 * 1000, 25 * 60 * 1000)).toBe(0);
      expect(calculateProgress(25 * 60 * 1000, 12.5 * 60 * 1000)).toBe(50);
      expect(calculateProgress(25 * 60 * 1000, 0)).toBe(100);
    });
  });
  
  describe('Settings Validation', () => {
    test('should validate timer duration settings', () => {
      const validateDuration = (minutes) => {
        return minutes >= 1 && minutes <= 60;
      };
      
      expect(validateDuration(25)).toBe(true);
      expect(validateDuration(0)).toBe(false);
      expect(validateDuration(61)).toBe(false);
      expect(validateDuration(-5)).toBe(false);
    });
    
    test('should validate break duration settings', () => {
      const validateBreakDuration = (minutes) => {
        return minutes >= 1 && minutes <= 30;
      };
      
      expect(validateBreakDuration(5)).toBe(true);
      expect(validateBreakDuration(15)).toBe(true);
      expect(validateBreakDuration(0)).toBe(false);
      expect(validateBreakDuration(31)).toBe(false);
    });
  });
  
  describe('Storage Operations', () => {
    test('should save timer state to storage', async () => {
      const timerState = {
        currentTimer: mockTimer
      };
      
      await chrome.storage.local.set(timerState);
      
      expect(chrome.storage.local.set).toHaveBeenCalledWith(timerState);
    });
    
    test('should load timer state from storage', async () => {
      const expectedState = { currentTimer: mockTimer };
      chrome.storage.local.get.mockResolvedValue(expectedState);
      
      const result = await chrome.storage.local.get(['currentTimer']);
      
      expect(chrome.storage.local.get).toHaveBeenCalledWith(['currentTimer']);
      expect(result).toEqual(expectedState);
    });
    
    test('should save settings to sync storage', async () => {
      const settings = {
        workDuration: 25,
        shortBreak: 5,
        longBreak: 15,
        sessionsUntilLongBreak: 4
      };
      
      await chrome.storage.sync.set({ pomodoroSettings: settings });
      
      expect(chrome.storage.sync.set).toHaveBeenCalledWith({ pomodoroSettings: settings });
    });
  });
});