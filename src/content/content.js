class PomodoroTimer {
  constructor() {
    this.currentTimer = null;
    this.timerInterval = null;
    this.timerWidget = null;
    this.taskHistory = new Map();
    this.audioContext = null;

    
    this.settings = {
      workDuration: 25, // 25 minutes
      shortBreak: 5,    // 5 minutes
      longBreak: 15,    // 15 minutes
      sessionsUntilLongBreak: 4
    };
    
    this.init();
  }
  
  async init() {
    await this.loadSettings();
    await this.loadTaskHistory();

    this.setupAudio();
    this.setupTaskClickListeners();
    this.setupMessageListener();
    await this.restoreTimerState();
    
    // Always show timer widget
    this.createTimerWidget();
  }
  

  
  // ========== SETTINGS & STORAGE ==========
  
  async loadSettings() {
    try {
      const result = await chrome.storage.sync.get(['pomodoroSettings']);
      if (result.pomodoroSettings) {
        this.settings = { ...this.settings, ...result.pomodoroSettings };
      }
    } catch (error) {
      console.warn('Failed to load settings:', error);
    }
  }
  
  async loadTaskHistory() {
    try {
      const result = await chrome.storage.local.get(['taskHistory']);
      if (result.taskHistory) {
        this.taskHistory = new Map(Object.entries(result.taskHistory));
      }
    } catch (error) {
      console.warn('Failed to load task history:', error);
    }
  }
  
  async saveTimerState() {
    try {
      await chrome.storage.local.set({
        currentTimer: this.currentTimer
      });
    } catch (error) {
      console.warn('Failed to save timer state:', error);
    }
  }
  
  async saveTaskHistory() {
    try {
      const historyObject = Object.fromEntries(this.taskHistory);
      await chrome.storage.local.set({ taskHistory: historyObject });
    } catch (error) {
      console.warn('Failed to save task history:', error);
    }
  }
  
  // ========== AUDIO SETUP ==========
  
  setupAudio() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (error) {
      console.warn('Audio context not available:', error);
    }
  }
  
  playCompletionSound() {
    if (!this.audioContext) return;
    
    try {
      // Create a simple beep sound
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime + 0.2);
      
      gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
      
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.5);
    } catch (error) {
      console.warn('Failed to play sound:', error);
    }
  }
  
  // ========== TASK CLICK HANDLING ==========
  
  setupTaskClickListeners() {
    document.addEventListener('click', (event) => {
      // Skip if clicking inside our timer widget
      if (event.target.closest('.pomodoro-timer-widget')) {
        return;
      }
      
      const taskContent = event.target.closest('.task_content');
      if (taskContent) {
        event.preventDefault();
        event.stopPropagation();
        
        const taskName = taskContent.textContent.trim();
        if (taskName && taskName.length > 0) {
          console.log('Task clicked:', taskName);
          this.handleTaskClick(taskName);
        }
      }
    }, true);
  }
  
  handleTaskClick(taskName) {
    if (this.currentTimer && this.currentTimer.status === 'running') {
      // If timer is running, ask what to do
      this.showTaskSwitchModal(taskName);
    } else {
      // Start new timer and update dropdown
      this.startWorkTimer(taskName);
      
      // Update dropdown to reflect the selected task
      const dropdown = this.timerWidget?.querySelector('.pomodoro-task-dropdown');
      if (dropdown) {
        dropdown.value = taskName;
      }
    }
  }
  
  showTaskSwitchModal(newTaskName) {
    const currentTaskName = this.currentTimer.taskName;
    
    if (currentTaskName === newTaskName) {
      // Same task, just focus the timer
      this.focusTimer();
      return;
    }
    
    const modal = this.createModal([
      {
        text: `Continue "${currentTaskName}"`,
        action: () => this.focusTimer()
      },
      {
        text: `Switch to "${newTaskName}"`,
        action: () => {
          this.stopTimer();
          this.startWorkTimer(newTaskName);
          
          // Update dropdown to reflect the new task
          const dropdown = this.timerWidget?.querySelector('.pomodoro-task-dropdown');
          if (dropdown) {
            dropdown.value = newTaskName;
          }
        }
      },
      {
        text: 'Cancel',
        action: () => {}
      }
    ]);
    
    document.body.appendChild(modal);
  }
  
  // ========== TIMER CONTROL ==========
  
  startWorkTimer(taskName) {
    const taskId = this.generateTaskHash(taskName);
    const taskStats = this.getTaskStats(taskId);
    
    this.currentTimer = {
      taskId: taskId,
      taskName: taskName,
      duration: this.settings.workDuration * 60 * 1000,
      remaining: this.settings.workDuration * 60 * 1000,
      status: 'running',
      type: 'work',
      startTime: Date.now(),
      completedSessions: 0,
      taskTotalPomodoros: taskStats.totalPomodoros,
      taskTodayPomodoros: taskStats.completedToday
    };
    
    this.updateTaskStats(taskId, { name: taskName }, false);
    this.saveTimerState();
    this.updateTimerWidget();
    this.startTimerInterval();
    
    // Highlight the selected task
    this.highlightSelectedTask(taskName);
    
    chrome.runtime.sendMessage({
      action: 'timerStarted',
      timer: this.currentTimer
    });
  }
  
  startBreakTimer(isLongBreak = false) {
    const duration = isLongBreak ? this.settings.longBreak * 60 * 1000 : this.settings.shortBreak * 60 * 1000;
    const breakType = isLongBreak ? 'long break' : 'short break';
    
    this.currentTimer = {
      ...this.currentTimer,
      duration: duration,
      remaining: duration,
      status: 'running',
      type: breakType,
      startTime: Date.now()
    };
    
    this.saveTimerState();
    this.updateTimerWidget();
    this.startTimerInterval();
  }
  
  pauseTimer() {
    if (this.currentTimer && this.currentTimer.status === 'running') {
      this.currentTimer.status = 'paused';
      this.clearTimerInterval();
      this.updateTimerWidget();
      this.saveTimerState();
    }
  }
  
  resumeTimer() {
    if (this.currentTimer && this.currentTimer.status === 'paused') {
      this.currentTimer.status = 'running';
      this.currentTimer.startTime = Date.now() - (this.currentTimer.duration - this.currentTimer.remaining);
      this.startTimerInterval();
      this.updateTimerWidget();
      this.saveTimerState();
    }
  }
  
  stopTimer() {
    if (this.currentTimer) {
      this.currentTimer = null;
      this.clearTimerInterval();
      this.updateTimerWidget();
      this.saveTimerState();
      
      // Maintain highlighting for the selected dropdown task
      const dropdown = this.timerWidget?.querySelector('.pomodoro-task-dropdown');
      if (dropdown && dropdown.value) {
        this.highlightSelectedTask(dropdown.value);
      } else {
        this.clearTaskHighlight();
      }
    }
  }
  
  // ========== TIMER INTERVAL ==========
  
  startTimerInterval() {
    this.clearTimerInterval();
    
    this.timerInterval = setInterval(() => {
      if (this.currentTimer && this.currentTimer.status === 'running') {
        const elapsed = Date.now() - this.currentTimer.startTime;
        this.currentTimer.remaining = Math.max(0, this.currentTimer.duration - elapsed);
        
        if (this.currentTimer.remaining <= 0) {
          this.completeTimer();
        } else {
          this.updateTimerWidget();
        }
      }
    }, 1000);
  }
  
  clearTimerInterval() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }
  
  completeTimer() {
    this.clearTimerInterval();
    this.playCompletionSound();
    
    if (this.currentTimer.type === 'work') {
      // Work session completed
      this.currentTimer.completedSessions++;
      
      // Update task statistics
      if (this.currentTimer.taskId) {
        const updatedStats = this.updateTaskStats(
          this.currentTimer.taskId,
          { name: this.currentTimer.taskName },
          true // Pomodoro completed
        );
        
        this.currentTimer.taskTotalPomodoros = updatedStats.totalPomodoros;
        this.currentTimer.taskTodayPomodoros = updatedStats.completedToday;
      }
      
      this.showWorkCompleteModal();
    } else {
      // Break completed - show notification and reset to idle
      chrome.runtime.sendMessage({
        action: 'showNotification',
        title: 'Break Complete! 🍅',
        message: `Break finished. Ready to start working on "${this.currentTimer.taskName}" again?`
      });
      
      // Reset to idle state but keep task name
      const taskName = this.currentTimer.taskName;
      this.currentTimer = null;
      this.updateTimerWidget();
      
      // Set the dropdown to the previous task
      const dropdown = this.timerWidget.querySelector('.pomodoro-task-dropdown');
      if (dropdown) {
        dropdown.value = taskName;
      }
    }
    
    this.saveTimerState();
  }
  
  showWorkCompleteModal() {
    const isLongBreak = this.currentTimer.completedSessions % this.settings.sessionsUntilLongBreak === 0;
    const breakDuration = isLongBreak ? this.settings.longBreak : this.settings.shortBreak;
    const breakType = isLongBreak ? 'long break' : 'short break';
    const breakMinutes = breakDuration;
    
    chrome.runtime.sendMessage({
      action: 'showNotification',
      title: 'Pomodoro Complete! 🍅',
      message: `Great work on "${this.currentTimer.taskName}". Time for a ${breakType}!`
    });
    
    const modal = this.createModal([
      {
        text: `Take ${breakType} (${breakMinutes} min)`,
        action: () => this.startBreakTimer(isLongBreak)
      },
      {
        text: 'Stop timer',
        action: () => this.stopTimer()
      }
    ]);
    
    document.body.appendChild(modal);
  }
  
  // ========== UI CREATION ==========
  
  createTimerWidget() {
    if (this.timerWidget) {
      this.timerWidget.remove();
    }
    
    this.timerWidget = document.createElement('div');
    this.timerWidget.className = 'pomodoro-timer-widget';
    this.timerWidget.innerHTML = `
      <div class="pomodoro-timer-content">
        <div class="pomodoro-timer-display">
          <div class="pomodoro-timer-circle">
            <svg class="pomodoro-timer-progress" viewBox="0 0 36 36">
              <path class="pomodoro-timer-bg" d="M18 2.0845a15.9155 15.9155 0 1 1 0 31.831a15.9155 15.9155 0 1 1 0-31.831"/>
              <path class="pomodoro-timer-fill" d="M18 2.0845a15.9155 15.9155 0 1 1 0 31.831a15.9155 15.9155 0 1 1 0-31.831"/>
            </svg>
            <div class="pomodoro-timer-time">25:00</div>
          </div>
        </div>
        <div class="pomodoro-timer-controls">
          <button class="pomodoro-timer-btn primary pomodoro-timer-pause">Start</button>
          <button class="pomodoro-timer-btn pomodoro-timer-stop">Stop</button>
        </div>
        <div class="pomodoro-timer-task-selector">
          <select class="pomodoro-task-dropdown">
            <option value="">Select a task...</option>
          </select>
        </div>
        <div class="pomodoro-timer-meta">
          <div class="pomodoro-timer-task-info">
            <div class="pomodoro-timer-task-name">Select task and click Start</div>
            <div class="pomodoro-timer-stats">
              <span class="pomodoro-timer-today">Today: 0</span>
              <span class="pomodoro-timer-total">Total: 0</span>
            </div>
          </div>
        </div>
      </div>
    `;
    
    this.setupWidgetControls();
    this.positionWidget();
    document.body.appendChild(this.timerWidget);
    

    
    this.populateTaskDropdown();
    this.updateTimerWidget();
    
    // Ensure highlighting is applied after widget creation
    setTimeout(() => {
      const dropdown = this.timerWidget?.querySelector('.pomodoro-task-dropdown');
      if (dropdown && dropdown.value) {
        this.highlightSelectedTask(dropdown.value);
      }
    }, 200);
  }
  
  populateTaskDropdown() {
    if (!this.timerWidget) return;
    
    const dropdown = this.timerWidget.querySelector('.pomodoro-task-dropdown');
    if (!dropdown) return;
    
    // Store current selection
    const currentValue = dropdown.value;
    
    // Clear existing options except the first one
    dropdown.innerHTML = '<option value="">Select a task...</option>';
    
    // Find all visible tasks on the page, but exclude our own widget
    const taskElements = document.querySelectorAll('.task_content');
    const tasks = [];
    
    taskElements.forEach((element) => {
      // Skip if this element is inside our timer widget
      if (element.closest('.pomodoro-timer-widget')) return;
      
      // Check if the element is visible
      const rect = element.getBoundingClientRect();
      const isVisible = rect.width > 0 && rect.height > 0;
      
      if (isVisible) {
        const taskName = element.textContent.trim();
        if (taskName && taskName.length > 0 && taskName.length < 200) { // Reasonable length check
          tasks.push({
            name: taskName,
            element: element
          });
        }
      }
    });
    
    // Remove duplicates
    const uniqueTasks = tasks.filter((task, index, self) => 
      index === self.findIndex(t => t.name === task.name)
    );
    
    console.log('Found tasks for dropdown:', uniqueTasks.length);
    
    // Add tasks to dropdown (limit to first 15 to avoid clutter)
    uniqueTasks.slice(0, 15).forEach((task) => {
      const option = document.createElement('option');
      option.value = task.name;
      option.textContent = task.name.length > 50 ? task.name.substring(0, 50) + '...' : task.name;
      dropdown.appendChild(option);
    });
    
    // Restore previous selection or active timer task
    let taskToSelect = currentValue;
    
    // If we have an active timer, prioritize that task
    if (this.currentTimer && this.currentTimer.taskName) {
      taskToSelect = this.currentTimer.taskName;
    }
    
    if (taskToSelect && dropdown.querySelector(`option[value="${CSS.escape(taskToSelect)}"]`)) {
      dropdown.value = taskToSelect;
      console.log('Set dropdown to task:', taskToSelect);
    } else if (uniqueTasks.length > 0 && !taskToSelect) {
      dropdown.selectedIndex = 1; // Skip the "Select a task..." option
      taskToSelect = dropdown.options[1]?.value;
      console.log('Auto-selected first task:', taskToSelect);
    }
  }
  
  setupWidgetControls() {
    const pauseBtn = this.timerWidget.querySelector('.pomodoro-timer-pause');
    const stopBtn = this.timerWidget.querySelector('.pomodoro-timer-stop');
    const dropdown = this.timerWidget.querySelector('.pomodoro-task-dropdown');
    
    pauseBtn.onclick = () => {
      if (!this.currentTimer) {
        // No timer - start new one with selected task
        let selectedTask = dropdown.value;
        
        if (!selectedTask) {
          // If no task selected, refresh dropdown and try to auto-select first task
          console.log('No task selected, refreshing dropdown...');
          this.populateTaskDropdown();
          selectedTask = dropdown.options[1]?.value; // Skip "Select a task..." option
          if (selectedTask) {
            dropdown.value = selectedTask;
            console.log('Auto-selected task:', selectedTask);
          }
        }
        
        if (selectedTask) {
          console.log('Starting timer for task:', selectedTask);
          this.startWorkTimer(selectedTask);
        } else {
          console.log('No tasks available');
          this.showTaskSelectionModal();
        }
      } else if (this.currentTimer.status === 'running') {
        this.pauseTimer();
      } else if (this.currentTimer.status === 'paused') {
        this.resumeTimer();
      }
    };
    
    stopBtn.onclick = () => this.stopTimer();
    
    // Handle dropdown selection changes
    dropdown.onchange = () => {
      const selectedTask = dropdown.value;
      if (selectedTask) {
        this.highlightSelectedTask(selectedTask);
      } else {
        this.clearTaskHighlight();
      }
    };
    
    // Handle focus events to re-highlight when dropdown gets focus
    dropdown.onfocus = () => {
      const selectedTask = dropdown.value;
      if (selectedTask) {
        // Small delay to ensure the focus is processed
        setTimeout(() => {
          this.highlightSelectedTask(selectedTask);
        }, 50);
      }
    };
    
    // Refresh dropdown periodically instead of using MutationObserver
    setInterval(() => {
      if (this.timerWidget && !this.currentTimer) {
        this.populateTaskDropdown();
      }
    }, 5000); // Update every 5 seconds when idle
  }
  

  
  showTaskSelectionModal() {
    const modal = this.createModal([
      {
        text: 'No tasks found. Please:',
        action: () => {}
      },
      {
        text: '1. Create a task in Todoist first',
        action: () => {}
      },
      {
        text: '2. Or click directly on any existing task',
        action: () => {}
      },
      {
        text: 'OK',
        action: () => {}
      }
    ]);
    
    document.body.appendChild(modal);
  }
  
  positionWidget() {
    this.timerWidget.style.position = 'fixed';
    this.timerWidget.style.top = '20px';
    this.timerWidget.style.right = '20px';
    this.timerWidget.style.zIndex = '10000';
  }
  
  updateTimerWidget() {
    if (!this.timerWidget) return;
    
    const dropdown = this.timerWidget.querySelector('.pomodoro-task-dropdown');
    const timeElement = this.timerWidget.querySelector('.pomodoro-timer-time');
    const taskNameElement = this.timerWidget.querySelector('.pomodoro-timer-task-name');
    const todayElement = this.timerWidget.querySelector('.pomodoro-timer-today');
    const totalElement = this.timerWidget.querySelector('.pomodoro-timer-total');
    const pauseBtn = this.timerWidget.querySelector('.pomodoro-timer-pause');
    const fillElement = this.timerWidget.querySelector('.pomodoro-timer-fill');
    
    // Remove all state classes
    this.timerWidget.classList.remove('state-idle', 'state-work', 'state-break', 'paused');
    
    if (!this.currentTimer) {
      // Idle state - show current work duration setting
      const workMinutes = this.settings.workDuration || 25; // Fallback to 25 if not loaded
      console.log('Idle state - work duration:', workMinutes, 'settings:', this.settings);
      const timeDisplay = `${workMinutes.toString().padStart(2, '0')}:00`;
      timeElement.textContent = timeDisplay;
      taskNameElement.textContent = 'Select task and click Start';
      todayElement.textContent = 'Today: 0';
      totalElement.textContent = 'Total: 0';
      pauseBtn.textContent = 'Start';
      pauseBtn.classList.add('primary');
      fillElement.style.strokeDasharray = '0, 100';
      dropdown.style.display = 'block';
      
      // Add idle state class
      this.timerWidget.classList.add('state-idle');
      
      // Maintain highlighting for selected dropdown task when idle
      if (dropdown && dropdown.value) {
        setTimeout(() => {
          this.highlightSelectedTask(dropdown.value);
        }, 100);
      }
      
      return;
    }
    
    // Active timer
    console.log('Active timer - remaining:', this.currentTimer.remaining, 'duration:', this.currentTimer.duration);
    const minutes = Math.floor(this.currentTimer.remaining / 60000);
    const seconds = Math.floor((this.currentTimer.remaining % 60000) / 1000);
    const timeDisplay = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    const progress = ((this.currentTimer.duration - this.currentTimer.remaining) / this.currentTimer.duration) * 100;
    console.log('Timer display:', timeDisplay, 'minutes:', minutes, 'seconds:', seconds);
    
    timeElement.textContent = timeDisplay;
    taskNameElement.textContent = this.currentTimer.taskName;
    todayElement.textContent = `Today: ${this.currentTimer.taskTodayPomodoros || 0}`;
    totalElement.textContent = `Total: ${this.currentTimer.taskTotalPomodoros || 0}`;
    fillElement.style.strokeDasharray = `${progress}, 100`;
    
    // Hide dropdown when timer is active, but ensure it has the correct value
    dropdown.value = this.currentTimer.taskName;
    dropdown.style.display = 'none';
    
    // Add appropriate state class
    if (this.currentTimer.type === 'work') {
      this.timerWidget.classList.add('state-work');
    } else {
      this.timerWidget.classList.add('state-break');
    }
    
    if (this.currentTimer.status === 'running') {
      pauseBtn.textContent = 'Pause';
      pauseBtn.classList.add('primary');
    } else {
      pauseBtn.textContent = 'Resume';
      pauseBtn.classList.remove('primary');
      this.timerWidget.classList.add('paused');
    }
  }
  
  focusTimer() {
    if (this.timerWidget) {
      this.timerWidget.scrollIntoView({ behavior: 'smooth', block: 'center' });
      this.timerWidget.classList.add('highlight');
      setTimeout(() => {
        this.timerWidget.classList.remove('highlight');
      }, 2000);
    }
  }
  
  // ========== TASK HIGHLIGHTING ==========
  
  highlightSelectedTask(taskName) {
    // Clear any existing highlights
    this.clearTaskHighlight();
    
    // Find the task element by its content
    const taskElements = document.querySelectorAll('.task_content');
    let targetTaskElement = null;
    
    taskElements.forEach((element) => {
      if (element.textContent.trim() === taskName) {
        targetTaskElement = element;
      }
    });
    
    if (targetTaskElement) {
      // Find the outermost task container - look for the div that contains both checkbox and content
      let taskContainer = targetTaskElement;
      let attempts = 0;
      const maxAttempts = 15;
      
      // Traverse up to find the main task container that has both checkbox and content
      while (taskContainer && attempts < maxAttempts) {
        const parent = taskContainer.parentElement;
        if (!parent) break;
        
        // Look for a container that has both task_checkbox and task content
        const hasCheckbox = parent.querySelector('.task_checkbox');
        const hasContent = parent.querySelector('.task_content');
        
        if (hasCheckbox && hasContent) {
          taskContainer = parent;
          break;
        }
        
        taskContainer = parent;
        attempts++;
      }
      
      // Apply highlighting
      if (taskContainer) {
        taskContainer.classList.add('pomodoro-selected-task', 'pomodoro-task-pulse');
        
        // Remove pulse animation after it completes
        setTimeout(() => {
          if (taskContainer.classList.contains('pomodoro-task-pulse')) {
            taskContainer.classList.remove('pomodoro-task-pulse');
          }
        }, 1000);
        
        // Scroll task into view
        taskContainer.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'nearest'
        });
      }
    }
  }
  
  clearTaskHighlight() {
    // Remove highlighting from all tasks
    const highlightedTasks = document.querySelectorAll('.pomodoro-selected-task');
    highlightedTasks.forEach(task => {
      task.classList.remove('pomodoro-selected-task', 'pomodoro-task-pulse');
    });
  }
  
  // ========== MODAL CREATION ==========
  
  createModal(options) {
    const modal = document.createElement('div');
    modal.className = 'pomodoro-modal';
    
    const content = document.createElement('div');
    content.className = 'pomodoro-modal-content';
    
    options.forEach(option => {
      const button = document.createElement('button');
      button.textContent = option.text;
      button.className = 'pomodoro-modal-button';
      button.onclick = () => {
        option.action();
        modal.remove();
      };
      content.appendChild(button);
    });
    
    modal.appendChild(content);
    
    modal.onclick = (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    };
    
    return modal;
  }
  
  // ========== TASK STATISTICS ==========
  
  getTaskStats(taskId) {
    return this.taskHistory.get(taskId) || {
      name: '',
      totalPomodoros: 0,
      completedToday: 0,
      lastWorked: null
    };
  }
  
  updateTaskStats(taskId, taskInfo, pomodoroCompleted = false) {
    const stats = this.getTaskStats(taskId);
    const today = new Date().toDateString();
    
    stats.name = taskInfo.name;
    stats.lastWorked = new Date().toISOString();
    
    if (stats.lastWorkedDate !== today) {
      stats.completedToday = 0;
      stats.lastWorkedDate = today;
    }
    
    if (pomodoroCompleted) {
      stats.totalPomodoros++;
      stats.completedToday++;
    }
    
    this.taskHistory.set(taskId, stats);
    this.saveTaskHistory();
    
    return stats;
  }
  
  generateTaskHash(text) {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }
  
  // ========== MESSAGE HANDLING ==========
  
  setupMessageListener() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      switch (message.action) {
        case 'getTimerState':
          sendResponse(this.getTimerState());
          break;
        case 'startQuickTimer':
          this.startQuickTimer(message.timer);
          sendResponse({ success: true });
          break;
        case 'updateSettings':
          this.updateSettings(message.settings);
          sendResponse({ success: true });
          break;
        case 'pauseTimer':
          this.pauseTimer();
          sendResponse({ success: true });
          break;
        case 'stopTimer':
          this.stopTimer();
          sendResponse({ success: true });
          break;
        case 'resumeTimer':
          this.resumeTimer();
          sendResponse({ success: true });
          break;
      }
    });
  }
  
  startQuickTimer(timer) {
    this.currentTimer = timer;
    this.updateTimerWidget();
    this.startTimerInterval();
    this.saveTimerState();
  }
  
  updateSettings(newSettings) {
    this.settings = {
      workDuration: newSettings.workDuration,
      shortBreak: newSettings.shortBreak,
      longBreak: newSettings.longBreak,
      sessionsUntilLongBreak: newSettings.sessionsUntilLongBreak
    };
  }
  
  getTimerState() {
    return {
      currentTimer: this.currentTimer,
      isActive: this.currentTimer && this.currentTimer.status !== 'stopped'
    };
  }
  
  // ========== STATE RESTORATION ==========
  
  restoreTaskHighlighting() {
    if (!this.timerWidget) return;
    
    const dropdown = this.timerWidget.querySelector('.pomodoro-task-dropdown');
    let taskToHighlight = null;
    
    // Determine which task should be highlighted
    if (this.currentTimer && this.currentTimer.taskName) {
      taskToHighlight = this.currentTimer.taskName;
    } else if (dropdown && dropdown.value) {
      taskToHighlight = dropdown.value;
    }
    
    if (taskToHighlight) {
      console.log('Restoring highlight for task:', taskToHighlight);
      // Ensure dropdown has the correct value
      if (dropdown) {
        dropdown.value = taskToHighlight;
      }
      // Apply highlighting
      this.highlightSelectedTask(taskToHighlight);
    }
  }
  
  async restoreTimerState() {
    try {
      const result = await chrome.storage.local.get(['currentTimer']);
      if (result.currentTimer && result.currentTimer.status !== 'stopped') {
        this.currentTimer = result.currentTimer;
        
        if (this.currentTimer.status === 'running') {
          const elapsed = Date.now() - this.currentTimer.startTime;
          this.currentTimer.remaining = Math.max(0, this.currentTimer.duration - elapsed);
          
          if (this.currentTimer.remaining > 0) {
            this.startTimerInterval();
          } else {
            this.completeTimer();
          }
        }
        
        // Update the timer widget to reflect the restored state
        this.updateTimerWidget();
        
        // Restore task highlighting with multiple attempts to ensure it works
        setTimeout(() => {
          this.populateTaskDropdown();
          this.restoreTaskHighlighting();
        }, 1000);
        
        // Additional attempt in case the first one fails
        setTimeout(() => {
          this.restoreTaskHighlighting();
        }, 2000);
      }
    } catch (error) {
      console.warn('Failed to restore timer state:', error);
    }
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new PomodoroTimer();
  });
} else {
  new PomodoroTimer();
}