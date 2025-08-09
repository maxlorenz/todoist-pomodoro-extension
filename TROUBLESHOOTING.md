# 🔧 Troubleshooting Guide

## Issue: "No active timer, Open a task in Todoist and start the clock"

This message appears when the extension popup cannot detect or communicate with a Todoist tab. Here's how to fix it:

### ✅ **Quick Fix Steps:**

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

### 🔍 **Detailed Troubleshooting:**

#### Problem: Extension popup shows "Open Todoist"
**Cause:** You're not on the Todoist website or the content script isn't loaded.

**Solutions:**
- Navigate to `app.todoist.com` in the current tab
- Make sure the URL shows `https://app.todoist.com/...`
- Refresh the Todoist page
- Click the "Open Todoist" button in the popup

#### Problem: Timer doesn't start when clicking tasks
**Cause:** Content script not injected or JavaScript errors.

**Solutions:**
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

#### Problem: Popup shows connection issues
**Cause:** Communication between popup and content script failed.

**Solutions:**
- Close and reopen the extension popup
- Refresh the Todoist page
- Make sure you're on `app.todoist.com` (not a different Todoist URL)

### 🚀 **Testing the Fix:**

After following the steps above:

1. **Open Todoist:** Go to `https://app.todoist.com`
2. **Check Popup:** Click extension icon - should detect Todoist
3. **Click Task:** Click any task - timer should start
4. **Verify Popup:** Extension popup should show active timer

### 🔧 **Advanced Debugging:**

If the issue persists:

1. **Check Extension Console:**
   - `chrome://extensions/` → Developer mode ON
   - Click "background page" or "service worker" link
   - Check for errors in the console

2. **Check Content Script Injection:**
   - On Todoist page, press `F12`
   - Go to Console tab
   - Type: `document.querySelector('.pomodoro-timer-widget')`
   - Should return `null` (no timer) or an element (timer active)

3. **Manual Timer Test:**
   - In extension popup, try "Quick start" buttons
   - These should work even if task clicking doesn't

4. **Storage Check:**
   - In browser console on Todoist: `chrome.storage.local.get(['currentTimer'])`
   - Should show current timer state

### 📝 **Common Causes:**

- **Wrong URL:** Make sure you're on `app.todoist.com`, not `todoist.com`
- **Extension not reloaded:** After editing files, always reload the extension
- **Page not refreshed:** After reloading extension, refresh Todoist page
- **JavaScript disabled:** Make sure JavaScript is enabled in Chrome
- **Ad blockers:** Some ad blockers might interfere with content scripts

### 🆘 **Still Not Working?**

If none of the above fixes work:

1. **Complete Reset:**
   - Remove extension from Chrome
   - Restart Chrome browser
   - Reload extension from folder
   - Navigate to fresh Todoist tab

2. **Check Browser Version:**
   - Extension requires Chrome 88+
   - Go to `chrome://version/` to check

3. **Try Different Task:**
   - Some tasks might have different HTML structure
   - Try clicking different tasks in different projects

The extension should now work properly! The key is making sure you're on the right Todoist URL and that the extension is properly loaded.