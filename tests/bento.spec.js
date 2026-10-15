const { test, expect, open, scrollThrough } = require('./helpers');

test('services bento: four tiles, bar values match the portfolio cards', async ({ page }) => {
  await open(page, '/index.html');
  await scrollThrough(page);
  await expect(page.locator('.bento .service')).toHaveCount(4);
  const cpr = async (img) => (await page.$eval(`.project-card[data-img="${img}"]`, (c) => c.querySelectorAll('.metrics b')[1].textContent.trim())).replace('AED ', '');
  const bars = await page.$$eval('.bars .bar', (bs) => bs.map((b) => [b.querySelector('span').textContent.trim(), b.querySelector('b').textContent.trim(), +getComputedStyle(b.querySelector('i')).getPropertyValue('--w')]));
  const byName = Object.fromEntries(bars.map((b) => [b[0], b]));
  expect(byName.Mosque[1]).toBe(await cpr('campaign-2.webp'));
  expect(byName.Zaora[1]).toBe(await cpr('campaign-1.webp'));
  expect(byName.Salsabeel[1]).toBe(await cpr('campaign-5.webp'));
  const max = Math.max(...bars.map((b) => +b[1]));
  for (const [, v, w] of bars) expect(w).toBeCloseTo(+v / max, 2); // bar length is proportional to the value
  expect(await page.locator('.bars em').textContent()).toContain('20.34');
});

test('tool chips jump to their section', async ({ page }) => {
  await open(page, '/index.html');
  for (const id of ['estimator', 'audit', 'planner', 'studio', 'adlab', 'hooks', 'book']) {
    await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; scrollTo(0, 0); });
    await page.evaluate((i) => document.querySelector(`.chips a[href="#${i}"]`).click(), id);
    await expect.poll(() => page.evaluate((i) => Math.abs(Math.round(document.getElementById(i).getBoundingClientRect().top)), id), { timeout: 6000, message: id }).toBeLessThanOrEqual(3);
  }
});

test('Arabic page shows the bento in Arabic', async ({ page }) => {
  await open(page, '/ar/');
  await expect(page.locator('.bento .service h3').nth(3)).toHaveText('جرّب الأدوات');
  await expect(page.locator('.chips a').first()).toHaveText('حاسبة الحملات');
});

test('accent colour: switch, persist, reset', async ({ page }) => {
  await open(page, '/index.html');
  const accent = () => page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--accent').trim());
  expect(await accent()).toBe('#d7ff5f');
  await page.locator('.accent-sw button[data-a=gold]').click();
  expect(await accent()).toBe('#ffc857');
  await expect(page.locator('.accent-sw button[data-a=gold]')).toHaveAttribute('aria-checked', 'true');
  await expect(page.locator('.accent-sw button[data-a=lime]')).toHaveAttribute('aria-checked', 'false');
  expect(await page.evaluate(() => localStorage.getItem('accent'))).toBe('gold');
  await page.reload();
  await page.waitForFunction(() => window.KC);
  expect(await accent()).toBe('#ffc857');
  await expect(page.locator('.accent-sw button[data-a=gold]')).toHaveAttribute('aria-checked', 'true');
  await page.locator('.accent-sw button[data-a=lime]').click();
  expect(await accent()).toBe('#d7ff5f');
  expect(await page.evaluate(() => localStorage.getItem('accent'))).toBe('lime');
});

test('accent colour reaches the canvases and the share card without errors', async ({ page }) => {
  await open(page, '/index.html', undefined);
  await page.locator('.accent-sw button[data-a=violet]').click();
  await page.evaluate(() => window.KC.load());
  await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; document.getElementById('estimator').scrollIntoView(); });
  const [dl] = await Promise.all([page.waitForEvent('download'), page.locator('#estShare').click()]);
  expect(dl.suggestedFilename()).toBe('campaign-estimate.png');
  await page.waitForTimeout(500); // a few frames of the funnel and globe with the new colour
});
