import { useState, useEffect, useRef, useCallback } from “react”;

// ── FONTS ──────────────────────────────────────────────────────────────────────
const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Lato:wght@300;400;700&display=swap');`;

// ── NUMEROLOGY + ASTROLOGY ─────────────────────────────────────────────────────
function reduce(n) {
while (n > 9 && ![11,22,33].includes(n))
n = String(n).split(””).reduce((a,d)=>a+ +d, 0);
return n;
}
function getLP(dob) {
const [y,m,d] = dob.split(”-”).map(Number);
return reduce(reduce(m)+reduce(d)+reduce(String(y).split(””).reduce((a,c)=>a+ +c,0)));
}
function getSign(dob) {
const [,m,d] = dob.split(”-”).map(Number);
const tbl=[[1,19,“Capricorn”],[2,18,“Aquarius”],[3,20,“Pisces”],[4,19,“Aries”],[5,20,“Taurus”],
[6,20,“Gemini”],[7,22,“Cancer”],[8,22,“Leo”],[9,22,“Virgo”],[10,22,“Libra”],
[11,21,“Scorpio”],[12,21,“Sagittarius”],[12,99,“Capricorn”]];
for(const[sm,sd,s] of tbl) if(m<sm||(m===sm&&d<=sd)) return s;
return “Capricorn”;
}
const ELEM={Aries:“Fire”,Leo:“Fire”,Sagittarius:“Fire”,Taurus:“Earth”,Virgo:“Earth”,Capricorn:“Earth”,
Gemini:“Air”,Libra:“Air”,Aquarius:“Air”,Cancer:“Water”,Scorpio:“Water”,Pisces:“Water”};
const EICO={Fire:“🔥”,Earth:“🌿”,Air:“🌬️”,Water:“💧”};
const SSYM={Aries:“♈”,Taurus:“♉”,Gemini:“♊”,Cancer:“♋”,Leo:“♌”,Virgo:“♍”,
Libra:“♎”,Scorpio:“♏”,Sagittarius:“♐”,Capricorn:“♑”,Aquarius:“♒”,Pisces:“♓”};
const MASTER=[11,22,33];

// ── TIERS ──────────────────────────────────────────────────────────────────────
const TIERS = {
seed:{id:“seed”,name:“Seed”,price:“Free”,icon:“🌱”,accent:”#78a56a”,
tagline:“Your name. Your number. Your starting point.”,
deliverable:“Digital Profile Card”,
badge:null,
features:[“Divine archetype reveal”,“Life path + sun sign decode”,“Core gift statement”,
“Framework alignment”,“Standalone HTML card (download + share)”]},
covenant:{id:“covenant”,name:“Covenant”,price:”$9”,icon:“⚡”,accent:”#d4af37”,
tagline:“A presence that speaks before you do.”,
deliverable:“Full Remnant Profile Page”,
badge:“Most Popular”,
features:[“Everything in Seed”,“Full cinematic profile page”,“Purpose declaration”,
“Digital platform recommendation”,“Content pillar + voice tone”,
“Ready-to-publish opening statement”,“Prophetic blessing”]},
builder:{id:“builder”,name:“Builder”,price:”$29”,icon:“🔥”,accent:”#4a8bc4”,
tagline:“A digital home worthy of your assignment.”,
deliverable:“Personal Bio Site + Profile”,
badge:null,
features:[“Everything in Covenant”,“Navigated one-page bio website”,“Three-chapter story arc”,
“3 core gifts/offerings listed”,“90-day activation roadmap”,
“Framework ecosystem placement”,“Platform strategy breakdown”]},
legacy:{id:“legacy”,name:“Legacy”,price:”$67”,icon:“👑”,accent:”#c084fc”,
tagline:“The full chronicle. The complete foundation.”,
deliverable:“Legacy Chronicle + Full Suite”,
badge:“Complete Package”,
features:[“Everything in Builder”,“Multi-section Legacy Chronicle”,“Origin story + vision declaration”,
“Three legacy pillars”,“Brand voice manifesto”,“Cinematic multi-section layout”,
“Prophetic send-off page”,“Community & connection section”]},
};

// ── SYSTEM PROMPTS ─────────────────────────────────────────────────────────────
const SYS_BASE = `You are the Divine Blueprint Architect — strategic AI oracle of Purposeful Cultivations, founded by Marcus Wayne Evans Jr. (Master 33, Isaiah 58:12). You craft Remnant Profiles: digital identity documents that declare who someone IS, not merely what they’ve done. Language is prophetic-corporate — modern, professional, faith-rooted. Boardroom clarity meets sanctuary depth. No clichés.

Active frameworks:
• Purposeful Cultivations — AI, automation, nonprofit infrastructure
• Martha’s Foundation — trauma-informed restoration for women + youth
• Land Tenders / Buford Colony Initiative — land revival, workforce development
• Bridging the GAP — civic translation, Isaiah 58:12 restoration
• The Remnant Rise — prophetic chronicle, legacy preservation

RETURN ONLY VALID JSON. No preamble. No markdown fences.`;

const SCHEMAS = {
seed:`{"archetype":"2-4 word divine archetype","archetypeSymbol":"single emoji","headline":"bold 10-16 word declaration of who they ARE","tagline":"poetic 6-10 word personal motto","coreGift":"one sentence — irreducible spiritual/vocational gift","framework":"ONE framework name","lifepathMeaning":"one sentence about life path number and purpose","signMeaning":"one sentence about sun sign and how they move"}`,
covenant:`{"archetype":"2-4 word divine archetype","archetypeSymbol":"single emoji","headline":"bold 10-16 word declaration","tagline":"6-10 word personal motto","coreGift":"one sentence — core gift","purposeStatement":"2-3 sentences — who they are, what they carry, why it matters now","framework":"ONE framework name","frameworkReason":"one sentence why this framework claims them","digitalPlatform":"best single platform (LinkedIn/Instagram/Newsletter/Podcast/YouTube)","contentPillar":"5-7 word content theme","voiceTone":"3 powerful adjectives","firstStatement":"2-3 sentence ready-to-publish first-person opening — powerful, authentic","lifepathMeaning":"1-2 sentences — life path + digital mission","signMeaning":"1-2 sentences — sun sign + element + showing up","blessing":"1-2 sentence prophetic send-off, poetic + faith-infused"}`,
builder:`{"archetype":"2-4 word divine archetype","archetypeSymbol":"single emoji","headline":"bold 10-16 word declaration","tagline":"6-10 word personal motto","coreGift":"one sentence","purposeStatement":"2-3 sentences","storyArc":{"origin":"1-2 sentences — what shaped them","turning":"1-2 sentences — the shift moment","now":"1-2 sentences — what they're building"},"gifts":["gift 1 (6-9 words)","gift 2 (6-9 words)","gift 3 (6-9 words)"],"framework":"ONE framework name","frameworkReason":"one sentence","digitalPlatform":"best single platform","contentPillar":"5-7 word content theme","voiceTone":"3 adjectives","roadmap":["Week 1-2 (one sentence)","Month 1 (one sentence)","Month 2-3 (one sentence)"],"firstStatement":"2-3 sentence ready-to-publish opening","lifepathMeaning":"1-2 sentences","signMeaning":"1-2 sentences","blessing":"1-2 sentence prophetic send-off"}`,
legacy:`{"archetype":"2-4 word divine archetype","archetypeSymbol":"single emoji","headline":"bold 10-16 word declaration","tagline":"6-10 word personal motto","coreGift":"one sentence","originStatement":"3 sentences — deep origin, ancestral thread, what they carry","purposeStatement":"2-3 sentences","visionDeclaration":"2-3 sentences — the future they are building","storyArc":{"origin":"2 sentences","turning":"2 sentences","now":"2 sentences"},"legacyPillars":[{"title":"pillar name","description":"2 sentences"},{"title":"pillar name","description":"2 sentences"},{"title":"pillar name","description":"2 sentences"}],"gifts":["gift 1","gift 2","gift 3","gift 4"],"framework":"ONE primary framework","frameworkReason":"2 sentences","manifesto":"3-4 sentence brand voice manifesto — their non-negotiables, creed","digitalPlatform":"best platform","contentPillar":"5-7 word content theme","voiceTone":"3 adjectives","roadmap":["action 1","action 2","action 3","action 4"],"firstStatement":"3-4 sentence ready-to-publish opening","lifepathMeaning":"2 sentences","signMeaning":"2 sentences","blessing":"2-3 sentence prophetic send-off, deeply personal"}`
};

async function fetchBlueprint(tier, name, dob, role, mission, lp, sign, elem) {
const isMaster = MASTER.includes(lp);
const msg = `Name: ${name}\nBirthdate: ${dob}\nLife Path: ${lp}${isMaster?" (Master Number)":""}\nSun Sign: ${sign} ${SSYM[sign]||""}\nElement: ${elem}${role?`\nRole: ${role}`:""}${mission?`\nMission: “${mission}”`:""}`;
const res = await fetch(“https://api.anthropic.com/v1/messages”,{
method:“POST”,headers:{“Content-Type”:“application/json”},
body:JSON.stringify({
model:“claude-sonnet-4-20250514”,max_tokens:1000,
system:`${SYS_BASE}\n\nSchema for ${tier.toUpperCase()} tier:\n${SCHEMAS[tier]}`,
messages:[{role:“user”,content:msg}]
})
});
const data = await res.json();
const raw = data.content?.map(b=>b.text||””).join(””).trim();
return JSON.parse(raw.replace(/`json|`/g,””).trim());
}

