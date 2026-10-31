// Google 自定义地图：填写 config.js 的 googleMapsApiKey 后启用。
// 未配置或定位失败时，继续使用 Google 原生地址地图。
(() => {
 const key=window.SITE_CONFIG.googleMapsApiKey;
 if(!key)return;
 const targets={hq:'日本 千葉県柏市柏3-6-3',tokyo:'日本 東京都荒川区西日暮里4-23-2'};
 const greenRoadStyles=[
  {elementType:'geometry',stylers:[{color:'#262629'}]},
  {elementType:'labels.text.fill',stylers:[{color:'#a4a4ac'}]},
  {elementType:'labels.text.stroke',stylers:[{color:'#262629'}]},
  {featureType:'poi',elementType:'labels',stylers:[{visibility:'off'}]},
  {featureType:'poi.park',elementType:'geometry',stylers:[{color:'#29292c'}]},
  {featureType:'road',elementType:'geometry',stylers:[{color:'#3a3a3e'}]},
  {featureType:'road',elementType:'geometry.stroke',stylers:[{color:'#161619'}]},
  {featureType:'road.highway',elementType:'geometry',stylers:[{color:'#46464b'}]},
  {featureType:'transit',elementType:'geometry',stylers:[{color:'#36363b'}]},
  {featureType:'water',elementType:'geometry',stylers:[{color:'#19191d'}]}
 ];
 let map,marker,geocoder,requestId=0;
 window.initCompanyMap=()=>{
  geocoder=new google.maps.Geocoder();
  map=new google.maps.Map(document.querySelector('#styled-map'),{zoom:17,styles:greenRoadStyles,mapTypeControl:false,streetViewControl:false,fullscreenControl:true,gestureHandling:'cooperative'});
  marker=new google.maps.Marker({map,title:'惠澤株式会社',icon:{path:google.maps.SymbolPath.CIRCLE,scale:10,fillColor:'#a4e1b9',fillOpacity:1,strokeColor:'#142219',strokeWeight:4}});
  const locate=()=>{
   const current=document.querySelector('[data-map].active').dataset.map;
   const id=++requestId;
   geocoder.geocode({address:targets[current],region:'JP'},(results,status)=>{
    if(id!==requestId)return;
    if(status==='OK'&&results?.[0]){
     const position=results[0].geometry.location;
     document.querySelector('#styled-map').hidden=false;
     document.querySelector('#map').hidden=true;
     google.maps.event.trigger(map,'resize');map.setCenter(position);marker.setPosition(position);
     marker.setTitle('惠澤株式会社 '+(current==='hq'?'总部':'东京营业所'));
    }else{document.querySelector('#styled-map').hidden=true;document.querySelector('#map').hidden=false}
   });
  };
  document.querySelectorAll('[data-map]').forEach(button=>button.addEventListener('click',()=>queueMicrotask(locate)));
  locate();
 };
 window.gm_authFailure=()=>{document.querySelector('#styled-map').hidden=true;document.querySelector('#map').hidden=false};
 const script=document.createElement('script');script.async=true;
 script.src='https://maps.googleapis.com/maps/api/js?key='+encodeURIComponent(key)+'&callback=initCompanyMap&loading=async&language='+encodeURIComponent(document.documentElement.lang)+'&region=JP';
 document.head.append(script);
})();
