/* Offline cache: pages, scripts and styles network-first, other files stale-while-revalidate, media never cached. Bump V to reset. */
const V='kc-v2';
const CORE=['./','index.html','app.js','manifest.webmanifest','fonts/inter-var-latin.woff2','icon-192.png','mask-name.png','mask-name-ar.png','profile.webp','hero-photo.webp'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);if(u.origin!==location.origin)return;
  if(/\.(mp4|webm)$/i.test(u.pathname)||r.headers.has('range'))return;
  if(r.mode==='navigate'||/\.(js|css)$/i.test(u.pathname)){
    e.respondWith(fetch(r).then(res=>{const cp=res.clone();caches.open(V).then(c=>c.put(r,cp));return res}).catch(()=>caches.match(r).then(m=>m||(r.mode==='navigate'?caches.match('index.html'):undefined))));
    return;
  }
  e.respondWith(caches.match(r).then(m=>{
    const net=fetch(r).then(res=>{if(res.ok){const cp=res.clone();caches.open(V).then(c=>c.put(r,cp))}return res}).catch(()=>m);
    return m||net;
  }));
});
