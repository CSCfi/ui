import { test } from '@playwright/test';
import { takeScreenshots } from '../../../utils/test/takeScreenshot';

test.beforeEach(async ({ page }, testInfo) => {
  await page.goto('http://localhost:3000/components/c-toasts');

  testInfo.snapshotSuffix = '';
});

test('Basic', async ({ page }) => {
  const toastsWrapper = page.locator('app-example[name="basic"] div').nth(1);

  await toastsWrapper.getByRole('button', { name: 'Add toast' }).click();

  await takeScreenshots(page, 'basic', 'c-toasts');
});

// test('Default', async ({ page }) => {

//   await toasts.locator('c-icon-button').click();

//   await toastsWrapper.locator('.c-input-menu__input').first().click();

//   await toastsWrapper.getByRole('option', { name: 'Success' }).click();

//   await toastsWrapper.getByRole('button', { name: 'Add toast' }).click();

//   await expect(toasts).toHaveScreenshot();

//   await toasts.locator('c-icon-button').click();

//   await toastsWrapper.locator('.c-input-menu__input').first().click();

//   await toastsWrapper.getByRole('option', { name: 'Warning' }).click();

//   await toastsWrapper.getByRole('button', { name: 'Add toast' }).click();

//   await expect(toasts).toHaveScreenshot();

//   await toasts.locator('c-icon-button').click();

//   await toastsWrapper.locator('.c-input-menu__input').first().click();

//   await toastsWrapper.getByRole('option', { name: 'Error' }).click();

//   await toastsWrapper.getByRole('button', { name: 'Add toast' }).click();

//   await expect(toasts).toHaveScreenshot();
// });