// ── HTML BUILDERS ──────────────────────────────────────────────────────────────
const NOW = ()=>new Date().toLocaleDateString(“en-US”,{year:“numeric”,month:“long”,day:“numeric”});
const STAT=(lp,sign,elem)=>`

  <div class="stat"><div class="sl">LIFE PATH</div><div class="sv">${lp}</div>${MASTER.includes(lp)?'<div class="sm">MASTER</div>':''}</div>
  <div class="stat"><div class="sl">SUN SIGN</div><div class="sv">${SSYM[sign]||sign[0]}</div><div class="sm">${sign.toUpperCase()}</div></div>
  <div class="stat"><div class="sl">ELEMENT</div><div class="sv">${EICO[elem]||"✨"}</div><div class="sm">${elem.toUpperCase()}</div></div>`;

function buildSeedHTML(d,name,dob,lp,sign,elem){
return`<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">

<title>${name} — Remnant Profile</title>
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Lato:wght@300;400&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#09070a;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;font-family:'Lato',sans-serif}
.card{max-width:460px;width:100%;background:linear-gradient(160deg,#110e14,#0c0a0f);border:1px solid rgba(120,165,106,0.3);border-radius:20px;padding:52px 40px;text-align:center;position:relative;overflow:hidden}
.card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,#78a56a,transparent)}
.card::after{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 50% 0%,rgba(120,165,106,0.05),transparent 55%);pointer-events:none}
.sym{font-size:52px;display:block;margin-bottom:20px}
.al{font-family:'Cinzel',serif;font-size:9px;letter-spacing:5px;color:rgba(120,165,106,0.6);margin-bottom:6px}
.archetype{font-family:'Cinzel',serif;font-size:17px;font-weight:600;color:#78a56a;margin-bottom:24px}
.div{width:48px;height:1px;background:linear-gradient(90deg,transparent,#78a56a,transparent);margin:0 auto 24px}
.name{font-family:'Playfair Display',serif;font-size:clamp(32px,8vw,44px);font-weight:700;color:#fff;line-height:1;margin-bottom:8px}
.tag{font-family:'Playfair Display',serif;font-size:14px;font-style:italic;color:rgba(120,165,106,0.7);margin-bottom:32px}
.stats{display:flex;gap:12px;justify-content:center;margin-bottom:28px;flex-wrap:wrap}
.stat{background:rgba(255,255,255,0.03);border:1px solid rgba(120,165,106,0.15);border-radius:10px;padding:14px 18px;min-width:88px}
.sl{font-family:'Cinzel',serif;font-size:7px;letter-spacing:3px;color:rgba(255,255,255,0.3);margin-bottom:6px}
.sv{font-family:'Playfair Display',serif;font-size:18px;font-weight:700;color:#78a56a}
.sm{font-size:7px;letter-spacing:2px;color:rgba(120,165,106,0.5);margin-top:3px}
.hl{font-family:'Playfair Display',serif;font-size:15px;font-weight:600;color:rgba(255,255,255,0.88);line-height:1.65;margin-bottom:20px;padding:0 4px}
.gl{font-family:'Cinzel',serif;font-size:7px;letter-spacing:3px;color:rgba(255,255,255,0.25);margin-bottom:8px}
.gift{font-size:13px;color:rgba(255,255,255,0.6);line-height:1.8;margin-bottom:24px}
.fw{display:inline-block;padding:7px 22px;border:1px solid rgba(120,165,106,0.35);border-radius:30px;font-family:'Cinzel',serif;font-size:9px;letter-spacing:3px;color:#78a56a;margin-bottom:28px}
.lp{font-size:12px;color:rgba(255,255,255,0.4);line-height:1.75;font-style:italic;margin-bottom:28px;padding:0 8px}
.foot{font-family:'Cinzel',serif;font-size:8px;letter-spacing:3px;color:rgba(255,255,255,0.15)}
@media(max-width:480px){.card{padding:40px 24px}}
@media print{body{background:#fff}.card{background:#fff;border-color:#ccc}.name,.archetype,.hl{color:#111}.sv,.fw{color:#4a7a3e}.stat{border-color:#ddd;background:#f5f5f5}.gift,.lp{color:#444}.foot{color:#aaa}}
</style></head><body><div class="card">
<span class="sym">${d.archetypeSymbol}</span>
<div class="al">DIVINE ARCHETYPE</div><div class="archetype">${d.archetype}</div>
<div class="div"></div>
<div class="name">${name}</div>
<div class="tag">"${d.tagline}"</div>
<div class="stats">${STAT(lp,sign,elem)}</div>
<div class="hl">${d.headline}</div>
<div class="gl">CORE GIFT</div><div class="gift">${d.coreGift}</div>
<div class="fw">${d.framework}</div>
<div class="lp">${d.lifepathMeaning}</div>
<div class="foot">Purposeful Cultivations · Remnant Profile · ${NOW()}</div>
</div></body></html>`;}

function buildCovenantHTML(d,name,role,lp,sign,elem){
return`<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">

<title>${name} — Remnant Profile</title>
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Lato:wght@300;400;700&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}:root{--g:#d4af37;--gd:rgba(212,175,55,.65);--gp:rgba(212,175,55,.15);--bg:#09080b;--b2:#0d0b0f;--tx:rgba(255,255,255,.85);--td:rgba(255,255,255,.45)}
body{background:var(--bg);color:#fff;font-family:'Lato',sans-serif}
.hero{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:80px 40px;text-align:center;position:relative;overflow:hidden}
.hero::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 75% 55% at 50% 5%,rgba(212,175,55,.07),transparent 60%)}
.hero::after{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,var(--g),transparent)}
.ey{font-family:'Cinzel',serif;font-size:9px;letter-spacing:6px;color:var(--gd);margin-bottom:28px;position:relative}
.sym{font-size:64px;margin-bottom:16px;position:relative}
.at{font-family:'Cinzel',serif;font-size:13px;letter-spacing:5px;color:var(--g);margin-bottom:28px;display:flex;align-items:center;gap:14px;justify-content:center;position:relative}
.at::before,.at::after{content:'';display:block;height:1px;width:36px;background:var(--gp)}
h1{font-family:'Playfair Display',serif;font-size:clamp(44px,9vw,88px);font-weight:700;line-height:.95;letter-spacing:-2px;color:#fff;margin-bottom:16px;position:relative}
.tag{font-family:'Playfair Display',serif;font-size:clamp(14px,2vw,19px);font-style:italic;color:var(--gd);margin-bottom:12px;position:relative}
.role{font-size:11px;letter-spacing:4px;color:var(--td);margin-bottom:44px;font-family:'Cinzel',serif;position:relative}
.hl{font-size:clamp(14px,2vw,17px);color:var(--tx);line-height:1.8;max-width:580px;margin:0 auto 48px;position:relative}
.stats{display:flex;gap:16px;justify-content:center;flex-wrap:wrap;position:relative}
.stat{background:rgba(255,255,255,.03);border:1px solid var(--gp);border-radius:12px;padding:22px 28px;text-align:center}
.sl{font-family:'Cinzel',serif;font-size:7px;letter-spacing:3px;color:rgba(255,255,255,.3);margin-bottom:8px}
.sv{font-family:'Playfair Display',serif;font-size:28px;font-weight:700;color:var(--g)}
.sm{font-size:8px;letter-spacing:2px;color:rgba(212,175,55,.45);margin-top:4px}
section{padding:80px 40px;max-width:780px;margin:0 auto}
.sl2{font-family:'Cinzel',serif;font-size:9px;letter-spacing:5px;color:var(--gd);margin-bottom:14px;display:flex;align-items:center;gap:14px}
.sl2::after{content:'';flex:1;height:1px;background:var(--gp)}
h2{font-family:'Playfair Display',serif;font-size:clamp(26px,4vw,38px);font-weight:700;color:#fff;margin-bottom:24px;line-height:1.2}
p{font-size:16px;line-height:1.9;color:var(--tx)}
.gbox{background:linear-gradient(135deg,rgba(212,175,55,.07),rgba(212,175,55,.02));border:1px solid var(--gp);border-left:4px solid var(--g);border-radius:12px;padding:30px 34px;margin:28px 0}
.fws{background:var(--b2);padding:80px 40px;border-top:1px solid rgba(255,255,255,.05);border-bottom:1px solid rgba(255,255,255,.05)}
.fwi{max-width:780px;margin:0 auto}
.fwb{display:inline-block;padding:8px 24px;border:1px solid var(--gp);border-radius:30px;font-family:'Cinzel',serif;font-size:11px;letter-spacing:3px;color:var(--g);margin-bottom:20px}
.dpg{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:14px;margin:24px 0}
.dpc{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:10px;padding:20px}
.dpl{font-family:'Cinzel',serif;font-size:7px;letter-spacing:3px;color:rgba(255,255,255,.28);margin-bottom:8px}
.dpv{font-size:14px;font-weight:700;color:#fff;line-height:1.4}
.stb{background:rgba(212,175,55,.04);border:1px dashed rgba(212,175,55,.22);border-radius:12px;padding:32px;margin:22px 0}
.stt{font-family:'Playfair Display',serif;font-size:16px;font-style:italic;color:var(--gd);line-height:1.85}
.bl{text-align:center;padding:80px 40px;border-top:1px solid rgba(255,255,255,.05)}
.bt{font-family:'Playfair Display',serif;font-size:clamp(17px,3vw,24px);font-style:italic;color:var(--gd);line-height:1.8;max-width:540px;margin:0 auto 24px}
.bc{font-family:'Cinzel',serif;font-size:8px;letter-spacing:4px;color:rgba(255,255,255,.18)}
footer{text-align:center;padding:32px;border-top:1px solid rgba(255,255,255,.04)}
.fb{font-family:'Cinzel',serif;font-size:9px;letter-spacing:4px;color:rgba(255,255,255,.18);margin-bottom:6px}
.fd{font-size:11px;color:rgba(255,255,255,.12)}
@media(max-width:600px){.hero,section,.fws,.bl{padding:60px 24px}}
@media print{body{background:#fff;color:#111}h1,h2{color:#111}.sv,.fwb,.at{color:#b8902e}.gbox,.dpc,.stb{background:#f9f9f9;border-color:#ddd}p,.stt{color:#333}.bt{color:#b8902e}}
</style></head><body>
<div class="hero">
<div class="ey">REMNANT PROFILE · PURPOSEFUL CULTIVATIONS</div>
<div class="sym">${d.archetypeSymbol}</div>
<div class="at">${d.archetype}</div>
<h1>${name}</h1>
<div class="tag">"${d.tagline}"</div>
${role?`<div class="role">${role.toUpperCase()}</div>`:""}
<p class="hl">${d.headline}</p>
<div class="stats">${STAT(lp,sign,elem)}</div>
</div>

<section>
<div class="sl2">PURPOSE</div><h2>Who You Are</h2>
<p>${d.purposeStatement}</p>
<div class="gbox"><div class="sl2" style="color:var(--g)">CORE GIFT</div><p>${d.coreGift}</p></div>
</section>

<div class="fws"><div class="fwi">
<div class="sl2">FRAMEWORK ALIGNMENT</div>
<div class="fwb">${d.framework}</div>
<h2 style="max-width:560px">${d.frameworkReason}</h2>
</div></div>

<section>
<div class="sl2">CELESTIAL BLUEPRINT</div><h2>Encoded in Your Birth</h2>
<p style="margin-bottom:20px">${d.lifepathMeaning}</p><p>${d.signMeaning}</p>
</section>

<section style="border-top:1px solid rgba(255,255,255,.05)">
<div class="sl2">DIGITAL PRESENCE</div><h2>Where You Show Up</h2>
<div class="dpg">
<div class="dpc"><div class="dpl">PRIMARY PLATFORM</div><div class="dpv">${d.digitalPlatform}</div></div>
<div class="dpc"><div class="dpl">CONTENT PILLAR</div><div class="dpv">${d.contentPillar}</div></div>
<div class="dpc"><div class="dpl">VOICE TONE</div><div class="dpv">${d.voiceTone}</div></div>
</div>
<div class="stb"><div class="dpl" style="margin-bottom:12px">READY TO PUBLISH · FIRST STATEMENT</div>
<p class="stt">"${d.firstStatement}"</p></div>
</section>

<div class="bl">
<div class="sl2" style="justify-content:center;margin-bottom:24px"><span style="font-family:'Cinzel',serif;font-size:9px;letter-spacing:5px;color:rgba(212,175,55,.45)">✦ BLESSING ✦</span></div>
<p class="bt">${d.blessing}</p>
<div class="bc">IF IT'S IN HIS WILL · IT'S IN MY WAY · ISAIAH 58:12</div>
</div>
<footer><div class="fb">PURPOSEFUL CULTIVATIONS · REMNANT PROFILE</div><div class="fd">Generated ${NOW()}</div></footer>
</body></html>`;}

