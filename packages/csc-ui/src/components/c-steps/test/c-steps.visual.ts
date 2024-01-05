import { test } from '@playwright/test';
import { takeScreenshots } from '../../../utils/test/takeScreenshot';

test.beforeEach(async ({ page }, testInfo) => {
  await page.goto('http://localhost:3000/components/c-steps');

  testInfo.snapshotSuffix = '';
});

test('Basic', async ({ page }) => {
  await takeScreenshots(page, 'basic', 'c-steps');

  await page.locator('c-icon-button').nth(1).click();

  await takeScreenshots(page, 'basic', 'c-steps');
});

test('Mobile', async ({ page }) => {
  await takeScreenshots(page, 'mobile', 'c-steps');
});
