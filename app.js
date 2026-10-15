(()=>{
const $=(s,c=document)=>c.querySelector(s), $$=(s,c=document)=>[...c.querySelectorAll(s)];
const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
const root=document.documentElement;
const lite=root.classList.contains('lite');
const NF=new Intl.NumberFormat('en-US',{maximumFractionDigits:0});
const canVT=!!document.startViewTransition&&!reduce&&!lite;
const vt=fn=>{
  if(!canVT){fn();return Promise.resolve()}
  try{return document.startViewTransition(fn).finished.catch(()=>{})}catch(e){fn();return Promise.resolve()}
};

/* split text into masked words / letters */
function splitWords(el){
  const words=el.textContent.trim().split(/\s+/);
  el.setAttribute('aria-label',el.textContent.trim());
  el.innerHTML=words.map((w,i)=>`<span class="w" aria-hidden="true" style="--i:${i}"><span style="--i:${i}">${w}</span></span>`).join(' ');
}
$$('.section-title,.contact-panel h2,.creative-card h2').forEach(splitWords);
let n=0;
$$('.big-name h1 > span').forEach(line=>{
  const t=line.textContent;
  line.classList.add('line');
  line.innerHTML=[...t].map(c=>`<span class="ch" aria-hidden="true" style="--i:${n++}">${c}</span>`).join('');
});
$('.big-name h1').setAttribute('aria-label','Karim Atef');

/* ---------- language switch (EN / AR) ---------- */
const STATIC_AR=root.dataset.static==='ar';
const TITLE_EN=document.title,TITLE_AR=STATIC_AR?document.title:'كريم عاطف | مسوّق أداء إبداعي';
const norm=t=>t.replace(/\s+/g,' ').trim();
const origText=new WeakMap();
const splitEls=$$('.section-title,.contact-panel h2,.creative-card h2');
splitEls.forEach(el=>el.dataset.en=el.getAttribute('aria-label'));
const heroLines=$$('.big-name h1 .line');
heroLines.forEach(l=>l.dataset.en=l.textContent);
let AR=STATIC_AR?{}:null;
function loadAR(){
  if(AR)return Promise.resolve();
  return new Promise(res=>{
    const s=document.createElement('script');s.src='ar.js';
    s.onload=()=>{AR=window.KC_AR||{};res()};
    s.onerror=()=>{AR={};res()};
    document.head.appendChild(s);
  });
}
function setLang(lang,animate){
  if(lang==='ar'&&!AR){root.lang='ar';root.dir='rtl';loadAR().then(()=>setLang('ar',animate));return}
  const ar=lang==='ar';
  root.lang=ar?'ar':'en';root.dir=ar?'rtl':'ltr';
  document.title=ar?TITLE_AR:TITLE_EN;
  const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,{acceptNode(n){
    const p=n.parentElement;
    if(!p||p.closest('script,style,.w,.ch,.line,[data-dyn]'))return NodeFilter.FILTER_REJECT;
    return n.nodeValue.trim()?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT;
  }});
  const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
  nodes.forEach(n=>{
    if(!origText.has(n))origText.set(n,n.nodeValue);
    const o=origText.get(n),k=norm(o);
    n.nodeValue=ar&&AR[k]?o.replace(o.trim(),AR[k]):o;
  });
  splitEls.forEach(el=>{
    const en=el.dataset.en;el.textContent=ar&&AR[en]?AR[en]:en;splitWords(el);
  });
  let i=0;
  heroLines.forEach(l=>{
    const en=l.dataset.en,t=ar&&AR[en]?AR[en]:en;
    l.innerHTML=(ar?[t]:[...t]).map(c=>`<span class="ch" aria-hidden="true" style="--i:${i++}">${c}</span>`).join('');
  });
  $$('a[download]').forEach(a=>a.setAttribute('href',ar?'Karim-Atef-CV-ar.pdf':'Karim-Atef-CV.pdf'));
  $$('[data-ph-en]').forEach(el=>el.placeholder=ar?el.dataset.phAr:el.dataset.phEn);
  $('.big-name h1').setAttribute('aria-label',ar?'كريم عاطف':'Karim Atef');
  const b=$('#lang');if(b){b.textContent=ar?'EN':'عربي';b.setAttribute('aria-label',ar?'Switch to English':'التبديل إلى العربية')}
  try{localStorage.setItem('lang',lang)}catch(e){}
}
let saved=null;try{saved=localStorage.getItem('lang')}catch(e){}
if(saved==='ar'||STATIC_AR)setLang('ar');
$('#lang')?.addEventListener('pointerenter',loadAR,{once:true});
$('#lang')?.addEventListener('click',()=>{
  if(STATIC_AR){try{localStorage.setItem('lang','en')}catch(e){}location.assign(document.baseURI);return}
  const next=root.lang==='ar'?'en':'ar';(next==='ar'?loadAR():Promise.resolve()).then(()=>vt(()=>setLang(next)))});

/* ---------- creative layer: funnel canvas, estimator, process, video preview ---------- */
(function funnel(){
  const cv=$('#fx');if(!cv||reduce||lite)return;
  const ctx=cv.getContext('2d');let W=0,H=0,FH=0,cx=0,topW=0,neck=0,dpr=1,P=[],run=false,mx=-999,my=-999;
  const N=()=>innerWidth<700?30:56;
  const mk=(init)=>({x:Math.random()*W,y:init?Math.random()*FH*.9:-10-Math.random()*60,vy:.35+Math.random()*.7,ph:Math.random()*6.28,r:1+Math.random()*1.8,c:0});
  function size(){
    const r=cv.getBoundingClientRect();dpr=Math.min(devicePixelRatio||1,1.5);W=r.width;H=r.height;
    cv.width=W*dpr;cv.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);
    FH=Math.min(H,Math.max(innerHeight*.95,620));
    cx=innerWidth<900?W*.5:W*.72;topW=Math.min(W*.5,520);neck=34;
    P=Array.from({length:N()},()=>mk(true));
  }
  const glow=document.createElement('canvas');glow.width=glow.height=26;{const g=glow.getContext('2d'),gr=g.createRadialGradient(13,13,0,13,13,13);gr.addColorStop(0,'rgba(215,255,95,1)');gr.addColorStop(.25,'rgba(215,255,95,.7)');gr.addColorStop(1,'rgba(215,255,95,0)');g.fillStyle=gr;g.fillRect(0,0,26,26)}
  const NY=()=>FH*.62;
  function edge(y,side){const t=Math.min(Math.max((y-FH*.04)/(NY()-FH*.04),0),1);const e=1-Math.pow(1-t,2.2);const half=(topW/2)*(1-e)+(neck/2)*e;return cx+side*half}
  function frame(){
    if(!run)return;
    ctx.clearRect(0,0,W,H);
    ctx.lineWidth=1;ctx.strokeStyle='rgba(215,255,95,.13)';
    for(const side of[-1,1]){ctx.beginPath();for(let y=FH*.04;y<=NY();y+=8){const x=edge(y,side);y===FH*.04?ctx.moveTo(x,y):ctx.lineTo(x,y)}ctx.stroke()}
    ctx.beginPath();ctx.moveTo(cx-neck/2,NY());ctx.lineTo(cx-neck/2,FH*.86);ctx.moveTo(cx+neck/2,NY());ctx.lineTo(cx+neck/2,FH*.86);ctx.stroke();
    for(const p of P){
      p.ph+=.02;p.y+=p.vy;
      const inFun=p.y<NY();
      if(inFun){
        const l=edge(p.y,-1),r=edge(p.y,1);
        p.x+=Math.sin(p.ph)*.35;
        if(p.x<l)p.x+=(l-p.x)*.08;if(p.x>r)p.x+=(r-p.x)*.08;
        if(p.y>FH*.04&&(p.x<l-30||p.x>r+30))p.x+=(cx-p.x)*.02;
      }else{p.c=1;p.x+=(cx-p.x)*.08;p.vy=Math.min(p.vy+.01,1.6)}
      const dx=p.x-mx,dy=p.y-my,d=Math.hypot(dx,dy);
      if(d<120){const f=(120-d)/120;p.x+=dx/d*f*3.2;p.y+=dy/d*f*3.2}
      let a=.75;
      if(p.y<FH*.1)a=.75*(p.y/(FH*.1));
      if(p.y>FH*.7)a=Math.max(0,.9*(1-(p.y-FH*.7)/(FH*.2)));
      if(p.c){ctx.globalAlpha=a;ctx.drawImage(glow,p.x-glow.width/2,p.y-glow.height/2);ctx.globalAlpha=1}
      else{ctx.fillStyle=`rgba(245,241,232,${a*.7})`;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,6.283);ctx.fill()}
      if(p.y>FH*.9)Object.assign(p,mk(false));
    }
    requestAnimationFrame(frame);
  }
  size();addEventListener('resize',()=>{size()});
  addEventListener('pointermove',e=>{const r=cv.getBoundingClientRect();mx=e.clientX-r.left;my=e.clientY-r.top},{passive:true});
  function setOn(on){if(on===run)return;run=on;cv.style.display=on?'':'none';if(on)requestAnimationFrame(frame)}
  addEventListener('scroll',()=>setOn(scrollY<FH+80),{passive:true});
  setOn(scrollY<FH+80);
})();

