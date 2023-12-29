import { test } from '@playwright/test';
import { takeScreenshots } from '../../../utils/test/takeScreenshot';

test.beforeEach(async ({ page }, testInfo) => {
  await page.goto('http://localhost:3000/components/c-tab-buttons');

  testInfo.snapshotSuffix = '';
});

test('Basic', async ({ page }) => {
  await takeScreenshots(page, 'basic', 'c-tab-buttons');

  await page.locator('c-tab-buttons').locator('button').first().click();

  await takeScreenshots(page, 'basic', 'c-tab-buttons');
});

test('Disabled', async ({ page }) => {
  await takeScreenshots(page, 'disabled', 'c-tab-buttons');
});

test('Mandatory', async ({ page }) => {
  await takeScreenshots(page, 'mandatory', 'c-tab-buttons');
});

test('Tabs', async ({ page }) => {
  await takeScreenshots(page, 'tabs', 'c-tab-buttons');
});