function buildBuilderHTML(d,name,role,lp,sign,elem){
return`<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">

<title>${name} — Personal Bio Site</title>
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Lato:wght@300;400;700&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}:root{--g:#d4af37;--gd:rgba(212,175,55,.65);--gp:rgba(212,175,55,.15);--bl:#4a8bc4;--bp:rgba(74,139,196,.15);--bg:#09080b;--b2:#0d0b10;--tx:rgba(255,255,255,.85);--td:rgba(255,255,255,.45)}
body{background:var(--bg);color:#fff;font-family:'Lato',sans-serif}
nav{position:fixed;top:0;left:0;right:0;z-index:100;height:60px;padding:0 48px;display:flex;align-items:center;justify-content:space-between;background:rgba(9,8,11,.9);backdrop-filter:blur(14px);border-bottom:1px solid rgba(255,255,255,.05)}
.nb{font-family:'Cinzel',serif;font-size:10px;letter-spacing:4px;color:var(--g)}
.nl{display:flex;gap:28px}.nl a{font-family:'Cinzel',serif;font-size:8px;letter-spacing:3px;color:rgba(255,255,255,.35);text-decoration:none}
.hero{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:120px 48px 80px;text-align:center;position:relative;overflow:hidden}
.hero::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 65% 45% at 50% 10%,rgba(74,139,196,.07),transparent 55%)}
.hb{display:inline-flex;align-items:center;gap:8px;padding:7px 20px;border:1px solid var(--gp);border-radius:30px;font-family:'Cinzel',serif;font-size:9px;letter-spacing:4px;color:var(--gd);margin-bottom:28px;position:relative}
.sym{font-size:72px;margin-bottom:14px;position:relative}
.at{font-family:'Cinzel',serif;font-size:12px;letter-spacing:6px;color:var(--bl);margin-bottom:20px;position:relative}
h1{font-family:'Playfair Display',serif;font-size:clamp(52px,10vw,100px);font-weight:700;line-height:.92;letter-spacing:-3px;color:#fff;margin-bottom:16px;position:relative}
.tag{font-family:'Playfair Display',serif;font-size:clamp(14px,2vw,19px);font-style:italic;color:var(--gd);margin-bottom:12px;position:relative}
.role{font-size:10px;letter-spacing:4px;color:var(--td);margin-bottom:48px;position:relative}
.hl{font-size:clamp(14px,2vw,17px);color:var(--tx);line-height:1.8;max-width:620px;margin:0 auto 48px;position:relative}
.cr{display:flex;gap:14px;justify-content:center;flex-wrap:wrap;margin-bottom:56px;position:relative}
.bp2{padding:13px 34px;background:linear-gradient(135deg,var(--g),#b8902e);border:none;border-radius:8px;font-family:'Cinzel',serif;font-size:9px;letter-spacing:3px;color:#0a0804;font-weight:700;text-decoration:none;display:inline-block}
.bs{padding:13px 34px;background:transparent;border:1px solid rgba(255,255,255,.15);border-radius:8px;font-family:'Cinzel',serif;font-size:9px;letter-spacing:3px;color:rgba(255,255,255,.45);text-decoration:none;display:inline-block}
.stats{display:flex;gap:16px;justify-content:center;flex-wrap:wrap;position:relative}
.stat{background:rgba(255,255,255,.03);border:1px solid var(--gp);border-radius:12px;padding:24px 32px;text-align:center}
.sl{font-family:'Cinzel',serif;font-size:7px;letter-spacing:3px;color:rgba(255,255,255,.28);margin-bottom:8px}
.sv{font-family:'Playfair Display',serif;font-size:30px;font-weight:700;color:var(--g)}
.sm{font-size:8px;letter-spacing:2px;color:rgba(212,175,55,.42);margin-top:4px}
section{padding:96px 48px;max-width:900px;margin:0 auto}
.ds{background:var(--b2);padding:96px 48px;border-top:1px solid rgba(255,255,255,.04);border-bottom:1px solid rgba(255,255,255,.04)}
.di{max-width:900px;margin:0 auto}
.sl2{font-family:'Cinzel',serif;font-size:9px;letter-spacing:5px;color:var(--gd);margin-bottom:14px;display:flex;align-items:center;gap:14px}
.sl2::after{content:'';flex:1;height:1px;background:var(--gp)}
.blu{color:rgba(74,139,196,.65)}.blu::after{background:rgba(74,139,196,.18)}
h2{font-family:'Playfair Display',serif;font-size:clamp(26px,4vw,42px);font-weight:700;color:#fff;margin-bottom:28px;line-height:1.15}
p{font-size:16px;line-height:1.9;color:var(--tx)}
.sg{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:20px;margin-top:36px}
.sc{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:12px;padding:28px}
.sn{font-family:'Cinzel',serif;font-size:8px;letter-spacing:4px;color:var(--gd);margin-bottom:10px}
.st{font-size:14px;line-height:1.8;color:var(--tx)}
.gl{display:flex;flex-direction:column;gap:14px;margin-top:28px}
.gi{display:flex;align-items:center;gap:18px;background:rgba(255,255,255,.03);border:1px solid var(--bp);border-left:3px solid var(--bl);border-radius:10px;padding:18px 22px}
.gn{width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,var(--bl),#3a6ea5);display:flex;align-items:center;justify-content:center;font-family:'Cinzel',serif;font-size:10px;color:#fff;font-weight:700;flex-shrink:0}
.gt{font-size:15px;color:var(--tx);font-weight:600}
.dpg{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:14px;margin:24px 0}
.dpc{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:10px;padding:20px}
.dpl{font-family:'Cinzel',serif;font-size:7px;letter-spacing:3px;color:rgba(255,255,255,.26);margin-bottom:8px}
.dpv{font-size:14px;font-weight:700;color:#fff;line-height:1.4}
.stb{background:rgba(212,175,55,.04);border:1px dashed rgba(212,175,55,.2);border-radius:12px;padding:30px;margin:22px 0}
.stt{font-family:'Playfair Display',serif;font-size:16px;font-style:italic;color:var(--gd);line-height:1.85}
.rm{display:flex;flex-direction:column;gap:0;margin-top:28px;position:relative}
.rm::before{content:'';position:absolute;left:20px;top:0;bottom:0;width:1px;background:linear-gradient(to bottom,rgba(212,175,55,.25),transparent)}
.ri{display:flex;gap:24px;padding-bottom:28px}
.rd{width:40px;height:40px;border-radius:50%;background:var(--b2);border:2px solid var(--g);display:flex;align-items:center;justify-content:center;font-family:'Cinzel',serif;font-size:9px;font-weight:700;color:var(--g);flex-shrink:0}
.rc{flex:1;padding-top:8px}
.rs{font-family:'Cinzel',serif;font-size:7px;letter-spacing:3px;color:var(--gd);margin-bottom:5px}
.rt{font-size:14px;color:var(--tx);line-height:1.75}
.gbox{background:linear-gradient(135deg,rgba(212,175,55,.07),rgba(212,175,55,.02));border:1px solid var(--gp);border-left:4px solid var(--g);border-radius:12px;padding:28px 32px;margin:24px 0}
.bl2{text-align:center;padding:96px 48px;border-top:1px solid rgba(255,255,255,.05)}
.bt{font-family:'Playfair Display',serif;font-size:clamp(17px,3vw,26px);font-style:italic;color:var(--gd);line-height:1.8;max-width:580px;margin:0 auto 24px}
.bc{font-family:'Cinzel',serif;font-size:8px;letter-spacing:5px;color:rgba(255,255,255,.16)}
footer{background:var(--b2);padding:48px;text-align:center;border-top:1px solid rgba(255,255,255,.04)}
.fb{font-family:'Cinzel',serif;font-size:9px;letter-spacing:5px;color:rgba(255,255,255,.16);margin-bottom:6px}
.fd{font-size:11px;color:rgba(255,255,255,.1)}
@media(max-width:768px){nav{padding:0 20px}section,.ds,.bl2{padding:72px 24px}.hero{padding:100px 24px 72px}}
@media print{body{background:#fff;color:#111}nav{display:none}h1,h2{color:#111}.sv,.at,.nb{color:#4a7a9e}.sc,.gi,.dpc,.stb,.gbox{background:#f9f9f9;border-color:#ddd}p,.st,.rt,.stt,.gt{color:#333}.bt{color:#b8902e}}
</style></head><body>
<nav><div class="nb">PURPOSEFUL CULTIVATIONS</div><div class="nl"><a href="#story">Story</a><a href="#gifts">Gifts</a><a href="#digital">Digital</a><a href="#connect">Connect</a></div></nav>
<div class="hero">
<div class="hb">✦ REMNANT PROFILE · BUILDER TIER ✦</div>
<div class="sym">${d.archetypeSymbol}</div><div class="at">${d.archetype}</div>
<h1>${name}</h1>
<div class="tag">"${d.tagline}"</div>
${role?`<div class="role">${role.toUpperCase()}</div>`:""}
<p class="hl">${d.headline}</p>
<div class="cr"><a href="#connect" class="bp2">CONNECT WITH ME</a><a href="#story" class="bs">MY STORY</a></div>
<div class="stats">${STAT(lp,sign,elem)}</div>
</div>

<section id="story">
<div class="sl2">ORIGIN</div><h2>The Story Behind the Work</h2>
<p style="margin-bottom:32px">${d.purposeStatement}</p>
<div class="sg">
<div class="sc"><div class="sn">CHAPTER 01 · ROOT</div><p class="st">${d.storyArc?.origin||""}</p></div>
<div class="sc"><div class="sn">CHAPTER 02 · SHIFT</div><p class="st">${d.storyArc?.turning||""}</p></div>
<div class="sc"><div class="sn">CHAPTER 03 · NOW</div><p class="st">${d.storyArc?.now||""}</p></div>
</div></section>

<div class="ds"><div class="di">
<div class="sl2">CORE GIFT</div>
<p style="font-family:'Playfair Display',serif;font-size:clamp(16px,2.5vw,22px);color:rgba(212,175,55,.8);font-style:italic;margin-bottom:40px">${d.coreGift}</p>
<div class="sl2">FRAMEWORK ALIGNMENT</div>
<div style="display:inline-block;padding:8px 24px;border:1px solid rgba(212,175,55,.3);border-radius:30px;font-family:'Cinzel',serif;font-size:11px;letter-spacing:3px;color:var(--g);margin-bottom:16px">${d.framework}</div>
<p style="max-width:580px">${d.frameworkReason}</p>
</div></div>

<section id="gifts">
<div class="sl2 blu">OFFERINGS</div><h2>What I Bring</h2>
<div class="gl">${(d.gifts||[]).map((g,i)=>`<div class="gi"><div class="gn">${String(i+1).padStart(2,"0")}</div><div class="gt">${g}</div></div>`).join("")}
</div></section>

<section style="border-top:1px solid rgba(255,255,255,.04)">
<div class="sl2">CELESTIAL BLUEPRINT</div><h2>Written in the Stars</h2>
<p style="margin-bottom:20px">${d.lifepathMeaning}</p><p>${d.signMeaning}</p>
</section>

<div class="ds" id="digital"><div class="di">
<div class="sl2">DIGITAL PRESENCE</div><h2 style="font-family:'Playfair Display',serif;font-size:clamp(26px,4vw,42px);font-weight:700;color:#fff;margin-bottom:28px">Where I Show Up</h2>
<div class="dpg">
<div class="dpc"><div class="dpl">PRIMARY PLATFORM</div><div class="dpv">${d.digitalPlatform}</div></div>
<div class="dpc"><div class="dpl">CONTENT PILLAR</div><div class="dpv">${d.contentPillar}</div></div>
<div class="dpc"><div class="dpl">VOICE TONE</div><div class="dpv">${d.voiceTone}</div></div>
</div>
<div class="stb"><div class="dpl" style="margin-bottom:10px">READY TO PUBLISH · OPENING STATEMENT</div><p class="stt">"${d.firstStatement}"</p></div>
<div class="sl2" style="margin-top:44px">90-DAY ROADMAP</div>
<div class="rm">${(d.roadmap||[]).map((r,i)=>`<div class="ri"><div class="rd">${String(i+1).padStart(2,"0")}</div><div class="rc"><div class="rs">PHASE ${i+1}</div><div class="rt">${r}</div></div></div>`).join("")}</div>
</div></div>

<div class="bl2" id="connect">
<div class="sl2" style="justify-content:center;margin-bottom:28px"><span style="font-family:'Cinzel',serif;font-size:9px;letter-spacing:5px;color:rgba(212,175,55,.42)">✦ BLESSING ✦</span></div>
<p class="bt">${d.blessing}</p>
<div class="bc">IF IT'S IN HIS WILL · IT'S IN MY WAY · ISAIAH 58:12</div>
</div>
<footer><div class="fb">PURPOSEFUL CULTIVATIONS · PERSONAL BIO SITE · BUILDER TIER</div><div class="fd">Generated ${NOW()}</div></footer>
</body></html>`;}

