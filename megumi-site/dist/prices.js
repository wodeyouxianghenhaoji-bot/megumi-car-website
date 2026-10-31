/* Free daily reference rates. Arithmetic runs locally and never calls an AI API. */
(() => {
 'use strict';
 const API='https://open.er-api.com/v6/latest/JPY',CACHE='megumi-fx-jpy-v1',CHOICE='megumi-local-currency';
 const known=['AED','SAR','USD','JPY','CNY','EUR','GBP','AUD','CAD','CHF','HKD','SGD','NZD','INR','PKR','BDT','IDR','MYR','THB','KRW','PHP','VND','ZAR','KES','TZS','UGX','NGN','GHS','EGP','MAD','DZD','TND','QAR','KWD','BHD','OMR','JOD','ILS','TRY','RUB','UAH','PLN','CZK','HUF','RON','SEK','NOK','DKK','BRL','MXN','CLP','COP','PEN','ARS','LKR','NPR'];
 const regionCurrency={AE:'AED',SA:'SAR',US:'USD',JP:'JPY',CN:'CNY',GB:'GBP',AU:'AUD',CA:'CAD',NZ:'NZD',CH:'CHF',HK:'HKD',SG:'SGD',IN:'INR',PK:'PKR',BD:'BDT',ID:'IDR',MY:'MYR',TH:'THB',KR:'KRW',PH:'PHP',VN:'VND',ZA:'ZAR',KE:'KES',TZ:'TZS',UG:'UGX',NG:'NGN',GH:'GHS',EG:'EGP',MA:'MAD',DZ:'DZD',TN:'TND',QA:'QAR',KW:'KWD',BH:'BHD',OM:'OMR',JO:'JOD',IL:'ILS',TR:'TRY',RU:'RUB',UA:'UAH',PL:'PLN',CZ:'CZK',HU:'HUF',RO:'RON',SE:'SEK',NO:'NOK',DK:'DKK',BR:'BRL',MX:'MXN',CL:'CLP',CO:'COP',PE:'PEN',AR:'ARS',LK:'LKR',NP:'NPR',DE:'EUR',FR:'EUR',IT:'EUR',ES:'EUR',PT:'EUR',NL:'EUR',BE:'EUR',AT:'EUR',IE:'EUR',FI:'EUR',GR:'EUR',LU:'EUR',CY:'EUR',MT:'EUR',SK:'EUR',SI:'EUR',EE:'EUR',LV:'EUR',LT:'EUR',HR:'EUR'};
 const get=key=>{try{return localStorage.getItem(key)}catch{return null}};
 const set=(key,value)=>{try{localStorage.setItem(key,value)}catch{}};
 const t=source=>window.MEGUMI_I18N?.t(source)||source;
 const locale=()=>document.documentElement.lang||'en';
 function detect(){
  // A browser's locale gives a preference, not the visitor's physical location.
  const country=window.MEGUMI_CONTACT_CONTEXT?.country;if(regionCurrency[country])return regionCurrency[country];
  for(const value of navigator.languages?.length?navigator.languages:[navigator.language]){try{const region=new Intl.Locale(value.replaceAll('_','-')).region;if(regionCurrency[region])return regionCurrency[region]}catch{}}
  const lang=locale().split('-')[0];return {ar:'AED',zh:'CNY',ja:'JPY',en:'USD',fr:'EUR',de:'EUR',it:'EUR',es:'EUR',nl:'EUR',pt:'EUR',ru:'RUB'}[lang]||'USD';
 }
 let currency=get(CHOICE)||detect(),snapshot=null,loading=false,failed=false,attempted=false,lastAttempt=0;
 if(!/^[A-Z]{3}$/.test(currency))currency=detect();
 function validate(data){
  const stamp=data?.time_last_update_unix,next=data?.time_next_update_unix;
  if(data?.result!=='success'||data.base_code!=='JPY'||!Number.isFinite(stamp)||!Number.isFinite(next)||next<=stamp||stamp>Date.now()/1000+86400||stamp<Date.now()/1000-7*86400||data.rates?.JPY!==1)return null;
  const rates=Object.fromEntries(Object.entries(data.rates).filter(([code,value])=>/^[A-Z]{3}$/.test(code)&&Number.isFinite(value)&&value>0));
  if(!rates.USD||!rates.AED||!rates.SAR)return null;
  return {result:'success',base_code:'JPY',time_last_update_unix:stamp,time_next_update_unix:next,rates};
 }
 try{snapshot=validate(JSON.parse(get(CACHE)||'null'))}catch{}
 const toolbar=document.createElement('div');toolbar.className='currency-settings';
 const label=document.createElement('label');label.htmlFor='local-currency';
 const select=document.createElement('select');select.id='local-currency';
 const refresh=document.createElement('button');refresh.type='button';refresh.className='fx-refresh';
 const status=document.createElement('p');status.className='fx-status';status.setAttribute('role','status');
 const note=document.createElement('p');note.className='fx-note';
 const attribution=document.createElement('a');attribution.href='https://www.exchangerate-api.com';attribution.target='_blank';attribution.rel='noopener noreferrer';attribution.textContent='Rates by ExchangeRate-API';
 const destinationLabel=document.createElement('label');destinationLabel.htmlFor='price-destination';destinationLabel.dataset.destinationLabel='';
 const destination=document.createElement('select');destination.id='price-destination';destination.dataset.destination='';
 toolbar.append(destinationLabel,destination,label,select,refresh,status,note,attribution);document.querySelector('.vehicle-toolbar').after(toolbar);window.MEGUMI_CONTACT_CONTEXT?.render();
 function format(value,code){return new Intl.NumberFormat(locale(),{style:'currency',currency:code,currencyDisplay:'code',minimumFractionDigits:0,maximumFractionDigits:0,numberingSystem:'latn'}).format(value)}
 function amount(value,code){const box=document.createElement('div');box.className='converted-price';const title=document.createElement('small');title.textContent=t(code===currency?'当地价格':'美元价格');const strong=document.createElement('strong');strong.dir='ltr';strong.textContent=format(value,code);box.append(title,strong);return box}
 function render(){
  label.textContent=t('修改当地货币');select.setAttribute('aria-label',t('当地货币'));refresh.textContent=t('更新汇率');refresh.disabled=loading;note.textContent=t('换算参考说明');
  const codes=snapshot?Object.keys(snapshot.rates).sort():[...known].sort();if(!codes.includes(currency))codes.push(currency);
  select.replaceChildren();let display;try{display=new Intl.DisplayNames([locale()],{type:'currency'})}catch{}
  codes.forEach(code=>{const option=document.createElement('option');option.value=code;option.textContent=code+' — '+(display?.of(code)||code);select.append(option)});select.value=currency;
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
 select.addEventListener('change',()=>{currency=select.value;set(CHOICE,currency);render();window.dispatchEvent(new Event('megumi:currencychange'))});refresh.addEventListener('click',()=>load(true));
 window.addEventListener('megumi:contextchange',event=>{const next=regionCurrency[event.detail.country];if(next){currency=next;set(CHOICE,currency)}render();window.dispatchEvent(new Event('megumi:currencychange'))});
 window.addEventListener('megumi:languagechange',()=>{if(!get(CHOICE))currency=detect();render()});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)load()});
 new MutationObserver(changes=>{if(changes.some(change=>[...change.addedNodes].some(node=>node.nodeType===1&&(node.matches('[data-price-jpy]')||node.querySelector('[data-price-jpy]')))))render()}).observe(document.querySelector('main'),{childList:true,subtree:true});
 new MutationObserver(changes=>{if(changes.some(change=>[...change.addedNodes].some(node=>node.nodeType===1&&(node.matches('[data-price-jpy]')||node.querySelector('[data-price-jpy]')))))render()}).observe(document.querySelector('#vehicle-detail'),{childList:true,subtree:true});
 window.MEGUMI_PRICES={refresh:()=>load(true),render,detect,validate,get currency(){return currency},get snapshot(){return snapshot},get state(){return {loading,failed,attempted}}};
 window.dispatchEvent(new Event('megumi:currencychange'));
 load();
})();
