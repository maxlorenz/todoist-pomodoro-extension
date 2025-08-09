# Todoist Pomodoro Timer Extension

A Chrome extension that seamlessly integrates a Pomodoro timer directly into Todoist's interface, helping you stay focused and productive while managing your tasks.

![Extension Demo](assets/icon128.png)

<img width="458" height="203" alt="image" src="https://github.com/user-attachments/assets/e4a4db9b-ff37-4bf0-a24a-23be8aedcf8f" />
<img width="207" height="338" alt="image" src="https://github.com/user-attachments/assets/041ba140-b7c3-46af-b0fe-ac14b749423f" />

## 🍅 What is the Pomodoro Technique?

The Pomodoro Technique is a time management method developed by Francesco Cirillo in the late 1980s. It uses a timer to break work into intervals, traditionally 25 minutes in length, separated by short breaks. The technique helps improve focus, reduce mental fatigue, and maintain consistent productivity throughout the day.

### How it works:
1. **Choose a task** from your Todoist list
2. **Work for 25 minutes** (one "Pomodoro") with complete focus
3. **Take a 5-minute break** to rest and recharge
4. **Repeat the cycle** - after 4 Pomodoros, take a longer 15-minute break

## ✨ Features

- **Seamless Integration**: Timer widget integrates directly into Todoist's sidebar
- **Click-to-Start**: Simply click any task to start a focused work session
- **Visual Feedback**: Selected tasks are highlighted with progress indicators
- **Smart Notifications**: Desktop notifications for timer completion with break suggestions
- **Persistent State**: Timer continues running across browser sessions
- **Customizable Settings**: Adjust work duration, break lengths, and session intervals
- **Task Statistics**: Track daily and total Pomodoro completions per task
- **Dark Mode Support**: Automatically adapts to your system theme

## 🚀 Quick Start (2 minutes)

### Installation

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

### How to Use

#### Method 1: Use Task Dropdown (Recommended)
- **Timer widget appears** automatically in top-right corner
- **Select task** from dropdown (first task selected by default)
- **Click "Start"** to begin 25-minute work session
- **Single clicks work normally** in Todoist (task details, navigation)

#### Method 2: Click Tasks Directly
- **Click any task** in Todoist → Timer starts with that task name
- **Works as before** for quick timer starting

#### Method 3: Use Extension Popup
- **Click extension icon** in toolbar
- **Click "25 min Work"** to start a generic work session
- **Click "5 min Break"** or "15 min Break" for breaks

### Work/Break Cycles
- **Work session completes** → Hear beep sound 🔊 + modal
- **Choose break** → "Take short break (5 min)" or "Take long break (15 min)"
- **Break completes** → Notification + returns to idle with task ready
- **Continue working** → Starts fresh 25-minute work session

## 🎯 Smart Task Integration

### Intelligent Task Detection
- **Extracts real task names** from Todoist (e.g., "write email", "review proposal")
- **Prevents accidental activation** on buttons, checkboxes, and interactive elements
- **Works across all Todoist views** - Today, Upcoming, Projects, Labels, Filters

### Per-Task Pomodoro Tracking
- **Individual task statistics** - Each task remembers its own Pomodoro count
- **Daily and total counters** - See both today's progress and all-time totals
- **Task history** - Extension remembers every task you've worked on
- **Project integration** - Shows which project each task belongs to

### Smart Click Behavior

**✅ WILL Start Timer:**
- Clicking on task name/content
- Clicking empty space around task text
- Clicking task background area

**❌ WON'T Start Timer:**
- Task completion checkboxes
- Edit/more menu buttons (⋯)
- Priority indicators (🔴🟡⚪)
- Due date elements
- Project/label tags
- Any interactive buttons

## 🎨 User Interface

### Timer Widget (Embedded in Todoist):
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

