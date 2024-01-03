import { test } from '@playwright/test';
import { takeScreenshots } from '../../../utils/test/takeScreenshot';

test.beforeEach(async ({ page }, testInfo) => {
  await page.goto('http://localhost:3000/components/c-main');

  testInfo.snapshotSuffix = '';
});

test('Layout', async ({ page }) => {
  await takeScreenshots(page, 'layout', 'c-main');
});
