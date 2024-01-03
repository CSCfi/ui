import { test } from '@playwright/test';
import { takeScreenshots } from '../../../utils/test/takeScreenshot';

test.beforeEach(async ({ page }, testInfo) => {
  await page.goto('http://localhost:3000/components/c-row');

  testInfo.snapshotSuffix = '';
});

test('Default', async ({ page }) => {
  await takeScreenshots(page, 'default', 'c-row');
});

test('Justify align', async ({ page }) => {
  await takeScreenshots(page, 'justify-align', 'c-row');
});
