/* Lecture 8 Fiscal Policy conceptual redraws from the uploaded annotated professor PDF (pp. 7–32).
 * Diagrams are generated for study; source-specific numbers are labeled where used.
 */
(function(){
"use strict";
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const blue="#2f7eb8",green="#238b73",rose="#c45d7d",purple="#8269ae",orange="#c08a38";
const tx=(x,y,t,c="currentColor",a="start",z=12)=>'<text x="'+x+'" y="'+y+'" fill="'+c+'" font-size="'+z+'" text-anchor="'+a+'">'+esc(t)+'</text>';
const path=(d,c="currentColor",w=2,dash="")=>'<path d="'+d+'" fill="none" stroke="'+c+'" stroke-width="'+w+'" stroke-linecap="round" '+(dash?'stroke-dasharray="'+dash+'"':'')+'/>';
const circ=(x,y,r=4,c="currentColor")=>'<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="'+c+'"/>';
const svg=(b,cap,view="0 0 520 280")=>'<svg xmlns="http://www.w3.org/2000/svg" viewBox="'+view+'" role="img" aria-label="'+esc(cap)+'">'+b+'</svg>';
const fig=(body,cap)=>'<figure class="final-chart final-question-visual">'+body+'<figcaption>'+esc(cap)+'</figcaption></figure>';
const table=(heads,rows,cap)=>fig('<div class="final-visual-table-scroll"><table class="final-table final-visual-table"><thead><tr>'+heads.map(h=>'<th scope="col">'+esc(h)+'</th>').join("")+'</tr></thead><tbody>'+rows.map(r=>'<tr>'+r.map(c=>'<td>'+esc(c)+'</td>').join("")+'</tr>').join("")+'</tbody></table></div>',cap);
const axes=(x,y)=>path("M65 25 V235 H490","currentColor",1.6)+tx(12,17,y)+tx(485,260,x,"currentColor","end");
function adas(kind){
 let b=axes("Real GDP (Y)","Price level (P)");
 const ad=(shift,label,col=blue)=>path("M125 "+(55+shift)+" L420 "+(198+shift),col,3)+tx(425,202+shift,label,col);
 const as=()=>path("M125 200 L420 60",green,3)+tx(425,61,"AS",green);
 as();
 if(kind==="gap-choice"){ad(0,"AD");b+=path("M315 29 V235",purple,2.2,"6 5")+tx(322,37,"Yᶠ",purple)+circ(260,121,4.5,rose)+tx(244,109,"Yₑ",rose)+path("M260 121 V235","currentColor",1,"4 5");}
 if(kind==="expansionary"){ad(38,"AD₀",blue);ad(-20,"AD₁",rose);b+=path("M330 28 V235",purple,2.2,"5 5")+tx(337,37,"Yᶠ = 13T",purple)+circ(270,138,4,blue)+tx(248,130,"A: 12T",blue)+circ(330,109,5,rose)+tx(340,103,"C: 13T, P=110",rose)+path("M270 138 V235","currentColor",1,"4 4")+path("M330 109 V235","currentColor",1,"4 4");}
 if(kind==="contractionary"){ad(-28,"AD₀",rose);ad(34,"AD₁",blue);b+=path("M300 28 V235",purple,2.2,"5 5")+tx(307,37,"Yᶠ",purple)+circ(355,99,4.5,rose)+tx(365,92,"Initial Y > Yᶠ",rose)+circ(300,126,5,blue)+tx(309,143,"Toward Yᶠ",blue);}
 return fig(svg(b,kind==="expansionary"?"Expansionary fiscal-policy redraw from PDF p. 21: initial Y=12T, potential Y=13T, final P=110."
 :kind==="contractionary"?"Contractionary fiscal-policy concept redraw based on PDF pp. 25–27."
 :"Identify recessionary/inflationary gaps by comparing equilibrium GDP with potential GDP, PDF pp. 17–18."),kind==="expansionary"?"Expansionary fiscal policy, professor PDF p. 21.":kind==="contractionary"?"Contractionary fiscal policy, professor PDF pp. 25–27.":"Gap diagnosis before choosing fiscal policy, PDF pp. 17–18.");
}
function lf(kind){
 let b=axes("Loanable funds (LF)","Real interest rate (r)");
 const demand=(shift,label,col)=>path("M130 "+(65+shift)+" L410 "+(200+shift),col,3)+tx(418,204+shift,label,col);
 const supply=(shift,label,col)=>path("M130 "+(200+shift)+" L410 "+(65+shift),col,3)+tx(418,66+shift,label,col);
 if(kind==="loanable-deficit"){supply(0,"S",green);demand(25,"D₀",blue);demand(-18,"D₁",rose);b+=tx(120,40,"Deficit borrowing → D for LF ↑",rose)+tx(120,222,"r ↑ → private I ↓",rose);}
 else {demand(0,"D",blue);supply(-18,"S₀",green);supply(24,"S₁",purple);b+=tx(120,40,"Surplus / less borrowing pressure",purple)+tx(120,222,"r ↓ → private I ↑",purple);}
 return fig(svg(b,kind==="loanable-deficit"?"Crowding-out mechanism: deficit borrowing raises loanable-funds demand and real rates.":"Crowding-in mechanism: lower borrowing pressure can reduce real rates."),kind==="loanable-deficit"?"Crowding out, based on professor PDF pp. 22–24.":"Crowding in, based on annotated professor PDF p. 27.");
}
function automatic(){
 let b='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 620 300" role="img" aria-label="Automatic stabiliser flow">';
 const box=(x,y,w,h,t,c)=>'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="12" fill="none" stroke="'+c+'" stroke-width="2.5"/>'+tx(x+w/2,y+h/2+4,t,c,"middle",13);
 const arrow=(x1,y1,x2,y2,c)=>path("M"+x1+" "+y1+" L"+x2+" "+y2,c,2.2)+path("M"+(x2-9)+" "+(y2-6)+" L"+x2+" "+y2+" L"+(x2-9)+" "+(y2+6),c,2.2);
 b+=tx(155,28,"Expansion",green,"middle",15)+box(35,55,120,48,"Income ↑",green)+arrow(155,79,205,79,green)+box(205,55,130,48,"Tax payments ↑",green)+arrow(335,79,385,79,green)+box(385,55,165,48,"Yd & C rise less",green);
 b+=tx(155,166,"Downturn",rose,"middle",15)+box(35,193,120,48,"Income ↓",rose)+arrow(155,217,205,217,rose)+box(205,193,130,48,"Tax payments ↓",rose)+arrow(335,217,385,217,rose)+box(385,193,165,48,"Yd & C fall less",rose);
 b+=tx(310,284,"Result: AD fluctuates less than without the stabiliser",purple,"middle",14)+'</svg>';
 return fig(b,"Income-tax automatic stabiliser mechanism from professor PDF pp. 29–32.");
}
function render(kind){
 if(!kind)return "";
 if(kind==="tools")return table(["Fiscal-policy area","Lecture examples"],[["Budget","Deficit, surplus, balance"],["Taxation","Direct and indirect taxes"],["Expenditure","Government purchases / transfers"],["Public debt","Internal and external borrowing"]],"Fiscal-policy toolkit from professor PDF pp. 7–13.");
 if(kind==="budget")return table(["Budget type","Lecture condition"],[["Deficit","G + transfers > tax collection"],["Surplus","G + transfers < tax collection"],["Balanced","G + transfers = tax collection"]],"Budget definitions from professor PDF p. 8.");
 if(kind==="tax-table")return table(["Direct tax on income","Indirect tax on consumption"],[["Personal income tax","VAT"],["Corporate income tax","Excise tax"],["Wealth tax","Custom duty / service tax"]],"Tax classifications from professor PDF p. 11. Rates on the slide are source examples, not universal legal rules.");
 if(kind==="debt")return table(["Internal borrowing","External borrowing"],[["Treasury bills","Foreign sources / market borrowing"],["Government bonds","World Bank / IMF"],["Borrowing from central bank","Other international sources"]],"Deficit-financing examples from professor PDF p. 13.");
 if(kind==="gap-choice")return adas(kind);
 if(kind==="disc-auto")return table(["Discretionary","Automatic"],[["Intentional change in taxes/G","Triggered by economic conditions"],["Example: new tax cut / spending plan","Example: tax receipts fall as income falls"],["Requires policy choice","Built-in stabiliser"]],"Discretionary vs automatic fiscal policy, professor PDF p. 19.");
 if(kind==="expansionary")return adas(kind);
 if(kind==="crowding-out")return table(["Effect","Direction after expansionary fiscal policy"],[["Initial fiscal impulse","AD ↑"],["Multiplier","Further AD ↑"],["Deficit borrowing","Demand for loanable funds ↑"],["Real interest rate","↑"],["Private investment","↓"],["Net effect","Expansion remains, but partly offset"]],"Multiplier versus crowding-out logic from professor PDF pp. 22–24.");
 if(kind==="loanable-deficit")return lf(kind);
 if(kind==="contractionary")return adas(kind);
 if(kind==="loanable-surplus")return lf(kind);
 if(kind==="limits")return table(["Limitation","Why it matters"],[["Law-making time lag","Policy may arrive late"],["Shrinking discretion","Less room to adjust policy"],["Potential GDP / forecasting","Gap can be mismeasured"],["Crowding-out vs multiplier","Net effect may differ from simple multiplier"]],"Four limitations listed on professor PDF p. 28.");
 if(kind==="automatic")return automatic();
 if(kind==="matrix")return table(["Condition","Policy","Tools","AD","Side effect"],[["Recessionary gap","Expansionary","G ↑ or taxes ↓","Right","Crowding out possible"],["Inflationary gap","Contractionary","G ↓ or taxes ↑","Left","Crowding in possible"]],"Lecture 8 synthesis from professor PDF pp. 20–32.");
 return "";
}
window.D_STUDY_FINAL_L8_RENDER_FIG=render;
window.D_STUDY_FINAL_L8_RENDER_VISUAL=id=>{
 const bank=window.D_STUDY_FINAL_L8_QUIZZES;if(!bank)return "";
 const q=[...bank.reviewing,...bank.mastering].find(x=>x.id===id);
 return render(q&&q.visual);
};
})();