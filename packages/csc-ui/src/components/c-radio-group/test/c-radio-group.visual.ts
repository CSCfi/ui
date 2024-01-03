import { test } from '@playwright/test';
import { takeScreenshots } from '../../../utils/test/takeScreenshot';

test.beforeEach(async ({ page }, testInfo) => {
  await page.goto('http://localhost:3000/components/c-radio-group');

  testInfo.snapshotSuffix = '';
});

test('Basic', async ({ page }) => {
  await takeScreenshots(page, 'basic', 'c-radio-group');
});

test('Inline', async ({ page }) => {
  await takeScreenshots(page, 'inline', 'c-radio-group');
});

test.only('States', async ({ page }) => {
  await takeScreenshots(page, 'states', 'c-radio-group');

  await page
    .locator('c-switch')
    .filter({ hasText: 'Toggle' })
    .locator('span')
    .first()
    .click();

  await takeScreenshots(page, 'states', 'c-radio-group');
});

test('Radio buttons', async ({ page }) => {
  await takeScreenshots(page, 'radio-buttons', 'c-radio-group');
});
