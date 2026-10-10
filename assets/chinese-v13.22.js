(function(){
"use strict";
const ID="chinese", KEY_PREFIX="d-study-chinese-state::", FC_PREFIX="d-study-chinese-flashcards::";
const SUBJECT_NAME="Chinese", BASE="/d-study-app/chinese/";
const previous={stateKey:stateKey,draftKey:draftKey,oldDraftKey:oldDraftKey,loadState:loadState,persist:persist,
  enterSubject:enterSubject,backToSubjects:backToSubjects,renderSubjectHub:renderSubjectHub,
  chooseSubject:chooseSubject,applyPathRoute:applyPathRoute,switchTab:switchTab,saveQuizDraft:saveQuizDraft,
  renderTracker:renderTracker,renderHistory:renderHistory,renderNotesHub:renderNotesHub,
  exportData:exportData,importData:importData,resetData:resetData};
const isCn=()=>activeSubject===ID;
const userId=()=>activeUser&&activeUser.id;
const stateStorage=()=>KEY_PREFIX+userId();
const flashStorage=()=>FC_PREFIX+userId();
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const prefs=()=>{try{return JSON.parse(localStorage.getItem("d-study-shared-preferences-v1")||"null")||defaultPreferences()}catch(_){return defaultPreferences()}};
const emptyState=()=>({subjectId:ID,schemaVersion:1,topics:[],pages:{},notes:{},noteMedia:{},
 accuracy:{},lastReview:{},quizHistory:[],quizTopicStats:{},quizNotes:{sections:{},questions:{}},preferences:prefs()});
const isCnState=x=>!!(x&&typeof x==="object"&&x.subjectId===ID);
function quarantine(source,raw){try{localStorage.setItem("d-study-chinese-quarantine::"+userId()+"::"+Date.now()+"::"+source,raw)}catch(_){}}
function loadChinese(){
 const raw=localStorage.getItem(stateStorage());
 if(!raw)return emptyState();
 try{
  const x=JSON.parse(raw);
  if(!isCnState(x)){quarantine("state",raw);return emptyState()}
  const next=emptyState();
  ["topics","pages","notes","noteMedia","accuracy","lastReview","quizHistory","quizTopicStats","quizNotes"].forEach(k=>{
   if(x[k]&&typeof x[k]==="object")next[k]=x[k];
  });
  next.preferences=prefs();return next;
 }catch(_){quarantine("invalid-state",raw);return emptyState()}
}
stateKey=function(){return isCn()?stateStorage():previous.stateKey()};
draftKey=function(mode=quizMode,part=quizPart){return isCn()?"d-study-chinese-draft::"+userId()+"::"+part+"::"+mode:previous.draftKey(mode,part)};
oldDraftKey=function(mode=quizMode){return isCn()?"d-study-chinese-draft::"+userId()+"::legacy::"+mode:previous.oldDraftKey(mode)};
saveQuizDraft=function(){if(isCn())return;return previous.saveQuizDraft()}; // Never store a prior subject quiz in Chinese drafts
loadState=function(){if(isCn()){state=loadChinese();return}return previous.loadState()};
persist=function(){
 if(!activeUser||!state)return;
 if(isCn()){
  if(!isCnState(state)){quarantine("blocked-cross-write",JSON.stringify(state));return}
  state.preferences=prefs();localStorage.setItem(stateStorage(),JSON.stringify(state));return;
 }
 if(isCnState(state)){quarantine("blocked-other-subject",JSON.stringify(state));return}
 return previous.persist();
};
function show(el){const n=document.getElementById(el);if(n)n.hidden=false;return n}
function ensureCard(){
 const grid=document.querySelector("#subjectScreen .subject-grid");
 if(!grid||document.getElementById("subjectChineseCard"))return;
 const card=document.createElement("article");card.className="subject-card live cn-card";card.id="subjectChineseCard";card.dataset.subject=ID;
 card.innerHTML='<span class="subject-state">Ready</span><strong>Chinese</strong><span>汉语 • Writing & Study</span><small>Boya Chinese • Lessons 6–10 ready</small><div class="subject-card-actions"><button id="cnOpen" type="button">Open Chinese</button><button id="cnPreview" class="secondary" type="button">Preview</button></div>';
 grid.insertBefore(card,grid.querySelector(".subject-card.coming"));
 document.getElementById("cnOpen").onclick=()=>chooseSubject(ID);
 document.getElementById("cnPreview").onclick=()=>openChinesePreview();
}
function openChinesePreview(){
 const panel=document.getElementById("subjectPreviewPanel"),title=document.getElementById("subjectPreviewTitle"),body=document.getElementById("subjectPreviewBody");
 if(!panel||!body)return;
 panel.hidden=false;
 const unlock=document.getElementById("subjectUnlockPanel");if(unlock)unlock.hidden=true;
 if(title)title.textContent="Chinese Preview";
 body.innerHTML='<div class="cn-hero"><div><div class="eyebrow">Chinese • 汉语</div><strong>Write to remember.</strong><p>Boya Chinese Lessons 6–10 have dedicated writing-flashcard pages.</p><button type="button" id="cnPreviewOpen">Open Chinese</button></div><div class="cn-icon">✍️</div></div>';
 document.getElementById("cnPreviewOpen").onclick=()=>chooseSubject(ID);
 panel.scrollIntoView({block:"start",behavior:"smooth"});
}
renderSubjectHub=function(){previous.renderSubjectHub();ensureCard()};
chooseSubject=function(subjectId){
 if(subjectId!==ID)return previous.chooseSubject(subjectId);
 if(!activeUser)return;
 if(!hasSubjectAccess(activeUser,ID))grantSubjectAccess(ID); // No Chinese access token configured in structure-only version
 enterSubject(ID);
};
function layer(parent,id,markup){
 const host=document.getElementById(parent);if(!host)return;
 let dest=document.getElementById(id);
 if(!dest){dest=document.createElement("div");dest.id=id;host.appendChild(dest)}
 if(markup!==undefined)dest.innerHTML=markup;
 return dest;
}
function ensureLayers(){
 layer("tracker","cnProgressLayer");
 layer("summary","cnSummaryLayer");
 layer("quiz","cnQuizLayer");
 layer("notes","cnNotesLayer");
 layer("history","cnHistoryLayer");
 const fc=document.getElementById("flashcards");
 if(fc&&!document.getElementById("cnFlashcardsLayer")){const n=document.createElement("div");n.id="cnFlashcardsLayer";fc.appendChild(n)}
}
function updateChrome(){
 const h=document.querySelector("#appShell header h1");if(h)h.textContent="D Study App • Chinese";
 const s=document.querySelector("#appShell header .sub");if(s)s.textContent="Write → Check → Repeat • autosave + subject-isolated progress";
 document.querySelectorAll("#appShell nav.tabs a[data-tab]").forEach(a=>{const slug=a.dataset.tab==="tracker"?"progress":a.dataset.tab;a.href=BASE+slug+"/"});
 const footer=document.getElementById("appVersionLabel");if(footer)footer.textContent="D Study App v13.22.1 • Chinese workspace";
}
function setCnTheme(){
 // The TU101 theme masks its own summary/quiz panels. Clear it on Chinese entry
 // so Chinese's separate panels are visible even after TU101 → Subjects → Chinese.
 if(isCn())document.body.classList.remove("subject-tu101");
 document.body.classList.toggle("subject-chinese",isCn());
 if(isCn())updateChrome();
}
function renderCnProgress(){
 const deckList=banks(),completed=readFlash().decks||{};
 const n=layer("tracker","cnProgressLayer");
 if(!n)return;
 n.innerHTML='<div class="cn-hero"><div><div class="eyebrow">CHINESE STUDY DASHBOARD</div><strong>Chinese • 汉语</strong><p>Writing Flashcards for Boya Chinese Lessons 6–10 are ready. Summaries and quizzes will be added later.</p><div class="cn-actions"><button type="button" data-cn-nav="flashcards">Open writing practice</button><button type="button" class="secondary" data-cn-nav="notes">Open notes</button></div></div><div class="cn-icon">✍️</div></div>'+
 '<div class="cn-kpis"><div class="card"><div class="small">Lessons available</div><strong>0</strong></div><div class="card"><div class="small">Writing decks</div><strong>'+deckList.length+'</strong></div><div class="card"><div class="small">Completed writing cycles</div><strong>'+Object.values(completed).reduce((n,x)=>n+(Number(x.completionCount)||0),0)+'</strong></div></div>'+
 '<div class="cn-empty" style="margin-top:18px"><h3>Ready to write</h3><p>169 flashcards in five lessons. Open a lesson or browse the Flashcards tab.</p><div class="cn-lesson-shortcuts">'+deckList.map(d=>'<a href="'+chineseLessonUrl(d.lesson)+'">บท '+Number(d.lesson)+' ↗</a>').join("")+'</div></div>'+
 '<div class="cn-actions"><button class="secondary" id="cnBackupExport">Export Chinese backup</button><button class="secondary" id="cnBackupImport">Import Chinese backup</button><input hidden id="cnBackupFile" type="file" accept=".json,application/json"></div>';
 n.querySelector("#cnBackupExport").onclick=()=>exportData();
 n.querySelector("#cnBackupImport").onclick=()=>n.querySelector("#cnBackupFile").click();
 n.querySelector("#cnBackupFile").onchange=ev=>importData(ev);
}
function renderCnSummary(){
 const n=layer("summary","cnSummaryLayer");
 n.innerHTML='<div class="cn-intro"><div class="eyebrow">Study notes</div><h2>Chinese Summary Library</h2><p>A lecture-organized bilingual study library is prepared. Your textbook is kept outside the public repo and has not been turned into lessons.</p></div><div class="cn-empty"><h3>No summaries added yet</h3><p>Future sections will support Hanzi, Pinyin, grammar, explanations, diagrams and examples.</p></div>';
}
function renderCnQuiz(){
 const n=layer("quiz","cnQuizLayer");
 n.innerHTML='<div class="cn-intro"><div class="eyebrow">Practice</div><h2>Chinese Quiz Library</h2><p>Reviewing and Mastering will stay separate, with autosaved answers, confidence flags, mistakes and quiz history.</p></div><div class="cn-empty"><h3>Question banks pending</h3><p>No generated questions or mock exams have been inserted.</p><div class="cn-actions" style="justify-content:center"><button disabled>Reviewing</button><button disabled class="secondary">Mastering</button></div></div>';
}
function renderCnNotes(){
 const n=layer("notes","cnNotesLayer");
 n.innerHTML='<div class="cn-intro"><div class="eyebrow">Personal knowledge base</div><h2>Chinese Notes</h2><p>Private, autosaved notes for this subject only. You can add source-based lesson notes later.</p></div><div class="card"><label for="cnNoteEditor" class="lecture-title">My Chinese notebook</label><p class="small">Autosaves on this device. Included in Chinese-only backup.</p><textarea class="cn-note" id="cnNoteEditor" placeholder="Write anything you want to remember…"></textarea><div class="cn-privacy" id="cnNoteStatus">Saved locally in Chinese only</div></div>';
 const textarea=n.querySelector("#cnNoteEditor");
 textarea.value=state.notes.course||"";
 textarea.oninput=()=>{state.notes.course=textarea.value;persist();const status=n.querySelector("#cnNoteStatus");if(status)status.textContent="Saved in Chinese workspace ✓"};
}
function renderCnHistory(){
 const n=layer("history","cnHistoryLayer");
 n.innerHTML='<div class="cn-intro"><div class="eyebrow">Practice record</div><h2>Chinese Quiz History</h2><p>Chinese quiz attempts will appear here, independently from your other subjects.</p></div><div class="cn-empty"><h3>No attempts yet</h3><p>Question banks have not been published.</p></div>';
}
function ensureCnUI(){
 ensureLayers();renderCnProgress();renderCnSummary();renderCnQuiz();renderCnNotes();renderCnHistory();renderCnFlashcards();
}
enterSubject=function(subjectId,remember=true){
 if(subjectId!==ID){const out=previous.enterSubject(subjectId,remember);document.body.classList.remove("subject-chinese");return out}
 if(!activeUser||!hasSubjectAccess(activeUser,ID))return;
 if(state)persist(); // persist previous subject before switch
 activeSubject=ID;
 if(remember!==false)rememberSubjectSession(ID);
 loadState();
 document.getElementById("subjectScreen").style.display="none";
 document.getElementById("appShell").style.display="block";
 applyPreferences();setCnTheme();ensureCnUI();
 const chip=document.getElementById("userChip");if(chip)chip.textContent="👤 "+activeUser.username;
 if(!location.pathname.startsWith(BASE))history.replaceState({dStudy:true},"",BASE+"progress/");
 applyPathRoute();
};
backToSubjects=function(){
 if(isCn()){persist();stopDrawing();activeSubject=null;document.body.classList.remove("subject-chinese");
  clearSubjectSession();document.getElementById("appShell").style.display="none";renderSubjectHub();return}
 return previous.backToSubjects();
};
renderTracker=function(){if(isCn())return renderCnProgress();return previous.renderTracker()};
renderNotesHub=function(){if(isCn())return renderCnNotes();return previous.renderNotesHub()};
renderHistory=function(){if(isCn())return renderCnHistory();return previous.renderHistory()};
switchTab=function(name){
 const r=previous.switchTab(name);
 if(isCn()){
  if(name==="tracker")renderCnProgress();
  if(name==="summary")renderCnSummary();
  if(name==="quiz")renderCnQuiz();
  if(name==="notes")renderCnNotes();
  if(name==="history")renderCnHistory();
  if(name==="flashcards")renderCnFlashcards();
 }
 return r;
};
applyPathRoute=function(){
 if(!isCn())return previous.applyPathRoute();
 let path=location.pathname.replace(/\/+$/,"");
 let tab=path.slice(BASE.length).split("/")[0]||"progress";
 const map={progress:"tracker",notes:"notes",summary:"summary",quiz:"quiz",flashcards:"flashcards",history:"history",prompt:"prompt",settings:"settings"};
 if(!map[tab])tab="progress";
 switchTab(map[tab]);
 if(tab==="settings")applyPreferences();
};
document.addEventListener("click",ev=>{
 if(!isCn())return;
 const link=ev.target.closest("a.tab[data-tab], [data-cn-nav]");
 if(!link||!document.getElementById("appShell").contains(link))return;
 const tab=link.dataset.cnNav||(link.dataset.tab==="tracker"?"progress":link.dataset.tab);
 if(!["progress","summary","quiz","flashcards","notes","history","prompt","settings"].includes(tab))return;
 ev.preventDefault();history.pushState({dStudy:true},"",BASE+tab+"/");applyPathRoute();
},true);
window.addEventListener("popstate",()=>{if(isCn())applyPathRoute()});
function downloadBackup(payload,name){
 const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"}),a=document.createElement("a");
 a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(a.href),1200);
}
exportData=function(){
 if(!isCn())return previous.exportData();
 persist();downloadBackup({app:"D Study App",subject:ID,schemaVersion:1,exportedAt:new Date().toISOString(),profile:activeUser.username,state:state,flashcards:readFlash()},"d-study-"+activeUser.username+"-chinese-backup.json");
};
importData=function(ev){
 if(!isCn())return previous.importData(ev);
 const f=ev.target.files&&ev.target.files[0];if(!f)return;
 const reader=new FileReader();
 reader.onload=()=>{
  try{
   const x=JSON.parse(reader.result);
   if(x.subject!==ID||!isCnState(x.state)||x.flashcards&&x.flashcards.subjectId!==ID)throw Error("This backup does not belong to Chinese.");
   const incoming=JSON.stringify(x.state);JSON.parse(incoming);
   localStorage.setItem(stateStorage(),incoming);
   if(x.flashcards)localStorage.setItem(flashStorage(),JSON.stringify(x.flashcards));
   loadState();ensureCnUI();alert("Chinese backup imported.");
  }catch(e){alert("Import blocked: "+e.message)}
  ev.target.value="";
 };
 reader.readAsText(f);
};
resetData=function(){
 if(!isCn())return previous.resetData();
 if(!confirm("Reset Chinese notes, writing progress and history? EC214 and TU101 will not be affected."))return;
 state=emptyState();persist();localStorage.removeItem(flashStorage());
 Object.keys(localStorage).filter(k=>k.startsWith("d-study-chinese-draft::"+userId()+"::")).forEach(k=>localStorage.removeItem(k));
 stopDrawing();ensureCnUI();
};
// Standalone handwriting engine, adapted from the user's Claude prototype; no source words published.
const drawing={active:false,pointer:null,rect:null,strokes:[],current:null,deck:null,queue:[],missed:[],index:0,pass:0,recognized:0,review:false,blank:true};
function banks(){
 const raw=window.D_STUDY_CHINESE_WRITING_BANK;
 return raw&&Array.isArray(raw.decks)?raw.decks.filter(d=>d&&d.id&&Array.isArray(d.cards)):[]; // content supplied later
}
function readFlash(){
 if(!userId())return{subjectId:ID,version:1,decks:{}};
 try{const raw=localStorage.getItem(flashStorage());if(!raw)return{subjectId:ID,version:1,decks:{}};
  const x=JSON.parse(raw);if(x.subjectId!==ID){quarantine("flashcard",raw);return{subjectId:ID,version:1,decks:{}}}
  return {subjectId:ID,version:1,decks:x.decks&&typeof x.decks==="object"?x.decks:{}};
 }catch(_){return{subjectId:ID,version:1,decks:{}}}
}
function saveFlash(obj){if(obj.subjectId!==ID)return;localStorage.setItem(flashStorage(),JSON.stringify(obj))}
function mix(arr){const x=arr.slice();for(let i=x.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[x[i],x[j]]=[x[j],x[i]]}return x}
function chineseLessonUrl(lesson){
 const n=Number(lesson);
 return BASE+"flashcards/lesson-"+(Number.isInteger(n)&&n>=6&&n<=10?n:6)+"/";
}
function renderCnFlashcards(){
 if(!isCn())return;
 stopDrawing();
 const root=document.getElementById("flashcards");
 if(!root)return;
 const decks=banks(),stored=readFlash().decks||{};
 root.innerHTML='<div id="cnFlashcardsLayer">'+
 '<div class="cn-intro"><div class="eyebrow">CHINESE • ACTIVE RECALL</div><h2>✍ Chinese Writing Flashcards</h2><p>Choose a lesson to open its full handwriting practice page. Each lesson has its own link. Write from Pinyin, check the Hanzi, and retry missed words until 100%.</p></div>'+
 '<div class="cn-lesson-grid">'+decks.map(d=>{
  const complete=Number(stored[d.id]?.completionCount)||0;
  return '<article class="card cn-lesson-card">'+
  '<div class="eyebrow">BOYA CHINESE • LESSON '+Number(d.lesson)+'</div>'+
  '<h3>บท '+Number(d.lesson)+'</h3>'+
  '<div class="cn-lesson-hanzi">'+esc(d.title||"")+'</div>'+
  '<p class="small">'+d.cards.length+' คำศัพท์ • จำครบ 100% × '+complete+' รอบ</p>'+
  '<a class="cn-lesson-link" href="'+chineseLessonUrl(d.lesson)+'" aria-label="Practice writing lesson '+Number(d.lesson)+'">✍ Practice writing <span aria-hidden="true">↗</span></a>'+
  '</article>';
 }).join("")+'</div>'+
 '<div class="cn-study-note"><b>Study mode:</b> Fullscreen handwriting grid, reveal answer, Remembered / Try again, and locally saved progress. Uses the same writing engine as the standalone version.</div>'+
 '</div>';
}
function startWriter(deck){
 drawing.deck=deck;drawing.blank=!deck;drawing.queue=deck?mix(deck.cards.filter(c=>c.id&&c.h&&c.p)):[];drawing.missed=[];
 drawing.index=0;drawing.pass=0;drawing.recognized=0;drawing.review=false;drawing.strokes=[];
 // Restore the same ordered remaining cards and retry pile without changing card IDs.
 const saved=deck&&readFlash().decks[deck.id]?.session;
 if(saved&&Array.isArray(saved.queueIds)){
  const lookup=new Map(drawing.queue.map(card=>[card.id,card]));
  const restoreQueue=saved.queueIds.map(id=>lookup.get(id));
  const restoreMissed=Array.isArray(saved.missedIds)?saved.missedIds.map(id=>lookup.get(id)):[];
  if(restoreQueue.length>0&&restoreQueue.length<=drawing.queue.length&&restoreQueue.every(Boolean)&&restoreMissed.every(Boolean)&&
     Number.isInteger(saved.index)&&saved.index>=0&&saved.index<=restoreQueue.length){
   drawing.queue=restoreQueue;drawing.missed=restoreMissed;drawing.index=saved.index;
   drawing.pass=Number.isInteger(saved.pass)&&saved.pass>=0?saved.pass:0;
  }
 }
 const mount=document.getElementById("cnWritingMount");if(!mount)return;
 const picker=document.getElementById("cnDeckSelection");
 if(picker)picker.hidden=true;
 mount.hidden=false;
 mount.innerHTML='<div class="cn-writer" id="cnWriter"><div class="cn-writer-top"><div><strong>✍️ Writing practice</strong><span id="cnWriterPosition"></span></div><div class="cn-writer-tools"><button type="button" class="secondary" id="cnFs" aria-label="Toggle fullscreen">⛶ Fullscreen</button><button type="button" class="secondary" id="cnCloseWriter">✕</button></div></div>'+
 '<div class="cn-writer-stage" id="cnWriterStage"><div class="cn-writer-hint" id="cnWriterHint"></div><div class="cn-pinyin" id="cnPinyin"></div><div class="cn-square-zone" id="cnZone"><div class="cn-square" id="cnSquare"><canvas id="cnCanvas" aria-label="Chinese handwriting area"></canvas></div></div></div>'+
 '<div class="cn-reveal" id="cnReveal" hidden><div class="cn-compare"><div><div class="cn-caption">Your writing</div><div class="cn-compare-box"><canvas id="cnCompare"></canvas></div></div><div><div class="cn-caption">Correct answer</div><div class="cn-compare-box cn-hanzi" id="cnAnswer"></div></div></div><div class="cn-pinyin" id="cnRevealPinyin"></div><div class="cn-answer-meaning" id="cnMeaning"></div></div>'+
 '<div class="cn-writer-actions" id="cnDrawActions"><button type="button" class="secondary" id="cnClear">Clear</button><button type="button" id="cnCheck">Check writing</button></div>'+
 '<div class="cn-writer-actions" id="cnRateActions" hidden><button type="button" class="secondary" id="cnAgain">Try again</button><button type="button" id="cnYes">Remembered ✓</button></div></div>';
 const q=id=>document.getElementById(id);
 q("cnCloseWriter").onclick=()=>{renderCnFlashcards();document.getElementById("cnFlashcardsLayer")?.scrollIntoView({block:"start",behavior:"auto"})};
 q("cnFs").onclick=toggleFs;
 q("cnClear").onclick=()=>{drawing.strokes=[];painting();saveCurrentStrokes()};
 q("cnCheck").onclick=checkWriting;
 q("cnAgain").onclick=()=>rate(false);
 q("cnYes").onclick=()=>rate(true);
 const cnCanvas=q("cnCanvas");
 cnCanvas.addEventListener("pointerdown",beginStroke);
 cnCanvas.addEventListener("pointermove",moveStroke);
 cnCanvas.addEventListener("pointerup",endStroke);
 cnCanvas.addEventListener("pointercancel",endStroke);
 cnCanvas.addEventListener("lostpointercapture",endStroke);
 renderWritingCard();
 if("ResizeObserver" in window){
  drawing.observer=new ResizeObserver(()=>{if(!drawing.active)requestAnimationFrame(layoutSquare)});
  drawing.observer.observe(q("cnZone"));
 }
 window.addEventListener("resize",layoutSquare);
 // The original writer was appended below all decks. Its button appeared
 // broken because the canvas opened off-screen, often several swipes lower.
 requestAnimationFrame(()=>{
  layoutSquare();
  const writer=document.getElementById("cnWriter");
  if(writer){writer.tabIndex=-1;writer.scrollIntoView({block:"start",behavior:"auto"});writer.focus({preventScroll:true})}
 });
}
function currentCard(){return drawing.blank?null:drawing.queue[drawing.index]||null}
function renderWritingCard(){
 const q=id=>document.getElementById(id);if(!q("cnWriter"))return;
 if(!drawing.blank&&drawing.index>=drawing.queue.length){
  if(drawing.missed.length){
   drawing.queue=mix(drawing.missed);drawing.missed=[];drawing.index=0;drawing.pass++;
  }else{
   const d=drawing.deck,store=readFlash(),p=store.decks[d.id]||{completionCount:0};
   p.completionCount++;p.lastCompletedAt=new Date().toISOString();p.session=null;store.decks[d.id]=p;saveFlash(store);
   q("cnWriterStage").innerHTML='<div class="cn-empty"><h3>100% Remembered ✓</h3><p>You cleared every writing flashcard, including retries.</p><button type="button" id="cnDone">Back to flashcards</button></div>';
   q("cnDrawActions").hidden=true;q("cnRateActions").hidden=true;
   q("cnDone").onclick=()=>{renderCnFlashcards();document.getElementById("cnFlashcardsLayer")?.scrollIntoView({block:"start",behavior:"auto"})};return;
  }
 }
 const card=currentCard();drawing.review=false;drawing.strokes=[];
 q("cnWriterStage").hidden=false;q("cnReveal").hidden=true;q("cnDrawActions").hidden=false;q("cnRateActions").hidden=true;
 q("cnWriterHint").textContent=drawing.blank?"Blank canvas • not graded":"Write the Hanzi from memory before revealing.";
 q("cnPinyin").textContent=card?card.p:"自由练习";
 q("cnWriterPosition").textContent=drawing.blank?" • Sandbox":(" • "+(drawing.index+1)+"/"+drawing.queue.length+(drawing.pass?" • Retry "+drawing.pass:""));
 if(card){q("cnAnswer").textContent=card.h;q("cnRevealPinyin").textContent=card.p;q("cnMeaning").textContent=card.m||""}
 requestAnimationFrame(layoutSquare);
}
function toggleFs(){
 const el=document.getElementById("cnWriter");if(!el)return;
 const native=document.fullscreenElement===el||document.webkitFullscreenElement===el;
 const pseudo=el.classList.contains("cn-pseudo-full");
 if(native){(document.exitFullscreen||document.webkitExitFullscreen)?.call(document);return}
 if(pseudo){el.classList.remove("cn-pseudo-full");requestAnimationFrame(layoutSquare);return}
 if(el.requestFullscreen){Promise.resolve(el.requestFullscreen()).catch(()=>{el.classList.add("cn-pseudo-full");layoutSquare()})}
 else if(el.webkitRequestFullscreen){el.webkitRequestFullscreen()}
 else{el.classList.add("cn-pseudo-full");layoutSquare()}
}
document.addEventListener("fullscreenchange",()=>{if(document.getElementById("cnWriter"))requestAnimationFrame(layoutSquare)});
function layoutSquare(){
 const zone=document.getElementById("cnZone"),square=document.getElementById("cnSquare"),canvas=document.getElementById("cnCanvas");
 if(!zone||!square||!canvas||drawing.active||!zone.isConnected)return;
 const b=zone.getBoundingClientRect();
 if(b.width<70||b.height<70)return;
 const size=Math.max(72,Math.floor(Math.min(b.width-4,b.height-4,480)));
 if(square.style.width!==size+"px"){square.style.width=size+"px";square.style.height=size+"px"}
 const dpr=Math.min(window.devicePixelRatio||1,3);
 const w=Math.round(size*dpr),h=w;
 if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h}
 painting();
}
function painting(){
 const canvas=document.getElementById("cnCanvas");if(!canvas||!canvas.width)return;
 const ctx=canvas.getContext("2d"),size=canvas.width;
 ctx.clearRect(0,0,size,size);
 ctx.lineCap="round";ctx.lineJoin="round";ctx.lineWidth=Math.max(3,size*.018);
 ctx.strokeStyle=getComputedStyle(document.getElementById("cnWriter")).getPropertyValue("--ink").trim()||getComputedStyle(document.body).getPropertyValue("--ink").trim()||"#172033";
 for(const stroke of drawing.strokes){
  if(!stroke.length)continue;
  ctx.beginPath();ctx.moveTo(stroke[0][0]*size,stroke[0][1]*size);
  if(stroke.length===1){ctx.lineTo((stroke[0][0]+.001)*size,(stroke[0][1]+.001)*size)}
  for(let j=1;j<stroke.length;j++)ctx.lineTo(stroke[j][0]*size,stroke[j][1]*size);
  ctx.stroke();
 }
}
function coord(e){
 const rect=drawing.rect||document.getElementById("cnCanvas").getBoundingClientRect();
 return[Math.max(0,Math.min(1,(e.clientX-rect.left)/rect.width)),Math.max(0,Math.min(1,(e.clientY-rect.top)/rect.height))];
}
function beginStroke(e){
 if(drawing.active||e.button>0)return;
 e.preventDefault();drawing.active=true;drawing.pointer=e.pointerId;drawing.rect=e.currentTarget.getBoundingClientRect();
 drawing.current=[coord(e)];drawing.strokes.push(drawing.current);
 try{e.currentTarget.setPointerCapture(e.pointerId)}catch(_){}
 painting();
}
function moveStroke(e){
 if(!drawing.active||e.pointerId!==drawing.pointer)return;
 e.preventDefault();drawing.current.push(coord(e));painting();
}
function endStroke(e){
 if(!drawing.active||e.pointerId!==drawing.pointer)return;
 drawing.current.push(coord(e));drawing.active=false;drawing.pointer=null;drawing.rect=null;drawing.current=null;
 painting();saveCurrentStrokes();requestAnimationFrame(layoutSquare);
}
function saveCurrentStrokes(){
 if(drawing.blank||!drawing.deck)return;
 // Persist only a tiny review checkpoint, not the drawing itself; no cross-subject key is touched.
 const store=readFlash(),p=store.decks[drawing.deck.id]||{completionCount:0};
 p.session={queueIds:drawing.queue.map(c=>c.id),missedIds:drawing.missed.map(c=>c.id),index:drawing.index,pass:drawing.pass};
 store.decks[drawing.deck.id]=p;saveFlash(store);
}
function checkWriting(){
 const q=id=>document.getElementById(id),src=q("cnCanvas"),dst=q("cnCompare");
 if(!src||!dst)return;
 dst.width=src.width;dst.height=src.height;
 dst.getContext("2d").clearRect(0,0,dst.width,dst.height);
 dst.getContext("2d").drawImage(src,0,0);
 q("cnWriterStage").hidden=true;q("cnReveal").hidden=false;
 q("cnDrawActions").hidden=true;q("cnRateActions").hidden=false;
 if(drawing.blank){
  q("cnAnswer").textContent="—";q("cnRevealPinyin").textContent="Blank drawing board";q("cnMeaning").textContent="You can clear or continue writing. Nothing will be scored.";
  q("cnAgain").textContent="Draw again";q("cnYes").textContent="Finish practice";
 }
}
function rate(yes){
 if(drawing.blank){if(yes){renderCnFlashcards()}else{renderWritingCard()}return}
 const card=currentCard();
 if(!yes&&card)drawing.missed.push(card);
 if(yes)drawing.recognized++;
 drawing.index++;saveCurrentStrokes();renderWritingCard();
}
function stopDrawing(){
 drawing.active=false;drawing.pointer=null;drawing.rect=null;
 if(drawing.observer){drawing.observer.disconnect();drawing.observer=null}
 window.removeEventListener("resize",layoutSquare);
 const el=document.getElementById("cnWriter");
 if(el){el.classList.remove("cn-pseudo-full");if(document.fullscreenElement===el)document.exitFullscreen?.().catch(()=>{})}
}
// Some native paths restore a session before this extension loads.
ensureCard();
if(activeUser){
 const ss=getSubjectSession();
 const requested=sessionStorage.getItem("d-study-chinese-intent")||location.pathname;
 const explicitOtherSubject=requested.includes("/tu101/")||[
  "/d-study-app/progress/","/d-study-app/notes/","/d-study-app/summary/",
  "/d-study-app/quiz/","/d-study-app/history/","/d-study-app/flashcards/",
  "/d-study-app/prompt/","/d-study-app/settings/"
 ].some(path=>requested.startsWith(path));
 if(ss&&ss.subjectId===ID&&ss.userId===userId()&&ss.expiresAt>Date.now()&&!explicitOtherSubject){
  if(!hasSubjectAccess(activeUser,ID))grantSubjectAccess(ID);
  enterSubject(ID,false);
  if(requested.includes("/chinese/")){history.replaceState({dStudy:true},"",requested);applyPathRoute()}
 }else if(requested.includes("/chinese/")){
  if(!hasSubjectAccess(activeUser,ID))grantSubjectAccess(ID);
  enterSubject(ID,false);history.replaceState({dStudy:true},"",requested);applyPathRoute();
 }else if(isCn())ensureCnUI();
 else renderSubjectHub();
}
const subjectBackButton=document.getElementById("backToSubjectsBtn");
if(subjectBackButton)subjectBackButton.onclick=function(){backToSubjects()};
sessionStorage.removeItem("d-study-chinese-intent");
})();