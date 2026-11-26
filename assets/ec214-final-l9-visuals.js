/* Lecture 9 Money and Inflation conceptual redraws from uploaded professor PDF (pp. 4–36).
 * Generated study diagrams/tables, not screenshots. Source-specific values are labeled.
 */
(function(){
"use strict";
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const blue="#2f7eb8",green="#238b73",rose="#c45d7d",purple="#8269ae",orange="#c08a38";
const tx=(x,y,t,c="currentColor",a="start",z=12)=>'<text x="'+x+'" y="'+y+'" fill="'+c+'" font-size="'+z+'" text-anchor="'+a+'">'+esc(t)+'</text>';
const path=(d,c="currentColor",w=2,dash="")=>'<path d="'+d+'" fill="none" stroke="'+c+'" stroke-width="'+w+'" stroke-linecap="round" '+(dash?'stroke-dasharray="'+dash+'"':'')+'/>';
const circ=(x,y,r=4,c="currentColor")=>'<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="'+c+'"/>';
const svg=(b,cap,view="0 0 520 285")=>'<svg xmlns="http://www.w3.org/2000/svg" viewBox="'+view+'" role="img" aria-label="'+esc(cap)+'">'+b+'</svg>';
const fig=(body,cap)=>'<figure class="final-chart final-question-visual">'+body+'<figcaption>'+esc(cap)+'</figcaption></figure>';
const table=(heads,rows,cap)=>fig('<div class="final-visual-table-scroll"><table class="final-table final-visual-table"><thead><tr>'+heads.map(h=>'<th scope="col">'+esc(h)+'</th>').join("")+'</tr></thead><tbody>'+rows.map(r=>'<tr>'+r.map(c=>'<td>'+esc(c)+'</td>').join("")+'</tr>').join("")+'</tbody></table></div>',cap);
const axes=(x,y)=>path("M68 25 V235 H492","currentColor",1.6)+tx(14,17,y)+tx(487,260,x,"currentColor","end");
function md(kind){
 let b=axes("Quantity of money ($T)","Nominal interest rate (%)");
 const X=q=>100+(q-0.96)*900,Y=r=>225-(r-3.5)*55;
 const line=(shift=0,label="MD",col=blue)=>path("M"+X(.975+shift)+" "+Y(6.5)+" L"+X(1.035+shift)+" "+Y(3.7),col,3)+tx(X(1.035+shift)+5,Y(3.7)+3,label,col);
 if(kind==="md-shift"){b+=line(0,"MD₀",blue)+line(.025,"MD₁",rose)+tx(112,48,"P or Y ↑ → MD right",rose);}
 else {b+=line();for(const [r,q,l] of [[6,.98,"A"],[5,1.00,"B"],[4,1.02,"C"]]){b+=circ(X(q),Y(r),4.5,blue)+tx(X(q)+8,Y(r)-8,l,blue)+tx(61,Y(r)+4,String(r),"currentColor","end",11)+tx(X(q),251,q.toFixed(2),"currentColor","middle",11)}}
 return fig(svg(b,kind==="md-shift"?"Money-demand shift from a non-interest-rate influence, based on professor PDF pp. 18–19.":"Professor's money-demand schedule: r 6%→Md .98T, 5%→1.00T, 4%→1.02T, PDF pp. 15–17."),kind==="md-shift"?"Money demand shifts when price level, real GDP or financial technology changes.":"Money demand and the opportunity cost of holding money.");
}
function market(kind){
 let b=axes("Quantity of money ($T)","Nominal interest rate (%)");
 const X=q=>100+(q-.96)*900,Y=r=>225-(r-3.5)*55;
 const demand=()=>path("M"+X(.975)+" "+Y(6.5)+" L"+X(1.035)+" "+Y(3.7),blue,3)+tx(X(1.035)+6,Y(3.7)+4,"MD",blue);
 const supply=(q,label,col)=>path("M"+X(q)+" "+Y(6.7)+" V"+Y(3.6),col,3)+tx(X(q)+6,Y(6.65),label,col);
 for(const r of [6,5,4]){b+=path("M62 "+Y(r)+" H68","currentColor",1)+tx(56,Y(r)+4,String(r),"currentColor","end",11)}
 for(const q of [.98,1.00,1.02]){b+=path("M"+X(q)+" 235 V241","currentColor",1)+tx(X(q),257,q.toFixed(2),"currentColor","middle",11)}
 for(const [r,q] of [[6,.98],[5,1.00],[4,1.02]]){b+=path("M68 "+Y(r)+" H"+X(q),"currentColor",.8,"3 5")+path("M"+X(q)+" "+Y(r)+" V235","currentColor",.8,"3 5")}
 b+=demand();
 if(kind==="ms-shift"){b+=supply(.98,"MS₀",rose)+supply(1.00,"MS₁",blue)+supply(1.02,"MS₂",green)+tx(X(.98)-4,Y(6)-8,"6%",rose,"end")+tx(X(1.00)-5,Y(5)-8,"5%",blue,"end")+tx(X(1.02)+7,Y(4)-8,"4%",green);}
 else {b+=supply(1.00,"MS",purple);for(const [r,q,l,col] of [[6,.98,"A",rose],[5,1.00,"E",green],[4,1.02,"C",orange]])b+=circ(X(q),Y(r),4.5,col)+tx(X(q)+8,Y(r)-8,l,col);}
 return fig(svg(b,kind==="ms-shift"?"Central-bank money-supply changes and nominal interest rate, professor PDF p. 27.":"Money-market equilibrium at approximately r=5% and M=$1.00T, professor PDF p. 22."),kind==="ms-shift"?"Increase MS → r falls; decrease MS → r rises.":"Short-run money-market equilibrium.");
}
function bond(){
 let b='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 650 300" role="img" aria-label="Bond market adjustment">';
 const box=(x,y,w,h,t,c)=>'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="11" fill="none" stroke="'+c+'" stroke-width="2.5"/>'+tx(x+w/2,y+h/2+4,t,c,"middle",13);
 const arr=(x1,y1,x2,y2,c)=>path("M"+x1+" "+y1+" L"+x2+" "+y2,c,2.2)+path("M"+(x2-9)+" "+(y2-6)+" L"+x2+" "+y2+" L"+(x2-9)+" "+(y2+6),c,2.2);
 b+=tx(325,25,"If r is above equilibrium (6%)",rose,"middle",15)+box(30,50,125,46,"Excess money",rose)+arr(155,73,200,73,rose)+box(200,50,120,46,"Buy bonds",rose)+arr(320,73,365,73,rose)+box(365,50,120,46,"Bond P ↑",rose)+arr(485,73,530,73,rose)+box(530,50,90,46,"r ↓",rose);
 b+=tx(325,164,"If r is below equilibrium (4%)",blue,"middle",15)+box(30,190,125,46,"Need money",blue)+arr(155,213,200,213,blue)+box(200,190,120,46,"Sell bonds",blue)+arr(320,213,365,213,blue)+box(365,190,120,46,"Bond P ↓",blue)+arr(485,213,530,213,blue)+box(530,190,90,46,"r ↑",blue);
 b+=tx(325,282,"Bond price and interest rate move in opposite directions",purple,"middle",14)+'</svg>';
 return fig(b,"Bond-market adjustment toward r=5%, based on professor PDF pp. 23–25.");
}
function longrun(){
 let b=axes("Quantity of money ($T)","Value of money (1/P)");
 const X=q=>110+(q-.85)*1000,Y=v=>230-(v-.8)*650;
 b+=path("M"+X(.91)+" "+Y(1.12)+" L"+X(1.18)+" "+Y(.82),blue,3)+tx(X(1.18)+5,Y(.82)+3,"LRMD",blue);
 for(const [q,label,col] of [[1.0,"MS₀",purple],[1.1,"MS₁",rose]])b+=path("M"+X(q)+" "+Y(1.14)+" V"+Y(.80),col,3)+tx(X(q)+5,Y(1.135),label,col);
 b+=circ(X(1),Y(1),5,purple)+tx(X(1)-8,Y(1)-11,"E₀",purple,"end")+circ(X(1.1),Y(.91),5,rose)+tx(X(1.1)+8,Y(.91)-10,"E₁",rose);
 b+=tx(X(1),250,"1.00","currentColor","middle",11)+tx(X(1.1),250,"1.10","currentColor","middle",11)+tx(61,Y(1)+4,"1.00","currentColor","end",11)+tx(61,Y(.91)+4,"0.91","currentColor","end",11);
 return fig(svg(b,"Long-run money-market adjustment after a 10% money-supply increase, based on professor PDF pp. 31–33."),"Professor example: M rises from $1.0T to $1.1T; P rises from 1.00 to 1.10 in long-run equilibrium.");
}
function transmission(){
 return table(["Step","Expansionary short-run direction"],[["Money supply","↑"],["Nominal interest rate","↓"],["Cost of using money","↓"],["Consumption / investment","↑"],["Aggregate demand","↑"]],"Short-run monetary transmission in the professor's annotations, PDF pp. 5 and 27.");
}
function render(kind){
 if(!kind)return "";
 if(kind==="roadmap")return table(["Horizon","What adjusts","Lecture focus"],[["Short run","Nominal interest rate","Md and Ms determine r"],["Long run","Price level","Money quantity determines P / inflation"]],"Lecture 9 roadmap from professor PDF pp. 4–6, 13.");
 if(kind==="functions")return table(["Function","Meaning"],[["Medium of exchange","Accepted for goods/services"],["Unit of account","Measure for stating prices"],["Store of value","Can be held for later exchange"]],"Functions of money, professor PDF pp. 8–9.");
 if(kind==="m1m2")return table(["M1","M2 adds to M1"],[["Currency","Savings deposits"],["Traveler's checks","Small-time deposits"],["Checkable deposits","Money-market funds and other deposits"]],"Official measures of money, professor PDF pp. 10–11.");
 if(kind==="real-money")return table(["Real economy","Money economy"],[["Production and consumption","Currency and bank deposits"],["Potential GDP / natural unemployment from real factors","Money supply and money demand"],["Real-side capacity","Short-run nominal interest rate / long-run price level"]],"Professor's real-versus-money distinction, PDF pp. 12–13.");
 if(kind==="money-demand"||kind==="md-table")return md("money-demand");
 if(kind==="md-shift")return md("md-shift");
 if(kind==="money-market")return market("money-market");
 if(kind==="bond-adjust")return bond();
 if(kind==="bond-formula")return fig('<div class="final-lecture7-equation"><p><b>Bond interest rate = fixed dollar interest payment ÷ bond price</b></p><p>Bond price ↑ → interest rate ↓</p><p>Bond price ↓ → interest rate ↑</p></div>',"Inverse bond-price/interest-rate relationship, professor PDF p. 23.");
 if(kind==="ms-shift")return market("ms-shift");
 if(kind==="monetary-transmission")return transmission();
 if(kind==="long-run-money"||kind==="value-money")return longrun();
 if(kind==="quantity-theory")return fig('<div class="final-lecture7-equation"><p><b>M × V = P × Y</b></p><p><b>P = (M × V) ÷ Y</b></p><p>Long run: V relatively stable and Y fixed at potential → P proportional to M</p></div>',"Quantity theory and equation of exchange, professor PDF pp. 34–36.");
 if(kind==="formula")return fig('<div class="final-lecture7-equation"><p><b>M × V = P × Y</b></p><p>Example: M=2, V=5, Y=5 → P=2</p></div>',"Original numerical practice using the professor's equation of exchange.");
 if(kind==="synthesis")return table(["Horizon","MS ↑","Main outcome"],[["Short run","r ↓","C/I and AD can rise"],["Long run at potential Y","P adjusts upward","Quantity of money determines price level"]],"Lecture 9 synthesis from professor PDF pp. 27, 29–36.");
 return "";
}
window.D_STUDY_FINAL_L9_RENDER_FIG=render;
window.D_STUDY_FINAL_L9_RENDER_VISUAL=id=>{
 const bank=window.D_STUDY_FINAL_L9_QUIZZES;if(!bank)return "";
 const q=[...bank.reviewing,...bank.mastering].find(x=>x.id===id);
 return render(q&&q.visual);
};
})();