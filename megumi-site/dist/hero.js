(() => {
 const motion=matchMedia('(prefers-reduced-motion: reduce)');
 function initializeCarousel(hero){
 const slides=[...hero.querySelectorAll('.hero-slide')];
 const controls=[...hero.querySelectorAll('[data-slide]')];
 const pause=hero.querySelector('[data-pause]');
 let current=0,timer,paused=motion.matches,visible=true,touchX=null;
 function show(index){
  current=(index+slides.length)%slides.length;
  slides.forEach((slide,i)=>{if(slide.classList.contains('is-active')&&i!==current){slide.classList.add('is-leaving');setTimeout(()=>slide.classList.remove('is-leaving'),1400)}slide.classList.toggle('is-active',i===current);slide.setAttribute('aria-hidden',i!==current)});
  controls.forEach((button,i)=>button.setAttribute('aria-pressed',i===current));
 }
 function schedule(){clearInterval(timer);if(!paused&&visible&&!document.hidden)timer=setInterval(()=>show(current+1),6500)}
 function state(){pause.setAttribute('aria-label',paused?'播放图片':'暂停图片');pause.setAttribute('aria-pressed',paused);pause.classList.toggle('is-paused',paused);hero.classList.toggle('motion-paused',paused);schedule()}
 controls.forEach(button=>button.addEventListener('click',()=>{show(Number(button.dataset.slide));schedule()}));
 pause.addEventListener('click',()=>{paused=!paused;state()});
 hero.querySelector('.hero-controls').addEventListener('keydown',event=>{if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();show(current+(event.key==='ArrowRight'?1:-1));controls[current].focus();schedule()}});
 hero.addEventListener('touchstart',event=>{if(event.target.closest('a,button,select'))return;touchX=event.changedTouches[0].clientX},{passive:true});
 hero.addEventListener('touchend',event=>{if(touchX===null)return;const delta=event.changedTouches[0].clientX-touchX;if(Math.abs(delta)>55){show(current+(delta<0?1:-1));schedule()}touchX=null},{passive:true});
 document.addEventListener('visibilitychange',schedule);
 if('IntersectionObserver' in window)new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;schedule()},{threshold:0}).observe(hero);
 motion.addEventListener('change',()=>{paused=motion.matches;state()});show(0);state();
 }
 document.querySelectorAll('[data-carousel]').forEach(initializeCarousel);
 const header=document.querySelector('.topbar');let scheduled=false;
 function updateHeader(){header.classList.toggle('is-scrolled',window.scrollY>16);scheduled=false}
 window.addEventListener('scroll',()=>{if(!scheduled){requestAnimationFrame(updateHeader);scheduled=true}},{passive:true});updateHeader();
})();
