import { test, expect } from '@playwright/test';

test.beforeEach(async ({}, testInfo) => {
  testInfo.snapshotSuffix = '';
});

test('Default', async ({ page }) => {
  await page.goto('http://localhost:3000/components/c-alert');

  const alert = page.locator('[data-test="basic"] c-alert').first();

  await page
    .locator('label')
    .filter({ hasText: 'Default' })
    .locator('span')
    .first()
    .click();

  await expect(alert).toHaveScreenshot();
});

test('Info', async ({ page }) => {
  await page.goto('http://localhost:3000/components/c-alert');

  const alert = page.locator('[data-test="basic"] c-alert').first();

  // Info variant
  await page
    .locator('label')
    .filter({ hasText: 'Info' })
    .locator('span')
    .first()
    .click();

  await expect(alert).toHaveScreenshot();
});

test('Success', async ({ page }) => {
  await page.goto('http://localhost:3000/components/c-alert');

  const alert = page.locator('[data-test="basic"] c-alert').first();

  // Success variant
  await page
    .locator('label')
    .filter({ hasText: 'Success' })
    .locator('span')
    .first()
    .click();

  await expect(alert).toHaveScreenshot();
});

test('Warning', async ({ page }) => {
  await page.goto('http://localhost:3000/components/c-alert');

  const alert = page.locator('[data-test="basic"] c-alert').first();

  // Warning variant
  await page
    .locator('label')
    .filter({ hasText: 'Warning' })
    .locator('span')
    .first()
    .click();

  await expect(alert).toHaveScreenshot();
});

test('Error', async ({ page }) => {
  await page.goto('http://localhost:3000/components/c-alert');

  const alert = page.locator('[data-test="basic"] c-alert').first();

  // Error variant
  await page
    .locator('label')
    .filter({ hasText: 'Error' })
    .locator('span')
    .first()
    .click();

  await expect(alert).toHaveScreenshot();
});