(function estimator(){
  const rng=$('#budget');if(!rng)return;
  const avg=a=>a.reduce((x,y)=>x+y,0)/a.length;
  /* cost per result (AED) from the campaigns listed above; the AED 4.17 sustainability campaign is left out of the lead average on purpose so the estimate stays conservative */
  const DATA={msg:{costs:[38.10,14.60,35.52]},lead:{costs:[59.41,42.78]}};
  let type='msg',shown=0,target=0,raf=0;
  const fmt=n=>NF.format(Math.round(n));
  const ar=()=>root.lang==='ar';
  function calc(){
    const b=+rng.value,c=DATA[type].costs,lo=Math.min(...c),hi=Math.max(...c),av=avg(c);
    return{b,typ:b/av,min:b/hi,max:b/lo,cpr:av};
  }
  function render(){
    const r=calc();
    $('#budgetVal').textContent=fmt(r.b);
    rng.style.setProperty('--v',((r.b-rng.min)/(rng.max-rng.min)*100)+'%');
    $('#estUnit').textContent=type==='msg'?(ar()?'محادثة':'conversations'):(ar()?'عميل محتمل':'leads');
    $('#estCpr').textContent='AED '+fmt(r.cpr);
    $('#estRange').textContent=fmt(r.min)+' – '+fmt(r.max);
    const goal=type==='msg'?(ar()?'رسائل':'messages'):(ar()?'عملاء محتملين':'leads');
    const txt=ar()?`أهلًا كريم، أريد خطة لحملة ${goal} بميزانية ${fmt(r.b)} درهم.`:`Hi Karim, I would like a plan for a ${goal} campaign with a budget of AED ${fmt(r.b)}.`;
    $('#estCta').href='https://wa.me/971527366719?text='+encodeURIComponent(txt);
    target=r.typ;
    if(reduce){shown=target;$('#estBig').textContent='≈ '+fmt(shown)}else if(!raf)raf=requestAnimationFrame(tween);
  }
  function tween(){
    shown+=(target-shown)*.14;
    if(Math.abs(target-shown)<.5){shown=target;raf=0}else raf=requestAnimationFrame(tween);
    $('#estBig').textContent='≈ '+fmt(shown);
  }
  $('#estShare')?.addEventListener('click',async()=>{
    const r=calc(),a=ar(),W=1080,H=1080,c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');
    try{await Promise.all([document.fonts.load('900 100px Inter'),document.fonts.load('800 40px Cairo')])}catch(e){}
    const g=x.createLinearGradient(0,0,W,H);g.addColorStop(0,'#050505');g.addColorStop(1,'#12170a');x.fillStyle=g;x.fillRect(0,0,W,H);
    x.fillStyle='rgba(215,255,95,.10)';x.beginPath();x.arc(W*.85,H*.12,360,0,6.283);x.fill();
    const fam=a?'Cairo, Inter, sans-serif':'Inter, Cairo, sans-serif',X=a?W-90:90;
    x.textAlign=a?'right':'left';x.direction=a?'rtl':'ltr';
    x.fillStyle='#d7ff5f';x.font='800 36px '+fam;x.fillText(a?'تقدير الحملة':'CAMPAIGN ESTIMATE',X,130);
    x.direction='ltr';x.fillStyle='#f5f1e8';x.font='900 250px Inter, sans-serif';x.fillText('≈ '+fmt(r.typ),X,430);
    x.direction=a?'rtl':'ltr';x.font='800 58px '+fam;x.fillText(type==='msg'?(a?'محادثة':'conversations'):(a?'عميل محتمل':'leads'),X,520);
    const rows=[[a?'الميزانية':'Budget','AED '+fmt(r.b)],[a?'التكلفة المعتادة للنتيجة':'Typical cost per result','AED '+fmt(r.cpr)],[a?'النطاق':'Range',fmt(r.min)+' – '+fmt(r.max)]];
    rows.forEach((row,i)=>{const y=640+i*92;x.fillStyle='rgba(245,241,232,.14)';x.fillRect(90,y-58,W-180,2);x.fillStyle='#9d9a92';x.font='700 34px '+fam;x.direction=a?'rtl':'ltr';x.textAlign=a?'right':'left';x.fillText(row[0],X,y);x.fillStyle='#f5f1e8';x.font='900 44px Inter, sans-serif';x.direction='ltr';x.textAlign=a?'left':'right';x.fillText(row[1],a?90:W-90,y)});
    x.textAlign=a?'right':'left';x.direction=a?'rtl':'ltr';x.fillStyle='#9d9a92';x.font='600 28px '+fam;
    x.fillText(a?'تقدير مبني على حملات سابقة وليس ضمانًا':'Estimate based on past campaigns, not a guarantee',X,990);
    x.fillStyle='#d7ff5f';x.font='800 30px Inter, sans-serif';x.direction='ltr';x.fillText('Karim Atef · kx121999.github.io/Karim-atef-cv',X,1036);
    c.toBlob(async b=>{
      const file=new File([b],'campaign-estimate.png',{type:'image/png'});
      try{
        if(navigator.canShare&&navigator.canShare({files:[file]})){await navigator.share({files:[file],title:'Karim Atef',text:a?'تقدير حملتي':'My campaign estimate'});}
        else{const l=document.createElement('a');l.href=URL.createObjectURL(b);l.download='campaign-estimate.png';document.body.appendChild(l);l.click();l.remove();setTimeout(()=>URL.revokeObjectURL(l.href),2000)}
      }catch(err){}
      track('estimate_share',{type});
    },'image/png');
  });
  rng.addEventListener('input',render);
  $$('.seg button').forEach(b=>b.addEventListener('click',()=>{type=b.dataset.t;$$('.seg button').forEach(x=>x.classList.toggle('on',x===b));render()}));
  new MutationObserver(render).observe(root,{attributes:true,attributeFilter:['lang']});
  render();
})();

(function process(){
  const line=$('#processLine');if(!line)return;
  const steps=$$('.step',line);
  function upd(){
    const r=line.getBoundingClientRect(),vh=innerHeight;
    const p=Math.min(Math.max((vh*.8-r.top)/(Math.max(r.height,200)+vh*.25),0),1);
    line.style.setProperty('--p',p);
    steps.forEach((s,i)=>s.classList.toggle('on',p>=(i+.4)/steps.length*.9));
  }
  let near=false,tk=false;
  new IntersectionObserver(es=>{near=es[0].isIntersecting;if(near)requestAnimationFrame(upd)},{rootMargin:'60% 0px'}).observe(line);
  addEventListener('scroll',()=>{if(near&&!tk){tk=true;requestAnimationFrame(()=>{tk=false;upd()})}},{passive:true});
})();

(function videoPreview(){
  if(!matchMedia('(hover:hover) and (pointer:fine)').matches||reduce)return;
  $$('.video-card').forEach(card=>{
    const v=$('video',card);if(!v)return;
    let user=false;
    card.addEventListener('pointerdown',()=>{user=true});
    card.addEventListener('pointerenter',()=>{if(user||!v.paused)return;v.muted=true;v.loop=true;v.play().then(()=>card.classList.add('live')).catch(()=>{})});
    card.addEventListener('pointerleave',()=>{card.classList.remove('live');if(!user){v.pause();v.currentTime=0;v.loop=false;v.muted=false}});
    v.addEventListener('ended',()=>{user=false});
    v.addEventListener('pause',()=>{if(user&&v.paused&&!v.seeking)user=false});
  });
})();

