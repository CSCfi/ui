import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }, testInfo) => {
  await page.goto('http://localhost:3000/components/c-progress-bar');

  testInfo.snapshotSuffix = '';
});

test('Basic', async ({ page }) => {
  const bar = page.locator('[data-test="basic"] c-progress-bar').first();

  await expect(bar).toHaveScreenshot();
});
