# 🍅 Todoist Pomodoro Timer - Quick Start

## ⚡ Installation (2 minutes)

1. **Open Chrome Extensions**
   - Go to `chrome://extensions/`
   - Toggle on "Developer mode" (top right)

2. **Load Extension**
   - Click "Load unpacked"
   - Select this `todoist-pomo` folder
   - Extension should appear in your list

3. **Test Installation**
   - Go to [app.todoist.com](https://app.todoist.com)
   - Timer widget appears in top-right corner immediately! 🎉
   - Select a task from dropdown and click "Start"

## 🎯 How to Use

### Method 1: Use Task Dropdown (Recommended)
- **Timer widget appears** automatically in top-right corner
- **Select task** from dropdown (first task selected by default)
- **Click "Start"** to begin 25-minute work session
- **Single clicks work normally** in Todoist (task details, navigation)

### Method 2: Click Tasks Directly
- **Click any task** in Todoist → Timer starts with that task name
- **Works as before** for quick timer starting

### Method 3: Use Extension Popup
- **Click extension icon** in toolbar
- **Click "25 min Work"** to start a generic work session
- **Click "5 min Break"** or "15 min Break" for breaks

### Work/Break Cycles
- **Work session completes** → Hear beep sound 🔊 + modal
- **Choose break** → "Take short break (5 min)" or "Take long break (15 min)"
- **Break completes** → Notification + returns to idle with task ready
- **Continue working** → Starts fresh 25-minute work session

## 🔧 Customize Settings

Click the extension icon (🍅) in your toolbar:
- **Work Duration**: Default 25 minutes
- **Short Break**: Default 5 minutes  
- **Long Break**: Default 15 minutes
- **Sessions until long break**: Default 4
- **Click "Save"** to apply changes

## 🎨 What You'll See

### Timer Widget (Always Visible in Top-Right)

**Full View (Default):**
```
┌─────────────────────────┐
│ ⚡              25:00   │
│ [Select Task Dropdown]  │
│    ⭕ 25:00             │
│   [Start]   [Stop]     │
│ idle  Select task and..│
└─────────────────────────┘
```

**Minimal View (Click ⚡):**
```
┌─────────────┐
│ ⚡   25:00   │
│ [Start][Stop]│
└─────────────┘
```

**Active Timer:**
```
┌─────────────────────────┐
│ ⚡              15:30   │
│    ⭕ 15:30             │
│  [Pause]    [Stop]     │
│ work  Task | Today: 2..│
└─────────────────────────┘
```

**When Active:**
```
┌─────────────────────────┐
│     Write Email         │
│    ⭕ 15:30             │
│  [Pause]    [Stop]     │
│ work  Today: 2 | Total: 8│
└─────────────────────────┘
```

### Extension Popup
```
┌─────────────────────────┐
│    🍅 Pomodoro          │
├─────────────────────────┤
│ Start Timer             │
│ [25min Work] [5min Break]│
│     [15min Break]       │
├─────────────────────────┤
│ Settings                │
│ Work Duration: [25] min │
│ Short Break: [5] min    │
│ Long Break: [15] min    │
│ Sessions until long: [4]│
│        [Save]           │
└─────────────────────────┘
```

## 🚀 Quick Workflow

1. **Visit Todoist** → Timer widget appears automatically

2. **Start working**
   - Double-click "Write report" task
   - Timer starts: "Write report - 25:00" 🔊

3. **Automatic cycles**
   - Work completes → Beep sound → Choose break
   - Break completes → Automatically starts new work session
   - Every 4 sessions → Long break offered

4. **Stay focused**
   - Timer always visible in top-right corner
   - Tracks progress per task
   - Single clicks work normally for task details

## 🐛 Troubleshooting

**Website hanging or slow?**
- **Fixed!** Infinite loop issue resolved
- Reload extension: `chrome://extensions/` → Click reload
- Refresh Todoist page
- Should work smoothly now

**Timer not appearing?**
- Make sure you're on `app.todoist.com`
- Check extension is enabled
- Timer should appear immediately when page loads

**Can't start timer?**
- Use the **task dropdown** in the timer widget (recommended)
- Or **click any task** in Todoist directly
- Make sure a task is selected before clicking "Start"

**No sound when timer completes?**
- Sound uses Web Audio API (no permissions needed)
- Check browser isn't muted
- Some browsers block audio until user interaction

**Settings not saving?**
- Make sure you click the "Save" button
- Settings update immediately

---

**Simple, focused, and effective! 🎯**