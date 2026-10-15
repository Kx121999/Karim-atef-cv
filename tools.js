(function(K){
"use strict";
const {$,$$,reduce,root,lite,NF,fmtN,WA,track}=K;
/* ---------- poster lab ---------- */
(function studio(){
  const cv=$('#posterCv');if(!cv)return;
  const ctx=cv.getContext('2d');
  const FMT={post:[1080,1080],story:[1080,1920],banner:[1200,628]};
  const PAL={
    gold:{bg:['#0b1020','#1b2440'],fg:'#fff7e6',ac:'#e3b04b',on:'#1a1200'},
    lime:{bg:['#050505','#12170a'],fg:'#f5f1e8',ac:'#d7ff5f',on:'#000000'},
    green:{bg:['#06241a','#0d4a33'],fg:'#eafff4',ac:'#7ee787',on:'#00210f'},
    blue:{bg:['#eaf4ff','#cfe6ff'],fg:'#08243f',ac:'#0a6cc4',on:'#ffffff'},
    warm:{bg:['#2a0f06','#5a1d0a'],fg:'#fff1e6',ac:'#ff7a2f',on:'#2a0f06'},
    rose:{bg:['#2a0a1c','#4d1233'],fg:'#fff0f6',ac:'#ff6fa5',on:'#2a0a1c'},
    violet:{bg:['#120a2a','#2b1a5e'],fg:'#f3eeff',ac:'#a98bff',on:'#120a2a'}
  };
  const TYPES={
    real:{pal:'gold',shape:'skyline',en:['Your next home starts here','Limited units available','Book a viewing','Your Brand'],ar:['بيتك القادم يبدأ من هنا','وحدات محدودة متاحة','احجز معاينة','اسم علامتك']},
    food:{pal:'warm',shape:'rings',en:['Taste the difference','Fresh every day, order now','Order on WhatsApp','Your Brand'],ar:['تذوّق الفرق','طازج كل يوم، اطلب الآن','اطلب عبر واتساب','اسم علامتك']},
    clinic:{pal:'blue',shape:'cross',en:['Smile with confidence','Book your consultation','Book now','Your Brand'],ar:['ابتسم بثقة','احجز استشارتك','احجز الآن','اسم علامتك']},
    edu:{pal:'violet',shape:'steps',en:['Learn it. Own it.','Start your course today','Join now','Your Brand'],ar:['تعلّم وأتقن','ابدأ دورتك اليوم','انضم الآن','اسم علامتك']},
    beauty:{pal:'rose',shape:'blobs',en:['Your best look starts here','Book your appointment','Book now','Your Brand'],ar:['إطلالتك الأجمل تبدأ هنا','احجز موعدك','احجز الآن','اسم علامتك']},
    shop:{pal:'lime',shape:'dots',en:['New arrivals are here','Shop the collection','Shop now','Your Brand'],ar:['وصل الجديد','تسوّق التشكيلة','تسوّق الآن','اسم علامتك']},
    fit:{pal:'warm',shape:'slash',en:['Build a routine you can keep','Join this month','Join now','Your Brand'],ar:['ابنِ روتينًا تلتزم به','انضم هذا الشهر','انضم الآن','اسم علامتك']},
    finance:{pal:'green',shape:'chart',en:['Simple financing for your plans','Ask for your quote today','Get a quote','Your Brand'],ar:['تمويل بسيط لخططك','اطلب عرض السعر اليوم','اطلب عرض سعر','اسم علامتك']}
  };
  const st={type:'real',fmt:'post',pal:'gold',dirty:{}};
  const el={head:$('#stHead'),sub:$('#stSub'),cta:$('#stCta'),brand:$('#stBrand')};
  const keys=['head','sub','cta','brand'];
  const ar=()=>root.lang==='ar';
  const rr=(x,y,w,h,r)=>{ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath()};
  const rgba=(hex,a)=>{const n=parseInt(hex.slice(1),16);return 'rgba('+(n>>16)+','+((n>>8)&255)+','+(n&255)+','+a+')'};
  function fillDefaults(force){
    const d=TYPES[st.type][ar()?'ar':'en'];
    keys.forEach((k,i)=>{if(force||!st.dirty[k])el[k].value=d[i]});
  }
  function wrap(text,font,max){
    ctx.font=font;const words=text.split(/\s+/).filter(Boolean),lines=[];let cur='';
    for(const w of words){const t=cur?cur+' '+w:w;if(ctx.measureText(t).width>max&&cur){lines.push(cur);cur=w}else cur=t}
    if(cur)lines.push(cur);return lines;
  }
  function shapes(P,W,H,type){
    ctx.save();
    if(type==='skyline'){
      const n=11,bw=W/n;let seed=7;const rnd=()=>(seed=(seed*9301+49297)%233280)/233280;
      for(let i=0;i<n;i++){
        const h=H*(.10+rnd()*.2),x=i*bw,y=H-h;
        ctx.fillStyle=rgba(P.ac,.08+(i%3)*.04);ctx.fillRect(x+4,y,bw-8,h);
        ctx.fillStyle=rgba(P.fg,.16);
        for(let r=0;r<Math.floor(h/46);r++)for(let c=0;c<3;c++)ctx.fillRect(x+bw*.18+c*bw*.24,y+18+r*46,bw*.1,16);
      }
      ctx.fillStyle=P.ac;ctx.fillRect(0,H-6,W,6);
    }else if(type==='rings'){
      const cx=W*.82,cy=H*.2;
      for(let i=1;i<=6;i++){ctx.strokeStyle=rgba(P.ac,.5-i*.06);ctx.lineWidth=6;ctx.beginPath();ctx.arc(cx,cy,i*W*.075,0,6.283);ctx.stroke()}
      ctx.fillStyle=rgba(P.ac,.9);ctx.beginPath();ctx.arc(cx,cy,W*.05,0,6.283);ctx.fill();
    }else if(type==='cross'){
      const arm=Math.min(W,H)*.1;
      [[.85,.16,1],[.7,.34,.55],[.92,.42,.4]].forEach(([fx,fy,sc])=>{
        const a=arm*sc,cx=W*fx,cy=H*fy;ctx.fillStyle=rgba(P.ac,.22+sc*.2);
        rr(cx-a*.45,cy-a*1.5,a*.9,a*3,a*.3);ctx.fill();rr(cx-a*1.5,cy-a*.45,a*3,a*.9,a*.3);ctx.fill();
      });
    }else if(type==='steps'){
      const n=6,bw=W/n*.9;
      for(let i=0;i<n;i++){const h=H*(.05+i*.055),x=W-(n-i)*bw*1.08,y=H-h;ctx.fillStyle=rgba(P.ac,.12+i*.05);rr(x,y,bw,h,14);ctx.fill()}
      ctx.fillStyle=P.ac;ctx.beginPath();ctx.arc(W-bw*.5-W*.02,H-H*(.05+5*.055)-W*.05,W*.025,0,6.283);ctx.fill();
    }else if(type==='blobs'){
      [[.86,.16,.16,.22],[.7,.36,.09,.14],[.94,.46,.07,.12],[.62,.12,.05,.18]].forEach(([fx,fy,r,a])=>{ctx.fillStyle=rgba(P.ac,a);ctx.beginPath();ctx.arc(W*fx,H*fy,W*r,0,6.283);ctx.fill()});
    }else if(type==='dots'){
      const g=W*.06;for(let r=0;r<7;r++)for(let c=0;c<7;c++){const x=W*.58+c*g,y=H*.07+r*g,k=(r+c)/12;ctx.fillStyle=rgba(P.ac,.55-k*.4);ctx.beginPath();ctx.arc(x,y,W*.011*(1.3-k*.6),0,6.283);ctx.fill()}
    }else if(type==='slash'){
      for(let i=0;i<6;i++){ctx.fillStyle=rgba(P.ac,.10+i*.04);ctx.beginPath();const x=W*(.55+i*.09);ctx.moveTo(x,0);ctx.lineTo(x+W*.06,0);ctx.lineTo(x-W*.3+W*.06,H*.5);ctx.lineTo(x-W*.3,H*.5);ctx.closePath();ctx.fill()}
    }else{
      const n=7,bw=W*.07,base=H*.46,gx=W*.1;
      for(let i=0;i<n;i++){
        const h=H*(.05+i*.04),x=W-gx-(n-i)*bw*1.35,y=base-h;
        ctx.fillStyle=rgba(P.ac,.16+i*.05);rr(x,y,bw,h,10);ctx.fill();
      }
      ctx.strokeStyle=P.ac;ctx.lineWidth=7;ctx.lineJoin='round';ctx.beginPath();
      for(let i=0;i<n;i++){const x=W-gx-(n-i)*bw*1.35+bw/2,y=base-H*(.05+i*.04)-24;i?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.stroke();
    }
    ctx.restore();
  }
  function draw(){
    const [W,H]=FMT[st.fmt],P=PAL[st.pal],rtl=ar();
    if(cv.width!==W||cv.height!==H){cv.width=W;cv.height=H}
    const g=ctx.createLinearGradient(0,0,W,H);g.addColorStop(0,P.bg[0]);g.addColorStop(1,P.bg[1]);
    ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
    shapes(P,W,H,TYPES[st.type].shape);
    const fam=rtl?'Cairo, Inter, sans-serif':'Inter, Cairo, sans-serif',pad=W*.08,maxW=W-pad*2;
    ctx.direction=rtl?'rtl':'ltr';ctx.textAlign=rtl?'right':'left';ctx.textBaseline='alphabetic';
    const X=rtl?W-pad:pad;
    const banner=st.fmt==='banner',story=st.fmt==='story';
    let y=pad+(banner?4:W*.03);
    const brand=el.brand.value.trim();
    if(brand){
      ctx.fillStyle=P.ac;ctx.font='800 '+Math.round(W*(banner?.024:.032))+'px '+fam;
      ctx.fillText(rtl?brand:brand.toUpperCase(),X,y+W*.03);y+=W*(banner?.045:.07);
      if(!banner){ctx.fillRect(rtl?X-W*.08:X,y,W*.08,5);y+=W*.06}
    }
    const head=(el.head.value.trim()||' ')[rtl?'toString':'toUpperCase']();
    const sub=el.sub.value.trim(),cta=el.cta.value.trim();
    const cs=Math.round(W*(banner?.024:.038)),bh=cs*2.3,ctaY=H-pad*(banner?1.15:1.9)-bh;
    const ss=Math.round(W*(banner?.026:.04)),subFont='600 '+ss+'px '+fam;
    const subLines=sub?wrap(sub,subFont,maxW*.8).slice(0,2):[];
    const subH=subLines.length?subLines.length*ss*1.35+W*.025:0;
    const top=story?Math.max(y,H*.2):y+W*.01;
    const maxH=Math.max(H*.12,ctaY-subH-W*.04-top);
    let size=Math.round(W*(banner?.08:.13)),lines;
    for(;size>34;size-=4){lines=wrap(head,'900 '+size+'px '+fam,maxW);if(lines.length<=4&&lines.length*size*(rtl?1.2:.98)<=maxH)break}
    const lh=size*(rtl?1.2:.98);
    ctx.fillStyle=P.fg;ctx.font='900 '+size+'px '+fam;
    lines.forEach((l,i)=>ctx.fillText(l,X,top+size*.9+i*lh));
    const by=top+lines.length*lh+W*.02;
    if(subLines.length){ctx.fillStyle=rgba(P.fg,.82);ctx.font=subFont;subLines.forEach((l,i)=>ctx.fillText(l,X,by+ss+i*ss*1.35))}
    if(cta){
      ctx.font='900 '+cs+'px '+fam;
      const label=rtl?cta:cta.toUpperCase(),tw=ctx.measureText(label).width,bw=tw+cs*2.2;
      const bx=rtl?X-bw:X;
      ctx.fillStyle=P.ac;rr(bx,ctaY,bw,bh,bh/2);ctx.fill();
      ctx.fillStyle=P.on;ctx.textAlign='center';ctx.fillText(label,bx+bw/2,ctaY+bh/2+cs*.35);
      ctx.textAlign=rtl?'right':'left';
    }
    ctx.fillStyle=rgba(P.fg,.4);ctx.font='700 '+Math.round(W*.02)+'px '+fam;ctx.fillText('Poster Lab · Karim Atef',X,H-pad*.55);
  }
  let pend=0;const redraw=()=>{if(!pend)pend=requestAnimationFrame(()=>{pend=0;draw()})};
  const group=(id,fn)=>$$('#'+id+' button').forEach(b=>b.addEventListener('click',()=>{$$('#'+id+' button').forEach(x=>x.classList.toggle('on',x===b));fn(b.dataset.v)}));
  group('stType',v=>{st.type=v;st.pal=TYPES[v].pal;$$('#stPal button').forEach(x=>x.classList.toggle('on',x.dataset.v===st.pal));st.dirty={};fillDefaults(true);redraw()});
  group('stFmt',v=>{st.fmt=v;redraw()});
  group('stPal',v=>{st.pal=v;redraw()});
  keys.forEach(k=>el[k].addEventListener('input',()=>{st.dirty[k]=true;redraw()}));
  $('#stDl').addEventListener('click',()=>{
    draw();cv.toBlob(b=>{const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='poster-'+st.fmt+'.png';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),2000)},'image/png');
    track('poster_download',{type:st.type,fmt:st.fmt});
  });
  $('#stWa').addEventListener('click',()=>{
    const t=ar()?`أهلًا كريم، صمّمت فكرة بوستر (${st.type}، ${st.fmt}) من مختبر البوسترات.\nالعنوان: ${el.head.value}\nأريد تنفيذها لنشاطي.`:`Hi Karim, I designed a poster idea (${st.type}, ${st.fmt}) in your Poster Lab.\nHeadline: ${el.head.value}\nI would like to build it for my business.`;
    window.open('https://wa.me/971527366719?text='+encodeURIComponent(t),'_blank','noopener');
    track('poster_whatsapp',{type:st.type});
  });
  document.addEventListener('hook-to-poster',e=>{
    const d=e.detail||{};
    if(d.type&&TYPES[d.type]&&d.type!==st.type){st.type=d.type;st.pal=TYPES[d.type].pal;$$('#stType button').forEach(x=>x.classList.toggle('on',x.dataset.v===d.type));$$('#stPal button').forEach(x=>x.classList.toggle('on',x.dataset.v===st.pal));st.dirty={};fillDefaults(true)}
    el.head.value=d.text.replace(/[.?]+$/,'');st.dirty.head=true;redraw();
    K.goTo($('#studio'));
  });
  new MutationObserver(()=>{fillDefaults(false);redraw()}).observe(root,{attributes:true,attributeFilter:['lang']});
  fillDefaults(true);
  new IntersectionObserver((es,o)=>{if(es.some(e=>e.isIntersecting)){o.disconnect();draw()}},{rootMargin:'300px'}).observe(cv);
  (document.fonts&&document.fonts.load?Promise.all([document.fonts.load('900 60px Inter'),document.fonts.load('900 60px Cairo'),document.fonts.load('800 40px Inter')]):Promise.resolve()).then(redraw).catch(()=>{});
  if(document.fonts&&document.fonts.addEventListener)document.fonts.addEventListener('loadingdone',redraw);
})();

/* ---------- reel hooks ---------- */
(function hooks(){
  const list=$('#hkList');if(!list)return;
  const D={
    real:{en:['an apartment','stuck choosing between too many listings','a short list that fits your budget','buying property'],ar:['شقة','محتارًا بين عروض كثيرة','قائمة قصيرة تناسب ميزانيتك','شراء العقار']},
    food:{en:['your next meal','tired of the same takeaway','something fresh and different','ordering food'],ar:['وجبتك القادمة','تشعر بالملل من نفس الطلب','شيئًا طازجًا ومختلفًا','طلب الطعام']},
    clinic:{en:['a clinic','putting off your appointment','a plan you feel good about','your treatment'],ar:['عيادة','تؤجل موعدك','خطة تطمئن لها','علاجك']},
    finance:{en:['financing','confused by the paperwork','clear steps and a clear number','getting financing'],ar:['تمويل','محتارًا من الأوراق','خطوات واضحة ورقمًا واضحًا','الحصول على تمويل']},
    edu:{en:['a course','not sure where to start','a simple path to follow','learning a new skill'],ar:['دورة','لا تعرف من أين تبدأ','طريقًا بسيطًا تتبعه','تعلّم مهارة جديدة']},
    beauty:{en:['a salon','searching for a look that suits you','a look you love','your next look'],ar:['صالون','تبحث عن إطلالة تناسبك','إطلالة تحبها','إطلالتك القادمة']},
    shop:{en:['this product','scrolling without finding the right one','the right one, delivered to your door','shopping online'],ar:['هذا المنتج','تتصفح دون أن تجد المناسب','المنتج المناسب إلى باب بيتك','التسوق عبر الإنترنت']},
    fit:{en:['a training plan','starting over every Monday','a routine you can keep','getting fit'],ar:['خطة تدريب','تبدأ من جديد كل يوم اثنين','روتينًا تستطيع الالتزام به','اللياقة']}
  };
  const CTA={msg:{en:'Send us a message',ar:'راسلنا الآن'},lead:{en:'Leave your details',ar:'اترك بياناتك'},sale:{en:'Order today',ar:'اطلب اليوم'}};
  const TPL={
    en:['Still {pain}? Watch this.','The one thing nobody tells you about {topic}.','3 mistakes that make people scroll past {thing}.','Before: {pain}. After: {gain}.','Stop scrolling if you want {gain}.','What to check before you choose {thing}.','{thing}, step by step.','{thing}, made simple. {cta}.'],
    ar:['ما زلت {pain}؟ شاهد هذا.','الشيء الوحيد الذي لا يخبرك به أحد عن {topic}.','3 أخطاء تجعل الناس يتجاوزون {thing}.','قبل: {pain}. بعد: {gain}.','توقف عن التمرير إن كنت تريد {gain}.','ما يجب أن تتأكد منه قبل اختيار {thing}.','{thing}، خطوة بخطوة.','{thing} بكل بساطة. {cta}.']
  };
  const st={type:'real',goal:'msg'};
  const ar=()=>root.lang==='ar';
  const esc=t=>t.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  function lines(){
    const L=ar()?'ar':'en',d=D[st.type][L],cta=CTA[st.goal][L];
    return TPL[L].map(t=>t.replace('{thing}',d[0]).replace('{pain}',d[1]).replace('{gain}',d[2]).replace('{topic}',d[3]).replace('{cta}',cta)).map(t=>t.charAt(0).toUpperCase()+t.slice(1));
  }
  function render(){
    const ls=lines(),a=ar();
    list.innerHTML=ls.map((t,i)=>`<div class="hk"><p dir="auto">${esc(t)}</p><div class="acts"><button type="button" data-act="copy" data-i="${i}">${a?'نسخ':'Copy'}</button><button type="button" data-act="poster" data-i="${i}">${a?'استخدمه في البوستر':'Use in poster'}</button></div></div>`).join('');
  }
  function group(id,key){$$('#'+id+' button').forEach(b=>b.addEventListener('click',()=>{$$('#'+id+' button').forEach(x=>x.classList.toggle('on',x===b));st[key]=b.dataset.v;render()}))}
  group('hkType','type');group('hkGoal','goal');
  list.addEventListener('click',e=>{
    const b=e.target.closest('button[data-act]');if(!b)return;
    const text=lines()[+b.dataset.i];
    if(b.dataset.act==='copy'){
      const done=()=>{const o=b.textContent;b.textContent=ar()?'تم النسخ':'Copied';setTimeout(()=>{b.textContent=o},1400)};
      if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(text).then(done,done);else{const ta=document.createElement('textarea');ta.value=text;document.body.appendChild(ta);ta.select();try{document.execCommand('copy')}catch(err){}ta.remove();done()}
      track('hook_copy',{type:st.type,goal:st.goal});
    }else{
      document.dispatchEvent(new CustomEvent('hook-to-poster',{detail:{text,type:st.type}}));
      track('hook_to_poster',{type:st.type});
    }
  });
  new MutationObserver(render).observe(root,{attributes:true,attributeFilter:['lang']});
  render();
})();

/* ---------- tools: audit, plan, call request, command palette ---------- */

(function audit(){
  const body=$('#auBody'),bar=$('#auBar');if(!body)return;
  const Q=[
    {n:['Goal clarity','وضوح الهدف'],q:['Do you have one clear goal for the campaign?','هل لحملتك هدف واحد واضح؟'],o:[['Yes, one goal: messages, leads or sales','نعم، هدف واحد: رسائل أو عملاء أو مبيعات'],['More than one goal in the same campaign','أكثر من هدف في نفس الحملة'],['Not sure','لست متأكدًا']],t:['Pick one goal per campaign: messages, leads or sales. Mixed goals split the budget and blur the results.','اختر هدفًا واحدًا لكل حملة: رسائل أو عملاء أو مبيعات. تعدد الأهداف يوزّع الميزانية ويشوّش النتائج.']},
    {n:['Tracking','المتابعة'],q:['Can you see your cost per result?','هل ترى تكلفة النتيجة؟'],o:[['Yes, and I check it weekly','نعم، وأراجعها أسبوعيًا'],['I see it but rarely check it','أراها لكن نادرًا ما أراجعها'],['No','لا']],t:['Track cost per result at least weekly. Without it you cannot tell which ad to scale and which to stop.','تابع تكلفة النتيجة أسبوعيًا على الأقل. بدونها لن تعرف أي إعلان توسّع وأي إعلان توقفه.']},
    {n:['Creative','التصميم'],q:['What does your ad creative look like?','كيف يبدو تصميم إعلانك؟'],o:[['A video or reel made for the ad','فيديو أو ريل مصنوع للإعلان'],['A static image or poster','صورة أو بوستر ثابت'],['Reused from my regular posts','محتوى معاد استخدامه من منشوراتي العادية']],t:['Build creatives for ads, not reused organic posts: one clear message, a format made for the placement, readable in the first second.','اصنع تصاميم للإعلان نفسه لا محتوى معاد استخدامه: رسالة واحدة واضحة بصيغة مناسبة للمنصة، ومقروءة من أول ثانية.']},
    {n:['Hook','الجملة الافتتاحية'],q:['Do the first three seconds or the headline state the benefit clearly?','هل تذكر أول ثلاث ثوانٍ أو العنوان الفائدة بوضوح؟'],o:[['Yes','نعم'],['Sometimes','أحيانًا'],['No, or not sure','لا، أو لست متأكدًا']],t:['Open with the benefit in the first three seconds or in the headline, before the brand name.','ابدأ بالفائدة في أول ثلاث ثوانٍ أو في العنوان، قبل اسم العلامة.']},
    {n:['Click destination','وجهة النقرة'],q:['Where does the click go?','إلى أين يذهب النقر؟'],o:[['WhatsApp or a lead form with one clear step','واتساب أو نموذج عملاء بخطوة واحدة واضحة'],['A website with many options','موقع فيه خيارات كثيرة'],['My profile or a post','الصفحة الشخصية أو منشور']],t:['Send the click to one clear next step, such as a WhatsApp chat or a short lead form, not a page with many choices.','وجّه النقرة إلى خطوة واحدة واضحة، مثل محادثة واتساب أو نموذج قصير، لا صفحة فيها خيارات كثيرة.']},
    {n:['Testing','الاختبار'],q:['How often do you test new creatives?','كل كم تختبر تصاميم جديدة؟'],o:[['Every week or two','كل أسبوع أو أسبوعين'],['Monthly','شهريًا'],['Rarely or never','نادرًا أو أبدًا']],t:['Plan new creative tests on a regular rhythm, every week or two, so you learn what works before the budget runs out.','خطّط لاختبار تصاميم جديدة بإيقاع منتظم، كل أسبوع أو أسبوعين، لتعرف ما ينجح قبل أن تنفد الميزانية.']}
  ];
  const LV=[['Needs a reset','يحتاج إلى إعادة ضبط'],['Good base, clear gaps','أساس جيد وثغرات واضحة'],['Strong foundation','أساس قوي']];
  let step=0,ans=[],raf=0;
  const ar=()=>root.lang==='ar',L=()=>ar()?1:0;
  function render(){
    const l=L();bar.style.setProperty('--w',(step/Q.length*100)+'%');
    if(step<Q.length){
      const q=Q[step];
      body.innerHTML=`<div class="au-step">${ar()?'السؤال':'Question'} ${step+1} / ${Q.length}</div><h3 class="au-q">${q.q[l]}</h3><div class="au-opts">${q.o.map((o,i)=>`<button type="button" data-i="${i}">${o[l]}</button>`).join('')}</div>${step?`<button type="button" class="au-back" data-back>${ar()?'رجوع':'Back'}</button>`:''}`;
      return;
    }
    const score=ans.reduce((a,v)=>a+(2-v),0),pct=Math.round(score/(Q.length*2)*100),lv=pct<40?0:pct<=70?1:2;
    const gaps=ans.map((v,i)=>({v,i})).filter(x=>x.v>0).sort((a,b)=>b.v-a.v||a.i-b.i).slice(0,3);
    body.innerHTML=`<div class="au-res"><div class="au-ring" id="auRing"><b><span id="auNum">0</span><small>/100</small></b></div><div><div class="au-step">${ar()?'نتيجتك':'Your result'}</div><div class="au-level">${LV[lv][l]}</div>${gaps.length?`<ul class="au-tips">${gaps.map(g=>`<li><b>${Q[g.i].n[l]}</b>${Q[g.i].t[l]}</li>`).join('')}</ul>`:`<p>${ar()?'لا توجد ثغرات واضحة في هذه المجالات الستة. الخطوة التالية: وسّع ما ينجح واستمر في الاختبار.':'No clear gaps in these six areas. Next step: scale what works and keep testing.'}</p>`}<div class="cf-actions"><button class="btn" type="button" data-act="wa">${ar()?'أرسل التقييم عبر واتساب':'Send my audit on WhatsApp'}</button><button class="btn dark" type="button" data-act="plan">${ar()?'ابنِ خطة':'Build a plan'}</button><button class="btn dark" type="button" data-act="again">${ar()?'ابدأ من جديد':'Start over'}</button></div><p class="au-note">${ar()?'قائمة تقدير سريعة وليست فحصًا كاملًا للحساب.':'A rule-of-thumb checklist, not a full account audit.'}</p></div></div>`;
    const ring=$('#auRing'),num=$('#auNum'),t0=performance.now();cancelAnimationFrame(raf);
    const tick=t=>{const k=Math.min((t-t0)/900,1),v=pct*(1-Math.pow(1-k,3));ring.style.setProperty('--p',v);num.textContent=Math.round(v);if(k<1)raf=requestAnimationFrame(tick)};
    if(reduce){ring.style.setProperty('--p',pct);num.textContent=pct}else raf=requestAnimationFrame(tick);
    body.dataset.pct=pct;body.dataset.lv=lv;
  }
  body.addEventListener('click',e=>{
    const b=e.target.closest('button');if(!b)return;
    if(b.dataset.i!==undefined){if(step===0)track('audit_start');ans[step]=+b.dataset.i;step++;render();if(step===Q.length)track('audit_complete',{score:body.dataset.pct})}
    else if(b.hasAttribute('data-back')){step=Math.max(0,step-1);render()}
    else if(b.dataset.act==='again'){step=0;ans=[];render()}
    else if(b.dataset.act==='plan'){K.goTo($('#planner'))}
    else if(b.dataset.act==='wa'){
      const l=L(),pct=body.dataset.pct,lv=LV[+body.dataset.lv][l],gaps=ans.map((v,i)=>({v,i})).filter(x=>x.v>0).sort((a,b)=>b.v-a.v||a.i-b.i).slice(0,3).map(g=>Q[g.i].n[l]);
      const t=ar()?`أهلًا كريم، أجريت فحص الإعلان وحصلت على ${pct}/100 (${lv}).\nأهم الثغرات: ${gaps.join('، ')||'لا توجد'}.\nأريد مساعدتك في تحسين حملتي.`:`Hi Karim, I ran your ad audit and scored ${pct}/100 (${lv}).\nTop gaps: ${gaps.join(', ')||'none'}.\nI would like help improving my campaign.`;
      window.open(WA+encodeURIComponent(t),'_blank','noopener');track('audit_whatsapp',{score:pct});
    }
  });
  new MutationObserver(render).observe(root,{attributes:true,attributeFilter:['lang']});
  render();
})();

(function planner(){
  const out=$('#planOut');if(!out)return;
  const TL={real:['Real estate','عقارات'],food:['Restaurant','مطعم'],clinic:['Clinic','عيادة'],finance:['Finance','تمويل'],edu:['Education','تعليم'],beauty:['Beauty','تجميل'],shop:['Shop','متجر'],fit:['Fitness','لياقة']};
  const GL={msg:['Messages','رسائل'],lead:['Leads','عملاء محتملون'],sale:['Sales','مبيعات']};
  const st={type:'real',goal:'msg',budget:8000,dur:1};
  const ar=()=>root.lang==='ar',t=(a,b)=>ar()?b:a;
  const split=()=>{
    if(st.goal==='sale')return[['Meta','ميتا',55],['TikTok','تيك توك',25],['Retargeting','إعادة الاستهداف',20]];
    if(st.goal==='lead'&&(st.type==='finance'||st.type==='edu'))return[['Meta','ميتا',55],['LinkedIn','لينكدإن',25],['Test reserve','احتياطي اختبار',20]];
    if(st.goal==='lead')return[['Meta','ميتا',65],['TikTok','تيك توك',20],['Test reserve','احتياطي اختبار',15]];
    return[['Meta','ميتا',65],['TikTok','تيك توك',20],['Test reserve','احتياطي اختبار',15]];
  };
  const creatives=b=>b<5000?{r:2,p:2,h:0}:b<15000?{r:4,p:4,h:0}:{r:6,p:4,h:2};
  function build(){
    const b=st.budget,tot=b*st.dur,sp=split(),cr=creatives(b);
    const goalKey=st.goal;let kpi;
    if(goalKey==='msg'){const lo=b/38.10,hi=b/14.60;kpi=`<span class="big">${fmtN(lo)} – ${fmtN(hi)}</span><p>${t('conversations per month, from AED 14.60 to 38.10 per conversation in my message campaigns.','محادثة شهريًا، بتكلفة من 14.60 إلى 38.10 درهم للمحادثة في حملات الرسائل لديّ.')}</p>${st.dur>1?`<p>${t('Over '+st.dur+' months:','خلال '+st.dur+' أشهر:')} ${fmtN(lo*st.dur)} – ${fmtN(hi*st.dur)}</p>`:''}`}
    else if(goalKey==='lead'){const lo=b/59.41,hi=b/42.78;kpi=`<span class="big">${fmtN(lo)} – ${fmtN(hi)}</span><p>${t('leads per month, from AED 42.78 to 59.41 per lead in my lead campaigns (the small AED 483 campaign is left out).','عميل محتمل شهريًا، بتكلفة من 42.78 إلى 59.41 درهم للعميل في حملات العملاء لديّ (دون الحملة الصغيرة بميزانية 483 درهمًا).')}</p>${st.dur>1?`<p>${t('Over '+st.dur+' months:','خلال '+st.dur+' أشهر:')} ${fmtN(lo*st.dur)} – ${fmtN(hi*st.dur)}</p>`:''}`}
    else kpi=`<p>${t('No sales-campaign numbers are published here, so this plan gives no result range. Track cost per order and return on ad spend, and set targets after the first two weeks of data.','لا توجد أرقام حملات مبيعات منشورة هنا، لذلك لا تعطي الخطة نطاقًا للنتائج. تابع تكلفة الطلب والعائد على الإنفاق الإعلاني وحدّد أهدافك بعد أول أسبوعين من البيانات.')}</p>`;
    const crl=[`${cr.r} ${t('short vertical videos (reels)','فيديوهات قصيرة عمودية (ريلز)')}`,`${cr.p} ${t('posters or static ads','بوسترات أو إعلانات ثابتة')}`];
    if(cr.h)crl.push(`${cr.h} ${t('hook variations of the best performer','نسخ افتتاحية جديدة لأفضل إعلان')}`);
    const tl=[[t('Week 1','الأسبوع 1'),t('Set up tracking and the click destination, then ship the first creatives.','جهّز المتابعة ووجهة النقرة وأطلق أول التصاميم.')],[t('Week 2','الأسبوع 2'),t('Run 3 to 4 creative variations against one clear audience.','شغّل 3 إلى 4 نسخ من التصاميم لجمهور واحد واضح.')],[t('Week 3','الأسبوع 3'),t('Stop the weak ads and move budget to the winners.','أوقف الإعلانات الضعيفة وانقل الميزانية إلى الفائزة.')],[t('Week 4','الأسبوع 4'),t('Review cost per result and plan next month\'s creatives.','راجع تكلفة النتيجة وخطّط لتصاميم الشهر القادم.')]];
    return `<div class="plan-sheet"><small>${t('Campaign plan','خطة الحملة')}</small><h3>${TL[st.type][ar()?1:0]} · ${GL[st.goal][ar()?1:0]}</h3><p class="sum">AED ${fmtN(b)} ${t('per month for','شهريًا لمدة')} ${st.dur} ${t(st.dur>1?'months':'month',st.dur>1?'أشهر':'شهر')} (AED ${fmtN(tot)} ${t('in total','إجمالًا')})</p><div class="plan-grid"><div class="pb"><h4>${t('Suggested budget split, per month','توزيع الميزانية المقترح شهريًا')}</h4>${sp.map(r=>`<div class="row"><span>${r[ar()?1:0]}</span><b>AED ${fmtN(b*r[2]/100)}</b><i style="--w:${r[2]}%"></i></div>`).join('')}</div><div class="pb"><h4>${t('Creatives per month','التصاميم شهريًا')}</h4><ul>${crl.map(x=>`<li>${x}</li>`).join('')}</ul></div><div class="pb"><h4>${t('What to expect','ما يمكن توقعه')}</h4>${kpi}</div><div class="pb"><h4>${t('First 30 days','أول 30 يومًا')}</h4><ul>${tl.map(x=>`<li><b>${x[0]}</b> ${x[1]}</li>`).join('')}</ul></div></div><p class="plan-note">${t('A suggested starting plan, not a guarantee. Results depend on the offer, the audience and the creative.','خطة بداية مقترحة وليست ضمانًا. تعتمد النتائج على العرض والجمهور والتصميم.')}</p></div>`;
  }
  const rng=$('#plBudget');
  function render(){
    $('#plBudgetVal').textContent=fmtN(st.budget);rng.style.setProperty('--v',((st.budget-rng.min)/(rng.max-rng.min)*100)+'%');
    out.innerHTML=build();
  }
  const group=(id,key,num)=>$$('#'+id+' button').forEach(b=>b.addEventListener('click',()=>{$$('#'+id+' button').forEach(x=>x.classList.toggle('on',x===b));st[key]=num?+b.dataset.v:b.dataset.v;render()}));
  group('plType','type');group('plGoal','goal');group('plDur','dur',true);
  rng.addEventListener('input',()=>{st.budget=+rng.value;render()});
  let first=true;rng.addEventListener('change',()=>{if(first){first=false;track('plan_build',{type:st.type,goal:st.goal})}});
  $('#plWa').addEventListener('click',()=>{
    const a=ar(),tx=a?`أهلًا كريم، صممت خطة حملة (${TL[st.type][1]}، ${GL[st.goal][1]}) بميزانية ${fmtN(st.budget)} درهم شهريًا لمدة ${st.dur} من الأشهر.\nأريد مناقشتها معك.`:`Hi Karim, I built a campaign plan (${TL[st.type][0]}, ${GL[st.goal][0]}) with AED ${fmtN(st.budget)} per month for ${st.dur} month(s).\nI would like to discuss it with you.`;
    window.open(WA+encodeURIComponent(tx),'_blank','noopener');track('plan_whatsapp');
  });
  $('#plPrint').addEventListener('click',()=>{
    const holder=document.createElement('div');holder.id='planPrint';holder.dir=root.dir;holder.innerHTML=out.innerHTML;document.body.appendChild(holder);root.classList.add('printing');
    const done=()=>{root.classList.remove('printing');holder.remove();removeEventListener('afterprint',done)};
    addEventListener('afterprint',done);track('plan_print');
    setTimeout(()=>window.print(),60);
  });
  new MutationObserver(render).observe(root,{attributes:true,attributeFilter:['lang']});
  render();
})();

(function book(){
  const daysEl=$('#bkDays'),slotsEl=$('#bkSlots');if(!daysEl)return;
  /* Change these to your real availability. Times are UAE time (GST). */
  const AVAIL={slots:['10:00','12:00','14:00','16:00','18:00'],weekdays:[1,2,3,4,5],count:5};
  const days=[];{const d=new Date();d.setHours(12,0,0,0);while(days.length<AVAIL.count){d.setDate(d.getDate()+1);if(AVAIL.weekdays.includes(d.getDay()))days.push(new Date(d))}}
  const st={day:0,slot:null},ar=()=>root.lang==='ar';
  const dl=d=>d.toLocaleDateString(ar()?'ar-AE-u-nu-latn':'en-GB',{weekday:'short',day:'numeric',month:'short'});
  const dlong=d=>d.toLocaleDateString(ar()?'ar-AE-u-nu-latn':'en-GB',{weekday:'long',day:'numeric',month:'long'});
  const err=$('#bkErr');
  function render(){
    daysEl.innerHTML=days.map((d,i)=>`<button type="button" data-d="${i}"${i===st.day?' class="on"':''}>${dl(d)}</button>`).join('');
    slotsEl.innerHTML=AVAIL.slots.map(x=>`<button type="button" data-s="${x}"${x===st.slot?' class="on"':''}>${x}</button>`).join('');
  }
  daysEl.addEventListener('click',e=>{const b=e.target.closest('[data-d]');if(!b)return;st.day=+b.dataset.d;render()});
  slotsEl.addEventListener('click',e=>{const b=e.target.closest('[data-s]');if(!b)return;st.slot=b.dataset.s;err.textContent='';render()});
  $('#bkSend').addEventListener('click',()=>{
    const name=$('#bkName').value.trim(),topic=$('#bkTopic').value;
    if(!name||!st.slot){err.textContent=ar()?'من فضلك اكتب اسمك واختر وقتًا.':'Please add your name and pick a time.';return}
    err.textContent='';
    const day=dlong(days[st.day]);
    const t=ar()?`أهلًا كريم، أود طلب مكالمة يوم ${day} الساعة ${st.slot} (بتوقيت الإمارات).\nالموضوع: ${topic}.\nالاسم: ${name}.\nهل هذا الموعد مناسب؟`:`Hi Karim, I would like to request a call on ${day} at ${st.slot} (UAE time).\nTopic: ${topic}.\nName: ${name}.\nIs this time OK for you?`;
    window.open(WA+encodeURIComponent(t),'_blank','noopener');track('call_request');
  });
  new MutationObserver(()=>{err.textContent='';render()}).observe(root,{attributes:true,attributeFilter:['lang']});
  render();
})();

(function palette(){
  const ov=$('#cmdk'),inp=$('#ckIn'),list=$('#ckList');if(!ov)return;
  const S=[['services','Services','الخدمات'],['experience','Experience','الخبرات'],['campaigns','Projects','المشاريع'],['estimator','Campaign Estimator','حاسبة الحملات'],['audit','Ad Audit','فحص الإعلان'],['planner','Campaign Plan','خطة الحملة'],['designs','Designs','التصاميم'],['studio','Poster Lab','مختبر البوسترات'],['hooks','Reel Hooks','هوكس الريلز'],['videos','Videos','الفيديوهات'],['about','About','نبذة'],['book','Request a Call','طلب مكالمة'],['contact','Contact','تواصل']];
  const items=S.map(x=>({g:0,en:x[1],ar:x[2],run:()=>{const el=document.getElementById(x[0]);K.goTo(el)}}))
    .concat([
      {g:1,en:'Switch language',ar:'تبديل اللغة',run:()=>$('#lang').click()},
      {g:1,en:'Present mode',ar:'وضع العرض',run:()=>$('#presentBtn').click()},
      {g:1,en:'Toggle lite mode',ar:'تبديل الوضع الخفيف',run:()=>$('#liteBtn').click()},
      {g:1,en:'Switch light / dark theme',ar:'تبديل الوضع الفاتح / الداكن',run:()=>$('#themeBtn').click()},
      {g:1,en:'Download CV (PDF)',ar:'تحميل السيرة الذاتية (PDF)',run:()=>{const a=document.createElement('a');a.href=root.lang==='ar'?'Karim-Atef-CV-ar.pdf':'Karim-Atef-CV.pdf';a.download='';document.body.appendChild(a);a.click();a.remove()}},
      {g:1,en:'Open WhatsApp',ar:'فتح واتساب',run:()=>window.open('https://wa.me/971527366719','_blank','noopener')},
      {g:1,en:'Send an email',ar:'إرسال إيميل',run:()=>{location.href='mailto:kx121999@gmail.com'}}
    ]);
  let sel=0,shown=[];
  const ar=()=>root.lang==='ar';
  function filter(){
    const q=inp.value.trim().toLowerCase();
    shown=items.filter(i=>!q||(i.en+' '+i.ar).toLowerCase().includes(q));
    shown.sort((a,b)=>{const sa=!q?0:(a.en.toLowerCase().startsWith(q)||a.ar.startsWith(q)?0:1),sb=!q?0:(b.en.toLowerCase().startsWith(q)||b.ar.startsWith(q)?0:1);return sa-sb});
    if(sel>=shown.length)sel=0;
    list.innerHTML=shown.length?shown.map((i,k)=>`<li role="option" data-k="${k}"${k===sel?' class="on" aria-selected="true"':''}><span>${ar()?i.ar:i.en}</span><small>${i.g?(ar()?'إجراء':'Action'):(ar()?'قسم':'Section')}</small></li>`).join(''):`<li>${ar()?'لا نتائج':'No results'}</li>`;
    const on=$('li.on',list);if(on)on.scrollIntoView({block:'nearest'});
  }
  let last=null;
  function open(){last=document.activeElement;ov.hidden=false;inp.value='';sel=0;filter();inp.focus();track('cmdk_open')}
  function close(){ov.hidden=true;last&&last.focus&&last.focus()}
  function run(k){const i=shown[k];if(!i)return;close();setTimeout(i.run,30)}
  inp.addEventListener('input',()=>{sel=0;filter()});
  list.addEventListener('click',e=>{const li=e.target.closest('[data-k]');if(li)run(+li.dataset.k)});
  ov.addEventListener('click',e=>{if(e.target===ov)close()});
  $('#ckBtn')?.addEventListener('click',open);
  K.openPalette=open;
  addEventListener('keydown',e=>{
    const k=e.key;
    if((e.ctrlKey||e.metaKey)&&k.toLowerCase()==='k'){e.preventDefault();ov.hidden?open():close();return}
    if(ov.hidden){
      const tag=(e.target.tagName||'').toLowerCase();
      if(k==='/'&&!['input','textarea','select'].includes(tag)&&!e.ctrlKey&&!e.metaKey){e.preventDefault();open()}
      return;
    }
    if(k==='Escape'){close()}
    else if(k==='ArrowDown'){e.preventDefault();sel=Math.min(shown.length-1,sel+1);filter()}
    else if(k==='ArrowUp'){e.preventDefault();sel=Math.max(0,sel-1);filter()}
    else if(k==='Enter'){e.preventDefault();run(sel)}
  });
  new MutationObserver(()=>{if(!ov.hidden)filter()}).observe(root,{attributes:true,attributeFilter:['lang']});
})();
})(window.KC);
