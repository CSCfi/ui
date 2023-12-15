import { test } from '@playwright/test';
import { takeScreenshots } from '../../../utils/test/takeScreenshot';

test.beforeEach(async ({ page }, testInfo) => {
  await page.goto('http://localhost:3000/components/c-button');

  testInfo.snapshotSuffix = '';
});

test('Variants', async ({ page }) => {
  await takeScreenshots(page, 'variants', 'c-button');
});

test('Disabled', async ({ page }) => {
  await takeScreenshots(page, 'disabled', 'c-button');
});

test('Icon', async ({ page }) => {
  await takeScreenshots(page, 'icon', 'c-button');
});
