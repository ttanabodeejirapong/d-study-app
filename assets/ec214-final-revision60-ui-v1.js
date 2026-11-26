(function(){
"use strict";
const BANK=window.D_STUDY_EC214_REVISION60;if(!BANK||BANK.questions.length!==60)return;
const $=id=>document.getElementById(id),esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const parse=(s,f=null)=>{try{return JSON.parse(s)??f}catch(_){return f}},get=k=>{try{return localStorage.getItem(k)}catch(_){return null}},put=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
const session=parse(get("d-study-active-user")),users=parse(get("d-study-users-v1"),[]),user=session&&session.expiresAt>Date.now()?users.find(x=>x.id===session.id):null;
if(!user||!user.subjectAccess||!user.subjectAccess.ec214final){$("revisionRoot").innerHTML='<div class="final-card"><h2>Open EC214 Final first</h2><p>Sign in to your local D Study App profile and unlock EC214 Final Exams before using this revision set.</p><a class="final-primary" href="/d-study-app/ec214-final/">Open EC214 Final</a></div>';return}
const stateKey="d-study-ec214-final-revision60-state::"+user.id,draftKey=p=>"d-study-ec214-final-revision60-draft::"+user.id+"::"+p;
const parts=BANK.parts,byPart=id=>BANK.questions.filter(q=>q.partId===id),weight=c=>c==="guessed"?.4:c==="unsure"?.7:1;
let state=parse(get(stateKey),null);if(!state||state.profileId!==user.id||state.bankId!==BANK.id)state={profileId:user.id,bankId:BANK.id,part:"r1",history:[],notes:{},createdAt:new Date().toISOString()};
let part=parts.some(p=>p.id===state.part)?state.part:"r1",index=0,draft=null;
const blank=p=>({profileId:user.id,bankId:BANK.id,partId:p,answers:{},confidence:{},flags:{},index:0,submitted:false,lastResult:null});
function load(p){const d=parse(get(draftKey(p)),null);return d&&d.profileId===user.id&&d.bankId===BANK.id&&d.partId===p?Object.assign(blank(p),d):blank(p)}
function save(){state.part=part;put(stateKey,state);if(draft){draft.index=index;put(draftKey(part),draft)}}
function choose(p){if(!parts.some(x=>x.id===p))return;save();part=p;draft=load(p);index=Math.min(19,Math.max(0,Number(draft.index)||0));render()}
function counts(p){const b=byPart(p),d=load(p),hist=state.history.filter(h=>h.partId===p);return {answered:b.filter(q=>Number.isInteger(d.answers[q.id])).length,tries:hist.length,best:hist.length?Math.max(...hist.map(h=>h.learningPercent)):null}}
function diagram(kind){
 if(!kind)return "";
 if(kind==="ae")return '<figure class="final-mock-figure"><svg viewBox="0 0 520 260"><path d="M60 20V220H490" stroke="currentColor" fill="none"/><path d="M60 220L270 10" stroke="currentColor" fill="none" stroke-width="2"/><path d="M70 175L470 70" stroke="#26729b" fill="none" stroke-width="3"/><text x="420" y="58" fill="currentColor">AE</text><text x="280" y="250" fill="currentColor">Real GDP</text></svg><figcaption>Conceptual Keynesian-cross cue. Use the numerical information in the question.</figcaption></figure>';
 if(kind==="money")return '<figure class="final-mock-figure"><svg viewBox="0 0 520 260"><path d="M60 20V220H490" stroke="currentColor" fill="none"/><path d="M110 55L430 195" stroke="#d2766a" fill="none" stroke-width="3"/><path d="M285 35V215" stroke="#26729b" fill="none" stroke-width="3"/><text x="14" y="20" fill="currentColor">i</text><text x="390" y="246" fill="currentColor">Money</text><text x="438" y="198" fill="#d2766a">MD</text><text x="294" y="48" fill="#26729b">MS</text></svg><figcaption>Conceptual money market; not to scale.</figcaption></figure>';
 if(kind==="trade")return '<figure class="final-mock-figure"><svg viewBox="0 0 520 260"><path d="M60 20V220H490" stroke="currentColor" fill="none"/><path d="M110 195L430 55" stroke="#1a956f" fill="none" stroke-width="3"/><path d="M110 55L430 195" stroke="#d2766a" fill="none" stroke-width="3"/><path d="M60 100H470" stroke="#806ac7" stroke-dasharray="6 5"/><text x="10" y="103" fill="currentColor">Pᵂ</text></svg><figcaption>Conceptual world-price trade diagram; infer export/import from the stated quantities or price relation.</figcaption></figure>';
 if(kind==="fx")return '<figure class="final-mock-figure"><svg viewBox="0 0 520 260"><path d="M60 20V220H490" stroke="currentColor" fill="none"/><path d="M110 195L430 55" stroke="#1a956f" fill="none" stroke-width="3"/><path d="M110 55L430 195" stroke="#d2766a" fill="none" stroke-width="3"/><text x="8" y="18" fill="currentColor">THB/USD</text><text x="400" y="246" fill="currentColor">USD</text></svg><figcaption>Conceptual USD market in Thailand; not to scale.</figcaption></figure>';
 return '<figure class="final-mock-figure"><svg viewBox="0 0 520 260"><path d="M60 20V220H490" stroke="currentColor" fill="none"/><path d="M110 190L430 60" stroke="#1a956f" fill="none" stroke-width="3"/><path d="M110 60L430 190" stroke="#d2766a" fill="none" stroke-width="3"/><text x="12" y="20" fill="currentColor">P</text><text x="430" y="246" fill="currentColor">Y</text></svg><figcaption>Conceptual AD–AS cue; use the shock stated in the question.</figcaption></figure>';
}
function render(){
 if(!draft||draft.partId!==part){draft=load(part);index=Math.min(19,Math.max(0,Number(draft.index)||0))}
 const b=byPart(part),q=b[index],ans=draft.answers[q.id],sub=draft.submitted,conf=draft.confidence[q.id]||"confident",answered=b.filter(x=>Number.isInteger(draft.answers[x.id])).length;
 const pc=parts.find(x=>x.id===part),options=q.opts.map((o,i)=>'<button class="final-choice '+(ans===i?"selected ":"")+(sub&&i===q.ans?"correct ":"")+(sub&&ans===i&&i!==q.ans?"wrong":"")+'" data-a="'+i+'" '+(sub?"disabled":"")+">"+String.fromCharCode(65+i)+". "+esc(o)+"</button>").join("");
 const nums='<div class="final-questionbar">'+b.map((x,i)=>'<button class="final-qnum '+(i===index?"current ":"")+(Number.isInteger(draft.answers[x.id])?"answered ":"")+(draft.flags[x.id]?"flagged ":"")+'" data-i="'+i+'">'+(i+1)+'</button>').join("")+'</div>';
 const chooser='<div class="final-part-grid">'+parts.map(p=>{const c=counts(p.id);return '<button class="final-part-card '+(p.id===part?"active":"")+'" data-p="'+p.id+'"><span class="final-part-name">'+esc(p.title)+' <span>20 Q</span></span><span class="final-part-desc">'+esc(p.description)+'</span><span class="final-part-progress">'+(c.tries?"Done "+c.tries+"× · Best "+c.best+"%":c.answered?"Continue "+c.answered+"/20":"Not started")+'</span><span class="final-part-meter"><i style="width:'+(c.answered*5)+'%"></i></span></button>'}).join("")+'</div>';
 const explain=sub?'<div class="final-explain"><b>Practice answer: '+String.fromCharCode(65+q.ans)+'. '+esc(q.opts[q.ans])+'</b><p>'+esc(q.explanation)+'</p><span class="final-mini">'+esc(q.source)+'</span></div>':"";
 const result=sub&&draft.lastResult?'<div class="final-card"><h3>Round complete</h3><p>Raw: <b>'+draft.lastResult.score+'/20</b> · Learning: <b>'+draft.lastResult.learningPercent+'%</b></p><button class="final-primary" id="revReset">Retake this round</button></div>':"";
 $("revisionRoot").innerHTML='<div class="final-heading"><div class="final-eyebrow">EC214 FINAL · LECTURES 5–11</div><h2>'+esc(BANK.title)+'</h2><p>'+esc(BANK.subtitle)+'</p></div><div class="final-mock-disclaimer">'+esc(BANK.disclaimer)+'</div>'+chooser+result+
 '<article class="final-card"><div class="final-progress-line"><b>'+esc(pc.title)+' · '+answered+'/20 answered</b><span>Question '+(index+1)+' of 20 · Lecture '+q.lecture+'</span></div>'+nums+
 '<div class="final-eyebrow">LECTURE '+q.lecture+' · QUESTION '+(index+1)+' OF 20</div><h3>'+esc(q.q)+'</h3>'+diagram(q.visual)+options+
 '<div class="final-confidence"><b>Confidence</b><div class="final-actions"><button class="final-action '+(conf==="unsure"?"active":"")+'" data-c="unsure" '+(sub?"disabled":"")+'>□ Not sure</button><button class="final-action '+(conf==="guessed"?"active":"")+'" data-c="guessed" '+(sub?"disabled":"")+'>□ Guessed</button><button class="final-action '+(draft.flags[q.id]?"active":"")+'" id="revFlag" '+(sub?"disabled":"")+'>☆ Review</button></div></div>'+explain+
 '<div class="final-actions"><button class="final-action" id="revPrev">← Previous</button><button class="final-primary" id="revNext">Next →</button><button class="final-primary" id="revSubmit" '+(sub||answered<20?"disabled":"")+'>Submit round</button></div>'+
 '<label class="final-mini">Question note (autosaved)</label><textarea class="final-input final-notes" id="revNote" placeholder="Why I chose this, what confused me…">'+esc(state.notes[q.id]||"")+'</textarea></article>'+
 '<details class="final-card"><summary>Revision history · '+state.history.length+' completed rounds</summary>'+state.history.slice().reverse().map(h=>'<p><b>'+esc(parts.find(p=>p.id===h.partId)?.title||h.partId)+'</b> · '+h.score+'/20 raw · '+h.learningPercent+'% learning · '+esc(new Date(h.at).toLocaleString())+'</p>').join("")+'</details>';
 document.querySelectorAll("[data-p]").forEach(el=>el.onclick=()=>choose(el.dataset.p));
 document.querySelectorAll("[data-i]").forEach(el=>el.onclick=()=>{index=Number(el.dataset.i);save();render()});
 document.querySelectorAll("[data-a]").forEach(el=>el.onclick=()=>{if(sub)return;draft.answers[q.id]=Number(el.dataset.a);save();render()});
 document.querySelectorAll("[data-c]").forEach(el=>el.onclick=()=>{if(sub)return;const v=el.dataset.c;draft.confidence[q.id]=draft.confidence[q.id]===v?"confident":v;save();render()});
 $("revFlag").onclick=()=>{if(sub)return;draft.flags[q.id]=!draft.flags[q.id];save();render()};
 $("revPrev").onclick=()=>{index=Math.max(0,index-1);save();render()};
 $("revNext").onclick=()=>{index=Math.min(19,index+1);save();render()};
 $("revSubmit").onclick=submit;
 const n=$("revNote");n.oninput=()=>{state.notes[q.id]=n.value;save()};
 if($("revReset"))$("revReset").onclick=()=>{if(confirm("Start a new attempt for this 20-question round? Completed history stays saved.")){draft=blank(part);index=0;save();render()}};
}
function submit(){
 const b=byPart(part);if(draft.submitted)return;if(b.some(q=>!Number.isInteger(draft.answers[q.id]))){alert("Answer all 20 questions first.");return}
 let score=0,pts=0,guessed=0,unsure=0;
 for(const q of b){const ok=draft.answers[q.id]===q.ans,c=draft.confidence[q.id]||"confident";if(ok){score++;pts+=weight(c)}if(c==="guessed")guessed++;if(c==="unsure")unsure++}
 const res={id:"rev60-"+Date.now(),partId:part,at:new Date().toISOString(),score,total:20,rawPercent:Math.round(score*5),learningPercent:Math.round(pts*5),guessed,unsure};
 draft.submitted=true;draft.lastResult=res;state.history.push(res);save();render();window.scrollTo({top:0,behavior:"smooth"});
}
$("revisionUser").textContent="👤 "+user.username;draft=load(part);index=Math.min(19,Math.max(0,Number(draft.index)||0));render();
})();