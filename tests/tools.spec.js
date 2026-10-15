const { test, expect, open, scrollThrough, jump } = require('./helpers');

const decodeWa = (page) => page.evaluate(() => decodeURIComponent(window.__open.slice(-1)[0].split('text=')[1]));

test.beforeEach(async ({ page }) => {
  await open(page, '/index.html');
  await page.evaluate(() => window.KC.load());
  await scrollThrough(page);
});

test('Ad Audit gives a score, tips and a WhatsApp message', async ({ page }) => {
  await jump(page, 'audit');
  const pick = (i) => page.locator(`#auBody .au-opts button[data-i="${i}"]`).click();
  await pick(2); await pick(1); await pick(0);
  await page.locator('#auBody .au-back').click(); // going back keeps the earlier answers
  await pick(1);
  await pick(2); await pick(1); await pick(0);
  await expect(page.locator('#auNum')).toBeVisible();
  expect(await page.locator('.au-tips li').count()).toBe(3);
  await page.locator('[data-act=wa]').click();
  const score = +/scored (\d+)\/100/.exec(await decodeWa(page))[1];
  expect(score).toBeGreaterThan(0);
  expect(score).toBeLessThanOrEqual(100);
  await expect(page.locator('#auNum')).toHaveText(String(score)); // the counter settles on the same number
});

test('Campaign Plan builds a sheet and sends it', async ({ page }) => {
  await jump(page, 'planner');
  await page.locator('#plType button[data-v=clinic]').click();
  await page.locator('#plGoal button[data-v=lead]').click();
  await page.locator('#plDur button[data-v="3"]').click();
  await page.evaluate(() => { const r = document.getElementById('plBudget'); r.value = 20000; r.dispatchEvent(new Event('input')); });
  await expect(page.locator('.plan-sheet h3')).toContainText('Clinic');
  await expect(page.locator('.plan-sheet .sum')).toContainText('AED 20,000 per month for 3 months (AED 60,000 in total)');
  await page.locator('#plWa').click();
  expect(await decodeWa(page)).toContain('AED 20,000 per month for 3 month(s)');
});

test('Request a Call validates, then sends the chosen time', async ({ page }) => {
  await jump(page, 'book');
  await page.locator('#bkSend').click();
  await expect(page.locator('#bkErr')).toContainText('name');
  await page.locator('#bkDays button[data-d="2"]').click();
  await page.locator('#bkSlots button[data-s="14:00"]').click();
  await page.fill('#bkName', 'Sara');
  await page.locator('#bkSend').click();
  const msg = await decodeWa(page);
  expect(msg).toContain('14:00');
  expect(msg).toContain('Sara');
  expect(msg).toContain('UAE time');
});

test('Estimator can download a share card', async ({ page }) => {
  await jump(page, 'estimator');
  const [dl] = await Promise.all([page.waitForEvent('download'), page.locator('#estShare').click()]);
  expect(dl.suggestedFilename()).toBe('campaign-estimate.png');
});

test('Poster Lab renders and downloads a PNG', async ({ page }) => {
  await jump(page, 'studio');
  await page.fill('#stHead', 'Summer Sale 40% off');
  await page.locator('#stPal button[data-v=lime]').click();
  const px = await page.evaluate(() => { const c = document.getElementById('posterCv'); return [c.width, c.height, c.toDataURL('image/png').length]; });
  expect(px[0]).toBe(1080);
  expect(px[2]).toBeGreaterThan(5000);
  const [dl] = await Promise.all([page.waitForEvent('download'), page.locator('#stDl').click()]);
  expect(dl.suggestedFilename()).toBe('poster-post.png');
});

test('Reel Hooks lists hooks and can send one to the poster', async ({ page }) => {
  await jump(page, 'hooks');
  await page.locator('#hkType button[data-v=beauty]').click();
  await page.locator('#hkGoal button[data-v=lead]').click();
  await expect(page.locator('.hk')).toHaveCount(8);
  const first = await page.locator('.hk p').first().textContent();
  await page.locator('.hk:nth-child(1) [data-act=poster]').click();
  await expect.poll(() => page.inputValue('#stHead')).toContain(first.replace(/[.?!]+$/, '').slice(0, 20));
});

