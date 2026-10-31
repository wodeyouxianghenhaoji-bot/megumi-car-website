/* Focused finder dialog; shared locale and destination context preserve selections. */
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
 const state={open:null,brand:null,model:'',query:'',custom:false,customValue:'',all:false,type:null,typeBrand:'',budget:30000};
 let panelOpen=false,pinned=false,hoverTimer,hideTimer,touchHandled=false;
 let previousFocus=null,scrollPosition=0;
 const backdrop=document.createElement('div');backdrop.id='sf-backdrop';backdrop.hidden=true;root.before(backdrop);
 const background=[...document.body.children].filter(el=>!['SCRIPT','STYLE','SVG'].includes(el.tagName)&&el!==root&&el!==backdrop);
 const savedInert=new Map();
 function setModal(active){
  if(active){previousFocus=document.activeElement;scrollPosition=window.scrollY;background.forEach(el=>{savedInert.set(el,el.inert);el.inert=true});document.body.style.top=`-${scrollPosition}px`;document.body.classList.add('finder-open');backdrop.hidden=false;root.setAttribute('aria-modal','true')}
  else{background.forEach(el=>{el.inert=savedInert.get(el)||false});savedInert.clear();document.body.classList.remove('finder-open');document.body.style.top='';backdrop.hidden=true;root.setAttribute('aria-modal','false');window.scrollTo(0,scrollPosition)}
 }
 backdrop.addEventListener('click',()=>closePanel(true));
 const launcher=document.createElement('button');launcher.id='smart-finder-launcher';launcher.type='button';launcher.className='sf-launcher';launcher.setAttribute('aria-controls',root.id);launcher.setAttribute('aria-haspopup','dialog');launcher.setAttribute('aria-expanded','false');launcher.innerHTML='<span class="sf-orb-glow" aria-hidden="true"></span><span class="sf-orb-label"></span>';root.after(launcher);
 root.setAttribute('role','dialog');root.setAttribute('aria-modal','false');root.setAttribute('aria-hidden','true');root.inert=true;root.dataset.revealed='false';
 const typeCodes=['SUV','Sedan','MPV','Hatchback','Coupe','Pickup','Van'];
 const quickBudgets=[5000,10000,25000,50000,100000,200000];
 const t=()=>messages[language];
 const format=(template,values={})=>template.replace(/\{(\w+)\}/g,(_,key)=>String(values[key]??''));
 const amount=value=>new Intl.NumberFormat(language,{maximumFractionDigits:0,numberingSystem:'latn'}).format(value);
 const budgetLabel=()=>new Intl.NumberFormat(language,{style:'currency',currency:'USD',currencyDisplay:'narrowSymbol',maximumFractionDigits:0,numberingSystem:'latn'}).format(state.budget);
 function whatsapp(message){
  message=window.MEGUMI_CONTACT_CONTEXT?.message(message)||message;
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
  const logo=typeof brand.logo==='string'&&/^assets\/brand-logos\/[a-z0-9-]+\.(svg|png|webp|ico|jpg)$/.test(brand.logo)?brand.logo:null;
  const image=logo?`<span class="sf-logo-box" data-logo-surface="${brand.logoSurface==='dark'?'dark':'light'}"><img src="${esc(logo)}" alt="" aria-hidden="true" width="66" height="40" decoding="async" loading="lazy"></span>`:'';
  return `<button type="button" class="sf-brand" data-sf-brand="${esc(brand.name)}">${image}<span dir="ltr">${esc(brand.name)}</span></button>`;
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
  root.querySelector('[data-sf-type-stage]').innerHTML=`<p class="sf-label">${esc(t().selectType)}</p><div class="sf-types">${typeCodes.map((code,i)=>`<button type="button" class="sf-type" data-sf-type="${code}" aria-pressed="${state.type===code}"><span>${esc(t().types[i])}</span><span class="sf-type-check" aria-hidden="true">${state.type===code?'✓':'+'}</span></button>`).join('')}</div>${state.type?`<label class="sf-field" for="sf-type-brand">${esc(t().optionalBrand)}</label><select id="sf-type-brand" class="sf-input"><option value="">${esc(t().anyBrand)}</option>${brands.map(brand=>`<option value="${esc(brand.name)}" ${brand.name===state.typeBrand?'selected':''}>${esc(brand.name)}</option>`).join('')}</select><div class="sf-type-result">${link(typeMessage())}</div>`:''}`;
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
  root.lang=language;root.dir=language==='ar'?'rtl':'ltr';launcher.querySelector('.sf-orb-label').textContent=t().launcher;launcher.setAttribute('aria-label',t().expand);launcher.title=t().expand;
  root.innerHTML=`<div class="sf-heading"><div><h2 id="sf-title">${esc(t().title)}</h2><p>${esc(t().intro)}</p></div><button type="button" id="sf-close" aria-label="${esc(t().close)}">×</button></div><div class="sf-body"><div class="sf-destination"><label for="sf-destination" data-destination-label></label><select id="sf-destination" data-destination></select></div>${[['brand','▦',t().brand,t().brandSub],['type','◇',t().type,t().typeSub],['budget','$',t().budget,t().budgetSub]].map(([id,mark,label,subtitle])=>`<section class="sf-section"><h3><button type="button" class="sf-choice" id="sf-toggle-${id}" data-sf-toggle="${id}" aria-controls="sf-panel-${id}" aria-expanded="false"><span class="sf-mark" aria-hidden="true">${mark}</span><span class="sf-choice-copy"><strong>${esc(label)}</strong><small>${esc(subtitle)}</small></span><span class="sf-chevron" aria-hidden="true">+</span></button></h3><div class="sf-fold" id="sf-panel-${id}" data-sf-panel="${id}" data-open="false" aria-hidden="true" inert><div class="sf-fold-inner"><div class="sf-content" data-sf-${id}-stage></div></div></div></section>`).join('')}</div><div class="sf-footer">${link(t().directMessage,t().direct,'sf-direct')}<button type="button" class="sf-reset" data-sf-reset>${esc(t().reset)}</button></div>`;
  renderBrand();renderTypes();renderBudget();updateAccordion();position();window.MEGUMI_CONTACT_CONTEXT?.render();
 }
 root.addEventListener('error',event=>{if(event.target.matches('.sf-logo-box img'))event.target.closest('.sf-logo-box').hidden=true},true);
 root.addEventListener('click',event=>{
  const button=event.target.closest('button');if(!button||!root.contains(button))return;
  if(button.id==='sf-close'){closePanel(true);return}
  if(button.hasAttribute('data-sf-toggle')){state.open=state.open===button.dataset.sfToggle?null:button.dataset.sfToggle;updateAccordion()}
  if(button.hasAttribute('data-sf-brand')){state.brand=brands.find(brand=>brand.name===button.dataset.sfBrand)||null;state.model='';state.query='';state.custom=false;state.customValue='';state.all=false;renderBrand();if(matchMedia('(hover: hover) and (pointer: fine)').matches||event.detail===0)root.querySelector('#sf-model-search')?.focus({preventScroll:true})}
  if(button.hasAttribute('data-sf-back')){const previous=state.brand?.name;state.brand=null;renderBrand();[...root.querySelectorAll('[data-sf-brand]')].find(item=>item.dataset.sfBrand===previous)?.focus({preventScroll:true})}
  if(button.hasAttribute('data-sf-model')){if(!state.brand.models.includes(button.dataset.sfModel))return;state.model=button.dataset.sfModel;state.custom=false;root.querySelector('.sf-custom').hidden=true;root.querySelector('[data-sf-other]').setAttribute('aria-expanded','false');renderModelList();renderBrandResult();[...root.querySelectorAll('[data-sf-model]')].find(item=>item.dataset.sfModel===state.model)?.focus({preventScroll:true})}
  if(button.hasAttribute('data-sf-more')){state.all=!state.all;renderModelList();root.querySelector('[data-sf-more]')?.focus({preventScroll:true})}
  if(button.hasAttribute('data-sf-other')){state.custom=!state.custom;button.setAttribute('aria-expanded',state.custom);root.querySelector('.sf-custom').hidden=!state.custom;renderBrandResult();if(state.custom)root.querySelector('#sf-custom-model').focus({preventScroll:true})}
  if(button.hasAttribute('data-sf-type')){state.type=button.dataset.sfType;renderTypes();[...root.querySelectorAll('[data-sf-type]')].find(item=>item.dataset.sfType===state.type)?.focus({preventScroll:true})}
  if(button.hasAttribute('data-sf-quick')){state.budget=Number(button.dataset.sfQuick);updateBudget()}
  if(button.hasAttribute('data-sf-reset')){Object.assign(state,{brand:null,model:'',query:'',custom:false,customValue:'',all:false,type:null,typeBrand:'',budget:30000});renderBrand();renderTypes();renderBudget()}
 });
 root.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();closePanel(true)}if(event.key==='Tab'){const items=[...root.querySelectorAll('button,a[href],input,select')].filter(el=>!el.closest('[inert],[hidden]')&&el.getClientRects().length);const first=items[0],last=items.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus()}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus()}}});
 root.addEventListener('input',event=>{
  if(event.target.id==='sf-model-search'){state.query=event.target.value;state.model='';renderModelList();renderBrandResult()}
  if(event.target.id==='sf-custom-model'){state.customValue=event.target.value;renderBrandResult()}
  if(event.target.id==='sf-budget-slider'){state.budget=Math.max(5000,Math.min(200000,Number(event.target.value)||5000));updateBudget()}
 });
 root.addEventListener('change',event=>{if(event.target.id==='sf-type-brand'){state.typeBrand=brands.some(brand=>brand.name===event.target.value)?event.target.value:'';const anchor=root.querySelector('.sf-type-result a');if(anchor)updateLink(anchor,typeMessage())}});
 window.addEventListener('megumi:languagechange',event=>{const next=matchLanguage(event.detail.language);if(next&&next!==language){language=next;build()}});
 const rebuildContext=()=>{const id=root.contains(document.activeElement)?document.activeElement.id:null;build();if(id)document.getElementById(id)?.focus({preventScroll:true})};
 window.addEventListener('megumi:contextchange',rebuildContext);
 window.addEventListener('megumi:currencychange',rebuildContext);
 window.addEventListener('storage',event=>{if(event.key==='megumi-preferred-language'){language=matchLanguage(event.newValue)||initialLanguage();build()}});
 function cancelHoverClose(){clearTimeout(hoverTimer)}
 function openPanel(pin=false,focus=false){
  cancelHoverClose();clearTimeout(hideTimer);if(launcher.hidden)return;
  if(!panelOpen)setModal(true);pinned=true;panelOpen=true;root.hidden=false;root.inert=false;root.setAttribute('aria-hidden','false');launcher.setAttribute('aria-expanded','true');
  position();requestAnimationFrame(()=>{if(panelOpen)root.dataset.revealed='true'});
  root.querySelector('#sf-close')?.focus({preventScroll:true});
 }
 function closePanel(restoreFocus=false,immediate=false){
  cancelHoverClose();clearTimeout(hideTimer);if(panelOpen)setModal(false);panelOpen=false;pinned=false;root.dataset.revealed='false';root.inert=true;root.setAttribute('aria-hidden','true');launcher.setAttribute('aria-expanded','false');
  if(immediate)root.hidden=true;else hideTimer=setTimeout(()=>{if(!panelOpen)root.hidden=true},240);
  if(restoreFocus)(previousFocus?.isConnected?previousFocus:launcher).focus({preventScroll:true});
 }
 function hoverClose(){cancelHoverClose();if(!pinned)hoverTimer=setTimeout(()=>{if(!pinned&&!root.contains(document.activeElement))closePanel()},340)}
 launcher.addEventListener('pointerdown',event=>{if(event.pointerType==='touch'||event.pointerType==='pen'){touchHandled=true;if(panelOpen)closePanel();else openPanel(true)}});
 launcher.addEventListener('pointercancel',()=>{touchHandled=false});
 launcher.addEventListener('click',()=>{if(touchHandled){touchHandled=false;return}if(panelOpen&&!pinned){pinned=true;return}if(panelOpen)closePanel();else openPanel(true)});
 launcher.addEventListener('keydown',event=>{if(event.key==='ArrowDown'){event.preventDefault();openPanel(true,true)}if(event.key==='Escape')closePanel(true)});
 document.addEventListener('pointerdown',event=>{if(panelOpen&&!root.contains(event.target)&&!launcher.contains(event.target))closePanel()});
 function position(){
  const viewport=window.visualViewport;
  const width=viewport?.width||window.innerWidth,height=viewport?.height||window.innerHeight;
  const mobile=width<=700,floating=header.classList.contains('is-scrolled');
  launcher.hidden=!panelOpen&&!mobile&&!floating;
  const dockRect=dock.getBoundingClientRect(),contactRect=dock.querySelector('.whatsapp')?.getBoundingClientRect();
  const anchor=contactRect?.width?contactRect:dockRect;
  const orbSize=mobile?64:120;
  const anchorCenter=anchor.left+anchor.width/2;
  const center=Math.max(orbSize/2+12,Math.min(width-orbSize/2-12,anchorCenter));
  const orbTop=mobile?Math.max(12,height-orbSize-24):Math.max(12,anchor.bottom+16);
  const keyboardInset=Math.max(0,window.innerHeight-height-(viewport?.offsetTop||0));
  launcher.style.setProperty('--sf-orb-right',`${mobile?16:width-center-orbSize/2}px`);
  launcher.style.setProperty('--sf-orb-top',`${orbTop}px`);
  launcher.style.setProperty('--sf-orb-bottom','auto');
  const panelWidth=mobile?width-20:Math.min(560,width-40);
  const top=(viewport?.offsetTop||0)+12;
  root.style.setProperty('--sf-width',`${panelWidth}px`);root.style.setProperty('--sf-right',`${(width-panelWidth)/2}px`);root.style.setProperty('--sf-top',`${top}px`);root.style.setProperty('--sf-bottom','auto');root.style.setProperty('--sf-max-height',`${Math.max(120,height-24)}px`);root.dataset.placement='top';
  if(launcher.hidden){closePanel(false,true);return}
  if(!panelOpen&&root.dataset.revealed!=='true')root.hidden=true;
 }
 // Before the mobile header docks, follow the actual WhatsApp button as it scrolls.
 let anchorFrame=false;
 window.addEventListener('scroll',()=>{if(window.innerWidth<=700&&!header.classList.contains('is-scrolled')&&!anchorFrame){anchorFrame=true;requestAnimationFrame(()=>{position();anchorFrame=false})}},{passive:true});
 new MutationObserver(position).observe(header,{attributes:true,attributeFilter:['class']});
 if('ResizeObserver' in window)new ResizeObserver(position).observe(dock);
 window.addEventListener('resize',position,{passive:true});window.visualViewport?.addEventListener('resize',position,{passive:true});
 document.addEventListener('visibilitychange',()=>{launcher.dataset.paused=String(document.hidden);root.dataset.paused=String(document.hidden)});
 build();
 fetch('finder-data.json?v=2').then(response=>{if(!response.ok)throw Error('catalogue');return response.json()}).then(data=>{
  if(!Array.isArray(data.brands)||data.brands.length!==20||data.brands.some(brand=>typeof brand.name!=='string'||!Array.isArray(brand.models)||brand.models.some(model=>typeof model!=='string')))throw Error('catalogue');
  brands=data.brands;renderBrand();renderTypes();
 }).catch(()=>{loadFailed=true;renderBrand()});
})();
