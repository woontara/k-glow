# Authentication Required Tests

## Overview

Several tests have been marked with `test.fixme()` because they require authentication to access protected routes. These tests are currently skipped during test execution.

## Protected Routes

The following routes require authentication (as defined in `src/middleware.ts`):
- `/analyze` - Brand analysis page
- `/calculator` - Quote calculator page
- `/certification` - Certification application page
- `/admin` - Admin dashboard

## Disabled Tests

### Group 1 - Independent UI Tests (tests/group1-independent-ui.spec.ts)
- **Test 2.3**: CTA 버튼 - Navigates to `/analyze`
- **Test 5.1**: 견적 계산기 페이지 로드 - Tests `/calculator`
- **Test 5.7**: 필수 항목 검증 - Tests `/calculator`
- **Test 6.1**: 브랜드 분석 페이지 로드 - Tests `/analyze`
- **Test 6.2**: 브랜드 분석 URL 미입력 검증 - Tests `/analyze`
- **Test 6.3**: 크롤링 깊이 조정 - Tests `/analyze`

### Group 9 - Security & Performance Tests (tests/group9-security-performance.spec.ts)
- **Test 11.1**: XSS 방지 - Tests `/analyze`
- **Test 11.3**: 파일 크기 제한 - Tests `/certification/new`
- **Test 11.4**: 중복 제출 방지 - Tests `/calculator`
- **Test 10.5**: 네트워크 오류 복구 - Tests `/calculator`

## How to Enable Authentication for Tests

To enable these tests, you need to set up authentication in your Playwright tests:

### Step 1: Create a Test User

First, create a test user in your database. You can use Prisma Studio or run a seed script:

```typescript
// prisma/seed-test-user.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('Test123456!', 10);

  await prisma.user.upsert({
    where: { email: 'test@kglow.com' },
    update: {},
    create: {
      email: 'test@kglow.com',
      name: 'Test User',
      password: hashedPassword,
      role: 'BRAND',
      emailVerified: new Date(),
    },
  });

  console.log('Test user created successfully');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Run with: `npx tsx prisma/seed-test-user.ts`

### Step 2: Update Authentication Setup

The authentication setup file has already been created at `tests/auth.setup.ts`. Update it with your test credentials if needed.

### Step 3: Configure Playwright Projects

Update `playwright.config.ts` to include authentication setup and use storage state:

```typescript
import { defineConfig, devices } from '@playwright/test';
import path from 'path';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: {
    baseURL: 'http://localhost:3003',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    // Setup project to authenticate
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/
    },

    // Authenticated tests
    {
      name: 'chromium-authenticated',
      use: {
        ...devices['Desktop Chrome'],
        storageState: path.join(__dirname, 'playwright/.auth/user.json'),
      },
      dependencies: ['setup'],
      testMatch: /.*-authenticated\.spec\.ts/,
    },

    // Public tests (no authentication required)
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: /.*-authenticated\.spec\.ts/,
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      testIgnore: /.*-authenticated\.spec\.ts/,
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      testIgnore: /.*-authenticated\.spec\.ts/,
    },
  ],
});
```

### Step 4: Create Authenticated Test Files

Move the disabled tests to new authenticated test files:

1. Create `tests/group1-authenticated.spec.ts`
2. Create `tests/group9-authenticated.spec.ts`
3. Copy the fixme tests from the original files
4. Remove the `test.fixme()` and change to `test()`

Example:

```typescript
// tests/group1-authenticated.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Group 1 - Authenticated Tests', () => {

  test('6.1 브랜드 분석 페이지 로드', async ({ page }) => {
    await page.goto('/analyze');

    await expect(page.locator('h1:has-text("브랜드 웹사이트 분석")')).toBeVisible();
    await expect(page.getByText('웹 크롤링')).toBeVisible();
    await expect(page.locator('input[type="url"]')).toBeVisible();
  });

  // ... other authenticated tests
});
```

### Step 5: Run Tests

Run all tests including authenticated ones:

```bash
npx playwright test
```

Run only public tests (current default):

```bash
npx playwright test --project=chromium
```

Run only authenticated tests:

```bash
npx playwright test --project=chromium-authenticated
```

## Environment Variables

You may want to use environment variables for test credentials:

```bash
# .env.test
TEST_USER_EMAIL=test@kglow.com
TEST_USER_PASSWORD=Test123456!
```

Update `tests/auth.setup.ts`:

```typescript
import { test as setup } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '../playwright/.auth/user.json');

setup('authenticate', async ({ page }) => {
  await page.goto('/auth/signin');

  await page.locator('input[type="email"]').fill(process.env.TEST_USER_EMAIL || 'test@kglow.com');
  await page.locator('input[type="password"]').fill(process.env.TEST_USER_PASSWORD || 'Test123456!');

  await page.getByRole('button', { name: /로그인|sign in/i }).click();
  await page.waitForURL('/');

  await page.context().storageState({ path: authFile });
});
```

## Current Status

All authentication-required tests are currently marked with `test.fixme()` and will be skipped. They have comments indicating:
```
// This test requires authentication as /[route] is a protected route
// Should be moved to authenticated test suite
```

To enable them, follow the steps above.
