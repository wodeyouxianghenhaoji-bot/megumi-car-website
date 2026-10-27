// Continuous control contours measured from their existing boxes; never resize controls.
(() => {
 const controls=[...document.querySelectorAll('.topbar button.glass')];
 const clamp=(value,min,max)=>Math.min(max,Math.max(min,value));
 const number=value=>Number(value.toFixed(3));
 function contour(width,height,inset=0){
  const left=inset,top=inset,right=width-inset,bottom=height-inset;
  const radius=clamp(height*.37,10,20)-inset;
  const corners=[
   [right-radius,top+radius,-Math.PI/2,0],
   [right-radius,bottom-radius,0,Math.PI/2],
   [left+radius,bottom-radius,Math.PI/2,Math.PI],
   [left+radius,top+radius,Math.PI,Math.PI*1.5]
  ];
  const power=2/3.3,points=[];
  for(const [cx,cy,start,end] of corners){
   for(let index=0;index<=24;index++){
    const angle=start+(end-start)*index/24,c=Math.cos(angle),s=Math.sin(angle);
    points.push(`${number(cx+radius*Math.sign(c)*Math.abs(c)**power)} ${number(cy+radius*Math.sign(s)*Math.abs(s)**power)}`);
   }
  }
  return `M${points.join('L')}Z`;
 }
 function update(control){
  const width=control.offsetWidth,height=control.offsetHeight;if(!width||!height)return;
  const clip=contour(width,height);
  if(!CSS.supports('clip-path',`path("${clip}")`))return;
  const line=.45/Math.max(1,Math.min(devicePixelRatio/1.5,1.5));
  const path=contour(width,height,line/2);
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><path d="${path}" fill="none" stroke="white" stroke-opacity=".28" stroke-width="${line}"/></svg>`;
  control.style.clipPath=`path("${clip}")`;
  control.style.setProperty('--continuous-outline',`url("data:image/svg+xml,${encodeURIComponent(svg)}")`);
  control.classList.add('continuous-corner');
 }
 if('ResizeObserver' in window){const observer=new ResizeObserver(entries=>entries.forEach(entry=>update(entry.target)));controls.forEach(control=>observer.observe(control))}
 controls.forEach(update);
 window.addEventListener('resize',()=>controls.forEach(update),{passive:true});
 document.fonts?.ready.then(()=>controls.forEach(update));
})();
