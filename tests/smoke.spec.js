const { test, expect, open, scrollThrough } = require('./helpers');

const SECTIONS = ['home', 'story', 'services', 'process', 'experience', 'campaigns', 'estimator', 'audit', 'planner', 'designs', 'studio', 'hooks', 'videos', 'about', 'book', 'contact'];

for (const url of ['/index.html', '/ar/']) {
  test(`${url} loads with every section and no horizontal scroll`, async ({ page }) => {
    await open(page, url);
    for (const id of SECTIONS) await expect(page.locator('#' + id)).toHaveCount(1);
    await scrollThrough(page);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
}

test('page titles and metadata', async ({ page }) => {
  await open(page, '/index.html');
  await expect(page).toHaveTitle(/Karim Atef/);
  await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href', 'https://kx121999.github.io/Karim-atef-cv/');
  await open(page, '/ar/');
  await expect(page).toHaveTitle(/كريم عاطف/);
  await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href', 'https://kx121999.github.io/Karim-atef-cv/ar/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
});

test('self-hosted fonts load', async ({ page }) => {
  await open(page, '/index.html');
  const fonts = await page.evaluate(async () => { await document.fonts.ready; return [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family); });
  expect(fonts).toContain('Inter');
});

test('service worker registers', async ({ page }) => {
  await open(page, '/index.html');
  const state = await page.evaluate(async () => { const r = await navigator.serviceWorker.ready; return r.active ? 'active' : 'none'; });
  expect(state).toBe('active');
});

test('chapter numerals run 01, 02, 03… in page order', async ({ page }) => {
  await open(page, '/index.html');
  const nums = await page.$$eval('.section-head', (hs) => hs.filter((h) => h.offsetParent !== null).map((h) => getComputedStyle(h, '::before').content.replace(/"/g, '')));
  expect(nums.length).toBeGreaterThan(10);
  expect(nums).toEqual(nums.map((_, i) => String(i + 1).padStart(2, '0')));
});
