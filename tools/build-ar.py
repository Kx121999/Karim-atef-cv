#!/usr/bin/env python3
"""Build ar/index.html: the Arabic version of index.html, pre-rendered so search engines can index it.

Text comes from the dictionary in ar.js (the same one the in-page language switch uses).
Run from the repo root after editing index.html or ar.js:

    python3 tools/build-ar.py            # write ar/index.html
    python3 tools/build-ar.py --check    # exit 1 if ar/index.html is out of date, list untranslated text
"""
import html as H
import json
import os
import re
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = 'https://kx121999.github.io/Karim-atef-cv/'
VOID = {'meta', 'link', 'img', 'br', 'input', 'hr', 'source', 'area', 'base', 'col', 'embed', 'track', 'wbr', 'path', 'circle', 'rect', 'use'}

TITLE = 'كريم عاطف | مسوّق أداء إبداعي في الإمارات'
DESC = 'كريم عاطف – مسوّق أداء إبداعي في الإمارات: شراء إعلانات (ميتا، تيك توك، لينكدإن)، جذب العملاء المحتملين، ريلز، مونتاج فيديو وتصميم تجاري. نتائج حملات حقيقية وحاسبة لتقدير الحملات.'
OG_DESC = 'مشتري إعلانات وصانع محتوى ومصمم جرافيك ومونتير فيديو في الإمارات. نتائج حقيقية من إعلانات ميتا، ريلز، بوسترات وحاسبة لتقدير الحملات.'
TW_DESC = 'مشتري إعلانات وصانع محتوى ومصمم جرافيك ومونتير فيديو في الإمارات.'
OG_ALT = 'كريم عاطف، مسوّق أداء إبداعي في الإمارات'


def load_dict():
    js = open(os.path.join(ROOT, 'ar.js'), encoding='utf-8').read()
    out = subprocess.run(['node', '-e', 'global.window={};eval(require("fs").readFileSync(0,"utf8"));console.log(JSON.stringify(window.KC_AR))'],
                         input=js, capture_output=True, text=True, check=True).stdout
    return json.loads(out)


def norm(t):
    return re.sub(r'\s+', ' ', t).strip()


def tag_name(tag):
    m = re.match(r'</?\s*([a-zA-Z0-9-]+)', tag)
    return m.group(1).lower() if m else ''


def set_attr(tag, name, value):
    value = H.escape(value, quote=True)
    if re.search(r'\s%s\s*=\s*"[^"]*"' % re.escape(name), tag):
        return re.sub(r'(\s%s\s*=\s*)"[^"]*"' % re.escape(name), lambda m: m.group(1) + '"' + value + '"', tag, count=1)
    return re.sub(r'\s*/?>$', lambda m: ' %s="%s"%s' % (name, value, m.group(0).lstrip() if m.group(0).strip() == '/>' else '>'), tag, count=1)


def get_attr(tag, name):
    m = re.search(r'\s%s\s*=\s*"([^"]*)"' % re.escape(name), tag)
    return m.group(1) if m else None


