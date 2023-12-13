import { test, expect } from '@playwright/test';

test.beforeEach(async ({}, testInfo) => {
  testInfo.snapshotSuffix = '';
});

test('Default', async ({ page }) => {
  await page.goto('http://localhost:3000/components/c-accordion');

  const accordion = page.locator('[data-test="basic"] c-accordion').first();

  // Expect initial visual appearance
  await expect(accordion).toHaveScreenshot();

  const firstItem = accordion.locator('c-accordion-item summary').first();

  await firstItem.click();

  // Expect first accordion item to be closed on click
  await expect(accordion).toHaveScreenshot();

  const secondItem = accordion.locator('c-accordion-item summary').nth(1);

  await secondItem.click();

  // Expect second accordion item to be open on click
  await expect(accordion).toHaveScreenshot();
});

test('Mandatory selection', async ({ page }) => {
  await page.goto('http://localhost:3000/components/c-accordion');

  const accordion = page.locator('[data-test="mandatory"] c-accordion').first();

  // Expect initial visual appearance
  await expect(accordion).toHaveScreenshot();

  const firstItem = accordion.locator('c-accordion-item summary').first();
  await firstItem.click();

  // Expect first accordion item to remain open
  await expect(accordion).toHaveScreenshot();

  const secondItem = accordion.locator('c-accordion-item summary').nth(1);
  await secondItem.click();

  // Expect second accordion item to be open on click
  await expect(accordion).toHaveScreenshot();
});

test('Multiple selection', async ({ page }) => {
  await page.goto('http://localhost:3000/components/c-accordion');

  const accordion = page.locator('[data-test="multiple"] c-accordion').first();

  // Expect initial visual appearance
  await expect(accordion).toHaveScreenshot();

  const secondItem = accordion.locator('c-accordion-item summary').nth(1);
  await secondItem.click();

  // Expect all accordion items to be open
  await expect(accordion).toHaveScreenshot();

  await accordion.locator('c-accordion-item summary').nth(0).click();
  await accordion.locator('c-accordion-item summary').nth(1).click();
  await accordion.locator('c-accordion-item summary').nth(2).click();

  // Expect all accordion item to be closed on click
  await expect(accordion).toHaveScreenshot();
});

test('Outlined', async ({ page }) => {
  await page.goto('http://localhost:3000/components/c-accordion');

  const accordion = page.locator('[data-test="outlined"] c-accordion').first();

  // Expect initial visual appearance
  await expect(accordion).toHaveScreenshot();
});
