import{e,T as f,a as y}from"./autofit-BaX70j9p.js";const a={name:"THE NEXT LEVEL",nameHe:"המותג שלך",primaryColor:"#1F6FB2",accentColor:"#F2C94C",logoUrl:"",defaultBackgroundUrl:"",fontFamily:"Heebo"},g="data:image/svg+xml;utf8,"+encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800">
  <rect width="600" height="800" fill="#fff"/>
  <rect x="0" y="0" width="600" height="60" fill="#075E54"/>
  <circle cx="36" cy="30" r="14" fill="#fff" opacity="0.18"/>
  <rect x="60" y="20" width="120" height="10" rx="3" fill="#fff" opacity="0.85"/>
  <rect x="60" y="36" width="80" height="8"  rx="3" fill="#fff" opacity="0.55"/>
  <rect x="80" y="100" width="440" height="60" rx="14" fill="#DCF8C6"/>
  <rect x="100" y="120" width="320" height="8" rx="3" fill="#333" opacity="0.7"/>
  <rect x="100" y="138" width="240" height="8" rx="3" fill="#333" opacity="0.5"/>
  <rect x="80" y="180" width="380" height="60" rx="14" fill="#fff" stroke="#ddd"/>
  <rect x="100" y="200" width="280" height="8" rx="3" fill="#333" opacity="0.7"/>
  <rect x="100" y="218" width="180" height="8" rx="3" fill="#333" opacity="0.5"/>
  <rect x="80" y="260" width="440" height="100" rx="14" fill="#DCF8C6"/>
  <rect x="100" y="280" width="380" height="8" rx="3" fill="#333" opacity="0.7"/>
  <rect x="100" y="298" width="340" height="8" rx="3" fill="#333" opacity="0.7"/>
  <rect x="100" y="316" width="200" height="8" rx="3" fill="#333" opacity="0.5"/>
  <rect x="80" y="380" width="320" height="80" rx="14" fill="#fff" stroke="#ddd"/>
  <rect x="100" y="400" width="220" height="8" rx="3" fill="#333" opacity="0.7"/>
  <rect x="100" y="418" width="180" height="8" rx="3" fill="#333" opacity="0.5"/>
  <text x="300" y="500" fill="#999" font-family="Heebo,sans-serif" font-size="22" text-anchor="middle">[ Mock Testimonial Screenshot ]</text>
</svg>
`.trim()),x={headline:"הנה ההוכחה.",subline:"בלי פילטרים, בלי טריקים.",subHeadline:"(סה״כ 20,000 ש״ח ביום)",caption:"אצלנו כל לקוח מקבל יחס אמיתי — וזה מה שהופך את הסיפור שלו לעוד הצלחה.",captionLines:["אחרי שראינו את ההתעניינות,","אחרי שעברנו לשיחה אישית,","הלקוח חזר עם בקשה לעוד ועוד."],statLine:"הכניס מעל 100,000 ₪ בחודש הראשון.",quote:"השירות הכי טוב שקיבלתי, ממליצה בחום! לא מקרב את הלקוחות — בונה אותם.",authorName:"שיר כהן",authorRole:"לקוחה, תל אביב",sourceImageUrl:g,backgroundUrl:""},w=[{id:"feed",labelHe:"📱 פיד 4:5",w:1080,h:1350},{id:"story",labelHe:"📰 סטורי 9:16",w:1080,h:1920}],o=document.getElementById("app"),m=e("header",{class:"pv-header"},[e("div",{class:"pv-title"},"🎨 Templates Preview"),e("div",{class:"pv-sub"},"כל התבניות עם דאטה מדומה. גלגלו, השוו, הגידו לי מה לתקן.")]);o.appendChild(m);const C=e("section",{class:"pv-legend"},[e("div",{class:"pv-legend-row"},[e("span",{class:"pv-swatch",style:{background:a.primaryColor}}),e("span",{},"primaryColor — "+a.primaryColor)]),e("div",{class:"pv-legend-row"},[e("span",{class:"pv-swatch",style:{background:a.accentColor}}),e("span",{},"accentColor — "+a.accentColor)]),e("div",{class:"pv-legend-row"},[e("span",{class:"pv-swatch pv-swatch-text"},"Aa"),e("span",{},"nameHe / name — "+a.nameHe+" / "+a.name)])]);o.appendChild(C);f.forEach((i,s)=>{const l=e("section",{class:"pv-section"}),v=e("div",{class:"pv-section-head"},[e("div",{},[e("div",{class:"pv-section-num"},"#"+(s+1)),e("div",{class:"pv-section-name"},i.meta.nameHe),e("div",{class:"pv-section-id"},"id: "+i.meta.id)]),e("div",{class:"pv-section-desc"},i.meta.description||"")]);l.appendChild(v);const d=i.meta&&i.meta.editableFields||[];d.length&&l.appendChild(e("div",{class:"pv-fields"},d.map(t=>e("span",{class:"pv-field-tag"},t.labelHe))));const r=e("div",{class:"pv-canvases"});w.forEach(t=>{const c=e("div",{class:"pv-stage pv-stage-"+t.id});c.style.aspectRatio=t.w+" / "+t.h;const n=e("div",{class:"pv-scale"});n.style.height=t.h+"px";const h=i.render({content:x,brand:a,format:t.id});n.appendChild(h),c.appendChild(n),y(h),r.appendChild(e("div",{class:"pv-canvas-wrap"},[e("div",{class:"pv-canvas-label"},t.labelHe+" · "+t.w+"×"+t.h),c]))}),l.appendChild(r),o.appendChild(l)});function p(){document.querySelectorAll(".pv-stage").forEach(i=>{const s=i.clientWidth;s&&i.style.setProperty("--pv-scale",String(s/1080))})}setTimeout(p,0);window.addEventListener("resize",p);