function buildLegacyHTML(d,name,role,lp,sign,elem){
return`<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">

<title>${name} — Legacy Chronicle</title>
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Lato:wght@300;400;700&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}:root{--g:#d4af37;--gd:rgba(212,175,55,.65);--gp:rgba(212,175,55,.15);--p:#c084fc;--pp:rgba(192,132,252,.12);--bg:#07060a;--b2:#0a090d;--tx:rgba(255,255,255,.85);--td:rgba(255,255,255,.45)}
body{background:var(--bg);color:#fff;font-family:'Lato',sans-serif}
nav{position:fixed;top:0;left:0;right:0;z-index:100;height:60px;padding:0 56px;display:flex;align-items:center;justify-content:space-between;background:rgba(7,6,10,.92);backdrop-filter:blur(16px);border-bottom:1px solid rgba(255,255,255,.04)}
.nb{font-family:'Cinzel',serif;font-size:9px;letter-spacing:5px;color:rgba(255,255,255,.28)}
.nn{font-family:'Playfair Display',serif;font-size:15px;font-weight:700;color:var(--g)}
.hero{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:120px 56px 80px;text-align:center;position:relative;overflow:hidden}
.hbg{position:absolute;inset:0;background:conic-gradient(from 180deg at 50% 110%,rgba(192,132,252,.04),rgba(212,175,55,.04),rgba(192,132,252,.04))}
.hgl{position:absolute;top:-80px;left:50%;transform:translateX(-50%);width:560px;height:560px;background:radial-gradient(circle,rgba(192,132,252,.07),transparent 70%)}
.hln{position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,var(--p),var(--g),var(--p),transparent)}
.hc{position:relative;z-index:1}
.hl2{font-family:'Cinzel',serif;font-size:9px;letter-spacing:6px;color:rgba(192,132,252,.55);margin-bottom:28px}
.sym{font-size:80px;margin-bottom:16px;filter:drop-shadow(0 0 18px rgba(192,132,252,.25))}
.at{font-family:'Cinzel',serif;font-size:12px;letter-spacing:6px;color:var(--p);margin-bottom:18px}
h1{font-family:'Playfair Display',serif;font-size:clamp(56px,11vw,116px);font-weight:700;line-height:.92;letter-spacing:-3px;background:linear-gradient(180deg,#fff 55%,rgba(255,255,255,.35));-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:16px}
.tag{font-family:'Playfair Display',serif;font-size:clamp(14px,2.5vw,21px);font-style:italic;color:var(--gd);margin-bottom:12px}
.role{font-family:'Cinzel',serif;font-size:10px;letter-spacing:4px;color:var(--td);margin-bottom:52px}
.stats{display:flex;gap:18px;justify-content:center;flex-wrap:wrap}
.stat{background:rgba(255,255,255,.025);border:1px solid rgba(255,255,255,.06);border-radius:14px;padding:28px 36px;text-align:center;position:relative;overflow:hidden}
.stat::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,var(--p),transparent)}
.sl{font-family:'Cinzel',serif;font-size:7px;letter-spacing:4px;color:rgba(255,255,255,.24);margin-bottom:10px}
.sv{font-family:'Playfair Display',serif;font-size:36px;font-weight:700;color:var(--g)}
.sm{font-size:8px;letter-spacing:2px;color:rgba(212,175,55,.38);margin-top:4px}
.sc2{margin-top:60px;font-family:'Cinzel',serif;font-size:8px;letter-spacing:4px;color:rgba(255,255,255,.14);animation:bob 2.5s ease-in-out infinite}
@keyframes bob{0%,100%{transform:translateY(0)}50%{transform:translateY(8px)}}
section{padding:96px 56px;max-width:960px;margin:0 auto}
.ds{background:var(--b2);padding:96px 56px}
.di{max-width:960px;margin:0 auto}
.sl2{font-family:'Cinzel',serif;font-size:9px;letter-spacing:5px;color:var(--gd);margin-bottom:14px;display:flex;align-items:center;gap:14px}
.sl2::after{content:'';flex:1;height:1px;background:var(--gp)}
.pur{color:rgba(192,132,252,.58)}.pur::after{background:rgba(192,132,252,.18)}
h2{font-family:'Playfair Display',serif;font-size:clamp(28px,4.5vw,48px);font-weight:700;color:#fff;margin-bottom:28px;line-height:1.12}
p{font-size:16px;line-height:1.95;color:var(--tx)}
.lt{font-family:'Playfair Display',serif;font-size:clamp(18px,3vw,26px);font-style:italic;color:rgba(212,175,55,.82);line-height:1.7}
.pg{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:22px;margin-top:36px}
.pc{background:rgba(255,255,255,.02);border:1px solid rgba(192,132,252,.15);border-top:3px solid var(--p);border-radius:14px;padding:30px}
.pn{font-family:'Cinzel',serif;font-size:9px;letter-spacing:4px;color:rgba(192,132,252,.48);margin-bottom:10px}
.pt{font-family:'Playfair Display',serif;font-size:20px;font-weight:700;color:#fff;margin-bottom:10px}
.pd{font-size:14px;line-height:1.82;color:var(--td)}
.tl{display:flex;flex-direction:column;gap:36px;margin-top:36px;position:relative}
.tl::before{content:'';position:absolute;left:16px;top:0;bottom:0;width:1px;background:linear-gradient(to bottom,var(--p),var(--g),transparent)}
.ti{display:flex;gap:30px}
.td2{width:32px;height:32px;border-radius:50%;background:var(--b2);border:2px solid var(--g);flex-shrink:0;margin-top:4px}
.tb{}
.tc{font-family:'Cinzel',serif;font-size:9px;letter-spacing:4px;color:var(--gd);margin-bottom:6px}
.tx2{font-size:15px;line-height:1.88;color:var(--tx)}
.gg{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:14px;margin-top:28px}
.gc{background:rgba(255,255,255,.025);border:1px solid rgba(212,175,55,.1);border-radius:12px;padding:22px;display:flex;gap:14px;align-items:flex-start}
.gi{width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,rgba(212,175,55,.2),rgba(212,175,55,.04));display:flex;align-items:center;justify-content:center;font-family:'Cinzel',serif;font-size:11px;font-weight:700;color:var(--g);flex-shrink:0}
.gt{font-size:14px;color:var(--tx);font-weight:600;line-height:1.5}
.mb{background:linear-gradient(135deg,rgba(192,132,252,.07),rgba(212,175,55,.04));border:1px solid rgba(192,132,252,.2);border-left:4px solid var(--p);border-radius:14px;padding:38px 44px;margin:28px 0}
.mt{font-family:'Playfair Display',serif;font-size:17px;line-height:1.9;color:var(--tx);font-style:italic}
.dpg{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:14px;margin:24px 0}
.dpc{background:rgba(255,255,255,.025);border:1px solid rgba(255,255,255,.06);border-radius:12px;padding:22px}
.dpl{font-family:'Cinzel',serif;font-size:7px;letter-spacing:3px;color:rgba(255,255,255,.24);margin-bottom:8px}
.dpv{font-size:14px;font-weight:700;color:#fff;line-height:1.4}
.stb{background:rgba(212,175,55,.04);border:1px dashed rgba(212,175,55,.2);border-radius:14px;padding:34px;margin:22px 0}
.stt{font-family:'Playfair Display',serif;font-size:18px;font-style:italic;color:var(--gd);line-height:1.88}
.rm{display:flex;flex-direction:column;gap:14px;margin-top:28px}
.ri{display:flex;gap:20px;background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.06);border-radius:12px;padding:20px 24px}
.rn{font-family:'Cinzel',serif;font-size:22px;font-weight:700;color:var(--g);min-width:36px;line-height:1}
.rt{font-size:14px;color:var(--tx);line-height:1.75;padding-top:4px}
.bl2{text-align:center;padding:120px 56px;position:relative;overflow:hidden}
.bl2::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 55% 55% at 50% 50%,rgba(192,132,252,.04),transparent)}
.btn{font-family:'Cinzel',serif;font-size:9px;letter-spacing:6px;color:rgba(192,132,252,.48);margin-bottom:36px}
.bt{font-family:'Playfair Display',serif;font-size:clamp(20px,3.5vw,30px);font-style:italic;color:var(--gd);line-height:1.78;max-width:640px;margin:0 auto 36px;position:relative}
.bc{font-family:'Cinzel',serif;font-size:8px;letter-spacing:5px;color:rgba(255,255,255,.14)}
footer{background:var(--b2);padding:56px;text-align:center;border-top:1px solid rgba(255,255,255,.04)}
.ft{font-family:'Cinzel',serif;font-size:8px;letter-spacing:4px;color:rgba(192,132,252,.32);margin-bottom:8px}
.fb{font-family:'Cinzel',serif;font-size:9px;letter-spacing:5px;color:rgba(255,255,255,.16);margin-bottom:8px}
.fd{font-size:11px;color:rgba(255,255,255,.1)}
@media(max-width:768px){nav{padding:0 20px}section,.ds,.bl2{padding:72px 24px}.hero{padding:100px 24px 72px}}
@media print{body{background:#fff;color:#111}nav{display:none}h1,h2{color:#111;-webkit-text-fill-color:#111}.sv,.at,.nn{color:#b8902e}.pc,.gc,.dpc,.stb,.mb{background:#f9f9f9;border-color:#ddd}p,.tx2,.mt,.stt,.gt,.pd{color:#333}.bt{color:#b8902e}}
</style></head><body>
<nav><div class="nb">PURPOSEFUL CULTIVATIONS</div><div class="nn">${name}</div></nav>
<div class="hero">
<div class="hbg"></div><div class="hgl"></div><div class="hln"></div>
<div class="hc">
<div class="hl2">LEGACY CHRONICLE · REMNANT PROFILE</div>
<div class="sym">${d.archetypeSymbol}</div>
<div class="at">${d.archetype}</div>
<h1>${name}</h1>
<div class="tag">"${d.tagline}"</div>
${role?`<div class="role">${role.toUpperCase()}</div>`:""}
<div class="stats">${STAT(lp,sign,elem)}</div>
<div class="sc2">↓ SCROLL TO BEGIN ↓</div>
</div></div>

<section>
<div class="sl2">ORIGIN</div><h2>Where It All Began</h2>
<p class="lt">${d.originStatement||d.purposeStatement}</p>
</section>

<div class="ds"><div class="di">
<div class="sl2 pur">VISION</div><h2>What I'm Building</h2>
<p style="max-width:680px">${d.visionDeclaration||d.purposeStatement}</p>
</div></div>

<section>
<div class="sl2">STORY ARC</div><h2>Three Chapters</h2>
<div class="tl">
<div class="ti"><div class="td2"></div><div class="tb"><div class="tc">CHAPTER I · ROOT</div><p class="tx2">${d.storyArc?.origin||""}</p></div></div>
<div class="ti"><div class="td2"></div><div class="tb"><div class="tc">CHAPTER II · SHIFT</div><p class="tx2">${d.storyArc?.turning||""}</p></div></div>
<div class="ti"><div class="td2"></div><div class="tb"><div class="tc">CHAPTER III · NOW</div><p class="tx2">${d.storyArc?.now||""}</p></div></div>
</div></section>

<div class="ds"><div class="di">
<div class="sl2 pur">LEGACY PILLARS</div><h2>Three Foundations</h2>
<div class="pg">${(d.legacyPillars||[]).map((p,i)=>`<div class="pc"><div class="pn">PILLAR 0${i+1}</div><div class="pt">${p.title||p}</div><p class="pd">${p.description||""}</p></div>`).join("")}
</div></div></div>

<section>
<div class="sl2">CORE GIFT</div>
<p class="lt" style="margin-bottom:44px">${d.coreGift}</p>
<div class="sl2">OFFERINGS</div><h2>What I Bring</h2>
<div class="gg">${(d.gifts||[]).map((g,i)=>`<div class="gc"><div class="gi">0${i+1}</div><div class="gt">${g}</div></div>`).join("")}
</div></section>

<div class="ds"><div class="di">
<div class="sl2 pur">FRAMEWORK</div>
<h2 style="color:var(--g)">${d.framework}</h2>
<p style="max-width:600px;margin-bottom:44px">${d.frameworkReason}</p>
<div class="sl2">BRAND MANIFESTO</div>
<div class="mb"><p class="mt">${d.manifesto}</p></div>
</div></div>

<section>
<div class="sl2">CELESTIAL BLUEPRINT</div><h2>Written in Your Birth</h2>
<p style="margin-bottom:22px">${d.lifepathMeaning}</p><p>${d.signMeaning}</p>
</section>

<div class="ds"><div class="di">
<div class="sl2">DIGITAL PRESENCE</div>
<h2 style="font-family:'Playfair Display',serif;font-size:clamp(26px,4vw,48px);font-weight:700;color:#fff;margin-bottom:28px">Where I Show Up</h2>
<div class="dpg">
<div class="dpc"><div class="dpl">PRIMARY PLATFORM</div><div class="dpv">${d.digitalPlatform}</div></div>
<div class="dpc"><div class="dpl">CONTENT PILLAR</div><div class="dpv">${d.contentPillar}</div></div>
<div class="dpc"><div class="dpl">VOICE TONE</div><div class="dpv">${d.voiceTone}</div></div>
</div>
<div class="stb"><div class="dpl" style="margin-bottom:10px">READY TO PUBLISH · FIRST STATEMENT</div><p class="stt">"${d.firstStatement}"</p></div>
<div class="sl2" style="margin-top:44px">ACTIVATION ROADMAP</div>
<div class="rm">${(d.roadmap||[]).map((r,i)=>`<div class="ri"><div class="rn">0${i+1}</div><div class="rt">${r}</div></div>`).join("")}
</div></div></div>

<div class="bl2">
<div class="btn">✦ PROPHETIC BLESSING ✦</div>
<p class="bt">${d.blessing}</p>
<div class="bc">IF IT'S IN HIS WILL · IT'S IN MY WAY · ISAIAH 58:12</div>
</div>
<footer><div class="ft">LEGACY CHRONICLE</div><div class="fb">PURPOSEFUL CULTIVATIONS · REMNANT PROFILE</div><div class="fd">Generated ${NOW()}</div></footer>
</body></html>`;}

