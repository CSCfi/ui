import { test } from '@playwright/test';
import { takeScreenshots } from '../../../utils/test/takeScreenshot';

test.beforeEach(async ({ page }, testInfo) => {
  await page.goto('http://localhost:3000/components/c-slider');

  testInfo.snapshotSuffix = '';
});

test('Basic', async ({ page }) => {
  await page.locator('c-slider').first().click();

  await takeScreenshots(page, 'basic', 'c-slider');

  await page
    .locator('label')
    .filter({ hasText: '2' })
    .locator('span')
    .first()
    .click();

  await takeScreenshots(page, 'basic', 'c-slider');

  await page
    .locator('label')
    .filter({ hasText: '4' })
    .locator('span')
    .first()
    .click();

  await takeScreenshots(page, 'basic', 'c-slider');

  await page
    .locator('label')
    .filter({ hasText: '5 (every 20%)' })
    .locator('span')
    .first()
    .click();

  await takeScreenshots(page, 'basic', 'c-slider');

  await page
    .locator('c-switch')
    .filter({ hasText: 'Ticks' })
    .locator('span')
    .first()
    .click();

  await takeScreenshots(page, 'basic', 'c-slider');

  await page
    .locator('c-switch')
    .filter({ hasText: 'Labels' })
    .locator('span')
    .first()
    .click();

  await takeScreenshots(page, 'basic', 'c-slider');

  await page
    .locator('c-switch')
    .filter({ hasText: 'Disabled' })
    .locator('span')
    .first()
    .click();

  await takeScreenshots(page, 'basic', 'c-slider');
});

test('Customized', async ({ page }) => {
  await takeScreenshots(page, 'customized', 'c-slider');
});

test('Volume', async ({ page }) => {
  await takeScreenshots(page, 'volume', 'c-slider');
});