### Extension Popup:
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
│ │ Quick Start             │
│ [25min Work] [5min Break]│
│     [15min Break]       │
└─────────────────────────┘
```

## 🔧 Customize Settings

Click the extension icon (🍅) in your toolbar:
- **Work Duration**: Default 25 minutes
- **Short Break**: Default 5 minutes  
- **Long Break**: Default 15 minutes
- **Sessions until long break**: Default 4
- **Click "Save"** to apply changes

## 🐛 Troubleshooting

### Extension Not Working

**Problem**: Timer doesn't appear when clicking tasks
**Solutions**:
1. Refresh the Todoist page (`Ctrl+R` or `Cmd+R`)
2. Make sure you're on `app.todoist.com` (not `todoist.com`)
3. Check that the extension is enabled in `chrome://extensions/`
4. Try disabling and re-enabling the extension

**Problem**: Extension popup shows "Open Todoist"
**Solutions**:
1. Navigate to `app.todoist.com` in the current tab
2. Make sure you're logged into Todoist
3. Refresh the page if needed

### Timer Issues

**Problem**: Timer seems inaccurate or jumps
**Solutions**:
1. This can happen if your computer goes to sleep
2. The timer will auto-correct when you return
3. For best accuracy, keep your computer awake during sessions

**Problem**: No notifications when timer completes
**Solutions**:
1. Check Chrome notification permissions:
   - Go to `chrome://settings/content/notifications`
   - Make sure notifications are allowed
   - Check that the extension has notification permission
2. Check your system notification settings
3. Try clicking the extension icon to see if timer completed

## 🏗️ Development

### Prerequisites
- Node.js 16+ 
- Chrome browser (for testing)
- Git

### Setup
```bash
git clone <repository-url>
cd todoist-pomo
npm install
```

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Code Quality
```bash
# Run linter
npm run lint

# Fix linting issues automatically
npm run lint:fix

# Validate everything (lint + test)
npm run validate
```

### Testing the Extension
1. Make your changes
2. Reload the extension in `chrome://extensions/`
3. Navigate to [Todoist](https://todoist.com)
4. Test your changes in the browser

## 📊 Project Structure

```
todoist-pomo/
├── manifest.json           # Extension configuration
├── src/
│   ├── content/           # Scripts injected into Todoist
│   │   ├── content.js     # Main content script
│   │   └── content.css    # Injected styles
│   ├── popup/             # Extension popup UI
│   │   ├── popup.html     # Popup interface
│   │   ├── popup.js       # Popup logic
│   │   └── popup.css      # Popup styles
│   └── background/        # Service worker
│       └── background.js  # Background script
├── assets/                # Icons and images
├── tests/                 # Unit tests
└── docs/                  # Documentation
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes with appropriate tests
4. Ensure all tests pass (`npm run validate`)
5. Submit a pull request

### Commit Message Guidelines

Use conventional commit format:
```
feat(timer): add pause/resume functionality
fix(ui): resolve timer display issue in dark mode
docs(readme): update installation instructions
test(timer): add tests for timer completion
```

## 🌐 Browser Compatibility

### Fully Supported
- Google Chrome 88+
- Microsoft Edge 88+
- Brave Browser (latest)
- Opera (latest)

### Limited Support
- Firefox: Not supported (uses different extension system)
- Safari: Not supported (uses different extension system)

## 🔒 Privacy & Security

This extension:
- Only runs on app.todoist.com
- Stores timer data locally in your browser
- Does not collect or transmit personal data
- Does not access your Todoist account data
- No external API calls or tracking

### What Data is Stored
- Timer settings (durations, preferences)
- Current timer state (task name, remaining time)
- Session completion counts

### Where Data is Stored
- Locally in your browser only
- Settings sync across Chrome browsers if you're signed in
- No data is sent to external servers

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Getting Help

### Common Issues
- Check this troubleshooting section first
- Try refreshing the Todoist page
- Disable and re-enable the extension

### Reporting Bugs
If you encounter issues:
1. Note your Chrome version (`chrome://version/`)
2. Note the exact steps that caused the problem
3. Check the browser console for errors (`F12` → Console tab)
4. Report the issue with these details

---

**Simple, focused, and effective! 🎯**