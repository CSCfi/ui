import { test } from '@playwright/test';
import { takeScreenshots } from '../../../utils/test/takeScreenshot';

test.beforeEach(async ({ page }, testInfo) => {
  await page.goto('http://localhost:3000/components/c-data-table');

  testInfo.snapshotSuffix = '';
});

test('Basic', async ({ page }) => {
  await takeScreenshots(page, 'basic', 'c-data-table');
});

test('Complex, button press', async ({ page }) => {
  await takeScreenshots(page, 'complex', 'c-data-table');

  await page.locator('td').locator('c-checkbox').first().click();

  await takeScreenshots(page, 'complex', 'c-data-table');
});

test('Complex, selection', async ({ page }) => {
  await page
    .locator('tr')
    .filter({ hasText: 'Elvera' })
    .locator('td')
    .nth(1)
    .click();

  await takeScreenshots(page, 'complex', 'c-data-table');
});
