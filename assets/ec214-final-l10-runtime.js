/* EC214 Final Exams — Lecture 10 course runtime.
 * Separate academic namespace and subject-scoped backups. No EC214/TU101/Chinese mutations.
 */
(function(){
"use strict";
const ACCESS_SUB="ec214final", SUB="ec214final-l10", TOKEN_SHA256="8fa76a3d4b74696c6d8ea2023997b7ffca884a0c62c16a63d86b607d1dc96a64", BASE="/d-study-app/ec214-final/l10/";
const BOOK=window.D_STUDY_FINAL_L10, QB=window.D_STUDY_FINAL_L10_QUIZZES;
if(!BOOK||!QB)return;
const $=id=>document.getElementById(id);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const storeGet=k=>{try{return localStorage.getItem(k)}catch(_){return null}};
const storePut=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
const parse=(s,fallback=null)=>{try{return JSON.parse(s)||fallback}catch(_){return fallback}};
const usersKey="d-study-users-v1",activeKey="d-study-active-user";
let mock=null,user=null,state=null,currentTab="progress",quizMode="reviewing",quizPart="p1",currentIndex=0,submittedView=false,quizSearchQuery="",historySearchText="",historyFilterMode="all",noteSearchText="";
const qsets={reviewing:QB.reviewing,mastering:QB.mastering};
// Small, fixed parts retain every existing L5 question ID and professor topic.
// R: 12 / 10 / 11 / 10; M: 11 / 11 / 10 / 10.
const PARTS=Object.fromEntries(["reviewing","mastering"].map(mode=>[mode,[
 {id:"p1",title:"Objectives & policy tools",description:"Monetary-policy goals, reserve requirements, discount rate, OMO and crisis tools",from:0,to:10},
 {id:"p2",title:"Transmission channels",description:"Interest, asset-price, exchange-rate, credit and expectations channels",from:10,to:20},
 {id:"p3",title:"Policy chains & short-run trade-off",description:"Expansionary/contractionary policy, worked transmission and inflation–unemployment trade-off",from:20,to:30}
]]));
const validPart=(mode,part)=>part==="full"||!!PARTS[mode]?.some(p=>p.id===part);
const partInfo=(mode,part)=>PARTS[mode]?.find(p=>p.id===part);
const bankFor=(mode,part)=>part==="full"?qsets[mode]:qsets[mode].slice(partInfo(mode,part)?.from||0,partInfo(mode,part)?.to||0);
const partForQuestion=(mode,id)=>PARTS[mode]?.find(p=>qsets[mode].slice(p.from,p.to).some(q=>q.id===id))?.id||"p1";
const partLabel=(mode,part)=>part==="full"?"Previous full-length quiz":("Part "+(Number(part.slice(1))||1));
const quizDraftKey=(mode,part)=>"d-study-ec214-final-draft::"+user.id+"::l10::"+mode+(part==="full"?"":"::"+part);
function newState(){return {subjectId:SUB,profileId:user.id,schemaVersion:1,lectureStates:{"l10":{}},notes:{"l10":""},quizDrafts:{},quizHistory:[],quizTopicStats:{},quizQuestionNotes:{},quizSelection:{mode:"reviewing",reviewing:"p1",mastering:"p1"},createdAt:new Date().toISOString()}}
const key=()=> "d-study-ec214-final-l10-state::"+user.id;
const quarantine=(tag,raw)=>{try{localStorage.setItem("d-study-ec214-final-l10-quarantine::"+user.id+"::"+Date.now()+"::"+tag,raw)}catch(_){}};
function loadState(){
 const raw=storeGet(key());if(!raw)return newState();
 const x=parse(raw);
 if(!x||x.subjectId!==SUB||x.profileId!==user.id){quarantine("subject-mismatch",raw);return newState()}
 const a=newState();
 for(const k of ["lectureStates","notes","quizDrafts","quizHistory","quizTopicStats","quizQuestionNotes","quizSelection"]){
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
 users[i].subjectAccess[ACCESS_SUB]={unlockedAt:new Date().toISOString(),version:"14.3"};
 storePut(usersKey,users);
 user=users[i];input.value="";
 openApp();
}
function boot(){
 theme();user=sessionUser();
 if(!user){viewAuth("Please sign in using your existing D Study App local profile first.",true);return}
 const unlocked=!!(user.subjectAccess&&user.subjectAccess[ACCESS_SUB]);
 if(!unlocked){viewAuth("This is a separate Final Exam course. Enter its one-time subject token to unlock it for this local profile.");return}
 openApp();
}
function openApp(){
 $("finalAuth").classList.add("final-hidden");$("finalShell").classList.remove("final-hidden");
 $("finalUser").textContent="👤 "+user.username;
 state=loadState();
 const choice=state.quizSelection||{};
 quizMode=qsets[choice.mode]?choice.mode:"reviewing";
 quizPart=validPart(quizMode,choice[quizMode])?choice[quizMode]:"p1";
 currentDraft=null;currentIndex=0;
 if(!state.lectureStates.l10)state.lectureStates.l10={};
 if(!("l10" in state.notes))state.notes.l10="";
 theme();save();buildOutline();renderAll();
 const path=location.pathname.replace(/\/+$/,"");
 const part=path.split("/").filter(Boolean).at(-1);
 const tab=["progress","summary","quiz","mock","flashcards","notes","history","prompt","settings"].includes(part)?part:"progress";
 navigate(tab,false);
}
function goSubjects(){
 save();try{sessionStorage.setItem("d-study-final-return-subjects","1")}catch(_){}
 location.href="/d-study-app/subjects/";
}
function navigate(tab,push=true){
 if(!["progress","summary","quiz","mock","flashcards","notes","history","prompt","settings"].includes(tab))tab="progress";
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
 if(tab==="mock"&&mock)mock.render();
 if(tab==="settings")renderSettings();
 if(tab==="prompt")renderPrompt();
 if(tab==="flashcards")renderBlankFlashcards();
 if(tab==="summary")renderSummaryProgress();
 window.scrollTo({top:0,behavior:"instant"});
 if(tab==="summary"&&location.hash&&location.hash.startsWith("#final-section-")){
  const id=decodeURIComponent(location.hash.slice("#final-section-".length));
  const target=$("final-section-"+id);
  if(target){
   const scroll=()=>{target.classList.add("final-search-target");target.scrollIntoView({block:"start",behavior:"auto"})};
   if(window.requestAnimationFrame)window.requestAnimationFrame(scroll);else scroll();
  }
 }
}
function progressPct(){
 const done=BOOK.sections.reduce((n,s)=>n+({notstarted:0,learning:25,reviewed:75,mastered:100}[state.lectureStates.l10[s.id]||"notstarted"]||0),0);
 return Math.round(done/BOOK.sections.length);
}
function quizProgressInfo(){
 const attempts=state.quizHistory.filter(h=>h.lecture==="l10"&&(h.mode==="reviewing"||h.mode==="mastering"));
 const partIds=[...new Set([...(PARTS.reviewing||[]),...(PARTS.mastering||[])].map(p=>p.id))];
 if(!partIds.length)return {pct:0,done:0,total:0};
 if(attempts.some(h=>(h.partId||"full")==="full"))return {pct:100,done:partIds.length,total:partIds.length};
 const done=new Set(attempts.map(h=>h.partId).filter(id=>partIds.includes(id)));
 return {pct:Math.round(done.size*100/partIds.length),done:done.size,total:partIds.length};
}

function progressDashboardInfo(){
 const attempts=state.quizHistory.filter(h=>h.lecture==="l10"&&(h.mode==="reviewing"||h.mode==="mastering"));
 const reviewParts=PARTS.reviewing||[],masterParts=PARTS.mastering||[];
 const partIds=[...new Set([...reviewParts,...masterParts].map(p=>p.id))];
 const rows=partIds.map((id,idx)=>{
  const review=attempts.filter(h=>h.mode==="reviewing"&&(h.partId||"full")===id);
  const mastery=attempts.filter(h=>h.mode==="mastering"&&(h.partId||"full")===id);
  const hasReview=review.length>0,hasMastery=mastery.length>0,done=hasReview||hasMastery;
  const draftActive=["reviewing","mastering"].some(mode=>{
   const raw=storeGet(quizDraftKey(mode,id)),d=raw?parse(raw):null;
   return !!(d&&!d.submitted&&d.answers&&Object.keys(d.answers).length);
  });
  const all=[...review,...mastery];
  const bestRaw=all.length?Math.max(...all.map(h=>Number.isFinite(h.percent)?h.percent:Math.round(100*(h.score||0)/(h.total||1)))):null;
  const tracked=all.filter(h=>Number.isFinite(h.adjustedPercent));
  const bestLearning=tracked.length?Math.max(...tracked.map(h=>h.adjustedPercent)):null;
  const rp=reviewParts.find(p=>p.id===id),mp=masterParts.find(p=>p.id===id);
  const title=rp&&mp&&rp.title!==mp.title?rp.title+" / "+mp.title:(rp||mp||{}).title||("Part "+(idx+1));
  let status="notstarted",label="Not started";
  if(hasReview&&hasMastery){status="both";label="Review + Mastery complete"}
  else if(hasMastery){status="mastery";label="Mastering complete"}
  else if(hasReview){status="review";label="Reviewing complete"}
  else if(draftActive){status="learning";label="Currently learning"}
  return {id,index:idx+1,title,hasReview,hasMastery,done,draftActive,bestRaw,bestLearning,status,label,
   reviewCount:review.length,masteryCount:mastery.length};
 });
 if(attempts.some(h=>(h.partId||"full")==="full"))rows.forEach(r=>{r.done=true;if(r.status==="notstarted"){r.status="review";r.label="Completed in previous full quiz"}});
 const done=rows.filter(r=>r.done).length,total=rows.length,pct=total?Math.round(done*100/total):0;
 const latest=attempts.at(-1)||null;
 const dist={
  notstarted:rows.filter(r=>r.status==="notstarted").length,
  learning:rows.filter(r=>r.status==="learning").length,
  review:rows.filter(r=>r.status==="review").length,
  mastery:rows.filter(r=>r.status==="mastery").length,
  both:rows.filter(r=>r.status==="both").length
 };
 return {rows,done,total,pct,latest,dist};
}
function progressDashboardMarkup(d){
 const latest=d.latest,latestPart=latest?(latest.partId==="full"?"Previous full quiz":partLabel(latest.mode,latest.partId)):"—";
 const latestTitle=latest&&latest.partId!=="full"?(partInfo(latest.mode,latest.partId)?.title||""):"";
 const latestLearning=latest&&Number.isFinite(latest.adjustedPercent)?latest.adjustedPercent+"%":"—";
 const latestGuessed=latest?Number(latest.guessed||0):0,latestUnsure=latest?Number(latest.unsure||0):0;
 const completed=d.done,inProgress=d.dist.learning,notStarted=d.dist.notstarted;
 const rows=d.rows.map(r=>{
  const score=r.bestRaw===null?"—":r.bestRaw+"%";
  const learn=r.bestLearning===null?"—":r.bestLearning+"%";
  return '<div class="final-progress-part-row"><div class="final-progress-part-copy"><b>Part '+r.index+' · '+esc(r.title)+'</b>'+
   '<span class="final-mini">Best raw '+score+' · Best learning '+learn+' · Review '+r.reviewCount+'× · Master '+r.masteryCount+'×</span></div>'+
   '<span class="final-progress-status '+r.status+'">'+esc(r.label)+'</span></div>';
 }).join("");
 const bar=(label,count,cls)=>{
  const width=d.total?Math.round(count*100/d.total):0;
  return '<div class="final-progress-dist-row"><span>'+label+'</span><div class="final-progress-dist-track"><i class="'+cls+'" style="width:'+width+'%"></i></div><b>'+count+'</b></div>';
 };
 return '<div class="final-progress-old-hero">'+
  '<article class="final-card final-progress-welcome"><span class="final-eyebrow">EC214 STUDY DASHBOARD</span><h2>Welcome back, '+esc(user.username||"student")+'.</h2>'+
   '<p>Use Summary for recall, Reviewing for a first pass, or Mastering when you want harder exam-style practice. Completing either quiz mode counts that part toward overall lecture progress.</p>'+
   '<div class="final-actions"><button class="final-primary" data-final-go="summary">Continue Summary</button><button class="final-action" data-final-go="quiz">Open Quiz</button><button class="final-action" data-final-go="notes">Open All Notes</button></div></article>'+
  '<article class="final-card final-progress-ring-card"><span class="final-mini">Overall learning progress</span><div class="final-progress-ring" style="--progress:'+d.pct+'"><div><strong>'+d.pct+'%</strong><small>quiz parts</small></div></div></article>'+
  '<article class="final-card final-progress-snapshot"><h3>Current snapshot</h3><dl>'+
   '<div><dt>Latest quiz</dt><dd>'+(latest?esc(latestPart+(latestTitle?" · "+latestTitle:"")+" · "+(latest.mode==="mastering"?"Mastering":"Reviewing")):"Not started")+'</dd></div>'+
   '<div><dt>Latest learning score</dt><dd>'+latestLearning+'</dd></div>'+
   '<div><dt>Confidence flags</dt><dd>'+latestGuessed+' guessed · '+latestUnsure+' unsure</dd></div></dl></article></div>'+
  '<div class="final-progress-stat-grid">'+
   '<article class="final-card"><strong>'+d.pct+'%</strong><span>Overall progress</span></article>'+
   '<article class="final-card"><strong>'+completed+'</strong><span>Completed parts</span></article>'+
   '<article class="final-card"><strong>'+inProgress+'</strong><span>Currently learning</span></article>'+
   '<article class="final-card"><strong>'+notStarted+'</strong><span>Not started</span></article></div>'+
  '<article class="final-card final-progress-distribution"><h3>Status distribution</h3><p class="final-mini">A part is complete when either Reviewing or Mastering has been submitted. Both modes never double-count.</p>'+
   bar("Not started",d.dist.notstarted,"notstarted")+bar("Learning",d.dist.learning,"learning")+bar("Reviewed & practiced",d.dist.review,"review")+bar("Mastering only",d.dist.mastery,"mastery")+bar("Review + Mastery",d.dist.both,"both")+'</article>'+
  '<article class="final-card final-progress-part-list"><div class="final-progress-part-head"><div><h3>Lecture '+"10"+' quiz parts</h3><p class="final-mini">'+d.done+' of '+d.total+' parts complete · either mode counts</p></div><span class="final-progress-pill">'+d.pct+'%</span></div>'+rows+'</article>';
}
function renderProgress(){
 const d=progressDashboardInfo();
 $("finalProgress").innerHTML=progressDashboardMarkup(d)+
 '<div class="final-card"><h3>📘 Lecture 10 · Monetary Policy</h3><p>'+
 BOOK.sections.length+' in-depth summary sections · '+QB.reviewing.length+' Reviewing questions · '+
 QB.mastering.length+' Mastering questions. Includes central-bank tool maps, crisis-measure tables, five transmission-channel diagrams, exchange-rate/credit mechanisms, policy chains and the short-run trade-off.</p>'+
 '<div class="final-actions"><button class="final-primary" data-final-go="summary">Search / Read Summary →</button>'+
 '<button class="final-action" data-final-go="quiz">Practice Quiz</button>'+
 '<button class="final-action" data-final-go="history">View Attempt History</button></div></div>'+
 '<div class="final-card" style="margin-top:14px"><h3>Study references</h3><p>The uploaded professor Lecture 10 Monetary Policy PDF controls the content. Earlier lecture quizzes and the existing Final Mock are style/difficulty references only; the Lecture 10 PDF controls the content and the Final Mock is not modified.</p><div class="final-actions"><a class="final-action" href="/d-study-app/ec214-final/l9/">← Lecture 9</a><a class="final-action" href="/d-study-app/ec214-final/mock/">Existing Final Mock reference</a></div></div>';
}

function buildOutline(){
 const toc=$("finalTopics");
 toc.innerHTML=BOOK.sections.map(s=>'<button type="button" class="final-topic" data-summary-id="'+esc(s.id)+'">'+esc(s.title)+'</button>').join("");
 const holder=$("finalSections");
 holder.innerHTML=BOOK.sections.map(s=>'<article class="final-card final-section" id="final-section-'+esc(s.id)+'">'+
  '<div class="final-eyebrow">'+esc(s.priority)+'</div><h3>'+esc(s.title)+'</h3>'+
  '<span class="final-ref">Source: Professor Lecture 10 • '+esc(s.pages)+'</span>'+
  (s.fig?window.D_STUDY_FINAL_L10_RENDER_FIG(s.fig):"")+
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
  if(!terms.length){results.innerHTML="";meta.textContent="Searches all "+BOOK.sections.length+" Lecture 10 sections";return}
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
  if(el)el.value=state.lectureStates.l10[section.id]||"notstarted";
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
function allNoteItems(){
 const items=[];
 const lecture=String(state.notes.l10||"");
 if(lecture.trim())items.push({id:"lecture-l10",kind:"lecture",title:"Lecture 10 · General notes",text:lecture});
 for(const mode of ["reviewing","mastering"]){
  for(const [index,q] of qsets[mode].entries()){
   const text=String(state.quizQuestionNotes[q.id]||"");
   if(text.trim())items.push({id:q.id,kind:"question",mode,index,
    title:mode+" · Q"+(index+1)+": "+q.q,text});
  }
 }
 return items;
}
function notesPackText(){
 let s="D Study App • EC214 Final Exams • Lecture 10\nGenerated "+new Date().toLocaleString()+
  "\nSource: my saved local notes and quiz uncertainty (not the professor slide text)\n\n";
 const items=allNoteItems();
 s+=items.length?items.map(x=>x.title+"\n"+x.text+"\n").join("\n"):"No saved notes yet.\n";
 const flagged=state.quizHistory.filter(h=>h.lecture==="l10").flatMap(h=>
  historyReviewItems(h).map(x=>({mode:h.mode,date:h.at,item:x})));
 if(flagged.length){
  s+="\n=== Mistakes / Guessed / Not sure / Flagged ===\n";
  s+=flagged.map(({mode,date,item})=>
   "["+mode+" · "+date+"] "+item.q+"\n"+item.why+
   "\nConfidence: "+(item.confidence||"not tracked")+"\nSource: "+item.ref+"\n").join("\n");
 }
 return s;
}
function renderNoteSearchResults(){
 const root=$("finalNoteSearchResults"),input=$("finalNoteSearch");
 if(!root||!input)return;
 const query=input.value.trim(),terms=query.toLocaleLowerCase().split(/\s+/).filter(Boolean);
 const items=allNoteItems(),hits=items.filter(x=>terms.every(t=>
  (x.title+" "+x.text).toLocaleLowerCase().includes(t)));
 root.innerHTML='<div class="final-mini">'+hits.length+' matching saved note'+(hits.length===1?"":"s")+'</div>'+
  (hits.length?hits.map(x=>'<button type="button" class="final-search-hit" data-note-jump="'+esc(x.id)+'">'+
   '<span class="final-eyebrow">'+(x.kind==="lecture"?"Lecture notebook":esc(x.mode+" · Question "+(x.index+1)))+'</span>'+
   '<b>'+esc(x.title)+'</b><span>'+esc(x.text.slice(0,195))+'</span></button>').join(""):
   '<p class="final-mini">No saved notes matched. Quiz notes and notebook text appear here after you write them.</p>');
 root.querySelectorAll("[data-note-jump]").forEach(btn=>btn.onclick=()=>{
  const found=items.find(x=>x.id===btn.dataset.noteJump);
  if(!found)return;
  if(found.kind==="lecture"){
   $("finalNoteEditor").focus();$("finalNoteEditor").scrollIntoView({block:"center"});
  }else{
   selectMode(found.mode);
   const jumpPart=partForQuestion(found.mode,found.id);
   selectPart(jumpPart);
   currentIndex=bankFor(found.mode,jumpPart).findIndex(q=>q.id===found.id);
   saveDraft();navigate("quiz");renderQuiz();
  }
 });
}
function renderNotes(){
 const root=$("finalNotes");
 root.innerHTML='<div class="final-heading"><div class="final-eyebrow">Private subject notebook</div>'+
 '<h2>EC214 Final · Notes Hub</h2><p>Search general notes and notes attached to questions in Reviewing and Mastering. All saved only under your EC214 Final profile.</p></div>'+
 '<div class="final-card"><label for="finalNoteEditor"><b>Lecture 10 · Monetary Policy</b></label>'+
 '<textarea class="final-input final-notes" id="finalNoteEditor" placeholder="Professor’s extra remarks, formulas, questions to review…"></textarea>'+
 '<p class="final-mini" id="finalNoteStatus">Autosaved locally, in EC214 Final only.</p></div>'+
 '<div class="final-card final-search-box"><label for="finalNoteSearch"><b>🔎 Search all saved Final Exam notes</b></label>'+
 '<input id="finalNoteSearch" class="final-input" type="search" placeholder="Search notes, questions, confusion, formulas…" autocomplete="off">'+
 '<div id="finalNoteSearchResults" class="final-search-results"></div></div>'+
 '<div class="final-card"><h3>🤖 AI Notes Pack</h3>'+
 '<p class="final-mini">Copy only your saved notebook, question notes and uncertain/mistaken answers—never the whole professor PDF or full summary.</p>'+
 '<textarea id="finalNotesPack" class="final-input" rows="8" readonly aria-label="AI Notes Pack"></textarea>'+
 '<div class="final-actions"><button class="final-primary" id="finalCopyNotesPack">Copy for ChatGPT</button>'+
 '<button class="final-action" id="finalRefreshNotesPack">Refresh</button></div>'+
 '<div id="finalNotePackStatus" class="final-mini" aria-live="polite"></div></div>';
 const editor=$("finalNoteEditor");editor.value=state.notes.l10||"";
 editor.addEventListener("input",function(){
  state.notes.l10=this.value;save();$("finalNoteStatus").textContent="Autosaved ✓";
  renderNoteSearchResults();$("finalNotesPack").value=notesPackText();
 });
 const search=$("finalNoteSearch");search.value=noteSearchText;
 search.oninput=()=>{noteSearchText=search.value;renderNoteSearchResults()};
 $("finalNotesPack").value=notesPackText();
 $("finalRefreshNotesPack").onclick=()=>{$("finalNotesPack").value=notesPackText();$("finalNotePackStatus").textContent="Pack refreshed ✓"};
 $("finalCopyNotesPack").onclick=()=>{
  const text=notesPackText();
  if(!navigator.clipboard||!navigator.clipboard.writeText){$("finalNotePackStatus").textContent="Select the text and copy manually.";return}
  navigator.clipboard.writeText(text).then(()=>{$("finalNotePackStatus").textContent="Copied ✓"},()=>{$("finalNotePackStatus").textContent="Could not copy; select the text manually."});
 };
 renderNoteSearchResults();
}

const draftKey=()=>quizDraftKey(quizMode,quizPart);
function shuffledOptionOrder(){
 const a=[0,1,2,3];
 for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}
 return a;
}
function defaultDraft(mode,part=quizPart){
 const optionOrders={};
 bankFor(mode,part).forEach(q=>optionOrders[q.id]=shuffledOptionOrder());
 return {subjectId:SUB,profileId:user.id,lecture:"l10",mode,partId:part,bankVersion:"l10-v1",
  answers:{},confidence:{},flags:{},optionOrders,index:0,submitted:false,submittedAt:null,lastResult:null};
}
function draft(mode,part=quizPart){
 if(!validPart(mode,part))return defaultDraft(mode,"p1");
 const raw=storeGet(quizDraftKey(mode,part));
 if(!raw)return defaultDraft(mode,part);
 const parsed=parse(raw);
 if(!parsed||parsed.subjectId!==SUB||parsed.profileId!==user.id||parsed.mode!==mode||parsed.lecture!=="l10"||
   (parsed.partId||"full")!==part){
  quarantine("invalid-draft-"+mode+"-"+part,raw);return defaultDraft(mode,part);
 }
 const restored=Object.assign(defaultDraft(mode,part),parsed);
 restored.partId=part;
 restored.confidence=restored.confidence&&typeof restored.confidence==="object"&&!Array.isArray(restored.confidence)?restored.confidence:{};
 restored.answers=restored.answers&&typeof restored.answers==="object"&&!Array.isArray(restored.answers)?restored.answers:{};
 restored.flags=restored.flags&&typeof restored.flags==="object"&&!Array.isArray(restored.flags)?restored.flags:{};
 if(!parsed.optionOrders){
  restored.optionOrders={};
  bankFor(mode,part).forEach(q=>restored.optionOrders[q.id]=[0,1,2,3]);
 }
 return restored;
}
let currentDraft=null;
function saveDraft(){
 if(!user||!currentDraft)return;
 if(currentDraft.subjectId!==SUB||currentDraft.profileId!==user.id||
  currentDraft.mode!==quizMode||(currentDraft.partId||"full")!==quizPart)return;
 currentDraft.index=currentIndex;
 try{storePut(draftKey(),currentDraft)}catch(e){setStatus("Quiz draft autosave unavailable")}
}
function rememberPart(){
 state.quizSelection=state.quizSelection||{mode:"reviewing",reviewing:"p1",mastering:"p1"};
 state.quizSelection.mode=quizMode;
 state.quizSelection[quizMode]=quizPart;
 save();
}
function selectMode(mode){
 if(!qsets[mode])return;
 if(currentDraft)saveDraft();
 quizMode=mode;
 const saved=state.quizSelection?.[mode]||"p1";
 quizPart=validPart(mode,saved)?saved:"p1";
 rememberPart();
 currentDraft=draft(mode,quizPart);
 currentIndex=Math.max(0,Math.min(bankFor(mode,quizPart).length-1,currentDraft.index||0));
 submittedView=!!currentDraft.submitted;
 renderQuiz();
}
function selectPart(part){
 if(!validPart(quizMode,part))return;
 if(currentDraft)saveDraft();
 quizPart=part;
 rememberPart();
 currentDraft=draft(quizMode,part);
 currentIndex=Math.max(0,Math.min(bankFor(quizMode,part).length-1,currentDraft.index||0));
 submittedView=!!currentDraft.submitted;
 renderQuiz();
}
function partAttempts(mode,part){return modeAttempts(mode).filter(h=>(h.partId||"full")===part)}
function partStats(mode,part){
 const attempts=partAttempts(mode,part),tracked=attempts.filter(h=>Number.isFinite(h.adjustedPercent));
 return {count:attempts.length,best:tracked.length?Math.max(...tracked.map(h=>h.adjustedPercent)):null,
  perfect:tracked.filter(h=>h.adjustedPercent===100&&h.score===h.total&&(h.guessed||0)===0&&(h.unsure||0)===0).length};
}
function hasLegacyDraft(mode){
 const d=parse(storeGet(quizDraftKey(mode,"full")));
 return !!(d&&d.subjectId===SUB&&d.profileId===user.id&&d.mode===mode&&
  (d.submitted||Object.keys(d.answers||{}).length));
}

function confidenceWeight(value){return value==="guessed"?0.4:value==="unsure"?0.7:1}
function modeAttempts(mode){return state.quizHistory.filter(h=>h.lecture==="l10"&&h.mode===mode)}
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
 const terms=field.value.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
 if(!terms.length){root.innerHTML="";return}
 // Search all questions in the current mode, even across the other short parts.
 const hits=qsets[quizMode].map(q=>({q,part:partForQuestion(quizMode,q.id)})).filter(({q})=>
  terms.every(t=>[q.q,q.topic,q.opts.join(" "),q.why,q.ref].join(" ").toLocaleLowerCase().includes(t)));
 root.innerHTML='<div class="final-mini">'+hits.length+" matching question"+(hits.length===1?"":"s")+
  " across all three "+quizMode+" parts</div>"+
  (hits.length?hits.map(({q,part})=>{
   const number=bankFor(quizMode,part).findIndex(x=>x.id===q.id)+1;
   return '<button type="button" class="final-search-hit" data-quiz-id="'+esc(q.id)+'">'+
    '<span class="final-eyebrow">'+partLabel(quizMode,part)+' · Q'+number+' · '+esc(q.topic)+'</span>'+
    '<b>'+esc(q.q)+'</b><span>'+esc(q.ref)+'</span></button>';
  }).join(""):'<div class="final-mini">No match. Try another topic, explanation or phrase.</div>');
 root.querySelectorAll("[data-quiz-id]").forEach(btn=>btn.onclick=()=>{
  const found=qsets[quizMode].find(q=>q.id===btn.dataset.quizId);if(!found)return;
  const targetPart=partForQuestion(quizMode,found.id);
  if(targetPart!==quizPart)selectPart(targetPart);
  currentIndex=bankFor(quizMode,quizPart).findIndex(q=>q.id===found.id);
  saveDraft();renderQuiz();
 });
}


function quizResultReview(bank){
 const d=currentDraft, r=d&&d.lastResult;
 if(!d||!d.submitted||!r)return "";
 const wrong=bank.filter(q=>d.answers[q.id]!==q.ans);
 const cards=bank.map((q,i)=>({q,i,given:d.answers[q.id],confidence:d.confidence[q.id]||"confident",flagged:!!d.flags[q.id]}))
  .filter(x=>x.given!==x.q.ans||x.confidence!=="confident"||x.flagged);
 const getAnswer=(x,idx)=>{
  if(!Number.isInteger(idx)||!x.q.opts[idx])return "Unanswered";
  const order=d.optionOrders&&d.optionOrders[x.q.id]||[0,1,2,3];
  const pos=order.indexOf(idx);
  return (pos<0?"":String.fromCharCode(65+pos)+". ")+x.q.opts[idx];
 };
 const all=bank.map((q,i)=>'<button type="button" data-result-index="'+i+'" class="final-result-answer '+(d.answers[q.id]===q.ans?"is-correct":"is-wrong")+'">Q'+(i+1)+' '+(d.answers[q.id]===q.ans?"✓":"✗")+'</button>').join("");
 const details=cards.map(x=>
  '<article class="final-result-review-item"><div class="final-result-review-head"><b>Question '+(x.i+1)+' · '+(x.given!==x.q.ans?"Wrong":x.confidence==="guessed"?"Guessed":x.confidence==="unsure"?"Not sure":"Flagged")+'</b><button type="button" class="final-action" data-result-index="'+x.i+'">Open question</button></div>'+
  '<p>'+esc(x.q.q)+'</p><p><b>Your answer:</b> '+esc(getAnswer(x,x.given))+'</p>'+
  '<p><b>Correct answer:</b> '+esc(getAnswer(x,x.q.ans))+'</p>'+
  '<p>'+esc(x.q.why)+'</p><small>'+esc(x.q.ref)+'</small></article>').join("");
 return '<section id="finalQuizResultSummary" class="final-card final-quiz-result-summary" role="region" aria-label="Quiz results" tabindex="-1">'+
 '<h3>Quiz results · '+partLabel(quizMode,quizPart)+'</h3>'+ 
 '<div class="final-quiz-retake-actions"><button type="button" class="final-primary" data-final-retake="1">↻ Retake '+partLabel(quizMode,quizPart)+' now</button>'+ 
 '<span class="final-mini">Start a new attempt whenever you like. Previous completed marks, mistake reviews and personal notes stay saved.</span></div>'+
 '<p>Final marks: <b>'+r.score+' / '+r.total+'</b> · Wrong: <b>'+wrong.length+'</b> · Learning score: <b>'+(Number.isFinite(r.adjustedPercent)?r.adjustedPercent+"%":"Not tracked")+'</b></p>'+
 '<p class="final-mini">✓ Correct · ✗ Incorrect. Select a question to see the answer in context.</p>'+
 '<div class="final-result-answer-grid">'+all+'</div>'+
 '<h4>Questions to review ('+cards.length+')</h4>'+
 (details||'<p class="final-mini">No incorrect or uncertain answers to review.</p>')+'</section>';
}

function renderQuiz(){
 if(!state)return;
 if(!currentDraft||currentDraft.mode!==quizMode||(currentDraft.partId||"full")!==quizPart){
  currentDraft=draft(quizMode,quizPart);currentIndex=Math.max(0,Math.min(bankFor(quizMode,quizPart).length-1,currentDraft.index||0));
 }
 const bank=bankFor(quizMode,quizPart),q=bank[currentIndex];
 if(!q)return;
 // Lecture 10 quiz visuals are deliberately restricted to interpretation tasks so they do not reveal answers.
 const renderVisual=window.D_STUDY_FINAL_L10_RENDER_VISUAL;
 let questionVisual="";
 try{questionVisual=typeof renderVisual==="function"?renderVisual(q.id):""}catch(e){console.error("Lecture 10 quiz visual failed",q.id,e)}

 const submitted=!!currentDraft.submitted,confidence=currentDraft.confidence[q.id]||"confident";
 const answered=bank.filter(x=>Number.isInteger(currentDraft.answers[x.id])).length;
 const flagged=bank.filter(x=>currentDraft.flags[x.id]).length;
 const unsure=bank.filter(x=>currentDraft.confidence[x.id]==="unsure").length;
 const guessed=bank.filter(x=>currentDraft.confidence[x.id]==="guessed").length;
 const st=partStats(quizMode,quizPart),resultData=currentDraft.lastResult;
 const summarySection=BOOK.sections.find(section=>section.id===q.topic)||BOOK.sections[0];
 const modeBar='<div class="final-mode-cards">'+["reviewing","mastering"].map(mode=>{
  const stats=modeStats(mode);
  return '<button type="button" class="final-mode-card '+(mode===quizMode?"active":"")+'" data-mode="'+mode+'">'+
   '<b>'+ (mode==="reviewing"?"Reviewing":"Mastering")+' · '+qsets[mode].length+' Q</b>'+
   '<span>Completed '+stats.count+' time'+(stats.count===1?"":"s")+'</span>'+
   '<span>Best learning: '+(stats.best===null?"—":stats.best+"%")+'</span>'+
   '<small>Clean 100% × '+stats.perfect+'</small></button>';
 }).join("")+'</div>';
 const activePart=partInfo(quizMode,quizPart);
 const focusMode=answered>0||submitted;
 const partBar='<details class="final-parts-menu" '+(focusMode?"":"open")+'> '+
  '<summary><b>'+partLabel(quizMode,quizPart)+' · '+esc(activePart?activePart.title:"Old full-length quiz")+
  ' ('+bank.length+' questions)</b><span>Change part ▾</span></summary>'+
  '<div class="final-part-heading"><h3>Choose a short part</h3>'+
  '<p class="final-mini">One part at a time — about 10 questions. Each part remembers your answers and how many times you finished it.</p></div>'+
  '<div class="final-part-grid">'+PARTS[quizMode].map(p=>{
   const pb=bankFor(quizMode,p.id),stats=partStats(quizMode,p.id),saved=draft(quizMode,p.id);
   const completed=pb.filter(q=>Number.isInteger(saved.answers[q.id])).length;
   const text=stats.count?'Done '+stats.count+'× · Best '+(stats.best===null?"—":stats.best+"%"):
      completed?('Continue '+completed+'/'+pb.length):'Not started';
   return '<button type="button" class="final-part-card '+(p.id===quizPart?"active":"")+
    '" data-final-part="'+p.id+'" aria-pressed="'+(p.id===quizPart)+'">'+
    '<span class="final-part-name">'+partLabel(quizMode,p.id)+' <span>'+pb.length+' Q</span></span>'+
    '<b>'+esc(p.title)+'</b><span class="final-part-desc">'+esc(p.description)+'</span>'+
    '<span class="final-part-progress">'+esc(text)+(stats.perfect?' · 100% × '+stats.perfect:'')+'</span>'+
    '<span class="final-part-meter"><i style="width:'+(100*completed/pb.length)+'%"></i></span></button>';
  }).join("")+'</div>'+
  (hasLegacyDraft(quizMode)?'<details class="final-legacy-quiz"><summary>Previous full-length quiz draft (optional)</summary>'+
   '<p class="final-mini">A draft from the old 43/42-question version is still saved. You can finish or review it here, or use the three short parts above.</p>'+
   '<button type="button" class="final-action '+(quizPart==="full"?"active":"")+
   '" data-final-part="full">Open my previous full quiz</button></details>':"")+'</details>';
 const nums='<div class="final-questionbar" role="group" aria-label="Questions in '+partLabel(quizMode,quizPart)+'">'+bank.map((x,i)=>
  '<button type="button" class="final-qnum '+(i===currentIndex?"current ":"")+
  (Number.isInteger(currentDraft.answers[x.id])?"answered ":"")+
  (currentDraft.confidence[x.id]&&currentDraft.confidence[x.id]!=="confident"?"uncertain ":"")+
  (currentDraft.flags[x.id]?"flagged ":"")+
  (String(state.quizQuestionNotes?.[x.id]||"").trim()?"noted ":"")+
  '" data-q-index="'+i+'" title="Question '+(i+1)+(String(state.quizQuestionNotes?.[x.id]||"").trim()?" · Has saved note":"")+'">'+(i+1)+'</button>').join("")+
  '</div><div class="final-question-note-legend"><i class="final-saved-note-dot" aria-hidden="true"></i> Colored dot = saved question note</div>';
 const order=currentDraft.optionOrders?.[q.id]||[0,1,2,3];
 const choices=order.map((original,shown)=>{
  const selected=currentDraft.answers[q.id]===original;
  return '<button type="button" class="final-choice '+(selected?"selected ":"")+
   (submitted&&original===q.ans?"correct ":"")+
   (submitted&&selected&&original!==q.ans?"wrong":"")+
   '" data-answer="'+original+'" '+(submitted?"disabled":"")+'>'+
   String.fromCharCode(65+shown)+'. '+esc(q.opts[original])+'</button>';
 }).join("");
 const weight=confidenceWeight(confidence);
 const answer=currentDraft.answers[q.id],correct=answer===q.ans;
 const legacySubmitted=submitted&&resultData&&!Number.isFinite(resultData.adjustedPercent);
 const explanation=submitted?'<div class="final-explain"><b>Correct answer: '+String.fromCharCode(65+Math.max(0,order.indexOf(q.ans)))+' — '+esc(q.opts[q.ans])+'</b>'+
  '<p>Your answer: '+(Number.isInteger(answer)?esc(q.opts[answer]):"Unanswered")+' '+(correct?"✓":"✗")+
  ' · Confidence: '+(legacySubmitted?"not tracked in older attempt":confidence==="guessed"?"Guessed":confidence==="unsure"?"Not sure":"Confident")+
  ' · Learning points: '+(correct?weight.toFixed(1):"0.0")+' / 1</p><p>'+esc(q.why)+'</p>'+
  '<span class="final-mini">Professor source: '+esc(q.ref)+'</span></div>':"";
 const grade=submitted&&resultData?'<div class="final-score-grid">'+
  '<div class="final-score-card"><small>Raw score</small><b>'+resultData.score+'/'+resultData.total+'</b></div>'+
  '<div class="final-score-card"><small>Raw accuracy</small><b>'+resultData.percent+'%</b></div>'+
  '<div class="final-score-card"><small>Learning score</small><b>'+(Number.isFinite(resultData.adjustedPercent)?resultData.adjustedPercent+"%":"Not tracked")+'</b></div>'+
  '<div class="final-score-card"><small>Uncertain</small><b>'+(resultData.guessed||0)+' guessed · '+(resultData.unsure||0)+' not sure</b></div></div>':"";
 const reviewSummary=quizResultReview(bank);
 const rubric='<div class="final-rubric"><b>Learning points</b> · Correct + Confident = <b>1.0</b> · Correct + Not sure = <b>0.7</b> · Correct + Guessed = <b>0.4</b> · Wrong = <b>0</b>. Reviewing cannot award Mastered.</div>';
 const confUI='<div class="final-confidence"><b>Confidence check</b><p class="final-mini">Leave both unselected if confident. Tap a flag again to return to Confident.</p><div class="final-actions">'+
  '<button type="button" class="final-action '+(confidence==="unsure"?"active":"")+'" data-confidence="unsure" aria-pressed="'+(confidence==="unsure")+'" '+(submitted?"disabled":"")+'>□ Not sure (70%)</button>'+
  '<button type="button" class="final-action '+(confidence==="guessed"?"active":"")+'" data-confidence="guessed" aria-pressed="'+(confidence==="guessed")+'" '+(submitted?"disabled":"")+'>□ Guessed (40%)</button>'+
  '</div></div>';
 const cannotSubmit=answered<bank.length;
 const resultBanner=submitted?'<div class="final-card"><b>'+partLabel(quizMode,quizPart)+' complete · '+st.count+' time'+(st.count===1?"":"s")+' · Best '+(st.best===null?"—":st.best+"%")+'</b><p class="final-mini">Review any question’s explanation or start another attempt. Mistake Log records wrong and uncertain answers.</p>'+
  (resultData&&Array.isArray(resultData.topicResults)?'<details class="final-history-details"><summary>Topic results & learning mastery</summary>'+
   '<div class="final-topic-results">'+resultData.topicResults.map(t=>'<div><b>'+esc(t.topic)+'</b><span>Raw '+t.raw+'% · Learning '+t.learning+'% · '+esc(t.status)+'</span></div>').join("")+'</div></details>':"")+
  '</div>':"";
 const root=$("finalQuiz");
 root.innerHTML='<div class="final-heading"><div class="final-eyebrow">EC214 FINAL • LECTURE 10</div><h2>Reviewing & Mastering Quizzes</h2>'+
  '<p>Three manageable parts per mode (10 questions each). Hints and direct links to the matching Lecture Summary topic are available for every question. Progress is autosaved.</p></div>'+
  modeBar+partBar+reviewSummary+resultBanner+
  '<details class="final-study-tools"><summary>🔎 Search questions & learning-points guide (optional)</summary>'+rubric+
  '<div class="final-card final-quiz-search-box"><label for="finalQuizSearch"><b>Search all three '+quizMode+' parts</b></label>'+
  '<input id="finalQuizSearch" class="final-input" type="search" placeholder="Search reserve ratio, OMO, QE, exchange rate, transmission…" autocomplete="off">'+
  '<div id="finalQuizSearchResults" class="final-search-results"></div></div></details>'+
  '<div class="final-quiz-tools"><span class="final-mini"><b>'+partLabel(quizMode,quizPart)+'</b> · Answered '+answered+'/'+bank.length+
  ' · Not sure '+unsure+' · Guessed '+guessed+' · Saved flags '+flagged+'</span>'+
  '<span class="final-mini">Question '+(currentIndex+1)+' of '+bank.length+'</span></div>'+
  nums+'<div class="final-card final-q" id="finalQuizQuestion" tabindex="-1"><div class="final-eyebrow">Question '+(currentIndex+1)+' of '+bank.length+
  ' · '+(quizMode==="reviewing"?"Reviewing":"Mastering")+' · '+partLabel(quizMode,quizPart)+'</div><h3>'+esc(q.q)+'</h3>'+
  questionVisual+
  '<div class="final-question-tools"><button type="button" class="final-action final-hint" id="finalHintBtn" aria-expanded="false" aria-controls="finalHintBody">💡 Hint: show topic</button>'+
  '<a class="final-action final-summary-topic-link" href="'+BASE+'summary/#final-section-'+encodeURIComponent(summarySection.id)+
  '" data-final-summary-topic="'+esc(summarySection.id)+'" title="Open the related Lecture 10 summary section">📖 Read this topic in Summary ↗</a></div>'+
  '<div class="final-hint-body" id="finalHintBody" hidden><b>'+esc(summarySection.title)+'</b><p class="final-mini">'+esc(q.ref)+'</p><p class="final-mini">This tells you the topic, not the correct option.</p></div>'+
  choices+confUI+
  '<div class="final-actions"><button class="final-action '+(currentDraft.flags[q.id]?"active":"")+
  '" id="finalFlag" '+(submitted?"disabled":"")+'>'+(currentDraft.flags[q.id]?"★ Flagged for review":"☆ Flag to review")+'</button></div>'+
  explanation+
  (submitted?'<div class="final-actions"><button class="final-action" id="finalBackToQuizResults">↑ Back to results</button></div>':'')+
  '<div class="final-actions"><button class="final-action" id="finalPrevious" '+(currentIndex===0?"disabled":"")+'>← Previous</button>'+
  '<button class="final-primary" id="finalNext" '+(currentIndex===bank.length-1?"disabled":"")+'>Next →</button></div>'+
  '<label for="finalQNote" class="final-mini">Personal question note (autosaved)</label>'+
  '<textarea id="finalQNote" class="final-input" rows="2" placeholder="Why I chose this, what confused me, professor wording…"></textarea></div>'+
  '<div class="final-actions"><button class="final-primary" id="finalSubmit" '+(submitted||cannotSubmit?"disabled":"")+'>'+
  (submitted?"Already submitted":cannotSubmit?"Answer "+(bank.length-answered)+" more to submit":"Submit "+(quizMode==="reviewing"?"Reviewing":"Mastering"))+'</button>'+
  '<button type="button" class="final-action" id="finalResetQuiz">'+(submitted?'↻ Retake this part':'Restart this part')+'</button></div>';
 const note=$("finalQNote");note.value=state.quizQuestionNotes[q.id]||"";
 // Mirror the original EC214 purple note dot on the numbered question grid,
 // updating in place while the student writes (no re-render / cursor jump).
 note.oninput=e=>{
  state.quizQuestionNotes[q.id]=e.target.value;
  save();
  const numbered=root.querySelector('.final-qnum[data-q-index="'+currentIndex+'"]');
  if(numbered){
   const hasNote=!!e.target.value.trim();
   numbered.classList.toggle("noted",hasNote);
   numbered.title="Question "+(currentIndex+1)+(hasNote?" · Has saved note":"");
  }
 };
 const search=$("finalQuizSearch");search.value=quizSearchQuery;
 search.oninput=()=>{quizSearchQuery=search.value;renderQuizSearchResults()};
 renderQuizSearchResults();
 root.querySelectorAll("[data-mode]").forEach(el=>el.onclick=()=>selectMode(el.dataset.mode));
 root.querySelectorAll("[data-final-part]").forEach(el=>el.onclick=()=>selectPart(el.dataset.finalPart));
 root.querySelectorAll("[data-q-index]").forEach(el=>el.onclick=()=>{currentIndex=Number(el.dataset.qIndex);saveDraft();renderQuiz()});
 root.querySelectorAll("[data-result-index]").forEach(el=>el.onclick=()=>{
  currentIndex=Number(el.dataset.resultIndex);saveDraft();renderQuiz();
  const target=$("finalQuizQuestion");
  if(target){target.scrollIntoView({behavior:"smooth",block:"start"});target.focus({preventScroll:true})}
 });
 const back=$("finalBackToQuizResults");
 if(back)back.onclick=()=>{
  const target=$("finalQuizResultSummary");
  if(target){target.scrollIntoView({behavior:"smooth",block:"start"});target.focus({preventScroll:true})}
 };
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
 $("finalFlag").onclick=()=>{if(submitted)return;currentDraft.flags[q.id]=!currentDraft.flags[q.id];saveDraft();renderQuiz()};
 $("finalHintBtn").onclick=()=>{
  const panel=$("finalHintBody");panel.hidden=!panel.hidden;
  $("finalHintBtn").setAttribute("aria-expanded",String(!panel.hidden));
 };
 $("finalPrevious").onclick=()=>{currentIndex=Math.max(0,currentIndex-1);saveDraft();renderQuiz()};
 $("finalNext").onclick=()=>{currentIndex=Math.min(bank.length-1,currentIndex+1);saveDraft();renderQuiz()};
 $("finalSubmit").onclick=submitQuiz;
 $("finalResetQuiz").onclick=resetQuiz;
 root.querySelectorAll("[data-final-retake]").forEach(btn=>btn.onclick=resetQuiz);
}

function submitQuiz(){
 const bank=bankFor(quizMode,quizPart);
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
  const key="l10::"+quizMode+"::"+quizPart+"::"+topic;
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
  id:"final-l10-"+Date.now()+"-"+Math.random().toString(36).slice(2,7),
  subjectId:SUB,lecture:"l10",mode:quizMode,partId:quizPart,at:new Date().toISOString(),
  score,total:bank.length,percent:Math.round(100*score/bank.length),
  optionOrders:Object.fromEntries(bank.map(q=>[q.id,(currentDraft.optionOrders[q.id]||[0,1,2,3]).slice()])),
  questionSnapshot:bank.map(q=>({id:q.id,q:q.q,opts:q.opts.slice(),ans:q.ans,topic:q.topic,why:q.why,ref:q.ref})),
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
 // Submit happens near the last question; bring the summary and wrong answers into view.
 const target=$("finalQuizResultSummary");
 if(target){
  const reveal=()=>{target.scrollIntoView({behavior:"smooth",block:"start"});target.focus({preventScroll:true})};
  if(typeof requestAnimationFrame==="function")requestAnimationFrame(reveal);else reveal();
 }
}

function resetQuiz(){
 // A finished attempt is archived in History. Retaking must be a single click,
 // not a browser confirmation hidden at the very bottom of the old question.
 if(!currentDraft)return;
 const unfinished=(!currentDraft.submitted&&Object.keys(currentDraft.answers||{}).length>0);
 if(unfinished&&!confirm("Restart "+quizMode+" "+partLabel(quizMode,quizPart)+"? Your unfinished answers for this part will be cleared. Completed attempts in History and saved notes remain unchanged."))return;
 currentDraft=defaultDraft(quizMode,quizPart);
 currentIndex=0;
 submittedView=false;
 saveDraft();
 renderQuiz();
 // Returning to question 1 makes it obvious the new attempt is ready.
 const question=$("finalQuizQuestion");
 if(question){
  const reveal=()=>{question.scrollIntoView({block:"start",behavior:"smooth"});question.focus({preventScroll:true})};
  if(typeof requestAnimationFrame==="function")requestAnimationFrame(reveal);else reveal();
 }
 setStatus("New "+partLabel(quizMode,quizPart)+" attempt ready — previous scores are kept in History.");
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
 const h=state.quizHistory.filter(x=>x.lecture==="l10").slice().reverse().filter(x=>
  (historyFilterMode==="all"||x.mode===historyFilterMode)&&
  (!term||[x.mode,x.partId||"full",x.at,...historyReviewItems(x).flatMap(z=>[z.q,z.topic,z.why,z.ref]),...(x.questionSnapshot||[]).flatMap(q=>[q.q,q.topic,q.why,q.ref])]
   .join(" ").toLocaleLowerCase().includes(term)));
 root.innerHTML=h.length?h.map(x=>{
  const review=historyReviewItems(x);
  const learning=Number.isFinite(x.adjustedPercent)?x.adjustedPercent+"%":"not tracked (older attempt)";
  const confidenceTracked=Number.isFinite(x.adjustedPercent);
  const perfect=confidenceTracked&&x.adjustedPercent===100&&x.score===x.total&&(x.guessed||0)===0&&(x.unsure||0)===0;
  return '<article class="final-history-item"><div class="final-actions" style="justify-content:space-between">'+
   '<b>'+esc(x.mode.toUpperCase())+' · '+esc(partLabel(x.mode,x.partId||"full"))+' · '+x.score+'/'+x.total+' raw ('+x.percent+'%)</b>'+
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
   '</details>'+
   (Array.isArray(x.questionSnapshot)&&x.questionSnapshot.length?
    '<details class="final-history-details"><summary>📋 Review all '+x.questionSnapshot.length+' answers</summary>'+
    x.questionSnapshot.map((q,i)=>{
     const chosen=x.answers&&x.answers[q.id],ok=chosen===q.ans;
     const ordering=x.optionOrders&&x.optionOrders[q.id]||[0,1,2,3];
     const label=n=>String.fromCharCode(65+Math.max(0,ordering.indexOf(n)));
     const confidence=x.confidence&&x.confidence[q.id]||"confident";
     return '<div class="final-explain final-history-review"><b>'+(i+1)+'. '+esc(q.q)+'</b>'+
      '<p>Your answer: '+(Number.isInteger(chosen)?label(chosen)+'. '+esc(q.opts[chosen]):"Unanswered")+
      ' · '+(ok?"✓ Correct":"✗ Incorrect")+' · '+esc(confidence)+'</p>'+
      '<p>Correct: '+label(q.ans)+'. '+esc(q.opts[q.ans])+'</p>'+
      '<p>'+esc(q.why)+'</p><span class="final-mini">'+esc(q.ref)+'</span></div>';
    }).join("")+'</details>':"")+
   '</article>';
 }).join(""):'<div class="final-card"><h3>No matching attempts</h3><p class="final-mini">Complete Reviewing or Mastering, or clear your search filters.</p></div>';
}

function renderSettings(){
 const p=sharedPrefs();
 $("finalSettings").innerHTML='<div class="final-heading"><div class="final-eyebrow">Shared appearance · subject-isolated academics</div><h2>EC214 Final Settings</h2><p>Adjust Theme, Accent, Text size and Font just like EC214. Settings sync across subjects; Final Exam notes, progress and scores remain separate.</p></div>'+
 '<div class="final-card"><h3>Interface theme</h3><div class="final-actions">'+["classic","neo","midnight"].map(x=>'<button class="final-action '+(p.uiTheme===x?"active":"")+'" data-pref="uiTheme" data-value="'+x+'">'+x[0].toUpperCase()+x.slice(1)+'</button>').join("")+'</div><h3>Accent</h3><div class="final-actions">'+["navy","violet","forest","rose","amber"].map(x=>'<button class="final-action '+(p.accent===x?"active":"")+'" data-pref="accent" data-value="'+x+'">'+x+'</button>').join("")+'</div>'+
 '<h3>Appearance</h3><div class="final-actions">'+["system","light","dark"].map(x=>'<button class="final-action '+(p.appearance===x?"active":"")+'" data-pref="appearance" data-value="'+x+'">'+x+'</button>').join("")+'</div>'+
 '<h3>Text size</h3><p class="final-mini">Same shared reading-size setting as EC214. Larger text applies immediately to Summary, Quiz, Notes and other Final pages.</p>'+
 '<div class="final-actions">'+[["normal","Normal"],["large","Large · easier to read"]].map(([key,label])=>
 '<button type="button" class="final-action '+(p.textSize===key?"active":"")+'" data-pref="textSize" data-value="'+key+'" aria-pressed="'+(p.textSize===key)+'">'+label+'</button>').join("")+'</div>'+
 '<h3>Font</h3><div class="final-actions">'+[["inter","Inter"],["poppins","Poppins"],["nunito","Nunito Sans"],["manrope","Manrope"],["ibm","IBM Plex Sans"],["merriweather","Merriweather"]].map(([key,label])=>
 '<button type="button" class="final-action '+(p.font===key?"active":"")+'" data-pref="font" data-value="'+key+'" aria-pressed="'+(p.font===key)+'">'+label+'</button>').join("")+'</div></div>'+
 '<div class="final-card" style="margin-top:14px"><h3>EC214 Final data</h3><p class="final-mini">Storage namespace: d-study-ec214-final-l10-state::[local profile]. Export/import includes only this subject. Cross-subject backups are rejected. Saved part drafts are included in subject-only backups.</p>'+
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
 '<div class="final-card"><textarea class="final-input final-notes" id="finalPromptText" readonly>Help me study EC214 Lecture 10 (Monetary Policy) using my professor’s annotated 35-page PDF as the primary source. Explain the policy objective of price stability, required reserve ratio, discount rate, open-market operations, QE/credit easing/Operation Twist, the five transmission channels, expansionary and contractionary monetary-policy chains, and the short-run inflation–unemployment trade-off. Keep the central-bank tool action separate from the later transmission effect. Use earlier quizzes and the Final Mock only for style/difficulty; do not create or modify the Final Mock.</textarea><button class="final-primary" id="finalCopyPrompt">Copy study prompt</button></div>';
 $("finalCopyPrompt").onclick=()=>navigator.clipboard.writeText($("finalPromptText").value).then(()=>setStatus("Prompt copied ✓")).catch(()=>setStatus("Copy not available; select the text manually"));
}
function exportData(){
 save();if(currentDraft)saveDraft();
 const modes=["reviewing","mastering"];
 const quizDrafts={};
 for(const mode of modes){
  // Keep the pre-v14.4 backup property for old full-length attempts.
  const legacy=parse(storeGet(quizDraftKey(mode,"full")));
  if(legacy&&legacy.subjectId===SUB&&legacy.profileId===user.id&&legacy.mode===mode)
   quizDrafts[mode]=legacy;
  quizDrafts[mode+"Parts"]={};
  for(const p of PARTS[mode]){
   const raw=parse(storeGet(quizDraftKey(mode,p.id)));
   if(raw&&raw.subjectId===SUB&&raw.profileId===user.id&&raw.mode===mode&&raw.partId===p.id)
    quizDrafts[mode+"Parts"][p.id]=raw;
  }
 }
 const out={app:"D Study App",subjectId:SUB,version:3,profileId:user.id,exportedAt:new Date().toISOString(),state,quizDrafts,...(mock?mock.exportBundle():{})};
 const blob=new Blob([JSON.stringify(out,null,2)],{type:"application/json"}),url=URL.createObjectURL(blob),link=document.createElement("a");
 link.href=url;link.download="d-study-ec214-final-l10-"+user.username+"-backup.json";link.click();
 setTimeout(()=>URL.revokeObjectURL(url),1500);
}
function importData(e){
 const file=e.target.files&&e.target.files[0];if(!file)return;
 const r=new FileReader();
 r.onload=()=>{
  const x=parse(r.result);
  if(!x||x.subjectId!==SUB||!x.state||x.state.subjectId!==SUB||x.profileId!==user.id||x.state.profileId!==user.id){
   alert("Import blocked. This file is not an EC214 Final backup for this local profile.");return;
  }
  if(mock&&!mock.validBundle(x.mockState,x.mockDrafts)){
   alert("Import blocked: mock backup contains data from another subject, profile, or exam.");return;
  }
  if(!confirm("Replace this profile’s Lecture 10 records with this backup? Lectures 5–9 and other subjects are not affected."))return;
  const drafts=[];
  if(x.quizDrafts&&typeof x.quizDrafts==="object"){
   for(const mode of ["reviewing","mastering"]){
    const full=x.quizDrafts[mode];
    if(full&&full.subjectId===SUB&&full.profileId===user.id&&full.mode===mode&&
     full.lecture==="l10"&&(!full.partId||full.partId==="full")){
     drafts.push([quizDraftKey(mode,"full"),full]);
    }
    const parts=x.quizDrafts[mode+"Parts"]||{};
    for(const part of PARTS[mode]){
     const d=parts[part.id];
     if(d&&d.subjectId===SUB&&d.profileId===user.id&&d.mode===mode&&
      d.lecture==="l10"&&d.partId===part.id){
      drafts.push([quizDraftKey(mode,part.id),d]);
     }
    }
   }
  }
  state=x.state;save();
  for(const [key,value] of drafts)storePut(key,value);
  if(mock)mock.importBundle(x.mockState,x.mockDrafts);
  const choice=state.quizSelection||{};
  quizMode=qsets[choice.mode]?choice.mode:"reviewing";
  quizPart=validPart(quizMode,choice[quizMode])?choice[quizMode]:"p1";
  currentDraft=null;currentIndex=0;
  buildOutline();renderAll();navigate("progress",false);
  alert("EC214 Final backup imported. Saved parts and older full-lecture drafts remain available.");
 };
 r.readAsText(file);e.target.value="";
}

function openMockSummary(topicId){
 if(!BOOK.sections.some(section=>section.id===topicId))return;
 if(mock)mock.saveDraft();
 navigate("summary");
 history.replaceState({dStudy:true,subject:SUB},"",BASE+"summary/#final-section-"+encodeURIComponent(topicId));
 const el=$("final-section-"+topicId);
 if(el){
  document.querySelectorAll(".final-search-target").forEach(x=>x.classList.remove("final-search-target"));
  el.classList.add("final-search-target");el.scrollIntoView({block:"start",behavior:"smooth"});
 }
}
function renderAll(){renderProgress();renderBlankFlashcards();renderNotes();renderHistory();renderSettings();renderPrompt();renderQuiz();if(mock)mock.render()}
function clickEvents(){
 document.addEventListener("click",function(e){
  const tab=e.target.closest("a[data-f-tab]");
  if(tab){e.preventDefault();navigate(tab.dataset.fTab);return}
  const go=e.target.closest("[data-final-go]");
  if(go){navigate(go.dataset.finalGo);return}
  const summary=e.target.closest("a[data-final-summary-topic]");
  if(summary&&!e.metaKey&&!e.ctrlKey&&!e.shiftKey&&!e.altKey){
   e.preventDefault();
   if(currentDraft)saveDraft();
   const topicId=summary.dataset.finalSummaryTopic;
   if(!BOOK.sections.some(section=>section.id===topicId))return;
   navigate("summary");
   const url=BASE+"summary/#final-section-"+encodeURIComponent(topicId);
   history.replaceState({dStudy:true,subject:SUB},"",url);
   const target=$("final-section-"+topicId);
   if(target){
    document.querySelectorAll(".final-search-target").forEach(x=>x.classList.remove("final-search-target"));
    target.classList.add("final-search-target");target.scrollIntoView({block:"start",behavior:"smooth"});
   }
   return;
  }
  const section=e.target.closest("[data-summary-id]");
  if(section){navigate("summary");const target=$("final-section-"+section.dataset.summaryId);if(target){document.querySelectorAll(".final-search-target").forEach(x=>x.classList.remove("final-search-target"));target.classList.add("final-search-target");target.scrollIntoView({block:"start",behavior:"smooth"})}return}
 },true);
 document.addEventListener("change",e=>{
  const id=e.target.dataset.finalStatus;if(id&&state){state.lectureStates.l10[id]=e.target.value;save();renderSummaryProgress()}
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