function makeHTML(tier,d,name,dob,role,lp,sign,elem){
switch(tier){
case”seed”:    return buildSeedHTML(d,name,dob,lp,sign,elem);
case”covenant”:return buildCovenantHTML(d,name,role,lp,sign,elem);
case”builder”: return buildBuilderHTML(d,name,role,lp,sign,elem);
case”legacy”:  return buildLegacyHTML(d,name,role,lp,sign,elem);
default:       return buildSeedHTML(d,name,dob,lp,sign,elem);
}
}

function downloadHTML(html,name,tier){
const a=document.createElement(“a”);
a.href=URL.createObjectURL(new Blob([html],{type:“text/html”}));
a.download=`${name.replace(/\s+/g,"-").toLowerCase()}-${tier}-remnant-profile.html`;
a.click();
}

// ── PLATFORM UI ────────────────────────────────────────────────────────────────
const G={
bg:”#08070b”,b2:”#0c0a10”,b3:”#100e15”,
gold:”#d4af37”,goldD:“rgba(212,175,55,0.65)”,goldP:“rgba(212,175,55,0.15)”,
text:“rgba(255,255,255,0.85)”,textD:“rgba(255,255,255,0.45)”,textDD:“rgba(255,255,255,0.22)”,
};
const cinzel={fontFamily:”‘Cinzel’,serif”};
const playfair={fontFamily:”‘Playfair Display’,serif”};

