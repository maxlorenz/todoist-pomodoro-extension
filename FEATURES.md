# 🍅 Todoist Pomodoro Timer - Features Overview

## 🎯 **Smart Task Integration**

### **Intelligent Task Detection**
- **Extracts real task names** from Todoist (e.g., "write email", "review proposal")
- **Prevents accidental activation** on buttons, checkboxes, and interactive elements
- **Works across all Todoist views** - Today, Upcoming, Projects, Labels, Filters

### **Per-Task Pomodoro Tracking**
- **Individual task statistics** - Each task remembers its own Pomodoro count
- **Daily and total counters** - See both today's progress and all-time totals
- **Task history** - Extension remembers every task you've worked on
- **Project integration** - Shows which project each task belongs to

## 📊 **Advanced Statistics**

### **Timer Widget Shows:**
- Current task name from Todoist
- Today's Pomodoro count for this task
- Total Pomodoros ever completed for this task
- Current session progress

### **Popup Dashboard Shows:**
- Active timer with task-specific stats
- Recent tasks section (top 5 most recent)
- Each task's daily and total Pomodoro counts
- Quick start buttons for generic timers

## 🔧 **Smart Click Behavior**

### **✅ WILL Start Timer:**
- Clicking on task name/content
- Clicking empty space around task text
- Clicking task background area

### **❌ WON'T Start Timer:**
- Task completion checkboxes
- Edit/more menu buttons (⋯)
- Priority indicators (🔴🟡⚪)
- Due date elements
- Project/label tags
- Any interactive buttons

### **🔄 Smart Task Switching:**
When clicking a different task while timer is running:
- Shows modal with options:
  - Continue current task timer
  - Switch to new task timer
  - Cancel action

## 🎨 **User Interface**

### **Timer Widget (Embedded in Todoist):**
```
┌─────────────────────────┐
│     Write Email         │
│                         │
│    ⭕ 15:30             │
│                         │
│  [Pause]    [Stop]     │
│                         │
│ work  Today: 2  Total: 8│
└─────────────────────────┘
```

### **Extension Popup:**
```
┌─────────────────────────┐
│    🍅 Pomodoro          │
├─────────────────────────┤
│ Write Email             │
│ work • 2 today, 8 total │
│                         │
│    ⭕ 15:30             │
│                         │
│  [Pause]    [Stop]     │
├─────────────────────────┤
│ Recent Tasks            │
│ • Write Email    2│8    │
│ • Review Docs    1│5    │
│ • Team Meeting   0│3    │
├─────────────────────────┤
│ Quick Start             │
│ [25min Work] [5min Break]│
│     [15min Break]       │
└─────────────────────────┘
```

## 🚀 **Usage Examples**

### **Scenario 1: Starting Work on a Task**
1. Go to app.todoist.com
2. Click on "Write quarterly report" task
3. Timer starts with task name "Write quarterly report"
4. Widget shows: "Today: 0, Total: 0" (first time working on this task)

### **Scenario 2: Continuing Work on Previous Task**
1. Click on "Write quarterly report" again (you worked on it yesterday)
2. Timer starts showing: "Today: 0, Total: 3" (3 Pomodoros from previous days)
3. After completing a Pomodoro: "Today: 1, Total: 4"

### **Scenario 3: Switching Between Tasks**
1. Timer running on "Write report" (15 minutes left)
2. Click on "Review budget" task
3. Modal appears:
   - "Continue 'Write report'" 
   - "Switch to 'Review budget'"
   - "Cancel"
4. Choose to switch → Timer stops on first task, starts on second

### **Scenario 4: Avoiding Accidental Activation**
1. Click task checkbox to mark complete → ❌ Timer doesn't start
2. Click "..." menu to edit task → ❌ Timer doesn't start  
3. Click priority flag → ❌ Timer doesn't start
4. Click task name → ✅ Timer starts

## 📈 **Data Tracking**

### **What Gets Stored:**
- **Task ID** (generated from task content)
- **Task name** (extracted from Todoist)
- **Project name** (if available)
- **Total Pomodoros** completed for this task
- **Daily Pomodoros** (resets each day)
- **Last worked date** for sorting recent tasks

### **Where Data is Stored:**
- **Locally in browser** (Chrome storage)
- **No external servers** - complete privacy
- **Syncs across devices** if signed into Chrome
- **Persists across browser restarts**

## 🔒 **Privacy & Security**

- **No data collection** - everything stays local
- **No external API calls** - works entirely offline
- **No access to Todoist account** - only reads visible task names
- **No tracking or analytics** - completely private

## 🎛️ **Customization**

### **Timer Durations:**
- Work sessions: 1-60 minutes (default: 25)
- Short breaks: 1-30 minutes (default: 5)  
- Long breaks: 1-60 minutes (default: 15)
- Sessions until long break: 1-10 (default: 4)

### **Visual Themes:**
- Automatic dark/light mode based on system
- Consistent with Todoist's design language
- Professional, non-intrusive appearance

This integration makes the Pomodoro technique seamlessly blend with your existing Todoist workflow! 🎯