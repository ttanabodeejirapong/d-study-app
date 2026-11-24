/* Lecture 6 concept diagrams, redrawn from PDF 9, 11, 15, 17–21; practice tables explicitly illustrative. */
(function(){
"use strict";
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const blue="#287db5",green="#16846b",rose="#b85671",purple="#8d75c7";
const txt=(x,y,s,c="currentColor",a="start",size=13)=>'<text x="'+x+'" y="'+y+'" fill="'+c+'" font-size="'+size+'" text-anchor="'+a+'">'+esc(s)+'</text>';
const path=(d,c="currentColor",dash=false,w=3)=>'<path d="'+d+'" fill="none" stroke="'+c+'" stroke-width="'+w+'" stroke-linecap="round" '+(dash?'stroke-dasharray="5 5"':'')+'/>';
const point=(x,y,label)=>'<circle cx="'+x+'" cy="'+y+'" r="4.5" fill="currentColor"/>'+txt(x+9,y-8,label);
const axes=(x,y)=>path("M60 22 V225 H465","currentColor",false,1.7)+txt(9,16,y)+txt(460,253,x,"currentColor","end");
const svg=(content,caption)=>'<svg viewBox="0 0 480 264" role="img" aria-label="'+esc(caption)+'" xmlns="http://www.w3.org/2000/svg">'+content+'</svg>';
const fig=(content,caption)=>'<figure class="final-chart final-question-visual">'+content+'<figcaption>'+esc(caption)+'</figcaption></figure>';
// Clip curve endpoints to the plotting area without changing any intersections.
const curve=(offset,label,rising)=>{
 const y=x=>(rising?206-(x-100)*140/300:66+(x-100)*140/300)+offset;
 let a=100,b=400;
 while((y(a)<33||y(a)>220)&&a<b)a++;
 while((y(b)<33||y(b)>220)&&b>a)b--;
 const color=rising?green:blue;
 return path("M"+a+" "+y(a)+" L"+b+" "+y(b),color)+txt(Math.min(438,b+6),Math.min(219,y(b)+4),label,color);
};
const ad=(offset,label)=>curve(offset,label,false);
const as=(offset,label)=>curve(offset,label,true);
function market(kind,caption){
 let c=axes("Real GDP (Y)","Price level (P)");
 if(kind==="longrun"){c+=path("M250 29 V225",green)+txt(258,34,"LRAS",green)+ad(0,"AD₀")+ad(-54,"AD₁")+point(250,136,"E₀")+point(250,82,"E₁")+txt(250,244,"Yᶠ","currentColor","middle");}
 else if(kind==="trend"){c+=path("M220 30 V225",purple,true)+path("M310 30 V225",purple,true)+txt(220,244,"Yᶠ₀",purple,"middle")+txt(310,244,"Yᶠ₁",purple,"middle")+path("M230 118 H295",purple)+path("M285 110 L295 118 L285 126",purple);}
 else {
  c+=ad(0,kind.startsWith("ad-")?"AD₀":"AD")+as(0,kind.startsWith("as-")?"AS₀":"SRAS")+point(250,136,"E₀");
  if(kind==="ad-up")c+=ad(-56,"AD₁")+point(310,108,"E₁");
  if(kind==="ad-down")c+=ad(56,"AD₁")+point(190,164,"E₁");
  if(kind==="as-down")c+=as(-56,"AS₁")+point(190,108,"E₁");
  if(kind==="as-up")c+=as(56,"AS₁")+point(310,164,"E₁");
  if(kind==="gap")c+=path("M250 28 V225",purple,true,2)+txt(250,245,"Yᶠ",purple,"middle");
 }
 return svg(c,caption);
}
function cycle(){
 const c=axes("Time","Real GDP")+path("M65 183 L455 58",purple,true,2)+path("M65 185 C100 125 125 70 155 70 C185 70 210 125 230 157 C250 190 278 202 295 202 C330 202 350 109 400 70 C423 54 445 60 458 83",blue,false,4)+point(155,70,"A")+point(230,157,"B")+point(295,202,"C")+point(400,70,"D")+txt(360,34,"Potential trend",purple);
 return fig(svg(c,"Business-cycle concept diagram with four labeled points"),"Illustrative business cycle, based on the sequence on PDF p. 9. Not to scale.");
}
function phillips(kind){
 const hide=kind.endsWith("-axes"),long=kind.startsWith("lrpc");
 let c=axes(hide?"Horizontal variable (?)":"Unemployment rate (%)",hide?"Vertical variable (?)":"Inflation rate (% per year)");
 if(long){c+=path("M255 30 V225",purple,false,3)+point(255,155,"E₀")+point(255,69,"E₁")+txt(265,33,"LRPC",purple)+txt(255,244,"uₙ",purple,"middle");}
 else {
  c+=path("M115 40 C150 105 198 139 250 157 C315 179 373 198 435 203",blue,false,4);
  c+=point(250,157,"A")+point(177,117,"B")+point(340,188,"C");
  if(!hide)c+=path("M60 157 H250 V225","currentColor",true,1.2)+txt(54,161,"10", "currentColor","end")+txt(250,244,"6","currentColor","middle");
  c+=txt(425,194,"SRPC",blue,"end");
 }
 return fig(svg(c,"Phillips curve illustration"),hide?"Conceptual redraw. Axis labels intentionally withheld.":"Conceptual redraw of Lecture 6 PDF "+(long?"p. 21.":"p. 19; A corresponds to about 6% unemployment and 10% inflation."));
}
const table=(headers,rows,caption)=>fig('<div class="final-visual-table-scroll"><table class="final-table final-visual-table"><thead><tr>'+headers.map(x=>'<th scope="col">'+esc(x)+'</th>').join("")+'</tr></thead><tbody>'+rows.map(row=>'<tr>'+row.map(x=>'<td>'+esc(x)+'</td>').join("")+'</tr>').join("")+'</tbody></table></div>',caption);
function render(kind){
 if(!kind)return "";
 if(kind==="cycle")return cycle();
 if(kind==="cycle-table")return table(["Year","Real GDP (index)"],[[1,100],[2,106],[3,102],[4,98],[5,103]],"Illustrative practice data, not professor-provided GDP observations.");
 if(kind==="shock-table")return table(["Economy","Change in P","Change in Y"],[["A","↑","↑"],["B","↓","↑"],["C","↑","↓"],["D","↓","↓"]],"Illustrative practice data. Assume one curve shifts and the other stays fixed.");
 if(kind==="deflation-pair")return '<div class="final-compare" style="grid-template-columns:repeat(auto-fit,minmax(245px,1fr))"><div><b>Diagram A</b>'+fig(market("ad-down","Two AD curves; AS fixed"),"Initial and new equilibrium.")+'</div><div><b>Diagram B</b>'+fig(market("as-up","Two AS curves; AD fixed"),"Initial and new equilibrium.")+'</div></div>';
 if(kind.startsWith("srpc")||kind.startsWith("lrpc"))return phillips(kind);
 const captions={baseline:"Initial short-run AD–AS equilibrium; infer the shift from the question.",gap:"Initial equilibrium at the potential-output line.",trend:"Potential-output line at two dates (conceptual).", "ad-up":"Two aggregate demand curves and unchanged AS, PDF p. 15.","ad-down":"Two aggregate demand curves and unchanged AS, PDF p. 18.","as-down":"Two aggregate supply curves and unchanged AD, PDF p. 17.","as-up":"Two aggregate supply curves and unchanged AD, PDF p. 18.",longrun:"Vertical LRAS and two AD curves, PDF p. 21."};
 if(!captions[kind])return "";
 return fig(market(kind,captions[kind]),captions[kind]+" Not to scale.");
}
window.D_STUDY_FINAL_L6_RENDER_FIG=render;
window.D_STUDY_FINAL_L6_RENDER_VISUAL=id=>{
 const q=[...window.D_STUDY_FINAL_L6_QUIZZES.reviewing,...window.D_STUDY_FINAL_L6_QUIZZES.mastering].find(q=>q.id===id);
 return render(q&&q.visual);
};
})();