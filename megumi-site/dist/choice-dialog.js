/* Centered native dialogs escape header filters and contain keyboard focus. */
(() => {
 'use strict';
 let active=null;
 function create(id){
  const dialog=document.createElement('dialog');dialog.id=id;dialog.className='site-choice-dialog';dialog.setAttribute('aria-labelledby',id+'-title');
  const header=document.createElement('div');header.className='choice-heading';
  const title=document.createElement('h2');title.id=id+'-title';
  const close=document.createElement('button');close.type='button';close.className='choice-close';close.textContent='×';
  const content=document.createElement('div');content.className='choice-content';header.append(title,close);dialog.append(header,content);document.body.append(dialog);
  let opener=null,scroll=0,locked=false;
  function position(){const viewport=window.visualViewport;dialog.style.top=((viewport?.offsetTop||0)+(viewport?.height||innerHeight)/2)+'px';dialog.style.setProperty('--choice-height',(viewport?.height||innerHeight)+'px')}
  function dismiss(){if(dialog.open)dialog.close()}
  function open(trigger){
   if(dialog.open)return;if(active)active.close();active=api;opener=trigger||document.activeElement;scroll=window.scrollY;
   locked=!document.body.classList.contains('finder-open');
   if(locked){document.body.style.top=-scroll+'px';document.body.classList.add('choice-open')}
   position();dialog.showModal();opener?.setAttribute('aria-expanded','true');
   const selected=content.querySelector('[aria-current=true]');selected?.focus({preventScroll:true});selected?.scrollIntoView?.({block:'nearest'});
  }
  dialog.addEventListener('close',()=>{if(locked){document.body.classList.remove('choice-open');document.body.style.top='';window.scrollTo(0,scroll)}if(active===api)active=null;opener?.setAttribute('aria-expanded','false');opener?.focus({preventScroll:true})});
  close.addEventListener('click',dismiss);
  dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dismiss()}});
  dialog.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();dismiss()}});
  window.addEventListener('resize',position,{passive:true});window.visualViewport?.addEventListener('resize',position,{passive:true});
  const api={dialog,title,content,closeButton:close,open,close:dismiss};return api;
 }
 window.MEGUMI_CHOOSER={create};
})();
