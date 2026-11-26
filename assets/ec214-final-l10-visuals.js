/* Lecture 10 Monetary Policy visuals, conceptually redrawn from the uploaded professor PDF.
 * Summary figures teach the content. Quiz figures are restricted to interpretation tasks so they do not act as answer keys.
 */
(function(){
"use strict";
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const blue="#2f7eb8",green="#238b73",rose="#c45d7d",purple="#8269ae",orange="#c08a38";
const tx=(x,y,t,c="currentColor",a="start",z=12)=>'<text x="'+x+'" y="'+y+'" fill="'+c+'" font-size="'+z+'" text-anchor="'+a+'">'+esc(t)+'</text>';
const path=(d,c="currentColor",w=2,dash="")=>'<path d="'+d+'" fill="none" stroke="'+c+'" stroke-width="'+w+'" stroke-linecap="round" '+(dash?'stroke-dasharray="'+dash+'"':'')+'/>';
const circ=(x,y,r=4,c="currentColor")=>'<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="'+c+'"/>';
const svg=(b,cap,view="0 0 540 300")=>'<svg xmlns="http://www.w3.org/2000/svg" viewBox="'+view+'" role="img" aria-label="'+esc(cap)+'">'+b+'</svg>';
const fig=(body,cap)=>'<figure class="final-chart final-question-visual">'+body+'<figcaption>'+esc(cap)+'</figcaption></figure>';
const table=(heads,rows,cap)=>fig('<div class="final-visual-table-scroll"><table class="final-table final-visual-table"><thead><tr>'+heads.map(h=>'<th scope="col">'+esc(h)+'</th>').join("")+'</tr></thead><tbody>'+rows.map(r=>'<tr>'+r.map(c=>'<td>'+esc(c)+'</td>').join("")+'</tr>').join("")+'</tbody></table></div>',cap);
const axes=(x,y)=>path("M68 28 V245 H505","currentColor",1.6)+tx(12,18,y)+tx(500,274,x,"currentColor","end");
const arr=(x1,y1,x2,y2,c="currentColor")=>path("M"+x1+" "+y1+" L"+x2+" "+y2,c,2.1)+path("M"+(x2-9)+" "+(y2-6)+" L"+x2+" "+y2+" L"+(x2-9)+" "+(y2+6),c,2.1);
const box=(x,y,w,h,t,c)=>'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="10" fill="none" stroke="'+c+'" stroke-width="2.2"/>'+tx(x+w/2,y+h/2+4,t,c,"middle",12);

function overview(){
 return table(["Policy family","Main tools / focus"],[
  ["Fiscal policy","Budget, taxation, public debt/expenditure"],
  ["Monetary policy","Money supply, exchange rate, interest rate"]
 ],"Government-policy map from professor PDF p. 4.");
}
function priceStability(){
 let b='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 650 220" role="img" aria-label="Price stability transmission">';
 b+=box(30,75,150,55,"Monetary policy",blue)+arr(180,103,245,103,blue)+box(245,75,150,55,"Price stability",green)+arr(395,103,460,103,green)+box(460,75,160,55,"Sustainable growth",purple);
 b+=tx(325,174,"Low and stable inflation supports planning, saving and investment","currentColor","middle",13)+'</svg>';
 return fig(b,"Professor's price-stability logic, PDF p. 16.");
}
function tools(){
 return table(["Tool","Expansionary direction","Contractionary direction"],[
  ["Required reserve ratio","Lower","Raise"],
  ["Discount rate","Lower","Raise"],
  ["Open-market operation","Buy bonds","Sell bonds"]
 ],"Standard monetary-policy tools summarized from professor PDF pp. 10–11.");
}
function rrDr(){
 let b='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 650 250" role="img" aria-label="Bank reserve and lending mechanism">';
 b+=tx(325,30,"Banking-system transmission",purple,"middle",16);
 b+=box(35,70,135,50,"Reserve requirement",blue)+arr(170,95,230,95,blue)+box(230,70,135,50,"Funds available",green)+arr(365,95,425,95,green)+box(425,70,150,50,"Bank lending",orange);
 b+=box(35,155,135,50,"Discount rate",rose)+arr(170,180,230,180,rose)+box(230,155,135,50,"Reserve borrowing",purple)+arr(365,180,425,180,purple)+box(425,155,150,50,"Bank lending",orange);
 b+=tx(325,235,"Direction depends on whether the policy rate/requirement is raised or lowered.","currentColor","middle",12)+'</svg>';
 return fig(b,"Mechanism map based on annotated professor PDF p. 11.");
}
function omo(){
 let b='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 650 245" role="img" aria-label="Open market operation">';
 b+=tx(325,28,"Open-market operation",purple,"middle",16);
 b+=box(45,70,145,55,"Central bank",blue)+arr(190,96,260,96,blue)+box(260,70,130,55,"Bond market",orange)+arr(390,96,460,96,green)+box(460,70,145,55,"Money balances",green);
 b+=tx(325,168,"Bond purchases inject money; bond sales withdraw money.","currentColor","middle",13);
 b+=tx(325,205,"This is a deliberate central-bank operation, not a private equilibrium adjustment.","currentColor","middle",12)+'</svg>';
 return fig(b,"Open-market-operation concept from professor PDF pp. 10–11.");
}
function crisis(){
 return table(["Extraordinary tool","What the professor defines"],[
  ["Quantitative easing","Large-scale open-market purchases creating bank reserves at very low/zero policy rates"],
  ["Credit easing","Buy private securities or lend to financial institutions to stimulate lending"],
  ["Operation Twist","Buy long-term government securities and sell short-term securities"]
 ],"Extraordinary crisis measures from professor PDF pp. 12–14.");
}
function channels(){
 let b='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 330" role="img" aria-label="Five monetary policy transmission channels">';
 b+=box(275,25,170,52,"Policy interest rate",purple);
 const items=[["Interest-rate",70,130,blue],["Asset-price",220,130,green],["Exchange-rate",370,130,orange],["Credit",520,130,rose],["Expectations",295,220,purple]];
 for(const item of items){const t=item[0],x=item[1],y=item[2],c=item[3];b+=box(x,y,130,48,t,c);b+=arr(360,77,x+65,y,c)}
 b+=arr(360,268,360,305,purple)+tx(360,322,"Consumption / Investment / Net exports → GDP & inflation","currentColor","middle",13)+'</svg>';
 return fig(b,"Five transmission channels developed in professor PDF pp. 21–27.");
}
function interestAsset(){
 let b='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 690 270" role="img" aria-label="Interest and asset-price channels">';
 b+=tx(180,25,"Interest-rate channel",blue,"middle",15)+box(35,55,120,48,"Policy r ↓",blue)+arr(155,79,210,79,blue)+box(210,55,155,48,"Borrowing cost ↓",green)+arr(365,79,420,79,green)+box(420,55,170,48,"C / I respond",orange);
 b+=tx(180,155,"Asset-price channel",purple,"middle",15)+box(35,185,120,48,"Policy r ↓",purple)+arr(155,209,210,209,purple)+box(210,185,155,48,"Asset prices ↑",rose)+arr(365,209,420,209,rose)+box(420,185,170,48,"Wealth / spending",green);
 return fig(b,"Concept redraw of professor PDF pp. 22–23.");
}
function exchangeCredit(){
 let b='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 330" role="img" aria-label="Exchange-rate and credit channels">';
 b+=tx(360,25,"Exchange-rate channel",blue,"middle",15)+box(35,55,110,45,"Domestic r ↓",blue)+arr(145,78,195,78,blue)+box(195,55,150,45,"Asset return ↓",orange)+arr(345,78,395,78,orange)+box(395,55,140,45,"Baht weakens",rose)+arr(535,78,585,78,rose)+box(585,55,105,45,"NX changes",green);
 b+=tx(360,150,"Professor's illustrative exchange rate","currentColor","middle",13)+tx(360,178,"30 baht / US$  →  35 baht / US$","rose","middle",16);
 b+=tx(360,225,"Credit channel",purple,"middle",15)+box(85,250,130,45,"Loan rate ↓",purple)+arr(215,273,285,273,purple)+box(285,250,150,45,"Borrowing ↑",green)+arr(435,273,505,273,green)+box(505,250,130,45,"C / I respond",orange);
 return fig(b,"Exchange-rate and credit channels based on professor PDF pp. 24–26.");
}
function expectations(){
 let b='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 650 250" role="img" aria-label="Expectations channel">';
 b+=box(45,80,140,52,"Bad economy",rose)+arr(185,106,250,106,rose)+box(250,80,155,52,"Confidence ↓",rose)+arr(405,106,470,106,rose)+box(470,80,140,52,"C / I weak",rose);
 b+=tx(325,175,"A rate cut may be less effective when expectations remain pessimistic.","currentColor","middle",13);
 b+=tx(325,210,"Policy communication/confidence can matter for transmission.","purple","middle",12)+'</svg>';
 return fig(b,"Expectations-channel warning from professor PDF p. 27.");
}
function policyChain(kind){
 let b='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 300" role="img" aria-label="Monetary policy chain">';
 const exp=kind!=="contraction";
 const labels=exp?["MS ↑","r ↓","I / C ↑","AD → right","Y ↑, P ↑"]:["MS ↓","r ↑","I / C ↓","AD → left","Y ↓, P pressure ↓"];
 const cols=[purple,blue,green,orange,rose];
 labels.forEach((t,i)=>{const x=25+i*145;b+=box(x,95,115,55,t,cols[i]);if(i<4)b+=arr(x+115,123,x+145,123,cols[i])});
 b+=tx(380,210,exp?"Expansionary monetary policy":"Contractionary monetary policy","currentColor","middle",16);
 if(exp)b+=tx(380,243,"Multiplier can magnify the final AD movement.","purple","middle",12);
 return fig(b,exp?"Expansionary policy chain from professor PDF pp. 28–31.":"Contractionary policy chain from professor PDF p. 32.");
}
function tradeoff(){
 let b=axes("Unemployment rate","Inflation rate");
 b+=path("M130 70 C200 125 310 185 445 210",blue,3.2)+tx(452,211,"SRPC",blue);
 b+=circ(220,135,4.5,rose)+circ(365,190,4.5,green);
 b+=tx(208,122,"A",rose)+tx(374,178,"B",green);
 b+=tx(305,48,"Short run: move along trade-off as AD changes","purple","middle",13);
 return fig(svg(b,"Short-run inflation-unemployment trade-off, conceptual redraw of professor PDF pp. 33–34."),"Short-run trade-off: lower unemployment comes with higher inflation pressure, and vice versa.");
}
function longrun(){
 let b=axes("Real GDP","Price level");
 b+=path("M300 30 V245",green,3)+tx(308,42,"LRAS",green)+path("M125 70 L430 210",blue,3)+path("M165 45 L470 185",rose,3);
 b+=tx(437,212,"AD₀",blue)+tx(476,187,"AD₁",rose)+circ(300,152,4.5,blue)+circ(300,132,4.5,rose)+tx(300,265,"Yᶠ","currentColor","middle",12);
 return fig(svg(b,"Long-run AD shift at full-employment output."),"Professor's long-run point: AD can change the price level without permanently changing real GDP.");
}
function render(kind){
 if(!kind)return "";
 if(kind==="overview")return overview();
 if(kind==="price-stability")return priceStability();
 if(kind==="standard-tools")return tools();
 if(kind==="rr-dr")return rrDr();
 if(kind==="omo")return omo();
 if(kind==="crisis-tools")return crisis();
 if(kind==="channels")return channels();
 if(kind==="interest-asset")return interestAsset();
 if(kind==="exchange-credit")return exchangeCredit();
 if(kind==="expectations")return expectations();
 if(kind==="policy-chain")return policyChain("expansion");
 if(kind==="contraction-chain")return policyChain("contraction");
 if(kind==="tradeoff")return tradeoff();
 if(kind==="longrun")return longrun();
 return "";
}
window.D_STUDY_FINAL_L10_RENDER_FIG=render;
const safe={
 "l10-r-008":"rr-dr","l10-r-009":"rr-dr",
 "l10-r-017":"interest-asset","l10-r-018":"interest-asset",
 "l10-r-019":"exchange-credit","l10-r-020":"exchange-credit","l10-r-021":"exchange-credit","l10-r-022":"exchange-credit","l10-r-023":"exchange-credit",
 "l10-r-024":"expectations","l10-r-025":"policy-chain","l10-r-026":"contraction-chain","l10-r-027":"policy-chain",
 "l10-r-028":"tradeoff","l10-r-029":"tradeoff","l10-r-030":"longrun",
 "l10-m-003":"rr-dr","l10-m-004":"rr-dr","l10-m-005":"rr-dr",
 "l10-m-012":"interest-asset","l10-m-013":"interest-asset",
 "l10-m-014":"exchange-credit","l10-m-015":"exchange-credit","l10-m-016":"exchange-credit",
 "l10-m-017":"expectations","l10-m-018":"expectations",
 "l10-m-019":"policy-chain","l10-m-020":"policy-chain","l10-m-021":"policy-chain","l10-m-022":"contraction-chain",
 "l10-m-025":"tradeoff","l10-m-026":"tradeoff","l10-m-027":"longrun",
 "l10-m-028":"exchange-credit","l10-m-029":"channels","l10-m-030":"price-stability"
};
window.D_STUDY_FINAL_L10_RENDER_VISUAL=id=>render(safe[id]||"");
})();