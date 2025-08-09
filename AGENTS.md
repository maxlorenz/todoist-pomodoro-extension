# Agent Guidelines for Todoist Pomodoro Extension

## Build/Test Commands
- **Test**: `npm test` (Jest configured and ready)
- **Test Watch**: `npm run test:watch` (continuous testing during development)
- **Test Coverage**: `npm run test:coverage` (generate coverage reports)
- **Lint**: `npm run lint` (ESLint configured and ready)
- **Lint Fix**: `npm run lint:fix` (automatically fix linting issues)
- **Build**: `npm run build` (extension ready for Chrome loading)
- **Validate**: `npm run validate` (runs both linting and tests)
- **Dev**: Load extension from `chrome://extensions/` in developer mode
- **Single test**: `npm test -- --testNamePattern="test name"`

## Code Style Guidelines
- **Classes**: Use ES6 classes with PascalCase (e.g., `PomodoroTimer`, `BackgroundService`)
- **Methods**: Use camelCase with descriptive names (e.g., `startWorkTimer`, `handleTimerStarted`)
- **Variables**: Use camelCase, prefer `const`/`let` over `var`
- **Async/await**: Prefer over Promises, always wrap in try-catch blocks
- **Error handling**: Use `console.warn()` for recoverable errors, `console.error()` for critical failures
- **Comments**: Use section dividers like `// ========== SECTION NAME ==========`
- **Storage**: Use `chrome.storage.local` for state, `chrome.storage.sync` for settings
- **Event listeners**: Use arrow functions for inline handlers, named methods for complex logic
- **DOM queries**: Cache frequently used elements, use specific selectors
- **Chrome APIs**: Always handle potential failures with try-catch
- **File structure**: Keep related functionality grouped in logical sections within classes
- **Testing**: Use Jest with Chrome API mocks, test timer logic and state management

## Project Structure

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

## Development Workflow

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

## Technical Architecture

### Content Script (`src/content/content.js`)
- Inject into app.todoist.com pages
- Listen for clicks on `.task_content` elements
- Create and manage timer UI overlay
- Handle task selection and timer state
- Communicate with background script for persistence

### Background Script (`src/background/background.js`)
- Manage timer state across tabs
- Handle notifications
- Store session data
- Coordinate between content script and popup

### Popup UI (`src/popup/`)
- Show current timer status
- Allow manual timer control
- Display session statistics
- Settings for timer durations

## Permissions Required
```json
{
  "permissions": [
    "storage",
    "notifications",
    "activeTab"
  ],
  "host_permissions": [
    "https://app.todoist.com/*"
  ]
}
```

## Key Components

### Timer State Object
```javascript
{
  taskId: string,
  taskName: string,
  duration: number, // milliseconds
  remaining: number, // milliseconds
  status: 'idle' | 'running' | 'paused' | 'completed',
  type: 'work' | 'break',
  startTime: timestamp,
  completedSessions: number
}
```

### Storage Schema
```javascript
{
  currentTimer: TimerState,
  settings: {
    workDuration: 25 * 60 * 1000, // 25 minutes
    shortBreak: 5 * 60 * 1000,    // 5 minutes
    longBreak: 15 * 60 * 1000,    // 15 minutes
    sessionsUntilLongBreak: 4,
    notifications: true,
    sounds: true
  },
  history: TimerSession[]
}
```

## Troubleshooting Guide

### Issue: "No active timer, Open a task in Todoist and start the clock"

This message appears when the extension popup cannot detect or communicate with a Todoist tab.

#### Quick Fix Steps:

1. **Reload the Extension:**
   - Go to `chrome://extensions/`
   - Find "Todoist Pomodoro Timer"
   - Click the refresh/reload icon 🔄

2. **Navigate to Todoist:**
   - Go to `https://app.todoist.com` (not just `todoist.com`)
   - Make sure you're logged in
   - Refresh the page (`Ctrl+R` or `Cmd+R`)

3. **Test the Timer:**
   - Click on any task in Todoist
   - Timer should appear immediately
   - Check extension popup - should show active timer

#### Detailed Troubleshooting:

**Problem: Extension popup shows "Open Todoist"**
- Navigate to `app.todoist.com` in the current tab
- Make sure the URL shows `https://app.todoist.com/...`
- Refresh the Todoist page
- Click the "Open Todoist" button in the popup

**Problem: Timer doesn't start when clicking tasks**
1. **Check Console for Errors:**
   - Press `F12` on Todoist page
   - Go to Console tab
   - Look for red error messages
   - Refresh page if you see errors

2. **Reload Extension:**
   - `chrome://extensions/` → Find extension → Click reload icon
   - Refresh Todoist page after reloading extension

3. **Check Extension Permissions:**
   - `chrome://extensions/` → Find extension → Click "Details"
   - Make sure "On specific sites" shows `app.todoist.com`

**Problem: Popup shows connection issues**
- Close and reopen the extension popup
- Refresh the Todoist page
- Make sure you're on `app.todoist.com` (not a different Todoist URL)

### Common Causes:
- **Wrong URL:** Make sure you're on `app.todoist.com`, not `todoist.com`
- **Extension not reloaded:** After editing files, always reload the extension
- **Page not refreshed:** After reloading extension, refresh Todoist page
- **JavaScript disabled:** Make sure JavaScript is enabled in Chrome
- **Ad blockers:** Some ad blockers might interfere with content scripts

### Still Not Working?

If none of the above fixes work:

1. **Complete Reset:**
   - Remove extension from Chrome
   - Restart Chrome browser
   - Reload extension from folder
   - Navigate to fresh Todoist tab

2. **Check Browser Version:**
   - Extension requires Chrome 88+
   - Go to `chrome://version/` to check

## Contributing Guidelines

### Before Submitting
1. Create a feature branch from `main`
2. Make your changes with appropriate tests
3. Ensure all tests pass (`npm run validate`)
4. Update documentation if needed
5. Test the extension manually

### Pull Request Guidelines
- **Title**: Use a clear, descriptive title
- **Description**: Explain what changes you made and why
- **Testing**: Describe how you tested your changes
- **Screenshots**: Include screenshots for UI changes
- **Breaking Changes**: Clearly mark any breaking changes

### Commit Message Guidelines

Use conventional commit format:
```
type(scope): description

[optional body]

[optional footer]
```

#### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

#### Examples
```
feat(timer): add pause/resume functionality
fix(ui): resolve timer display issue in dark mode
docs(readme): update installation instructions
test(timer): add tests for timer completion
```

## Browser Compatibility

### Fully Supported
- Google Chrome 88+
- Microsoft Edge 88+
- Brave Browser (latest)
- Opera (latest)

### Limited Support
- Firefox: Not supported (uses different extension system)
- Safari: Not supported (uses different extension system)

## Privacy & Security

### Data Handling
- All data stored locally
- No external API calls
- No user tracking
- Minimal permissions requested
- Clear privacy policy

### What Data is Stored
- Timer settings (durations, preferences)
- Current timer state (task name, remaining time)
- Session completion counts

### Where Data is Stored
- Locally in your browser only
- Settings sync across Chrome browsers if you're signed in
- No data is sent to external servers

## Performance Considerations

### Optimization Targets
- Minimal memory footprint
- Efficient DOM queries
- Debounced event listeners
- Lazy loading of non-critical features
- Background script efficiency

### Monitoring Points
- Content script injection time
- Timer accuracy and drift
- Memory usage over time
- CPU usage during active timers
- Storage quota management