import { test, expect } from '@playwright/test';
import { takeScreenshots } from '../../../utils/test/takeScreenshot';

test.beforeEach(async ({ page }, testInfo) => {
  await page.goto('http://localhost:3000/components/c-autocomplete');

  testInfo.snapshotSuffix = '';
});

test('Basic', async ({ page }) => {
  await takeScreenshots(page, 'basic', 'c-autocomplete');

  await page.locator('c-autocomplete').first().click();

  const list = page.locator('c-autocomplete').locator('dialog').first();

  await expect(list).toHaveScreenshot();

  const input = page.locator('c-autocomplete').locator('input').first();

  await input.fill('fi');

  await page.waitForTimeout(350);

  await expect(list).toHaveScreenshot();

  await page.locator('c-autocomplete').locator('ul li').nth(1).click();

  await expect(input).toHaveScreenshot();
});

test('Options', async ({ page }) => {
  await takeScreenshots(page, 'options', 'c-autocomplete');
});

test('Return value', async ({ page }) => {
  await takeScreenshots(page, 'return-value', 'c-autocomplete');
});
