// 日本国土地理院の淡色地図を、出典を保持したまま深色に加工。
// Google 地图导航入口继续使用公司完整地址。
(() => {
 if(window.SITE_CONFIG.googleMapsApiKey || !window.L)return;
 const element=document.querySelector('#styled-map');
 const original=document.querySelector('#map');
 const places={
  hq:{point:[35.86004426285616,139.97403263313527],title:'惠澤株式会社 总部'},
  tokyo:{point:[35.7311336556,139.7638928043],title:'惠澤株式会社 东京营业所'}
 };
 element.hidden=false;original.hidden=true;
 const map=L.map(element,{scrollWheelZoom:false,zoomControl:false,attributionControl:true}).setView(places.hq.point,16);
 L.control.zoom({position:'topright'}).addTo(map);
 map.attributionControl.setPrefix(false);
 const tiles=L.tileLayer('https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png',{
  minZoom:5,maxZoom:18,className:'megumi-dark-tiles',
  attribution:'<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank" rel="noopener">国土地理院</a> · 配色加工'
 }).addTo(map);
 const icon=L.divIcon({className:'company-pin',iconSize:[30,38],iconAnchor:[15,38],html:'<svg viewBox="0 0 30 38" aria-hidden="true"><path d="M15 2C8 2 3 7 3 14c0 9 12 21 12 21s12-12 12-21C27 7 22 2 15 2Z" fill="#a5dfb9" stroke="#f0fff5" stroke-width="1.5"/><circle cx="15" cy="14" r="4.5" fill="#15231b"/></svg>'});
 const marker=L.marker(places.hq.point,{icon,title:places.hq.title}).addTo(map);
 marker.bindTooltip(places.hq.title,{permanent:true,direction:'top',offset:[0,-38],className:'company-map-label'});
 const update=()=>{
  const active=document.querySelector('[data-map].active').dataset.map;
  const place=places[active];map.setView(place.point,16,{animate:false});marker.setLatLng(place.point);marker.setTooltipContent(place.title);
  marker.options.title=place.title;const node=marker.getElement();if(node)node.title=place.title;
 };
 document.querySelectorAll('[data-map]').forEach(button=>button.addEventListener('click',()=>queueMicrotask(update)));
 // 按实际容器尺寸加载，不阻挡手机页面滚动。
 if('ResizeObserver' in window)new ResizeObserver(()=>map.invalidateSize({pan:false})).observe(element);
 const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting))map.invalidateSize({pan:false})});observer.observe(element);
 let successes=0;tiles.on('tileload',()=>successes++);tiles.on('tileerror',()=>{if(successes===0)element.classList.add('map-awaiting-tiles')});
})();
