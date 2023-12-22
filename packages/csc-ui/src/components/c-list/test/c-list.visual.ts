import { test } from '@playwright/test';
import { takeScreenshots } from '../../../utils/test/takeScreenshot';

test.beforeEach(async ({ page }, testInfo) => {
  await page.goto('http://localhost:3000/components/c-list');

  testInfo.snapshotSuffix = '';
});

test('Basic', async ({ page }) => {
  await takeScreenshots(page, 'basic', 'c-list');
});

test('Actions', async ({ page }) => {
  await takeScreenshots(page, 'actions', 'c-list');
});

test('Active', async ({ page }) => {
  await takeScreenshots(page, 'active', 'c-list');
});

test('Disabled', async ({ page }) => {
  await takeScreenshots(page, 'disabled', 'c-list');
});

test('Disabled Items', async ({ page }) => {
  await takeScreenshots(page, 'disabled-items', 'c-list');
});

test('Slots', async ({ page }) => {
  await takeScreenshots(page, 'slots', 'c-list');
});

test('Titles', async ({ page }) => {
  await takeScreenshots(page, 'titles', 'c-list');
});
