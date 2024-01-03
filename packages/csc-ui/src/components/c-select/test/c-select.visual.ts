import { test, expect } from '@playwright/test';
import { takeScreenshots } from '../../../utils/test/takeScreenshot';

test.beforeEach(async ({ page }, testInfo) => {
  await page.goto('http://localhost:3000/components/c-select');

  testInfo.snapshotSuffix = '';
});

test('Basic', async ({ page }) => {
  await takeScreenshots(page, 'basic', 'c-select');

  await page.locator('c-select').locator('c-icon-button').first().click();

  const list = page.locator('c-select').locator('dialog').first();

  await expect(list).toHaveScreenshot();

  await page.locator('c-select').locator('ul li').nth(1).click();

  await takeScreenshots(page, 'basic', 'c-select');
});

test('Object items', async ({ page }) => {
  await takeScreenshots(page, 'object-items', 'c-select');
});

test('Option as value', async ({ page }) => {
  await takeScreenshots(page, 'option-as-value', 'c-select');
});
