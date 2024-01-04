import { test, expect } from '@playwright/test';
import { takeScreenshots } from '../../../utils/test/takeScreenshot';

test.beforeEach(async ({ page }, testInfo) => {
  await page.goto('http://localhost:3000/components/c-text-field');

  testInfo.snapshotSuffix = '';
});

test('Basic', async ({ page }) => {
  await takeScreenshots(page, 'basic', 'c-text-field');

  const textField = page.locator('[data-test="basic"] c-text-field').first();

  await textField.getByLabel('Text field', { exact: true }).fill('Example');

  await page.waitForTimeout(350);

  await takeScreenshots(page, 'basic', 'c-text-field');
});

test('Date', async ({ page }) => {
  await takeScreenshots(page, 'date', 'c-text-field');

  const textField = page.locator('[data-test="date"] c-text-field').first();

  await textField.getByLabel('Date field', { exact: true }).fill('2024-01-01');

  await page.waitForTimeout(350);

  await takeScreenshots(page, 'date', 'c-text-field');
});

test('Password', async ({ page }) => {
  await takeScreenshots(page, 'password', 'c-text-field');

  const textField = page.locator('[data-test="password"] c-text-field').first();

  await textField
    .getByLabel('Password field', { exact: true })
    .fill('Example123');

  await page.waitForTimeout(350);

  await takeScreenshots(page, 'password', 'c-text-field');

  await page
    .locator('[data-test="password"] c-text-field')
    .locator('svg')
    .first()
    .click();

  await takeScreenshots(page, 'password', 'c-text-field');
});

test('Shadow', async ({ page }) => {
  await takeScreenshots(page, 'shadow', 'c-text-field');

  const textField = page.locator('[data-test="shadow"] c-text-field').first();

  await textField.getByTitle('Shadow field').fill('Example');

  await page.waitForTimeout(350);

  await takeScreenshots(page, 'shadow', 'c-text-field');
});

test('Slots', async ({ page }) => {
  await takeScreenshots(page, 'slots', 'c-text-field');

  const textField = page.locator('[data-test="slots"] c-text-field').nth(1);

  await textField.getByLabel('Clearable', { exact: true }).fill('Example');

  await page.waitForTimeout(350);

  await expect(textField).toHaveScreenshot();

  await page
    .locator('[data-test="slots"] c-text-field')
    .locator('c-icon-button')
    .first()
    .click();

  await page.waitForTimeout(350);

  await expect(textField).toHaveScreenshot();
});

test('Status', async ({ page }) => {
  await takeScreenshots(page, 'status', 'c-text-field');

  await page
    .locator('c-switch')
    .filter({ hasText: 'Toggle' })
    .locator('span')
    .first()
    .click();

  await takeScreenshots(page, 'status', 'c-text-field');
});

test('Textarea', async ({ page }) => {
  await takeScreenshots(page, 'textarea', 'c-text-field');

  const textField = page.locator('[data-test="textarea"] c-text-field').first();

  await textField
    .getByLabel('I am a textarea', { exact: true })
    .fill('Example');

  await takeScreenshots(page, 'textarea', 'c-text-field');
});
