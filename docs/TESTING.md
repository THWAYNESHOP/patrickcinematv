# Testing Guide

## Overview
This document covers the testing strategy for NEXASTREAM, including unit tests, E2E tests, and visual regression tests.

## Test Types

### 1. Unit Tests
Located in `src/` alongside the files they test. Use Vitest for fast unit testing.

```bash
# Run all unit tests
npm test

# Run with UI
npm run test:ui

# Run with coverage
npm run test:coverage
```

### 2. E2E Tests
Located in `e2e/` directory. Use Playwright for end-to-end testing.

```bash
# Run all E2E tests
npm run test:e2e

# Run only Chromium tests
npm run test:e2e:chromium
```

### 3. Visual Regression Tests
Located in `e2e/visual.spec.ts`. Use Playwright's visual comparison features.

```bash
# Run visual regression tests
npm run test:visual

# Update visual snapshots (after intentional UI changes)
npm run test:visual:update
```

## Visual Regression Testing

### Purpose
Visual regression tests automatically compare screenshots of your application against baseline images to detect unintended UI changes.

### Test Coverage
The visual test suite covers:
- Home page (full page and hero section)
- Content pages (Movies, TV, Sports, Anime)
- Settings page
- Navigation bar
- Search overlay
- Mobile responsive views
- Content carousel cards
- Error pages

### Running Visual Tests Locally

#### Initial Setup
Run visual tests once to create baseline snapshots:
```bash
npm run test:visual
```

#### After UI Changes
If you make intentional UI changes, update the snapshots:
```bash
npm run test:visual:update
```

#### Regular Testing
Run visual tests to ensure no unintended changes:
```bash
npm run test:visual
```

### CI/CD Integration
Visual tests run automatically in CI but with `continue-on-error: true` to prevent blocking deployments. Results are uploaded as artifacts for review.

### Configuration
Visual tests are configured in `playwright.config.ts`:
- Consistent viewport size (1280x720 for desktop, 375x667 for mobile)
- Allowed pixel differences (tolerance for minor variations)
- Network idle wait for stable rendering

### Best Practices

1. **Review Failed Tests**: Check if failures are intentional or bugs
2. **Update Snapshots Carefully**: Only update after intentional UI changes
3. **Monitor Thresholds**: Adjust `maxDiffPixels` if tests are too flaky
4. **Test Different Viewports**: Ensure responsive design works across sizes
5. **Test Interactive States**: Include screenshots of hover/focus states if needed

### Troubleshooting

#### Tests Failing Due to Dynamic Content
If tests fail due to timestamps, random data, or loading states:
- Mock API responses for consistent data
- Add longer wait times for stable rendering
- Test specific elements instead of full pages

#### Tests Failing Due to Font Rendering
Different systems may render fonts slightly differently:
- Use web fonts consistently
- Consider increasing `maxDiffPixels` tolerance
- Test in the same environment as production

#### Tests Failing Due to Animations
Animations can cause inconsistent screenshots:
- Disable animations for visual tests
- Add animation completion waits
- Test final animation states

## E2E Testing

### Test Structure
E2E tests are organized by feature:
- `home.spec.ts` - Home page functionality
- `user-flows.spec.ts` - Critical user journeys
- `visual.spec.ts` - Visual regression tests

### Running E2E Tests Locally

#### Start Development Server
```bash
npm run dev
```

#### Run Tests
```bash
npm run test:e2e
```

#### Debug Mode
```bash
npx playwright test --debug
```

#### Show UI
```bash
npx playwright test --ui
```

### CI/CD Configuration
E2E tests run in GitHub Actions with:
- Chromium browser (most stable)
- Automatic server startup
- Retry on failure (2 attempts)
- Test result uploads

## Unit Testing

### Test Coverage
Current coverage includes:
- API integration tests
- Hook tests (auth, network status, TV detection)
- Utility tests (API cache, iframe, player layout)
- Page component tests

### Writing Unit Tests

```typescript
import { describe, it, expect } from 'vitest'

describe('FunctionName', () => {
  it('should do something', () => {
    const result = functionName()
    expect(result).toBe(expected)
  })
})
```

### Best Practices
1. Test pure functions independently
2. Mock external dependencies
3. Keep tests fast and focused
4. Use descriptive test names
5. Test edge cases and error conditions

## Continuous Integration

### GitHub Actions Workflows

#### Build Job
- Linting (ESLint)
- Unit tests
- Build verification
- Bundle size checks

#### E2E Job
- E2E test execution
- Test result uploads
- Report generation

#### Visual Job
- Visual regression tests
- Screenshot uploads
- Artifact retention

#### Security Job
- Dependency audit
- Vulnerability scanning

### Artifacts
All test artifacts are retained for 7 days:
- Build artifacts
- Playwright reports
- Visual test results
- Visual screenshots

## Debugging Tests

### Failed Tests
1. Check the test report in `playwright-report/`
2. Review screenshots and videos
3. Check console logs in test output
4. Run tests in debug mode for interactive debugging

### Flaky Tests
If tests are inconsistent:
1. Increase wait times
2. Add retry logic
3. Check for race conditions
4. Improve test isolation

### Performance Issues
If tests are slow:
1. Reduce number of test cases
2. Optimize wait conditions
3. Use selective test runs
4. Parallelize independent tests

## Future Improvements

### Testing Enhancements
- [ ] Add component library (Storybook)
- [ ] Implement contract testing for APIs
- [ ] Add performance regression tests
- [ ] Implement accessibility testing
- [ ] Add load testing

### Coverage Goals
- [ ] Increase unit test coverage to 80%+
- [ ] Add E2E tests for all critical flows
- [ ] Expand visual test coverage
- [ ] Add integration tests for complex features

### Tooling
- [ ] Set up test coverage reporting
- [ ] Add automated test reporting dashboards
- [ ] Implement test result notifications
- [ ] Add test execution analytics