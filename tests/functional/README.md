# Functional Tests

This repository contains end-to-end functional tests for the YC application using Playwright.

## Overview

The functional test suite is designed to verify the core functionality of the YC application after deployment. It includes:

- **Authentication Testing**: Login/logout functionality
- **Navigation Testing**: Sidebar navigation and page routing
- **Role-Based Access Control**: Testing all user roles and permissions
- **Cross-browser Testing**: Chrome, Firefox, and Edge support
- **Visual Debugging**: Screenshots and videos on failures

## 🆕 Role-Based Testing

**NEW**: Comprehensive role-based access control testing has been added! 

- **Multiple User Roles**: Admin, Manager, Member, User
- **Access Control Validation**: Ensures users can only access authorized routes
- **Role-Specific Access**: Tests access permissions for each role
- **Automated Test Runner**: Easy-to-use scripts for running role-specific tests

### Quick Start for Role Testing
```bash
# Setup environment
node tests/functional/setup-test-env.js

# Run all role tests
npm run test:functional:roles

# Run specific role
npx playwright test role-based-tests.spec.js

# Switch environment by setting ENV
# in PowerShell:
$env:ENV="production"; npx playwright test
# in bash/sh:
ENV=production npx playwright test

ENV=production npx playwright test all-roles-tests.spec.js --project="Google Chrome" --headed --workers=1
ENV=production npx playwright test all-roles-tests.spec.js -g "Admin on Desktop"
```

## Architecture

### Page Object Model (POM)
Tests use the Page Object Model pattern for maintainable and reusable code:

```
tests/functional/
├── pages/
│   ├── BasePage.js          # Common page functionality
│   ├── LoginPage.js         # Login/authentication methods
│   ├── SidebarPage.js       # Navigation and sidebar methods
│   └── LogoutPage.js        # Logout functionality
├── config/
│   └── test-config.js       # Test configuration settings
├── basic-functional-test.spec.js  # Main test suite
├── role-based-tests.spec.js       # Role-based access control tests
└── setup-test-env.js        # Environment setup script
```

### Base Page Class
All page objects extend `BasePage.js` which provides:
- Common element interaction methods
- Screenshot functionality
- Navigation helpers
- Timeout management

## Dependencies

### Required Packages (from package.json)
- `@playwright/test: ^1.54.1` - Testing framework
- `dotenv: ^16.5.0` - Environment variable management

### Test Scripts Available
- `test:functional` - Run all functional tests
- `test:functional:headed` - Run tests with visible browser
- `test:functional:debug` - Run tests in debug mode
- `test:functional:ui` - Run tests with Playwright UI
- `test:functional:report` - Show test report
- `test:functional:chromium` - Run tests only on Chromium
- `test:functional:roles` - Run role-based access control tests

## Setup

### 1. Environment Configuration
Create a `.env` file in the project root with your test credentials:

```bash
# Run the setup script to create template
node tests/functional/setup-test-env.js
```

Or manually create `.env`

### 2. Install Dependencies
```bash
npm install
npx playwright install
```

### 3. Create Test Results Directory
```bash
mkdir -p test-results/screenshots
```

## Running Tests

### Basic Test Execution
```bash
# Run all functional tests
npm run test:functional

# Run with visible browser (for debugging)
npm run test:functional:headed

# Run in debug mode (step through tests)
npm run test:functional:debug

# Run with Playwright UI
npm run test:functional:ui
```

### Role-Based Testing
```bash
# Run role-based tests (all roles)
npm run test:functional:roles

# Run with visible browser
npm run test:functional:headed

# Run in debug mode
npm run test:functional:debug

# Run and show report
npm run test:functional:report
```

### Legacy Commands
```bash
# Original functional tests
npm run test:functional

# Manager functionality tests
npx playwright test manager-functionality.spec.js

# Basic functional tests
npx playwright test basic-functional-test.spec.js
```

### Direct Playwright Commands
```bash
# Run role-based tests directly
npx playwright test role-based-tests.spec.js

# Run with specific browser
npx playwright test role-based-tests.spec.js --project=chromium

# Run with headed mode
npx playwright test role-based-tests.spec.js --headed

# Run in debug mode
npx playwright test role-based-tests.spec.js --debug
```

### Browser-Specific Testing
```bash
# Run on specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project="Microsoft Edge"
```

### Viewing Results
```bash
# Show HTML report
npm run test:functional:report

# Results are also saved as:
# - test-results/results.json
# - test-results/junit.xml
```

## Test Configuration

### Playwright Configuration (playwright.config.js)
- **Base URL**: configurable via env
- **Browsers**: Chrome, Firefox, Edge
- **Viewport**: 1280x720 (optimized for sidebar visibility)
- **Retries**: 2 retries in CI, 0 locally
- **Timeouts**: 15 seconds for actions and assertions
- **Screenshots**: On failure only
- **Videos**: Retained on failure
- **Traces**: On first retry

