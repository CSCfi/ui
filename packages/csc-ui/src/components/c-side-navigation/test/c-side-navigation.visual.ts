import { test, expect } from '@playwright/test';
import { takeScreenshots } from '../../../utils/test/takeScreenshot';

test.beforeEach(async ({ page }, testInfo) => {
  await page.goto('http://localhost:3000/components/c-side-navigation');

  testInfo.snapshotSuffix = '';
});

test('Basic', async ({ page }) => {
  await takeScreenshots(page, 'basic', 'c-side-navigation');

  const sideNav = page.locator('[data-test="basic"] c-side-navigation').first();

  await sideNav.locator('c-side-navigation-item').nth(2).click();

  await expect(sideNav).toHaveScreenshot();

  await sideNav
    .locator('c-side-navigation-item')
    .locator('c-side-navigation-item')
    .first()
    .click();

  await expect(sideNav).toHaveScreenshot();
});
