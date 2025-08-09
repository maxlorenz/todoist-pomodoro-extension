# Todoist Pomodoro Timer Extension

A Chrome extension that seamlessly integrates a Pomodoro timer directly into Todoist's interface, helping you stay focused and productive while managing your tasks.

![Extension Demo](assets/icon128.png)

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

## 🚀 Installation

### From Chrome Web Store (Recommended)
*Coming soon - extension will be published to the Chrome Web Store*

### Manual Installation (Development)
1. Clone this repository:
   ```bash
   git clone https://github.com/username/todoist-pomodoro-extension.git
   cd todoist-pomodoro-extension
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run tests to ensure everything works:
   ```bash
   npm test
   ```

4. Load the extension in Chrome:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" in the top right
   - Click "Load unpacked" and select the project directory
   - The extension icon should appear in your toolbar

5. Navigate to [Todoist](https://app.todoist.com) to start using the timer!

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

## Installation

### Development Installation

1. Clone this repository:
   ```bash
   git clone <repository-url>
   cd todoist-pomo
   ```

2. Open Chrome and navigate to `chrome://extensions/`

3. Enable "Developer mode" in the top right corner

4. Click "Load unpacked" and select the project directory

5. The extension should now appear in your extensions list

### Production Installation

1. Download the latest release from the releases page
2. Follow steps 2-4 from the development installation
3. Select the downloaded extension folder

## Usage

1. Navigate to [app.todoist.com](https://app.todoist.com)
2. Click on any task to start a Pomodoro timer
3. A timer widget will appear showing the countdown
4. Use the extension popup to control timer settings
5. Receive notifications when sessions complete

## Development

### Running Tests

```bash
npm test
```

### Building for Production

```bash
npm run build
```

### Linting

```bash
npm run lint
```

## Browser Compatibility

- Chrome 88+
- Microsoft Edge 88+
- Brave Browser
- Any Chromium-based browser supporting Manifest V3

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Privacy

This extension:
- Only runs on app.todoist.com
- Stores timer data locally in your browser
- Does not collect or transmit personal data
- Does not access your Todoist account data