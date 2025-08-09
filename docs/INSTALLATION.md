# Installation Guide

This guide will walk you through installing the Todoist Pomodoro Timer Chrome extension.

## Prerequisites

- Chrome 88+ or any Chromium-based browser (Edge, Brave, etc.)
- Access to [app.todoist.com](https://app.todoist.com)

## Development Installation

### Step 1: Download the Extension

Clone or download this repository to your local machine:

```bash
git clone <repository-url>
cd todoist-pomo
```

### Step 2: Open Chrome Extensions Page

1. Open Google Chrome
2. Navigate to `chrome://extensions/`
3. Alternatively, click the three dots menu → More tools → Extensions

### Step 3: Enable Developer Mode

1. In the top-right corner of the extensions page, toggle on **"Developer mode"**
2. This will reveal additional options for loading unpacked extensions

### Step 4: Load the Extension

1. Click the **"Load unpacked"** button
2. Navigate to and select the `todoist-pomo` folder (the root directory containing `manifest.json`)
3. Click **"Select Folder"**

### Step 5: Verify Installation

1. The extension should now appear in your extensions list
2. You should see "Todoist Pomodoro Timer" with a version number
3. Make sure the extension is **enabled** (toggle switch is blue/on)

## Using the Extension

### First Time Setup

1. Navigate to [app.todoist.com](https://app.todoist.com)
2. Log into your Todoist account
3. The extension is now ready to use!

### Starting a Timer

1. **Click on any task** in your Todoist interface
2. A timer widget will appear showing a 25-minute countdown
3. The timer starts automatically when you click a task

### Controlling the Timer

#### From the Injected Widget
- **Pause/Resume**: Click the ⏸️/▶️ button
- **Stop**: Click the ⏹️ button

#### From the Extension Popup
1. Click the extension icon in your browser toolbar
2. View current timer status
3. Use controls to pause, resume, or stop
4. Start quick timers (25min work, 5min break, 15min break)

### Settings Configuration

1. Click the extension icon to open the popup
2. Scroll down to the "Settings" section
3. Adjust timer durations:
   - **Work Duration**: Default 25 minutes
   - **Short Break**: Default 5 minutes  
   - **Long Break**: Default 15 minutes
   - **Sessions until long break**: Default 4
4. Click **"Save Settings"** to apply changes

## Troubleshooting

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

### Timer Accuracy Issues

**Problem**: Timer seems inaccurate or jumps
**Solutions**:
1. This can happen if your computer goes to sleep
2. The timer will auto-correct when you return
3. For best accuracy, keep your computer awake during sessions

### Notifications Not Appearing

**Problem**: No notifications when timer completes
**Solutions**:
1. Check Chrome notification permissions:
   - Go to `chrome://settings/content/notifications`
   - Make sure notifications are allowed
   - Check that the extension has notification permission
2. Check your system notification settings
3. Try clicking the extension icon to see if timer completed

### Multiple Timers

**Problem**: Confused about multiple timers
**Solution**: The extension supports one active timer at a time. Clicking a new task will ask if you want to:
- Continue the current timer
- Start a new timer for the clicked task
- Cancel the action

## Permissions Explained

The extension requests these permissions:

- **Storage**: Save your timer settings and current timer state
- **Notifications**: Show completion alerts when timers finish
- **Active Tab**: Communicate between popup and content script
- **Host Permission (app.todoist.com)**: Inject timer functionality into Todoist

## Browser Compatibility

### Fully Supported
- Google Chrome 88+
- Microsoft Edge 88+
- Brave Browser (latest)
- Opera (latest)

### Limited Support
- Firefox: Not supported (uses different extension system)
- Safari: Not supported (uses different extension system)

## Uninstalling

### Temporary Disable
1. Go to `chrome://extensions/`
2. Toggle off the extension switch

### Complete Removal
1. Go to `chrome://extensions/`
2. Click **"Remove"** on the Todoist Pomodoro Timer extension
3. Confirm removal
4. All settings and data will be deleted

## Data and Privacy

### What Data is Stored
- Timer settings (durations, preferences)
- Current timer state (task name, remaining time)
- Session completion counts

### Where Data is Stored
- Locally in your browser only
- Settings sync across Chrome browsers if you're signed in
- No data is sent to external servers

### Data Removal
- Uninstalling the extension removes all data
- You can also clear extension data in Chrome settings

## Getting Help

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

### Feature Requests
Have ideas for improvements? We'd love to hear them! Consider contributing to the project or submitting feature requests.

## Advanced Usage

### Keyboard Shortcuts
Currently, the extension doesn't support keyboard shortcuts, but you can:
- Use Chrome's built-in extension shortcuts (`chrome://extensions/shortcuts/`)
- Set up custom shortcuts to open the extension popup

### Multiple Todoist Accounts
The extension works with whichever Todoist account is currently logged in. To switch accounts:
1. Log out of Todoist
2. Log into your other account
3. The extension will work with the new account

### Using with Todoist Projects
The extension works with tasks from any project or view in Todoist:
- Today view
- Upcoming view
- Project views
- Label and filter views

The timer will show the task name regardless of which view you're in.