# Changelog

## [Latest] - Fixed Critical Issues & Added v2 Preview Features

### 🚨 **Critical Fix**
- **✅ Fixed infinite loop** causing app.todoist.com to hang
- **✅ Removed problematic MutationObserver** that was causing performance issues
- **✅ Replaced with efficient periodic updates** (5-second intervals when idle)
- **✅ Added safeguards** to prevent widget from observing itself

### 🎨 **v2 Preview Features**
- **✅ Minimal view toggle** - Click ⚡ button to minimize timer widget
- **✅ State-based colors** - Different colors for idle/work/break/paused states
- **✅ Smooth animations** - Enhanced transitions and hover effects
- **✅ Improved visual design** - Better shadows, gradients, and spacing

### 🔧 **Enhanced User Experience**
- **Minimal View**: Compact 140px widget showing just time and controls
- **Smart Colors**: 
  - Idle: Soft gray/blue gradients
  - Work: Energetic red gradients  
  - Break: Calming green gradients
  - Paused: Warm amber gradients
- **Smooth Interactions**: Better button hover effects and transitions
- **Persistent Preferences**: Minimal view setting remembered across sessions

### 🏗️ **v2.0 Roadmap Created**
- **Comprehensive plan** for delightful animations and interactions
- **Advanced features** including analytics, sound themes, and smart suggestions
- **Accessibility improvements** and performance optimizations
- **Modular architecture** for better maintainability

## [Previous] - Fixed Issues & Added Task Dropdown

### 🔧 **Fixed All Reported Issues**
- **✅ Reverted click behavior** - Single clicks now work normally for Todoist navigation
- **✅ Added task dropdown selector** - Choose from visible tasks in the timer widget
- **✅ Fixed break duration display** - Now shows correct minutes (5 min, 15 min)
- **✅ Fixed break timer loop** - Breaks complete properly without immediate popup
- **✅ Fixed continue working** - Properly starts new work session after break choice

### 🎯 **New Task Selection Method**
**Task Dropdown:**
- Timer widget shows dropdown with all visible tasks on page
- First task selected by default
- Click "Start" to begin timer with selected task
- Dropdown hides when timer is active

**Click Behavior:**
- **Single click:** Normal Todoist behavior (task details, navigation)
- **Click task:** Still starts timer (for quick selection)
- **Dropdown:** Primary method for task selection

### 🔄 **Fixed Work/Break Cycles**
1. **Work session completes** → Sound + modal with correct break durations
2. **Take break** → Timer runs for correct duration (5 min or 15 min)
3. **Break completes** → Notification + returns to idle with task pre-selected
4. **Continue working** → Starts fresh 25-minute work session
5. **Stop timer** → Returns to idle state

### 🎨 **Improved Timer Widget**
**When Idle:**
```
┌─────────────────────────┐
│ [Select Task Dropdown]  │
│    ⭕ 25:00             │
│   [Start]    [Stop]     │
│ idle  Select task and..│
└─────────────────────────┘
```

**When Active:**
```
┌─────────────────────────┐
│     Write Email         │
│    ⭕ 15:30             │
│  [Pause]    [Stop]     │
│ work  Task | Today: 2..│
└─────────────────────────┘
```

## [Previous] - Complete Refactor & Major Improvements

### 🔧 **Fixed All Major Issues**
- **✅ Fixed URL navigation** - Single clicks now work normally, use double-click or Ctrl+click for timer
- **✅ Added sound notifications** - Plays beep sound when timer completes
- **✅ Proper work/break cycles** - Automatic progression: work → short break → work → long break
- **✅ Always visible timer** - Timer widget appears immediately when page loads
- **✅ Clean codebase** - Complete restructure with better organization

### 🎯 **New Click Behavior**
**Single click:** Normal Todoist behavior (opens task details)
**Double-click:** Start Pomodoro timer with task name
**Ctrl+Click (Cmd+Click):** Start Pomodoro timer with task name

### 🔄 **Automatic Work/Break Cycles**
1. **Work session (25 min)** → Completion sound + modal
2. **Choose break:** Short break (5 min) or Long break (15 min)
3. **Break completes** → Automatically starts new work session
4. **Long breaks** offered every 4 completed work sessions

### 🎨 **Always-Visible Timer**
- **Timer widget appears immediately** when you visit Todoist
- **Shows "Ready to work"** when idle
- **Displays current task** and progress when active
- **Stays in top-right corner** always

### 🔊 **Audio Feedback**
- **Completion sound** plays when any timer finishes
- **Works without permissions** using Web Audio API
- **Simple beep pattern** to get your attention