/* ---------- campaign filter + contact form ---------- */
(function filter(){
  const btns=$$('.filters button');if(!btns.length)return;
  const cards=$$('.project-card[data-cat]');
  btns.forEach(b=>b.addEventListener('click',()=>{
    btns.forEach(x=>x.classList.toggle('on',x===b));
    const f=b.dataset.f;
    cards.forEach(c=>{
      const show=f==='all'||c.dataset.cat.split(' ').includes(f);
      clearTimeout(c._t);
      if(show){c.style.display='';requestAnimationFrame(()=>requestAnimationFrame(()=>c.classList.remove('fhide')))}
      else{c.classList.add('fhide');c._t=setTimeout(()=>{c.style.display='none'},360)}
    });
  }));
})();
(function form(){
  const f=$('#cform');if(!f)return;
  const ar=()=>root.lang==='ar';
  const err=$('#cfErr');
  const t=(en,a)=>ar()?a:en;
  f.addEventListener('click',e=>{
    const b=e.target.closest('[data-via]');if(!b)return;
    const name=f.name.value.trim(),msg=f.msg.value.trim(),need=f.need.value;
    [f.name,f.msg].forEach(x=>x.classList.remove('bad'));
    const missing=[!name&&f.name,!msg&&f.msg].filter(Boolean);
    if(missing.length){
      missing.forEach(x=>x.classList.add('bad'));missing[0].focus();
      err.textContent=t('Please add your name and a short message.','من فضلك اكتب اسمك ورسالة قصيرة.');return;
    }
    err.textContent='';
    const body=`Hi Karim, I am ${name}.\nI need: ${need}.\n\n${msg}`;
    if(b.dataset.via==='wa')window.open('https://wa.me/971527366719?text='+encodeURIComponent(body),'_blank','noopener');
    else location.href='mailto:kx121999@gmail.com?subject='+encodeURIComponent('Portfolio inquiry: '+need)+'&body='+encodeURIComponent(body);
  });
  new MutationObserver(()=>{err.textContent=''}).observe(root,{attributes:true,attributeFilter:['lang']});
})();

/* ---------- reel ring + cinematic story ---------- */
(function ring(){
  const stage=$('#ringStage'),r=$('#ring');if(!stage)return;
  const cards=$$('.rc',r),step=360/cards.length;
  cards.forEach((c,i)=>c.style.setProperty('--i',i));
  let a=0,v=0,drag=false,lx=0,moved=0,hover=false,vis=false,raf=0;
  const auto=reduce||lite?0:.14;
  let Rr=300,lastOp=1e9,rd=false;
  const readR=()=>{Rr=parseFloat(getComputedStyle(stage).getPropertyValue('--R'))||300};addEventListener('resize',readR);
  function paint(){
    r.style.transform='translateZ('+(-Rr)+'px) rotateX(-7deg) rotateY('+a.toFixed(2)+'deg)';
    if(Math.abs(a-lastOp)<2)return;lastOp=a;
    cards.forEach((c,i)=>{
      const rel=((i*step+a)%360+360)%360,f=(Math.cos(rel*Math.PI/180)+1)/2;
      c.style.opacity=(.18+.82*f).toFixed(2);c.style.zIndex=Math.round(f*10);
    });
  }
  function tick(){
    raf=0;if(!vis)return;
    if(!drag){if(Math.abs(v)>.03){a+=v;v*=.95}else{v=0;if(!hover&&auto)a+=auto}}
    paint();raf=requestAnimationFrame(tick);
  }
  new IntersectionObserver(es=>es.forEach(e=>{vis=e.isIntersecting;r.style.display=vis?'':'none';if(vis&&!rd){rd=true;readR()}if(vis&&!raf)raf=requestAnimationFrame(tick)}),{rootMargin:'250px'}).observe(stage);
  stage.addEventListener('pointerdown',e=>{drag=true;moved=0;v=0;lx=e.clientX;stage.classList.add('drag')});
  addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-lx;lx=e.clientX;moved+=Math.abs(dx);a+=dx*.4;v=dx*.4},{passive:true});
  const up=()=>{drag=false;stage.classList.remove('drag')};
  addEventListener('pointerup',up);addEventListener('pointercancel',up);
  const fine=matchMedia('(hover:hover) and (pointer:fine)').matches&&!reduce&&!lite;
  cards.forEach(c=>{
    const open=()=>{if(moved>6)return;openVideo(c.dataset.src)};
    c.addEventListener('click',open);
    c.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();moved=0;open()}});
    if(fine){
      let vid=null;
      c.addEventListener('pointerenter',()=>{
        hover=true;vid=document.createElement('video');vid.muted=true;vid.loop=true;vid.playsInline=true;vid.src=c.dataset.src;c.appendChild(vid);
        vid.play().then(()=>c.classList.add('live')).catch(()=>{});
      });
      c.addEventListener('pointerleave',()=>{hover=false;c.classList.remove('live');if(vid){vid.pause();vid.removeAttribute('src');vid.remove();vid=null}});
    }
  });
  paint();
})();

(function story(){
  const wrap=$('#story');if(!wrap)return;
  const scenes=$$('.sc',wrap),rows=$$('.dr',wrap),fan=$('.fan',wrap),nav=$$('.story-nav span',wrap),nb=$('.story-nav',wrap);
  const clamp=(x,a=0,b=1)=>Math.min(Math.max(x,a),b);
  const stats=$$('[data-count]',scenes[2]);let counted=false;
  const runStats=()=>{if(counted)return;counted=true;stats.forEach(countUp)};
  if(reduce){
    fan.style.setProperty('--k',1);rows.forEach(d=>d.style.setProperty('--g',1));setTimeout(runStats,0);return;
  }
  let ticking=false;
  function upd(){
    ticking=false;
    const r=wrap.getBoundingClientRect(),span=r.height-innerHeight;
    if(r.bottom<-200||r.top>innerHeight+200)return;
    const p=clamp(-r.top/span);
    nb.style.setProperty('--sp',p);
    let active=0;
    scenes.forEach((sc,i)=>{
      const t=p*3-i;                 /* local progress: 0..1 inside the scene */
      const fin=clamp(t/.16+(i===0?1:0)),fout=i<2?clamp((1-t)/.16):1;
      let o=t<-.01||t>1.01?0:Math.min(fin,fout);
      if(i===0&&t<0)o=1;
      sc.style.opacity=o;
      sc.style.transform='translateY('+((1-fin)*50-(1-fout)*50)+'px) scale('+(.96+.04*o)+')';
      sc.classList.toggle('act',o>.5);sc.classList.toggle('on',o>.01);
      if(o>.5)active=i;
      if(i===0)fan.style.setProperty('--k',clamp(p*3*1.3));
      if(i===1&&t>-.2){rows.forEach((d,k)=>d.style.setProperty('--g',clamp((t-.08-k*.07)/.35)))}
      if(i===2&&t>.12)runStats();
    });
    nav.forEach((n,i)=>n.classList.toggle('on',i===active));
  }
  let near=false;
  new IntersectionObserver(es=>{near=es[0].isIntersecting;if(near)requestAnimationFrame(upd)},{rootMargin:'100% 0px'}).observe(wrap);
  addEventListener('scroll',()=>{if(near&&!ticking){ticking=true;requestAnimationFrame(upd)}},{passive:true});
  addEventListener('resize',()=>{if(near)upd()});
})();

