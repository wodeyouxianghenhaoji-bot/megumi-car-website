/* Free daily reference rates. Arithmetic runs locally and never calls an AI API. */
(() => {
 'use strict';
 const API='https://open.er-api.com/v6/latest/JPY',CACHE='megumi-fx-jpy-v1',CHOICE='megumi-local-currency';
 const known=['AED','SAR','USD','JPY','CNY','EUR','GBP','AUD','CAD','CHF','HKD','SGD','NZD','INR','PKR','BDT','IDR','MYR','THB','KRW','PHP','VND','ZAR','KES','TZS','UGX','NGN','GHS','EGP','MAD','DZD','TND','QAR','KWD','BHD','OMR','JOD','ILS','TRY','RUB','UAH','PLN','CZK','HUF','RON','SEK','NOK','DKK','BRL','MXN','CLP','COP','PEN','ARS','LKR','NPR'];
 const territories=window.MEGUMI_TERRITORY_CURRENCIES;
 const regionCurrency=Object.fromEntries(Object.entries(territories).map(([region,currencies])=>[region,currencies[0]]));
 const get=key=>{try{return localStorage.getItem(key)}catch{return null}};
 const set=(key,value)=>{try{localStorage.setItem(key,value)}catch{}};
 const t=source=>window.MEGUMI_I18N?.t(source)||source;
 const locale=()=>document.documentElement.lang||'en';
 const defaultRegions={ar:'AE',zh:'CN',ja:'JP',en:'US',fr:'FR',de:'DE',it:'IT',es:'ES',nl:'NL',pt:'PT',ru:'RU'};
 function automaticRegion(){
  const language=locale().split('-')[0];
  for(const value of navigator.languages?.length?navigator.languages:[navigator.language]){try{const tag=new Intl.Locale(value.replace(/_/g,'-'));if(tag.language===language&&regionCurrency[tag.region])return tag.region}catch{}}
  return defaultRegions[language]||'US';
 }
 function detect(){
  return regionCurrency[automaticRegion()]||'USD';
 }
 const signature=()=>locale()+':'+JSON.stringify(navigator.languages?.length?navigator.languages:[navigator.language]);
 let manual=false;
 let currency=detect(),snapshot=null,loading=false,failed=false,attempted=false,lastAttempt=0;
 if(!/^[A-Z]{3}$/.test(currency))currency=detect();
 function validate(data){
  const stamp=data?.time_last_update_unix,next=data?.time_next_update_unix;
  if(data?.result!=='success'||data.base_code!=='JPY'||!Number.isFinite(stamp)||!Number.isFinite(next)||next<=stamp||stamp>Date.now()/1000+86400||stamp<Date.now()/1000-7*86400||data.rates?.JPY!==1)return null;
  const rates=Object.fromEntries(Object.entries(data.rates).filter(([code,value])=>/^[A-Z]{3}$/.test(code)&&Number.isFinite(value)&&value>0));
  if(!rates.USD||!rates.AED||!rates.SAR)return null;
  return {result:'success',base_code:'JPY',time_last_update_unix:stamp,time_next_update_unix:next,rates};
 }
 try{snapshot=validate(JSON.parse(get(CACHE)||'null'))}catch{}
 const toolbar=document.createElement('div');toolbar.className='currency-settings currency-settings--compact';
 const trigger=document.createElement('button');trigger.type='button';trigger.id='currency-toggle';trigger.className='currency-trigger';trigger.setAttribute('aria-haspopup','dialog');trigger.setAttribute('aria-controls','currency-dialog');trigger.setAttribute('aria-expanded','false');
 const details=document.createElement('details');details.className='fx-details';
 const status=document.createElement('summary');status.className='fx-status';
 const note=document.createElement('p');note.className='fx-note';
 const attribution=document.createElement('a');attribution.href='https://www.exchangerate-api.com';attribution.target='_blank';attribution.rel='noopener noreferrer';attribution.textContent='Rates by ExchangeRate-API';
 details.append(status,note,attribution);toolbar.append(trigger,details);document.querySelector('.vehicle-toolbar').after(toolbar);
 const picker=window.MEGUMI_CHOOSER.create('currency-dialog');
 const search=document.createElement('input');search.type='search';search.className='choice-search';search.id='currency-search';search.autocomplete='off';
 const list=document.createElement('div');list.className='currency-options';picker.content.append(search,list);
 const validCountries=window.MEGUMI_CONTACT_CONTEXT.codes;
 let region=automaticRegion();
 function alignRegion(){if(territories[region]?.includes(currency))return;const preferred={ar:'AE',zh:'CN',ja:'JP',en:'US',fr:'FR',de:'DE',it:'IT',es:'ES',nl:'NL',pt:'PT',ru:'RU'}[locale().split('-')[0]];region=territories[preferred]?.includes(currency)?preferred:Object.keys(territories).find(key=>validCountries.includes(key)&&territories[key].includes(currency))||'US'}
 alignRegion();
 const displayCache=new Map(),nameCache=new Map(),symbolCache=new Map();
 const countryName=(value,lang=locale())=>{const key=lang+':'+value;if(nameCache.has(key))return nameCache.get(key);try{if(!displayCache.has(lang))displayCache.set(lang,new Intl.DisplayNames([lang],{type:'region'}));const name=displayCache.get(lang).of(value);nameCache.set(key,name);return name}catch{return value}};
 const symbol=code=>{const key=locale()+':'+code;if(symbolCache.has(key))return symbolCache.get(key);try{const sign=new Intl.NumberFormat(code==='AED'?'ar-AE':code==='SAR'?'ar-SA':locale(),{style:'currency',currency:code,currencyDisplay:'narrowSymbol'}).formatToParts(1).find(part=>part.type==='currency').value;symbolCache.set(key,sign);return sign}catch{return code}};
 function caption(code){const small=document.createElement('small');const sign=document.createElement('bdi');sign.textContent=symbol(code);const iso=document.createElement('bdi');iso.textContent=code;small.append(sign,document.createTextNode(' · '),iso);return small}
 function choose(nextRegion,nextCurrency=regionCurrency[nextRegion]){
  if(!validCountries.includes(nextRegion)||!territories[nextRegion]?.includes(nextCurrency)||snapshot&&!snapshot.rates[nextCurrency])return;
  manual=true;region=nextRegion;currency=nextCurrency;set(CHOICE,currency);set('megumi-price-region',region);set('megumi-currency-mode','manual');set('megumi-currency-context',signature());render();window.dispatchEvent(new Event('megumi:currencychange'));
 }
 function options(){
  const active=document.activeElement?.dataset.priceOption;
  list.replaceChildren();
  const normalize=value=>value.normalize('NFD').replace(/\p{M}/gu,'').toLocaleLowerCase().replace(/[أإآ]/g,'ا');
  const query=normalize(search.value.trim()),popular=[region,'AE','SA','CN','US','JP','GB','DE'];
  const items=validCountries.flatMap(country=>(territories[country]||[]).filter(code=>!snapshot||snapshot.rates[code]).map(code=>({country,code,name:countryName(country)})));
  items.sort((a,b)=>{const first=popular.indexOf(a.country),second=popular.indexOf(b.country);return (first<0?99:first)-(second<0?99:second)||a.name.localeCompare(b.name,locale())});
  for(const item of items){
   if(query&&!normalize(item.name+' '+countryName(item.country,'en')+' '+item.country+' '+item.code+' '+symbol(item.code)).includes(query))continue;
   const button=document.createElement('button');button.type='button';button.className='currency-option';button.dataset.priceOption=item.country+'-'+item.code;button.dataset.priceCountry=item.country;button.dataset.priceCurrency=item.code;button.setAttribute('aria-current',String(region===item.country&&currency===item.code));
   const name=document.createElement('strong');name.textContent=item.name;button.append(name,caption(item.code));list.append(button);
  }
  if(!list.children.length){const empty=document.createElement('p');empty.textContent=t('没有匹配的选项');list.append(empty)}
  if(active&&picker.dialog.open)list.querySelector(`[data-price-option="${active}"]`)?.focus({preventScroll:true});
 }
 function controls(){
  alignRegion();
  trigger.textContent=t('当地货币')+' · '+currency+' ⌄';trigger.setAttribute('aria-label',t('修改当地货币')+': '+countryName(region)+' · '+currency);
  picker.title.textContent=t('修改当地货币');picker.closeButton.setAttribute('aria-label',t('关闭弹窗'));search.placeholder=t('搜索国家或货币');search.setAttribute('aria-label',t('搜索国家或货币'));if(picker.dialog.open)options();
 }
 trigger.addEventListener('click',()=>{search.value='';options();picker.open(trigger)});
 search.addEventListener('input',options);
 list.addEventListener('click',event=>{const option=event.target.closest('[data-price-option]');if(option){choose(option.dataset.priceCountry,option.dataset.priceCurrency);picker.close()}});
 function format(value,code){return new Intl.NumberFormat(locale(),{style:'currency',currency:code,currencyDisplay:'code',minimumFractionDigits:0,maximumFractionDigits:0,numberingSystem:'latn'}).format(value)}
 function amount(value,code){const box=document.createElement('div');box.className='converted-price';const title=document.createElement('small');title.textContent=t(code===currency?'当地价格':'美元价格');const strong=document.createElement('strong');strong.dir='ltr';strong.textContent=format(value,code);box.append(title,strong);return box}
 function render(){
  controls();note.textContent=t('换算参考说明');
  const now=Date.now()/1000;
  status.textContent=loading&&!snapshot?t('正在获取汇率'):snapshot?t('汇率更新时间')+': '+new Intl.DateTimeFormat(locale(),{dateStyle:'medium',timeStyle:'short'}).format(new Date(snapshot.time_last_update_unix*1000))+(failed||snapshot.time_next_update_unix<now?' · '+t('缓存汇率提示'):''):t('汇率暂不可用');
  document.querySelectorAll('[data-price-jpy]').forEach(element=>{
   const yen=Number(element.dataset.priceJpy);element.replaceChildren();element.classList.add('converted-prices');
   if(!Number.isFinite(yen)||yen<=0){element.textContent=t('确认车辆后报价');return}
   if(!snapshot?.rates[currency]||!snapshot?.rates.USD){element.textContent=loading?t('正在获取汇率'):t('汇率暂不可用');return}
   const local=yen*snapshot.rates[currency],usd=yen*snapshot.rates.USD;
   if(!Number.isFinite(local)||!Number.isFinite(usd)){element.textContent=t('汇率暂不可用');return}
   element.append(amount(local,currency));if(currency!=='USD')element.append(amount(usd,'USD'));
  });
 }
 let timer;
 function schedule(){clearTimeout(timer);if(snapshot)timer=setTimeout(()=>{if(!document.hidden)load()},failed?3600000:Math.max(60000,Math.min(86400000,snapshot.time_next_update_unix*1000-Date.now()+60000)))}
 async function load(force=false){
  if(loading)return;
  if(!force&&attempted&&Date.now()-lastAttempt<3600000){render();schedule();return}
  if(!force&&snapshot&&snapshot.time_next_update_unix>Date.now()/1000){render();schedule();return}
  loading=true;lastAttempt=Date.now();render();
  const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),10000);
  try{const response=await fetch(API,{signal:controller.signal,cache:'no-store',credentials:'omit'});if(!response.ok)throw Error('rates');const data=validate(await response.json());if(!data)throw Error('invalid rates');snapshot=data;failed=false;set(CACHE,JSON.stringify(data))}
  catch{failed=true}
  finally{clearTimeout(timeout);loading=false;attempted=true;render();schedule()}
 }
 window.addEventListener('megumi:contextchange',()=>render());
 window.addEventListener('megumi:languagechange',()=>{if(get('megumi-currency-context')!==signature()){manual=false;set('megumi-currency-mode','auto')}if(!manual){currency=detect();region=automaticRegion()}render();window.dispatchEvent(new Event('megumi:currencychange'))});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)load()});
 new MutationObserver(changes=>{if(changes.some(change=>[...change.addedNodes].some(node=>node.nodeType===1&&(node.matches('[data-price-jpy]')||node.querySelector('[data-price-jpy]')))))render()}).observe(document.querySelector('main'),{childList:true,subtree:true});
 new MutationObserver(changes=>{if(changes.some(change=>[...change.addedNodes].some(node=>node.nodeType===1&&(node.matches('[data-price-jpy]')||node.querySelector('[data-price-jpy]')))))render()}).observe(document.querySelector('#vehicle-detail'),{childList:true,subtree:true});
 window.MEGUMI_PRICES={refresh:()=>load(true),render,detect,validate,choose,get region(){return region},get currency(){return currency},get snapshot(){return snapshot},get state(){return {loading,failed,attempted}}};
 window.dispatchEvent(new Event('megumi:currencychange'));
 load();
})();