function Lbl({children,color,style={}}){
return<div style={{...cinzel,fontSize:9,letterSpacing:5,color:color||G.goldD,marginBottom:14,...style}}>{children}</div>;
}
function Div({style={}}){
return<div style={{height:1,background:`linear-gradient(90deg,transparent,${G.goldP},transparent)`,...style}}/>;
}

function Pill({children,accent=”#d4af37”,style={}}){
return<div style={{display:“inline-block”,padding:“6px 18px”,border:`1px solid ${accent}40`,borderRadius:30,
...cinzel,fontSize:9,letterSpacing:3,color:accent,...style}}>{children}</div>;
}

function StarBg(){
const c=useRef();
useEffect(()=>{
const cv=c.current;if(!cv)return;
const ctx=cv.getContext(“2d”);
cv.width=cv.offsetWidth;cv.height=cv.offsetHeight;
const stars=Array.from({length:90},()=>({x:Math.random()*cv.width,y:Math.random()*cv.height,r:Math.random()*1.2+.2,a:Math.random(),s:Math.random()*.006+.003}));
let f;
function draw(){
ctx.clearRect(0,0,cv.width,cv.height);
stars.forEach(s=>{s.a+=s.s;if(s.a>1||s.a<0)s.s*=-1;
ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.fillStyle=`rgba(212,175,55,${s.a*.45})`;ctx.fill();});
f=requestAnimationFrame(draw);
}
draw();return()=>cancelAnimationFrame(f);
},[]);
return<canvas ref={c} style={{position:“absolute”,inset:0,width:“100%”,height:“100%”,pointerEvents:“none”}}/>;
}

// Landing sections
function Hero({onStart}){
return(
<div style={{position:“relative”,minHeight:“100vh”,display:“flex”,flexDirection:“column”,alignItems:“center”,justifyContent:“center”,padding:“120px 32px 80px”,textAlign:“center”,overflow:“hidden”}}>
<StarBg/>
<div style={{position:“absolute”,inset:0,background:“radial-gradient(ellipse 70% 50% at 50% 0%,rgba(212,175,55,.07),transparent 55%)”}}/>
<div style={{position:“absolute”,inset:0,background:“radial-gradient(ellipse 45% 45% at 80% 80%,rgba(192,132,252,.05),transparent 60%)”}}/>
<div style={{position:“relative”,zIndex:1,maxWidth:760}}>
<Pill style={{marginBottom:32}}>✦ PURPOSEFUL CULTIVATIONS · REMNANT PLATFORM</Pill>
<div style={{...cinzel,fontSize:9,letterSpacing:6,color:G.goldD,marginBottom:24}}>MASTER 33 · ISAIAH 58:12</div>
<h1 style={{...playfair,fontSize:“clamp(36px,7vw,80px)”,fontWeight:700,lineHeight:.95,color:”#fff”,letterSpacing:-2,marginBottom:20}}>
Your Legacy,<br/><span style={{background:“linear-gradient(135deg,#d4af37,#f0d060,#b8902e)”,WebkitBackgroundClip:“text”,WebkitTextFillColor:“transparent”}}>Encoded.</span><br/>Your Presence, Deployed.
</h1>
<p style={{...playfair,fontSize:“clamp(14px,2vw,18px)”,fontStyle:“italic”,color:G.goldD,marginBottom:16}}>
“Not a résumé. Not a portfolio. A Remnant Profile.”
</p>
<p style={{fontSize:“clamp(13px,1.8vw,16px)”,color:G.textD,lineHeight:1.8,maxWidth:540,margin:“0 auto 48px”}}>
Enter your name and birthdate. Receive a cinematic, downloadable HTML page that declares who you ARE — faith-rooted, framework-aligned, and ready to deploy.
</p>
<div style={{display:“flex”,gap:14,justifyContent:“center”,flexWrap:“wrap”,marginBottom:56}}>
<button onClick={onStart} style={{padding:“15px 36px”,background:“linear-gradient(135deg,#d4af37,#b8902e)”,border:“none”,borderRadius:8,...cinzel,fontSize:10,letterSpacing:3,color:”#0a0804”,fontWeight:700,cursor:“pointer”}}>
REVEAL YOUR BLUEPRINT
</button>
<button style={{padding:“15px 36px”,background:“transparent”,border:“1px solid rgba(255,255,255,.14)”,borderRadius:8,...cinzel,fontSize:10,letterSpacing:3,color:G.textD,cursor:“pointer”}}>
SEE AN EXAMPLE
</button>
</div>
<div style={{display:“flex”,gap:36,justifyContent:“center”,flexWrap:“wrap”}}>
{[[“4 Tiers”,“Free to $67”],[“6 Frameworks”,“Strategic alignment”],[“HTML Download”,“Host anywhere”]].map(([a,b])=>(
<div key={a} style={{textAlign:“center”}}>
<div style={{...playfair,fontSize:22,fontWeight:700,color:G.gold}}>{a}</div>
<div style={{fontSize:11,color:G.textDD,...cinzel,letterSpacing:2}}>{b}</div>
</div>
))}
</div>
</div>
</div>
);
}

function HowItWorks(){
const steps=[
{n:“01”,icon:“✍️”,title:“Enter Your Details”,desc:“Name, date of birth, and an optional role or mission statement. That’s all we need.”},
{n:“02”,icon:“🔮”,title:“Select Your Tier”,desc:“From a free Profile Card to a full Legacy Chronicle — choose the depth your assignment requires.”},
{n:“03”,icon:“⚡”,title:“Receive Your Blueprint”,desc:“Download a fully designed HTML page. Host it, share it, print it. It’s yours forever.”},
];
return(
<div style={{padding:“96px 32px”,background:G.b2,borderTop:`1px solid rgba(255,255,255,.04)`,borderBottom:`1px solid rgba(255,255,255,.04)`}}>
<div style={{maxWidth:900,margin:“0 auto”,textAlign:“center”}}>
<Lbl style={{justifyContent:“center”,display:“flex”,marginBottom:12}}>HOW IT WORKS</Lbl>
<h2 style={{...playfair,fontSize:“clamp(26px,4vw,40px)”,fontWeight:700,color:”#fff”,marginBottom:56}}>Three Steps. One Revelation.</h2>
<div style={{display:“grid”,gridTemplateColumns:“repeat(auto-fit,minmax(240px,1fr))”,gap:24}}>
{steps.map(s=>(
<div key={s.n} style={{background:G.b3,border:`1px solid rgba(255,255,255,.06)`,borderRadius:16,padding:“32px 28px”,textAlign:“left”,position:“relative”,overflow:“hidden”}}>
<div style={{position:“absolute”,top:16,right:20,...cinzel,fontSize:32,fontWeight:700,color:“rgba(212,175,55,.06)”,letterSpacing:-2}}>{s.n}</div>
<div style={{fontSize:36,marginBottom:16}}>{s.icon}</div>
<div style={{...cinzel,fontSize:9,letterSpacing:3,color:G.goldD,marginBottom:8}}>STEP {s.n}</div>
<div style={{...playfair,fontSize:18,fontWeight:700,color:”#fff”,marginBottom:10}}>{s.title}</div>
<p style={{fontSize:13,color:G.textD,lineHeight:1.75}}>{s.desc}</p>
</div>
))}
</div>
</div>
</div>
);
}

function TierCards({onSelect}){
const order=[“seed”,“covenant”,“builder”,“legacy”];
return(
<div style={{padding:“96px 32px”}}>
<div style={{maxWidth:1060,margin:“0 auto”}}>
<div style={{textAlign:“center”,marginBottom:56}}>
<Lbl style={{display:“flex”,justifyContent:“center”,marginBottom:12}}>PRICING</Lbl>
<h2 style={{...playfair,fontSize:“clamp(26px,4vw,44px)”,fontWeight:700,color:”#fff”,marginBottom:12}}>Choose Your Tier</h2>
<p style={{fontSize:15,color:G.textD,maxWidth:500,margin:“0 auto”}}>Every tier produces a downloadable HTML file — your digital identity, ready to deploy from day one.</p>
</div>
<div style={{display:“grid”,gridTemplateColumns:“repeat(auto-fit,minmax(220px,1fr))”,gap:20}}>
{order.map(id=>{
const t=TIERS[id];
const isCov=id===“covenant”;
return(
<div key={id} style={{background:isCov?`linear-gradient(160deg,${G.b2},${G.b3})`:`${G.b2}`,border:`1px solid ${isCov?t.accent+"50":"rgba(255,255,255,.06)"}`,borderRadius:16,padding:“32px 24px”,display:“flex”,flexDirection:“column”,position:“relative”,overflow:“hidden”,transition:“transform .3s”}}>
{isCov&&<div style={{position:“absolute”,top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,transparent,${t.accent},transparent)`}}/>}
{t.badge&&<div style={{position:“absolute”,top:14,right:14,...cinzel,fontSize:8,letterSpacing:3,color:t.accent,background:`${t.accent}18`,padding:“4px 10px”,borderRadius:20}}>{t.badge}</div>}
<div style={{fontSize:32,marginBottom:16}}>{t.icon}</div>
<div style={{...cinzel,fontSize:11,letterSpacing:4,color:t.accent,marginBottom:6}}>{t.name.toUpperCase()}</div>
<div style={{...playfair,fontSize:clamp(28,5,36),fontWeight:700,color:”#fff”,marginBottom:4}}>{t.price}</div>
<div style={{fontSize:11,color:G.textDD,marginBottom:16,...cinzel,letterSpacing:2}}>{t.deliverable.toUpperCase()}</div>
<p style={{fontSize:12,color:G.textD,lineHeight:1.7,marginBottom:20,minHeight:40}}>{t.tagline}</p>
<Div style={{marginBottom:20}}/>
<ul style={{listStyle:“none”,marginBottom:24,flex:1}}>
{t.features.map(f=>(
<li key={f} style={{display:“flex”,gap:10,alignItems:“flex-start”,marginBottom:10}}>
<span style={{color:t.accent,fontSize:12,flexShrink:0,marginTop:1}}>✓</span>
<span style={{fontSize:12,color:G.textD,lineHeight:1.5}}>{f}</span>
</li>
))}
</ul>
<button onClick={()=>onSelect(id)} style={{width:“100%”,padding:“13px”,background:isCov?`linear-gradient(135deg,${t.accent},#b8902e)`:“transparent”,border:`1px solid ${t.accent}50`,borderRadius:8,...cinzel,fontSize:9,letterSpacing:3,color:isCov?”#0a0804”:t.accent,fontWeight:700,cursor:“pointer”}}>
{t.cta.toUpperCase()}
</button>
</div>
);
})}
</div>
</div>
</div>
);
}

function clamp(min,vw,max){return`clamp(${min}px,${vw}vw,${max}px)`;}

// Intake Modal
function IntakeModal({tier,onClose,onGenerate}){
const t=TIERS[tier];
const [name,setName]=useState(””);
const [dob,setDob]=useState(””);
const [role,setRole]=useState(””);
const [mission,setMission]=useState(””);
const [foc,setFoc]=useState(null);

const lp=dob?getLP(dob):null;
const sign=dob?getSign(dob):null;
const elem=sign?ELEM[sign]:null;
const ready=name.trim().length>=2&&dob.length===10;

const inp=(field,val,set,ph,type=“text”,rows=null)=>{
const isTA=!!rows;
const base={width:“100%”,background:foc===field?“rgba(212,175,55,.05)”:“rgba(255,255,255,.03)”,border:`1px solid ${foc===field?"rgba(212,175,55,.4)":"rgba(255,255,255,.08)"}`,borderRadius:8,padding:“14px 18px”,color:”#fff”,...playfair,fontSize:15,outline:“none”,transition:“all .3s”,boxSizing:“border-box”,resize:isTA?“vertical”:“none”};
if(isTA) return<textarea value={val} placeholder={ph} onChange={e=>set(e.target.value)} onFocus={()=>setFoc(field)} onBlur={()=>setFoc(null)} rows={rows} style={base}/>;
return<input type={type} value={val} placeholder={ph} onChange={e=>set(e.target.value)} onFocus={()=>setFoc(field)} onBlur={()=>setFoc(null)} style={{...base,colorScheme:type===“date”?“dark”:“light”}}/>;
};

return(
<div style={{position:“fixed”,inset:0,zIndex:200,display:“flex”,alignItems:“center”,justifyContent:“center”,padding:20,background:“rgba(0,0,0,.75)”,backdropFilter:“blur(8px)”}}>
<div style={{background:G.b2,border:`1px solid ${t.accent}30`,borderRadius:20,width:“100%”,maxWidth:520,maxHeight:“90vh”,overflowY:“auto”,position:“relative”}}>
<div style={{position:“sticky”,top:0,background:G.b2,padding:“24px 28px 0”,borderBottom:`1px solid rgba(255,255,255,.05)`,zIndex:1}}>
<div style={{display:“flex”,justifyContent:“space-between”,alignItems:“center”,marginBottom:16}}>
<div style={{display:“flex”,alignItems:“center”,gap:10}}>
<span style={{fontSize:24}}>{t.icon}</span>
<div>
<div style={{...cinzel,fontSize:9,letterSpacing:4,color:t.accent}}>{t.name.toUpperCase()} TIER</div>
<div style={{...playfair,fontSize:15,fontWeight:700,color:”#fff”}}>{t.price} · {t.deliverable}</div>
</div>
</div>
<button onClick={onClose} style={{background:“transparent”,border:“none”,color:G.textDD,fontSize:20,cursor:“pointer”,padding:4}}>✕</button>
</div>
</div>
<div style={{padding:“28px”}}>
<div style={{display:“flex”,flexDirection:“column”,gap:16}}>
<div>
<div style={{...cinzel,fontSize:8,letterSpacing:3,color:G.textDD,marginBottom:8}}>FULL NAME <span style={{color:“rgba(212,175,55,.5)”}}>*</span></div>
{inp(“name”,name,setName,“Enter your full name”)}
</div>
<div>
<div style={{...cinzel,fontSize:8,letterSpacing:3,color:G.textDD,marginBottom:8}}>DATE OF BIRTH <span style={{color:“rgba(212,175,55,.5)”}}>*</span></div>
{inp(“dob”,dob,setDob,””,“date”)}
</div>
{dob&&(
<div style={{display:“flex”,gap:10,flexWrap:“wrap”}}>
{[[“Life Path”,lp,MASTER.includes(lp)?“Master”:null],[“Sun Sign”,sign,null],[“Element”,elem?`${EICO[elem]} ${elem}`:null,null]].map(([k,v,sub])=>v&&(
<div key={k} style={{flex:“1 1 110px”,background:“rgba(212,175,55,.05)”,border:`1px solid ${G.goldP}`,borderRadius:8,padding:“10px 12px”,textAlign:“center”}}>
<div style={{...cinzel,fontSize:7,letterSpacing:2,color:G.goldD,marginBottom:4}}>{k}</div>
<div style={{...playfair,fontSize:16,fontWeight:700,color:G.gold}}>{v}</div>
{sub&&<div style={{fontSize:7,color:“rgba(212,175,55,.5)”,letterSpacing:1}}>{sub}</div>}
</div>
))}
</div>
)}
<div>
<div style={{...cinzel,fontSize:8,letterSpacing:3,color:G.textDD,marginBottom:8}}>PROFESSION OR ROLE <span style={{color:G.textDD}}>(optional)</span></div>
{inp(“role”,role,setRole,“e.g. Nonprofit Director, Entrepreneur, Educator”)}
</div>
{(tier===“builder”||tier===“legacy”)&&(
<div>
<div style={{...cinzel,fontSize:8,letterSpacing:3,color:G.textDD,marginBottom:8}}>PERSONAL MISSION <span style={{color:G.textDD}}>(optional)</span></div>
{inp(“mission”,mission,setMission,“Describe your mission in one sentence…”,null,3)}
</div>
)}
<button onClick={()=>ready&&onGenerate({name:name.trim(),dob,role,mission})} disabled={!ready} style={{padding:“16px”,background:ready?`linear-gradient(135deg,${t.accent},#b8902e)`:“rgba(255,255,255,.05)”,border:“none”,borderRadius:8,...cinzel,fontSize:10,letterSpacing:3,color:ready?”#0a0804”:“rgba(255,255,255,.2)”,fontWeight:700,cursor:ready?“pointer”:“not-allowed”,marginTop:4}}>
GENERATE MY {tier.toUpperCase()} PROFILE
</button>
<div style={{textAlign:“center”,...cinzel,fontSize:8,letterSpacing:2,color:G.textDD}}>Your data is used only to generate your profile. We don’t store it.</div>
</div>
</div>
</div>
</div>
);
}

function LoadingScreen({tier,name}){
const t=TIERS[tier];
const [ph,setPh]=useState(0);
const phases=[“Reading the celestial record…”,“Calculating your life path vibration…”,“Aligning your framework…”,“Decoding your digital calling…”,“Architecting your blueprint…”,“Rendering your legacy…”];
useEffect(()=>{const i=setInterval(()=>setPh(p=>(p+1)%phases.length),1800);return()=>clearInterval(i);},[]);
return(
<div style={{position:“fixed”,inset:0,zIndex:200,background:G.bg,display:“flex”,flexDirection:“column”,alignItems:“center”,justifyContent:“center”,textAlign:“center”,padding:32}}>
<StarBg/>
<div style={{position:“relative”,zIndex:1}}>
<div style={{fontSize:64,marginBottom:24}}>{t.icon}</div>
<div style={{width:64,height:64,margin:“0 auto 32px”,border:“2px solid rgba(212,175,55,.15)”,borderTop:`2px solid ${t.accent}`,borderRadius:“50%”,animation:“spin 1.2s linear infinite”}}/>
<div style={{...playfair,fontSize:“clamp(18px,3vw,26px)”,fontWeight:700,color:”#fff”,marginBottom:12}}>
Decoding {name}’s Blueprint
</div>
<Pill accent={t.accent}>{t.name.toUpperCase()} TIER · {t.deliverable}</Pill>
<div style={{marginTop:24,...cinzel,fontSize:10,letterSpacing:3,color:G.goldD,animation:“pulse 1.8s ease-in-out infinite”}}>{phases[ph]}</div>
<style>{`@keyframes spin{to{transform:rotate(360deg)}}@keyframes pulse{0%,100%{opacity:.4}50%{opacity:1}}`}</style>
</div>
</div>
);
}

function PreviewScreen({tier,html,name,onReset,onDownload}){
const t=TIERS[tier];
const [tab,setTab]=useState(“preview”);
return(
<div style={{position:“fixed”,inset:0,zIndex:200,background:G.bg,display:“flex”,flexDirection:“column”}}>
{/* Top bar */}
<div style={{height:56,padding:“0 24px”,display:“flex”,alignItems:“center”,justifyContent:“space-between”,background:G.b2,borderBottom:“1px solid rgba(255,255,255,.06)”,flexShrink:0}}>
<div style={{display:“flex”,alignItems:“center”,gap:12}}>
<span style={{fontSize:18}}>{t.icon}</span>
<div style={{...cinzel,fontSize:9,letterSpacing:3,color:G.textD}}>{name.toUpperCase()} · {t.name.toUpperCase()} TIER</div>
</div>
<div style={{display:“flex”,gap:10}}>
{[“preview”,“code”].map(tb=>(
<button key={tb} onClick={()=>setTab(tb)} style={{padding:“6px 16px”,background:tab===tb?“rgba(212,175,55,.12)”:“transparent”,border:`1px solid ${tab===tb?G.goldP:"rgba(255,255,255,.06)"}`,borderRadius:6,...cinzel,fontSize:8,letterSpacing:3,color:tab===tb?G.gold:G.textDD,cursor:“pointer”}}>
{tb.toUpperCase()}
</button>
))}
<button onClick={onDownload} style={{padding:“6px 18px”,background:`linear-gradient(135deg,${t.accent},#b8902e)`,border:“none”,borderRadius:6,...cinzel,fontSize:8,letterSpacing:3,color:”#0a0804”,fontWeight:700,cursor:“pointer”}}>
⬇ DOWNLOAD HTML
</button>
<button onClick={onReset} style={{padding:“6px 16px”,background:“transparent”,border:“1px solid rgba(255,255,255,.08)”,borderRadius:6,...cinzel,fontSize:8,letterSpacing:3,color:G.textDD,cursor:“pointer”}}>
✕ CLOSE
</button>
</div>
</div>
{/* Content */}
<div style={{flex:1,overflow:“hidden”,position:“relative”}}>
{tab===“preview”?(
<iframe srcDoc={html} title=“Profile Preview” style={{width:“100%”,height:“100%”,border:“none”,background:”#07060a”}} sandbox=“allow-same-origin”/>
):(
<textarea readOnly value={html} style={{width:“100%”,height:“100%”,background:”#0a0804”,color:“rgba(255,255,255,.7)”,border:“none”,padding:24,fontFamily:“monospace”,fontSize:12,lineHeight:1.5,resize:“none”,outline:“none”}}/>
)}
</div>
{/* Bottom bar */}
<div style={{padding:“12px 24px”,background:G.b2,borderTop:“1px solid rgba(255,255,255,.04)”,display:“flex”,alignItems:“center”,justifyContent:“space-between”,flexShrink:0}}>
<div style={{...cinzel,fontSize:8,letterSpacing:3,color:G.textDD}}>Your HTML profile is ready. Download, host, or share.</div>
<div style={{...cinzel,fontSize:8,letterSpacing:3,color:“rgba(212,175,55,.35)”}}>PURPOSEFUL CULTIVATIONS · ISAIAH 58:12</div>
</div>
</div>
);
}

function Footer(){
return(
<div style={{background:G.b2,borderTop:`1px solid rgba(255,255,255,.04)`,padding:“56px 32px”,textAlign:“center”}}>
<div style={{...cinzel,fontSize:14,fontWeight:700,color:G.gold,marginBottom:8}}>33</div>
<div style={{...cinzel,fontSize:10,letterSpacing:5,color:G.textDD,marginBottom:16}}>PURPOSEFUL CULTIVATIONS</div>
<Div style={{maxWidth:200,margin:“0 auto 16px”}}/>
<p style={{...playfair,fontSize:14,fontStyle:“italic”,color:G.goldD,marginBottom:8}}>“If it’s in His will, it’s in my way — because my way is His will.”</p>
<div style={{...cinzel,fontSize:8,letterSpacing:4,color:G.textDD}}>ISAIAH 58:12 · MASTER 33 · {new Date().getFullYear()}</div>
</div>
);
}

// ── MAIN APP ───────────────────────────────────────────────────────────────────
export default function RemnantPlatform(){
const [view,setView]=useState(“landing”); // landing|intake|generating|preview
const [tier,setTier]=useState(null);
const [form,setForm]=useState(null);
const [html,setHtml]=useState(””);
const [err,setErr]=useState(””);

async function handleGenerate(formData){
setForm(formData);setView(“generating”);setErr(””);
try{
const {name,dob,role,mission}=formData;
const lp=getLP(dob);const sign=getSign(dob);const elem=ELEM[sign];
const data=await fetchBlueprint(tier,name,dob,role,mission,lp,sign,elem);
const h=makeHTML(tier,data,name,dob,role,lp,sign,elem);
setHtml(h);setView(“preview”);
}catch(e){setErr(“Generation encountered an error. Please try again.”);setView(“intake”);}
}

function reset(){setView(“landing”);setTier(null);setForm(null);setHtml(””);setErr(””);}

return(
<div style={{minHeight:“100vh”,background:G.bg,fontFamily:”‘Lato’,sans-serif”}}>
<style>{`${FONTS}*{box-sizing:border-box}input[type=date]::-webkit-calendar-picker-indicator{filter:invert(.5);cursor:pointer}input::placeholder,textarea::placeholder{color:rgba(255,255,255,.22)}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:rgba(212,175,55,.2);border-radius:2px}`}</style>

  {/* Fixed Nav */}
  {(view==="landing")&&(
    <nav style={{position:"fixed",top:0,left:0,right:0,zIndex:100,height:60,padding:"0 32px",display:"flex",alignItems:"center",justifyContent:"space-between",background:"rgba(8,7,11,.92)",backdropFilter:"blur(14px)",borderBottom:"1px solid rgba(255,255,255,.05)"}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <div style={{width:30,height:30,borderRadius:7,background:"linear-gradient(135deg,#d4af37,#b8902e)",display:"flex",alignItems:"center",justifyContent:"center",...cinzel,fontSize:12,fontWeight:700,color:"#0a0804"}}>33</div>
        <span style={{...cinzel,fontSize:10,letterSpacing:3,color:"rgba(255,255,255,.8)"}}>PURPOSEFUL CULTIVATIONS</span>
      </div>
      <button onClick={()=>document.getElementById("tiers")?.scrollIntoView({behavior:"smooth"})} style={{padding:"8px 22px",background:"linear-gradient(135deg,#d4af37,#b8902e)",border:"none",borderRadius:6,...cinzel,fontSize:9,letterSpacing:3,color:"#0a0804",fontWeight:700,cursor:"pointer"}}>
        GET STARTED
      </button>
    </nav>
  )}

  {/* Landing */}
  {view==="landing"&&(
    <>
      <Hero onStart={()=>document.getElementById("tiers")?.scrollIntoView({behavior:"smooth"})}/>
      <HowItWorks/>
      <div id="tiers"><TierCards onSelect={id=>{setTier(id);setView("intake");}}/></div>
      <Footer/>
    </>
  )}

  {/* Intake Modal */}
  {view==="intake"&&tier&&(
    <>
      <Hero onStart={()=>{}}/>
      <IntakeModal tier={tier} onClose={reset} onGenerate={handleGenerate}/>
      {err&&<div style={{position:"fixed",bottom:24,left:"50%",transform:"translateX(-50%)",background:"rgba(239,68,68,.12)",border:"1px solid rgba(239,68,68,.3)",borderRadius:8,padding:"12px 24px",...cinzel,fontSize:9,letterSpacing:2,color:"rgba(239,68,68,.85)",zIndex:300}}>{err}</div>}
    </>
  )}

  {/* Generating */}
  {view==="generating"&&<LoadingScreen tier={tier} name={form?.name||""}/>}

  {/* Preview */}
  {view==="preview"&&html&&(
    <PreviewScreen tier={tier} html={html} name={form?.name||""} onReset={reset} onDownload={()=>downloadHTML(html,form?.name||"profile",tier)}/>
  )}
</div>

);
}