/* ---------- analytics hooks, testimonials, case info, globe ---------- */
const ANALYTICS={provider:'',domain:'',id:''}; /* provider: 'plausible' (set domain) or 'ga4' (set id). Empty = no tracking. */
function track(name,props){
  try{
    if(!ANALYTICS.provider||navigator.doNotTrack==='1')return;
    if(window.plausible)window.plausible(name,{props:props||{}});
    else if(window.gtag)window.gtag('event',name,props||{});
  }catch(e){}
}
(function analytics(){
  const A=ANALYTICS;if(!A.provider)return;
  if(A.provider==='plausible'&&A.domain){
    window.plausible=window.plausible||function(){(window.plausible.q=window.plausible.q||[]).push(arguments)};
    const sc=document.createElement('script');sc.defer=true;sc.dataset.domain=A.domain;sc.src='https://plausible.io/js/script.js';document.head.appendChild(sc);
  }else if(A.provider==='ga4'&&A.id){
    window.dataLayer=window.dataLayer||[];window.gtag=function(){window.dataLayer.push(arguments)};
    const sc=document.createElement('script');sc.async=true;sc.src='https://www.googletagmanager.com/gtag/js?id='+A.id;document.head.appendChild(sc);
    window.gtag('js',new Date());window.gtag('config',A.id);
  }
  document.addEventListener('click',e=>{
    const a=e.target.closest('a');if(!a)return;
    const h=a.getAttribute('href')||'';
    if(a.hasAttribute('download'))track('cv_download',{lang:root.lang});
    else if(h.includes('wa.me'))track('whatsapp_click',{lang:root.lang});
    else if(h.startsWith('mailto:'))track('email_click');
    else if(h.includes('linkedin.com'))track('linkedin_click');
  });
  $('#lang')?.addEventListener('click',()=>track('language_switch',{to:root.lang}));
  $$('.filters button').forEach(b=>b.addEventListener('click',()=>track('campaign_filter',{filter:b.dataset.f})));
  $$('.seg button').forEach(b=>b.addEventListener('click',()=>track('estimator_goal',{goal:b.dataset.t})));
  $('#cform')?.addEventListener('click',e=>{const b=e.target.closest('[data-via]');if(b)track('form_send',{via:b.dataset.via})});
  $$('.rc').forEach(c=>c.addEventListener('click',()=>track('reel_open',{reel:c.dataset.src})));
})();

(function testimonials(){
  /* Add real, approved testimonials here, for example:
     {quote:'...',name:'Client name',role:'Company',quoteAr:'...'} */
  const TESTIMONIALS=[];
  const sec=$('#voices'),grid=$('#voicesGrid');if(!sec||!TESTIMONIALS.length)return;
  const ar=()=>root.lang==='ar';
  function render(){grid.innerHTML=TESTIMONIALS.map(t=>`<figure class="voice reveal show"><p>&ldquo;${(ar()&&t.quoteAr)||t.quote}&rdquo;</p><b>${t.name}</b><span>${t.role||''}</span></figure>`).join('')}
  render();sec.hidden=false;
  new MutationObserver(render).observe(root,{attributes:true,attributeFilter:['lang']});
})();

function caseInfo(card){
  const ar=root.lang==='ar',num=t=>parseFloat(String(t).replace(/[^0-9.]/g,''));
  const all=$$('.project-card[data-cat]');
  const get=c=>{const m=$$('.metrics b',c);return{res:num(m[0].textContent),cpr:num(m[1].textContent),budget:num(m[2].textContent),kind:c.dataset.cat.includes('leads')?'leads':'messages'}};
  const me=get(card),all2=all.map(get);
  const same=all2.filter(x=>x.kind===me.kind).sort((a,b)=>a.cpr-b.cpr);
  const rank=same.findIndex(x=>x.cpr===me.cpr)+1;
  const total=all2.reduce((a,b)=>a+b.budget,0);
  const f=n=>Math.round(n).toLocaleString('en-US');
  const L=ar?{res:me.kind==='leads'?'عميل محتمل':'محادثة',cpr:'تكلفة النتيجة',bud:'الميزانية',rank:'ترتيب التكلفة بين حملات '+(me.kind==='leads'?'العملاء المحتملين':'الرسائل'),of:'من',share:'من ميزانية الحملات المعروضة'}:{res:me.kind==='leads'?'leads':'conversations',cpr:'Cost per result',bud:'Budget',rank:'Cost rank among '+(me.kind==='leads'?'lead':'message')+' campaigns',of:'of',share:'of the budget across the six campaigns shown'};
  const story=card.dataset.story?`<p>${card.dataset.story}</p>`:'';
  const cs=card.dataset.case?`<p><a class="foot-link" href="${ar?'ar/':''}${card.dataset.case}">${ar?'اقرأ دراسة الحالة ←':'Read the case study →'}</a></p>`:'';
  return `<div><b>${f(me.res)}</b><span>${L.res}</span></div><div><b>AED ${me.cpr.toFixed(2)}</b><span>${L.cpr}</span></div><div><b>AED ${f(me.budget)}</b><span>${L.bud} · ${Math.round(me.budget/total*100)}% ${L.share}</span></div><div><b>#${rank} ${L.of} ${same.length}</b><span>${L.rank} (1 = ${ar?'الأقل':'lowest'})</span></div>${story}${cs}`;
}

