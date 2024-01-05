import { test } from '@playwright/test';
import { takeScreenshots } from '../../../utils/test/takeScreenshot';

test.beforeEach(async ({ page }, testInfo) => {
  await page.goto('http://localhost:3000/components/c-login-card');

  testInfo.snapshotSuffix = '';
});

test('Basic', async ({ page }) => {
  await takeScreenshots(page, 'basic', 'c-login-card');

  const textField = page.locator('c-login-card').locator('input').first();

  await textField.fill('Example');

  await page.waitForTimeout(350);

  const passwordField = page.locator('c-login-card').locator('input').nth(1);

  await passwordField.fill('Example');

  await page.waitForTimeout(350);

  await takeScreenshots(page, 'basic', 'c-login-card');
});

test('Colored', async ({ page }) => {
  await takeScreenshots(page, 'colored', 'c-login-card');
});
