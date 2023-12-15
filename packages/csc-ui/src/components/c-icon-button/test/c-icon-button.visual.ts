import { test } from '@playwright/test';
import { takeScreenshots } from '../../../utils/test/takeScreenshot';

test.beforeEach(async ({ page }, testInfo) => {
  await page.goto('http://localhost:3000/components/c-icon-button');

  testInfo.snapshotSuffix = '';
});

test('Variants', async ({ page }) => {
  await takeScreenshots(page, 'variants', 'c-icon-button');
});

test('Disabled', async ({ page }) => {
  await takeScreenshots(page, 'disabled', 'c-icon-button');
});

test('Sizes', async ({ page }) => {
  await takeScreenshots(page, 'sizes', 'c-icon-button');
});

test('Badges', async ({ page }) => {
  await takeScreenshots(page, 'badges', 'c-icon-button');
});

test('Inverted', async ({ page }) => {
  await takeScreenshots(page, 'inverted', 'c-icon-button');
});
