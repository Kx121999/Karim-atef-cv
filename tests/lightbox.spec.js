const { test, expect, open, scrollThrough, jump } = require('./helpers');

test('image preview opens from a card, cycles, closes and returns focus', async ({ page }) => {
  await open(page, '/index.html');
  await scrollThrough(page);
  await jump(page, 'designs');
  const card = page.locator('.design-card').first();
  await card.focus();
  await page.keyboard.press('Enter');
  const box = page.locator('#lightbox');
  await expect(box).toHaveClass(/open/);
  await expect(page.locator('#boxImg')).toHaveAttribute('src', 'design-1.webp');
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#boxImg')).toHaveAttribute('src', 'design-2.webp');
  await page.keyboard.press('Escape');
  await expect(box).not.toHaveClass(/open/);
  await expect(card).toBeFocused();
});

test('Tab stays inside the preview and the search palette', async ({ page }) => {
  await open(page, '/index.html');
  await scrollThrough(page);
  await jump(page, 'designs');
  await page.locator('.design-card').first().focus();
  await page.keyboard.press('Enter');
  for (let i = 0; i < 6; i++) {
    await page.keyboard.press('Tab');
    expect(await page.evaluate(() => document.getElementById('lightbox').contains(document.activeElement))).toBe(true);
  }
  await page.keyboard.press('Escape');
  await page.keyboard.press('Control+k');
  await expect(page.locator('#cmdk')).toBeVisible();
  for (let i = 0; i < 3; i++) {
    await page.keyboard.press('Tab');
    expect(await page.evaluate(() => document.getElementById('cmdk').contains(document.activeElement))).toBe(true);
  }
});

test('the 3D reel ring spins on drag and opens a reel', async ({ page }) => {
  await open(page, '/index.html');
  await page.evaluate(() => { const s = document.getElementById('ringStage'); scrollTo(0, s.getBoundingClientRect().top + scrollY - 120); });
  await page.waitForTimeout(800);
  const bb = await page.locator('#ringStage').boundingBox();
  const angle = () => page.evaluate(() => parseFloat(/rotateY\((-?[\d.]+)deg\)/.exec(document.getElementById('ring').style.transform)[1]));
  const a0 = await angle();
  await page.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2);
  await page.mouse.down();
  await page.mouse.move(bb.x + bb.width / 2 + 200, bb.y + bb.height / 2, { steps: 8 });
  await page.mouse.up();
  expect(Math.abs((await angle()) - a0)).toBeGreaterThan(30); // a 200px drag turns the ring by about 80 degrees
  // a tap on the front card (the ring keeps drifting, so click it from script; the pointerdown/up pair clears the drag distance)
  await page.evaluate(() => {
    document.getElementById('ringStage').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    window.dispatchEvent(new PointerEvent('pointerup'));
    [...document.querySelectorAll('.rc')].sort((a, b) => b.style.zIndex - a.style.zIndex)[0].click();
  });
  await expect(page.locator('#lightbox')).toHaveClass(/vid/);
  await page.keyboard.press('Escape');
  await expect(page.locator('#lightbox')).not.toHaveClass(/open/);
});