(function globe(){
  const cv=$('#globe');if(!cv)return;
  const MASK='AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP//7//wAAAAAAAAAAAAAAAAAAAAAAB//////4AA/gAAAADgAAAAAAAAAAAHP//////4AA/gAAAAD+AAAAAAAAAAD/v/8////4AA/gAA4ADf4AGAAAAAAAH///4A///4AAAAAG4Af/8AH4AAAAAAH///+Af//wAAAAAeD////+H4AAwH/gf////4P//wAAD8AeH///////wRw//////9/4P//AAAP/nP//////////+///////3+H/wuAAf//////////////////////+H/A+AB//////////////jf/////7/8D8A8AP//////////////A//////gf8B4AAAP/////////////8A/8f///wP+AAAAGP5///////////fQAHwB///8H/AAAAPD7/////////8B8AAGAB////v/wAAAfD//////////9B8AAAAB//////4AAAfv///////////B4AAAAAf/////4AAAX////////////AwAAAAAf/////8AAAH////////////AAAAAAAH/////8AAAH////////////AAAAAAAD/////gAAAB//7////////7gAAAAAAH////8AAAAf//7f///////3gAAAAAAH////wAAAAfy/////////+HAAAAAAAD///+AAAAAfi/////////+GAAAAAAAD///+AAAAAf/7////////+OAAAAAAAB///+AAAAAP/Bz///////n+AAAAAAAA///4AAAAAf/zB///////jwAAAAAAAAf//wAAAAAf//////////hAAAAAAAAAP/9wAAAAB///////////gAAAAAAAAAP/A8AAAAD///////////gAAAAAAAAAH/AcAAAAD///////////gAAAAACAAAD/BcAAAAH//////H///+gAAAAADgAAAfPeAAAAH//////B///wgAAAAABgAAAf+OsAAAH////v+A/j/wwAAAAAAAAAAP+EsAAAH/////+A/B/hwAAAAAAAAAABfgAAAAH/////4A+B/hwAAAAAAAAAAAPgwAAAH/////wAeAfg4AAAAAAAAAAADj/AAAH/////wAcAXh4AAAAAAAAAAAB//gAAD/////wAOAbDcAAAAAAAAAAAAf/4AAB/////gAOAcCcAAAAAAAAAAAAH/+AAAfv///gACA8HIAAAAAAAAAAAAP/+AAAAD///AAAA8/EAAAAAAAAAAAAf//AAAAD//+AAAAe/2AAAAAAAAAAAAf//wAAAD//8AAAAO/38AAAAAAAAAAAf//+AAAD//4AAAAPf3/mAAAAAAAAAAf///gAAB//wAAAAHHw/vAAAAAAAAAAf///gAAA//wAAAADcAX9QAAAAAAAAAP///gAAA//wAAAAAc4PcYAAAAAAAAAP///AAAA//4AAAAAA57cIAAAAAAAAAH///AAAA//5wAAAAAH7AAAAAAAAAAAH//+AAAB//7wAAAAAP7gBAgAAAAAAAB//+AAAB//7wAAAAAf/wBDgAAAAAAAA//+AAAB//jgAAAAB//4ADAAAAAAAAA//8AAAA//HgAAAAH//4BAAAAAAAAAA//8AAAAf/HAAAAAP//8BAAAAAAAAAA//gAAAAf/HAAAAAP//+AAAAAAAAAAA//AAAAAf+AAAAAAP//+AAAAAAAAAAA//AAAAAP+AAAAAAH//+AAAAAAAAAAA/+AAAAAP8AAAAAAH//+AAAAAAAAAAA/8AAAAAP4AAAAAAH8/+AAAAAAAAAAB/8AAAAAGAAAAAAAHQf8AMgAAAAAAAB/wAAAAAAAAAAAAAAAH8APgAAAAAAAB/wAAAAAAAAAAAAAAADwAPAAAAAAAAD+AAAAAAAAAAAAAAAAA4AeAAAAAAAAD+AAAAAAAAAAAAAAAAA4A4AAAAAAAAD8AAAAAAAAAAAAAAAAAABwAAAAAAAAD8AAAAAAAAAAAAAAAAAABgAAAAAAAAD8AAAAAAAAAAAAAAAAAAAAAAAAAAAADxgAAAAAAAAAAAAAAAAAAAAAAAAAAAD5gAAAAAAAAAAAAAAAAAAAAAAAAAAAB4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
  const by=Uint8Array.from(atob(MASK),c=>c.charCodeAt(0));
  const land=(lon,lat)=>{const x=Math.floor(((lon+180)%360)/2),y=Math.floor((90-lat)/2);if(y<0||y>89)return 0;const i=y*180+x;return (by[i>>3]>>(7-(i&7)))&1};
  const D=Math.PI/180,pts=[];
  for(let lat=-58;lat<=84;lat+=3){const n=Math.max(1,Math.round(360*Math.cos(lat*D)/3));for(let i=0;i<n;i++){const lon=-180+i*360/n;if(land(lon,lat))pts.push([lon*D,lat*D])}}
  const UAE=[54.4*D,24.4*D];
  const CITIES=[[-0.13,51.5],[2.35,48.9],[28.98,41.0],[72.8,19.1],[36.8,-1.3],[103.8,1.35],[31.2,30.0],[46.7,24.7],[77.2,28.6],[18.4,-33.9]].map(c=>[c[0]*D,c[1]*D]);
  const vec=(l,p)=>[Math.cos(p)*Math.sin(l),Math.sin(p),Math.cos(p)*Math.cos(l)];
  const ctx=cv.getContext('2d');let W=0,H=0,R=0,dpr=1,vis=false,raf=0,off=0,drag=false,lx=0,t0=performance.now();
  const tilt=26*D,ct=Math.cos(tilt),st=Math.sin(tilt);
  function size(){const r=cv.getBoundingClientRect();dpr=Math.min(devicePixelRatio||1,2);W=r.width;H=r.height;cv.width=W*dpr;cv.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);R=Math.min(W*.5,H*.5)*.94}
  function proj(l,p,lift,l0){
    const dl=l-l0,cp=Math.cos(p),x=cp*Math.sin(dl),y0=Math.sin(p),z0=cp*Math.cos(dl);
    const y=ct*y0-st*z0,z=st*y0+ct*z0,k=1+(lift||0);
    return[x*k,y*k,z*k];
  }
  function slerp(a,b,t){
    const dot=Math.min(1,a[0]*b[0]+a[1]*b[1]+a[2]*b[2]),om=Math.acos(dot),so=Math.sin(om)||1;
    const s1=Math.sin((1-t)*om)/so,s2=Math.sin(t*om)/so;return[a[0]*s1+b[0]*s2,a[1]*s1+b[1]*s2,a[2]*s1+b[2]*s2];
  }
  function frame(now){
    raf=0;if(!vis)return;
    const tt=now-t0;
    if(!drag)off*=.96;
    const l0=UAE[0]-.35+Math.sin(tt*.00028)*.5+off;
    ctx.clearRect(0,0,W,H);
    const cx=W*.62,cy=H*.5;
    const g=ctx.createRadialGradient(cx-R*.3,cy-R*.3,R*.1,cx,cy,R);g.addColorStop(0,'rgba(215,255,95,.035)');g.addColorStop(.6,'rgba(8,8,8,.96)');g.addColorStop(1,'rgba(3,3,3,1)');
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(cx,cy,R,0,6.283);ctx.fill();
    ctx.strokeStyle='rgba(215,255,95,.28)';ctx.lineWidth=1;ctx.stroke();
    for(const q of pts){const v=proj(q[0],q[1],0,l0);if(v[2]<=0)continue;ctx.fillStyle='rgba(245,241,232,'+(.18+v[2]*.62).toFixed(2)+')';ctx.fillRect(cx+v[0]*R-1,cy-v[1]*R-1,2,2)}
    const u=vec(UAE[0],UAE[1]);
    CITIES.forEach((c,i)=>{
      const a=vec(c[0],c[1]);
      ctx.beginPath();let started=false;
      for(let k=0;k<=24;k++){
        const tk=k/24,m=slerp(a,u,tk),lift=Math.sin(tk*Math.PI)*.3,L=Math.atan2(m[0],m[2]),P=Math.asin(m[1]);
        const v=proj(L,P,lift,l0);
        if(v[2]<-.02){started=false;continue}
        const X=cx+v[0]*R,Y=cy-v[1]*R;
        if(!started){ctx.moveTo(X,Y);started=true}else ctx.lineTo(X,Y);
      }
      ctx.strokeStyle='rgba(215,255,95,.35)';ctx.lineWidth=1;ctx.stroke();
      const tp=((tt*.00035)+i*.19)%1,m=slerp(a,u,tp),L=Math.atan2(m[0],m[2]),P=Math.asin(m[1]),v=proj(L,P,Math.sin(tp*Math.PI)*.3,l0);
      if(v[2]>0){ctx.fillStyle='#d7ff5f';ctx.beginPath();ctx.arc(cx+v[0]*R,cy-v[1]*R,2.2,0,6.283);ctx.fill()}
      const sv=proj(c[0],c[1],0,l0);if(sv[2]>0){ctx.fillStyle='rgba(245,241,232,.9)';ctx.beginPath();ctx.arc(cx+sv[0]*R,cy-sv[1]*R,2,0,6.283);ctx.fill()}
    });
    const pv=proj(UAE[0],UAE[1],0,l0);
    if(pv[2]>0){
      const X=cx+pv[0]*R,Y=cy-pv[1]*R,pulse=(tt%1800)/1800;
      ctx.strokeStyle='rgba(215,255,95,'+(1-pulse).toFixed(2)+')';ctx.lineWidth=2;ctx.beginPath();ctx.arc(X,Y,6+pulse*30,0,6.283);ctx.stroke();
      ctx.fillStyle='#d7ff5f';ctx.shadowColor='#d7ff5f';ctx.shadowBlur=14;ctx.beginPath();ctx.arc(X,Y,5,0,6.283);ctx.fill();ctx.shadowBlur=0;
    }
    raf=requestAnimationFrame(frame);
  }
  let sized=false;addEventListener('resize',()=>{if(sized)size()});
  const wrap=cv.parentElement;
  wrap.addEventListener('pointerdown',e=>{drag=true;lx=e.clientX});
  addEventListener('pointermove',e=>{if(!drag)return;off-=(e.clientX-lx)*.006;lx=e.clientX},{passive:true});
  addEventListener('pointerup',()=>{drag=false});addEventListener('pointercancel',()=>{drag=false});
  new IntersectionObserver(es=>es.forEach(e=>{vis=e.isIntersecting;if(vis&&!sized){sized=true;size()}if(vis&&!raf)raf=requestAnimationFrame(frame)}),{rootMargin:'200px'}).observe(cv);
  if(reduce){sized=true;size();vis=true;frame(performance.now());vis=false}
})();

/* ---------- performance helpers ---------- */
(function perf(){
  const tk=$('.tickers');
  if(tk)new IntersectionObserver(es=>es.forEach(e=>tk.classList.toggle('off',!e.isIntersecting)),{rootMargin:'100px'}).observe(tk);
  const b=$('#liteBtn');if(!b)return;
  const label=()=>{const ar=root.lang==='ar';b.textContent=lite?(ar?'وضع خفيف: يعمل':'Lite mode: on'):(ar?'وضع خفيف: متوقف':'Lite mode: off');b.setAttribute('aria-pressed',lite)};
  label();
  b.addEventListener('click',()=>{try{localStorage.setItem('lite',lite?'0':'1')}catch(e){}location.reload()});
  new MutationObserver(label).observe(root,{attributes:true,attributeFilter:['lang']});
})();

