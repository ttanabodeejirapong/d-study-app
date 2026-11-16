/* EC214 Final Exams — subject-picker integration only. Academic state is handled by its own isolated runtime. */
(function(){
"use strict";
const SUBJECT="ec214final",URL="/d-study-app/ec214-final/";
const oldHub=renderSubjectHub;
function ensure(){
 const grid=document.querySelector("#subjectScreen .subject-grid");if(!grid)return;
 let card=document.getElementById("subjectEcFinalCard");
 if(!card){
  card=document.createElement("article");
  card.className="subject-card live";card.id="subjectEcFinalCard";card.dataset.subject=SUBJECT;
  card.innerHTML='<span class="subject-state" id="finalSubjectState">Locked</span>'+
  '<strong>EC214 Final Exams</strong><span>Introductory Macroeconomics · Final</span><small>Lecture 5 AD–AS • Professor-first summaries and quizzes • More lectures coming</small>'+
  '<div class="subject-card-actions"><button id="finalSubjectOpenBtn" type="button">Unlock Final Exams</button><button type="button" id="finalSubjectPreviewBtn" class="secondary">Preview</button></div>';
  const coming=grid.querySelector(".subject-card.coming");if(coming)grid.insertBefore(card,coming);else grid.appendChild(card);
  document.getElementById("finalSubjectOpenBtn").onclick=()=>location.assign(URL);
  document.getElementById("finalSubjectPreviewBtn").onclick=preview;
 }
 update();
}
function update(){
 if(!activeUser)return;
 const unlocked=hasSubjectAccess(activeUser,SUBJECT);
 const st=document.getElementById("finalSubjectState"),btn=document.getElementById("finalSubjectOpenBtn"),card=document.getElementById("subjectEcFinalCard");
 if(st)st.textContent=unlocked?"Unlocked":"Locked";
 if(btn){btn.textContent=unlocked?"Open EC214 Final":"Unlock EC214 Final";btn.classList.toggle("secondary",unlocked)}
 if(card)card.classList.toggle("unlocked",unlocked);
}
function preview(){
 const p=document.getElementById("subjectPreviewPanel"),body=document.getElementById("subjectPreviewBody"),title=document.getElementById("subjectPreviewTitle");
 if(!p||!body)return;
 const old=document.getElementById("subjectUnlockPanel");if(old)old.hidden=true;
 p.hidden=false;if(title)title.textContent="EC214 Final Exams Preview";
 body.innerHTML='<div class="cn-hero"><div><div class="eyebrow">EC214 FINAL · 2026–2</div><strong>Read → Review → Master.</strong>'+
 '<p>New isolated final-exam workspace with the professor’s Lecture 5 AD–AS summary (13 sections), independent Reviewing and Mastering quizzes, notes, history, progress and backups. Flashcards intentionally empty; later lectures will be added.</p>'+
 '<button type="button" id="finalPreviewOpen">Open EC214 Final</button></div><div class="cn-icon">📈</div></div>';
 document.getElementById("finalPreviewOpen").onclick=()=>location.assign(URL);
 p.scrollIntoView({block:"start",behavior:"smooth"});
}
renderSubjectHub=function(){oldHub();ensure()};
ensure();
if(activeUser&&location.pathname.startsWith("/d-study-app/subjects")){
 const returning=sessionStorage.getItem("d-study-final-return-subjects");
 if(returning){
  sessionStorage.removeItem("d-study-final-return-subjects");
  // Persist the last subject through the existing backwards-compatible wrappers.
  if(activeSubject)backToSubjects();else renderSubjectHub();
 }else if(document.getElementById("subjectScreen").style.display!=="none")ensure();
}
})();