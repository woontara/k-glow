import { test as setup, expect } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '../playwright/.auth/user.json');

setup('authenticate', async ({ page }) => {
  // Go to the signin page
  await page.goto('/auth/signin');

  // Fill in credentials - using a test user
  // Note: You need to have a test user created in your database
  await page.locator('input[type="email"]').fill('test@kglow.com');
  await page.locator('input[type="password"]').fill('Test123456!');

  // Click the sign in button
  await page.getByRole('button', { name: /로그인|sign in/i }).click();

  // Wait until the page receives the cookies
  // Alternatively, you can wait for a specific element that appears after login
  await page.waitForURL('/');

  // End of authentication steps
  await page.context().storageState({ path: authFile });
});
