import { test, expect } from '@playwright/test';
import { takeScreenshots } from '../../../utils/test/takeScreenshot';

test.beforeEach(async ({ page }, testInfo) => {
  await page.goto('http://localhost:3000/components/c-pagination');

  testInfo.snapshotSuffix = '';
});

test.only('Basic', async ({ page }) => {
  const pagination = page.locator('div').filter({ hasText: 'Default' }).first();

  await expect(pagination).toHaveScreenshot();

  await page
    .locator('c-pagination')
    .locator('c-icon-button')
    .filter({ hasText: '2' })
    .first()
    .click();

  await expect(pagination).toHaveScreenshot();
});

test('Simple', async ({ page }) => {
  await takeScreenshots(page, 'simple', 'c-pagination');
});
