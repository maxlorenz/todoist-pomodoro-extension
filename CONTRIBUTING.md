# Contributing to Todoist Pomodoro Extension

Thank you for your interest in contributing to the Todoist Pomodoro Extension! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ 
- Chrome browser (for testing)
- Git
- Basic knowledge of JavaScript, HTML, CSS, and Chrome Extensions

### Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/your-username/todoist-pomodoro-extension.git
   cd todoist-pomodoro-extension
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Load Extension in Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the project directory

4. **Verify Setup**
   ```bash
   npm run validate  # Runs linting and tests
   ```

## 🏗️ Project Structure

```
todoist-pomodoro-extension/
├── src/
│   ├── background/          # Service worker
│   ├── content/            # Content scripts (main logic)
│   └── popup/              # Extension popup
├── tests/                  # Jest test suites
├── assets/                 # Icons and images
├── .github/workflows/      # CI/CD configuration
├── docs/                   # Documentation
└── manifest.json          # Extension manifest
```

## 🧪 Development Workflow

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

## 📝 Coding Standards

### JavaScript Style
- Use ES6+ features (const/let, arrow functions, async/await)
- Follow ESLint configuration (see `.eslintrc.js`)
- Use meaningful variable and function names
- Add JSDoc comments for public methods
- Prefer functional programming patterns where appropriate

### Code Organization
- Keep functions small and focused (single responsibility)
- Use consistent naming conventions
- Group related functionality into classes or modules
- Separate concerns (UI, business logic, storage)

### Example Code Style
```javascript
/**
 * Start a work timer for a specific task
 * @param {string} taskName - Name of the task to work on
 * @returns {boolean} True if timer started successfully
 */
startWorkTimer(taskName) {
  if (!taskName) {
    console.error('Cannot start timer: no task specified');
    return false;
  }

  this.currentTimer = {
    type: 'work',
    taskName,
    duration: this.settings.workDuration * 60 * 1000,
    remaining: this.settings.workDuration * 60 * 1000,
    status: 'running',
    startedAt: Date.now()
  };

  this.startTimerInterval();
  return true;
}
```

### CSS Guidelines
- Use CSS custom properties (variables) for theming
- Follow BEM naming convention for classes
- Ensure compatibility with Todoist's existing styles
- Use relative units (rem, em) where appropriate
- Test in both light and dark modes

## 🧪 Testing Guidelines

### Test Structure
- **Unit Tests**: Test individual functions and methods
- **Integration Tests**: Test component interactions
- **DOM Tests**: Test UI manipulation and event handling

### Writing Tests
```javascript
describe('PomodoroTimer', () => {
  let timer;

  beforeEach(() => {
    timer = new PomodoroTimer();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('should start work timer correctly', () => {
    const result = timer.startWorkTimer('Test Task');
    
    expect(result).toBe(true);
    expect(timer.currentTimer.taskName).toBe('Test Task');
    expect(timer.currentTimer.status).toBe('running');
  });
});
```

### Test Coverage
- Aim for >80% code coverage
- Test both success and error cases
- Mock external dependencies (Chrome APIs, DOM)
- Test edge cases and boundary conditions

## 🐛 Bug Reports

### Before Submitting
1. Check existing issues to avoid duplicates
2. Test with the latest version
3. Reproduce the bug consistently
4. Test in a clean browser profile

### Bug Report Template
```markdown
**Bug Description**
A clear description of what the bug is.

**Steps to Reproduce**
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment**
- Chrome Version: [e.g. 91.0.4472.124]
- Extension Version: [e.g. 1.0.0]
- OS: [e.g. macOS 11.4]
```

## ✨ Feature Requests

### Before Submitting
1. Check if the feature already exists
2. Search existing feature requests
3. Consider if it fits the project scope
4. Think about implementation complexity

### Feature Request Template
```markdown
**Feature Description**
A clear description of the feature you'd like to see.

**Use Case**
Explain why this feature would be useful.

**Proposed Solution**
Describe how you envision this working.

**Alternatives Considered**
Any alternative solutions you've thought about.
```

## 🔄 Pull Request Process

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

### PR Template
```markdown
## Description
Brief description of changes made.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Manual testing completed
- [ ] Extension loads correctly
- [ ] No console errors

## Screenshots
(If applicable)

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Tests added/updated
- [ ] Documentation updated
```

## 🏷️ Commit Message Guidelines

Use conventional commit format:
```
type(scope): description

[optional body]

[optional footer]
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples
```
feat(timer): add pause/resume functionality
fix(ui): resolve timer display issue in dark mode
docs(readme): update installation instructions
test(timer): add tests for timer completion
```

## 🎯 Areas for Contribution

### High Priority
- [ ] Customizable timer durations
- [ ] Advanced statistics and charts
- [ ] Keyboard shortcuts
- [ ] Accessibility improvements
- [ ] Performance optimizations

### Medium Priority
- [ ] Sound customization
- [ ] Export statistics
- [ ] Multiple timer profiles
- [ ] Integration with other task managers

### Documentation
- [ ] API documentation
- [ ] User guides
- [ ] Video tutorials
- [ ] Translation support

## 🤝 Code Review Process

### For Contributors
- Be open to feedback and suggestions
- Respond to review comments promptly
- Make requested changes in separate commits
- Ask questions if feedback is unclear

### For Reviewers
- Be constructive and respectful
- Focus on code quality and maintainability
- Test changes locally when possible
- Provide specific, actionable feedback

## 📚 Resources

### Documentation
- [Chrome Extension Documentation](https://developer.chrome.com/docs/extensions/)
- [Todoist API Documentation](https://developer.todoist.com/)
- [Jest Testing Framework](https://jestjs.io/docs/getting-started)

### Tools
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/)
- [Extension Reloader](https://chrome.google.com/webstore/detail/extensions-reloader/fimgfedafeadlieiabdeeaodndnlbhid)

## 🆘 Getting Help

### Community Support
- Create an issue for bugs or feature requests
- Join discussions in existing issues
- Check the documentation first

### Contact
- GitHub Issues: Primary communication channel
- Email: For security-related issues only

## 📄 License

By contributing to this project, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to the Todoist Pomodoro Extension! 🍅