def translate(src, AR):
    # protect <script>/<style> blocks, they are not touched
    blocks = []

    def keep(m):
        blocks.append(m.group(0))
        return '\x00%d\x00' % (len(blocks) - 1)
    src = re.sub(r'<(script|style)\b[^>]*>.*?</\1>', keep, src, flags=re.S | re.I)
    parts = re.split(r'(<!--.*?-->|<[^>]+>)', src, flags=re.S)
    stack = []  # (name, skip)
    swap_next = None
    missing = []
    out = []
    for p in parts:
        if p.startswith('<!--'):
            out.append(p)
        elif p.startswith('</'):
            n = tag_name(p)
            for i in range(len(stack) - 1, -1, -1):
                if stack[i][0] == n:
                    del stack[i:]
                    break
            out.append(p)
        elif p.startswith('<'):
            n = tag_name(p)
            tag = p
            if n == 'button' and get_attr(p, 'id') == 'lang':
                tag = set_attr(tag, 'aria-label', 'Switch to English')
                swap_next = 'EN'
            if n == 'a' and get_attr(p, 'href') and get_attr(p, 'href').startswith('#') and len(get_attr(p, 'href')) > 1:
                tag = set_attr(tag, 'href', 'ar/' + get_attr(p, 'href'))
            if n == 'a' and re.search(r'\sdownload\b', p) and get_attr(p, 'href') == 'Karim-Atef-CV.pdf':
                tag = set_attr(tag, 'href', 'Karim-Atef-CV-ar.pdf')
            if get_attr(p, 'data-ph-ar') is not None:
                tag = set_attr(tag, 'placeholder', get_attr(p, 'data-ph-ar'))
            if n == 'a' and get_attr(p, 'href') == 'ar/' and get_attr(p, 'hreflang') == 'ar':
                # language link in the footer points at the other language here
                tag = set_attr(set_attr(tag, 'href', './'), 'hreflang', 'en')
                tag = set_attr(tag, 'lang', 'en')
                swap_next = 'English'
            cls = (get_attr(p, 'class') or '').split()
            skip = bool(re.search(r'\sdata-dyn\b', p)) or any(c in ('w', 'ch', 'line') for c in cls)
            if n not in VOID and not p.endswith('/>'):
                stack.append((n, skip))
            out.append(tag)
        else:
            if any(s for _, s in stack) or not p.strip():
                out.append(p)
                continue
            if swap_next:
                out.append(swap_next)
                swap_next = None
                continue
            dec = H.unescape(p)
            k = norm(dec)
            if k in AR:
                lead = re.match(r'\s*', dec).group(0)
                trail = re.search(r'\s*$', dec).group(0)
                out.append(H.escape(lead + AR[k] + trail, quote=False))
            else:
                if re.search(r'[A-Za-z]', dec) and not (stack and stack[-1][0] in ('title',)):
                    missing.append(k)
                out.append(p)
    res = ''.join(out)
    return re.sub('\x00(\\d+)\x00', lambda m: blocks[int(m.group(1))], res), missing


def meta(res, attr, key, value):
    pat = re.compile(r'(<meta\s+%s="%s"\s+content=")[^"]*(")' % (attr, re.escape(key)))
    assert pat.search(res), key
    return pat.sub(lambda m: m.group(1) + H.escape(value, quote=True) + m.group(2), res, count=1)


def build():
    AR = load_dict()
    src = open(os.path.join(ROOT, 'index.html'), encoding='utf-8').read()
    res, missing = translate(src, AR)
    res = res.replace('<html lang="en" dir="ltr">', '<html lang="ar" dir="rtl" data-static="ar">', 1)
    res = re.sub(r'<title>[^<]*</title>', '<title>%s</title>' % TITLE, res, count=1)
    res = meta(res, 'name', 'description', DESC)
    res = meta(res, 'property', 'og:title', TITLE)
    res = meta(res, 'property', 'og:description', OG_DESC)
    res = meta(res, 'property', 'og:image:alt', OG_ALT)
    res = meta(res, 'property', 'og:url', SITE + 'ar/')
    res = meta(res, 'property', 'og:locale', 'ar_AE')
    res = meta(res, 'property', 'og:locale:alternate', 'en_US')
    res = meta(res, 'name', 'twitter:title', TITLE)
    res = meta(res, 'name', 'twitter:description', TW_DESC)
    res = res.replace('<link rel="canonical" href="%s" />' % SITE,
                      '<base href="../" />\n<link rel="canonical" href="%sar/" />' % SITE, 1)
    assert '<base href' in res
    # structured data in Arabic
    m = re.search(r'(<script type="application/ld\+json">)(.*?)(</script>)', res, flags=re.S)
    ld = json.loads(m.group(2))
    ld.update({'name': 'كريم عاطف', 'alternateName': 'Karim Atef', 'jobTitle': 'مسوّق أداء إبداعي', 'url': SITE + 'ar/', 'inLanguage': 'ar', 'description': DESC})
    res = res[:m.start(2)] + json.dumps(ld, ensure_ascii=False, separators=(',', ':')) + res[m.end(2):]
    return res, missing


if __name__ == '__main__':
    res, missing = build()
    path = os.path.join(ROOT, 'ar', 'index.html')
    if '--check' in sys.argv:
        cur = open(path, encoding='utf-8').read() if os.path.exists(path) else ''
        uniq = sorted(set(missing))
        if uniq:
            print('Untranslated text (%d):' % len(uniq))
            for t in uniq:
                print('  -', t[:110])
        if cur != res:
            print('ar/index.html is out of date: run python3 tools/build-ar.py')
            sys.exit(1)
        print('ar/index.html is up to date')
    else:
        os.makedirs(os.path.dirname(path), exist_ok=True)
        open(path, 'w', encoding='utf-8').write(res)
        uniq = sorted(set(missing))
        print('wrote ar/index.html (%d bytes); %d untranslated strings' % (len(res.encode()), len(uniq)))
        for t in uniq:
            print('  -', t[:110])