test('Search palette: Ctrl K, filter, Enter jumps to the section', async ({ page }) => {
  await page.keyboard.press('Control+k');
  await expect(page.locator('#cmdk')).toBeVisible();
  await page.keyboard.type('plan');
  await expect(page.locator('#ckList li').first()).toContainText('Campaign Plan');
  await page.keyboard.press('Enter');
  await expect(page.locator('#cmdk')).toBeHidden();
  await expect.poll(() => page.evaluate(() => Math.abs(Math.round(document.getElementById('planner').getBoundingClientRect().top))), { timeout: 6000 }).toBeLessThanOrEqual(3);
});

test('Search palette opens even before the tools have loaded', async ({ page, browser }) => {
  const fresh = await page.context().newPage();
  await fresh.addInitScript(() => { try { localStorage.setItem('lite', '0'); sessionStorage.setItem('intro', '1'); } catch (e) {} });
  await fresh.goto('/index.html', { waitUntil: 'domcontentloaded' });
  await fresh.waitForFunction(() => window.KC);
  await fresh.keyboard.press('Control+k');
  await expect(fresh.locator('#cmdk')).toBeVisible();
  await expect(fresh.locator('#ckList li').first()).toBeVisible();
});

test('tools render in Arabic', async ({ page }) => {
  await page.locator('#lang').click();
  await jump(page, 'audit');
  await expect(page.locator('#auBody')).toContainText('السؤال');
  await page.keyboard.press('Control+k');
  await expect(page.locator('#ckList li').first()).toContainText('الخدمات');
});

test('Ad Preview: four placements, own image, download and WhatsApp', async ({ page }) => {
  await jump(page, 'adlab');
  const size = () => page.evaluate(() => { const c = document.getElementById('apCv'); return [c.width, c.height]; });
  await expect.poll(size).toEqual([1080, expect.any(Number)]);
  for (const [v, tall] of [['fb', false], ['ig', false], ['story', true], ['tt', true]]) {
    await page.locator(`#apPlace button[data-v=${v}]`).click();
    await expect.poll(async () => (await size())[1] === 1920, { message: v }).toBe(tall);
  }
  await page.fill('#apHead', 'Spring offer');
  await page.locator('#apPlace button[data-v=fb]').click();
  await expect(page.locator('#apCv')).toHaveAttribute('aria-label', /Spring offer/);
  // a file the visitor picks is drawn without leaving the page
  await page.setInputFiles('#apFile', require('path').join(__dirname, '..', 'profile.jpg'));
  await expect(page.locator('.ap-up')).toHaveClass(/on/);
  const [dl] = await Promise.all([page.waitForEvent('download'), page.locator('#apDl').click()]);
  expect(dl.suggestedFilename()).toBe('ad-preview-fb.png');
  await page.locator('#apWa').click();
  expect(await decodeWa(page)).toContain('Headline: Spring offer');
});

test('Ad Preview: length check per placement', async ({ page }) => {
  await jump(page, 'adlab');
  const row = (p) => page.locator(`#apLen li[data-p=${p}]`);
  await page.fill('#apText', 'Short offer.');
  await page.fill('#apHead', 'Spring offer');
  for (const p of ['fb', 'ig', 'story', 'tt']) await expect(row(p)).not.toHaveClass(/cut/);
  await expect(row('fb')).toContainText('Text fits');
  await expect(page.locator('#apLenSum')).toContainText('Primary text: 12 characters');
  // long copy: cut before "more" in the two-line placements, over TikTok's limit
  await page.fill('#apText', 'Limited time offer on every apartment in Dubai Marina. Book your viewing today and get an extra discount when you pay upfront. Message us now on WhatsApp for the details');
  await page.fill('#apHead', 'Dubai Marina apartments up to 20% off this month');
  for (const p of ['ig', 'story', 'tt']) await expect(row(p)).toHaveClass(/cut/);
  const shown = +/Shows (\d+) of 169/.exec(await row('ig').textContent())[1];
  expect(shown).toBeGreaterThan(40);
  expect(shown).toBeLessThan(169);
  await expect(row('tt')).toContainText('100-character limit');
  await expect(row('fb')).toContainText('headline cut');
  // the current placement is marked and follows the chips
  await expect(row('fb')).toHaveClass(/on/);
  await page.locator('#apPlace button[data-v=tt]').click();
  await expect(row('tt')).toHaveClass(/on/);
  await expect(row('fb')).not.toHaveClass(/on/);
  // Arabic
  await page.evaluate(() => scrollTo(0, 0));
  await page.locator('#lang').click();
  await expect(page.locator('#apLenSum')).toContainText('عدد الحروف');
});
