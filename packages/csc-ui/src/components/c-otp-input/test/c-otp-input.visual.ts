import { test } from '@playwright/test';
import { takeScreenshots } from '../../../utils/test/takeScreenshot';

test.beforeEach(async ({ page }, testInfo) => {
  await page.goto('http://localhost:3000/components/c-otp-input');

  testInfo.snapshotSuffix = '';
});

test('Automatic', async ({ page }) => {
  await takeScreenshots(page, 'automatic', 'c-otp-input');

  const inputField = page.locator('c-otp-input').locator('input').first();

  await inputField.fill('1');

  await page.waitForTimeout(350);

  const inputField2 = page.locator('c-otp-input').locator('input').nth(1);

  await inputField2.fill('2');

  await page.waitForTimeout(350);

  const inputField3 = page.locator('c-otp-input').locator('input').nth(2);

  await inputField3.fill('3');

  await page.waitForTimeout(350);

  await takeScreenshots(page, 'automatic', 'c-otp-input');
});

test('Manual', async ({ page }) => {
  await takeScreenshots(page, 'manual', 'c-otp-input');

  const inputField = page
    .locator('[data-test="manual"] c-otp-input')
    .locator('input')
    .first();

  await inputField.fill('1');

  await page.waitForTimeout(350);

  const inputField2 = page
    .locator('[data-test="manual"] c-otp-input')
    .locator('input')
    .nth(1);

  await inputField2.fill('2');

  await page.waitForTimeout(350);

  await takeScreenshots(page, 'manual', 'c-otp-input');
});