/* ---------- video-filled name + present mode ---------- */
(function vname(){
  const box=$('#vname');if(!box)return;
  const v=$('video',box),saveData=navigator.connection&&navigator.connection.saveData;
  if(lite||reduce||saveData)return;
  let started=false;
  function start(){
    if(started)return;started=true;
    v.src='video-5.mp4';v.play().then(()=>box.classList.add('play')).catch(()=>{});
  }
  const go=()=>setTimeout(()=>{(window.requestIdleCallback||setTimeout)(start)},1800);
  if(document.readyState==='complete')go();else addEventListener('load',go);
  new IntersectionObserver(es=>es.forEach(e=>{if(!started)return;if(e.isIntersecting)v.play().catch(()=>{});else v.pause()}),{rootMargin:'60px'}).observe(box);
})();

(function present(){
  const ov=$('#present');if(!ov)return;
  const stage=$('#psStage'),dotsEl=$('#psDots'),count=$('#psCount');
  const T=el=>el?el.textContent.trim():'';
  const lab=el=>el?(el.getAttribute('aria-label')||el.textContent.trim()):'';
  const fin=b=>b.dataset.count?(+b.dataset.count).toFixed(+b.dataset.dec||0)+(b.dataset.suffix||''):T(b);
  const sec=(id,cls)=>`<small>${T($('#'+id+' .eyebrow'))}</small><h2>${lab($('#'+id+' .section-title'))}</h2>`;
  function build(){
    const S=[];
    S.push(`<small>${T($('.hero-kicker'))}</small><h1>${lab($('.big-name h1'))}</h1><p class="lead">${T($('.role-title'))}</p><div class="ps-contact"><span>${T($('.phone-link'))}</span><span>${T($('.contact-actions a[href^="mailto"]'))}</span></div>`);
    S.push(sec('services')+`<div class="pgrid g3">${$$('.service').map(x=>`<div class="pc"><b class="sm">${T($('.service-num',x))}</b><h3>${T($('h3',x))}</h3><p>${T($('p',x))}</p><ul>${$$('li',x).map(l=>`<li>${T(l)}</li>`).join('')}</ul></div>`).join('')}</div>`);
    S.push(`<small>${T($('.sc3 .cap'))}</small><h2>${T($('.sc3 .big'))}</h2><div class="pgrid g5">${$$('.bigstats > div').map(x=>`<div class="pc"><b>${fin($('b',x))}</b><span class="lbl">${T($('span',x))}</span></div>`).join('')}</div>`);
    const hd=$$('.dtable .dh span').map(T);
    S.push(`<small>${T($('.dash-top em'))}</small><h2>${T($('.dash-top b'))}</h2><div class="ptable"><div class="r h"><span>${hd[0]}</span><span>${hd[1]}</span><span>${hd[2]}</span></div>${$$('.dr').map(r=>`<div class="r"><b>${T($('.dn',r))}</b><span class="bar"><u style="--w:${r.style.getPropertyValue('--w')}"></u><b>${T($('.db b',r))}</b></span><b>${T($('.dc b',r))}</b></div>`).join('')}</div>`);
    S.push(sec('process')+`<div class="pgrid g4">${$$('.step').map(x=>`<div class="pc"><b class="sm">${T($('b',x))}</b><h3>${T($('h3',x))}</h3><p>${T($('p',x))}</p></div>`).join('')}</div>`);
    S.push(sec('experience')+`<div class="pgrid g2">${$$('.exp-row').map(x=>`<div class="pc"><b class="sm">${T($('time',x))}</b><h3>${T($('h3',x))}</h3><p>${T($('p',x))}</p></div>`).join('')}</div>`);
    S.push(`<small>${T($('#contact .eyebrow'))||''}</small><h1>${lab($('.contact-panel h2'))}</h1><div class="ps-contact">${$$('.contact-actions a').map(a=>`<span>${T(a)}</span>`).join('')}</div>`);
    return S;
  }
  let i=0,n=0,open=false;
  function show(k){
    i=Math.max(0,Math.min(n-1,k));
    $$('.ps',stage).forEach((s,j)=>{s.classList.toggle('on',j===i);s.classList.toggle('past',j<i)});
    $$('i',dotsEl).forEach((d,j)=>d.classList.toggle('on',j===i));
    count.textContent=(i+1)+' / '+n;
  }
  function openP(){
    const S=build();n=S.length;
    stage.innerHTML=S.map(h=>`<section class="ps">${h}</section>`).join('');
    dotsEl.innerHTML=S.map((_,j)=>`<i data-i="${j}"></i>`).join('');
    ov.hidden=false;open=true;document.body.style.overflow='hidden';
    show(0);ov.focus&&ov.setAttribute('tabindex','-1');ov.focus();
    try{if(ov.requestFullscreen&&!document.fullscreenElement)ov.requestFullscreen().catch(()=>{})}catch(e){}
    track('present_open',{lang:root.lang});
  }
  function closeP(){
    if(!open)return;open=false;wasFs=false;ov.hidden=true;document.body.style.overflow='';
    try{if(document.fullscreenElement)document.exitFullscreen()}catch(e){}
  }
  $('#presentBtn')?.addEventListener('click',openP);
  $('#menuPresent')?.addEventListener('click',e=>{e.preventDefault();toggleMenu(false);openP()});
  $('#psClose').addEventListener('click',closeP);
  dotsEl.addEventListener('click',e=>{const d=e.target.closest('i');if(d)show(+d.dataset.i)});
  stage.addEventListener('click',e=>{if(e.target.closest('a,button'))return;const r=stage.getBoundingClientRect();const left=e.clientX<r.left+r.width/2;const rtl=root.dir==='rtl';show(i+((left!==rtl)?-1:1))});
  let sx=null;
  stage.addEventListener('touchstart',e=>{sx=e.touches[0].clientX},{passive:true});
  stage.addEventListener('touchend',e=>{if(sx===null)return;const dx=e.changedTouches[0].clientX-sx;sx=null;if(Math.abs(dx)>50){const rtl=root.dir==='rtl';show(i+((dx<0)!==rtl?1:-1))}});
  let wasFs=false;
  document.addEventListener('fullscreenchange',()=>{if(document.fullscreenElement)wasFs=true;else if(open&&wasFs){wasFs=false;closeP()}});
  addEventListener('keydown',e=>{
    const tag=(e.target.tagName||'').toLowerCase();
    if(!open){if((e.key==='p'||e.key==='P')&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&!['input','textarea','select'].includes(tag)&&!$('#lightbox').classList.contains('open')){openP()}return}
    const rtl=root.dir==='rtl';
    if(e.key==='Escape')closeP();
    else if(e.key==='ArrowRight')show(i+(rtl?-1:1));
    else if(e.key==='ArrowLeft')show(i+(rtl?1:-1));
    else if(e.key===' '||e.key==='PageDown')(e.preventDefault(),show(i+1));
    else if(e.key==='PageUp')show(i-1);
    else if(e.key==='Home')show(0);
    else if(e.key==='End')show(n-1);
  });
})();


