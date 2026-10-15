/* Builds the 1200x630 share images (JPEG) in og/ from the real numbers on the site.
   Run after changing a page title or a number:  node tools/build-og.cjs
   Needs Playwright (npm install) and Chromium (CHROMIUM_PATH or `npx playwright install chromium`). */
const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const url = (f) => 'file://' + path.join(ROOT, f);

const PAGES = [
  { out: 'home', lang: 'en', kick: 'Portfolio / UAE', title: 'Creative Performance Marketer in the UAE', stats: [['1000+', 'conversations'], ['500+', 'leads'], ['7+', 'years']], art: { photo: 'profile.webp' } },
  { out: 'home-ar', lang: 'ar', kick: 'أعمالي / الإمارات', title: 'مسوّق أداء إبداعي في الإمارات', stats: [['1000+', 'محادثة'], ['500+', 'عميل محتمل'], ['7+', 'سنوات']], art: { photo: 'profile.webp' } },
  { out: 'campaign-costs', lang: 'en', kick: 'Insights / Meta Ads', title: 'What my Meta Ads campaigns really cost', stats: [['AED 20.34', 'per conversation'], ['AED 32.73', 'per lead'], ['AED 23,536', 'total budget']], art: { bars: [['Mosque', 14.6], ['Salsabeel', 35.52], ['Zaora', 38.1], ['April Leads', 42.78], ['Meta Lead', 59.41]] } },
  { out: 'campaign-costs-ar', lang: 'ar', kick: 'تحليلات / إعلانات ميتا', title: 'ما التكلفة الفعلية لحملات إعلانات ميتا الخاصة بي', stats: [['AED 20.34', 'للمحادثة'], ['AED 32.73', 'للعميل المحتمل'], ['AED 23,536', 'إجمالي الميزانية']], art: { bars: [['المسجد', 14.6], ['سلسبيل', 35.52], ['Zaora', 38.1], ['April Leads', 42.78], ['Meta Lead', 59.41]] } },
  { out: 'case-zaora', lang: 'en', kick: 'Case study / Real estate', title: 'Zaora Campaign', stats: [['43', 'conversations'], ['AED 38.10', 'per conversation'], ['AED 1,638', 'budget']], art: { shot: 'campaign-1.webp' } },
  { out: 'case-zaora-ar', lang: 'ar', kick: 'دراسة حالة / عقارات', title: 'حملة Zaora', stats: [['43', 'محادثة'], ['AED 38.10', 'للمحادثة'], ['AED 1,638', 'الميزانية']], art: { shot: 'campaign-1.webp' } },
  { out: 'case-mosque', lang: 'en', kick: 'Case study / Messages', title: 'Mosque Campaign', stats: [['440', 'conversations'], ['AED 14.60', 'per conversation'], ['AED 6,422', 'budget']], art: { shot: 'campaign-2.webp' } },
  { out: 'case-mosque-ar', lang: 'ar', kick: 'دراسة حالة / رسائل', title: 'حملة المسجد', stats: [['440', 'محادثة'], ['AED 14.60', 'للمحادثة'], ['AED 6,422', 'الميزانية']], art: { shot: 'campaign-2.webp' } },
];

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function html(p) {
  const ar = p.lang === 'ar';
  let art = '';
  if (p.art.photo) art = `<div class="photo" style="background-image:url('${url(p.art.photo)}')"></div>`;
  if (p.art.shot) art = `<div class="shot"><img src="${url(p.art.shot)}"></div>`;
  if (p.art.bars) {
    const max = Math.max(...p.art.bars.map((b) => b[1]));
    art = `<div class="bars"><small>${ar ? 'تكلفة النتيجة بالدرهم' : 'Cost per result, AED'}</small>` + p.art.bars.map((b) => `<div class="bar"><span>${esc(b[0])}</span><i style="width:${(b[1] / max) * 100}%"></i><b>${b[1].toFixed(2)}</b></div>`).join('') + '</div>';
  }
  return `<!doctype html><html lang="${p.lang}" dir="${ar ? 'rtl' : 'ltr'}"><head><meta charset="utf-8"><style>
@font-face{font-family:Inter;font-weight:100 900;src:url('${url('fonts/inter-var-latin.woff2')}') format('woff2');unicode-range:U+0000-00FF,U+2000-206F}
@font-face{font-family:Cairo;font-weight:200 1000;src:url('${url('fonts/cairo-var-arabic.woff2')}') format('woff2');unicode-range:U+0600-06FF,U+FB50-FDFF,U+FE70-FEFC}
*{box-sizing:border-box;margin:0;padding:0}
body{width:1200px;height:630px;overflow:hidden;background:#050505;color:#f5f1e8;font-family:${ar ? 'Cairo,Inter' : 'Inter,Cairo'},sans-serif;position:relative}
body:before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 12% 0%,rgba(215,255,95,.18),transparent 40%),radial-gradient(circle at 100% 100%,rgba(215,255,95,.08),transparent 45%)}
body:after{content:"";position:absolute;inset:0;opacity:.07;background-image:linear-gradient(#f5f1e8 1px,transparent 1px),linear-gradient(90deg,#f5f1e8 1px,transparent 1px);background-size:48px 48px}
.wrap{position:relative;z-index:1;display:grid;grid-template-columns:1.25fr .9fr;gap:40px;height:100%;padding:60px 64px}
.kick{color:#d7ff5f;font-weight:900;letter-spacing:${ar ? '0' : '.16em'};text-transform:uppercase;font-size:20px}
h1{font-size:${p.title.length > 30 ? 58 : 76}px;line-height:${ar ? 1.25 : .98};letter-spacing:${ar ? '0' : '-.05em'};font-weight:900;margin:22px 0 auto;${ar ? '' : 'text-transform:uppercase;'}}
.left{display:flex;flex-direction:column}
.stats{display:grid;grid-template-columns:repeat(3,auto);gap:0;border:1px solid rgba(245,241,232,.16);border-radius:18px;overflow:hidden;margin-top:28px}
.stats div{padding:16px 18px;background:rgba(245,241,232,.04)}
.stats div+div{border-inline-start:1px solid rgba(245,241,232,.16)}
.stats b{display:block;white-space:nowrap;color:#d7ff5f;font-size:${p.stats.some((x) => x[0].length > 6) ? 27 : 34}px;font-weight:900;letter-spacing:-.03em;direction:ltr;text-align:${ar ? 'right' : 'left'}}
.stats span{display:block;color:#a9a59c;font-size:17px;margin-top:4px}
.sign{margin-top:22px;font-size:20px;color:#a9a59c}.sign b{color:#f5f1e8}
.right{display:flex;align-items:center;justify-content:center}
.photo{width:380px;height:380px;border-radius:50%;background-size:cover;background-position:center 20%;border:6px solid #d7ff5f;box-shadow:0 30px 80px rgba(0,0,0,.6)}
.shot{background:#fff;border-radius:20px;padding:14px;transform:rotate(${ar ? 2 : -2}deg);box-shadow:0 30px 80px rgba(0,0,0,.6)}
.shot img{display:block;width:420px;height:auto;border-radius:10px}
.bars{width:100%;display:grid;gap:14px}
.bars small{color:#a9a59c;font-size:16px;font-weight:800;letter-spacing:${ar ? '0' : '.1em'};text-transform:uppercase}
.bar{display:grid;grid-template-columns:120px 1fr 80px;gap:12px;align-items:center;font-size:18px}
.bar span{color:#a9a59c}.bar i{display:block;height:16px;border-radius:9px;background:linear-gradient(90deg,rgba(215,255,95,.35),#d7ff5f)}
[dir=rtl] .bar i{background:linear-gradient(270deg,rgba(215,255,95,.35),#d7ff5f)}
.bar b{direction:ltr;text-align:end}
</style></head><body><div class="wrap"><div class="left"><div class="kick">${esc(p.kick)}</div><h1>${esc(p.title)}</h1>
<div class="stats">${p.stats.map((s) => `<div><b>${esc(s[0])}</b><span>${esc(s[1])}</span></div>`).join('')}</div>
<div class="sign"><b>${ar ? 'كريم عاطف' : 'Karim Atef'}</b> · kx121999.github.io/Karim-atef-cv</div></div>
<div class="right">${art}</div></div></body></html>`;
}

(async () => {
  const launch = process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {};
  const browser = await chromium.launch(launch);
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  const tmp = path.join(require('os').tmpdir(), 'kc-og.html');
  for (const p of PAGES) {
    fs.writeFileSync(tmp, html(p));
    await page.goto('file://' + tmp);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(150);
    const out = path.join(ROOT, 'og', p.out + '.jpg');
    await page.screenshot({ path: out, type: 'jpeg', quality: 86 });
    console.log('wrote', path.relative(ROOT, out), fs.statSync(out).size, 'bytes');
  }
  await browser.close();
})();
