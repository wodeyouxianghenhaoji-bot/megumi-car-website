/* Destination and display language are independent. No IP lookup or AI calls. */
(() => {
 'use strict';
 const codes='AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW'.split(' ');
 const get=key=>{try{return localStorage.getItem(key)}catch{return null}};
 const set=(key,value)=>{try{localStorage.setItem(key,value)}catch{}};
 function detect(){for(const value of navigator.languages?.length?navigator.languages:[navigator.language]){try{const region=new Intl.Locale(value.replaceAll('_','-')).region;if(codes.includes(region))return region}catch{}}return ''}
 let country=get('megumi-destination-country')??detect();if(!codes.includes(country))country='';
 const t=(key,values)=>window.MEGUMI_I18N.t(key,values);
 function countryName(code=country){if(!code)return '';try{return new Intl.DisplayNames([document.documentElement.lang],{type:'region'}).of(code)}catch{return code}}
 function message(source){
  let value=source;
  if(document.documentElement.lang==='ar'&&country==='SA')value=value.replace(/^مرحب[اًًا]*[،,]?\s*/u,'السلام عليكم، ');
  if(country)value+='\n'+t('目的国家：{country}。',{country:countryName()});
  if(window.MEGUMI_PRICES?.currency)value+='\n'+t('首选显示货币：{currency}。',{currency:window.MEGUMI_PRICES.currency});
  return value;
 }
 function render(){
  document.querySelectorAll('[data-destination-label]').forEach(label=>label.textContent=t('目的国家'));
  document.querySelectorAll('select[data-destination]').forEach(select=>{
   select.replaceChildren();select.setAttribute('aria-label',t('目的国家'));
   const blank=document.createElement('option');blank.value='';blank.textContent=t('尚未选择');select.append(blank);
   const items=codes.map(code=>({code,name:countryName(code)})).sort((a,b)=>a.name.localeCompare(b.name,document.documentElement.lang));
   items.forEach(({code,name})=>{const option=document.createElement('option');option.value=code;option.textContent=name;select.append(option)});select.value=country;
  });
 }
 function choose(value){country=codes.includes(value)?value:'';set('megumi-destination-country',country);render();window.dispatchEvent(new CustomEvent('megumi:contextchange',{detail:{country}}))}
 document.addEventListener('change',event=>{if(event.target.matches('select[data-destination]')){const value=event.target.value;const panel=event.target.closest('#smart-finder');event.target.blur();choose(value);if(panel&&!panel.inert)panel.querySelector('[data-sf-toggle=brand]')?.focus({preventScroll:true})}});
 window.addEventListener('megumi:languagechange',render);
 window.addEventListener('storage',event=>{if(event.key==='megumi-destination-country'){country=codes.includes(event.newValue)?event.newValue:'';render();window.dispatchEvent(new CustomEvent('megumi:contextchange',{detail:{country}}))}});
 window.MEGUMI_CONTACT_CONTEXT={get country(){return country},countryName,choose,render,message,codes};
 render();window.dispatchEvent(new CustomEvent('megumi:contextchange',{detail:{country}}));
})();
