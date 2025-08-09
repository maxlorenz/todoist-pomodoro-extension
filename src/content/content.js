/**
 * Main Pomodoro Timer class that integrates with Todoist interface
 * Manages timer state, UI widgets, task tracking, and user interactions
 */
class PomodoroTimer {
  /**
   * Initialize the Pomodoro Timer with default settings and state
   */
  constructor() {
    /** @type {Object|null} Current active timer state */
    this.currentTimer = null;
    /** @type {number|null} Timer interval ID for countdown updates */
    this.timerInterval = null;
    /** @type {HTMLElement|null} Timer widget DOM element */
    this.timerWidget = null;
    /** @type {Map<string, Object>} Task history and statistics */
    this.taskHistory = new Map();
    /** @type {AudioContext|null} Web Audio API context for sound effects */
    this.audioContext = null;

    /** @type {Object} Timer configuration settings */
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
  
  // ========== TASK CLICK HANDLING REMOVED ==========
  // Task clicking functionality has been removed to avoid interfering with Todoist's normal behavior
  
  // ========== TIMER CONTROL ==========
  
  /**
   * Start a work timer for the specified task
   * @param {string} taskName - Name of the task to work on
   */
  startWorkTimer(taskName) {
    const taskId = this.generateTaskHash(taskName);
    const taskStats = this.getTaskStats(taskId);
    
    this.currentTimer = {
      taskId,
      taskName,
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
      duration,
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
      // Update remaining time before pausing
      const elapsed = Date.now() - this.currentTimer.startTime;
      this.currentTimer.remaining = Math.max(0, this.currentTimer.duration - elapsed);
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
    }, 50); // Update 20 times per second for smooth animations
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
    
    // Create compact sidebar layout
    this.timerWidget.innerHTML = `
      <div class="pomodoro-timer-content pomodoro-sidebar-layout">
        <div class="pomodoro-timer-circle-compact">
          <svg class="pomodoro-timer-progress" viewBox="0 0 36 36">
            <path class="pomodoro-timer-bg" d="M18 2.0845a15.9155 15.9155 0 1 1 0 31.831a15.9155 15.9155 0 1 1 0-31.831"/>
            <path class="pomodoro-timer-fill" d="M18 2.0845a15.9155 15.9155 0 1 1 0 31.831a15.9155 15.9155 0 1 1 0-31.831"/>
          </svg>
          <div class="pomodoro-timer-time">25:00</div>
        </div>
        <div class="pomodoro-timer-controls">
          <button class="pomodoro-timer-btn primary pomodoro-timer-pause">Start</button>
          <button class="pomodoro-timer-btn pomodoro-timer-stop">Stop</button>
        </div>
        <div class="pomodoro-timer-task-selector">
          <label class="pomodoro-timer-task-label">Task:</label>
          <select class="pomodoro-task-dropdown">
            <option value="">Select a task...</option>
          </select>
        </div>
        <div class="pomodoro-timer-stats">
          <span class="pomodoro-timer-today">Today <span class="pomodoro-timer-count">0</span></span>
        </div>
      </div>
    `;
    
    this.positionWidget();
    
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
            element
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
        // Update task statistics when selection changes
        if (!this.currentTimer) {
          this.updateTimerWidget();
        }
      } else {
        this.clearTaskHighlight();
        // Update widget to show default state
        if (!this.currentTimer) {
          this.updateTimerWidget();
        }
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
    
    // Refresh task list when dropdown is clicked/opened
    dropdown.onclick = () => {
      console.log('Dropdown clicked - refreshing task list...');
      this.populateTaskDropdown();
    };
    
    // Also refresh on mousedown for better responsiveness
    dropdown.onmousedown = () => {
      console.log('Dropdown mousedown - refreshing task list...');
      this.populateTaskDropdown();
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
        text: '2. Refresh the page and try again',
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
    // Always try to integrate into sidebar
    this.integrateSidebarWidget();
  }
  
  integrateSidebarWidget() {
    // Wait a bit for the DOM to be ready
    setTimeout(() => {
      this.attemptSidebarIntegration();
    }, 1000);
    
    return true; // Always return true to avoid fallback
  }
  
  attemptSidebarIntegration() {
    console.log('Attempting sidebar integration...');
    
    // Debug: Check what navigation elements exist
    const allNavs = document.querySelectorAll('[role="navigation"]');
    console.log('Found navigation elements:', allNavs.length);
    allNavs.forEach((nav, i) => {
      console.log(`Nav ${i}:`, nav.getAttribute('aria-label'), nav.className);
    });
    
    // Debug: Check for scrollable container
    const scrollableContainer = document.querySelector('[data-testid="app-sidebar-scrollable-container"]');
    console.log('Found scrollable container:', !!scrollableContainer);
    
    // Find the navigation container that holds both top menu and projects
    const navContainer = document.querySelector('[role="navigation"][aria-label*="Main Navigation"]') ||
                         scrollableContainer?.querySelector('[role="navigation"]');
    if (!navContainer) {
      console.log('Navigation container not found, retrying...');
      setTimeout(() => this.attemptSidebarIntegration(), 2000);
      return;
    }
    
    console.log('Found navigation container:', navContainer);
    
    // Find the top menu (contains Inbox, Today, More)
    const topMenu = navContainer.querySelector('#top-menu');
    if (!topMenu) {
      console.log('Top menu not found, retrying...');
      setTimeout(() => this.attemptSidebarIntegration(), 2000);
      return;
    }
    
    console.log('Found top menu:', topMenu);
    
    // Find the My Projects section - updated selector for current DOM structure
    const projectsSection = document.querySelector('.om0jL2_') || 
                           navContainer.querySelector('[data-expansion-panel-header="true"]')?.parentElement ||
                           document.querySelector('[aria-label="Projects"]')?.closest('div') ||
                           document.querySelector('div:has(> div > [data-expansion-panel-header="true"])');
    
    console.log('Projects section search results:');
    console.log('- .om0jL2_:', !!document.querySelector('.om0jL2_'));
    console.log('- expansion panel:', !!navContainer.querySelector('[data-expansion-panel-header="true"]'));
    console.log('- aria-label Projects:', !!document.querySelector('[aria-label="Projects"]'));
    console.log('- Final projectsSection:', !!projectsSection);
    
    // Don't require projects section - we can still integrate without it
    if (projectsSection) {
      console.log('Found projects section:', projectsSection);
    } else {
      console.log('Projects section not found, but continuing with integration...');
    }
    
    // Remove any existing timer section
    const existingSection = document.querySelector('.om0jL2_:has(.pomodoro-sidebar-container)') || 
                           document.querySelector('.pomodoro-sidebar-container')?.closest('.om0jL2_');
    if (existingSection) {
      existingSection.remove();
      console.log('Removed existing timer section');
    }
    
    // Create a collapsible section similar to "My Projects"
    const timerSection = document.createElement('div');
    timerSection.className = 'om0jL2_'; // Use same class as projects section
    
    // Create the header
    const headerContainer = document.createElement('div');
    headerContainer.className = '_19abae45';
    
    const header = document.createElement('div');
    header.setAttribute('data-expansion-panel-header', 'true');
    header.className = 'odUSdET _19abae45 _7fb159a0 _5912d165';
    
    const headerContent = document.createElement('div');
    headerContent.className = 'RQmSwnk _19abae45 a7c6de33 c4803194 b0e6eab4 cad4e2ec _194d8611 _8ad6a17c _47471e4e f6a2af5a';
    
    const headerLink = document.createElement('div');
    headerLink.className = 'gUmPwCE _19abae45 a7c6de33 cad4e2ec efe72b13 a329dbd3 c76cb3c7 _194d8611 _8ad6a17c d607c41c bfa58fdf _47471e4e f6a2af5a';
    
    // Create icon container
    const iconContainer = document.createElement('span');
    iconContainer.setAttribute('aria-hidden', 'true');
    iconContainer.className = 'cirsnYRl6qMjw5oksPFwMOI3K4vDQ_sE';
    
    // Create timer/tomato icon (SVG)
    const icon = document.createElement('svg');
    icon.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    icon.setAttribute('width', '24');
    icon.setAttribute('height', '24');
    icon.setAttribute('fill', 'none');
    icon.setAttribute('viewBox', '0 0 24 24');
    icon.className = 'Fego6xD';
    icon.style.color = 'var(--named-color-red)'; // Use red color like a tomato
    
    const iconPath = document.createElement('path');
    iconPath.setAttribute('fill', 'currentColor');
    iconPath.setAttribute('fill-rule', 'evenodd');
    iconPath.setAttribute('d', 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z');
    iconPath.setAttribute('clip-rule', 'evenodd');
    
    icon.appendChild(iconPath);
    iconContainer.appendChild(icon);
    
    const headerText = document.createElement('div');
    headerText.className = '_19abae45 a7c6de33 _194d8611 _1e964f8a _2580a74b _47471e4e';
    
    const titleText = document.createElement('div');
    titleText.className = 'zNp0fi3 a83bd4e0 _7be5c531 _6a3e5ade _2f303ac3 _19abae45 _211eebc7';
    titleText.textContent = 'Pomodoro Timer';
    
    headerText.appendChild(titleText);
    headerLink.appendChild(iconContainer);
    headerLink.appendChild(headerText);
    headerContent.appendChild(headerLink);
    
    // Create menu button (like "My projects menu")
    const menuContainer = document.createElement('div');
    menuContainer.className = 'utlnQLn _19abae45 b834b77e';
    
    const menuButton = document.createElement('button');
    menuButton.setAttribute('aria-label', 'Pomodoro timer menu');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-haspopup', 'menu');
    menuButton.className = '_3930afa0 aa19cb97 _1e29d236 abd5766f';
    menuButton.type = 'button';
    menuButton.setAttribute('aria-disabled', 'false');
    
    const menuIcon = document.createElement('svg');
    menuIcon.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    menuIcon.setAttribute('width', '24');
    menuIcon.setAttribute('height', '24');
    menuIcon.setAttribute('fill', 'none');
    menuIcon.setAttribute('viewBox', '0 0 24 24');
    
    const menuPath = document.createElement('path');
    menuPath.setAttribute('fill', 'currentColor');
    menuPath.setAttribute('fill-rule', 'evenodd');
    menuPath.setAttribute('d', 'M12 6a.46.46 0 0 0-.461.462v5.077H6.462a.462.462 0 1 0 0 .922h5.077v5.077a.461.461 0 1 0 .922 0v-5.077h5.077a.461.461 0 1 0 0-.922h-5.077V6.462A.46.46 0 0 0 12 6');
    menuPath.setAttribute('clip-rule', 'evenodd');
    
    menuIcon.appendChild(menuPath);
    menuButton.appendChild(menuIcon);
    menuContainer.appendChild(menuButton);
    
    // Add click handler for menu button (placeholder for now)
    menuButton.addEventListener('click', (e) => {
      e.stopPropagation();
      console.log('Pomodoro menu clicked - could show settings, statistics, etc.');
      // TODO: Add menu functionality later
    });
    
    headerContent.appendChild(menuContainer);
    
    // Create toggle button
    const toggleContainer = document.createElement('div');
    toggleContainer.className = '_19abae45 b834b77e';
    
    const toggleButton = document.createElement('button');
    toggleButton.setAttribute('data-expansion-panel-toggle', 'true');
    toggleButton.setAttribute('aria-expanded', 'true');
    toggleButton.setAttribute('aria-controls', 'pomodoro-timer-panel');
    toggleButton.setAttribute('aria-label', 'Toggle Pomodoro Timer');
    toggleButton.className = 'HeTy3_a kYbuQSS _3930afa0 aa19cb97 _1e29d236 abd5766f';
    toggleButton.type = 'button';
    
    const toggleIcon = document.createElement('svg');
    toggleIcon.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    toggleIcon.setAttribute('width', '24');
    toggleIcon.setAttribute('height', '24');
    toggleIcon.setAttribute('fill', 'none');
    toggleIcon.setAttribute('viewBox', '0 0 24 24');
    toggleIcon.className = 'y9T4Cwr';
    
    const togglePath = document.createElement('path');
    togglePath.setAttribute('fill', 'currentColor');
    togglePath.setAttribute('fill-rule', 'evenodd');
    togglePath.setAttribute('d', 'M17.854 8.897a.5.5 0 0 0-.708 0L12 14.044 6.854 8.897a.5.5 0 1 0-.708.707l5.5 5.5a.5.5 0 0 0 .708 0l5.5-5.5a.5.5 0 0 0 0-.707');
    togglePath.setAttribute('clip-rule', 'evenodd');
    
    toggleIcon.appendChild(togglePath);
    toggleButton.appendChild(toggleIcon);
    toggleContainer.appendChild(toggleButton);
    
    headerContent.appendChild(toggleContainer);
    header.appendChild(headerContent);
    headerContainer.appendChild(header);
    
    // Create the collapsible content container
    const contentContainer = document.createElement('div');
    contentContainer.className = '_19abae45';
    
    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'TFkX9lO HB1Xfid _19abae45 _47471e4e';
    
    const contentInner = document.createElement('div');
    contentInner.className = '_19abae45 a7c6de33 _194d8611';
    
    const panelContainer = document.createElement('div');
    panelContainer.className = '_19abae45 _8c75067a';
    
    const panel = document.createElement('div');
    panel.id = 'pomodoro-timer-panel';
    panel.className = '_19abae45';
    
    // Create timer container
    const timerContainer = document.createElement('div');
    timerContainer.className = 'pomodoro-sidebar-container';
    timerContainer.appendChild(this.timerWidget);
    
    panel.appendChild(timerContainer);
    panelContainer.appendChild(panel);
    contentInner.appendChild(panelContainer);
    contentWrapper.appendChild(contentInner);
    contentContainer.appendChild(contentWrapper);
    
    // Assemble the complete section
    timerSection.appendChild(headerContainer);
    timerSection.appendChild(contentContainer);
    
    // Add toggle functionality
    toggleButton.addEventListener('click', () => {
      const isExpanded = toggleButton.getAttribute('aria-expanded') === 'true';
      const newState = !isExpanded;
      
      toggleButton.setAttribute('aria-expanded', newState.toString());
      contentContainer.style.display = newState ? 'block' : 'none';
      
      // Rotate the arrow icon
      toggleIcon.style.transform = newState ? 'rotate(0deg)' : 'rotate(-90deg)';
      
      console.log('Pomodoro section toggled:', newState ? 'expanded' : 'collapsed');
    });
    
    // Store reference for later use
    this.timerSection = timerSection;
    
    // Find the best insertion point - try multiple strategies
    let insertionPoint = null;
    let insertionParent = null;
    
    // Strategy 1: Insert before projects section if found
    if (projectsSection && projectsSection.parentElement) {
      insertionParent = projectsSection.parentElement;
      insertionPoint = projectsSection;
      console.log('Using strategy 1: Insert before projects section');
    }
    // Strategy 2: Insert after top menu within the navigation container
    else if (topMenu && topMenu.parentElement) {
      insertionParent = topMenu.parentElement;
      insertionPoint = topMenu.nextElementSibling;
      console.log('Using strategy 2: Insert after top menu');
    }
    // Strategy 3: Insert after top menu in navigation container
    else if (topMenu && navContainer) {
      insertionParent = navContainer;
      insertionPoint = topMenu.nextElementSibling;
      console.log('Using strategy 3: Insert after top menu in nav container');
    }
    // Strategy 4: Append to navigation container
    else {
      insertionParent = navContainer;
      insertionPoint = null;
      console.log('Using strategy 4: Append to navigation container');
    }
    
    // Insert the timer section
    if (insertionPoint) {
      insertionParent.insertBefore(timerSection, insertionPoint);
    } else {
      insertionParent.appendChild(timerSection);
    }
    
    console.log('Timer widget successfully integrated into sidebar');
    
    // Initialize the widget after integration
    this.populateTaskDropdown();
    this.updateTimerWidget();
    this.setupWidgetControls();
  }
  
  fallbackPositioning() {
    // Fallback to fixed positioning if sidebar integration fails
    document.body.appendChild(this.timerWidget);
    this.timerWidget.style.position = 'fixed';
    this.timerWidget.style.top = '20px';
    this.timerWidget.style.right = '20px';
    this.timerWidget.style.zIndex = '10000';
    console.log('Using fallback fixed positioning');
  }
  
  updateTimerWidget() {
    if (!this.timerWidget) return;
    
    const dropdown = this.timerWidget.querySelector('.pomodoro-task-dropdown');
    const timeElement = this.timerWidget.querySelector('.pomodoro-timer-time');
    const todayElement = this.timerWidget.querySelector('.pomodoro-timer-today');
    const pauseBtn = this.timerWidget.querySelector('.pomodoro-timer-pause');
    const fillElement = this.timerWidget.querySelector('.pomodoro-timer-fill');
    const taskLabel = this.timerWidget.querySelector('.pomodoro-timer-task-label');
    
    // Remove all state classes
    this.timerWidget.classList.remove('state-idle', 'state-work', 'state-break', 'paused');
    
    if (!this.currentTimer) {
      // Idle state - show current work duration setting
      const workMinutes = this.settings.workDuration || 25; // Fallback to 25 if not loaded
      console.log('Idle state - work duration:', workMinutes, 'settings:', this.settings);
      const timeDisplay = `${workMinutes.toString().padStart(2, '0')}:00`;
      timeElement.textContent = timeDisplay;
      
      // Show task stats if a task is selected, otherwise show defaults
      if (dropdown && dropdown.value) {
        const taskId = this.generateTaskHash(dropdown.value);
        const taskStats = this.getTaskStats(taskId);
        todayElement.innerHTML = `Today <span class="pomodoro-timer-count">${taskStats.completedToday}</span>`;
      } else {
        todayElement.innerHTML = 'Today <span class="pomodoro-timer-count">0</span>';
      }
      
      pauseBtn.textContent = 'Start';
      pauseBtn.classList.add('primary');
      fillElement.style.strokeDasharray = '0, 100';
      
      // Show dropdown and label in idle state
      dropdown.style.display = 'block';
      dropdown.disabled = false;
      if (taskLabel) taskLabel.style.display = 'block';
      
      // Reset task progress bar
      this.updateTaskProgressBar(0);
      
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
    // Calculate circular progress: always show current progress regardless of status
    const circularProgress = ((this.currentTimer.duration - this.currentTimer.remaining) / this.currentTimer.duration) * 100;
    
    // Task progress bar: only show progress when running, 0% when paused
    const taskProgress = this.currentTimer.status === 'running' ? circularProgress : 0;
    
    console.log('Timer display:', timeDisplay, 'minutes:', minutes, 'seconds:', seconds);
    
    timeElement.textContent = timeDisplay;
    todayElement.innerHTML = `Today <span class="pomodoro-timer-count">${this.currentTimer.taskTodayPomodoros || 0}</span>`;
    fillElement.style.strokeDasharray = `${circularProgress}, 100`;
    
    // Update highlighted task progress bar (resets to 0% when paused)
    this.updateTaskProgressBar(taskProgress);
    
    // Keep dropdown visible but disabled when timer is active
    dropdown.value = this.currentTimer.taskName;
    dropdown.style.display = 'block';
    dropdown.disabled = true;
    
    // Hide task label when timer is running
    if (taskLabel) taskLabel.style.display = 'none';
    
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
      // Find the task_list_item__body container
      let taskContainer = targetTaskElement;
      let attempts = 0;
      const maxAttempts = 15;
      
      // Traverse up to find the task_list_item__body element
      while (taskContainer && attempts < maxAttempts) {
        if (taskContainer.classList && taskContainer.classList.contains('task_list_item__body')) {
          break;
        }
        taskContainer = taskContainer.parentElement;
        attempts++;
      }
      
      // If we didn't find task_list_item__body, fall back to the old logic
      if (!taskContainer || !taskContainer.classList.contains('task_list_item__body')) {
        taskContainer = targetTaskElement;
        attempts = 0;
        
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
      }
      
      // Apply highlighting - just the visual styling, no content modification
      if (taskContainer) {
        taskContainer.classList.add('pomodoro-selected-task');
        
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
      task.classList.remove('pomodoro-selected-task');
    });
  }
  
  updateTaskProgressBar(progress) {
    // Update the progress bar on the highlighted task
    const highlightedTask = document.querySelector('.pomodoro-selected-task');
    if (highlightedTask) {
      // Set CSS custom property for progress width
      highlightedTask.style.setProperty('--pomodoro-progress', `${progress}%`);
    }
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
  
  /**
   * Generate a unique hash for a task name to use as an identifier
   * @param {string} text - Task name to hash
   * @returns {string} Base-36 encoded hash string
   */
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
      console.log('Content script received message:', message);
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
    console.log('Updating settings:', newSettings);
    this.settings = {
      workDuration: newSettings.workDuration,
      shortBreak: newSettings.shortBreak,
      longBreak: newSettings.longBreak,
      sessionsUntilLongBreak: newSettings.sessionsUntilLongBreak
    };
    console.log('New settings applied:', this.settings);
    
    // Update the timer widget to reflect new settings if idle
    if (!this.currentTimer) {
      this.updateTimerWidget();
    }
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
        }, 50); // Update 20 times per second for smooth animations        
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