/* ---------- shared API + lazy tools module (tools.js) ---------- */
const fmtN=n=>NF.format(Math.round(n));
const WA='https://wa.me/971527366719?text=';
const KC=window.KC={$,$$,reduce,root,lite,NF,fmtN,WA,track};
const isTyping=t=>['input','textarea','select'].includes((t.tagName||'').toLowerCase())||t.isContentEditable;
/* jump to a section, then re-align once scrolling stops (sections below the fold are not laid out until needed, so their real height can differ from the estimate) */
function goTo(el,smooth=true){
  if(!el)return;
  const top=()=>Math.round(scrollY+el.getBoundingClientRect().top);
  let tries=0,t;
  const stop=()=>{clearTimeout(t);removeEventListener('scroll',settle);removeEventListener('wheel',stop);removeEventListener('touchstart',stop);removeEventListener('keydown',stop)};
  const settle=()=>{
    clearTimeout(t);
    t=setTimeout(()=>{
      if(Math.abs(top()-scrollY)>3&&tries++<4)scrollTo({top:top(),behavior:'instant'});
      else stop();
    },140);
  };
  addEventListener('scroll',settle,{passive:true});
  addEventListener('wheel',stop,{passive:true,once:true});
  addEventListener('touchstart',stop,{passive:true,once:true});
  addEventListener('keydown',stop,{once:true});
  scrollTo({top:top(),behavior:smooth&&!reduce?'smooth':'instant'});
  settle();
}
KC.goTo=goTo;
document.addEventListener('click',e=>{
  const a=e.target.closest&&e.target.closest('a[href]');
  if(!a||e.defaultPrevented||e.ctrlKey||e.metaKey||e.shiftKey||e.button)return;
  /* same-page links only: "#id", or "ar/#id" on the Arabic page (its <base> points at the site root) */
  if(a.origin!==location.origin||a.pathname.replace(/index\.html$/,'')!==location.pathname.replace(/index\.html$/,'')||a.hash.length<2)return;
  const el=document.getElementById(decodeURIComponent(a.hash.slice(1)));if(!el||el.hidden)return;
  e.preventDefault();goTo(el);
  if(el.getAttribute('tabindex')==='-1')el.focus({preventScroll:true});
  try{history.pushState(null,'',location.pathname+a.hash)}catch(_){}
});
if(location.hash.length>1)addEventListener('load',()=>setTimeout(()=>{const el=document.getElementById(decodeURIComponent(location.hash.slice(1)));if(el)goTo(el,false)},350));
const stubKey=e=>{
  const k=e.key.toLowerCase();
  if(((e.ctrlKey||e.metaKey)&&k==='k')||(k==='/'&&!e.ctrlKey&&!e.metaKey&&!isTyping(e.target))){
    e.preventDefault();KC.load().then(()=>KC.openPalette&&KC.openPalette());
  }
};
const stubBtn=()=>KC.load().then(()=>KC.openPalette&&KC.openPalette());
KC.load=()=>KC._p||(KC._p=new Promise(res=>{
  const s=document.createElement('script');s.src='tools.js';
  s.onload=()=>{removeEventListener('keydown',stubKey);$('#ckBtn')?.removeEventListener('click',stubBtn);res()};
  s.onerror=()=>{KC._p=null;res()};
  document.head.appendChild(s);
}));
/* keep Tab inside whichever dialog is open */
addEventListener('keydown',e=>{
  if(e.key!=='Tab')return;
  const d=$('#lightbox.open')||$('#present:not([hidden])')||$('#cmdk:not([hidden])');if(!d)return;
  const f=$$('a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])',d).filter(x=>x.offsetParent!==null||x===document.activeElement);
  if(!f.length)return;
  const a=f[0],z=f[f.length-1];
  if(!d.contains(document.activeElement)){e.preventDefault();a.focus()}
  else if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus()}
  else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus()}
});
addEventListener('keydown',stubKey);
$('#ckBtn')?.addEventListener('click',stubBtn);
{
  const io=new IntersectionObserver(es=>{if(es.some(e=>e.isIntersecting)){io.disconnect();KC.load()}},{rootMargin:'1400px 0px'});
  ['#audit','#planner','#studio','#hooks','#book'].forEach(s=>{const el=$(s);if(el)io.observe(el)});
  addEventListener('load',()=>('requestIdleCallback' in window?requestIdleCallback(KC.load,{timeout:7000}):setTimeout(KC.load,4000)));
}



if('serviceWorker' in navigator&&/^https?:$/.test(location.protocol)){addEventListener('load',()=>{navigator.serviceWorker.register('sw.js').catch(()=>{})})}

/* loader counter, then start hero */
const count=$('.loader-count b');
const ready=()=>root.classList.add('ready');
if(reduce||root.classList.contains('seen')){ready()}else{
  const t0=performance.now(),D=1000;
  (function tick(t){
    const p=Math.min((t-t0)/D,1);
    count.textContent=Math.round(100*(1-Math.pow(1-p,3)));
    if(p<1)requestAnimationFrame(tick);
  })(t0);
  setTimeout(ready,1100);
  try{sessionStorage.setItem('intro','1')}catch(e){}
}

/* reveal with stagger + variants */
$$('.stats,.services-grid,.experience-list').forEach(g=>{
  g.classList.remove('reveal');
  [...g.children].forEach(c=>c.classList.add('reveal'));
});
const cc=$('.creative-center');
if(cc){
  cc.classList.remove('reveal');
  const [a,b]=cc.children;
  a.classList.add('reveal');a.dataset.anim='left';
  b.classList.add('reveal');b.dataset.anim='right';
}
$('.about-photo')?.setAttribute('data-anim','left');
$('.about-text')?.setAttribute('data-anim','right');
$$('.stat').forEach(s=>s.dataset.anim='zoom');
$$('.project-grid,.design-grid,.video-grid,.stats,.services-grid,.experience-list').forEach(g=>{
  [...g.children].forEach((el,i)=>el.style.setProperty('--d',(i%4)*.11+'s'));
});

const counted=new WeakSet();
function countUp(b){
  if(counted.has(b))return;counted.add(b);
  const end=+b.dataset.count,suf=b.dataset.suffix||'',dec=+b.dataset.dec||0;
  if(reduce)return;
  const t0=performance.now(),D=1800;
  (function f(t){
    const p=Math.min((t-t0)/D,1),e=1-Math.pow(1-p,4);
    b.textContent=(end*e).toFixed(dec)+(p<1?'':suf);
    if(p<1)requestAnimationFrame(f);
  })(t0);
}
const io=new IntersectionObserver(es=>es.forEach(e=>{
  if(!e.isIntersecting)return;
  const el=e.target;el.classList.add('show');io.unobserve(el);
  setTimeout(()=>el.classList.add('done'),1300);
  $$('[data-count]',el).forEach(countUp);
  if(el.dataset.count)countUp(el);
}),{threshold:.12,rootMargin:'0px 0px -6% 0px'});
$$('.reveal').forEach(el=>io.observe(el));
$$('[data-count]').forEach(b=>{if(!reduce)b.textContent='0'});

/* scroll: progress, header hide, parallax, active link */
const prog=$('.progress'),header=$('header'),h1lines=$$('.big-name h1 .line');
let lastY=0,ticking=false;
function onScroll(){
  const y=scrollY,max=document.body.scrollHeight-innerHeight;
  prog.style.setProperty('--p',max>0?y/max:0);
  header.classList.toggle('hide',y>lastY&&y>200&&!$('#menu').classList.contains('open'));
  lastY=y;
  if(!reduce){
    const hy=Math.min(y,innerHeight*.8);
    h1lines[0]&&(h1lines[0].style.translate=(-hy*.12)+'px 0');
    h1lines[1]&&(h1lines[1].style.translate=(hy*.12)+'px 0');
  }
  ticking=false;
}
addEventListener('scroll',()=>{if(!ticking){ticking=true;requestAnimationFrame(onScroll)}},{passive:true});
requestAnimationFrame(()=>requestAnimationFrame(onScroll));

const links=$$('.nav-links a');
const sio=new IntersectionObserver(es=>es.forEach(e=>{
  if(e.isIntersecting)links.forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+e.target.id));
}),{rootMargin:'-45% 0px -50% 0px'});
$$('main section[id]').forEach(s=>sio.observe(s));

/* mobile menu */
const burger=$('#burger'),menu=$('#menu');
$$('a',menu).forEach((a,i)=>a.style.setProperty('--i',i));
function toggleMenu(open){
  burger.classList.toggle('open',open);menu.classList.toggle('open',open);
  burger.setAttribute('aria-expanded',open);menu.setAttribute('aria-hidden',!open);
  document.body.style.overflow=open?'hidden':'';
  document.body.classList.toggle('menu-open',open);
}
burger.addEventListener('click',()=>toggleMenu(!menu.classList.contains('open')));
$$('a',menu).forEach(a=>a.addEventListener('click',()=>toggleMenu(false)));

