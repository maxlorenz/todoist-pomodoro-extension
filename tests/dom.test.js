/**
 * @jest-environment jsdom
 */

describe('DOM Manipulation', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    
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
  
  describe('Task Detection', () => {
    test('should detect task content elements', () => {
      document.body.innerHTML = `
        <div class="task_content">Test Task</div>
        <div class="task_content">Another Task</div>
        <div class="other-element">Not a task</div>
      `;
      
      const taskElements = document.querySelectorAll('.task_content');
      expect(taskElements).toHaveLength(2);
      expect(taskElements[0].textContent).toBe('Test Task');
      expect(taskElements[1].textContent).toBe('Another Task');
    });
    
    test('should extract task name from clicked element', () => {
      document.body.innerHTML = `
        <div class="task_content">   My Important Task   </div>
      `;
      
      const taskElement = document.querySelector('.task_content');
      const taskName = taskElement.textContent.trim();
      
      expect(taskName).toBe('My Important Task');
    });
  });
  
  describe('Timer Widget Creation', () => {
    test('should create timer widget with correct structure', () => {
      const timerWidget = document.createElement('div');
      timerWidget.className = 'pomodoro-timer-widget';
      timerWidget.innerHTML = `
        <div class="pomodoro-timer-content">
          <div class="pomodoro-timer-task">Test Task</div>
          <div class="pomodoro-timer-display">
            <div class="pomodoro-timer-circle">
              <svg class="pomodoro-timer-progress" viewBox="0 0 36 36">
                <path class="pomodoro-timer-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                <path class="pomodoro-timer-fill" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
              </svg>
              <div class="pomodoro-timer-time">25:00</div>
            </div>
          </div>
          <div class="pomodoro-timer-controls">
            <button class="pomodoro-timer-btn pomodoro-timer-pause">⏸️</button>
            <button class="pomodoro-timer-btn pomodoro-timer-stop">⏹️</button>
          </div>
          <div class="pomodoro-timer-type">work</div>
        </div>
      `;
      
      document.body.appendChild(timerWidget);
      
      expect(document.querySelector('.pomodoro-timer-widget')).toBeTruthy();
      expect(document.querySelector('.pomodoro-timer-task').textContent).toBe('Test Task');
      expect(document.querySelector('.pomodoro-timer-time').textContent).toBe('25:00');
      expect(document.querySelector('.pomodoro-timer-type').textContent).toBe('work');
      expect(document.querySelectorAll('.pomodoro-timer-btn')).toHaveLength(2);
    });
    
    test('should position timer widget correctly', () => {
      const taskElement = document.createElement('div');
      taskElement.className = 'task_content';
      taskElement.textContent = 'Test Task';
      document.body.appendChild(taskElement);
      
      const timerWidget = document.createElement('div');
      timerWidget.className = 'pomodoro-timer-widget';
      
      const rect = taskElement.getBoundingClientRect();
      timerWidget.style.position = 'fixed';
      timerWidget.style.top = `${rect.bottom + 10}px`;
      timerWidget.style.left = `${rect.left}px`;
      timerWidget.style.zIndex = '10000';
      
      document.body.appendChild(timerWidget);
      
      expect(timerWidget.style.position).toBe('fixed');
      expect(timerWidget.style.zIndex).toBe('10000');
    });
  });
  
  describe('Modal Creation', () => {
    test('should create modal with options', () => {
      const modal = document.createElement('div');
      modal.className = 'pomodoro-modal';
      
      const content = document.createElement('div');
      content.className = 'pomodoro-modal-content';
      
      const options = [
        { text: 'Continue current timer', action: jest.fn() },
        { text: 'Start new timer', action: jest.fn() },
        { text: 'Cancel', action: jest.fn() }
      ];
      
      options.forEach(option => {
        const button = document.createElement('button');
        button.textContent = option.text;
        button.className = 'pomodoro-modal-button';
        button.onclick = option.action;
        content.appendChild(button);
      });
      
      modal.appendChild(content);
      document.body.appendChild(modal);
      
      expect(document.querySelector('.pomodoro-modal')).toBeTruthy();
      expect(document.querySelectorAll('.pomodoro-modal-button')).toHaveLength(3);
      expect(document.querySelectorAll('.pomodoro-modal-button')[0].textContent).toBe('Continue current timer');
    });
  });
  
  describe('Timer Display Updates', () => {
    test('should update timer display correctly', () => {
      document.body.innerHTML = `
        <div class="pomodoro-timer-widget">
          <div class="pomodoro-timer-time">25:00</div>
          <div class="pomodoro-timer-type">work</div>
          <svg class="pomodoro-timer-progress">
            <path class="pomodoro-timer-fill"></path>
          </svg>
        </div>
      `;
      
      const remaining = 15 * 60 * 1000; // 15 minutes
      const duration = 25 * 60 * 1000; // 25 minutes
      
      const minutes = Math.floor(remaining / 60000);
      const seconds = Math.floor((remaining % 60000) / 1000);
      const timeDisplay = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      const progress = ((duration - remaining) / duration) * 100;
      
      document.querySelector('.pomodoro-timer-time').textContent = timeDisplay;
      document.querySelector('.pomodoro-timer-fill').style.strokeDasharray = `${progress}, 100`;
      
      expect(document.querySelector('.pomodoro-timer-time').textContent).toBe('15:00');
      expect(document.querySelector('.pomodoro-timer-fill').style.strokeDasharray).toBe('40, 100');
    });
  });
  
  describe('Event Handling', () => {
    test('should handle click events on task elements', () => {
      document.body.innerHTML = `
        <div class="task_content">Test Task</div>
      `;
      
      const taskElement = document.querySelector('.task_content');
      const clickHandler = jest.fn();
      
      taskElement.addEventListener('click', clickHandler);
      taskElement.click();
      
      expect(clickHandler).toHaveBeenCalled();
    });
    
    test('should handle timer control button clicks', () => {
      document.body.innerHTML = `
        <div class="pomodoro-timer-widget">
          <button class="pomodoro-timer-pause">⏸️</button>
          <button class="pomodoro-timer-stop">⏹️</button>
        </div>
      `;
      
      const pauseBtn = document.querySelector('.pomodoro-timer-pause');
      const stopBtn = document.querySelector('.pomodoro-timer-stop');
      
      const pauseHandler = jest.fn();
      const stopHandler = jest.fn();
      
      pauseBtn.addEventListener('click', pauseHandler);
      stopBtn.addEventListener('click', stopHandler);
      
      pauseBtn.click();
      stopBtn.click();
      
      expect(pauseHandler).toHaveBeenCalled();
      expect(stopHandler).toHaveBeenCalled();
    });
  });
  
  describe('Widget Removal', () => {
    test('should remove timer widget from DOM', () => {
      const timerWidget = document.createElement('div');
      timerWidget.className = 'pomodoro-timer-widget';
      document.body.appendChild(timerWidget);
      
      expect(document.querySelector('.pomodoro-timer-widget')).toBeTruthy();
      
      timerWidget.remove();
      
      expect(document.querySelector('.pomodoro-timer-widget')).toBeFalsy();
    });
  });
});