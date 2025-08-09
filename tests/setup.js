/**
 * Jest setup file for Todoist Pomodoro Extension tests
 */

// Mock Chrome APIs
global.chrome = {
  storage: {
    local: {
      get: jest.fn((keys, callback) => {
        const mockData = {
          pomodoroSettings: {
            workDuration: 25,
            shortBreakDuration: 5,
            longBreakDuration: 15,
            longBreakInterval: 4
          },
          pomodoroStats: {}
        };
        callback(mockData);
      }),
      set: jest.fn((data, callback) => {
        if (callback) callback();
      })
    },
    sync: {
      get: jest.fn((keys, callback) => callback({})),
      set: jest.fn((data, callback) => {
        if (callback) callback();
      })
    }
  },
  runtime: {
    sendMessage: jest.fn(),
    onMessage: {
      addListener: jest.fn()
    }
  },
  tabs: {
    query: jest.fn(),
    sendMessage: jest.fn()
  }
};

// Mock DOM methods
Object.defineProperty(window, 'getComputedStyle', {
  value: () => ({
    getPropertyValue: () => ''
  })
});

// Mock CSS.escape
global.CSS = {
  escape: jest.fn((str) => str.replace(/[!"#$%&'()*+,.\/:;<=>?@[\\\]^`{|}~]/g, '\\$&'))
};

// Suppress console warnings in tests unless explicitly testing them
const originalConsoleWarn = console.warn;
console.warn = (...args) => {
  if (!args[0]?.includes('test-specific-warning')) {
    // Suppress warnings unless they're test-specific
  }
};

// Restore console.warn after tests if needed
afterAll(() => {
  console.warn = originalConsoleWarn;
});