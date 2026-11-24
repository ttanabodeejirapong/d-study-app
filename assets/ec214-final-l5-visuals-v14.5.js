/* D Study App v14.5 • professor-grounded, per-question visuals.
   This explicitly audits all 85 Lecture 5 questions: 82 get an appropriate visual,
   3 are definition/policy reasoning and intentionally text-only. Nothing is an
   extracted slide/image; all graphs are concept redraws with no answer overlay. */
(function(){
"use strict";
const AS_ROWS=[[100,12],[105,12.5],[110,13],[115,13.5],[120,14]];
const AD_ROWS=[[130,12],[120,12.5],[110,13],[100,13.5],[90,14]];
const WORK_ROWS=[[100,1150,1050],[110,1100,1100],[120,1050,1150],[130,1000,1200],[140,950,1250],[150,900,1300],[160,850,1350]];
const SPEC={
  "l5-r-001": {
    "kind": "graph",
    "variant": "axes"
  },
  "l5-r-002": {
    "kind": "graph",
    "variant": "axes"
  },
  "l5-r-003": {
    "kind": "graph",
    "variant": "equilibrium"
  },
  "l5-r-032": {
    "kind": "graph",
    "variant": "equilibrium"
  },
  "l5-r-004": {
    "kind": "none",
    "variant": "definition-only"
  },
  "l5-r-043": {
    "kind": "none",
    "variant": "definition-only"
  },
  "l5-r-005": {
    "kind": "flow",
    "variant": "inputs"
  },
  "l5-r-019": {
    "kind": "flow",
    "variant": "inputs"
  },
  "l5-r-006": {
    "kind": "graph",
    "variant": "potential"
  },
  "l5-r-007": {
    "kind": "graph",
    "variant": "potential"
  },
  "l5-r-013": {
    "kind": "graph",
    "variant": "potential"
  },
  "l5-r-017": {
    "kind": "graph",
    "variant": "potential"
  },
  "l5-r-008": {
    "kind": "formula",
    "variant": "wage"
  },
  "l5-r-009": {
    "kind": "formula",
    "variant": "wage"
  },
  "l5-r-014": {
    "kind": "formula",
    "variant": "wage"
  },
  "l5-r-010": {
    "kind": "graph",
    "variant": "sras"
  },
  "l5-r-011": {
    "kind": "table",
    "variant": "as-schedule"
  },
  "l5-r-012": {
    "kind": "table",
    "variant": "as-schedule"
  },
  "l5-r-015": {
    "kind": "graph",
    "variant": "as-shock"
  },
  "l5-r-016": {
    "kind": "graph",
    "variant": "as-shock"
  },
  "l5-r-018": {
    "kind": "graph",
    "variant": "as-shock"
  },
  "l5-r-020": {
    "kind": "formula",
    "variant": "spending"
  },
  "l5-r-022": {
    "kind": "formula",
    "variant": "spending"
  },
  "l5-r-021": {
    "kind": "flow",
    "variant": "sectors"
  },
  "l5-r-023": {
    "kind": "graph",
    "variant": "ad"
  },
  "l5-r-025": {
    "kind": "graph",
    "variant": "ad"
  },
  "l5-r-024": {
    "kind": "table",
    "variant": "ad-schedule"
  },
  "l5-r-026": {
    "kind": "graph",
    "variant": "ad-shock"
  },
  "l5-r-027": {
    "kind": "graph",
    "variant": "ad-shock"
  },
  "l5-r-028": {
    "kind": "graph",
    "variant": "ad-shock"
  },
  "l5-r-029": {
    "kind": "graph",
    "variant": "ad-shock"
  },
  "l5-r-030": {
    "kind": "flow",
    "variant": "multiplier"
  },
  "l5-r-031": {
    "kind": "flow",
    "variant": "multiplier"
  },
  "l5-r-033": {
    "kind": "table",
    "variant": "equilibrium-schedule"
  },
  "l5-r-034": {
    "kind": "graph",
    "variant": "gap"
  },
  "l5-r-035": {
    "kind": "graph",
    "variant": "inflation-gap"
  },
  "l5-r-036": {
    "kind": "table",
    "variant": "gap-example-1050-1000"
  },
  "l5-r-037": {
    "kind": "table",
    "variant": "worked-schedule"
  },
  "l5-r-038": {
    "kind": "table",
    "variant": "worked-schedule"
  },
  "l5-r-039": {
    "kind": "graph",
    "variant": "recession-gap"
  },
  "l5-r-040": {
    "kind": "flow",
    "variant": "adjustment"
  },
  "l5-r-041": {
    "kind": "flow",
    "variant": "adjustment"
  },
  "l5-r-042": {
    "kind": "flow",
    "variant": "adjustment"
  },
  "l5-m-001": {
    "kind": "graph",
    "variant": "ad-shock"
  },
  "l5-m-002": {
    "kind": "graph",
    "variant": "as-shock"
  },
  "l5-m-010": {
    "kind": "graph",
    "variant": "as-shock"
  },
  "l5-m-011": {
    "kind": "graph",
    "variant": "as-shock"
  },
  "l5-m-013": {
    "kind": "graph",
    "variant": "as-shock"
  },
  "l5-m-003": {
    "kind": "flow",
    "variant": "inputs"
  },
  "l5-m-004": {
    "kind": "graph",
    "variant": "potential"
  },
  "l5-m-009": {
    "kind": "graph",
    "variant": "potential"
  },
  "l5-m-012": {
    "kind": "graph",
    "variant": "potential"
  },
  "l5-m-036": {
    "kind": "graph",
    "variant": "potential"
  },
  "l5-m-039": {
    "kind": "graph",
    "variant": "potential"
  },
  "l5-m-005": {
    "kind": "table",
    "variant": "wage-change"
  },
  "l5-m-006": {
    "kind": "table",
    "variant": "as-schedule"
  },
  "l5-m-007": {
    "kind": "formula",
    "variant": "wage"
  },
  "l5-m-008": {
    "kind": "table",
    "variant": "wage-growth"
  },
  "l5-m-014": {
    "kind": "graph",
    "variant": "sras"
  },
  "l5-m-015": {
    "kind": "formula",
    "variant": "spending-values"
  },
  "l5-m-016": {
    "kind": "formula",
    "variant": "import-increase"
  },
  "l5-m-017": {
    "kind": "table",
    "variant": "ad-schedule"
  },
  "l5-m-018": {
    "kind": "flow",
    "variant": "buying-power"
  },
  "l5-m-019": {
    "kind": "flow",
    "variant": "two-shocks"
  },
  "l5-m-020": {
    "kind": "graph",
    "variant": "ad-shock"
  },
  "l5-m-021": {
    "kind": "graph",
    "variant": "ad-shock"
  },
  "l5-m-022": {
    "kind": "graph",
    "variant": "ad"
  },
  "l5-m-023": {
    "kind": "flow",
    "variant": "multiplier"
  },
  "l5-m-024": {
    "kind": "flow",
    "variant": "multiplier"
  },
  "l5-m-025": {
    "kind": "flow",
    "variant": "multiplier"
  },
  "l5-m-026": {
    "kind": "table",
    "variant": "equilibrium-schedule"
  },
  "l5-m-027": {
    "kind": "table",
    "variant": "equilibrium-schedule"
  },
  "l5-m-028": {
    "kind": "table",
    "variant": "equilibrium-schedule"
  },
  "l5-m-029": {
    "kind": "table",
    "variant": "worked-gap"
  },
  "l5-m-030": {
    "kind": "table",
    "variant": "gap-example-1200-1350"
  },
  "l5-m-031": {
    "kind": "table",
    "variant": "gap-example-14000-13000"
  },
  "l5-m-032": {
    "kind": "graph",
    "variant": "gap-benchmark"
  },
  "l5-m-042": {
    "kind": "graph",
    "variant": "initial-gap"
  },
  "l5-m-033": {
    "kind": "flow",
    "variant": "adjustment"
  },
  "l5-m-034": {
    "kind": "flow",
    "variant": "adjustment"
  },
  "l5-m-035": {
    "kind": "flow",
    "variant": "adjustment"
  },
  "l5-m-037": {
    "kind": "flow",
    "variant": "adjustment"
  },
  "l5-m-038": {
    "kind": "none",
    "variant": "reasoning-only"
  },
  "l5-m-040": {
    "kind": "graph",
    "variant": "supply-ad"
  },
  "l5-m-041": {
    "kind": "graph",
    "variant": "trend"
  }
};
const escape=s=>String(s??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
const figure=(type,inner,caption)=>
 '<figure class="final-question-visual final-v-'+type+'">'+inner+'<figcaption>'+escape(caption)+'</figcaption></figure>';
function table(headers,rows,caption){
 const head='<thead><tr>'+headers.map(h=>'<th scope="col">'+escape(h)+'</th>').join("")+'</tr></thead>';
 const body='<tbody>'+rows.map(row=>'<tr>'+row.map(cell=>'<td>'+escape(cell)+'</td>').join("")+'</tr>').join("")+'</tbody>';
 return figure("table",'<div class="final-visual-table-scroll"><table class="final-visual-table">'+head+body+'</table></div>',caption);
}
function graph(variant,caption){
 const stroke='stroke="var(--final-v-axis)" stroke-width="2" fill="none" stroke-linecap="round"';
 let lines='';
 const line=(d,color,label,x,y,dashed=false,opacity=1)=>{
  lines+='<path d="'+d+'" stroke="'+color+'" stroke-width="3.3" fill="none" stroke-linecap="round" '+
   (dashed?'stroke-dasharray="6 7" ':'')+'opacity="'+opacity+'"/>';
  if(label)lines+='<text x="'+x+'" y="'+y+'" fill="'+color+'" font-size="15" font-weight="700">'+escape(label)+'</text>';
 };
 const potential=()=>line('M302 216 L302 30','var(--final-v-potential)','Yᶠ',311,32,true,.95);
 const gapGraph=(potentialX)=>{
  // Locate the intersection of the actual AD and SRAS segments, not the center of the drawing.
  const x=124+132/(127/318+139/320),y=67+(x-124)*127/318;
  ad();as();
  line('M'+potentialX+' 216 V30','var(--final-v-potential)','Yᶠ',potentialX+8,29,true,.95);
  lines+='<path d="M65 '+y+' H'+x+' V216" stroke="var(--final-v-axis)" stroke-width="1.5" stroke-dasharray="4 4" fill="none"/>'+
   '<circle cx="'+x+'" cy="'+y+'" r="5" fill="var(--final-v-dot)"/>'+
   '<text x="'+(x-10)+'" y="'+(y-11)+'" text-anchor="end" fill="var(--final-v-axis)" font-size="14" font-weight="700">E</text>'+
   '<text x="'+x+'" y="233" text-anchor="middle" fill="var(--final-v-axis)" font-size="15" font-weight="700">Yₑ</text>'+
   '<text x="'+potentialX+'" y="233" text-anchor="middle" fill="var(--final-v-potential)" font-size="15" font-weight="700">Yᶠ</text>'+
   '<path d="M'+Math.min(x,potentialX)+' 243 H'+Math.max(x,potentialX)+'" stroke="var(--final-v-axis)" stroke-width="1.4" fill="none"/>'+
   '<text x="'+((x+potentialX)/2)+'" y="255" text-anchor="middle" fill="var(--final-v-axis)" font-size="12">Output gap</text>';
 };
 const ad=()=>line('M124 67 L442 194','var(--final-v-ad)','AD',447,195);
 const as=()=>line('M124 199 L444 60','var(--final-v-as)','SRAS',444,52);
 let axisLabels=variant==="axes"?"Vertical axis (?)":"Price level (P)";
 let horizontal=variant==="axes"?"Horizontal axis (?)":"Real GDP (Y)";
 switch(variant){
  case "axes":ad();as();break;
  case "equilibrium":ad();as();lines+='<circle cx="283" cy="132" r="5" fill="var(--final-v-dot)"/>';break;
  case "sras":as();lines+='<circle cx="212" cy="161" r="5" fill="var(--final-v-dot)"/><circle cx="365" cy="94" r="5" fill="var(--final-v-dot)"/>';break;
  case "ad":ad();lines+='<circle cx="220" cy="105" r="5" fill="var(--final-v-dot)"/><circle cx="368" cy="164" r="5" fill="var(--final-v-dot)"/>';break;
  case "potential":as();potential();break;
  case "as-shock":ad();as();line('M84 199 L404 60','var(--final-v-ghost)','?',404,55,true,.62);line('M164 199 L484 60','var(--final-v-ghost)','?',480,59,true,.62);break;
  case "ad-shock":as();ad();line('M84 67 L402 194','var(--final-v-ghost)','?',402,198,true,.62);line('M164 67 L482 194','var(--final-v-ghost)','?',476,193,true,.62);break;
  case "recession-gap":case "gap":case "gap-benchmark":case "initial-gap":gapGraph(370);break;
  case "inflation-gap":gapGraph(195);break;
  case "supply-ad":ad();as();line('M84 199 L404 60','var(--final-v-ghost)','?',404,55,true,.62);break;
  case "trend":
   line('M105 183 C195 165 272 125 447 62','var(--final-v-potential)','Potential',394,48,true,.88);
   line('M105 186 C163 165 178 195 243 145 S315 177 354 111 S421 127 447 87','var(--final-v-ad)','Actual GDP',398,104,false,.95);
   break;
  default:as();ad();
 }
 const svg='<svg viewBox="0 0 540 260" role="img" aria-label="'+escape(caption)+'" xmlns="http://www.w3.org/2000/svg">'+
  '<g aria-hidden="true"><path d="M65 24 V216 H513" '+stroke+'/>'+
  '<text x="12" y="15" font-size="13" fill="var(--final-v-axis)">'+escape(axisLabels)+'</text>'+
  '<text x="386" y="252" font-size="13" fill="var(--final-v-axis)">'+escape(horizontal)+'</text>'+
  '<path d="M65 76 H502 M65 142 H502" stroke="var(--final-v-grid)" stroke-width="1" stroke-dasharray="3 7"/>'+
  lines+'</g></svg>';
 return figure("graph",svg,caption||"Conceptual diagram (not to scale). Decide what moves or shifts; dashed alternatives are not answers.");
}
function flow(boxes,caption){
 const wrap='<div class="final-visual-flow" role="img" aria-label="'+escape(boxes.join(" then "))+'">'+
  boxes.map((b,i)=>(i?'<span class="final-visual-arrow" aria-hidden="true">→</span>':"")+
   '<span class="final-visual-step">'+escape(b)+'</span>').join("")+'</div>';
 return figure("flow",wrap,caption);
}
function formula(expr,caption,rows=[]){
 const e='<div class="final-visual-formula">'+escape(expr)+'</div>';
 const data=rows.length?'<div class="final-visual-facts">'+rows.map(x=>
 '<span><b>'+escape(x[0])+'</b> '+escape(x[1])+'</span>').join("")+'</div>':"";
 return figure("formula",e+data,caption);
}
function render(id){
 const spec=SPEC[id];if(!spec||spec.kind==="none")return "";
 const v=spec.variant;
 if(spec.kind==="table"){
  if(v==="as-schedule")return table(["Price level (P)","AS: Real GDP supplied ($T)"],AS_ROWS,"Professor's short-run AS schedule: use the stated price level to read the corresponding real GDP.");
  if(v==="ad-schedule")return table(["Price level (P)","AD: Real GDP demanded ($T)"],AD_ROWS,"Professor's AD schedule: price level and desired real GDP (trillions).");
  if(v==="equilibrium-schedule")return table(["Price level (P)","AD, $T","AS, $T"],[[100,13.5,12],[110,13,13],[120,12.5,14]],"Compare real GDP demanded with real GDP supplied at each price level.");
  if(v==="worked-schedule")return table(["P","AD ($bn)","AS ($bn)"],WORK_ROWS,"Lecture 5 worked equilibrium schedule, with potential GDP Yᶠ = $1,050bn.");
  if(v==="worked-gap")return table(["Potential GDP Yᶠ","Equilibrium P","Real GDP demanded","Real GDP supplied"],[["$1,050bn","110","$1,100bn","$1,100bn"]],"Given values from the professor's worked example. Compare equilibrium real GDP with Yᶠ.");
  if(v==="wage-change")return table(["","Before","After"],[["Money wage W","200","200"],["Price level P","100","125"],["Real wage W/P","?","?"]],"Work out the real wage before and after the price-level change (illustrative numbers in this question).");
  if(v==="wage-growth")return table(["Variable","Initial","Later"],[["Price level P","P₀","P₀ × 1.20"],["Money wage W","W₀","W₀ × 1.20"],["Real wage W/P","?","?"]],"Money wage and price level both change by 20%. Compare the ratios.");
  if(v==="gap-example-1050-1000")return table(["Measure","Real GDP ($bn)"],[["Equilibrium Yₑ","1,000"],["Potential Yᶠ","1,050"],["Output gap","?"]],"Given example: compare equilibrium and potential GDP and find their distance.");
  if(v==="gap-example-1200-1350")return table(["Measure","Real GDP (same units)"],[["Equilibrium Yₑ","1,200"],["Potential Yᶠ","1,350"],["Output gap","?"]],"Given example: compare equilibrium and potential GDP.");
  if(v==="gap-example-14000-13000")return table(["Measure","Real GDP ($T)"],[["Equilibrium Yₑ","14.0"],["Potential Yᶠ","13.0"],["Output gap","?"]],"Given example: compare equilibrium and potential GDP.");
 }
 if(spec.kind==="formula"){
  if(v==="wage")return formula("Real wage = W / P","W is the nominal money wage; P is the overall price level. Use the question's direction of change, not an assumed wage movement.",[["Given:","Short run W fixed unless stated otherwise"]]);
  if(v==="spending")return formula("Real GDP demanded = C + I + G + (X − M)","AD spending identity: household consumption, investment, government spending, exports less imports.");
  if(v==="spending-values")return formula("Yᴰ = C + I + G + X − M","All figures given in the question, in billions.",[["C","500"],["I","150"],["G","200"],["X","80"],["M","130"]]);
  if(v==="import-increase")return formula("Yᴰ = C + I + G + X − M","Other components are held constant; evaluate the effect of the change in imports.",[["Imports","M₁ = M₀ + 25"]]);
 }
 if(spec.kind==="flow"){
  if(v==="inputs")return flow(["Labor","Capital & technology","Land & resources","Entrepreneurship"],"Inputs affecting firms' production plans in the professor's AS definition.");
  if(v==="sectors")return flow(["Households: C","Firms: I","Government: G","Rest of world: X − M"],"Four spending sectors that make up planned real expenditure.");
  if(v==="multiplier")return flow(["Initial ΔI / ΔG","Income changes","Induced spending (?)","Total AD effect (?)"],"The professor's multiplier sequence. Complete the missing steps yourself.");
  if(v==="buying-power")return flow(["Given nominal money","Price level changes","Purchasing power (?)","Real spending (?)"],"Buying-power channel from a change in the overall price level.");
  if(v==="two-shocks")return flow(["Higher foreign tariffs → exports","Lower borrowing cost → investment","Two AD influences","Net impact depends on size"],"Two separate expenditure channels are present; do not assume their sizes are equal.");
  if(v==="adjustment")return flow(["Output gap","Labor market response (?)","Money wage W (?)","SRAS adjustment (?)","New P and Y (?)"],"Long-run self-correction sequence; infer directions from the gap described.");
 }
 if(spec.kind==="graph"){
  const captions={
   axes:"Identify the axes on the professor's AD–AS framework. Labels intentionally withheld for this axis-identification question.",
   equilibrium:"Use the plotted AD and SRAS curves to identify the equilibrium yourself (conceptual, not to scale).",
   sras:"Short-run aggregate supply: compare movements along one curve with changes in the curve itself.",
   ad:"Aggregate demand: consider price level and quantity of real GDP demanded.",
   potential:"Short-run AS compared with the vertical potential-output reference line Yᶠ.",
   "as-shock":"Analyze the supplied change in production inputs or costs. Dotted alternatives mark possible AS shifts, not the correct answer.",
   "ad-shock":"Analyze the supplied expenditure shock. Dotted alternatives mark possible AD shifts, not the correct answer.",
   gap:"Compare equilibrium output Yₑ against the vertical reference Yᶠ.",
   "inflation-gap":"Compare the labeled output coordinates Yₑ and Yᶠ.",
   "gap-benchmark":"E is the AD–SRAS intersection; Yₑ and Yᶠ are different coordinates in this example. They coincide only at full-employment equilibrium.",
   "initial-gap":"Initial equilibrium before the policy change; the final equilibrium depends on the size of the AD shift.",
   "recession-gap":"Compare actual output to potential output; interpret the labor market and possible adjustment.",
   "supply-ad":"Compare an AD movement with an AS shift, keeping the given shock in mind.",
   trend:"Conceptual actual GDP cycle and potential GDP trend. The assumed numeric growth rate is deliberately not shown."
  };
  return graph(v,captions[v]||"Illustrative AD–AS diagram, not to scale.");
 }
 return "";
}
window.D_STUDY_FINAL_L5_VISUAL_AUDIT=Object.freeze(SPEC);
window.D_STUDY_FINAL_L5_RENDER_VISUAL=render;
})();