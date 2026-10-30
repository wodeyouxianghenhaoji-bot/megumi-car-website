const cfg=window.SITE_CONFIG;
const $=(s)=>document.querySelector(s);
const escapeHTML=(value)=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=(amount,currency)=>new Intl.NumberFormat('en-US',{style:'currency',currency,maximumFractionDigits:0}).format(amount);
let rates={USD:.0063514,CNY:.042352,EUR:.005677,GBP:.0047584,AUD:.0090417,CAD:.00891,JPY:1},rateDate='2026-10-26';
const colors=['#74adeb','#aa99df','#d293b5','#d7b280','#8ac5ad'];
$('#steps').innerHTML=cfg.steps.map(([title,body],i)=>`<article class="step reveal" style="--step-color:${colors[i]}"><span class="step-number">0${i+1}</span><span class="step-progress"><svg><use href="#${i===4?'check':'arrow-up-right'}"/></svg></span><h3>${title}</h3><p>${body}</p></article>`).join('');
$('#faq-list').innerHTML=cfg.faqs.map(([q,a],i)=>`<details ${i===0?'open':''}><summary>${q}</summary><p>${a}</p></details>`).join('');
const langs=[['cn','中文（简体）','zh'],['sa','العربية','ar'],['nl','Nederlands','nl'],['gb','English','en'],['fr','Français','fr'],['de','Deutsch','de'],['it','Italiano','it'],['pt','Português','pt'],['ru','Русский','ru'],['es','Español','es']];
$('#language-menu').innerHTML=langs.map(([flag,name,code])=>`<button lang="${code}" data-lang="${code}" class="${code==='zh'?'active':''}"><img src="assets/flag-${flag}.svg" alt="">${name}<small>${code==='zh'?'当前':'即将推出'}</small></button>`).join('');
let toastTimer;function toast(message){$('#toast').textContent=message;$('#toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),4200)}
function contact(type,vehicle='',request=false){
 const value=cfg[type];
 const message=vehicle?(request?`您好，我想寻找一辆 ${vehicle} 日本二手车，请帮我确认车源。`:`您好，我想了解 ${vehicle} 的可售状态、车辆资料及报价。`):'你好，我想寻找一辆日本二手车，你们能帮我找吗？';
 if(value){
  let url=value;
  if(type==='whatsapp'){
   if(/^https:\/\//i.test(value)){const parsed=new URL(value);if(!['wa.me','api.whatsapp.com','web.whatsapp.com'].includes(parsed.hostname))return toast('WhatsApp 地址配置有误，请通过公司邮箱联系。');parsed.searchParams.set('text',message);url=parsed.href}
   else url=`https://wa.me/${value.replace(/\D/g,'')}?text=${encodeURIComponent(message)}`;
  }
  window.open(url,'_blank','noopener');return;
 }
 $('#dialog-title').textContent=type==='whatsapp'?'联系惠澤，开始找车':'Instagram 联系方式';
 $('#dialog-text').textContent=(vehicle?'您咨询的车辆 / 车系：'+vehicle+'。':'')+(type==='whatsapp'?'WhatsApp 联系方式正在确认中。您可以先通过公司邮箱或电话告诉我们购车需求。':'Instagram 联系方式尚未配置，请通过公司邮箱或电话联系我们。');
 $('#contact-dialog').showModal();
}
const fields=[['year','首次登记年份'],['mileageKm','行驶里程'],['grade','具体版本 / 配置'],['fuel','燃料类型'],['transmission','变速箱'],['steering','方向盘位置'],['condition','车况资料'],['repairHistory','维修 / 修复记录']];
function fieldValue(v,key){if(v[key]===null||v[key]===undefined||v[key]==='')return '待核实';return key==='mileageKm'?Number(v[key]).toLocaleString('zh-CN')+' km':escapeHTML(v[key])}
function renderVehicles(){
 $('#vehicle-grid').innerHTML=cfg.vehicles.map(v=>`<article class="vehicle-card"><button class="vehicle-image vehicle-open" data-detail="${escapeHTML(v.id)}" aria-label="查看${escapeHTML(v.name)}照片与资料"><img src="${escapeHTML(v.image)}" srcset="${escapeHTML(v.thumbnail)} 800w, ${escapeHTML(v.image)} 1600w" sizes="(max-width:700px) 100vw, 50vw" width="1600" height="1067" alt="${escapeHTML(v.name)}公司提供实拍" loading="lazy" decoding="async"><span>${v.available?'已确认可售':'实拍展示 · 可售待确认'}</span></button><div class="vehicle-body"><div class="vehicle-reference">${escapeHTML(v.id)} · ${escapeHTML(v.body)}</div><h3><button data-detail="${escapeHTML(v.id)}">${escapeHTML(v.name)} <span>↗</span></button></h3><p class="variant">${v.nameConfirmed?'车型已确认':'车型依据照片初步识别，待核实'}</p><p class="vehicle-description">${escapeHTML(v.description)}</p><dl class="vehicle-specs"><div><dt>年份</dt><dd>${fieldValue(v,'year')}</dd></div><div><dt>里程</dt><dd>${fieldValue(v,'mileageKm')}</dd></div><div><dt>报价</dt><dd>${v.priceJPY?money(v.priceJPY,'JPY'):'确认车辆后报价'}</dd></div></dl><div class="vehicle-buttons"><button class="text-link" data-detail="${escapeHTML(v.id)}">查看照片与资料 <span>↗</span></button><button class="button primary vehicle-consult" data-contact="whatsapp" data-vehicle="${escapeHTML(v.id+' '+v.name)}">咨询这辆车<svg><use href="#wa"/></svg></button></div></div></article>`).join('');
}
function showVehicle(id){const v=cfg.vehicles.find(v=>v.id===id);if(!v)return;
 $('#vehicle-detail').innerHTML=`<div class="detail-photo"><img src="${escapeHTML(v.image)}" alt="${escapeHTML(v.name)}完整实拍照片" width="1600" height="1067"></div><div class="detail-copy"><div class="eyebrow">${escapeHTML(v.id)} · ${v.available?'已确认可售':'实拍展示 · 可售状态待确认'}</div><h2 id="vehicle-title">${escapeHTML(v.name)}</h2><p>${escapeHTML(v.description)}</p><p class="muted">${v.nameConfirmed?'车型已确认。':'车型根据照片初步识别，具体名称与版本请以核实后的车辆资料为准。'}</p><dl class="detail-specs"><div><dt>车身形式</dt><dd>${escapeHTML(v.body)}</dd></div><div><dt>外观颜色</dt><dd>${escapeHTML(v.color)}</dd></div>${fields.map(([key,label])=>`<div><dt>${label}</dt><dd>${fieldValue(v,key)}</dd></div>`).join('')}<div><dt>车辆报价</dt><dd>${v.priceJPY?money(v.priceJPY,'JPY'):'确认车辆后报价'}</dd></div></dl><p class="detail-note">实拍照片不代表车况或销售承诺。出口适用性、费用和交付范围需另行确认。</p><button class="button primary" data-contact="whatsapp" data-vehicle="${escapeHTML(v.id+' '+v.name)}">通过 WhatsApp 咨询这辆车 ↗</button></div>`;
 $('#vehicle-dialog').showModal();
}
function safeGet(k){try{return localStorage.getItem(k)}catch{return null}}function safeSet(k,v){try{localStorage.setItem(k,v)}catch{}}
renderVehicles();
let activeBrand=cfg.brands[0];
function selectBrand(name){activeBrand=cfg.brands.find(b=>b.name===name)||cfg.brands[0];
 document.querySelectorAll('[data-brand]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.brand===activeBrand.name));
 $('#model-heading').textContent=activeBrand.name+' · '+activeBrand.label;
 $('#model-list').innerHTML=activeBrand.models.map(m=>`<button data-model="${escapeHTML(m)}" aria-pressed="false">${escapeHTML(m)} <span>↗</span></button>`).join('');
 $('#model-result').innerHTML='<p class="model-hint">选择心仪车系，我们协助寻找日本二手车源。</p>';
}
$('#brand-list').innerHTML=cfg.brands.map(b=>`<button data-brand="${escapeHTML(b.name)}" aria-pressed="false"><strong>${escapeHTML(b.name)}</strong><small>${escapeHTML(b.label)}</small></button>`).join('');
selectBrand(activeBrand.name);
function selectModel(model){if(!activeBrand.models.includes(model))return;
 document.querySelectorAll('[data-model]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.model===model));
 const vehicles=cfg.vehicles.filter(v=>v.brand===activeBrand.name&&v.model===model);
 $('#model-result').innerHTML=`<div><h4>${escapeHTML(activeBrand.name+' '+model)}</h4><p>${vehicles.length?'有对应实拍车辆，可先查看资料；可售状态需确认。':'目前没有已确认可售车辆。告诉我们预算和目的国家，我们协助寻找。'}</p></div><div class="model-actions">${vehicles.map(v=>`<button class="text-link" data-detail="${escapeHTML(v.id)}">查看实拍车辆 ↗</button>`).join('')}<button class="button primary" data-contact="whatsapp" data-request="true" data-vehicle="${escapeHTML(activeBrand.name+' '+model)}">帮我寻找这款车 ↗</button></div>`;
}
// 本轮中文优先：保留原有全部 10 个语言选项。非中文版翻译完成前不自动切换为未翻译页面。
safeSet('megumi-browser-languages',JSON.stringify(navigator.languages||[navigator.language]));
const theme=safeGet('megumi-theme')||'dark';document.documentElement.dataset.theme=theme;$('#theme').setAttribute('aria-pressed',theme==='light');$('#theme').addEventListener('click',()=>{const t=document.documentElement.dataset.theme==='dark'?'light':'dark';document.documentElement.dataset.theme=t;$('#theme').setAttribute('aria-pressed',t==='light');safeSet('megumi-theme',t)});
$('#language-toggle').addEventListener('click',()=>{const open=$('#language-menu').hidden;$('#language-menu').hidden=!open;$('#language-toggle').setAttribute('aria-expanded',open)});
document.addEventListener('click',e=>{const contactButton=e.target.closest('[data-contact]');if(contactButton)contact(contactButton.dataset.contact,contactButton.dataset.vehicle,contactButton.dataset.request==='true');const detail=e.target.closest('[data-detail]');if(detail)showVehicle(detail.dataset.detail);const brand=e.target.closest('[data-brand]');if(brand)selectBrand(brand.dataset.brand);const model=e.target.closest('[data-model]');if(model)selectModel(model.dataset.model);const l=e.target.closest('[data-lang]');if(l){toast(l.dataset.lang==='zh'?'当前为中文版。':'该语言版本正在准备中，当前先为您呈现中文内容。');safeSet('megumi-preferred-language',l.dataset.lang);$('#language-menu').hidden=true;$('#language-toggle').setAttribute('aria-expanded','false')}if(!e.target.closest('.language-wrap')){$('#language-menu').hidden=true;$('#language-toggle').setAttribute('aria-expanded','false')}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){$('#language-menu').hidden=true;$('#language-toggle').setAttribute('aria-expanded','false')}});
$('#contact-dialog .dialog-close').addEventListener('click',()=>$('#contact-dialog').close());
$('#vehicle-dialog .dialog-close').addEventListener('click',()=>$('#vehicle-dialog').close());
$('#vehicle-dialog').addEventListener('click',e=>{if(e.target===$('#vehicle-dialog')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close()}});$('#contact-dialog').addEventListener('click',e=>{if(e.target===$('#contact-dialog')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close()}});
document.querySelectorAll('#faq-list details').forEach(d=>d.addEventListener('toggle',()=>{if(d.open)document.querySelectorAll('#faq-list details').forEach(other=>{if(other!==d)other.open=false})}));
const addresses={hq:'日本 千葉県柏市柏3-6-3 FS柏ビル',tokyo:'日本 東京都荒川区西日暮里4-23-2 NOAビル'};
function setMap(key){const q=encodeURIComponent(addresses[key]);$('#map-address').textContent=addresses[key]+(key==='hq'?'4階':'302');$('#map').src=`https://maps.google.com/maps?q=${q}&t=&z=16&ie=UTF8&iwloc=&output=embed`;$('#map').title=`惠澤株式会社${key==='hq'?'本社':'东京营业所'} Google 地图`;$('#map-external').href=`https://www.google.com/maps/search/?api=1&query=${q}`;document.querySelectorAll('[data-map]').forEach(b=>{b.classList.toggle('active',b.dataset.map===key);b.setAttribute('aria-pressed',b.dataset.map===key)})}setMap('hq');document.querySelectorAll('[data-map]').forEach(b=>b.addEventListener('click',()=>setMap(b.dataset.map)));
if('IntersectionObserver' in window){document.documentElement.classList.add('js-ready');const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target)}}),{threshold:.08});document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));}
let ticking=false,previousJourneyProgress=null,reverseLightTimer;const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;function scrollEffects(){const rect=$('#process').getBoundingClientRect();const progress=Math.min(1,Math.max(0,(innerHeight*.78-rect.top)/(rect.height*.85)));const car=$('.journey-track>svg');const reversing=previousJourneyProgress!==null&&progress<previousJourneyProgress-.0001;const advancing=previousJourneyProgress!==null&&progress>previousJourneyProgress+.0001;car.classList.toggle('reversing',reversing);car.classList.toggle('advancing',advancing);clearTimeout(reverseLightTimer);if(reversing||advancing)reverseLightTimer=setTimeout(()=>{car.classList.remove('reversing');car.classList.remove('advancing')},450);previousJourneyProgress=progress;car.style.transform=`translate3d(${progress*Math.max(0,car.parentElement.clientWidth-car.clientWidth)}px,0,0)`;document.querySelectorAll('.step').forEach((el,i)=>el.classList.toggle('current',Math.floor(progress*4.99)===i));ticking=false}if(!reduced){addEventListener('scroll',()=>{if(!ticking){requestAnimationFrame(scrollEffects);ticking=true}},{passive:true});scrollEffects()}
const messages=['从需求开始<br>寻找适合您的二手车','按您的预算<br>协助寻找日本车源','从日本出发<br>安排约定的出口运输'];let mi=0;if(!reduced)setInterval(()=>{const el=$('#animated-message');el.style.opacity='0';el.style.transform='translateY(7px)';setTimeout(()=>{el.innerHTML=messages[++mi%messages.length];el.style.opacity='1';el.style.transform='none'},400)},5500);
$('#year').textContent=new Date().getFullYear();