### Test Timeouts (test-config.js)
- **Navigation**: 30 seconds
- **Element**: 10 seconds  
- **Assertion**: 5 seconds

## Test Scenarios

### Complete Functional Verification Workflow
1. **Authentication**: Login with email/password
2. **Navigation**: Test all sidebar menu items
3. **Logout**: Verify proper session termination

### Role-Based Access Control Tests
1. **Authentication**: Login with role-specific credentials
2. **Default Route Redirect**: Verify user is redirected to correct default route
3. **Sidebar Navigation**: Test sidebar visibility and navigation (where applicable)
4. **Basic Functionality**: Test that the default route loads successfully
5. **Unauthorized Access**: Test that users can't access unauthorized routes
6. **Logout**: Verify logout functionality

### Individual Component Verification
- Sidebar functionality testing
- Basic navigation verification
- Page loading validation

## Test Coverage

### What Each Test Validates

1. **Authentication**
   - Login with role-specific credentials
   - Proper redirect to default route
   - Logout functionality

2. **Route Access**
   - Access to authorized routes
   - Prevention of unauthorized route access
   - Proper redirects for unauthorized attempts

3. **UI Elements**
   - Sidebar visibility (where applicable)
   - Navigation menu items
   - Basic page loading verification

4. **Functionality**
   - Basic page access and loading
   - Navigation between authorized routes
   - Same core functionality as basic-functional-test.spec.js

## Data Test IDs

The tests use `data-testid` attributes to locate elements. Key test IDs include:

### Navigation
- `nav-dashboard`, `nav-members`, `nav-caller`, etc.

### UI Elements
- `avatar-button` - User avatar dropdown
- `logout-button` - Logout button
- `sidebar` - Main sidebar container

## Debugging

### Screenshots
Failed tests automatically capture screenshots to:
```
test-results/failure-{testname}-{timestamp}.png
```

### Debug Mode
```bash
npm run test:functional:debug
```
This opens Playwright Inspector for step-by-step debugging.

### Headed Mode
```bash
npm run test:functional:headed
```
Run tests with visible browser for visual debugging.

### Test Reports
```bash
npm run test:functional:report
```
Generate and display HTML test reports.

## Browser Support

### Supported Browsers
- **Chromium** (Desktop Chrome)
- **Firefox** (Desktop Firefox)
- **Microsoft Edge**
- **Google Chrome** (with Chrome channel)

### Viewport Configuration
All browsers run with 1280x720 viewport to ensure:
- Sidebar visibility
- Consistent UI behavior
- Reliable element detection

## Troubleshooting

### Common Issues

**Login Failures**
- Verify all password credentials in `.env`
- Check if test user accounts exist and are active
- Ensure `BASE_URL` is correct

**Sidebar Not Found**
- Tests use multiple fallback strategies for sidebar detection
- Check if user has proper permissions for navigation
- Verify viewport size (sidebar may be hidden on mobile view)

**Navigation Failures** 
- Tests try multiple strategies to find menu items
- Check console logs for detailed failure information
- Use debug mode to step through navigation

**Role Access Issues**
- Verify role assignments in Firebase Auth
- Check route permissions in `routes.jsx`
- Ensure `data-testid` attributes are present

**Screenshots**
- Debug screenshots saved in `test-results/screenshots/`
- Check timestamps to match with specific test runs
- Full page screenshots provide complete context

### Debug Commands
```bash
# Run single test with debug
npx playwright test basic-functional-test.spec.js --debug

# Run with trace viewer
npx playwright test --trace on

# Show trace
npx playwright show-trace trace.zip
```

## Best Practices

### Writing New Tests
1. Extend existing page objects when possible
2. Use descriptive test names and console logging
3. Include proper error handling and timeouts
4. Take screenshots for debugging complex failures

### Maintaining Tests
1. Update selectors when UI changes
2. Keep page objects DRY (Don't Repeat Yourself)
3. Use environment variables for configuration
4. Regular test execution to catch regressions

### Writing New Role Tests
1. Use existing page objects when possible
2. Add appropriate `data-testid` attributes to new components
3. Test both positive (authorized) and negative (unauthorized) scenarios
4. Include proper error handling and timeouts

### Maintaining Role Tests
1. Update selectors when UI changes
2. Keep role permissions in sync with `routes.jsx`
3. Regular test execution to catch regressions
4. Update this documentation when adding new roles or routes

## Contributing

When adding new functional tests:
1. Follow the existing page object pattern
2. Add appropriate error handling and logging
3. Update this README if adding new test types
4. Ensure tests work across all supported browsers
5. Add proper timeout configurations for new scenarios

When adding new role-based tests:
1. Follow the existing test structure
2. Add appropriate role permissions to `test-config.js`
3. Update route expectations in `roleRoutes`
4. Add new `data-testid` attributes as needed
5. Update this documentation
6. Ensure tests work across all supported browsers 