/* pointer effects (fine pointers only) */
if(matchMedia('(hover:hover) and (pointer:fine)').matches&&!reduce&&!lite){
  const cur=$('.cursor');let cx=0,cy=0,tx=0,ty=0,run=0,pend=null;
  function loop(){
    cx+=(tx-cx)*.2;cy+=(ty-cy)*.2;cur.style.transform='translate('+cx+'px,'+cy+'px)';
    run=(Math.abs(tx-cx)>.3||Math.abs(ty-cy)>.3)?requestAnimationFrame(loop):0;
  }
  function onMove(){
    const e=pend;pend=null;if(!e)return;
    const hit=e.target.closest('[data-img],[data-play]');
    cur.classList.toggle('view',!!hit);
    cur.classList.toggle('link',!hit&&!!e.target.closest('a,button,video'));
    const t=e.target.closest('.spot');
    if(t){const r=t.getBoundingClientRect();t.style.setProperty('--mx',e.clientX-r.left+'px');t.style.setProperty('--my',e.clientY-r.top+'px')}
  }
  addEventListener('pointermove',e=>{
    tx=e.clientX;ty=e.clientY;cur.classList.add('on');
    if(!run)run=requestAnimationFrame(loop);
    if(!pend)requestAnimationFrame(onMove);
    pend=e;
  },{passive:true});
  document.addEventListener('pointerleave',()=>cur.classList.remove('on'));

  $$('.tilt').forEach(c=>{
    c.addEventListener('pointermove',e=>{
      const r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
      c.style.setProperty('--ry',x*8+'deg');c.style.setProperty('--rx',-y*8+'deg');
    });
    c.addEventListener('pointerleave',()=>{c.style.setProperty('--rx','0deg');c.style.setProperty('--ry','0deg')});
  });
  $$('.btn,.contact-actions a,.wa').forEach(b=>{
    b.addEventListener('pointermove',e=>{
      const r=b.getBoundingClientRect();
      b.style.setProperty('--tx',(e.clientX-r.left-r.width/2)*.25+'px');
      b.style.setProperty('--ty2',(e.clientY-r.top-r.height/2)*.35+'px');
    });
    b.addEventListener('pointerleave',()=>{b.style.setProperty('--tx','0px');b.style.setProperty('--ty2','0px')});
  });
}

/* videos: one at a time */
const vids=$$('video');
vids.forEach(v=>v.addEventListener('play',()=>vids.forEach(o=>o!==v&&o.pause())));

/* lightbox with prev / next / Esc / arrows */
const lb=$('#lightbox'),boxImg=$('#boxImg');
let group=[],idx=0,lastFocus=null;
function show(i,instant){
  idx=(i+group.length)%group.length;
  const c=group[idx],src=c.dataset.img,alt=$('img',c)?.alt||'Full preview';
  const isCase=c.matches('.project-card');lb.classList.toggle('info',isCase);
  $('#boxInfo').innerHTML=isCase?caseInfo(c):'';
  if(instant){boxImg.src=src;boxImg.alt=alt;return}
  boxImg.classList.add('swap');
  setTimeout(()=>{boxImg.src=src;boxImg.alt=alt;boxImg.classList.remove('swap')},180);
}
function inView(el){const r=el.getBoundingClientRect();return r.bottom>0&&r.top<innerHeight&&r.right>0&&r.left<innerWidth}
let flyer=null;
/* zoom between a card thumbnail and the lightbox image (Web Animations, no snapshots) */
function fly(thumb,inward){
  if(flyer)flyer.cancel();flyer=null;
  if(lite||reduce||!thumb||!inView(thumb))return null;
  const a=thumb.getBoundingClientRect(),b=boxImg.getBoundingClientRect();
  if(!a.width||!b.width)return null;
  const s=`translate(${a.left+a.width/2-(b.left+b.width/2)}px,${a.top+a.height/2-(b.top+b.height/2)}px) scale(${a.width/b.width})`;
  flyer=boxImg.animate(inward?[{transform:s,opacity:0},{opacity:1,offset:.35},{transform:'none',opacity:1}]:[{transform:'none',opacity:1},{transform:s,opacity:0}],{duration:inward?520:340,easing:'cubic-bezier(.2,.8,.2,1)',fill:'both'});
  return flyer;
}
function openBox(card){
  lastFocus=document.activeElement;
  group=$$('[data-img]',card.parentElement).filter(c=>c.style.display!=='none');
  show(group.indexOf(card),true);
  lb.classList.add('open');lb.setAttribute('aria-hidden','false');
  $('#closeBox').focus();
  const thumb=$('img',card);
  if(!lite&&!reduce)boxImg.decode().catch(()=>{}).then(()=>fly(thumb,true));
}
const boxVid=$('#boxVid');
function openVideo(src){
  lastFocus=document.activeElement;
  boxVid.src=src;lb.classList.add('vid','open');lb.setAttribute('aria-hidden','false');
  boxVid.play().catch(()=>{});$('#closeBox').focus();
}
function closeBox(){
  boxVid.pause();
  const card=group[idx],an=!lb.classList.contains('vid')&&card?fly($('img',card),false):null;
  lb.classList.remove('open');lb.setAttribute('aria-hidden','true');
  setTimeout(()=>{if(!lb.classList.contains('open')){boxImg.removeAttribute('src');boxVid.removeAttribute('src');boxVid.load();lb.classList.remove('vid');if(flyer){flyer.cancel();flyer=null}}},350);
  lastFocus&&lastFocus.focus&&lastFocus.focus();
}
$$('[data-img]').forEach(c=>{
  c.tabIndex=0;c.setAttribute('aria-label',(c.querySelector('h3')||c).textContent.trim());
  c.addEventListener('click',()=>openBox(c));
  c.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openBox(c)}});
});
$('#closeBox').addEventListener('click',closeBox);
$('#prevBox').addEventListener('click',e=>{e.stopPropagation();show(idx-1)});
$('#nextBox').addEventListener('click',e=>{e.stopPropagation();show(idx+1)});
lb.addEventListener('click',e=>{if(e.target===lb)closeBox()});
addEventListener('keydown',e=>{
  if(e.key==='Escape'){if(lb.classList.contains('open'))closeBox();else toggleMenu(false)}
  if(!lb.classList.contains('open')||lb.classList.contains('vid'))return;
  if(e.key==='ArrowLeft')show(idx-1);
  if(e.key==='ArrowRight')show(idx+1);
});

/* ---------- visual v2: colour story and locked heading widths ---------- */
(function visualV2(){
  if(!lite&&!reduce){
    const HUE={home:75,story:75,services:150,process:190,experience:45,campaigns:205,estimator:275,audit:275,planner:275,designs:330,studio:330,hooks:15,videos:15,about:95,book:75,contact:75};
    const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting&&HUE[e.target.id]!=null)root.style.setProperty('--hue',HUE[e.target.id])}),{rootMargin:'-45% 0px -50% 0px'});
    Object.keys(HUE).forEach(id=>{const el=document.getElementById(id);if(el)io.observe(el)});
  }
  if(lite||reduce||!(window.CSS&&CSS.supports&&CSS.supports('animation-timeline:view()')))return;
  /* each word keeps the width it has at full weight, so the thin-to-bold animation never re-wraps a heading */
  const seen=new Set(),vis=new Set();
  const lock=h=>{
    const ws=$$('.w',h);root.setAttribute('data-m','1');
    ws.forEach(w=>{w.style.minWidth=''});
    const px=ws.map(w=>w.getBoundingClientRect().width);
    ws.forEach((w,i)=>{if(px[i])w.style.minWidth=px[i]+'px'});
    root.removeAttribute('data-m');seen.add(h);
  };
  const unlockAll=()=>{seen.clear();$$('.section-title .w').forEach(w=>{w.style.minWidth=''})};
  const io2=new IntersectionObserver(es=>es.forEach(e=>{
    if(e.isIntersecting){vis.add(e.target);if(!seen.has(e.target))lock(e.target)}else vis.delete(e.target);
  }),{rootMargin:'120px 0px'});
  $$('.section-title').forEach(h=>io2.observe(h));
  const relock=()=>{unlockAll();requestAnimationFrame(()=>vis.forEach(lock))};
  let rt;addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(relock,200)});
  new MutationObserver(()=>{unlockAll();setTimeout(()=>{$$('.section-title').forEach(h=>{if(vis.has(h))lock(h)})},50)}).observe(root,{attributes:true,attributeFilter:['lang']});
})();

})();
