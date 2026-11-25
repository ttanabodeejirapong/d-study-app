/* EC214 Lecture 7 conceptual redraws from the uploaded annotated slides (PDF pp. 10–46).
 * Charts and tables are generated here, not screenshots of the professor's PDF.
 * Values labeled illustrative are exercises, never attributed to the professor.
 */
(function(){
"use strict";
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const blue="#317bb5",green="#238b73",rose="#c45d7d",purple="#8269ae",orange="#c18a38";
const text=(x,y,t,c="currentColor",anchor="start",size=12)=>'<text x="'+x+'" y="'+y+'" fill="'+c+'" font-size="'+size+'" text-anchor="'+anchor+'">'+esc(t)+'</text>';
const path=(d,c="currentColor",w=2,dash="")=>'<path d="'+d+'" fill="none" stroke="'+c+'" stroke-width="'+w+'" stroke-linecap="round" '+(dash?'stroke-dasharray="'+dash+'"':'')+'/>';
const circle=(x,y,r=4,c="currentColor")=>'<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="'+c+'"/>';
const svg=(body,caption,view="0 0 500 272")=>'<svg xmlns="http://www.w3.org/2000/svg" viewBox="'+view+'" role="img" aria-label="'+esc(caption)+'">'+body+'</svg>';
const fig=(body,caption)=>'<figure class="final-chart final-question-visual">'+body+'<figcaption>'+esc(caption)+'</figcaption></figure>';
const axes=(xLabel,yLabel)=>path("M64 27 V230 H478","currentColor",1.7)+text(12,16,yLabel)+text(475,255,xLabel,"currentColor","end");
const table=(heads,rows,cap)=>fig('<div class="final-visual-table-scroll"><table class="final-table final-visual-table"><thead><tr>'+heads.map(h=>'<th scope="col">'+esc(h)+'</th>').join("")+'</tr></thead><tbody>'+rows.map(row=>'<tr>'+row.map(cell=>'<td>'+esc(cell)+'</td>').join("")+'</tr>').join("")+'</tbody></table></div>',cap);
const simple=(t,body)=>fig('<div class="final-lecture7-equation">'+body+'</div>',t);
function consumer(kind){
 const X=y=>78+28*y,Y=c=>228-16*c;
 let lines=axes("Disposable income (Yd)","Consumption (C)")+path("M"+X(0)+" "+Y(0)+" L"+X(12)+" "+Y(12),"currentColor",1.4,"5 4");
 for(const y of [0,3,6,9,12])lines+=text(X(y),247,String(y),"currentColor","middle",11);
 for(const c of [0,2,4,6,8,10,12])lines+=text(66,Y(c)+4,String(c),"currentColor","end",10);
 const cy=y=>2+(2/3)*y;
 if(kind==="consumption-shift"){
  for(const [d,label,color] of [[-2,"CF₂",rose],[0,"CF₀",blue],[2,"CF₁",green]]){lines+=path("M"+X(0)+" "+Y(cy(0)+d)+" L"+X(12)+" "+Y(cy(12)+d),color,3)+text(X(12)+5,Y(cy(12)+d)+4,label,color)}
 }else{
  lines+=path("M"+X(0)+" "+Y(cy(0))+" L"+X(12)+" "+Y(cy(12)),blue,3.5);
  [0,3,6,9,12].forEach((x,i)=>{lines+=circle(X(x),Y(cy(x)),4,blue)+text(X(x)+6,Y(cy(x))-8,"ABCDE"[i],blue)});
  if(kind==="mpc-slope"){lines+=path("M"+X(6)+" "+Y(6)+" H"+X(9)+" V"+Y(8),rose,2.5)+text(X(6)+43,Y(6)-8,"ΔYd = 3",rose)+text(X(9)+9,Y(7),"ΔC = 2",rose)}
  if(kind==="consumption"){lines+=text(164,211,"C > Yd: dissaving",rose)+text(322,214,"C < Yd: saving",green)}
  lines+=text(405,44,"45°",purple);
 }
 const cap=kind==="mpc-slope"?"Professor's consumption schedule, PDF pp. 17–19: ΔYd = 3, ΔC = 2, MPC = 2/3."
 :kind==="consumption-shift"?"Other influences shift the entire consumption function at unchanged disposable income, PDF p. 20."
 :"Professor's consumption graph: intercept $2T, 45° saving benchmark, PDF pp. 14–15.";
 return fig(svg(lines,cap),cap);
}
function turtle(){
 const x=y=>75+29*y,y=c=>230-29*c,ae=v=>2+0.6*v;let a=axes("Real GDP ($b)","Planned AE ($b)");
 a+=path("M"+x(0)+" "+y(0)+" L"+x(8)+" "+y(8),"currentColor",1.5,"5 4");
 a+=path("M"+x(0)+" "+y(ae(0))+" L"+x(8)+" "+y(ae(8)),rose,3.5);
 [0,2,4,5,6,8].forEach(v=>{a+=text(x(v),246,v,"currentColor","middle",11)});
 [0,2,4,6,8].forEach(v=>a+=text(65,y(v)+3,v,"currentColor","end",11));
 for(const v of [0,2,4,6,8]){a+=circle(x(v),y(ae(v)),3.6,rose)}
 a+=circle(x(5),y(5),5,green)+text(x(5)+9,y(5)-8,"E: Y = 5",green);
 a+=text(x(6)+8,y(5.6)-7,"(6, 5.6)",rose);
 const cap="Turtle Island AE = 2 + 0.6Y ($b), reconstructed from the professor's example on PDF pp. 22, 30–31.";
 return fig(svg(a,cap),cap);
}
function ae(kind){
 const x=y=>75+45*(y-11),vy=y=>227-36*(y-11);
 const cross=val=>path("M"+x(11)+" "+vy(11)+" L"+x(16)+" "+vy(16),"currentColor",1.5,"5 4");
 const am=val=>13+0.5*(val-13);
 let s=axes("Real GDP ($T)","Planned AE ($T)")+cross();
 for(const v of [11,12,13,14,15,16]){s+=text(x(v),247,v,"currentColor","middle",11)}
 for(const v of [11,13,15])s+=text(65,vy(v)+4,v,"currentColor","end",11);
 if(kind==="ae-shift"){
  const fn=(Y,index)=>13+(index?0.75:0.75)*(Y-13)+(index?0.5:0);
  for(const [i,col,label] of [[0,blue,"AE₀"],[1,rose,"AE₁"]]){
   s+=path("M"+x(11)+" "+vy(fn(11,i))+" L"+x(16)+" "+vy(fn(16,i)),col,3)+text(x(16)+5,vy(fn(16,i))+4,label,col);
  }
  for(const [v,col,n] of [[13,blue,"E₀"],[15,rose,"E₁"]]){
   s+=circle(x(v),vy(v),4.5,col)+text(x(v)+7,vy(v)-9,n,col);
   s+=path("M"+x(v)+" "+vy(v)+" V230","currentColor",1,"4 5");
  }
  const cap="Autonomous investment +$0.5T shifts AE upward; equilibrium GDP rises $13T to $15T (multiplier 4), PDF p. 37.";
  return fig(svg(s,cap),cap);
 }
 if(kind==="inventory-cross"){
  s+=path("M"+x(11)+" "+vy(am(11))+" L"+x(16)+" "+vy(am(16)),blue,3.3);
  s+=circle(x(13),vy(13),4.5,green)+text(x(13)+9,vy(13)-11,"E",green);
  s+=circle(x(12),vy(am(12)),3.7,rose)+circle(x(14),vy(am(14)),3.7,rose);
  s+=text(88,62,"AE > Y: inventories ↓",green)+text(275,204,"AE < Y: inventories ↑",rose);
 }else{
  s+=path("M"+x(11)+" "+vy(am(11))+" L"+x(16)+" "+vy(am(16)),blue,3.3);
  s+=circle(x(13),vy(13),4.7,green)+text(x(13)+9,vy(13)-9,"E (13, 13)",green);
 }
 const cap=kind==="inventory-cross"?"Planned spending above/below the 45° line gives opposite inventory signals, PDF pp. 26–28."
 :"Lecture 7's AE intersection at $13T equilibrium output, PDF pp. 24, 26.";
 return fig(svg(s,cap),cap);
}
function aeAd(){
 const left=80,xx=y=>left+(y-11)*67, yy=val=>245-(val-11)*33;
 let s=path("M65 28 V245 H500","currentColor",1.5)+text(10,19,"AE ($T)")+text(493,262,"Real GDP (Y)","currentColor","end");
 const cross=val=>val;
 s+=path("M"+xx(11)+" "+yy(11)+" L"+xx(16)+" "+yy(16),"currentColor",1.4,"5 4");
 const eq=[13,14,15];
 for(let i=0;i<3;i++){
  const color=[rose,blue,green][i],val=eq[i],f=y=>val+0.5*(y-val);
  s+=path("M"+xx(11)+" "+yy(f(11))+" L"+xx(16)+" "+yy(f(16)),color,3)+text(xx(16)+6,yy(f(16))+3,"AE"+["₁","₀","₂"][i],color);
  s+=circle(xx(val),yy(val),4.5,color)+text(xx(val)+8,yy(val)-8,""+["A","B","C"][i],color);
  s+=path("M"+xx(val)+" "+yy(val)+" V245","currentColor",1,"3 5");
 }
 const adY=p=>495-(p-70)*1.45;
 s+=path("M65 303 V500 H500","currentColor",1.5)+text(12,293,"P (price index)")+text(495,525,"Real GDP (Y)","currentColor","end");
 s+=path("M"+xx(13)+" "+adY(130)+" L"+xx(15)+" "+adY(90),blue,3.5);
 for(const [p,y,label,col] of [[130,13,"A",rose],[110,14,"B",blue],[90,15,"C",green]]){
  s+=circle(xx(y),adY(p),4.5,col)+text(xx(y)+7,adY(p)-8,label,col)+text(61,adY(p)+4,String(p),"currentColor","end")+
   path("M65 "+adY(p)+" H"+xx(y)+" V500","currentColor",1,"4 4")+text(xx(y),516,String(y),"currentColor","middle");
 }
 s+=text(xx(15)+11,adY(90)+9,"AD",blue);
 const caption="AE–AD derivation: P130→Y13T, P110→Y14T, P90→Y15T, professor PDF pp. 45–46. Curves redrawn.";
 return fig(svg(s,caption,"0 0 550 545"),caption);
}
function rounds(){
 const c=axes("Successive spending rounds","Spending added ($m)");
 const vals=[5,3.5,2.45,1.715];
 let s=c;
 vals.forEach((v,i)=>{let x=105+i*94,h=v*26;s+='<rect x="'+x+'" y="'+(230-h)+'" width="52" height="'+h+'" rx="5" fill="'+[blue,green,orange,purple][i]+'"/>'+text(x+26,230-h-7,v.toFixed(2),"currentColor","middle")+text(x+26,246,"Round "+(i+1),"currentColor","middle",10)});
 return fig(svg(s,"Illustrative expenditure rounds with MPC 0.70; later rounds shown for mechanism."),"Illustrative propagation with MPC 0.70, based on PDF pp. 4, 35–36; not the source's two-round fiscal table.");
}
function gap(){
 let s=axes("Real GDP (Y)","Price level (P)")+path("M110 175 L380 58",green,3)+path("M110 62 L385 179",blue,3)+path("M310 27 V230",purple,2.2,"5 5");
 s+=text(392,179,"AD",blue)+text(387,58,"AS",green)+text(318,36,"Yᶠ",purple)+circle(246,120,4.5,rose)+text(227,110,"Yₑ",rose);
 return fig(svg(s,"Aggregate-demand and supply concept map comparing actual and potential GDP."),"Output-gap context from annotated PDF p. 3; conceptual redraw, not a quiz answer key.");
}
function render(kind){
 if(!kind)return "";
 if(kind==="ae-components")return table(["AE component","Meaning"],[["C","Consumption"],["I","Investment"],["G","Government goods/services"],["NX = X − M","Net exports"]],"AE = C + I + G + (X − M), Lecture 7 PDF p. 10.");
 if(kind==="ae-split")return table(["Autonomous (not dependent on current Y)","Induced (changes with current Y)"],[["Investment I","Consumption C (induced part)"],["Government purchases G","Imports M"],["Exports X","Autonomous parts of C/M also possible"]],"Classification in the annotated PDF pp. 11–12.");
 if(["consumption","mpc-slope","consumption-shift"].includes(kind))return consumer(kind);
 if(kind==="mpc-table")return table(["Disposable income ($T)","Consumption ($T)"],[[0,2],[3,4],[6,6],[9,8],[12,10]],"The professor's consumption schedule (PDF pp. 14, 17–19): ΔC/ΔYd = 2/3.");
 if(kind==="import-leakage")return simple("Income-dependent imports, PDF p. 21",'<b>MPI = ΔM / ΔY</b><p>Imports increase when domestic real GDP increases and subtract from net exports.</p>');
 if(kind==="import-table")return table(["Observed change (illustrative)","Amount"],[["Δ real GDP","+$10 billion"],["Δ imports","+$2 billion"]],"Original practice data applying professor's MPI definition (PDF p. 21).");
 if(kind==="turtle")return turtle();
 if(kind==="turtle-table")return table(["Real GDP ($b)","Planned AE ($b)"],[[0,2],[2,3.2],[4,4.4],[6,5.6],[8,6.8]],"Turtle Island reconstructed AE = 2 + 0.6Y (PDF pp. 22, 30–31).");
 if(kind==="ae-table")return table(["Real GDP Y ($T)","AE ($T)","AE − Y ($T)"],[[12,12.5,"+0.5"],[13,13,"0"],[14,13.5,"−0.5"],[15,14,"−1.0"]],"Professor's planned expenditure schedule (PDF p. 24).");
 if(["ae-equilibrium","inventory-cross","ae-shift"].includes(kind))return ae(kind);
 if(kind==="rounds")return rounds();
 if(kind==="fiscal-table")return table(["Route, $5m budget","Round 1 GDP","Round 2 GDP","Two rounds"],[["Government purchases","$5.00m","$3.50m","$8.50m"],["Transfer payment","$3.50m","$2.45m","$5.95m"]],"Professor's *two-round* classroom example (PDF pp. 35–36), not the full infinite-series multiplier.");
 if(kind==="formula")return simple("Simple expenditure multiplier, PDF pp. 40–41",'<p><b>ΔY = ΔC + ΔI</b></p><p><b>ΔC = MPC × ΔY</b></p><p><b>Multiplier = 1 / (1 − MPC)</b></p><small>Only the stated closed-economy case without imports/income taxes.</small>');
 if(kind==="multiplier-table")return table(["Change (practice scenario)","Amount"],[["Δ autonomous spending","−$40 billion"],["Δ equilibrium GDP","−$200 billion"]],"Original practice amounts, following the professor's multiplier definition (PDF p. 39).");
 if(kind==="ae-ad")return aeAd();
 if(kind==="ad-schedule")return table(["P","AE curve","Equilibrium real GDP"],[[130,"AE₁","$13T"],[110,"AE₀","$14T"],[90,"AE₂","$15T"]],"Professor's AE-to-AD points, PDF pp. 45–46.");
 if(kind==="gap-context")return gap();
 return "";
}
window.D_STUDY_FINAL_L7_RENDER_FIG=render;
window.D_STUDY_FINAL_L7_RENDER_VISUAL=id=>{
 const bank=window.D_STUDY_FINAL_L7_QUIZZES;
 if(!bank)return "";
 const q=[...bank.reviewing,...bank.mastering].find(x=>x.id===id);
 return render(q&&q.visual);
};
})();
