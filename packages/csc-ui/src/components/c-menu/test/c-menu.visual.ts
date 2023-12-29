import { test, expect } from '@playwright/test';
import { takeScreenshots } from '../../../utils/test/takeScreenshot';

test.beforeEach(async ({ page }, testInfo) => {
  await page.goto('http://localhost:3000/components/c-menu');

  testInfo.snapshotSuffix = '';
});

test('Variants', async ({ page }) => {
  await takeScreenshots(page, 'basic', 'c-menu');
});

test('Basic open', async ({ page }) => {
  const basicButton = page.locator('c-menu').first();

  await page
    .locator('c-menu')
    .filter({ hasText: 'Basic' })
    .locator('button')
    .first()
    .click();

  await expect(basicButton).toHaveScreenshot();
});

test('Flat open', async ({ page }) => {
  const flatButton = page.locator('c-menu').nth(1);

  await page
    .locator('c-menu')
    .filter({ hasText: 'Flat' })
    .locator('button')
    .first()
    .click();

  await expect(flatButton).toHaveScreenshot();
});

test('Small open', async ({ page }) => {
  const smallButton = page.locator('c-menu').nth(2);

  await page
    .locator('c-menu')
    .filter({ hasText: 'Small' })
    .locator('button')
    .first()
    .click();

  await expect(smallButton).toHaveScreenshot();
});

// TO DO: icon-menu doesn't have visual tests as there is no clear indicator when the menu is open
