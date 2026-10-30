/* Isolated finder. No mutations of existing navigation, contacts, theme or page content. */
(() => {
 'use strict';
 const root=document.getElementById('smart-finder');
 const dock=document.querySelector('.topbar .header-actions');
 const header=document.querySelector('.topbar');
 const messages=window.MEGUMI_FINDER_I18N;
 if(!root||!dock||!header||!messages)return;
 const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const readPref=()=>{try{return localStorage.getItem('megumi-preferred-language')}catch{return null}};
 const matchLanguage=value=>{const code=String(value||'').replace('_','-').toLowerCase().split('-')[0];return Object.hasOwn(messages,code)?code:null};
 function initialLanguage(){const saved=matchLanguage(readPref());if(saved)return saved;for(const value of navigator.languages||[navigator.language]){const language=matchLanguage(value);if(language)return language}return 'en'}
 let language=initialLanguage(),brands=[],loadFailed=false;
 const state={open:null,minimized:false,brand:null,model:'',query:'',custom:false,customValue:'',all:false,type:null,typeBrand:'',budget:30000};
 const typeCodes=['SUV','Sedan','MPV','Hatchback','Coupe','Pickup','Van'];
 const quickBudgets=[5000,10000,25000,50000,100000,200000];
 const t=()=>messages[language];
 const format=(template,values={})=>template.replace(/\{(\w+)\}/g,(_,key)=>String(values[key]??''));
 const amount=value=>new Intl.NumberFormat(language,{maximumFractionDigits:0,numberingSystem:'latn'}).format(value);
 const budgetLabel=()=>new Intl.NumberFormat(language,{style:'currency',currency:'USD',currencyDisplay:'narrowSymbol',maximumFractionDigits:0,numberingSystem:'latn'}).format(state.budget);
 function whatsapp(message){
  const configured=window.SITE_CONFIG?.whatsapp;
  if(!configured)return '';
  try{const url=/^https:\/\//i.test(configured)?new URL(configured):new URL('https://wa.me/'+configured.replace(/\D/g,''));if(url.protocol!=='https:'||!['wa.me','api.whatsapp.com','web.whatsapp.com'].includes(url.hostname))return '';url.searchParams.set('text',message);return url.href}catch{return ''}
 }
 function link(message,label=t().request,classes='sf-cta'){
  const href=whatsapp(message);
  return href?`<a class="${classes}" href="${esc(href)}" target="_blank" rel="noopener noreferrer">${esc(label)}<span aria-hidden="true">↗</span></a>`:`<span class="sf-error" role="status">${esc(t().error)}</span>`;
 }
 function updateLink(element,message){const href=whatsapp(message);if(href)element.href=href;else element.removeAttribute('href')}
 function brandButton(brand){
  // Logo files remain null until commercial usage for this site is verified.
  // This is ordinary text, never a recreation of a wordmark or emblem.
  return `<button type="button" class="sf-brand" data-sf-brand="${esc(brand.name)}"><span dir="ltr">${esc(brand.name)}</span></button>`;
 }
 function renderBrand(){
  const stage=root.querySelector('[data-sf-brand-stage]');
  if(!state.brand){stage.innerHTML=`<p class="sf-label">${esc(t().chooseBrand)}</p>${loadFailed?`<p class="sf-error" role="status">${esc(t().error)}</p>`:''}<div class="sf-brands">${brands.map(brandButton).join('')}</div><p class="sf-note">${esc(t().catalogNote)}</p>`;return}
  stage.innerHTML=`<div class="sf-stage-heading"><button type="button" class="sf-back" data-sf-back>‹ ${esc(t().back)}</button><strong dir="ltr">${esc(state.brand.name)}</strong></div><label class="sf-field" for="sf-model-search">${esc(t().search)}</label><input id="sf-model-search" class="sf-input" type="search" maxlength="80" placeholder="${esc(t().search)}" autocomplete="off" value="${esc(state.query)}"><div class="sf-model-grid"></div><div class="sf-more-row"></div><button class="sf-other" type="button" data-sf-other aria-expanded="${state.custom}">${esc(t().other)} ↗</button><div class="sf-custom" ${state.custom?'':'hidden'}><label class="sf-field" for="sf-custom-model">${esc(t().custom)}</label><input id="sf-custom-model" class="sf-input" type="text" maxlength="80" autocomplete="off" value="${esc(state.customValue)}"></div><div class="sf-brand-result" aria-live="polite"></div><p class="sf-note">${esc(t().catalogNote)}</p>`;
  renderModelList();renderBrandResult();
 }
 function matchingModels(){const query=state.query.trim().normalize('NFKC').toLocaleLowerCase();return state.brand.models.filter(model=>model.normalize('NFKC').toLocaleLowerCase().includes(query))}
 function renderModelList(){
  const filtered=matchingModels(),visible=state.query||state.all?filtered:filtered.slice(0,8);
  root.querySelector('.sf-model-grid').innerHTML=visible.length?visible.map(model=>`<button type="button" class="sf-model" data-sf-model="${esc(model)}" aria-pressed="${state.model===model}"><span dir="auto">${esc(model)}</span><span aria-hidden="true">${state.model===model?'✓':'+'}</span></button>`).join(''):`<p class="sf-empty">${esc(t().notFound)}</p>`;
  root.querySelector('.sf-more-row').innerHTML=!state.query&&state.brand.models.length>8?`<button type="button" class="sf-more" data-sf-more aria-expanded="${state.all}">${esc(state.all?t().less:format(t().more,{count:state.brand.models.length}))} <span aria-hidden="true">${state.all?'−':'+'}</span></button>`:'';
 }
 function renderBrandResult(){
  const chosen=state.custom?state.customValue.trim():(state.model||(!matchingModels().length?state.query.trim():''));
  const result=root.querySelector('.sf-brand-result');
  result.innerHTML=chosen?`<div class="sf-selection"><span>${esc(t().selected)}</span><strong dir="auto">${esc(state.brand.name+' '+chosen)}</strong></div>${link(format(t().modelMessage,{brand:state.brand.name,model:chosen}))}`:'';
 }
 function typeMessage(){return format(t().typeMessage,{type:t().types[typeCodes.indexOf(state.type)],brand:state.typeBrand||t().anyBrand})}
 function renderTypes(){
  root.querySelector('[data-sf-type-stage]').innerHTML=`<p class="sf-label">${esc(t().selectType)}</p><div class="sf-types">${typeCodes.map((code,i)=>`<button type="button" class="sf-type" data-sf-type="${code}" aria-pressed="${state.type===code}"><span class="sf-type-number" aria-hidden="true">0${i+1}</span><span>${esc(t().types[i])}</span><span class="sf-type-check" aria-hidden="true">${state.type===code?'✓':'+'}</span></button>`).join('')}</div>${state.type?`<label class="sf-field" for="sf-type-brand">${esc(t().optionalBrand)}</label><select id="sf-type-brand" class="sf-input"><option value="">${esc(t().anyBrand)}</option>${brands.map(brand=>`<option value="${esc(brand.name)}" ${brand.name===state.typeBrand?'selected':''}>${esc(brand.name)}</option>`).join('')}</select><div class="sf-type-result">${link(typeMessage())}</div>`:''}`;
 }
 function budgetMessage(){return format(t().budgetMessage,{budget:amount(state.budget)})}
 function renderBudget(){
  root.querySelector('[data-sf-budget-stage]').innerHTML=`<label class="sf-label" for="sf-budget-slider">${esc(t().maxBudget)}</label><div class="sf-amount"><output id="sf-budget-output" for="sf-budget-slider">${esc(budgetLabel())}</output><span>${esc(t().currency)}</span></div><input id="sf-budget-slider" class="sf-range" type="range" min="5000" max="200000" step="1000" value="${state.budget}" aria-describedby="sf-budget-note" aria-valuetext="${esc(budgetLabel()+' USD')}"><div class="sf-range-ends" aria-hidden="true"><span dir="ltr">$5,000</span><span dir="ltr">$200,000</span></div><div class="sf-quick">${quickBudgets.map(value=>`<button type="button" data-sf-quick="${value}" aria-pressed="${state.budget===value}"><span dir="ltr">$${amount(value)}</span></button>`).join('')}</div><p id="sf-budget-note" class="sf-note">${esc(t().budgetNote)}</p><div class="sf-budget-result">${link(budgetMessage())}</div>`;
  updateBudget();
 }
 function updateBudget(){
  const slider=root.querySelector('#sf-budget-slider');slider.value=state.budget;slider.setAttribute('aria-valuetext',budgetLabel()+' USD');slider.style.setProperty('--sf-progress',`${(state.budget-5000)/195000*100}%`);
  root.querySelector('#sf-budget-output').textContent=budgetLabel();root.querySelectorAll('[data-sf-quick]').forEach(button=>button.setAttribute('aria-pressed',Number(button.dataset.sfQuick)===state.budget));
  const anchor=root.querySelector('.sf-budget-result a');if(anchor)updateLink(anchor,budgetMessage());
 }
 function updateAccordion(){
  root.querySelectorAll('[data-sf-toggle]').forEach(button=>button.setAttribute('aria-expanded',button.dataset.sfToggle===state.open));
  root.querySelectorAll('[data-sf-panel]').forEach(panel=>{const open=panel.dataset.sfPanel===state.open;panel.dataset.open=String(open);panel.setAttribute('aria-hidden',String(!open));panel.inert=!open});
 }
 function build(){
  root.lang=language;root.dir=language==='ar'?'rtl':'ltr';root.dataset.minimized=String(state.minimized);
  root.innerHTML=`<div class="sf-heading"><div><h2 id="sf-title">${esc(t().title)}</h2><p>${esc(t().intro)}</p></div><button type="button" id="sf-minimize" aria-label="${esc(state.minimized?t().expand:t().minimize)}" aria-expanded="${!state.minimized}">${state.minimized?'+':'−'}</button></div><div class="sf-body" ${state.minimized?'hidden':''}>${[['brand','01',t().brand,t().brandSub],['type','02',t().type,t().typeSub],['budget','03',t().budget,t().budgetSub]].map(([id,number,label,subtitle])=>`<section class="sf-section"><h3><button type="button" class="sf-choice" id="sf-toggle-${id}" data-sf-toggle="${id}" aria-controls="sf-panel-${id}" aria-expanded="false"><span class="sf-number" aria-hidden="true">${number}</span><span class="sf-choice-copy"><strong>${esc(label)}</strong><small>${esc(subtitle)}</small></span><span class="sf-chevron" aria-hidden="true">+</span></button></h3><div class="sf-fold" id="sf-panel-${id}" data-sf-panel="${id}" data-open="false" aria-hidden="true" inert><div class="sf-fold-inner"><div class="sf-content" data-sf-${id}-stage></div></div></div></section>`).join('')}</div><div class="sf-footer" ${state.minimized?'hidden':''}>${link(t().directMessage,t().direct,'sf-direct')}<button type="button" class="sf-reset" data-sf-reset>${esc(t().reset)}</button></div>`;
  renderBrand();renderTypes();renderBudget();updateAccordion();position();
 }
 root.addEventListener('click',event=>{
  const button=event.target.closest('button');if(!button||!root.contains(button))return;
  if(button.id==='sf-minimize'){state.minimized=!state.minimized;root.dataset.minimized=String(state.minimized);root.querySelector('.sf-body').hidden=state.minimized;root.querySelector('.sf-footer').hidden=state.minimized;button.textContent=state.minimized?'+':'−';button.setAttribute('aria-label',state.minimized?t().expand:t().minimize);button.setAttribute('aria-expanded',!state.minimized);position()}
  if(button.hasAttribute('data-sf-toggle')){state.open=state.open===button.dataset.sfToggle?null:button.dataset.sfToggle;updateAccordion()}
  if(button.hasAttribute('data-sf-brand')){state.brand=brands.find(brand=>brand.name===button.dataset.sfBrand)||null;state.model='';state.query='';state.custom=false;state.customValue='';state.all=false;renderBrand();root.querySelector('#sf-model-search')?.focus({preventScroll:true})}
  if(button.hasAttribute('data-sf-back')){const previous=state.brand?.name;state.brand=null;renderBrand();[...root.querySelectorAll('[data-sf-brand]')].find(item=>item.dataset.sfBrand===previous)?.focus({preventScroll:true})}
  if(button.hasAttribute('data-sf-model')){if(!state.brand.models.includes(button.dataset.sfModel))return;state.model=button.dataset.sfModel;state.custom=false;root.querySelector('.sf-custom').hidden=true;root.querySelector('[data-sf-other]').setAttribute('aria-expanded','false');renderModelList();renderBrandResult();[...root.querySelectorAll('[data-sf-model]')].find(item=>item.dataset.sfModel===state.model)?.focus({preventScroll:true})}
  if(button.hasAttribute('data-sf-more')){state.all=!state.all;renderModelList();root.querySelector('[data-sf-more]')?.focus({preventScroll:true})}
  if(button.hasAttribute('data-sf-other')){state.custom=!state.custom;button.setAttribute('aria-expanded',state.custom);root.querySelector('.sf-custom').hidden=!state.custom;renderBrandResult();if(state.custom)root.querySelector('#sf-custom-model').focus({preventScroll:true})}
  if(button.hasAttribute('data-sf-type')){state.type=button.dataset.sfType;renderTypes();[...root.querySelectorAll('[data-sf-type]')].find(item=>item.dataset.sfType===state.type)?.focus({preventScroll:true})}
  if(button.hasAttribute('data-sf-quick')){state.budget=Number(button.dataset.sfQuick);updateBudget()}
  if(button.hasAttribute('data-sf-reset')){Object.assign(state,{brand:null,model:'',query:'',custom:false,customValue:'',all:false,type:null,typeBrand:'',budget:30000});renderBrand();renderTypes();renderBudget()}
 });
 root.addEventListener('keydown',event=>{if(event.key==='Escape'&&state.open){const previous=state.open;state.open=null;updateAccordion();root.querySelector(`[data-sf-toggle="${previous}"]`)?.focus({preventScroll:true})}});
 root.addEventListener('input',event=>{
  if(event.target.id==='sf-model-search'){state.query=event.target.value;state.model='';renderModelList();renderBrandResult()}
  if(event.target.id==='sf-custom-model'){state.customValue=event.target.value;renderBrandResult()}
  if(event.target.id==='sf-budget-slider'){state.budget=Math.max(5000,Math.min(200000,Number(event.target.value)||5000));updateBudget()}
 });
 root.addEventListener('change',event=>{if(event.target.id==='sf-type-brand'){state.typeBrand=brands.some(brand=>brand.name===event.target.value)?event.target.value:'';const anchor=root.querySelector('.sf-type-result a');if(anchor)updateLink(anchor,typeMessage())}});
 document.addEventListener('click',event=>{const option=event.target.closest('[data-lang]');if(option){const next=matchLanguage(option.dataset.lang);if(next&&next!==language){language=next;build()}}});
 window.addEventListener('storage',event=>{if(event.key==='megumi-preferred-language'){language=matchLanguage(event.newValue)||initialLanguage();build()}});
 function position(){
  const floating=header.classList.contains('is-scrolled');root.hidden=!floating;if(!floating)return;
  const rect=dock.getBoundingClientRect();const viewport=window.visualViewport;
  const width=viewport?.width||window.innerWidth,height=viewport?.height||window.innerHeight;
  root.style.setProperty('--sf-width',`${Math.min(Math.max(rect.width,340),540,width-20)}px`);
  root.style.setProperty('--sf-right',`${Math.max(10,width-rect.right)}px`);
  root.style.setProperty('--sf-top',`${Math.max(0,rect.bottom)+12}px`);
  root.style.setProperty('--sf-max-height',`${Math.max(80,height-rect.bottom-28)}px`);
 }
 new MutationObserver(position).observe(header,{attributes:true,attributeFilter:['class']});
 if('ResizeObserver' in window)new ResizeObserver(position).observe(dock);
 window.addEventListener('resize',position,{passive:true});window.visualViewport?.addEventListener('resize',position,{passive:true});
 build();
 fetch('finder-data.json').then(response=>{if(!response.ok)throw Error('catalogue');return response.json()}).then(data=>{
  if(!Array.isArray(data.brands)||data.brands.length!==20||data.brands.some(brand=>typeof brand.name!=='string'||!Array.isArray(brand.models)||brand.models.some(model=>typeof model!=='string')))throw Error('catalogue');
  brands=data.brands;renderBrand();renderTypes();
 }).catch(()=>{loadFailed=true;renderBrand()});
})();
