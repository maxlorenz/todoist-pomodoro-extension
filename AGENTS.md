# Agent Guidelines for Todoist Pomodoro Extension

## Build/Test Commands
- **Test**: `npm test` (requires Jest: `npm install jest --save-dev`)
- **Lint**: `npm run lint` (requires ESLint: `npm install eslint --save-dev`)
- **Build**: `npm run build` (extension ready for Chrome loading)
- **Dev**: Load extension from `chrome://extensions/` in developer mode
- **Single test**: `npm test -- --testNamePattern="test name"` (after Jest setup)

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