import { test } from '@playwright/test';
import { takeScreenshots } from '../../../utils/test/takeScreenshot';

test.beforeEach(async ({ page }, testInfo) => {
  await page.goto('http://localhost:3000/components/c-link');

  testInfo.snapshotSuffix = '';
});

test('Variants', async ({ page }) => {
  await takeScreenshots(page, 'variants', 'c-link');
});

test('Basic', async ({ page }) => {
  await takeScreenshots(page, 'basic', 'c-link');
});

test('Index', async ({ page }) => {
  await takeScreenshots(page, 'index', 'c-link');
});
