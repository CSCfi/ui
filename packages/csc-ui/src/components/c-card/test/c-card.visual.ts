import { test } from '@playwright/test';
import { takeScreenshots } from '../../../utils/test/takeScreenshot';

test.beforeEach(async ({ page }, testInfo) => {
  await page.goto('http://localhost:3000/components/c-card');

  testInfo.snapshotSuffix = '';
});

test('Basic', async ({ page }) => {
  await takeScreenshots(page, 'basic', 'c-card');
});

test('Fullscreen', async ({ page }) => {
  await takeScreenshots(page, 'fullscreen', 'c-card');

  const card = await page.waitForSelector('c-card');

  const fullscreenButton = await card.waitForSelector(
    '.c-card__fullscreen-toggle',
  );

  await fullscreenButton.click();

  await page.waitForTimeout(1000);

  await takeScreenshots(page, 'fullscreen', 'c-card');
});
