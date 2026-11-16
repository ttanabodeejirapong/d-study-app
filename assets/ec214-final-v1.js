/* EC214 Final Exams — Lecture 5 course runtime.
 * Separate academic namespace and subject-scoped backups. No EC214/TU101/Chinese mutations.
 */
(function(){
"use strict";
const SUB="ec214final", TOKEN_SHA256="8fa76a3d4b74696c6d8ea2023997b7ffca884a0c62c16a63d86b607d1dc96a64", BASE="/d-study-app/ec214-final/";
const BOOK=window.D_STUDY_FINAL_L5, QB=window.D_STUDY_FINAL_L5_QUIZZES;
if(!BOOK||!QB)return;
const $=id=>document.getElementById(id);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const storeGet=k=>{try{return localStorage.getItem(k)}catch(_){return null}};
const storePut=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
const parse=(s,fallback=null)=>{try{return JSON.parse(s)||fallback}catch(_){return fallback}};
const usersKey="d-study-users-v1",activeKey="d-study-active-user";
let user=null,state=null,currentTab="progress",quizMode="reviewing",currentIndex=0,submittedView=false,quizSearchQuery="",historySearchText="",historyFilterMode="all";
const qsets={reviewing:QB.reviewing,mastering:QB.mastering};
function newState(){return {subjectId:SUB,profileId:user.id,schemaVersion:1,lectureStates:{"l5":{}},notes:{"l5":""},quizDrafts:{},quizHistory:[],quizTopicStats:{},quizQuestionNotes:{},createdAt:new Date().toISOString()}}
const key=()=> "d-study-ec214-final-state::"+user.id;
const quarantine=(tag,raw)=>{try{localStorage.setItem("d-study-ec214-final-quarantine::"+user.id+"::"+Date.now()+"::"+tag,raw)}catch(_){}};
function loadState(){
 const raw=storeGet(key());if(!raw)return newState();
 const x=parse(raw);
 if(!x||x.subjectId!==SUB||x.profileId!==user.id){quarantine("subject-mismatch",raw);return newState()}
 const a=newState();
 for(const k of ["lectureStates","notes","quizDrafts","quizHistory","quizTopicStats","quizQuestionNotes"]){
  if(x[k]&&typeof x[k]==="object"&&(k!=="quizHistory"||Array.isArray(x[k])))a[k]=x[k];
 }
 return a;
}
function save(){
 if(!user||!state)return;
 if(state.subjectId!==SUB||state.profileId!==user.id){quarantine("blocked-write",JSON.stringify(state));return}
 try{storePut(key(),state)}catch(e){setStatus("Storage unavailable: "+e.message)}
}
function setStatus(txt){const s=$("finalStatus");if(s)s.textContent=txt}
function sessionUser(){
 const session=parse(storeGet(activeKey));if(!session||!session.id||session.expiresAt<=Date.now())return null;
 const users=parse(storeGet(usersKey),[]);
 return Array.isArray(users)?users.find(x=>x.id===session.id)||null:null;
}
function sharedPrefs(){
 const p=parse(storeGet("d-study-shared-preferences-v1"),{});
 return Object.assign({appearance:"system",uiTheme:"midnight",accent:"navy",font:"inter",textSize:"normal",cardStyle:"normal"},p);
}
function theme(){
 const p=sharedPrefs(),body=document.body;
 const dark=p.appearance==="dark"||(p.appearance!=="light"&&window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches);
 body.dataset.accent=p.accent;body.dataset.uiTheme=p.uiTheme;
 body.classList.toggle("dark",dark);
 body.classList.toggle("neo-ui",p.uiTheme==="neo");body.classList.toggle("midnight-ui",p.uiTheme==="midnight");
 body.classList.toggle("large-text",p.textSize==="large");body.classList.toggle("flat-cards",p.cardStyle==="flat");
 const fonts={inter:'Inter,system-ui,"Segoe UI",sans-serif',poppins:'Poppins,system-ui,sans-serif',nunito:'"Nunito Sans",system-ui,sans-serif',manrope:'Manrope,system-ui,sans-serif',ibm:'"IBM Plex Sans",system-ui,sans-serif',merriweather:'Merriweather,Georgia,serif'};
 document.documentElement.style.setProperty("--app-font",fonts[p.font]||fonts.inter);
}
function viewAuth(message,login=false){
 $("finalShell").classList.add("final-hidden");const x=$("finalAuth");x.classList.remove("final-hidden");
 $("finalAuthTitle").textContent=login?"Sign in to D Study App":"Unlock EC214 Final Exams";
 $("finalAuthText").textContent=message;
 $("finalUnlockArea").classList.toggle("final-hidden",login);
 $("finalLoginLink").classList.toggle("final-hidden",!login);
}
async function sha256(s){
 const bytes=new TextEncoder().encode(String(s));
 const dig=await crypto.subtle.digest("SHA-256",bytes);
 return Array.from(new Uint8Array(dig)).map(x=>x.toString(16).padStart(2,"0")).join("");
}
async function unlock(){
 const input=$("finalTokenInput"),token=input.value.trim(),error=$("finalTokenError");
 error.textContent="";
 if(!token){error.textContent="Enter the EC214 Final token.";return}
 if(await sha256(token)!==TOKEN_SHA256){error.textContent="Incorrect EC214 Final token.";return}
 const users=parse(storeGet(usersKey),[]);
 const i=users.findIndex(u=>u.id===user.id);
 if(i<0){error.textContent="Profile is missing from this browser. Sign in again.";return}
 users[i].subjectAccess=users[i].subjectAccess||{};
 users[i].subjectAccess[SUB]={unlockedAt:new Date().toISOString(),version:"14.2"};
 storePut(usersKey,users);
 user=users[i];input.value="";
 openApp();
}
function boot(){
 theme();user=sessionUser();
 if(!user){viewAuth("Please sign in using your existing D Study App local profile first.",true);return}
 const unlocked=!!(user.subjectAccess&&user.subjectAccess[SUB]);
 if(!unlocked){viewAuth("This is a separate Final Exam course. Enter its one-time subject token to unlock it for this local profile.");return}
 openApp();
}
function openApp(){
 $("finalAuth").classList.add("final-hidden");$("finalShell").classList.remove("final-hidden");
 $("finalUser").textContent="👤 "+user.username;
 state=loadState();
 if(!state.lectureStates.l5)state.lectureStates.l5={};
 if(!("l5" in state.notes))state.notes.l5="";
 theme();save();buildOutline();renderAll();
 const path=location.pathname.replace(/\/+$/,"");
 const part=path.split("/").filter(Boolean).at(-1);
 const tab=["progress","summary","quiz","flashcards","notes","history","prompt","settings"].includes(part)?part:"progress";
 navigate(tab,false);
}
function goSubjects(){
 save();try{sessionStorage.setItem("d-study-final-return-subjects","1")}catch(_){}
 location.href="/d-study-app/subjects/";
}
function navigate(tab,push=true){
 if(!["progress","summary","quiz","flashcards","notes","history","prompt","settings"].includes(tab))tab="progress";
 currentTab=tab;
 if(push)history.pushState({dStudy:true,subject:SUB},"",BASE+tab+"/");
 document.querySelectorAll(".final-nav a[data-f-tab]").forEach(a=>{
  const active=a.dataset.fTab===tab;
  a.classList.toggle("active",active);
  if(active)a.setAttribute("aria-current","page");else a.removeAttribute("aria-current");
 });
 document.querySelectorAll(".final-panel").forEach(p=>p.classList.toggle("active",p.id==="f-"+tab));
 if(tab==="progress")renderProgress();
 if(tab==="history")renderHistory();
 if(tab==="notes")renderNotes();
 if(tab==="quiz")renderQuiz();
 if(tab==="settings")renderSettings();
 if(tab==="prompt")renderPrompt();
 if(tab==="flashcards")renderBlankFlashcards();
 if(tab==="summary")renderSummaryProgress();
 window.scrollTo({top:0,behavior:"instant"});
}
function progressPct(){
 const done=BOOK.sections.reduce((n,s)=>n+({notstarted:0,learning:25,reviewed:75,mastered:100}[state.lectureStates.l5[s.id]||"notstarted"]||0),0);
 return Math.round(done/BOOK.sections.length);
}
function renderProgress(){
 const pct=progressPct(),attempts=state.quizHistory.filter(x=>x.lecture==="l5");
 const r=modeStats("reviewing"),m=modeStats("mastering"),latest=attempts.at(-1);
 const latestLearn=latest&&Number.isFinite(latest.adjustedPercent)?latest.adjustedPercent+"%":latest?"not tracked":"—";
 const masteryTopics=Object.values(state.quizTopicStats||{}).filter(x=>x&&x.status==="Mastered").length;
 $("finalProgress").innerHTML=
 '<div class="final-heading"><div class="final-eyebrow">EC214 FINAL • 2026–2</div><h2>Final Exam Study Dashboard</h2>'+
 '<p>Track Lecture 5 summary progress, confidence-weighted quiz points, retakes and mistakes. Future professor lectures will be added here without resetting your records.</p></div>'+
 '<div class="final-grid">'+
 '<article class="final-card"><span class="final-mini">Summary mastery · Lecture 5</span><span class="final-metric">'+pct+'%</span><div class="final-meter"><span style="width:'+pct+'%"></span></div><span class="final-mini">'+BOOK.sections.length+' detailed sections</span></article>'+
 '<article class="final-card"><span class="final-mini">Reviewing · Completed</span><span class="final-metric">'+r.count+' ×</span><span class="final-mini">Best learning '+(r.best===null?"—":r.best+"%")+' · Clean 100% × '+r.perfect+'</span></article>'+
 '<article class="final-card"><span class="final-mini">Mastering · Completed</span><span class="final-metric">'+m.count+' ×</span><span class="final-mini">Best learning '+(m.best===null?"—":m.best+"%")+' · Clean 100% × '+m.perfect+'</span></article></div>'+
 '<div class="final-grid final-grid-two"><article class="final-card"><h3>Most recent attempt</h3><div class="final-metric">'+(latest?latest.score+"/"+latest.total:"—")+'</div>'+
 '<p class="final-mini">Raw accuracy: '+(latest?latest.percent+"%":"—")+' · Learning: '+latestLearn+
 ' · '+(latest?esc(latest.mode):"Not started")+'</p></article>'+
 '<article class="final-card"><h3>Practice & mastery</h3><div class="final-metric">'+masteryTopics+'</div>'+
 '<p class="final-mini">Mastered topic results (two clean Mastering passes required). Existing older attempts remain recorded without invented learning points.</p></article></div>'+
 '<div class="final-card"><h3>📘 Lecture 5 · Aggregate Demand and Aggregate Supply</h3><p>'+
 BOOK.sections.length+' in-depth summary sections · '+QB.reviewing.length+' Reviewing questions · '+
 QB.mastering.length+' Mastering questions. Includes professor graphs, numerical examples and long-run wage adjustment.</p>'+
 '<div class="final-actions"><button class="final-primary" data-final-go="summary">Search / Read Summary →</button>'+
 '<button class="final-action" data-final-go="quiz">Practice Quiz</button>'+
 '<button class="final-action" data-final-go="history">View Attempt History</button></div></div>'+
 '<div class="final-card" style="margin-top:14px"><h3>Coming later</h3>'+
 '<p>Lectures 6 onward will have separate content and quiz attempts, with the same learning-score rules. Flashcards remain empty as requested.</p></div>';
}

function buildOutline(){
 const toc=$("finalTopics");
 toc.innerHTML=BOOK.sections.map(s=>'<button type="button" class="final-topic" data-summary-id="'+esc(s.id)+'">'+esc(s.title)+'</button>').join("");
 const holder=$("finalSections");
 holder.innerHTML=BOOK.sections.map(s=>'<article class="final-card final-section" id="final-section-'+esc(s.id)+'">'+
  '<div class="final-eyebrow">'+esc(s.priority)+'</div><h3>'+esc(s.title)+'</h3>'+
  '<span class="final-ref">Source: Professor Lecture 5 • '+esc(s.pages)+'</span>'+
  (s.fig?graph(s.fig):"")+
  s.html+
  '<div class="final-actions"><label class="final-mini" for="stat-'+esc(s.id)+'">Mark your understanding:</label><select id="stat-'+esc(s.id)+'" class="final-input" data-final-status="'+esc(s.id)+'" style="max-width:230px"><option value="notstarted">Not started</option><option value="learning">Learning</option><option value="reviewed">Reviewed & practiced</option><option value="mastered">Mastered</option></select></div></article>').join("");
 renderSummaryProgress();
 bindSummarySearch();
}
function sectionText(section){
 // Search professor-grounded summary copy without indexing markup/CSS.
 return [section.title,section.priority,section.pages,
  section.html.replace(/<[^>]*>/g," ").replace(/&(?:nbsp|amp|lt|gt);/g," ").replace(/\\s+/g," ")
 ].join(" ").replace(/\s+/g," ").trim();
}
function bindSummarySearch(){
 const input=$("finalSummarySearch"),clear=$("finalSummaryClear"),results=$("finalSummarySearchResults"),meta=$("finalSummarySearchStatus");
 if(!input||!results)return;
 const run=()=>{
  const query=input.value.trim(),terms=query.toLocaleLowerCase().split(/\s+/).filter(Boolean);
  if(!terms.length){results.innerHTML="";meta.textContent="Searches all "+BOOK.sections.length+" Lecture 5 sections";return}
  const hits=BOOK.sections.map(sec=>({sec,text:sectionText(sec)})).filter(x=>terms.every(t=>x.text.toLocaleLowerCase().includes(t)));
  meta.textContent=hits.length+" matching section"+(hits.length===1?"":"s");
  results.innerHTML=hits.length?hits.map(({sec,text})=>{
   const at=Math.max(0,text.toLocaleLowerCase().indexOf(terms[0]));
   const start=Math.max(0,at-55),summary=text.slice(start,start+195);
   return '<button type="button" class="final-search-hit" data-summary-id="'+esc(sec.id)+'">'+
    '<span class="final-eyebrow">'+esc(sec.pages)+'</span><b>'+esc(sec.title)+'</b>'+
    '<span>'+esc((start?"…":"")+summary+(start+195<text.length?"…":""))+'</span></button>';
  }).join(""):'<div class="final-mini">No results for “'+esc(query)+'”. Try a shorter term or an alternate phrase.</div>';
 };
 input.oninput=run;
 if(clear)clear.onclick=()=>{input.value="";run();input.focus()};
 run();
}
function renderSummaryProgress(){
 if(!state)return;
 for(const section of BOOK.sections){
  const el=$("stat-"+section.id);
  if(el)el.value=state.lectureStates.l5[section.id]||"notstarted";
 }
 $("finalSummaryPct").textContent=progressPct()+"%";
}
function graph(type){
 const configs={
 "overview":{lines:[["#18a88a",[[110,220],[440,70]],"SRAS"],["#d2766a",[[110,65],[440,230]],"AD"]],v:null,note:"AD slopes downward; short-run AS slopes upward. Their intersection determines equilibrium."},
 "inputs":{lines:[["#18a88a",[[105,215],[437,65]],"SRAS"]],v:295,note:"Production responds to labor, capital/human capital, land, technology and entrepreneurship."},
 "as-slope":{lines:[["#18a88a",[[120,219],[434,59]],"SRAS"]],v:294,note:"Moving along SRAS: a higher P (money wage fixed) is associated with higher Y."},
 "lras":{lines:[["#18a88a",[[120,215],[440,75]],"SRAS"],["#806ac7",[[293,250],[293,32]],"LRAS"]],v:293,note:"Vertical LRAS at potential GDP while SRAS slopes upward in the short run."},
 "as-shift":{lines:[["#18a88a",[[130,230],[392,85]],"AS₀"],["#4ca3d8",[[215,230],[477,85]],"AS₁"]],v:285,note:"Positive productive-capacity shift moves potential GDP and the AS curve right."},
 "ad-slope":{lines:[["#d2766a",[[125,70],[445,230]],"AD"]],v:null,note:"The current price level causes a movement along the downward-sloping AD curve."},
 "ad-shift":{lines:[["#d2766a",[[112,75],[351,222]],"AD₀"],["#4ca3d8",[[197,75],[436,222]],"AD₁"]],v:null,note:"Positive spending shock shifts AD to the right; contractionary shock shifts it left."},
 "multiplier":{lines:[["#ab8b9b",[[105,65],[305,230]],"AD₀"],["#4ca3d8",[[180,65],[380,230]],"AD₁"],["#d2766a",[[255,65],[455,230]],"AD₂"]],v:null,note:"Initial investment or government expenditure shift (AD₀→AD₁), then induced C (AD₁→AD₂)."},
 "equilibrium":{lines:[["#18a88a",[[120,230],[440,65]],"SRAS"],["#d2766a",[[120,65],[440,230]],"AD"]],v:280,note:"Illustrative equilibrium: P=110, Y=13T. Above/below Pₑ creates pressure toward equilibrium."},
 "gaps":{lines:[["#18a88a",[[120,230],[440,65]],"SRAS"],["#d2766a",[[120,65],[440,230]],"AD"]],v:350,note:"Compare the equilibrium output Yₑ at intersection with potential GDP Yᶠ, the vertical marker."},
 "adjustment":{lines:[["#18a88a",[[115,235],[366,78]],"AS₀"],["#4ca3d8",[[185,235],[436,78]],"AS*"],["#d2766a",[[120,65],[440,230]],"AD"]],v:340,note:"Recessionary self-correction: falling W shifts SRAS right toward full employment."},
 "synthesis":{lines:[["#18a88a",[[110,225],[448,65]],"AS"],["#d2766a",[[110,68],[448,228]],"AD"]],v:291,note:"Shifts in AD or AS change both equilibrium output and the overall price level."}
 };
 const c=configs[type]||configs.overview;
 const axes='<path d="M64 29 V259 H490" stroke="currentColor" fill="none" stroke-width="2"/>'+
 '<text x="15" y="24" font-size="15" fill="currentColor">Price</text><text x="18" y="42" font-size="15" fill="currentColor">level</text>'+
 '<text x="390" y="283" font-size="15" fill="currentColor">Real GDP (Y)</text>';
 let lines="";
 c.lines.forEach(l=>{
  const points=l[1],end=points.at(-1);
  lines+='<polyline fill="none" stroke="'+l[0]+'" stroke-width="4" stroke-linecap="round" points="'+points.map(x=>x.join(",")).join(" ")+'"/>';
  lines+='<text x="'+Math.min(505,end[0]+7)+'" y="'+(end[1]-6)+'" fill="'+l[0]+'" font-size="14" font-weight="bold">'+l[2]+'</text>';
 });
 if(c.v)lines+='<line x1="'+c.v+'" y1="34" x2="'+c.v+'" y2="258" stroke="var(--final-accent)" stroke-dasharray="6 5" stroke-width="2" opacity=".65"/><text x="'+(c.v+5)+'" y="270" font-size="14" fill="var(--final-accent)">Yᶠ</text>';
 return '<figure class="final-chart"><svg viewBox="0 0 550 290" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="'+esc(c.note)+'">'+axes+lines+'</svg><figcaption>'+esc(c.note)+' • Concept diagram redrawn from lecture relationships (not to scale)</figcaption></figure>';
}
function renderBlankFlashcards(){
 $("finalFlashcards").innerHTML='<div class="final-heading"><div class="final-eyebrow">Reserved · not populated</div><h2>Flashcards</h2><p>The flashcard workspace is intentionally empty for EC214 Final Exams, as requested. It will not borrow the cards or progress from EC214 midterm or other subjects.</p></div><div class="final-card"><h3>Ready for future lectures</h3><p>No cards or completion scores are created yet.</p></div>';
}
function renderNotes(){
 const node=$("finalNotes");
 node.innerHTML='<div class="final-heading"><div class="final-eyebrow">Private subject notebook</div><h2>EC214 Final · Lecture Notes</h2><p>Independent of midterm EC214, TU101 and Chinese. Autosaved only to this browser’s EC214 Final academic storage.</p></div><div class="final-card"><label for="finalNoteEditor"><b>Lecture 5 · AD–AS</b></label><textarea class="final-input final-notes" id="finalNoteEditor" placeholder="Professor’s extra remarks, formulas, questions to review…"></textarea><p class="final-mini" id="finalNoteStatus">Your notes are saved locally, in EC214 Final only.</p></div>';
 $("finalNoteEditor").value=state.notes.l5||"";
 $("finalNoteEditor").addEventListener("input",function(){
  state.notes.l5=this.value;save();$("finalNoteStatus").textContent="Autosaved ✓";
 });
}
const draftKey=()=> "d-study-ec214-final-draft::"+user.id+"::l5::"+quizMode;
function defaultDraft(mode){return {subjectId:SUB,profileId:user.id,lecture:"l5",mode,bankVersion:"l5-v1",answers:{},confidence:{},flags:{},index:0,submitted:false,submittedAt:null,lastResult:null}}
function draft(mode){
 const raw=storeGet("d-study-ec214-final-draft::"+user.id+"::l5::"+mode);
 if(!raw)return defaultDraft(mode);
 const parsed=parse(raw);
 if(!parsed||parsed.subjectId!==SUB||parsed.profileId!==user.id||parsed.mode!==mode||parsed.lecture!=="l5"){quarantine("invalid-draft",raw);return defaultDraft(mode)}
 const restored=Object.assign(defaultDraft(mode),parsed);
 // Keep v14.2 answers and review flags; add the new confidence map without
 // changing their existing meaning or deleting submitted records.
 restored.confidence=restored.confidence&&typeof restored.confidence==="object"&&!Array.isArray(restored.confidence)?restored.confidence:{};
 restored.answers=restored.answers&&typeof restored.answers==="object"?restored.answers:{};
 restored.flags=restored.flags&&typeof restored.flags==="object"?restored.flags:{};
 return restored;
}
let currentDraft=null;
function saveDraft(){
 if(!user||!currentDraft)return;
 if(currentDraft.subjectId!==SUB||currentDraft.profileId!==user.id||currentDraft.mode!==quizMode)return;
 currentDraft.index=currentIndex;
 try{storePut(draftKey(),currentDraft)}catch(e){setStatus("Quiz draft autosave unavailable")}
}
function selectMode(mode){
 if(!qsets[mode])return;
 if(currentDraft)saveDraft();
 quizMode=mode;
 currentDraft=draft(mode);currentIndex=Math.max(0,Math.min(qsets[mode].length-1,currentDraft.index||0));
 submittedView=!!currentDraft.submitted;
 renderQuiz();
}

function confidenceWeight(value){return value==="guessed"?0.4:value==="unsure"?0.7:1}
function modeAttempts(mode){return state.quizHistory.filter(h=>h.lecture==="l5"&&h.mode===mode)}
function modeStats(mode){
 const all=modeAttempts(mode),learn=all.filter(h=>Number.isFinite(h.adjustedPercent));
 const best=learn.length?Math.max(...learn.map(h=>h.adjustedPercent)):null;
 const latest=all.length?all[all.length-1]:null;
 const perfect=learn.filter(h=>h.adjustedPercent===100&&h.score===h.total&&(h.guessed||0)===0&&(h.unsure||0)===0).length;
 return {count:all.length,best,latest,perfect};
}
function modeStatsLabel(mode){
 const st=modeStats(mode);
 return st.count===0?"Not taken yet":
  "Taken "+st.count+" time"+(st.count===1?"":"s")+
  " • Best learning: "+(st.best===null?"not tracked":st.best+"%")+
  " • Clean 100% × "+st.perfect;
}
function renderQuizSearchResults(){
 const field=$("finalQuizSearch"),root=$("finalQuizSearchResults");
 if(!field||!root)return;
 const terms=field.value.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean),bank=qsets[quizMode];
 if(!terms.length){root.innerHTML="";return}
 const hits=bank.map((q,i)=>({q,i})).filter(({q})=>terms.every(t=>
   [q.q,q.topic,q.opts.join(" "),q.why,q.ref].join(" ").toLocaleLowerCase().includes(t)));
 root.innerHTML='<div class="final-mini">'+hits.length+" question"+(hits.length===1?"":"s")+" found in "+quizMode+"</div>"+
  (hits.length?hits.map(({q,i})=>'<button type="button" class="final-search-hit" data-quiz-jump="'+i+'">'+
   '<span class="final-eyebrow">Question '+(i+1)+' · '+esc(q.topic)+'</span><b>'+esc(q.q)+'</b>'+
   '<span>'+esc(q.ref)+'</span></button>').join(""):
  '<div class="final-mini">No matching question. Try another phrase.</div>');
 root.querySelectorAll("[data-quiz-jump]").forEach(btn=>btn.onclick=()=>{
  currentIndex=Number(btn.dataset.quizJump);saveDraft();renderQuiz();
 });
}
function renderQuiz(){
 if(!state)return;
 if(!currentDraft||currentDraft.mode!==quizMode){
  currentDraft=draft(quizMode);currentIndex=Math.max(0,Math.min(qsets[quizMode].length-1,currentDraft.index||0));
 }
 const bank=qsets[quizMode],q=bank[currentIndex];
 if(!q)return;
 const submitted=!!currentDraft.submitted,confidence=currentDraft.confidence[q.id]||"confident";
 const answered=bank.filter(x=>Number.isInteger(currentDraft.answers[x.id])).length;
 const flagged=bank.filter(x=>currentDraft.flags[x.id]).length;
 const unsure=bank.filter(x=>currentDraft.confidence[x.id]==="unsure").length;
 const guessed=bank.filter(x=>currentDraft.confidence[x.id]==="guessed").length;
 const st=modeStats(quizMode),resultData=currentDraft.lastResult;
 const modeBar='<div class="final-mode-cards">'+["reviewing","mastering"].map(mode=>{
  const stats=modeStats(mode);
  return '<button type="button" class="final-mode-card '+(mode===quizMode?"active":"")+'" data-mode="'+mode+'">'+
   '<b>'+ (mode==="reviewing"?"Reviewing":"Mastering")+' · '+qsets[mode].length+' Q</b>'+
   '<span>Completed '+stats.count+' time'+(stats.count===1?"":"s")+'</span>'+
   '<span>Best learning: '+(stats.best===null?"—":stats.best+"%")+'</span>'+
   '<small>Clean 100% × '+stats.perfect+'</small></button>';
 }).join("")+'</div>';
 const nums='<div class="final-questionbar">'+bank.map((x,i)=>
  '<button type="button" title="Question '+(i+1)+'" class="final-qnum '+(i===currentIndex?"current ":"")+
  (Number.isInteger(currentDraft.answers[x.id])?"answered ":"")+
  (currentDraft.confidence[x.id]&&currentDraft.confidence[x.id]!=="confident"?"uncertain ":"")+
  (currentDraft.flags[x.id]?"flagged ":"")+'" data-q-index="'+i+'">'+(i+1)+'</button>').join("")+'</div>';
 const choices=q.opts.map((o,i)=>{
  const selected=currentDraft.answers[q.id]===i;
  return '<button type="button" class="final-choice '+(selected?"selected ":"")+
   (submitted&&i===q.ans?"correct ":"")+
   (submitted&&selected&&i!==q.ans?"wrong":"")+
   '" data-answer="'+i+'" '+(submitted?"disabled":"")+'>'+String.fromCharCode(65+i)+'. '+esc(o)+'</button>';
 }).join("");
 const weight=confidenceWeight(confidence);
 const answer=currentDraft.answers[q.id],correct=answer===q.ans;
 const explanation=submitted?'<div class="final-explain"><b>Correct answer: '+String.fromCharCode(65+q.ans)+' — '+esc(q.opts[q.ans])+'</b>'+
  '<p>Your answer: '+(Number.isInteger(answer)?esc(q.opts[answer]):"Unanswered")+' '+(correct?"✓":"✗")+
  ' · Confidence: '+(confidence==="guessed"?"Guessed":confidence==="unsure"?"Not sure":"Confident")+
  ' · Learning points: '+(correct?weight.toFixed(1):"0.0")+' / 1</p><p>'+esc(q.why)+'</p>'+
  '<span class="final-mini">Professor source: '+esc(q.ref)+'</span></div>':"";
 const grade=submitted&&resultData?'<div class="final-score-grid">'+
  '<div class="final-score-card"><small>Raw score</small><b>'+resultData.score+'/'+resultData.total+'</b></div>'+
  '<div class="final-score-card"><small>Raw accuracy</small><b>'+resultData.percent+'%</b></div>'+
  '<div class="final-score-card"><small>Learning score</small><b>'+(Number.isFinite(resultData.adjustedPercent)?resultData.adjustedPercent+"%":"Not tracked")+'</b></div>'+
  '<div class="final-score-card"><small>Uncertain</small><b>'+(resultData.guessed||0)+' guessed · '+(resultData.unsure||0)+' not sure</b></div></div>':"";
 const rubric='<div class="final-rubric"><b>Learning points</b> · Correct + Confident = <b>1.0</b> · Correct + Not sure = <b>0.7</b> · Correct + Guessed = <b>0.4</b> · Wrong = <b>0</b>. Reviewing cannot award Mastered.</div>';
 const confUI='<div class="final-confidence"><b>Confidence check</b><p class="final-mini">Leave both unselected if confident. Tap a flag again to return to Confident.</p><div class="final-actions">'+
  '<button type="button" class="final-action '+(confidence==="unsure"?"active":"")+'" data-confidence="unsure" aria-pressed="'+(confidence==="unsure")+'" '+(submitted?"disabled":"")+'>□ Not sure (70%)</button>'+
  '<button type="button" class="final-action '+(confidence==="guessed"?"active":"")+'" data-confidence="guessed" aria-pressed="'+(confidence==="guessed")+'" '+(submitted?"disabled":"")+'>□ Guessed (40%)</button>'+
  '</div></div>';
 const cannotSubmit=answered<bank.length;
 const resultBanner=submitted?'<div class="final-card"><b>Attempt submitted · '+modeStatsLabel(quizMode)+'</b><p class="final-mini">Review any question’s explanation or start another attempt. Mistake Log records wrong and uncertain answers.</p></div>':"";
 const root=$("finalQuiz");
 root.innerHTML='<div class="final-heading"><div class="final-eyebrow">EC214 FINAL • LECTURE 5</div><h2>Reviewing & Mastering Quizzes</h2>'+
  '<p>Same confidence-weighted scoring as EC214. Drafts, attempt counts and mistake history are saved separately for Final Exams.</p></div>'+
  modeBar+resultBanner+grade+rubric+
  '<div class="final-card final-quiz-search-box"><label for="finalQuizSearch"><b>🔎 Search this question bank</b></label>'+
  '<input id="finalQuizSearch" class="final-input" type="search" placeholder="Search labor, AD shifts, inflationary gap…" autocomplete="off">'+
  '<div id="finalQuizSearchResults" class="final-search-results"></div></div>'+
  '<div class="final-quiz-tools"><span class="final-mini">Answered '+answered+'/'+bank.length+
  ' · Not sure '+unsure+' · Guessed '+guessed+' · Saved flags '+flagged+'</span>'+
  '<span class="final-mini">Question '+(currentIndex+1)+' of '+bank.length+'</span></div>'+
  nums+'<div class="final-card final-q"><div class="final-eyebrow">Question '+(currentIndex+1)+' of '+bank.length+
  ' · '+(quizMode==="reviewing"?"Reviewing":"Mastering")+'</div><h3>'+esc(q.q)+'</h3>'+
  '<button type="button" class="final-action final-hint" id="finalHintBtn" aria-expanded="false">💡 Hint: show topic</button>'+
  '<div class="final-hint-body" id="finalHintBody" hidden><b>'+esc(q.topic)+'</b><p class="final-mini">'+esc(q.ref)+'</p><p class="final-mini">This identifies the professor’s topic—not the correct answer.</p></div>'+
  choices+confUI+
  '<div class="final-actions"><button class="final-action '+(currentDraft.flags[q.id]?"active":"")+
  '" id="finalFlag">'+(currentDraft.flags[q.id]?"★ Flagged for review":"☆ Flag to review")+'</button></div>'+
  explanation+
  '<div class="final-actions"><button class="final-action" id="finalPrevious" '+(currentIndex===0?"disabled":"")+'>← Previous</button>'+
  '<button class="final-primary" id="finalNext" '+(currentIndex===bank.length-1?"disabled":"")+'>Next →</button></div>'+
  '<label for="finalQNote" class="final-mini">Personal question note (autosaved)</label>'+
  '<textarea id="finalQNote" class="final-input" rows="2" placeholder="Why I chose this, what confused me, professor wording…"></textarea></div>'+
  '<div class="final-actions"><button class="final-primary" id="finalSubmit" '+(submitted||cannotSubmit?"disabled":"")+'>'+
  (submitted?"Already submitted":cannotSubmit?"Answer "+(bank.length-answered)+" more to submit":"Submit "+(quizMode==="reviewing"?"Reviewing":"Mastering"))+'</button>'+
  '<button class="final-action" id="finalResetQuiz">New attempt</button></div>';
 const note=$("finalQNote");note.value=state.quizQuestionNotes[q.id]||"";
 note.oninput=e=>{state.quizQuestionNotes[q.id]=e.target.value;save()};
 const search=$("finalQuizSearch");search.value=quizSearchQuery;
 search.oninput=()=>{quizSearchQuery=search.value;renderQuizSearchResults()};
 renderQuizSearchResults();
 root.querySelectorAll("[data-mode]").forEach(el=>el.onclick=()=>selectMode(el.dataset.mode));
 root.querySelectorAll("[data-q-index]").forEach(el=>el.onclick=()=>{currentIndex=Number(el.dataset.qIndex);saveDraft();renderQuiz()});
 root.querySelectorAll("[data-answer]").forEach(el=>el.onclick=()=>{
  if(currentDraft.submitted)return;
  currentDraft.answers[q.id]=Number(el.dataset.answer);saveDraft();renderQuiz();
 });
 root.querySelectorAll("[data-confidence]").forEach(el=>el.onclick=()=>{
  if(currentDraft.submitted)return;
  const picked=el.dataset.confidence;
  currentDraft.confidence[q.id]=currentDraft.confidence[q.id]===picked?"confident":picked;
  saveDraft();renderQuiz();
 });
 $("finalFlag").onclick=()=>{currentDraft.flags[q.id]=!currentDraft.flags[q.id];saveDraft();renderQuiz()};
 $("finalHintBtn").onclick=()=>{
  const panel=$("finalHintBody");panel.hidden=!panel.hidden;
  $("finalHintBtn").setAttribute("aria-expanded",String(!panel.hidden));
 };
 $("finalPrevious").onclick=()=>{currentIndex=Math.max(0,currentIndex-1);saveDraft();renderQuiz()};
 $("finalNext").onclick=()=>{currentIndex=Math.min(bank.length-1,currentIndex+1);saveDraft();renderQuiz()};
 $("finalSubmit").onclick=submitQuiz;
 $("finalResetQuiz").onclick=resetQuiz;
}

function submitQuiz(){
 const bank=qsets[quizMode];
 if(currentDraft.submitted)return;
 const filled=bank.filter(q=>Number.isInteger(currentDraft.answers[q.id])).length;
 if(filled<bank.length){alert("Please answer all "+bank.length+" questions before submitting ("+(bank.length-filled)+" left).");return}
 let score=0,learningPoints=0,guessed=0,unsure=0;
 const byTopic={};
 const reviewItems=[];
 for(const q of bank){
  const given=currentDraft.answers[q.id],correct=given===q.ans;
  const conf=currentDraft.confidence[q.id]||"confident",flagged=!!currentDraft.flags[q.id];
  const points=correct?confidenceWeight(conf):0;
  if(correct)score++;
  learningPoints+=points;
  if(conf==="guessed")guessed++;
  if(conf==="unsure")unsure++;
  if(!byTopic[q.topic])byTopic[q.topic]={total:0,score:0,learningPoints:0,guessed:0,unsure:0,clean:true};
  const t=byTopic[q.topic];t.total++;if(correct)t.score++;t.learningPoints+=points;
  if(conf==="guessed")t.guessed++;if(conf==="unsure")t.unsure++;
  if(!correct||conf!=="confident")t.clean=false;
  if(!correct||conf!=="confident"||flagged){
   reviewItems.push({id:q.id,q:q.q,correctIndex:q.ans,given,correct,confidence:conf,
    flagged,points,why:q.why,ref:q.ref,opts:q.opts.slice(),topic:q.topic});
  }
 }
 const topicResults=[];
 for(const [topic,t] of Object.entries(byTopic)){
  const key="l5::"+quizMode+"::"+topic;
  const prev=state.quizTopicStats[key]||{attempts:0,bestAdjusted:0,masteryPasses:0};
  const raw=Math.round(100*t.score/t.total),adj=Math.round(100*t.learningPoints/t.total);
  const clean=t.clean&&t.score===t.total;
  const masteryPasses=(prev.masteryPasses||0)+(quizMode==="mastering"&&clean?1:0);
  const status=adj<60?"Learning":adj<80||t.guessed||t.unsure?"Practiced":
   (quizMode==="mastering"&&masteryPasses>=2?"Mastered":"Strong");
  const next={attempts:(prev.attempts||0)+1,bestAdjusted:Math.max(prev.bestAdjusted||0,adj),
   latestAdjusted:adj,latestRaw:raw,guessed:t.guessed,unsure:t.unsure,masteryPasses,status};
  state.quizTopicStats[key]=next;
  topicResults.push({topic,raw,learning:adj,status,guessed:t.guessed,unsure:t.unsure});
 }
 const result={
  id:"final-l5-"+Date.now()+"-"+Math.random().toString(36).slice(2,7),
  subjectId:SUB,lecture:"l5",mode:quizMode,at:new Date().toISOString(),
  score,total:bank.length,percent:Math.round(100*score/bank.length),
  learningPoints:Number(learningPoints.toFixed(2)),
  adjustedPercent:Math.round(100*learningPoints/bank.length),
  guessed,unsure,answers:{...currentDraft.answers},
  confidence:{...currentDraft.confidence},
  wrong:reviewItems.filter(x=>!x.correct).map(x=>({
   id:x.id,q:x.q,correct:x.correctIndex,given:x.given,confidence:x.confidence,
   why:x.why,ref:x.ref,opts:x.opts,topic:x.topic
  })),
  reviewItems,topicResults,
  flags:bank.filter(x=>currentDraft.flags[x.id]).map(x=>x.id)
 };
 currentDraft.submitted=true;currentDraft.submittedAt=result.at;currentDraft.lastResult=result;
 state.quizHistory.push(result);save();saveDraft();renderQuiz();
}

function resetQuiz(){
 if(!confirm("Start a new "+quizMode+" attempt? Existing submitted history remains saved. Current draft answers will be replaced."))return;
 currentDraft=defaultDraft(quizMode);currentIndex=0;saveDraft();renderQuiz();
}
function historyReviewItems(h){
 if(Array.isArray(h.reviewItems))return h.reviewItems;
 // Older (v14.2) attempts stored only wrong-answer snapshots; don't invent
 // previous confidence selections or full answer history.
 return (Array.isArray(h.wrong)?h.wrong:[]).map(z=>({
  ...z,correctIndex:z.correct,confidence:z.confidence||"unknown",correct:false,
  flagged:false,points:0,topic:z.topic||"",legacy:true
 }));
}
function renderHistory(){
 const r=modeStats("reviewing"),m=modeStats("mastering");
 const root=$("finalHistory");
 root.innerHTML='<div class="final-heading"><div class="final-eyebrow">Practice record</div>'+
 '<h2>EC214 Final · Quiz History & Mistake Log</h2>'+
 '<p>All completed attempts are saved, including how many times you retook each mode, raw accuracy, learning points, unsure/guessed responses and professor explanations.</p></div>'+
 '<div class="final-grid final-grid-two">'+["reviewing","mastering"].map(mode=>{
  const st=mode==="reviewing"?r:m;
  return '<div class="final-card"><h3>'+ (mode==="reviewing"?"Reviewing":"Mastering")+'</h3>'+
   '<span class="final-metric">'+st.count+' time'+(st.count===1?"":"s")+'</span>'+
   '<span class="final-mini">Best learning: '+(st.best===null?"not tracked":st.best+"%")+
   ' · Clean 100% × '+st.perfect+'</span></div>';
 }).join("")+'</div>'+
 '<div class="final-card final-search-box" style="margin-top:13px"><label for="finalHistorySearch"><b>🔎 Search history and mistake log</b></label>'+
 '<div class="final-search-line"><input id="finalHistorySearch" type="search" class="final-input" placeholder="Search question, explanation or topic…">'+
 '<select id="finalHistoryMode" class="final-input final-history-filter">'+
 '<option value="all">Both modes</option><option value="reviewing">Reviewing</option><option value="mastering">Mastering</option></select></div></div>'+
 '<div id="finalHistoryList"></div>';
 const search=$("finalHistorySearch"),select=$("finalHistoryMode");
 search.value=historySearchText;select.value=historyFilterMode;
 search.oninput=()=>{historySearchText=search.value;renderHistoryList()};
 select.onchange=()=>{historyFilterMode=select.value;renderHistoryList()};
 renderHistoryList();
}
function renderHistoryList(){
 const root=$("finalHistoryList");if(!root)return;
 const term=historySearchText.trim().toLocaleLowerCase();
 const h=state.quizHistory.filter(x=>x.lecture==="l5").slice().reverse().filter(x=>
  (historyFilterMode==="all"||x.mode===historyFilterMode)&&
  (!term||[x.mode,x.at,...historyReviewItems(x).flatMap(z=>[z.q,z.topic,z.why,z.ref])]
   .join(" ").toLocaleLowerCase().includes(term)));
 root.innerHTML=h.length?h.map(x=>{
  const review=historyReviewItems(x);
  const learning=Number.isFinite(x.adjustedPercent)?x.adjustedPercent+"%":"not tracked (older attempt)";
  const confidenceTracked=Number.isFinite(x.adjustedPercent);
  const perfect=confidenceTracked&&x.adjustedPercent===100&&x.score===x.total&&(x.guessed||0)===0&&(x.unsure||0)===0;
  return '<article class="final-history-item"><div class="final-actions" style="justify-content:space-between">'+
   '<b>'+esc(x.mode.toUpperCase())+' · '+x.score+'/'+x.total+' raw ('+x.percent+'%)</b>'+
   '<span class="final-mini">'+esc(new Date(x.at).toLocaleString())+'</span></div>'+
   '<div class="final-history-stats"><span>Learning: <b>'+learning+'</b></span>'+
   '<span>Guessed: <b>'+(x.guessed??"—")+'</b></span>'+
   '<span>Not sure: <b>'+(x.unsure??"—")+'</b></span>'+
   '<span>Review items: <b>'+review.length+'</b></span>'+
   (perfect?'<span class="final-perfect">✓ Clean 100%</span>':"")+'</div>'+
   (Array.isArray(x.topicResults)&&x.topicResults.length?
    '<details class="final-history-details"><summary>Topic scores & learning status ('+x.topicResults.length+')</summary>'+
    '<div class="final-topic-results">'+x.topicResults.map(t=>
     '<div><b>'+esc(t.topic)+'</b><span>Raw '+t.raw+'% · Learning '+t.learning+'% · '+esc(t.status)+'</span></div>').join("")+'</div></details>':"")+
   '<details class="final-history-details"><summary>📝 Mistake Log · '+review.length+' wrong / unsure / guessed / flagged</summary>'+
   (review.length?review.map((z,i)=>{
    const ans=Number.isInteger(z.correctIndex)?z.correctIndex:z.correct;
    const given=Number.isInteger(z.given)&&z.opts&&z.opts[z.given]?z.opts[z.given]:"Unanswered";
    const correct=z.opts&&z.opts[ans]||"";
    const reason=z.correct?"Flagged or uncertain, even though the raw answer was correct.":
     "Incorrect or unanswered.";
    return '<div class="final-explain final-history-review"><b>'+(i+1)+'. '+esc(z.q)+'</b>'+
     '<p>'+esc(reason)+' · Confidence: '+esc(z.confidence==="unknown"?"not recorded":z.confidence||"confident")+
     (z.flagged?" · ☆ Flagged":"")+'</p><p>Your answer: '+esc(given)+'</p>'+
     '<p>Correct: '+esc(correct)+'</p><p>'+esc(z.why)+'</p>'+
     '<span class="final-mini">Professor source: '+esc(z.ref)+'</span></div>';
   }).join(""):'<p class="final-mini">No review items — clean attempt ✓</p>')+
   '</details></article>';
 }).join(""):'<div class="final-card"><h3>No matching attempts</h3><p class="final-mini">Complete Reviewing or Mastering, or clear your search filters.</p></div>';
}

function renderSettings(){
 const p=sharedPrefs();
 $("finalSettings").innerHTML='<div class="final-heading"><div class="final-eyebrow">Shared appearance · subject-isolated academics</div><h2>EC214 Final Settings</h2><p>Appearance, font and colors sync with your other D Study subjects. Study records stay separately stored under EC214 Final.</p></div>'+
 '<div class="final-card"><h3>Interface theme</h3><div class="final-actions">'+["classic","neo","midnight"].map(x=>'<button class="final-action '+(p.uiTheme===x?"active":"")+'" data-pref="uiTheme" data-value="'+x+'">'+x[0].toUpperCase()+x.slice(1)+'</button>').join("")+'</div><h3>Accent</h3><div class="final-actions">'+["navy","violet","forest","rose","amber"].map(x=>'<button class="final-action '+(p.accent===x?"active":"")+'" data-pref="accent" data-value="'+x+'">'+x+'</button>').join("")+'</div>'+
 '<h3>Appearance</h3><div class="final-actions">'+["system","light","dark"].map(x=>'<button class="final-action '+(p.appearance===x?"active":"")+'" data-pref="appearance" data-value="'+x+'">'+x+'</button>').join("")+'</div></div>'+
 '<div class="final-card" style="margin-top:14px"><h3>EC214 Final data</h3><p class="final-mini">Storage namespace: d-study-ec214-final-state::[local profile]. Export/import includes only this subject. Cross-subject backups are rejected.</p>'+
 '<div class="final-actions"><button class="final-primary" id="finalExport">Export final backup</button><button class="final-action" id="finalImportBtn">Import final backup</button><input hidden type="file" id="finalImportFile" accept=".json,application/json"></div></div>';
 $("finalSettings").querySelectorAll("[data-pref]").forEach(btn=>btn.onclick=()=>{
  const p=sharedPrefs();p[btn.dataset.pref]=btn.dataset.value;storePut("d-study-shared-preferences-v1",p);theme();renderSettings();
 });
 $("finalExport").onclick=exportData;
 $("finalImportBtn").onclick=()=>$("finalImportFile").click();
 $("finalImportFile").onchange=importData;
}
function renderPrompt(){
 $("finalPrompt").innerHTML='<div class="final-heading"><div class="final-eyebrow">Study with ChatGPT</div><h2>EC214 Final Study Prompt</h2><p>Copy this prompt when you want to practice using your approved professor material. It does not upload private files anywhere.</p></div>'+
 '<div class="final-card"><textarea class="final-input final-notes" id="finalPromptText" readonly>Help me study EC214 Final Exam Lecture 5 (Aggregate Demand & Aggregate Supply). Use my uploaded professor slides as the primary authority. Explain step-by-step in easy English, add Thai clarifications for difficult ideas, distinguish movement along AD/AS from shifts, and quiz me with original scenario questions about output gaps, multiplier, and long-run money-wage adjustments. Do not invent professor content. Include page references where possible.</textarea><button class="final-primary" id="finalCopyPrompt">Copy study prompt</button></div>';
 $("finalCopyPrompt").onclick=()=>navigator.clipboard.writeText($("finalPromptText").value).then(()=>setStatus("Prompt copied ✓")).catch(()=>setStatus("Copy not available; select the text manually"));
}
function exportData(){
 save();
 const out={app:"D Study App",subjectId:SUB,version:1,profileId:user.id,exportedAt:new Date().toISOString(),state,quizDrafts:{reviewing:draft("reviewing"),mastering:draft("mastering")}};
 const blob=new Blob([JSON.stringify(out,null,2)],{type:"application/json"}),url=URL.createObjectURL(blob),link=document.createElement("a");
 link.href=url;link.download="d-study-ec214-final-"+user.username+"-backup.json";link.click();
 setTimeout(()=>URL.revokeObjectURL(url),1500);
}
function importData(e){
 const file=e.target.files&&e.target.files[0];if(!file)return;
 const r=new FileReader();
 r.onload=()=>{
  const x=parse(r.result);
  if(!x||x.subjectId!==SUB||!x.state||x.state.subjectId!==SUB||x.profileId!==user.id||x.state.profileId!==user.id){alert("Import blocked. This file is not an EC214 Final backup for this local profile.");return}
  if(!confirm("Replace this profile’s EC214 Final records with the selected EC214 Final backup?"))return;
  state=x.state;save();
  if(x.quizDrafts)for(const mode of ["reviewing","mastering"]){
   const d=x.quizDrafts[mode];
   if(d&&d.subjectId===SUB&&d.profileId===user.id&&d.mode===mode&&d.lecture==="l5")storePut("d-study-ec214-final-draft::"+user.id+"::l5::"+mode,d);
  }
  currentDraft=null;buildOutline();renderAll();navigate("progress",false);alert("EC214 Final backup imported.");
 };
 r.readAsText(file);e.target.value="";
}
function renderAll(){renderProgress();renderBlankFlashcards();renderNotes();renderHistory();renderSettings();renderPrompt();renderQuiz()}
function clickEvents(){
 document.addEventListener("click",function(e){
  const tab=e.target.closest("a[data-f-tab]");
  if(tab){e.preventDefault();navigate(tab.dataset.fTab);return}
  const go=e.target.closest("[data-final-go]");
  if(go){navigate(go.dataset.finalGo);return}
  const section=e.target.closest("[data-summary-id]");
  if(section){navigate("summary");const target=$("final-section-"+section.dataset.summaryId);if(target)target.scrollIntoView({block:"start",behavior:"smooth"});return}
 },true);
 document.addEventListener("change",e=>{
  const id=e.target.dataset.finalStatus;if(id&&state){state.lectureStates.l5[id]=e.target.value;save();renderSummaryProgress()}
 });
 window.addEventListener("popstate",()=>{if(user&&state){const tab=location.pathname.split("/").filter(Boolean).at(-1);navigate(tab,false)}});
 window.addEventListener("focus",()=>{theme()});
 window.addEventListener("storage",e=>{if(e.key==="d-study-shared-preferences-v1")theme()});
 $("finalTokenBtn").onclick=unlock;
 $("finalTokenInput").addEventListener("keydown",e=>{if(e.key==="Enter")unlock()});
 $("finalReturnSubjects").onclick=goSubjects;
 $("finalBackAuth").onclick=goSubjects;
}
clickEvents();boot();
})();