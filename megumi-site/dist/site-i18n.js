/* One language preference for the whole site, dialogs, contacts and finder. */
(() => {
 'use strict';
 const catalogs=window.MEGUMI_SITE_I18N;
 const languages=[['zh','中文'],['en','English'],['ar','العربية'],['ja','日本語'],['nl','Nederlands'],['fr','Français'],['de','Deutsch'],['it','Italiano'],['pt','Português'],['ru','Русский'],['es','Español']];
 const get=key=>{try{return localStorage.getItem(key)}catch{return null}};
 const set=(key,value)=>{try{localStorage.setItem(key,value)}catch{}};
 const match=value=>{const code=String(value||'').replaceAll('_','-').toLowerCase().split('-')[0];return Object.hasOwn(catalogs,code)?code:null};
 let preference=get('megumi-language-choice')||'auto';
 const detect=()=>{for(const locale of navigator.languages?.length?navigator.languages:[navigator.language]){const code=match(locale);if(code)return code}return 'en'};
 let language=preference==='auto'?detect():(match(preference)||detect());
 const languagePicker=window.MEGUMI_CHOOSER.create('language-dialog');
 const languageMenu=document.querySelector('#language-menu');languageMenu.hidden=false;languagePicker.content.append(languageMenu);
 document.querySelector('#language-toggle').setAttribute('aria-haspopup','dialog');document.querySelector('#language-toggle').setAttribute('aria-controls','language-dialog');
 const textRecords=new WeakMap(),attributeRecords=new WeakMap(),blocks=new WeakMap();
 const keys=Object.keys(catalogs.zh).sort((a,b)=>b.length-a.length);
 const patterns=keys.filter(key=>key.includes('{')).map(key=>{
  const names=[];const expression=key.split(/(\{\w+\})/g).map(part=>{if(/^\{\w+\}$/.test(part)){names.push(part.slice(1,-1));return '([\\s\\S]+?)'}return part.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}).join('');
  return {key,names,re:new RegExp('^'+expression+'$')};
 });
 function t(source,values={}){
  const template=catalogs[language][source]??catalogs.en[source]??source;
  return template.replace(/\{(\w+)\}/g,(_,key)=>String(values[key]??'{'+key+'}'));
 }
 function translate(source){
  if(!source||!/[\u3400-\u9fff]/.test(source))return source;
  const raw=source.trim();let translated;
  if(Object.hasOwn(catalogs[language],raw))translated=t(raw);
  else {
   for(const {key,names,re} of patterns){const m=raw.match(re);if(m){translated=t(key,Object.fromEntries(names.map((name,i)=>[name,translate(m[i+1])])));break}}
   if(translated===undefined){translated=raw;for(const key of keys){if(!key.includes('{')&&translated.includes(key))translated=translated.split(key).join(t(key))}}
  }
  return source.slice(0,source.indexOf(raw))+translated+source.slice(source.indexOf(raw)+raw.length);
 }
 function text(node){
  const prior=textRecords.get(node),current=node.data;
  const original=prior&&current===prior.last?prior.original:current;
  const value=translate(original);textRecords.set(node,{original,last:value});if(current!==value)node.data=value;
 }
 function attributes(element){
  const records=attributeRecords.get(element)||{};
  for(const name of ['aria-label','aria-roledescription','title','alt','placeholder']){
   if(!element.hasAttribute(name))continue;
   const current=element.getAttribute(name),prior=records[name],original=prior&&current===prior.last?prior.original:current;
   const value=translate(original);records[name]={original,last:value};if(current!==value)element.setAttribute(name,value);
  }
  attributeRecords.set(element,records);
 }
 function visit(node){
  if(node.nodeType===Node.TEXT_NODE){if(!node.parentElement?.closest('script,style,#smart-finder,#language-menu,#language-toggle,[data-i18n-block]'))text(node);return}
  if(node.nodeType!==Node.ELEMENT_NODE||node.matches('script,style,#smart-finder,#language-menu,#language-toggle'))return;
  attributes(node);
  if(node.hasAttribute('data-i18n-block')){
   if(!blocks.has(node))blocks.set(node,node.innerHTML);
   if(language==='zh')node.innerHTML=blocks.get(node);else node.textContent=t(node.dataset.i18nBlock);
   return;
  }
  [...node.childNodes].forEach(visit);
 }
 function menu(){
  const toggle=document.querySelector('#language-toggle'),container=document.querySelector('#language-menu');
  const native=language==='zh'?'中文':languages.find(([code])=>code===language)[1];
  languagePicker.title.textContent=t('语言');languagePicker.closeButton.setAttribute('aria-label',t('关闭弹窗'));
  toggle.replaceChildren(document.createTextNode(native),Object.assign(document.createElement('span'),{textContent:'⌄'}));
  toggle.setAttribute('aria-label',t('语言')+': '+native);
  container.replaceChildren();
  for(const [code,name] of [['auto',t('自动（跟随系统）')],...languages]){
   const button=document.createElement('button');button.type='button';button.dataset.lang=code;button.lang=code==='auto'?language:code;button.dir=code==='ar'?'rtl':'ltr';
   button.setAttribute('aria-current',String(code===preference));button.classList.toggle('active',code===preference);const label=document.createElement('span');label.textContent=name;button.append(label);
   if(code===preference){const label=document.createElement('small');label.textContent=t('当前');button.append(label)}container.append(button);
  }
 }
 function apply(){
  const observerWasActive=started;observer.disconnect();
  document.documentElement.lang=language==='zh'?'zh-CN':language;
  document.documentElement.dir=language==='ar'?'rtl':'ltr';
  visit(document.body);menu();document.title='MEGUMI · '+t('日本二手车采购与出口');
  document.querySelector('meta[name=description]').content=t('告诉我们您期望的品牌、车型、年份、预算和目的国家，让找车从一次简单的对话开始。');
  set('megumi-preferred-language',language);
  if(observerWasActive)observe();
  window.dispatchEvent(new CustomEvent('megumi:languagechange',{detail:{language,preference}}));
 }
 function choose(value){preference=value==='auto'?'auto':match(value)||'auto';language=preference==='auto'?detect():preference;set('megumi-language-choice',preference);apply()}
 const observer=new MutationObserver(changes=>{
  observer.disconnect();
  for(const change of changes){if(change.type==='characterData')visit(change.target);else if(change.type==='attributes'){if(!change.target.closest('#smart-finder,#language-menu,#language-toggle'))attributes(change.target)}else change.addedNodes.forEach(visit)}
  observe();
 });
 let started=false;
 function observe(){observer.observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['aria-label','aria-roledescription','title','alt','placeholder']})}
 const blockSelectors=[['.hero h1','在日本寻找您的下一辆座驾'],['.about-copy h2','日本二手车寻找服务'],['.contact-heading h2','您的购车计划从一次对话开始']];
 blockSelectors.forEach(([selector,key])=>document.querySelector(selector).dataset.i18nBlock=key);
 window.MEGUMI_I18N={t,translate,match,choose,get language(){return language},get preference(){return preference},languages};
 const header=document.querySelector('.topbar');
 const reserveHeaderSpace=()=>{if(window.innerWidth<=700&&!header.classList.contains('is-scrolled')){const height=header.getBoundingClientRect().height;if(height>0)document.documentElement.style.setProperty('--mobile-header-height',Math.ceil(height)+'px')}};
 if('ResizeObserver' in window)new ResizeObserver(reserveHeaderSpace).observe(header);
 window.addEventListener('resize',reserveHeaderSpace,{passive:true});window.addEventListener('megumi:languagechange',()=>requestAnimationFrame(reserveHeaderSpace));
 document.querySelector('#language-toggle').addEventListener('click',event=>languagePicker.open(event.currentTarget));
 document.addEventListener('click',event=>{const option=event.target.closest('#language-menu [data-lang]');if(option){choose(option.dataset.lang);languagePicker.close()}});
 window.addEventListener('languagechange',()=>{if(preference==='auto'){language=detect();apply()}});
 window.addEventListener('storage',event=>{if(event.key==='megumi-language-choice'){preference=event.newValue||'auto';language=preference==='auto'?detect():match(preference)||detect();apply()}});
 apply();started=true;observe();reserveHeaderSpace();
})();
