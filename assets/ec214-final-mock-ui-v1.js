/* EC214 Final — 30-question screenshot-based mock engine (v14.5).
   Independent academic keys; professor screenshot sources stay private.
   Answers are INFERRED (not an official Google Form answer key).
 */
(function(){
"use strict";
const BANK=window.D_STUDY_FINAL_MOCK_V1;
if(!BANK||!Array.isArray(BANK.questions)||BANK.questions.length!==30)return;
const SUBJECT="ec214final",EXAM=BANK.id,PARTS=BANK.parts;
const $=id=>document.getElementById(id);
const escape=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;",'"':"&quot;"}[c]));
const get=k=>{try{return localStorage.getItem(k)}catch(_){return null}};
const json=(raw,fallback=null)=>{try{return JSON.parse(raw)??fallback}catch(_){return fallback}};
const write=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
const byPart=id=>BANK.questions.filter(q=>q.partId===id);
const weight=c=>c==="guessed"?0.4:c==="unsure"?0.7:1;
const stamp=()=>new Date().toISOString();
const clamp=(n,min,max)=>Math.min(max,Math.max(min,n));
const validPart=id=>PARTS.some(x=>x.id===id);
function graphAE(){
 // A faithful redrawing of the screenshot's 45-degree Keynesian cross:
 // AE₁ and AE₀, intersections Y₂ and Y₁, and a larger illustrative Y₃.
 return '<figure class="final-mock-figure" aria-label="Aggregate expenditure graph">'+
 '<svg viewBox="0 0 660 455" role="img" aria-labelledby="final-mock-graph-title final-mock-graph-desc" xmlns="http://www.w3.org/2000/svg">'+
 '<title id="final-mock-graph-title">Aggregate expenditure schedules AE₀, AE₁ and the AE equals Y line</title>'+
 '<desc id="final-mock-graph-desc">Vertical axis Desired Aggregate Expenditure, horizontal axis Actual National Income. Upward forty-five degree line AE equals Y. AE₁ is parallel above AE₀. Three output markers Y₁, Y₂, Y₃ appear on the income axis in that order.</desc>'+
 '<path d="M110 30 V395 H630" stroke="currentColor" stroke-width="2.5" fill="none"/>'+
 '<text x="72" y="399" font-size="17" fill="currentColor">0</text>'+
 '<text x="340" y="444" font-size="19" fill="currentColor" text-anchor="middle">Actual National Income</text>'+
 '<text x="23" y="225" font-size="18" fill="currentColor" text-anchor="middle" transform="rotate(-90 23 225)">Desired Aggregate Expenditure</text>'+
 '<path d="M110 395 L470 35" stroke="currentColor" stroke-width="2.9" fill="none"/>'+
 '<text x="478" y="37" font-size="21" fill="currentColor" font-weight="700">AE = Y</text>'+
 '<path d="M110 290 L581 147" stroke="#26729b" stroke-width="3.8" stroke-linecap="round" fill="none"/>'+
 '<path d="M110 250 L581 107" stroke="#1a956f" stroke-width="3.8" stroke-linecap="round" fill="none"/>'+
 '<text x="598" y="147" font-size="23" fill="#26729b" font-weight="700">AE₀</text>'+
 '<text x="598" y="107" font-size="23" fill="#1a956f" font-weight="700">AE₁</text>'+
 '<text x="88" y="293" font-size="19" fill="currentColor">A</text>'+
 '<text x="88" y="254" font-size="19" fill="currentColor">B</text>'+
 '<path d="M254 250 V395 M311 194 V395 M424 81 V395" stroke="currentColor" stroke-dasharray="9 7" stroke-width="1.8" opacity=".62" fill="none"/>'+
 '<text x="254" y="418" text-anchor="middle" font-size="21" fill="currentColor">Y₁</text>'+
 '<text x="311" y="418" text-anchor="middle" font-size="21" fill="currentColor">Y₂</text>'+
 '<text x="424" y="418" text-anchor="middle" font-size="21" fill="currentColor">Y₃</text>'+
 '<path d="M158 395 A48 48 0 0 0 144 361" stroke="currentColor" stroke-width="1.5" fill="none"/>'+
 '<text x="167" y="381" font-size="16" fill="currentColor">45°</text>'+
 '</svg><figcaption>AE diagram redrawn from the supplied mock screenshots. Use the named AE curve and the Y marker stated in the question; the figure is not to scale.</figcaption></figure>';
}
function visuals(q){
 let html="";
 if(q.visual==="ae-cross")html+=graphAE();
 if(q.table){
  html+='<div class="final-mock-table-wrap" role="region" aria-label="Given numerical data" tabindex="0">'+
   '<table class="final-table final-mock-table"><thead><tr>'+
   q.table.headers.map(s=>'<th scope="col">'+escape(s)+'</th>').join("")+'</tr></thead>'+
   '<tbody>'+q.table.rows.map(row=>'<tr>'+row.map(x=>'<td>'+escape(x)+'</td>').join("")+'</tr>').join("")+
   '</tbody></table></div>';
 }
 return html;
}
window.DStudyCreateFinalMock=function({user,onSummary}){
 if(!user||!user.id||typeof onSummary!=="function")throw Error("Mock requires local profile and Summary route");
 const userId=user.id;
 const stateKey="d-study-ec214-final-mock-state::"+userId;
 const draftKey=id=>"d-study-ec214-final-mock-draft::"+userId+"::v1::"+id;
 let currentPart="p1",index=0,currentDraft=null,searchText="";
 const quarantine=(kind,raw)=>{try{localStorage.setItem("d-study-ec214-final-mock-quarantine::"+userId+"::"+Date.now()+"::"+kind,raw)}catch(_){}};
 const blankState=()=>({subjectId:SUBJECT,profileId:userId,mockId:EXAM,schemaVersion:1,selectedPart:"p1",questionNotes:{},history:[],createdAt:stamp()});
 let state=(()=>{const raw=get(stateKey);if(!raw)return blankState();const existing=json(raw);
  if(!existing||existing.subjectId!==SUBJECT||existing.profileId!==userId||existing.mockId!==EXAM){quarantine("invalid-mock-state",raw);return blankState()}
  const safe=blankState();
  safe.history=Array.isArray(existing.history)?existing.history.filter(h=>h&&h.mockId===EXAM&&h.subjectId===SUBJECT&&h.profileId===userId):[];
  safe.questionNotes=existing.questionNotes&&typeof existing.questionNotes==="object"&&!Array.isArray(existing.questionNotes)?existing.questionNotes:{};
  safe.selectedPart=validPart(existing.selectedPart)?existing.selectedPart:"p1";
  safe.createdAt=existing.createdAt||safe.createdAt;
  return safe;
 })();
 currentPart=state.selectedPart;
 function saveState(){
  if(state.subjectId!==SUBJECT||state.profileId!==userId||state.mockId!==EXAM){quarantine("write-block",JSON.stringify(state));return}
  try{write(stateKey,state)}catch(e){console.warn("Mock save unavailable",e)}
 }
 const newDraft=id=>({subjectId:SUBJECT,profileId:userId,mockId:EXAM,partId:id,bankVersion:"mock-v1",answers:{},confidence:{},flags:{},index:0,submitted:false,lastResult:null});
 function readDraft(id){
  if(!validPart(id))return newDraft("p1");
  const raw=get(draftKey(id));if(!raw)return newDraft(id);
  const d=json(raw);
  if(!d||d.subjectId!==SUBJECT||d.profileId!==userId||d.mockId!==EXAM||d.partId!==id){quarantine("invalid-mock-draft",raw);return newDraft(id)}
  const restored=Object.assign(newDraft(id),d);
  for(const key of ["answers","confidence","flags"])if(!restored[key]||typeof restored[key]!=="object"||Array.isArray(restored[key]))restored[key]={};
  return restored;
 }
 function saveDraft(){
  if(!currentDraft||currentDraft.subjectId!==SUBJECT||currentDraft.profileId!==userId||currentDraft.mockId!==EXAM||currentDraft.partId!==currentPart)return;
  currentDraft.index=index;
  try{write(draftKey(currentPart),currentDraft)}catch(e){console.warn("Mock draft unavailable",e)}
 }
 function choose(id){
  if(!validPart(id))return;
  if(currentDraft)saveDraft();
  currentPart=id;state.selectedPart=id;saveState();
  currentDraft=readDraft(id);
  index=clamp(Number(currentDraft.index)||0,0,byPart(id).length-1);
  render();
 }
 function counts(id){
  const results=state.history.filter(h=>h.partId===id);
  const current=readDraft(id);
  const answered=byPart(id).filter(q=>Number.isInteger(current.answers[q.id])).length;
  return {tries:results.length,best:results.length?Math.max(...results.map(x=>x.learningPercent??0)):null,answered,
   perfect:results.filter(h=>h.score===10&&h.learningPercent===100).length};
 }
 function explanation(q){
  const answer=currentDraft.answers[q.id],correct=answer===q.ans;
  const conf=currentDraft.confidence[q.id]||"confident";
  return '<div class="final-explain"><b>Practice key: '+String.fromCharCode(65+q.ans)+'. '+escape(q.opts[q.ans])+'</b>'+
   '<p>'+ (correct?"✓ Correct":"✗ Incorrect")+" · "+(conf==="unsure"?"Not sure":conf==="guessed"?"Guessed":"Confident")+
   ' · Learning credit: '+(correct?weight(conf):0).toFixed(1)+' / 1</p>'+
   '<p>'+escape(q.explanation)+'</p>'+
   '<span class="final-mini">Inferred answer (not official) · Screenshot source: '+escape(q.source)+'</span></div>';
 }
 function partChooser(){
  const saved=currentDraft;
  const already=byPart(currentPart).filter(q=>Number.isInteger(saved.answers[q.id])).length>0;
  return '<details class="final-parts-menu" '+(already?"":"open")+'><summary><b>Original '+currentPart.toUpperCase()+
   ' · 10 questions</b><span>Choose part ▾</span></summary><div class="final-mock-parts">'+PARTS.map(p=>{
    const s=counts(p.id);return '<button type="button" data-mock-part="'+p.id+'" class="final-part-card '+(p.id===currentPart?"active":"")+'" aria-pressed="'+(p.id===currentPart)+'">'+
     '<span class="final-part-name">Part '+p.id.slice(1)+' <span>10 Q</span></span><b>'+escape(p.title)+'</b>'+
     '<span class="final-part-desc">Questions '+p.range[0]+'–'+p.range[1]+' of 30</span>'+
     '<span class="final-part-progress">'+(s.tries?("Done "+s.tries+"× · Best learning "+s.best+"%"):s.answered?("Continue "+s.answered+"/10"):"Not started")+
     '</span><span class="final-part-meter"><i style="width:'+(s.answered*10)+'%"></i></span></button>';
   }).join("")+'</div></details>';
 }
 function render(){
  const root=$("finalMock");if(!root)return;
  if(!currentDraft||currentDraft.partId!==currentPart){
   currentDraft=readDraft(currentPart);
   index=Number(currentDraft.index)||0; // Resume the exact saved question after refresh.
  }
  const bank=byPart(currentPart);
  index=clamp(Number(index)||0,0,bank.length-1);
  const q=bank[index],submitted=currentDraft.submitted,answer=currentDraft.answers[q.id],confidence=currentDraft.confidence[q.id]||"confident";
  const answered=bank.filter(x=>Number.isInteger(currentDraft.answers[x.id])).length;
  const done=counts(currentPart),mark=String(state.questionNotes[q.id]||"").trim();
  const header='<div class="final-heading"><div class="final-eyebrow">USER-SUPPLIED FINAL EXAM MOCK</div>'+
    '<h2>Macroeconomic Test — Final Part</h2>'+
    '<p>30 original questions in three short sets of 10. Your responses, notes, retakes and confidence scores are stored separately from Lecture 5 quizzes.</p></div>'+
    '<div class="final-mock-disclaimer" role="note">Practice answers are inferred from macroeconomic concepts; the supplied Google Form screenshots do not include an official answer key. The original screenshot files remain in private storage.</div>';
  const nums='<div class="final-questionbar" aria-label="Question numbers">'+bank.map((x,i)=>
   '<button type="button" data-mock-index="'+i+'" class="final-qnum '+(i===index?"current ":"")+
   (Number.isInteger(currentDraft.answers[x.id])?"answered ":"")+
   (currentDraft.flags[x.id]?"flagged ":"")+
   (currentDraft.confidence[x.id]&&currentDraft.confidence[x.id]!=="confident"?"uncertain ":"")+
   (String(state.questionNotes[x.id]||"").trim()?"noted ":"")+'">'+(i+1)+'</button>').join("")+'</div>'+
   '<div class="final-question-note-legend"><i class="final-saved-note-dot" aria-hidden="true"></i> Purple dot = saved note</div>';
  const options=q.opts.map((o,i)=>'<button type="button" class="final-choice '+
    (answer===i?"selected ":"")+(submitted&&i===q.ans?"correct ":"")+
    (submitted&&i===answer&&i!==q.ans?"wrong":"")+
    '" data-mock-answer="'+i+'" '+(submitted?"disabled":"")+'>'
    +String.fromCharCode(65+i)+'. '+escape(o)+'</button>').join("");
  const confButtons='<div class="final-confidence"><b>How sure are you?</b><p class="final-mini">Leave both buttons off when confident. Incorrect = 0 · Not sure = 0.7 · Guessed = 0.4 (only when correct).</p>'+
  '<div class="final-actions">'+["unsure","guessed"].map(v=>'<button type="button" class="final-action '+(confidence===v?"active":"")+
  '" data-mock-confidence="'+v+'" aria-pressed="'+(confidence===v)+'" '+(submitted?"disabled":"")+'>'+
  (v==="unsure"?"□ Not sure":"□ Guessed")+'</button>').join("")+'</div></div>';
  const hint='<div class="final-question-tools"><button type="button" id="finalMockHint" class="final-action final-hint" aria-expanded="false">💡 Hint: show topic</button>'+
   (q.summaryId?'<a class="final-action final-summary-topic-link" href="/d-study-app/ec214-final/summary/#final-section-'+escape(q.summaryId)+
     '" data-mock-summary="'+escape(q.summaryId)+'">📖 Related Lecture 5 Summary ↗</a>':
     '<span class="final-mock-not-ready">📖 Detailed lecture summary not yet uploaded for this topic</span>')+
   '</div><div id="finalMockHintBody" class="final-hint-body" hidden><b>'+escape(q.topic)+'</b>'+
   '<p class="final-mini">Think about this concept before selecting an answer. This hint does not reveal the answer.</p>'+
   (q.summaryId?'<p class="final-mini">The linked Lecture 5 section is related; this mock may also draw on later lectures.</p>':"")+'</div>';
  const question='<div class="final-card final-q final-mock-question"><div class="final-eyebrow">Original question '+q.number+' of 30 · Part '+currentPart.slice(1)+
   ', question '+(index+1)+' of 10</div><h3>'+escape(q.q)+'</h3>'+
    visuals(q)+hint+options+confButtons+
    '<div class="final-actions"><button type="button" id="finalMockFlag" class="final-action '+(currentDraft.flags[q.id]?"active":"")+
     '" '+(submitted?"disabled":"")+'>'+(currentDraft.flags[q.id]?"★ Flagged for review":"☆ Flag to review")+'</button></div>'+
    (submitted?explanation(q):"")+
    '<div class="final-actions"><button type="button" id="finalMockPrev" class="final-action" '+(index===0?"disabled":"")+'>← Previous</button>'+
    '<button type="button" id="finalMockNext" class="final-primary" '+(index===9?"disabled":"")+'>Next →</button></div>'+
    '<label for="finalMockNote" class="final-mini">Your question note (autosaved; purple dot on number)</label>'+
    '<textarea class="final-input" id="finalMockNote" rows="3" placeholder="Write why you were unsure or what to review…"></textarea></div>';
  const result=submitted&&currentDraft.lastResult?'<div class="final-card final-mock-result">'+
    '<div class="final-score-grid"><div class="final-score-card"><small>Raw</small><b>'+currentDraft.lastResult.score+'/10</b></div>'+
    '<div class="final-score-card"><small>Learning score</small><b>'+currentDraft.lastResult.learningPercent+'%</b></div>'+
    '<div class="final-score-card"><small>Times completed</small><b>'+done.tries+' ×</b></div>'+
    '<div class="final-score-card"><small>Best learning</small><b>'+done.best+'%</b></div></div>'+
    '<p class="final-mini">This is a reconstructed practice key, not an official graded Google Form result. Tap question numbers to review explanations.</p></div>':"";
  const actions='<div class="final-actions"><button type="button" class="final-primary" id="finalMockSubmit" '+(submitted||answered<10?"disabled":"")+'>'+
   (submitted?"Already submitted":answered<10?("Answer "+(10-answered)+" more to submit"):"Submit this 10-question part")+
   '</button><button type="button" class="final-action" id="finalMockReset">New attempt for Part '+currentPart.slice(1)+'</button></div>';
  const history=renderHistory();
  root.innerHTML=header+partChooser()+result+
   '<details class="final-study-tools final-mock-tools"><summary>🔎 Search all 30 mock questions (optional)</summary>'+
    '<input id="finalMockSearch" class="final-input" type="search" autocomplete="off" placeholder="Search money supply, multiplier, fiscal policy…">'+
    '<div id="finalMockResults" class="final-search-results"></div></details>'+
    '<div class="final-mock-questionbar"><b>Part '+currentPart.slice(1)+' · '+answered+'/10 answered</b>'+
     '<span>Question '+(index+1)+' of 10 · '+done.tries+' completed attempt'+(done.tries===1?"":"s")+'</span></div>'+
   nums+question+actions+history;
  const note=$("finalMockNote");note.value=state.questionNotes[q.id]||"";
  note.oninput=e=>{state.questionNotes[q.id]=e.target.value;saveState();
   const number=root.querySelector('.final-qnum[data-mock-index="'+index+'"]');
   if(number)number.classList.toggle("noted",!!e.target.value.trim());
  };
  root.querySelectorAll("[data-mock-part]").forEach(el=>el.onclick=()=>choose(el.dataset.mockPart));
  root.querySelectorAll("[data-mock-index]").forEach(el=>el.onclick=()=>{index=Number(el.dataset.mockIndex);saveDraft();render()});
  root.querySelectorAll("[data-mock-answer]").forEach(el=>el.onclick=()=>{if(submitted)return;currentDraft.answers[q.id]=Number(el.dataset.mockAnswer);saveDraft();render()});
  root.querySelectorAll("[data-mock-confidence]").forEach(el=>el.onclick=()=>{if(submitted)return;
   const v=el.dataset.mockConfidence;currentDraft.confidence[q.id]=currentDraft.confidence[q.id]===v?"confident":v;saveDraft();render();
  });
  $("finalMockFlag").onclick=()=>{if(submitted)return;currentDraft.flags[q.id]=!currentDraft.flags[q.id];saveDraft();render()};
  $("finalMockHint").onclick=()=>{const n=$("finalMockHintBody");n.hidden=!n.hidden;$("finalMockHint").setAttribute("aria-expanded",String(!n.hidden))};
  $("finalMockPrev").onclick=()=>{index=clamp(index-1,0,9);saveDraft();render()};
  $("finalMockNext").onclick=()=>{index=clamp(index+1,0,9);saveDraft();render()};
  $("finalMockSubmit").onclick=submit;
  $("finalMockReset").onclick=reset;
  root.querySelectorAll("[data-mock-summary]").forEach(el=>el.onclick=e=>{
   if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
   e.preventDefault();saveDraft();onSummary(el.dataset.mockSummary);
  });
  const search=$("finalMockSearch");search.value=searchText;
  search.oninput=()=>{searchText=search.value;renderSearch()};
  renderSearch();
  root.querySelectorAll("[data-mock-history]").forEach(el=>el.onclick=()=>{
   const historyId=el.dataset.mockHistory;
   const item=state.history.find(h=>h.id===historyId);if(!item)return;
   choose(item.partId);
  });
 }
 function renderSearch(){
  const root=$("finalMockResults"),input=$("finalMockSearch");if(!root||!input)return;
  const terms=input.value.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  if(!terms.length){root.innerHTML="";return}
  const hits=BANK.questions.filter(q=>terms.every(t=>
   [q.q,q.topic,q.opts.join(" "),q.source].join(" ").toLocaleLowerCase().includes(t)));
  root.innerHTML='<span class="final-mini">'+hits.length+' matching question'+(hits.length===1?"":"s")+'</span>'+
   hits.map(q=>'<button class="final-search-hit" type="button" data-mock-jump="'+escape(q.id)+'">'+
    '<span class="final-eyebrow">Part '+q.partId.slice(1)+' · Question '+q.number+'</span><b>'+escape(q.q)+'</b></button>').join("");
  root.querySelectorAll("[data-mock-jump]").forEach(btn=>btn.onclick=()=>{
   const q=BANK.questions.find(x=>x.id===btn.dataset.mockJump);if(!q)return;
   choose(q.partId);index=byPart(q.partId).findIndex(x=>x.id===q.id);saveDraft();render();
  });
 }
 function submit(){
  if(currentDraft.submitted)return;
  const bank=byPart(currentPart);
  if(bank.some(q=>!Number.isInteger(currentDraft.answers[q.id]))){alert("Please answer all 10 questions first.");return}
  let score=0,pts=0,guessed=0,unsure=0;
  const reviewItems=[];
  for(const q of bank){
   const answer=currentDraft.answers[q.id],conf=currentDraft.confidence[q.id]||"confident",correct=answer===q.ans;
   const point=correct?weight(conf):0;score+=correct?1:0;pts+=point;
   if(conf==="guessed")guessed++;if(conf==="unsure")unsure++;
   if(!correct||conf!=="confident"||currentDraft.flags[q.id]){
    reviewItems.push({id:q.id,q:q.q,given:answer,correctIndex:q.ans,correct,confidence:conf,points:point,
    flagged:!!currentDraft.flags[q.id],explanation:q.explanation,source:q.source,opts:q.opts.slice()});
   }
  }
  const at=stamp();
  const result={
   id:"final-mock-"+Date.now()+"-"+Math.random().toString(36).slice(2,7),
   subjectId:SUBJECT,profileId:userId,mockId:EXAM,partId:currentPart,at,score,total:10,
   rawPercent:score*10,learningPoints:Number(pts.toFixed(2)),learningPercent:Math.round(pts*10),
   guessed,unsure,answers:{...currentDraft.answers},confidence:{...currentDraft.confidence},flags:{...currentDraft.flags},
   reviewItems,questionSnapshot:bank.map(q=>({id:q.id,q:q.q,opts:q.opts.slice(),ans:q.ans,explanation:q.explanation,source:q.source}))
  };
  currentDraft.submitted=true;currentDraft.lastResult=result;
  state.history.push(result);saveState();saveDraft();render();
 }
 function reset(){
  if(!confirm("Start a new attempt for this 10-question part? Completed history and notes will be preserved."))return;
  currentDraft=newDraft(currentPart);index=0;saveDraft();render();
 }
 function renderHistory(){
  const h=state.history.slice().reverse();
  return '<details class="final-card final-mock-history"><summary>📊 Mock History · '+h.length+' completed part'+(h.length===1?"":"s")+'</summary>'+
   (h.length?h.map(result=>
    '<details class="final-history-details"><summary>Part '+result.partId.slice(1)+' · '+result.score+'/10 raw · '+result.learningPercent+'% learning · '+
    escape(new Date(result.at).toLocaleString())+'</summary>'+
    '<div class="final-mock-review">'+result.questionSnapshot.map((q,i)=>{
     const given=result.answers[q.id],ok=given===q.ans,conf=result.confidence[q.id]||"confident";
     return '<div class="final-explain"><b>'+(i+1)+'. '+escape(q.q)+'</b>'+
     '<p>Your answer: '+(Number.isInteger(given)?escape(q.opts[given]):"No response")+' '+(ok?"✓":"✗")+
     ' · '+escape(conf)+'</p><p>Practice answer: '+escape(q.opts[q.ans])+'</p>'+
     '<p>'+escape(q.explanation)+'</p><span class="final-mini">'+escape(q.source)+'</span></div>';
    }).join("")+'</div></details>'
   ).join(""):'<p class="final-mini">No completed mock parts yet.</p>')+'</details>';
 }
 function exportBundle(){
  saveState();if(currentDraft)saveDraft();
  const drafts={};
  for(const p of PARTS){
   const raw=json(get(draftKey(p.id)));
   if(raw&&raw.subjectId===SUBJECT&&raw.profileId===userId&&raw.mockId===EXAM&&raw.partId===p.id)drafts[p.id]=raw;
  }
  return {mockState:state,mockDrafts:drafts};
 }
 function validBundle(st,drafts){
  if(st!==undefined&&st!==null){
   if(!st||st.subjectId!==SUBJECT||st.profileId!==userId||st.mockId!==EXAM||!Array.isArray(st.history))return false;
  }
  if(drafts!==undefined&&drafts!==null){
   if(typeof drafts!=="object"||Array.isArray(drafts))return false;
   for(const [k,v] of Object.entries(drafts)){
    if(!validPart(k)||!v||v.subjectId!==SUBJECT||v.profileId!==userId||v.mockId!==EXAM||v.partId!==k)return false;
   }
  }
  return true;
 }
 function importBundle(st,drafts){
  if(!validBundle(st,drafts))throw Error("Mock backup subject/profile mismatch");
  // Old backups without mock data must not erase new mock academic records.
  if(st){state=st;saveState()}
  if(drafts)for(const [k,v] of Object.entries(drafts))write(draftKey(k),v);
  currentPart=validPart(state.selectedPart)?state.selectedPart:"p1";
  currentDraft=null;index=0;
  render();
 }
 function summary(){
  const n=state.history.length;return {completed:n,answeredParts:PARTS.map(p=>counts(p.id)),
    best:n?Math.max(...state.history.map(x=>x.learningPercent)):null};
 }
 return {render,choose,summary,exportBundle,validBundle,importBundle,saveDraft,
  __inspect:()=>({state,currentPart,index,currentDraft,partCounts:PARTS.map(p=>counts(p.id))})};
};
})();