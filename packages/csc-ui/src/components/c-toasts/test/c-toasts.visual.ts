import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }, testInfo) => {
  await page.goto('http://localhost:3000/components/c-toasts');

  testInfo.snapshotSuffix = '';
});

test('Basic', async ({ page }) => {
  const addButton = page
    .locator('c-card')
    .locator('c-button')
    .filter({ hasText: 'Add toast' })
    .first();

  addButton.click();

  const toast = page.locator('c-toast').first();

  await expect(toast).toHaveScreenshot();

  await page
    .locator('c-card')
    .locator('c-input')
    .getByLabel('Message')
    .fill('Example');

  await page
    .locator('c-card')
    .locator('c-input')
    .getByLabel('Title')
    .fill('Title');

  await page
    .locator('c-card')
    .locator('c-input')
    .getByLabel('Close text')
    .fill('Close here');

  addButton.click();

  await expect(toast).toHaveScreenshot();

  const list = page.locator('c-card').locator('c-input').nth(4);

  await list.click();

  const dialog = page.locator('c-select').locator('dialog').first();

  await dialog
    .locator('ul')
    .locator('li')
    .filter({ hasText: 'Success' })
    .locator('span')
    .first()
    .click();

  await page.waitForTimeout(6000);

  addButton.click();

  await expect(toast).toHaveScreenshot();

  await list.click();

  await dialog
    .locator('ul')
    .locator('li')
    .filter({ hasText: 'Warning' })
    .locator('span')
    .first()
    .click();

  await page.waitForTimeout(6000);

  addButton.click();

  await expect(toast).toHaveScreenshot();

  await list.click();

  await dialog
    .locator('ul')
    .locator('li')
    .filter({ hasText: 'Error' })
    .locator('span')
    .first()
    .click();

  await page.waitForTimeout(6000);

  addButton.click();

  await expect(toast).toHaveScreenshot();
});
