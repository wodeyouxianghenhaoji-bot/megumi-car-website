// Run: node tools/verify-locales-prices.mjs <path-to-happy-dom/lib/index.js>
// This is DOM/logic QA, not a claim of real-browser layout verification.
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import vm from 'node:vm';
const {Window}=await import(pathToFileURL(path.resolve(process.argv[2])).href);
const dist=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../dist');
const html=fs.readFileSync(path.join(dist,'index.html'),'utf8');
const catalog=JSON.parse(fs.readFileSync(path.join(dist,'finder-data.json'),'utf8'));
const files=['config.js','app.js','finder-i18n.js','smart-finder.js','site-i18n-data.js','choice-dialog.js','site-i18n.js','contact-context.js','assets/territory-currencies.js','prices.js'];
const tick=()=>new Promise(resolve=>setTimeout(resolve,15));
let checks=0;
const check=(condition,message)=>{assert.ok(condition,message);checks++};
async function setup({locales=['en-US'],width=390,offline=false,storageBlocked=false,cached=false,savedLanguage=null,keyboard=false}={}){
 const w=new Window({url:'https://megumi-cars.pages.dev/',settings:{disableCSSFileLoading:true,disableJavaScriptFileLoading:true,disableIframePageLoading:true,enableJavaScriptEvaluation:true,suppressInsecureJavaScriptEnvironmentWarning:true}});
 const errors=[];w.addEventListener('error',event=>errors.push(event.message));
 Object.defineProperty(w.navigator,'languages',{value:locales,configurable:true});Object.defineProperty(w.navigator,'language',{value:locales[0],configurable:true});
 w.happyDOM.setWindowSize({width,height:844});
 if(keyboard){const viewport=new w.EventTarget();Object.assign(viewport,{width,height:844,offsetTop:0});Object.defineProperty(w,'visualViewport',{value:viewport})}
 w.matchMedia=query=>({matches:query.includes('prefers-reduced-motion')||width>700&&query.includes('hover: hover'),addEventListener(){},removeEventListener(){}});
 w.document.write(html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,''));
 let requests=0;
 const now=Math.floor(Date.now()/1000),rates={result:'success',base_code:'JPY',time_last_update_unix:now-600,time_next_update_unix:now+86000,rates:{JPY:1,USD:.0067,AED:.0246,SAR:.0251,CNY:.047,EUR:.0062,RUB:.62,GBP:.005,QAR:.024,OMR:.0025,KWD:.002,BHD:.0025,EGP:.3,JOD:.0047,IQD:8,LBP:600,SYP:90,ILS:.024,YER:1.5,LYD:.032,TND:.02,DZD:.9,MAD:.06,MRU:.26,SDG:4,SOS:3.8,DJF:1.2,KMF:3}};
 if(cached){rates.time_next_update_unix=now-60;w.localStorage.setItem('megumi-fx-jpy-v1',JSON.stringify(rates))}
 if(savedLanguage){w.localStorage.setItem('megumi-language-choice',savedLanguage);w.localStorage.setItem('megumi-language-policy','system-auto-v2');w.localStorage.setItem('megumi-system-language-signature',JSON.stringify(locales))}
 if(storageBlocked)Object.defineProperty(w,'localStorage',{get(){throw Error('Storage unavailable')}});
 w.fetch=async url=>{if(String(url).includes('finder-data'))return {ok:true,json:async()=>catalog};requests++;if(offline)throw Error('offline');return {ok:true,json:async()=>rates}};
 const opened=[];w.open=url=>{opened.push(url);return null};
 for(const file of files){const code=fs.readFileSync(path.join(dist,file),'utf8');new vm.Script(code);w.eval(code)}
 await tick();return {w,d:w.document,opened,errors,rates,get requests(){return requests}};
}
const ctx=await setup();const {w,d,opened,errors}=ctx;
check(w.MEGUMI_I18N.language==='en','Automatic English');
check(d.documentElement.dir==='ltr','English LTR');
check(d.querySelectorAll('#language-menu [data-lang]').length===12,'11 languages and automatic mode');
check(ctx.requests===1,'One rates request');
check(w.MEGUMI_PRICES.snapshot.rates.AED===.0246,'Validated AED rates');
check(w.MEGUMI_CONTACT_CONTEXT.codes.length===249,'249 country and territory choices');
check(w.MEGUMI_PRICES.validate({...ctx.rates,base_code:'USD'})===null,'Reject wrong rate base');
check(w.MEGUMI_PRICES.validate({...ctx.rates,rates:{JPY:1,USD:0,AED:1,SAR:1}})===null,'Reject zero exchange rate');
const getText=()=>d.body.textContent;
const langButton=d.querySelector('#language-toggle');langButton.click();check(d.querySelector('#language-dialog').open,'Language opens native centered modal');check(d.body.classList.contains('choice-open'),'Language locks background scroll');
check(d.querySelector('#language-dialog').parentElement===d.body,'Language dialog outside header clipping');
check([...d.querySelectorAll('#language-menu [data-lang]')].every(button=>button.textContent.trim()),'No empty language row');
check(d.querySelector('[data-lang=ar] span').textContent==='العربية','Arabic autonym visible');check(d.querySelector('[data-lang=zh] span').textContent==='中文','Chinese autonym');
d.querySelector('[data-lang=zh]').click();await tick();check(!d.querySelector('#language-dialog').open,'Language choice closes immediately');
langButton.click();d.querySelector('[data-lang=auto]').click();await tick();check(d.querySelector('[data-lang=auto]').getAttribute('aria-current')==='true','Automatic remains available and current');
for(const [language] of w.MEGUMI_I18N.languages){
 w.MEGUMI_I18N.choose(language);await tick();
 check(d.documentElement.lang===(language==='zh'?'zh-CN':language),'Document language '+language);
 check(d.documentElement.dir===(language==='ar'?'rtl':'ltr'),'Direction '+language);
 check(d.getElementById('smart-finder').lang===language,'Finder sync '+language);
 check(!getText().includes('即将推出'),'No placeholder '+language);
 const keys=Object.keys(w.MEGUMI_SITE_I18N.en).sort();check(JSON.stringify(Object.keys(w.MEGUMI_SITE_I18N[language]).sort())===JSON.stringify(keys),'Complete catalog '+language);
 const finderKeys=Object.keys(w.MEGUMI_FINDER_I18N.en).sort();check(JSON.stringify(Object.keys(w.MEGUMI_FINDER_I18N[language]).sort())===JSON.stringify(finderKeys),'Complete finder '+language);
 if(!['zh','ja'].includes(language)){
  const nodes=[];const walker=d.createTreeWalker(d.body,w.NodeFilter.SHOW_TEXT);let node;
  while(node=walker.nextNode()){if(!node.parentElement.closest('#language-menu,script,style,svg,select')&&/[\u3400-\u9fff]/.test(node.data))nodes.push(node.data.trim())}
  check(nodes.length===0,language+' untranslated text: '+JSON.stringify([...new Set(nodes)]));
 }
 d.querySelector('.hero [data-contact=whatsapp]').click();
 const message=new URL(opened.at(-1)).searchParams.get('text');check(message===w.MEGUMI_CONTACT_CONTEXT.message(w.MEGUMI_I18N.t('你好，我想寻找一辆日本二手车，你们能帮我找吗？')),'Localized WhatsApp '+language);
}
w.MEGUMI_I18N.choose('ar');await tick();
for(const country of ['AE','SA','GB','FR','JP']){w.MEGUMI_CONTACT_CONTEXT.choose(country);await tick();d.querySelector('.hero [data-contact=whatsapp]').click();const message=new URL(opened.at(-1)).searchParams.get('text');check(message.includes(w.MEGUMI_CONTACT_CONTEXT.countryName(country)),'Country in main message '+country);check(!message.includes('{'),'No placeholders '+country);if(country==='SA')check(message.startsWith('السلام عليكم'),'Saudi greeting');check(new URL(d.querySelector('.sf-direct').href).searchParams.get('text').includes(w.MEGUMI_CONTACT_CONTEXT.countryName(country)),'Country in finder message '+country)}
w.MEGUMI_CONTACT_CONTEXT.choose('AE');await tick();
const panel=d.getElementById('smart-finder'),orb=d.getElementById('smart-finder-launcher');
orb.click();await tick();check(!panel.hidden&&panel.getAttribute('aria-modal')==='true','Modal open');
check(d.querySelector('main').inert&&d.body.classList.contains('finder-open'),'Background inert and scroll locked');
check(panel.querySelectorAll('[data-sf-toggle][aria-expanded=true]').length===0,'Choices initially collapsed');
panel.querySelector('[data-sf-toggle=brand]').click();check(panel.querySelector('[data-sf-toggle=brand]').getAttribute('aria-expanded')==='true','Brand accordion open');
for(const brand of catalog.brands){panel.querySelector(`[data-sf-brand="${brand.name}"]`).click();check(panel.querySelectorAll('[data-sf-model]').length>0,'Models '+brand.name);panel.querySelector('[data-sf-model]').click();const href=panel.querySelector('.sf-brand-result a').href;check(new URL(href).searchParams.get('text').includes(brand.name),'WhatsApp model '+brand.name);panel.querySelector('[data-sf-back]').click()}
panel.querySelector('[data-sf-toggle=type]').click();for(const type of ['SUV','Sedan','MPV','Hatchback','Coupe','Pickup','Van']){panel.querySelector(`[data-sf-type="${type}"]`).click();check(panel.querySelector(`[data-sf-type="${type}"]`).getAttribute('aria-pressed')==='true','Type '+type)}
panel.querySelector('[data-sf-toggle=budget]').click();panel.querySelector('[data-sf-quick="50000"]').click();check(panel.querySelector('#sf-budget-slider').value==='50000','Budget changes');
panel.querySelector('#sf-close').click();await tick();check(panel.inert&&!d.querySelector('main').inert&&!d.body.classList.contains('finder-open'),'Modal close restores background');
orb.click();check(panel.querySelector('#sf-budget-slider').value==='50000','Selection survives reopening');d.querySelector('#sf-backdrop').click();await tick();check(panel.inert,'Backdrop closes');
w.SITE_CONFIG.vehicles[0].priceJPY=3000000;w.eval('renderVehicles()');await tick();
check(!d.querySelector('#price-destination,#local-currency,.fx-refresh'),'No redundant price country/currency selects or refresh button');
const currencyTrigger=d.querySelector('#currency-toggle');currencyTrigger.click();check(d.querySelector('#currency-dialog').open,'Currency opens with one click');
check(d.querySelector('[data-price-option=AE-AED] strong').textContent===w.MEGUMI_CONTACT_CONTEXT.countryName('AE'),'Country shown as primary currency option');
check(d.querySelector('[data-price-option=AE-AED] small').textContent.includes('AED'),'Symbol and ISO shown as secondary currency text');
d.querySelector('[data-price-option=AE-AED]').click();await tick();check(!d.querySelector('#currency-dialog').open,'Currency selection applies and closes without confirmation');
currencyTrigger.click();const search=d.querySelector('#currency-search');search.value='SAR';search.dispatchEvent(new w.Event('input',{bubbles:true}));check(d.querySelectorAll('[data-price-option]').length===1&&d.querySelector('[data-price-option=SA-SAR]'),'Currency search by ISO');
search.value='الإمارات';search.dispatchEvent(new w.Event('input',{bubbles:true}));check(d.querySelector('[data-price-option=AE-AED]'),'Arabic country search');d.querySelector('#currency-dialog .choice-close').click();await tick();
let price=d.querySelector('[data-price-jpy="3000000"]');check(price.querySelectorAll('strong').length===2,'Exactly local plus USD');
check(price.textContent.includes('73,800')&&price.textContent.includes('20,100'),'JPY to AED and USD math');
check(!price.textContent.includes('JPY'),'No third JPY price');
w.MEGUMI_PRICES.choose('SA','SAR');await tick();check(price.textContent.includes('75,300'),'JPY to SAR math');
d.querySelector('[data-detail="MG-001"]').click();await tick();check(d.querySelector('#vehicle-detail [data-price-jpy]').querySelectorAll('strong').length===2,'Dialog has both prices');
check(!/[\u3400-\u9fff]/.test(d.querySelector('#vehicle-detail').textContent),'Dialog localized');
w.MEGUMI_PRICES.choose('US','USD');await tick();check(price.querySelectorAll('strong').length===1,'USD locale has no duplicate amount');
w.SITE_CONFIG.vehicles[0].priceJPY=null;w.eval('renderVehicles()');await tick();check(d.querySelector('[data-price-jpy]').querySelectorAll('strong').length===0,'Missing price never fabricated');
check(errors.length===0,'No runtime errors: '+errors.join(','));
await w.happyDOM.close();
for(const options of [{locales:['ar-AE'],expected:'ar',currency:'AED'},{locales:['ar-SA'],expected:'ar',currency:'SAR'},{locales:['en-AE'],expected:'en',currency:'AED'},{locales:['en-SA'],expected:'en',currency:'SAR'},{locales:['ja-JP'],expected:'ja',currency:'JPY'},{locales:['zz-ZZ'],expected:'en',currency:'USD'},{locales:['xx-XX','fr-FR'],expected:'fr',currency:'EUR'},{locales:['ar-SA'],expected:'ar',currency:'SAR',storageBlocked:true}]){
 const c=await setup(options);check(c.w.MEGUMI_I18N.language===options.expected,'Locale negotiation '+options.locales);check(c.w.MEGUMI_PRICES.currency===options.currency,'Currency region '+options.locales);check(c.errors.length===0,'No locale errors');await c.w.happyDOM.close();
}
for(const width of [320,375,390,430,700,1440]){
 const c=await setup({width});c.d.querySelector('.topbar').classList.add('is-scrolled');await tick();c.d.querySelector('#smart-finder-launcher').click();await tick();check(c.d.querySelector('#smart-finder').style.getPropertyValue('--sf-max-height')==='820px','Full viewport panel '+width);c.d.querySelector('#sf-close').click();check(!c.d.querySelector('main').inert,'Close '+width);await c.w.happyDOM.close();
}
for(const cached of [false,true]){const c=await setup({offline:true,cached});check(c.w.MEGUMI_PRICES.state.failed,'Failure exposed');check(Boolean(c.w.MEGUMI_PRICES.snapshot)===cached,'Only actual cached rates used');check(c.d.querySelector('.fx-status').textContent.includes(c.w.MEGUMI_I18N.t(cached?'缓存汇率提示':'汇率暂不可用')),'Failure message');await c.w.happyDOM.close()}
const manual=await setup({locales:['ar-SA'],savedLanguage:'fr'});check(manual.w.MEGUMI_I18N.language==='fr','Current manual language remains selectable');check(manual.w.MEGUMI_PRICES.currency==='EUR','Display currency follows manually selected French');manual.w.MEGUMI_I18N.choose('auto');check(manual.w.MEGUMI_I18N.language==='ar','Automatic mode restores system language');check(manual.w.MEGUMI_PRICES.currency==='SAR','Automatic Arabic Saudi currency');await manual.w.happyDOM.close();
const keyboard=await setup({keyboard:true});keyboard.d.querySelector('#smart-finder-launcher').click();keyboard.w.visualViewport.height=360;keyboard.w.visualViewport.dispatchEvent(new keyboard.w.Event('resize'));check(keyboard.d.querySelector('#smart-finder').style.getPropertyValue('--sf-max-height')==='336px','Panel follows keyboard viewport');keyboard.d.querySelector('#sf-close').click();await keyboard.w.happyDOM.close();
const arabic=await setup({locales:['ar-AE']});
const arabCountries={AE:'AED',SA:'SAR',BH:'BHD',QA:'QAR',KW:'KWD',OM:'OMR',IQ:'IQD',JO:'JOD',LB:'LBP',SY:'SYP',PS:'ILS',YE:'YER',EG:'EGP',LY:'LYD',TN:'TND',DZ:'DZD',MA:'MAD',MR:'MRU',SD:'SDG',SO:'SOS',DJ:'DJF',KM:'KMF'};
for(const width of [320,390,700,1024,1440]){
 arabic.w.happyDOM.setWindowSize({width,height:844});arabic.w.dispatchEvent(new arabic.w.Event('resize'));
 arabic.d.querySelector('#language-toggle').click();check(arabic.d.querySelector('#language-dialog').open,'Arabic language modal '+width);check(arabic.d.querySelector('[data-lang=ar] span').textContent==='العربية','Arabic option complete '+width);arabic.d.querySelector('#language-dialog .choice-close').click();await tick();
 arabic.d.querySelector('#currency-toggle').click();
 for(const [country,code] of Object.entries(arabCountries)){const option=arabic.d.querySelector(`[data-price-option="${country}-${code}"]`);check(option?.querySelector('strong').textContent===arabic.w.MEGUMI_CONTACT_CONTEXT.countryName(country),'Arabic country option '+country+' '+width);check(option?.querySelector('small').textContent.includes(code),'Arabic currency symbol/code '+country+' '+width)}
 arabic.d.querySelector('#currency-dialog .choice-close').click();await tick();
}
check(!arabic.errors.length,'Arabic chooser has no runtime errors');await arabic.w.happyDOM.close();
for(const [tag,language,currency] of [['en-GB','en','GBP'],['en-AU','en','AUD'],['en-CA','en','CAD'],['zh-CN','zh','CNY'],['ja-JP','ja','JPY'],['ar-QA','ar','QAR'],['ar-EG','ar','EGP'],['fr-FR','fr','EUR'],['de-DE','de','EUR']]){const c=await setup({locales:[tag]});check(c.w.MEGUMI_I18N.language===language,'System locale '+tag);check(c.w.MEGUMI_PRICES.currency===currency,'Automatic currency '+tag);await c.w.happyDOM.close()}
const changed=await setup({locales:['ja-JP']});changed.w.MEGUMI_I18N.choose('en');check(changed.w.MEGUMI_PRICES.currency==='USD','English display does not retain Japanese yen');changed.w.MEGUMI_PRICES.choose('JP','JPY');changed.w.MEGUMI_I18N.choose('zh');check(changed.w.MEGUMI_PRICES.currency==='CNY','Language change resets previous currency override');
Object.defineProperty(changed.w.navigator,'languages',{value:['ar-SA'],configurable:true});Object.defineProperty(changed.w.navigator,'language',{value:'ar-SA',configurable:true});changed.w.dispatchEvent(new changed.w.Event('languagechange'));check(changed.w.MEGUMI_I18N.preference==='auto'&&changed.w.MEGUMI_I18N.language==='ar','System change restores automatic language');check(changed.w.MEGUMI_PRICES.currency==='SAR','System change updates currency without customer choice');check(!changed.errors.length,'No system switching errors');await changed.w.happyDOM.close();
console.log(`PASS: ${checks} assertions. DOM/logic only; real-browser layout remains unverified.`);
