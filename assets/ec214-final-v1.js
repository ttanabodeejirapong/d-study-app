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
let user=null,state=null,currentTab="progress",quizMode="reviewing",currentIndex=0,submittedView=false;
const qsets={reviewing:QB.reviewing,mastering:QB.mastering};
function newState(){return {subjectId:SUB,profileId:user.id,schemaVersion:1,lectureStates:{"l5":{}},notes:{"l5":""},quizDrafts:{},quizHistory:[],quizQuestionNotes:{},createdAt:new Date().toISOString()}}
const key=()=> "d-study-ec214-final-state::"+user.id;
const quarantine=(tag,raw)=>{try{localStorage.setItem("d-study-ec214-final-quarantine::"+user.id+"::"+Date.now()+"::"+tag,raw)}catch(_){}};
function loadState(){
 const raw=storeGet(key());if(!raw)return newState();
 const x=parse(raw);
 if(!x||x.subjectId!==SUB||x.profileId!==user.id){quarantine("subject-mismatch",raw);return newState()}
 const a=newState();
 for(const k of ["lectureStates","notes","quizDrafts","quizHistory","quizQuestionNotes"]){
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
 const latest=attempts.at(-1);
 $("finalProgress").innerHTML=
 '<div class="final-heading"><div class="final-eyebrow">EC214 FINAL • 2026–2</div><h2>Final Exam Study Dashboard</h2><p>Lecture 5 is ready. Later lecture slots will be populated from the professor’s files without resetting your records.</p></div>'+
 '<div class="final-grid"><article class="final-card"><span class="final-mini">Summary mastery · L5</span><span class="final-metric">'+pct+'%</span><div class="final-meter"><span style="width:'+pct+'%"></span></div></article>'+
 '<article class="final-card"><span class="final-mini">Quiz attempts</span><span class="final-metric">'+attempts.length+'</span><span class="final-mini">Reviewing + Mastering · saved separately</span></article>'+
 '<article class="final-card"><span class="final-mini">Most recent result</span><span class="final-metric">'+(latest?latest.score+'/'+latest.total:"—")+'</span><span class="final-mini">'+(latest?esc(latest.mode)+" · "+new Date(latest.at).toLocaleDateString():"No submitted attempt yet")+'</span></article></div>'+
 '<div class="final-card"><h3>📘 Lecture 5 · Aggregate Demand and Aggregate Supply</h3><p>'+BOOK.sections.length+' in-depth summary sections · '+QB.reviewing.length+' Reviewing questions · '+QB.mastering.length+' Mastering questions. Includes diagrams, the professor’s numerical examples and long-run wage adjustment.</p>'+
 '<div class="final-actions"><button class="final-primary" data-final-go="summary">Read Summary →</button><button class="final-action" data-final-go="quiz">Practice Quiz</button></div></div>'+
 '<div class="final-card" style="margin-top:14px"><h3>Coming later</h3><p>Lectures 6 onward will get their own summaries, quizzes and mastery tracking. Flashcards remain empty as requested.</p></div>';
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
function defaultDraft(mode){return {subjectId:SUB,profileId:user.id,lecture:"l5",mode,bankVersion:"l5-v1",answers:{},flags:{},index:0,submitted:false,submittedAt:null,lastResult:null}}
function draft(mode){
 const raw=storeGet("d-study-ec214-final-draft::"+user.id+"::l5::"+mode);
 if(!raw)return defaultDraft(mode);
 const parsed=parse(raw);
 if(!parsed||parsed.subjectId!==SUB||parsed.profileId!==user.id||parsed.mode!==mode||parsed.lecture!=="l5"){quarantine("invalid-draft",raw);return defaultDraft(mode)}
 return Object.assign(defaultDraft(mode),parsed);
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
function renderQuiz(){
 if(!state)return;
 if(!currentDraft||currentDraft.mode!==quizMode){currentDraft=draft(quizMode);currentIndex=currentDraft.index||0}
 const bank=qsets[quizMode],q=bank[currentIndex],submitted=currentDraft.submitted;
 const answered=Object.keys(currentDraft.answers).length,flagged=Object.values(currentDraft.flags).filter(Boolean).length;
 const qRoot=$("finalQuiz");
 const modeBar='<div class="final-actions"><button class="final-action '+(quizMode==="reviewing"?"active":"")+'" data-mode="reviewing">Reviewing · '+QB.reviewing.length+'</button><button class="final-action '+(quizMode==="mastering"?"active":"")+'" data-mode="mastering">Mastering · '+QB.mastering.length+'</button></div>';
 const nums='<div class="final-questionbar">'+bank.map((x,i)=>'<button title="Question '+(i+1)+'" class="final-qnum '+(i===currentIndex?"current ":"")+(currentDraft.answers[x.id]!=null?"answered":"")+'" data-q-index="'+i+'">'+(i+1)+'</button>').join("")+'</div>';
 let choices=q.opts.map((o,i)=>'<button class="final-choice '+(currentDraft.answers[q.id]===i?"selected ":"")+(submitted&&i===q.ans?"correct ":"")+(submitted&&currentDraft.answers[q.id]===i&&i!==q.ans?"wrong":"")+'" data-answer="'+i+'" '+(submitted?"disabled":"")+'>'+(String.fromCharCode(65+i))+'. '+esc(o)+'</button>').join("");
 const explain=submitted?'<div class="final-explain"><b>Correct answer: '+String.fromCharCode(65+q.ans)+' — '+esc(q.opts[q.ans])+'</b><p>'+esc(q.why)+'</p><span class="final-mini">Source: '+esc(q.ref)+'</span></div>':"";
 const result=submitted&&currentDraft.lastResult?'<div class="final-card"><b>Submitted result: '+currentDraft.lastResult.score+'/'+currentDraft.lastResult.total+' ('+currentDraft.lastResult.percent+'%)</b><p class="final-mini">Missed questions are recorded in Quiz History. Revisit the explanations below or start a new attempt.</p></div>':"";
 qRoot.innerHTML='<div class="final-heading"><div class="final-eyebrow">EC214 FINAL • LECTURE 5</div><h2>Reviewing & Mastering Quizzes</h2><p>Distinct banks, autosaved progress, confidence flags, results and detailed explanations. The questions are grounded in your professor’s Lecture 5 slides.</p></div>'+
 modeBar+result+
 '<div class="final-quiz-tools"><span class="final-mini">Answered '+answered+'/'+bank.length+' · Flagged '+flagged+'</span><span class="final-mini">Question '+(currentIndex+1)+' of '+bank.length+'</span></div>'+
 nums+'<div class="final-card final-q"><div class="final-eyebrow">'+esc(q.topic)+' · '+(quizMode==="reviewing"?"Reviewing":"Mastering")+'</div><h3>'+esc(q.q)+'</h3>'+choices+
 '<div class="final-actions"><button class="final-action '+(currentDraft.flags[q.id]?"active":"")+'" id="finalFlag">'+(currentDraft.flags[q.id]?"★ Flagged":"☆ Flag to review")+'</button></div>'+explain+
 '<div class="final-actions"><button class="final-action" id="finalPrevious" '+(currentIndex===0?"disabled":"")+'>← Previous</button><button class="final-primary" id="finalNext" '+(currentIndex===bank.length-1?"disabled":"")+'>Next →</button></div>'+
 '<label for="finalQNote" class="final-mini">Personal question note (autosaved)</label><textarea id="finalQNote" class="final-input" rows="2" placeholder="What confused me about this question?"></textarea></div>'+
 '<div class="final-actions"><button class="final-primary" id="finalSubmit" '+(submitted?"disabled":"")+'>Submit '+(quizMode==="reviewing"?"Reviewing":"Mastering")+' ('+answered+'/'+bank.length+' answered)</button>'+
 '<button class="final-action" id="finalResetQuiz">New attempt</button></div>';
 $("finalQNote").value=state.quizQuestionNotes[q.id]||"";
 $("finalQNote").oninput=e=>{state.quizQuestionNotes[q.id]=e.target.value;save()};
 qRoot.querySelectorAll("[data-mode]").forEach(el=>el.onclick=()=>selectMode(el.dataset.mode));
 qRoot.querySelectorAll("[data-q-index]").forEach(el=>el.onclick=()=>{currentIndex=Number(el.dataset.qIndex);saveDraft();renderQuiz()});
 qRoot.querySelectorAll("[data-answer]").forEach(el=>el.onclick=()=>{
  if(currentDraft.submitted)return;
  currentDraft.answers[q.id]=Number(el.dataset.answer);saveDraft();renderQuiz();
 });
 $("finalFlag").onclick=()=>{currentDraft.flags[q.id]=!currentDraft.flags[q.id];saveDraft();renderQuiz()};
 $("finalPrevious").onclick=()=>{currentIndex=Math.max(0,currentIndex-1);saveDraft();renderQuiz()};
 $("finalNext").onclick=()=>{currentIndex=Math.min(bank.length-1,currentIndex+1);saveDraft();renderQuiz()};
 $("finalSubmit").onclick=submitQuiz;
 $("finalResetQuiz").onclick=()=>resetQuiz();
}
function submitQuiz(){
 const bank=qsets[quizMode];
 if(currentDraft.submitted)return;
 const filled=Object.keys(currentDraft.answers).length;
 if(filled<bank.length&&!confirm("You answered "+filled+" of "+bank.length+" questions. Submit anyway? Unanswered questions count as incorrect."))return;
 const wrong=bank.filter(x=>currentDraft.answers[x.id]!==x.ans).map(x=>({id:x.id,q:x.q,correct:x.ans,given:currentDraft.answers[x.id]??null,why:x.why,ref:x.ref,opts:x.opts}));
 const result={id:"final-l5-"+Date.now()+"-"+Math.random().toString(36).slice(2,7),subjectId:SUB,lecture:"l5",mode:quizMode,at:new Date().toISOString(),score:bank.length-wrong.length,total:bank.length,percent:Math.round(100*(bank.length-wrong.length)/bank.length),wrong,flags:bank.filter(x=>currentDraft.flags[x.id]).map(x=>x.id)};
 currentDraft.submitted=true;currentDraft.submittedAt=result.at;currentDraft.lastResult=result;
 state.quizHistory.push(result);save();saveDraft();renderQuiz();
}
function resetQuiz(){
 if(!confirm("Start a new "+quizMode+" attempt? Existing submitted history remains saved. Current draft answers will be replaced."))return;
 currentDraft=defaultDraft(quizMode);currentIndex=0;saveDraft();renderQuiz();
}
function renderHistory(){
 const h=state.quizHistory.filter(x=>x.lecture==="l5").slice().reverse();
 $("finalHistory").innerHTML='<div class="final-heading"><div class="final-eyebrow">Practice record</div><h2>EC214 Final · Quiz History</h2><p>Reviewing and Mastering results are recorded independently. Mistakes and professor-based explanations are available after submission.</p></div>'+
 (h.length?h.map(x=>'<article class="final-history-item"><div class="final-actions" style="justify-content:space-between"><b>'+esc(x.mode.toUpperCase())+' — '+x.score+'/'+x.total+' ('+x.percent+'%)</b><span class="final-mini">'+esc(new Date(x.at).toLocaleString())+'</span></div>'+
 '<details><summary>Review '+x.wrong.length+' missed questions + explanations</summary>'+x.wrong.map((z,i)=>'<div class="final-explain" style="margin:9px 0"><b>'+(i+1)+'. '+esc(z.q)+'</b><p>Correct: '+esc(z.opts[z.correct])+'</p><p>'+esc(z.why)+'</p><span class="final-mini">'+esc(z.ref)+'</span></div>').join("")+'</details></article>').join(""):'<div class="final-card"><h3>No completed quizzes yet</h3><p>Take Reviewing or Mastering to build your mistake history.</p></div>');
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