### 🏗️ **Restructured Codebase**
- **Organized into logical sections** (Settings, Audio, Timer Control, UI, etc.)
- **Better error handling** and state management
- **Cleaner separation of concerns**
- **More maintainable and extensible**

## [Previous] - UI Fixes & Simplified Experience

### 🔧 **Fixed Issues**
- **Removed timer display from popup** - Popup now shows only start buttons and settings
- **Fixed settings save functionality** - Timer durations now properly update when saved
- **Fixed timer positioning** - Timer widget always stays in top-right corner
- **Restored original click behavior** - Click any task to start timer with that task name
- **Simplified task selection** - No more complex modal dialogs for task switching

### 🎨 **Updated Popup Interface**
**Before:** Complex timer display with pause/resume controls
**After:** Clean interface with just:
- Start Timer buttons (25min Work, 5min Break, 15min Break)
- Settings section (working save functionality)
- Minimal, focused design

### 🎯 **Improved Click Behavior**
**Now:**
- Click any `.task_content` element → Timer starts with task name
- Timer always appears in top-right corner (doesn't move around)
- Settings changes take effect immediately
- Quick start buttons use your custom durations

### 🚀 **Simplified Workflow**
1. **Set your preferences** in popup settings (25min work, 5min break, etc.)
2. **Click extension icon** → Click "25 min Work" to start timer
3. **Or click any task** in Todoist → Timer starts with that task name
4. **Timer stays put** in top-right corner, doesn't jump around

## [Previous] - Smart Todoist Integration

### 🎯 **Enhanced Task Integration**
- **Smart task detection** - Properly extracts task names from Todoist elements
- **Prevents accidental activation** - Won't trigger on edit buttons, checkboxes, or interactive elements
- **Task-specific naming** - Timer shows actual task names from Todoist (e.g., "write email")
- **Per-task Pomodoro tracking** - Tracks how many Pomodoros completed for each specific task
- **Task history** - Remembers all tasks you've worked on with statistics

### 📊 **Advanced Statistics**
- **Today vs Total counts** - Shows both daily and all-time Pomodoro counts per task
- **Task history in popup** - Recent tasks section showing your most worked-on tasks
- **Project integration** - Extracts and displays project information when available
- **Persistent tracking** - Task statistics survive browser restarts

### 🔧 **Smart Click Detection**
**Won't activate timer on:**
- Task completion checkboxes ✅
- Edit/more menu buttons ⚙️
- Priority indicators 🔴
- Date/time elements 📅
- Project/label tags 🏷️

**Will activate timer on:**
- Task name/content area ✅
- Empty space around task text ✅

### 🎨 **Updated UI Features**
- **Task-specific counters** - Widget shows "Today: 2, Total: 15" for current task
- **Improved popup stats** - Shows "3 today, 12 total" instead of generic session count
- **Recent tasks section** - Popup displays your 5 most recent tasks with statistics
- **Better task switching** - Smart modal when clicking different tasks while timer is running

## [Previous] - UI Improvements

### ✅ **Fixed Website Detection Issue**
- Fixed popup not detecting Todoist tabs properly
- Improved error handling and fallback mechanisms
- Added auto-refresh of timer state every 3 seconds
- Enhanced "Open Todoist" button to focus existing tabs

### 🎨 **Updated Timer Widget Design**
- **Replaced emoji icons with text buttons** (Pause/Resume, Stop)
- **Matched popup styling** - consistent design language
- **Added CSS variables** for better theming support
- **Improved dark mode** support with proper color schemes
- **Enhanced button styling** with hover and active states
- **Added session counter** to timer widget
- **Better typography** and spacing consistency

### 🔧 **Technical Improvements**
- Unified design tokens between popup and content script
- Better CSS organization with CSS custom properties
- Improved accessibility with proper button labels
- Enhanced visual feedback for button interactions
- Consistent border radius and shadow styles

### 📱 **UI Changes**
**Before:**
- Timer buttons showed emoji icons (⏸️ ⏹️)
- Inconsistent styling between popup and widget
- Basic button styling

**After:**
- Text buttons ("Pause", "Resume", "Stop")
- Consistent design matching the popup
- Professional button styling with proper states
- Session counter display
- Better dark mode support

## Installation Notes

After updating:
1. **Reload the extension** in `chrome://extensions/`
2. **Refresh Todoist page** to load new styles
3. **Test timer functionality** by clicking any task

The timer widget now has a clean, professional appearance that matches the popup interface perfectly! 🎉