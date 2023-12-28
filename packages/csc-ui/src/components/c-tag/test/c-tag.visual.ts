import { test } from '@playwright/test';
import { takeScreenshots } from '../../../utils/test/takeScreenshot';

test.beforeEach(async ({ page }, testInfo) => {
  await page.goto('http://localhost:3000/components/c-tags');

  testInfo.snapshotSuffix = '';
});

test('Basic', async ({ page }) => {
  await takeScreenshots(page, 'basic', 'c-tags');
});

test('Block', async ({ page }) => {
  await takeScreenshots(page, 'block', 'c-tags');
});

test('Closeable', async ({ page }) => {
  await takeScreenshots(page, 'closeable', 'c-tags');

  await page
    .locator('c-tag')
    .filter({ hasText: 'Tag Two' })
    .locator('c-icon-button')
    .first()
    .click();

  await takeScreenshots(page, 'closeable', 'c-tags');
});

test('Fit', async ({ page }) => {
  await takeScreenshots(page, 'fit', 'c-tags');
});

test('Flat', async ({ page }) => {
  await takeScreenshots(page, 'flat', 'c-tags');
});
