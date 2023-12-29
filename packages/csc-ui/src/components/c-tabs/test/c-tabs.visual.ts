import { test } from '@playwright/test';
import { takeScreenshots } from '../../../utils/test/takeScreenshot';

test.beforeEach(async ({ page }, testInfo) => {
  await page.goto('http://localhost:3000/components/c-tabs');

  testInfo.snapshotSuffix = '';
});

test('Basic', async ({ page }) => {
  await takeScreenshots(page, 'basic', 'c-tabs');
});

test('Justification Start', async ({ page }) => {
  await takeScreenshots(page, 'justification', 'c-tabs');
});

test('Justification Center', async ({ page }) => {
  await page
    .locator('label')
    .filter({ hasText: 'Center' })
    .locator('span')
    .first()
    .click();

  await takeScreenshots(page, 'justification', 'c-tabs');
});

test('Justification End', async ({ page }) => {
  await page
    .locator('label')
    .filter({ hasText: 'End' })
    .locator('span')
    .first()
    .click();

  await takeScreenshots(page, 'justification', 'c-tabs');
});

test('Justification Stretch', async ({ page }) => {
  await page
    .locator('label')
    .filter({ hasText: 'Stretch' })
    .locator('span')
    .first()
    .click();

  await takeScreenshots(page, 'justification', 'c-tabs');
});

test('No Border', async ({ page }) => {
  await takeScreenshots(page, 'no-border', 'c-tabs');
});

test('Vertical', async ({ page }) => {
  await takeScreenshots(page, 'vertical', 'c-tabs');
});

// TO DO: tests for no-animation?
