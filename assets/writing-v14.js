/* Chinese handwriting v14 Settings appearance refresh — no state writes. */
(function(){
 "use strict";
 function apply(){
  let p={appearance:"system",uiTheme:"midnight",accent:"navy",font:"inter",textSize:"normal"};
  try{const v=JSON.parse(localStorage.getItem("d-study-shared-preferences-v1")||"null");if(v&&typeof v==="object")Object.assign(p,v)}catch(_){}
  const mode=["classic","neo","midnight"].includes(p.uiTheme)?p.uiTheme:"midnight";
  const accent=["navy","violet","forest","rose","amber"].includes(p.accent)?p.accent:"navy";
  const dark=p.appearance==="dark"||(p.appearance!=="light"&&window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches);
  const fonts={inter:'Inter,system-ui,sans-serif',poppins:'Poppins,system-ui,sans-serif',nunito:'"Nunito Sans",system-ui,sans-serif',manrope:'Manrope,system-ui,sans-serif',ibm:'"IBM Plex Sans",system-ui,sans-serif',merriweather:'Merriweather,Georgia,serif'};
  document.body.dataset.uiTheme=mode;document.body.dataset.accent=accent;
  document.body.classList.toggle("light",!dark);
  document.body.style.fontFamily=fonts[p.font]||fonts.inter;
  document.body.style.fontSize=p.textSize==="large"?"17px":"";
 }
 apply();
 window.addEventListener("focus",apply);
 window.addEventListener("pageshow",apply);
 window.addEventListener("storage",function(ev){if(ev.key==="d-study-shared-preferences-v1")apply()});
 if(window.matchMedia){const m=window.matchMedia("(prefers-color-scheme: dark)");m.addEventListener?.("change",apply)}
})();