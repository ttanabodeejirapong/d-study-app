/* D Study App v14 — noninvasive tactile UI.
 * Read theme variables already supplied by Settings; never write academic storage.
 * Event delegation survives dynamically rendered quizzes, flashcards and settings.
 */
(function(){
 "use strict";
 const interactive='button:not(:disabled),a[href],[role="button"],.subject-card.live[tabindex]';
 let pressed=null;
 function clearPressed(){if(pressed){pressed.classList.remove("d14-pressed");pressed=null}}
 function findTarget(ev){return ev.target&&ev.target.closest?ev.target.closest(interactive):null}
 document.addEventListener("pointerdown",function(ev){
  if(ev.button!=null&&ev.button!==0)return;
  const el=findTarget(ev);if(!el||el.getAttribute("aria-disabled")==="true")return;
  clearPressed();pressed=el;el.classList.add("d14-pressed");
  if(window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
  if(el.matches(".swatch")||el.matches("input,textarea,select"))return;
  const rect=el.getBoundingClientRect();
  if(!rect.width||!rect.height)return;
  const dot=document.createElement("span");
  dot.className="d14-ripple";dot.setAttribute("aria-hidden","true");
  const width=Math.min(Math.max(rect.width,rect.height)*1.7,300);
  dot.style.width=width+"px";dot.style.height=width+"px";
  dot.style.left=(ev.clientX-rect.left)+"px";dot.style.top=(ev.clientY-rect.top)+"px";
  el.classList.add("d14-ripple-host");el.appendChild(dot);
  dot.addEventListener("animationend",function(){dot.remove()},{once:true});
 },true);
 ["pointerup","pointercancel","dragstart"].forEach(function(name){
  document.addEventListener(name,clearPressed,true);
 });
 document.addEventListener("keydown",function(ev){
  if(ev.key!=="Enter"&&ev.key!==" ")return;
  const el=findTarget(ev);if(!el||el.getAttribute("aria-disabled")==="true")return;
  el.classList.add("d14-pressed");
 },true);
 document.addEventListener("keyup",clearPressed,true);
 window.addEventListener("blur",clearPressed);
})();
