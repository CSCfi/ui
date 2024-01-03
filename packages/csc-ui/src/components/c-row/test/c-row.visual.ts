import { test } from '@playwright/test';
import { takeScreenshots } from '../../../utils/test/takeScreenshot';

test.beforeEach(async ({ page }, testInfo) => {
  await page.goto('http://localhost:3000/components/c-row');

  testInfo.snapshotSuffix = '';
});

test('Default', async ({ page }) => {
  await takeScreenshots(page, 'default', 'c-row');
});

test('Justify align', async ({ page }) => {
  await takeScreenshots(page, 'justify-align', 'c-row');

  await page
    .locator('c-radio-group')
    .filter({ hasText: 'Justify' })
    .locator('label')
    .filter({ hasText: 'End' })
    .locator('span')
    .first()
    .click();

  await takeScreenshots(page, 'justify-align', 'c-row');

  await page
    .locator('c-radio-group')
    .filter({ hasText: 'Justify' })
    .locator('label')
    .filter({ hasText: 'Center' })
    .locator('span')
    .first()
    .click();

  await takeScreenshots(page, 'justify-align', 'c-row');

  await page
    .locator('c-radio-group')
    .filter({ hasText: 'Justify' })
    .locator('label')
    .filter({ hasText: 'Space between' })
    .locator('span')
    .first()
    .click();

  await takeScreenshots(page, 'justify-align', 'c-row');

  await page
    .locator('c-radio-group')
    .filter({ hasText: 'Justify' })
    .locator('label')
    .filter({ hasText: 'Space around' })
    .locator('span')
    .first()
    .click();

  await takeScreenshots(page, 'justify-align', 'c-row');

  await page
    .locator('c-radio-group')
    .filter({ hasText: 'Align' })
    .locator('label')
    .filter({ hasText: 'End' })
    .locator('span')
    .first()
    .click();

  await takeScreenshots(page, 'justify-align', 'c-row');

  await page
    .locator('c-radio-group')
    .filter({ hasText: 'Align' })
    .locator('label')
    .filter({ hasText: 'Center' })
    .locator('span')
    .first()
    .click();

  await takeScreenshots(page, 'justify-align', 'c-row');
});
