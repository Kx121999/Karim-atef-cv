const { test, expect, open, scrollThrough, jump } = require('./helpers');

test('campaign filter shows only matching projects', async ({ page }) => {
  await open(page, '/index.html');
  await scrollThrough(page);
  await jump(page, 'campaigns');
  const visible = () => page.$$eval('.project-card', (cs) => cs.filter((c) => getComputedStyle(c).display !== 'none' && !c.classList.contains('fhide')).map((c) => c.querySelector('h3').textContent));
  await page.locator('.filters button[data-f=leads]').click();
  await expect.poll(visible).toEqual(expect.arrayContaining(['Meta Lead Campaign']));
  const leads = await visible();
  expect(leads).not.toContain('Zaora Campaign');
  await page.locator('.filters button[data-f=real-estate]').click();
  await expect.poll(visible).toContain('Zaora Campaign');
});

test('contact form validates, then hands the message to WhatsApp', async ({ page }) => {
  await open(page, '/index.html');
  await scrollThrough(page);
  await jump(page, 'contact');
  await page.locator('[data-via=wa]').click({ force: true });
  await expect(page.locator('#cfErr')).toContainText('name');
  await page.fill('input[name=name]', 'Sara');
  await page.fill('textarea[name=msg]', 'Need ads for my clinic');
  await page.selectOption('select[name=need]', 'Full campaign');
  await page.locator('[data-via=wa]').click({ force: true });
  const sent = decodeURIComponent(await page.evaluate(() => window.__open.slice(-1)[0]));
  expect(sent).toContain('https://wa.me/971527366719?text=');
  expect(sent).toContain('Sara');
  expect(sent).toContain('Full campaign');
  expect(sent).toContain('Need ads for my clinic');
});
