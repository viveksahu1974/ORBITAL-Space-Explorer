(()=>{
'use strict';
const TAU=Math.PI*2, DEG=Math.PI/180;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const mix=(a,b,t)=>a+(b-a)*t;
const v3=(x=0,y=0,z=0)=>({x,y,z});
const add=(a,b)=>({x:a.x+b.x,y:a.y+b.y,z:a.z+b.z});
const sub=(a,b)=>({x:a.x-b.x,y:a.y-b.y,z:a.z-b.z});
const mul=(a,s)=>({x:a.x*s,y:a.y*s,z:a.z*s});
const dot=(a,b)=>a.x*b.x+a.y*b.y+a.z*b.z;
const cross=(a,b)=>({x:a.y*b.z-a.z*b.y,y:a.z*b.x-a.x*b.z,z:a.x*b.y-a.y*b.x});
const len=a=>Math.hypot(a.x,a.y,a.z);
const norm=a=>{let L=len(a)||1;return {x:a.x/L,y:a.y/L,z:a.z/L}};
const canvas=document.getElementById('space'),ctx=canvas.getContext('2d');
const menuOverlay=document.getElementById('menuOverlay');
const objectNav=document.getElementById('objectNav');
const panel=document.getElementById('panel');
const hoverTip=document.getElementById('hoverTip');
const liveText=document.getElementById('liveText');
const introEyebrow=document.getElementById('introEyebrow');
const introTitle=document.getElementById('introTitle');
const introText=document.getElementById('introText');
const panelKicker=document.getElementById('panelKicker');
const entityMark=document.getElementById('entityMark');
const entityName=document.getElementById('entityName');
const entityType=document.getElementById('entityType');
const statsWrap=document.getElementById('stats');
const factsWrap=document.getElementById('facts');
const panelFooter=document.getElementById('panelFooter');
const number=document.getElementById('number');
const mobileOpen=document.getElementById('mobileOpen');

let W=innerWidth,H=innerHeight,DPR=Math.min(devicePixelRatio||1,2),F=860;
let running=true,showLabels=true,showOrbits=true;
let speed=1,lastT=0,elapsed=0,scene='solar';
let selectedKey='sun',hoveredKey=null,resizeNeeded=true;
let pointerMap=new Map(),pinchDist=0,pinchMid=null,dragDistance=0;
let parallaxTarget={x:0,y:0},parallax={x:0,y:0};

const sceneMeta={
  solar:{
    live:'LIVE SOLAR SYSTEM SIMULATION',
    eyebrow:'BEYOND THE HORIZON',
    title:'Explore our<br><span>Solar System.</span>',
    text:'The Sun, eight extraordinary worlds, one moon system, and a moving star field. Click any body to begin your journey.',
    kicker:'CELESTIAL BODY',footer:'Sun and planet facts are approximate NASA-style values; orbital spacing and sizes are stylized for a cleaner interactive view.'
  },
  milkyway:{
    live:'LIVE MILKY WAY OVERVIEW',
    eyebrow:'GALACTIC SCALE',
    title:'Step inside the<br><span>Milky Way.</span>',
    text:'A stylized galaxy view with spiral arms, our Solar neighborhood, Orion Spur, and the supermassive black hole Sagittarius A*.',
    kicker:'GALACTIC FEATURE',footer:'The Milky Way scene is an educational visualization with compressed scale and enhanced glow for readability.'
  },
  blackhole:{
    live:'LIVE BLACK HOLE VISUALIZER',
    eyebrow:'EXTREME SPACETIME',
    title:'Visualize a<br><span>Black Hole.</span>',
    text:'Watch an event horizon, accretion disk, jets, and light warp effects while exploring the parts of an active black hole system.',
    kicker:'BLACK HOLE FEATURE',footer:'This dramatic black hole scene is artistic, while the facts reflect common astronomy references and simplified explanations.'
  }
};

const solarBodies=[
  {key:'sun',name:'Sun',type:'Star',color:'#ffbe63',highlight:'#fff2a9',size:9.2,orbit:0,day:'~27 Earth days',year:'Center of system',distance:'0 km',temp:'~5,500 °C surface',moons:'0',label:'Sun',accent:'#f9b35e',facts:['The Sun contains about 99.8% of the mass in the Solar System.','Energy is produced by nuclear fusion in its core.','Sunlight takes about 8 minutes 20 seconds to reach Earth.'],stats:[['Diameter','1.39 million km'],['Mass','1.989 × 10^30 kg'],['Distance from Earth','149.6 million km'],['Spectral type','G-type main-sequence'],['Age','~4.6 billion years'],['Rotation','Differential']],desc:'Our life-giving star at the center of the Solar System.'},
  {key:'mercury',name:'Mercury',type:'Terrestrial planet',color:'#b9b4aa',highlight:'#f0e9da',size:1.15,orbit:14,period:88,spin:58.6,day:'58.6 Earth days',year:'88 Earth days',distance:'57.9 million km',temp:'−173 to 427 °C',moons:'0',accent:'#c1b9ad',facts:['Mercury is the smallest planet in the Solar System.','It has almost no atmosphere, so temperatures swing wildly.','A day on Mercury is longer than its year.'],stats:[['Diameter','4,879 km'],['Avg. distance','57.9 million km'],['Moons','0'],['Gravity','3.7 m/s²'],['Orbit speed','47.4 km/s'],['Atmosphere','Very thin']]},
  {key:'venus',name:'Venus',type:'Terrestrial planet',color:'#e0b06a',highlight:'#fff1c0',size:1.7,orbit:20,period:225,spin:-243,day:'243 Earth days',year:'225 Earth days',distance:'108.2 million km',temp:'~465 °C',moons:'0',accent:'#e5b56b',facts:['Venus spins backwards compared with most planets.','It is the hottest planet because of an extreme greenhouse effect.','Its thick clouds are made mostly of sulfuric acid droplets.'],stats:[['Diameter','12,104 km'],['Avg. distance','108.2 million km'],['Moons','0'],['Pressure','~92× Earth'],['Cloud cover','Very dense'],['Atmosphere','CO₂ rich']]},
  {key:'earth',name:'Earth',type:'Terrestrial planet',color:'#4d86d9',highlight:'#bde5ff',size:1.88,orbit:28,period:365,spin:1,day:'24 hours',year:'365 days',distance:'149.6 million km',temp:'~15 °C average',moons:'1',accent:'#4f86e3',facts:['Earth is the only known world with stable liquid water at the surface.','About 71% of Earth’s surface is covered by water.','Its atmosphere protects life and helps regulate temperature.'],stats:[['Diameter','12,742 km'],['Avg. distance','149.6 million km'],['Moons','1'],['Atmosphere','Nitrogen & oxygen'],['Escape velocity','11.2 km/s'],['Life','Known to exist']]},
  {key:'mars',name:'Mars',type:'Terrestrial planet',color:'#d96e47',highlight:'#ffd2b3',size:1.45,orbit:36,period:687,spin:1.03,day:'24.6 hours',year:'687 days',distance:'227.9 million km',temp:'~−63 °C',moons:'2',accent:'#da7452',facts:['Mars is known as the Red Planet because of iron oxide on its surface.','It has the tallest volcano in the Solar System, Olympus Mons.','Ancient Mars likely had rivers and lakes.'],stats:[['Diameter','6,779 km'],['Avg. distance','227.9 million km'],['Moons','2'],['Gravity','3.71 m/s²'],['Main feature','Olympus Mons'],['Atmosphere','Thin CO₂']]},
  {key:'jupiter',name:'Jupiter',type:'Gas giant',color:'#d8b79a',highlight:'#fff1d9',size:4.3,orbit:49,period:4333,spin:.41,day:'9.9 hours',year:'11.86 Earth years',distance:'778.5 million km',temp:'~−145 °C',moons:'95+',accent:'#cfa885',facts:['Jupiter is the largest planet in the Solar System.','The Great Red Spot is a giant storm larger than Earth.','Its strong magnetic field traps charged particles.'],stats:[['Diameter','139,820 km'],['Avg. distance','778.5 million km'],['Moons','95+'],['Great Red Spot','Persistent storm'],['Rotation','Very fast'],['Composition','Hydrogen & helium']]},
  {key:'saturn',name:'Saturn',type:'Gas giant',color:'#d9c48a',highlight:'#fff6d8',size:3.9,orbit:62,period:10759,spin:.44,day:'10.7 hours',year:'29.4 Earth years',distance:'1.43 billion km',temp:'~−178 °C',moons:'140+',accent:'#dac78f',facts:['Saturn’s rings are made mostly of ice and rock.','It is so low-density it would float in a giant ocean.','Titan, its largest moon, has lakes of liquid methane.'],stats:[['Diameter','116,460 km'],['Avg. distance','1.43 billion km'],['Moons','140+'],['Ring system','Extensive'],['Density','Lower than water'],['Composition','Hydrogen & helium']]},
  {key:'uranus',name:'Uranus',type:'Ice giant',color:'#84d6d8',highlight:'#ebffff',size:2.75,orbit:75,period:30687,spin:-.72,day:'17.2 hours',year:'84 Earth years',distance:'2.87 billion km',temp:'~−224 °C',moons:'27',accent:'#8fdbdf',facts:['Uranus rotates almost on its side.','It has a cold atmosphere and a pale blue-green color from methane.','Its unusual tilt may have been caused by an ancient collision.'],stats:[['Diameter','50,724 km'],['Avg. distance','2.87 billion km'],['Moons','27'],['Tilt','~98°'],['Color source','Methane'],['Classification','Ice giant']]},
  {key:'neptune',name:'Neptune',type:'Ice giant',color:'#4b84dc',highlight:'#cde9ff',size:2.68,orbit:88,period:60190,spin:.67,day:'16.1 hours',year:'164.8 Earth years',distance:'4.50 billion km',temp:'~−214 °C',moons:'14',accent:'#4d88ea',facts:['Neptune has some of the fastest winds in the Solar System.','It was the first planet found using mathematical predictions.','Its deep blue color comes partly from methane.'],stats:[['Diameter','49,244 km'],['Avg. distance','4.50 billion km'],['Moons','14'],['Winds','Up to ~2,100 km/h'],['Discovery','1846'],['Classification','Ice giant']]}
];
const solarMap=Object.fromEntries(solarBodies.map((d,i)=>[d.key,{...d,index:i}]));

const milkyFeatures=[
  {key:'milkyway',name:'Milky Way',type:'Barred spiral galaxy',color:'#8fcbf5',highlight:'#ffffff',accent:'#8ad0ff',facts:['The Milky Way contains hundreds of billions of stars.','It is a barred spiral galaxy with multiple spiral arms.','Our Solar System lives in the Orion Spur, far from the galactic center.'],stats:[['Diameter','~100,000–120,000 ly'],['Stars','100–400 billion'],['Age','~13.6 billion years'],['Shape','Barred spiral'],['Rotation','~225–250 Myr / Sun orbit'],['Group','Local Group']],desc:'Our home galaxy, seen from a stylized above-the-disk perspective.'},
  {key:'sgrA',name:'Sagittarius A*',type:'Supermassive black hole',color:'#d8a8ff',highlight:'#ffe3ff',accent:'#df9bff',facts:['Sagittarius A* lies at the center of the Milky Way.','Its mass is about four million times that of the Sun.','It is mostly quiet compared with actively feeding galactic nuclei.'],stats:[['Mass','~4.1 million Suns'],['Location','Galactic center'],['Distance from Earth','~26,000 ly'],['Type','Supermassive black hole'],['Activity','Relatively quiet'],['Role','Anchors the galaxy core']],desc:'The Milky Way’s central black hole.'},
  {key:'orion',name:'Orion Spur',type:'Minor spiral arm',color:'#86d8e8',highlight:'#e7ffff',accent:'#72dfeb',facts:['The Orion Spur is a small arm segment between larger spiral arms.','Our Solar System is located within this spur.','It links the Sagittarius and Perseus arms.'],stats:[['Also called','Local Spur'],['Contains','Sun & nearby stars'],['Position','Between major arms'],['Scale','Thousands of light-years'],['Neighborhood','Solar System region'],['Importance','Our local galactic address']],desc:'The small spiral feature that contains our neighborhood.'},
  {key:'solarneighborhood',name:'Solar Neighborhood',type:'Local galactic region',color:'#f3c36f',highlight:'#fff6cf',accent:'#f4c675',facts:['The Solar neighborhood is the nearby region around the Sun.','It includes many familiar nearby stars and stellar systems.','This view marks the Sun’s broad location, not every nearby star.'],stats:[['Center object','The Sun'],['Region','Local stellar neighborhood'],['Distance to core','~26,000 ly'],['Orbit around core','~230 million years'],['Galactic speed','~220 km/s'],['View style','Illustrative marker']],desc:'A marker showing where our Solar System sits in the galaxy.'}
];
const milkyMap=Object.fromEntries(milkyFeatures.map((d,i)=>[d.key,{...d,index:i}]));

const blackholeFeatures=[
  {key:'bh',name:'Black Hole',type:'Collapsed spacetime region',color:'#111114',highlight:'#6d5878',accent:'#c89ad7',facts:['A black hole’s gravity is so strong that not even light escapes from inside the event horizon.','Black holes can form from massive stars or grow to supermassive sizes in galaxy centers.','We usually “see” black holes by observing the hot material around them.'],stats:[['Visible surface','None'],['Escape speed','Greater than light at horizon'],['Density','Extremely compact'],['Types','Stellar, intermediate, supermassive'],['Discovery tool','Gravity & surrounding light'],['Core idea','Warped spacetime']],desc:'The central black region of the scene.'},
  {key:'horizon',name:'Event Horizon',type:'Point of no return',color:'#42152d',highlight:'#f0b2d9',accent:'#ef9fd6',facts:['The event horizon is the boundary around a black hole.','Crossing it means nothing can return to the outside universe.','Its size depends on the black hole’s mass.'],stats:[['Meaning','No-return boundary'],['Named after','Events beyond observation'],['Shape','Roughly spherical'],['Schwarzschild radius','Mass dependent'],['Seen directly?','No'],['Observed via','Shadow & disk light']],desc:'The spherical boundary around the black hole.'},
  {key:'disk',name:'Accretion Disk',type:'Superheated infalling matter',color:'#ff9553',highlight:'#ffe6c6',accent:'#ff9a5a',facts:['Gas spirals inward and heats to extreme temperatures.','The accretion disk often shines brighter than the black hole itself.','Friction and magnetic fields help the gas lose energy.'],stats:[['Temperature','Thousands to millions of °C'],['Brightness','Very high'],['Composition','Gas, plasma, dust'],['Motion','Rapid orbit'],['Energy source','Gravitational potential'],['Visibility','Main luminous feature']],desc:'The glowing, hot material orbiting the hole.'},
  {key:'jet',name:'Relativistic Jet',type:'High-energy outflow',color:'#88cdf5',highlight:'#f0fbff',accent:'#8cd4ff',facts:['Some black holes launch powerful jets perpendicular to the disk.','Jets are shaped by magnetic fields and can extend huge distances.','They move close to the speed of light.'],stats:[['Direction','Along spin axis'],['Speed','Near light speed'],['Power source','Disk + magnetic fields'],['Composition','Charged particles'],['Length','Can span light-years'],['Common around','Active black holes']],desc:'Twin particle streams erupting above and below the disk.'}
];
const blackholeMap=Object.fromEntries(blackholeFeatures.map((d,i)=>[d.key,{...d,index:i}]));

const sceneObjects={solar:solarBodies,milkyway:milkyFeatures,blackhole:blackholeFeatures};
const sceneMaps={solar:solarMap,milkyway:milkyMap,blackhole:blackholeMap};

let cam={yaw:-0.36,pitch:0.76,dist:176,target:v3(),targetDesired:v3()};
let sceneZoom={solar:176,milkyway:164,blackhole:112};
let tracking=true;
let currentProjections=[];

const starsFar=makeStars(280,.25),starsNear=makeStars(160,.5),dust=makeDust(30),mwBand=makeMilkyWayBand(260);
const asteroidRing=Array.from({length:200},(_,i)=>({a:44+Math.random()*5.5,ang:Math.random()*TAU,y:(Math.random()-.5)*.8,size:.25+Math.random()*.6,alpha:.18+Math.random()*.35}));
const galaxyParticles=makeGalaxyParticles();
const gasBlobs=Array.from({length:34},(_,i)=>({a:1.1+Math.random()*1.8,ang:Math.random()*TAU,h:(Math.random()-.5)*.1,speed:.25+Math.random()*.5,size:3+Math.random()*9,hue:20+Math.random()*40}));

function makeStars(count,depth){return Array.from({length:count},()=>({x:Math.random(),y:Math.random(),r:Math.random()*1.8+.4,a:.18+Math.random()*.55,depth,phase:Math.random()*TAU,tint:Math.random()<.1?'182,221,255':Math.random()<.12?'255,214,178':'226,237,255'}));}
function makeDust(count){return Array.from({length:count},()=>({x:Math.random(),y:Math.random(),r:60+Math.random()*240,a:.04+Math.random()*.08,c:Math.random()<.5?'46,82,150':'119,72,144'}));}
function makeMilkyWayBand(count){return Array.from({length:count},()=>({x:Math.random(),y:(Math.random()-.5)*.13,ox:(Math.random()-.5)*.02,alpha:.035+Math.random()*.05,size:.7+Math.random()*1.8}));}
function makeGalaxyParticles(){
  const arr=[]; const arms=4;
  for(let i=0;i<1600;i++){
    const arm=i%arms; const t=Math.random(); const radius=Math.pow(t,.9)*68+1.5;
    const ang=arm*(TAU/arms)+radius*.23+(Math.random()-.5)*.5;
    const z=(Math.random()-.5)*2.1*(1-radius/88);
    const bright=Math.random()>.87;
    arr.push({radius,ang,z,size:bright?(1.6+Math.random()*2.7):(.45+Math.random()*1.2),alpha:bright?(.45+Math.random()*.35):(.08+Math.random()*.18),color:bright?`255,${210+Math.floor(Math.random()*30)},${188+Math.floor(Math.random()*55)}`:`${150+Math.floor(Math.random()*70)},${190+Math.floor(Math.random()*50)},255`});
  }
  return arr;
}

function resize(){W=innerWidth;H=innerHeight;DPR=Math.min(devicePixelRatio||1,2);canvas.width=Math.floor(W*DPR);canvas.height=Math.floor(H*DPR);canvas.style.width=W+'px';canvas.style.height=H+'px';ctx.setTransform(DPR,0,0,DPR,0,0);F=Math.min(W,H)*1.08;resizeNeeded=false;}
addEventListener('resize',()=>resizeNeeded=true);

function setSpeedSlider(v){speed=v===0?0:Math.pow(10,(v-40)/36);document.getElementById('speedValue').textContent=speed===0?'0×':speed<10?speed.toFixed(1)+'×':Math.round(speed)+'×';document.getElementById('speed').style.setProperty('--filled',v+'%');}
setSpeedSlider(40);
document.getElementById('speed').addEventListener('input',e=>setSpeedSlider(Number(e.target.value)));
function setPlay(v){running=v;document.getElementById('playIcon').innerHTML=v?'<path d="M8 5h3v14H8zm6 0h3v14h-3z"/>':'<path d="m7 4 13 8-13 8z"/>';document.getElementById('play').title=v?'Pause simulation':'Play simulation';document.getElementById('play').setAttribute('aria-label',document.getElementById('play').title)}
document.getElementById('play').addEventListener('click',()=>setPlay(!running));

function populateNav(){
  objectNav.innerHTML='';
  const list=sceneObjects[scene];
  list.forEach(obj=>{
    const b=document.createElement('button'); b.className='pill'+(selectedKey===obj.key?' active':''); b.textContent=obj.name; b.addEventListener('click',()=>focusKey(obj.key,true)); objectNav.appendChild(b);
  });
}

function updateSceneMeta(){
  const meta=sceneMeta[scene];
  liveText.textContent=meta.live; introEyebrow.textContent=meta.eyebrow; introTitle.innerHTML=meta.title; introText.textContent=meta.text; panelKicker.textContent=meta.kicker; panelFooter.textContent=meta.footer;
}

function updatePanel(){
  const list=sceneObjects[scene], map=sceneMaps[scene], item=map[selectedKey] || list[0];
  number.textContent=`${String(item.index+1).padStart(2,'0')} / ${String(list.length).padStart(2,'0')}`;
  entityName.textContent=item.name; entityType.textContent=item.type; entityMark.style.setProperty('--accent',item.accent||item.color||'#87c4ed'); entityMark.style.setProperty('--highlight',item.highlight||'#dff4ff'); entityMark.style.background=item.key==='bh'?`radial-gradient(circle at 44% 41%,#050505 0 34%,#1e1a22 35%,#090a0c 65%,#000 100%)`: item.key==='disk'?`radial-gradient(circle at 30% 25%,#ffe6c8,#ff9d59 60%,#5e2606)` : item.key==='jet'?`radial-gradient(circle at 36% 30%,#edf8ff,#8dd6ff 60%,#24588d)` : `radial-gradient(circle at 30% 28%,${item.highlight||'#cfeeff'},${item.accent||item.color||'#4a80c4'} 66%,#132239)`;
  statsWrap.innerHTML='';
  (item.stats||[]).forEach(([label,val])=>{const el=document.createElement('div');el.innerHTML=`<div class="stat-label">${label}</div><div class="stat-value">${val}</div>`;statsWrap.appendChild(el)});
  factsWrap.innerHTML='';
  (item.facts||[]).forEach(text=>{const li=document.createElement('li');li.textContent=text;factsWrap.appendChild(li)});
  [...objectNav.children].forEach((b,i)=>b.classList.toggle('active',sceneObjects[scene][i].key===item.key));
}

function resetCamera(){tracking=true;cam.yaw=scene==='blackhole'?-0.2:-0.36;cam.pitch=scene==='milkyway'?0.92:scene==='blackhole'?0.5:0.76;sceneZoom[scene]=scene==='solar'?176:scene==='milkyway'?164:112;cam.dist=sceneZoom[scene];cam.targetDesired=v3();if(scene==='solar'&&selectedKey!=='sun')cam.targetDesired=bodyPosition(solarMap[selectedKey],elapsed);panel.classList.remove('open')}
document.getElementById('reset').addEventListener('click',resetCamera);

document.getElementById('toggleLabels').addEventListener('click',function(){showLabels=!showLabels;this.classList.toggle('on',showLabels);this.setAttribute('aria-pressed',String(showLabels))});
document.getElementById('toggleOrbits').addEventListener('click',function(){showOrbits=!showOrbits;this.classList.toggle('on',showOrbits);this.setAttribute('aria-pressed',String(showOrbits))});
mobileOpen.addEventListener('click',()=>panel.classList.add('open')); document.getElementById('closePanel').addEventListener('click',()=>panel.classList.remove('open'));
['menuBtnTop','menuBtnBottom'].forEach(id=>document.getElementById(id).addEventListener('click',()=>menuOverlay.classList.add('show')));
document.getElementById('fullscreen').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen()}catch(e){}});
menuOverlay.querySelectorAll('[data-scene]').forEach(btn=>btn.addEventListener('click',()=>switchScene(btn.dataset.scene)));

function switchScene(next){scene=next;selectedKey=sceneObjects[scene][0].key;tracking=true;currentProjections=[];updateSceneMeta();populateNav();updatePanel();menuOverlay.classList.remove('show');resetCamera();}

function focusKey(key,openMobile){selectedKey=key;tracking=true;const map=sceneMaps[scene][key]; if(scene==='solar'){cam.targetDesired=key==='sun'?v3():bodyPosition(map,elapsed);sceneZoom.solar=clamp((map.size||3)*10+18,22,120);} else if(scene==='milkyway'){if(key==='milkyway')cam.targetDesired=v3(); if(key==='sgrA')cam.targetDesired=v3(); if(key==='orion')cam.targetDesired=v3(25,0,10); if(key==='solarneighborhood')cam.targetDesired=v3(33,0,14); sceneZoom.milkyway=key==='milkyway'?164:120;} else {cam.targetDesired=v3(); sceneZoom.blackhole= key==='disk'?88 : key==='jet'?106 : 96;}
  updatePanel(); if(W<=860 && openMobile)panel.classList.add('open');
}

function pointerXY(e){const r=canvas.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top};}
canvas.addEventListener('pointerdown',e=>{const p=pointerXY(e);canvas.setPointerCapture(e.pointerId);pointerMap.set(e.pointerId,p);dragDistance=0;parallaxTarget={x:(p.x/W-.5),y:(p.y/H-.5)};if(pointerMap.size===2){let arr=[...pointerMap.values()];pinchDist=Math.hypot(arr[0].x-arr[1].x,arr[0].y-arr[1].y);pinchMid={x:(arr[0].x+arr[1].x)/2,y:(arr[0].y+arr[1].y)/2}}canvas.classList.add('grabbing')});
canvas.addEventListener('pointermove',e=>{
  const p=pointerXY(e); parallaxTarget={x:(p.x/W-.5),y:(p.y/H-.5)};
  const old=pointerMap.get(e.pointerId);
  if(!old){const pick=pickObject(p.x,p.y);hoveredKey=pick?pick.key:null;hoverTip.style.display=pick?'block':'none';if(pick){hoverTip.textContent=pick.name+' · click to explore';hoverTip.style.left=Math.min(W-190,p.x+14)+'px';hoverTip.style.top=Math.max(6,p.y-32)+'px';canvas.style.cursor='pointer';} else canvas.style.cursor='grab';return;}
  pointerMap.set(e.pointerId,p); const dx=p.x-old.x,dy=p.y-old.y; dragDistance+=Math.abs(dx)+Math.abs(dy);
  if(pointerMap.size>=2){const arr=[...pointerMap.values()]; const dist=Math.hypot(arr[0].x-arr[1].x,arr[0].y-arr[1].y), mid={x:(arr[0].x+arr[1].x)/2,y:(arr[0].y+arr[1].y)/2}; if(pinchDist>0)sceneZoom[scene]=clamp(sceneZoom[scene]*pinchDist/Math.max(10,dist),scene==='solar'?16:60,scene==='solar'?270:220); if(pinchMid && (e.ctrlKey||e.shiftKey||e.buttons===2)) pan((mid.x-pinchMid.x)*.45,(mid.y-pinchMid.y)*.45); pinchDist=dist; pinchMid=mid;
  }else if(e.buttons===2 || e.ctrlKey || e.shiftKey){pan(dx,dy)}
  else {cam.yaw-=dx*.0054;cam.pitch=clamp(cam.pitch+dy*.0052,-1.48,1.48); tracking=false;}
});
canvas.addEventListener('pointerup',e=>{const p=pointerXY(e); if(pointerMap.size===1 && dragDistance<8 && e.button!==2){const pick=pickObject(p.x,p.y); if(pick)focusKey(pick.key,true)} pointerMap.delete(e.pointerId); if(!pointerMap.size)canvas.classList.remove('grabbing'); if(pointerMap.size<2){pinchDist=0;pinchMid=null}});
canvas.addEventListener('pointercancel',()=>{pointerMap.clear();canvas.classList.remove('grabbing')}); canvas.addEventListener('contextmenu',e=>e.preventDefault());
canvas.addEventListener('wheel',e=>{e.preventDefault();sceneZoom[scene]=clamp(sceneZoom[scene]*Math.exp(e.deltaY*.00125),scene==='solar'?16:60,scene==='solar'?270:220)},{passive:false});
addEventListener('keydown',e=>{if(e.target instanceof HTMLInputElement)return; if(e.code==='Space'){e.preventDefault();setPlay(!running)} else if(e.key.toLowerCase()==='r')resetCamera(); else if(e.key==='Escape'){panel.classList.remove('open'); menuOverlay.classList.remove('show');} else if(e.key==='+'||e.key==='='){sceneZoom[scene]*=.88} else if(e.key==='-'){sceneZoom[scene]*=1.14}});

function pan(dx,dy){tracking=false; const unit=cam.dist/F*.95; const basis=getBasis(); cam.targetDesired=add(cam.targetDesired,add(mul(basis.right,-dx*unit),mul(basis.up,dy*unit)));}
function getBasis(){const cp=Math.cos(cam.pitch),sp=Math.sin(cam.pitch),cy=Math.cos(cam.yaw),sy=Math.sin(cam.yaw); const forward=norm(v3(cp*sy,sp,cp*cy)); const right=norm(cross(forward,v3(0,1,0))); const up=norm(cross(right,forward)); return {forward,right,up};}
function project(p){const {forward,right,up}=getBasis(); const camPos=sub(cam.target,mul(forward,cam.dist)); const rel=sub(p,camPos); const z=dot(rel,forward); if(z<=.1)return {vis:false,z}; const x=dot(rel,right), y=dot(rel,up); const screenY=(W<=860 && panel.classList.contains('open'))?H*.215:H/2; return {vis:true,x:W/2 + x*F/z,y:screenY - y*F/z,scale:F/z,z};}
function bodyPosition(d,t){if(!d || !d.orbit)return v3(); const period=d.period||1; const ang=((t/period)*TAU + d.index*.55)%(TAU); return v3(Math.cos(ang)*d.orbit,Math.sin(ang*1.17)*.28,Math.sin(ang)*d.orbit);}
function moonPosition(earthPos,t){const a=t/27.3*TAU*4.6; return add(earthPos,v3(Math.cos(a)*3.2,Math.sin(a*1.1)*.28,Math.sin(a)*3.2));}

function drawBackground(time){
  ctx.clearRect(0,0,W,H);
  let g=ctx.createRadialGradient(W*.5+parallax.x*20,H*.42+parallax.y*20,10,W*.5,H*.48,Math.max(W,H)*.9); g.addColorStop(0,scene==='blackhole'?'#10111a':scene==='milkyway'?'#0f1730':'#0d1a2d'); g.addColorStop(.45,'#08111f'); g.addColorStop(1,'#040814'); ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
  dust.forEach(d=>{const x=d.x*W + parallax.x*(50+d.r*.08)+Math.sin(time*.00011+d.r)*11, y=d.y*H + parallax.y*(33+d.r*.06)+Math.cos(time*.00009+d.r)*8; const gr=ctx.createRadialGradient(x,y,0,x,y,d.r); gr.addColorStop(0,`rgba(${d.c},${d.a})`); gr.addColorStop(1,`rgba(${d.c},0)`); ctx.fillStyle=gr; ctx.beginPath(); ctx.arc(x,y,d.r,0,TAU); ctx.fill();});
  drawMilkyBand();
  drawStarLayer(starsFar,65,time); drawStarLayer(starsNear,160,time);
}
function drawMilkyBand(){ctx.save(); ctx.translate(W*.5 + parallax.x*28,H*.5+parallax.y*12); ctx.rotate(-.36 + parallax.x*.04); ctx.scale(Math.max(W,H)*.011,Math.max(W,H)*.0034); mwBand.forEach(s=>{ctx.fillStyle=`rgba(188,213,255,${s.alpha})`; ctx.fillRect((s.x-.5)*100,(s.y+s.ox)*100,s.size,s.size)}); ctx.restore();}
function drawStarLayer(arr,shift,time){for(const s of arr){const tw=s.a*(.78+.22*Math.sin(elapsed*.0008+s.phase*8)); ctx.fillStyle=`rgba(${s.tint},${tw})`; const x=(s.x*W + parallax.x*shift*s.depth + Math.sin(time*.00018+s.phase)*shift*.16+W)%W, y=(s.y*H + parallax.y*shift*s.depth + Math.cos(time*.00014+s.phase)*shift*.12+H)%H; ctx.beginPath(); ctx.arc(x,y,s.r,0,TAU); ctx.fill();}}

function drawLabel(x,y,text,active){if(!showLabels)return; ctx.fillStyle=active?'rgba(9,29,51,.86)':'rgba(6,16,32,.62)'; ctx.strokeStyle=active?'rgba(126,209,249,.44)':'rgba(127,171,216,.16)'; ctx.lineWidth=.8; ctx.font='500 10px Inter,system-ui,sans-serif'; const w=ctx.measureText(text).width+16; ctx.fillRect(x-w/2,y-10,w,18); ctx.strokeRect(x-w/2,y-10,w,18); ctx.fillStyle=active?'#d0efff':'#acbfd9'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(text,x,y-1);}
function drawSelectedHalo(q){if(!q||!q.vis)return; const rr=q.R+Math.max(8,q.R*.12),opacity=.32+.09*Math.sin(elapsed*.005); ctx.setLineDash([5,7]); ctx.strokeStyle=`rgba(131,211,255,${opacity})`; ctx.lineWidth=1.1; ctx.beginPath(); ctx.arc(q.x,q.y,rr,0,TAU); ctx.stroke(); ctx.setLineDash([]);}

function drawSolar(){
  const objs=[]; currentProjections=[];
  if(showOrbits){ctx.strokeStyle='rgba(114,160,220,.12)'; ctx.lineWidth=1; solarBodies.slice(1).forEach(d=>drawOrbitRing(d.orbit)); drawAsteroidGuides();}
  drawAsteroids();
  solarBodies.forEach(d=>{const p=d.key==='sun'?v3():bodyPosition(solarMap[d.key],elapsed); objs.push({data:d,p,phase:(elapsed*.03)*(d.spin||1),ring:d.key==='saturn'}); if(d.key==='earth'){objs.push({data:{key:'moon',name:'Moon',size:.5,accent:'#cfd8e5',highlight:'#ffffff'},p:moonPosition(p,elapsed),phase:elapsed*.0009})}});
  objs.sort((a,b)=>project(b.p).z-project(a.p).z);
  for(const obj of objs){ if(obj.ring)drawSaturnRing(obj.p,solarMap.saturn.size,false); const q=drawBody(obj.data,obj.p,obj.phase,obj.data.key==='sun'); if(obj.data.key!=='moon'){currentProjections.push({key:obj.data.key,name:obj.data.name,q}); if(selectedKey===obj.data.key)drawSelectedHalo(q); if(q&&q.vis) drawLabel(q.x,q.y-q.R-12,obj.data.name,selectedKey===obj.data.key);} else if(q&&q.vis&&showLabels&&W>700){drawLabel(q.x,q.y-q.R-10,'Moon',false)} if(obj.ring)drawSaturnRing(obj.p,solarMap.saturn.size,true); }
}
function drawOrbitRing(rad){ctx.beginPath(); for(let i=0;i<=220;i++){const a=i/220*TAU; const q=project(v3(Math.cos(a)*rad,0,Math.sin(a)*rad)); if(!q.vis)continue; if(i===0)ctx.moveTo(q.x,q.y); else ctx.lineTo(q.x,q.y);} ctx.stroke();}
function drawAsteroidGuides(){ctx.strokeStyle='rgba(123,171,220,.08)'; for(let rad of [44.5,48.5])drawOrbitRing(rad)}
function drawAsteroids(){for(const a of asteroidRing){const ang=a.ang+elapsed*.0003; const q=project(v3(Math.cos(ang)*a.a,a.y,Math.sin(ang)*a.a)); if(!q.vis)continue; const r=clamp(q.scale*a.size,.35,2.3); ctx.fillStyle=`rgba(186,193,205,${a.alpha})`; ctx.fillRect(q.x,q.y,r,r);}}
function drawBody(d,p,phase,isSun){const q=project(p); if(!q.vis)return null; let R=clamp(q.scale*(d.size||1),1,520); if(q.x+R<-100||q.x-R>W+100||q.y+R<-100||q.y-R>H+100)return {...q,R}; if(isSun){const gl=ctx.createRadialGradient(q.x,q.y,R*.2,q.x,q.y,R*5.4); gl.addColorStop(0,'rgba(255,201,95,.42)'); gl.addColorStop(.25,'rgba(255,132,48,.12)'); gl.addColorStop(.52,'rgba(235,75,31,.04)'); gl.addColorStop(1,'rgba(218,68,34,0)'); ctx.save(); ctx.globalCompositeOperation='screen'; ctx.fillStyle=gl; ctx.beginPath(); ctx.arc(q.x,q.y,R*5.5,0,TAU); ctx.fill(); ctx.restore(); }
  ctx.save(); ctx.beginPath(); ctx.arc(q.x,q.y,R,0,TAU); ctx.clip();
  if(isSun){let g=ctx.createRadialGradient(q.x-R*.34,q.y-R*.33,R*.1,q.x,q.y,R*1.1); g.addColorStop(0,'#fff4b7'); g.addColorStop(.36,'#ffc867'); g.addColorStop(.68,'#ff9045'); g.addColorStop(1,'#cb4d2a'); ctx.fillStyle=g; ctx.fillRect(q.x-R,q.y-R,R*2,R*2); for(let i=0;i<32;i++){const a=i/32*TAU + elapsed*.001; const rr=R*(.25+.58*Math.sin(i*93.1)**2); ctx.fillStyle='rgba(255,241,181,.08)'; ctx.beginPath(); ctx.arc(q.x+Math.cos(a)*rr*.3,q.y+Math.sin(a*1.2)*rr*.22,R*(.04+((i%5)/100)),0,TAU); ctx.fill();}}
  else {const base=d.accent||d.color||'#88a'; let g=ctx.createRadialGradient(q.x-R*.38,q.y-R*.34,R*.1,q.x,q.y,R*1.2); g.addColorStop(0,d.highlight||'#fff'); g.addColorStop(.42,base); g.addColorStop(1,shadeColor(base,-35)); ctx.fillStyle=g; ctx.fillRect(q.x-R,q.y-R,R*2,R*2); addTexture(d,q,R,phase); const light=norm(sub(v3(),p)); const lx=light.x, ly=-light.y; const grad=ctx.createRadialGradient(q.x+lx*R*.46,q.y+ly*R*.46,R*.08,q.x-lx*R*.18,q.y-ly*R*.18,R*1.45); grad.addColorStop(0,'rgba(255,250,226,.1)'); grad.addColorStop(.43,'rgba(0,6,24,0)'); grad.addColorStop(.73,'rgba(2,8,25,.22)'); grad.addColorStop(1,'rgba(0,2,14,.9)'); ctx.fillStyle=grad; ctx.fillRect(q.x-R,q.y-R,R*2,R*2); if(['earth','uranus','neptune'].includes(d.key)){ctx.strokeStyle=d.key==='earth'?'rgba(92,158,255,.42)':'rgba(135,222,253,.24)'; ctx.lineWidth=Math.max(.8,R*.055); ctx.beginPath(); ctx.arc(q.x,q.y,R-ctx.lineWidth*.5,0,TAU); ctx.stroke();}}
  ctx.restore(); ctx.beginPath(); ctx.arc(q.x,q.y,R,0,TAU); ctx.lineWidth=isSun?1.7:.7; ctx.strokeStyle=isSun?'rgba(255,190,87,.78)':'rgba(185,208,250,.18)'; ctx.stroke(); return {...q,R};}
function addTexture(d,q,R,phase){ctx.save(); ctx.translate(q.x,q.y); ctx.rotate(phase*.2); if(['jupiter','saturn'].includes(d.key)){for(let i=-5;i<=5;i++){ctx.fillStyle=`rgba(255,255,255,${.04+(i%2===0?.04:.02)})`; ctx.fillRect(-R, i*R/5 + Math.sin(phase*6+i)*R*.02, R*2, R*.12)}} if(d.key==='earth'){ctx.fillStyle='rgba(72,170,100,.72)'; [ [-.2,-.1,.32,.18], [.23,.07,.26,.14], [.04,-.28,.18,.1],[-.28,.18,.2,.11] ].forEach(c=>blob(R*c[0],R*c[1],R*c[2],R*c[3])); }
  if(d.key==='mars'){ctx.fillStyle='rgba(132,57,31,.25)'; for(let i=0;i<7;i++){ctx.beginPath();ctx.arc((Math.random()-.5)*R*1.3,(Math.random()-.5)*R*1.3,R*(.06+Math.random()*.12),0,TAU);ctx.fill();}}
  if(d.key==='venus'){ctx.strokeStyle='rgba(255,242,204,.1)'; for(let i=0;i<7;i++){ctx.beginPath();ctx.moveTo(-R,(-.7+i*.22)*R);ctx.bezierCurveTo(-R*.3,(-.85+i*.22)*R,R*.15,(-.55+i*.24)*R,R,(-.72+i*.2)*R);ctx.stroke();}}
  if(d.key==='neptune'||d.key==='uranus'){ctx.strokeStyle='rgba(255,255,255,.07)'; for(let i=0;i<5;i++){ctx.beginPath();ctx.moveTo(-R,(-.6+i*.3)*R);ctx.lineTo(R,(-.55+i*.28)*R);ctx.stroke();}}
  ctx.restore();
}
function blob(x,y,rx,ry){ctx.beginPath(); ctx.ellipse(x,y,rx,ry,Math.random(),0,TAU); ctx.fill();}
function drawSaturnRing(center,rad,front){const c=center, ctr=project(c); if(!ctr.vis)return; const normal=norm(v3(.18,.94,-.29)),u=norm(cross(normal,v3(0,0,1))),v=norm(cross(normal,u)); const bands=[{k:1.34,col:'rgba(217,187,141,.55)',width:2.9},{k:1.48,col:'rgba(246,224,187,.75)',width:3.3},{k:1.66,col:'rgba(155,139,126,.5)',width:2.8},{k:1.85,col:'rgba(241,214,175,.66)',width:3.6}];
  for(const b of bands){ctx.lineCap='round'; ctx.lineWidth=clamp(ctr.scale*b.width*.16,.5,6.5); ctx.strokeStyle=b.col; let open=false; ctx.beginPath(); for(let i=0;i<=280;i++){const t=i/280*TAU; const pos=add(c,add(mul(u,rad*b.k*Math.cos(t)),mul(v,rad*b.k*Math.sin(t)))); const qp=project(pos); const inFront=qp.z<ctr.z; if((front===inFront)&&qp.vis){if(!open){ctx.moveTo(qp.x,qp.y);open=true}else ctx.lineTo(qp.x,qp.y)} else if(open){ctx.stroke(); ctx.beginPath(); open=false}} if(open)ctx.stroke();}
}

function drawMilkyWay(){
  currentProjections=[]; const t=elapsed*.0013;
  if(showOrbits){ctx.strokeStyle='rgba(137,190,255,.08)'; for(const r of [16,32,48,64])drawOrbitRingGalaxy(r);} 
  for(const p of galaxyParticles){const ang=p.ang+t, pos=v3(Math.cos(ang)*p.radius, p.z, Math.sin(ang)*p.radius); const q=project(pos); if(!q.vis)continue; const size=clamp(p.size*q.scale*.45,.3,5.5); ctx.fillStyle=`rgba(${p.color},${p.alpha})`; ctx.fillRect(q.x,q.y,size,size);} 
  const core=drawGalaxyCore(); const sgr=project(v3(0,0,0)); const orion=project(v3(24,0,10)); const solar=project(v3(34,0,14));
  const list=[{key:'milkyway',name:'Milky Way',q:core},{key:'sgrA',name:'Sagittarius A*',q:sgr},{key:'orion',name:'Orion Spur',q:orion},{key:'solarneighborhood',name:'Solar Neighborhood',q:solar}];
  currentProjections=list.filter(o=>o.q&&o.q.vis);
  drawGalaxyMarker(sgr,'Sagittarius A*','#e8b2ff',selectedKey==='sgrA');
  drawGalaxyMarker(orion,'Orion Spur','#82e1ee',selectedKey==='orion');
  drawGalaxyMarker(solar,'Solar Neighborhood','#ffd484',selectedKey==='solarneighborhood');
  if(showLabels){ if(core.vis)drawLabel(core.x,core.y-core.R-16,'Milky Way',selectedKey==='milkyway'); if(sgr.vis)drawLabel(sgr.x,sgr.y-16,'Sagittarius A*',selectedKey==='sgrA'); if(orion.vis)drawLabel(orion.x,orion.y-14,'Orion Spur',selectedKey==='orion'); if(solar.vis)drawLabel(solar.x,solar.y-14,'Solar Neighborhood',selectedKey==='solarneighborhood'); }
  const active=currentProjections.find(o=>o.key===selectedKey); if(active)drawSelectedHalo(active.q);
}
function drawOrbitRingGalaxy(rad){ctx.beginPath(); for(let i=0;i<=180;i++){const a=i/180*TAU; const q=project(v3(Math.cos(a)*rad,0,Math.sin(a)*rad)); if(!q.vis)continue; if(i===0)ctx.moveTo(q.x,q.y); else ctx.lineTo(q.x,q.y);} ctx.stroke();}
function drawGalaxyCore(){const q=project(v3()); if(!q.vis)return q; const R=clamp(q.scale*9.5,10,160); const outer=ctx.createRadialGradient(q.x,q.y,R*.2,q.x,q.y,R*4.8); outer.addColorStop(0,'rgba(255,245,192,.26)'); outer.addColorStop(.3,'rgba(129,170,255,.1)'); outer.addColorStop(1,'rgba(0,0,0,0)'); ctx.fillStyle=outer; ctx.beginPath(); ctx.arc(q.x,q.y,R*4.8,0,TAU); ctx.fill(); let g=ctx.createRadialGradient(q.x-R*.25,q.y-R*.22,R*.1,q.x,q.y,R*1.2); g.addColorStop(0,'#fff5cf'); g.addColorStop(.3,'#a8c7ff'); g.addColorStop(.72,'#5f74c8'); g.addColorStop(1,'rgba(49,68,131,.4)'); ctx.fillStyle=g; ctx.beginPath(); ctx.arc(q.x,q.y,R,0,TAU); ctx.fill(); return {...q,R};}
function drawGalaxyMarker(q,label,color,active){if(!q.vis)return; ctx.fillStyle=color; ctx.beginPath(); ctx.arc(q.x,q.y,active?5.4:4,0,TAU); ctx.fill(); ctx.strokeStyle='rgba(255,255,255,.22)'; ctx.stroke();}

function drawBlackHole(){
  currentProjections=[];
  const center=v3(); const cq=project(center); if(!cq.vis)return;
  const base=clamp(cq.scale*11.2,18,140);
  if(showOrbits){ctx.strokeStyle='rgba(255,163,106,.08)'; for(const r of [14,19,24])drawOrbitRingBH(r)}
  for(const blob of gasBlobs){const ang=blob.ang+elapsed*.005*blob.speed; const r=16+blob.a*2.4+Math.sin(elapsed*.0009+blob.a)*1.8; const pos=v3(Math.cos(ang)*r,blob.h,Math.sin(ang)*r); const q=project(pos); if(!q.vis)continue; const s=clamp(q.scale*blob.size*.1,1,5.5); ctx.fillStyle=`rgba(255,${160+blob.hue},${80+blob.hue/2},.28)`; ctx.beginPath(); ctx.arc(q.x,q.y,s,0,TAU); ctx.fill();}
  drawJet(cq,base,-1); drawJet(cq,base,1);
  drawAccretionDisk(cq,base);
  ctx.fillStyle='#050505'; ctx.beginPath(); ctx.arc(cq.x,cq.y,base*.72,0,TAU); ctx.fill();
  const ring=ctx.createRadialGradient(cq.x,cq.y,base*.62,cq.x,cq.y,base*1.6); ring.addColorStop(0,'rgba(255,255,255,0)'); ring.addColorStop(.18,'rgba(246,214,255,.13)'); ring.addColorStop(.34,'rgba(179,138,221,.18)'); ring.addColorStop(1,'rgba(0,0,0,0)'); ctx.fillStyle=ring; ctx.beginPath(); ctx.arc(cq.x,cq.y,base*1.6,0,TAU); ctx.fill();
  const horizon={key:'horizon',name:'Event Horizon',q:{...cq,R:base*.9}}; const hole={key:'bh',name:'Black Hole',q:{...cq,R:base*.72}}; const disk={key:'disk',name:'Accretion Disk',q:{...cq,R:base*1.8}}; const jet={key:'jet',name:'Relativistic Jet',q:{vis:true,x:cq.x,y:cq.y-base*2.2,R:base*.75}};
  currentProjections=[disk,hole,horizon,jet];
  if(showLabels){drawLabel(cq.x,cq.y-base*2.04,'Black Hole',selectedKey==='bh'||selectedKey==='horizon'); drawLabel(cq.x,cq.y+base*1.9,'Accretion Disk',selectedKey==='disk'); drawLabel(cq.x,cq.y-base*3.15,'Relativistic Jet',selectedKey==='jet');}
  const active=currentProjections.find(o=>o.key===selectedKey) || hole; drawSelectedHalo(active.q);
}
function drawOrbitRingBH(rad){ctx.beginPath(); for(let i=0;i<=180;i++){const a=i/180*TAU; const q=project(v3(Math.cos(a)*rad,0,Math.sin(a)*rad)); if(!q.vis)continue; if(i===0)ctx.moveTo(q.x,q.y); else ctx.lineTo(q.x,q.y);} ctx.stroke();}
function drawAccretionDisk(cq,base){ctx.save(); ctx.translate(cq.x,cq.y); const flatten=.34+Math.abs(Math.cos(cam.pitch))*.22; ctx.rotate(Math.sin(elapsed*.0001)*.02); for(let i=10;i>=0;i--){const t=i/10; ctx.beginPath(); ctx.ellipse(0,0,base*(1.35+t*.92),base*(.30+t*.1)*flatten,0,0,TAU); ctx.strokeStyle=`rgba(${255-Math.floor(t*40)},${140+Math.floor(t*70)},${60+Math.floor(t*50)},${.028+t*.035})`; ctx.lineWidth=2.4+t*2.6; ctx.stroke();} ctx.restore();}
function drawJet(cq,base,dir){ctx.save(); ctx.translate(cq.x,cq.y); const grad=ctx.createLinearGradient(0,dir*base*3.3,0,0); grad.addColorStop(0,'rgba(125,201,255,0)'); grad.addColorStop(.4,'rgba(131,214,255,.22)'); grad.addColorStop(1,'rgba(255,255,255,.12)'); ctx.fillStyle=grad; ctx.beginPath(); ctx.moveTo(-base*.18,0); ctx.quadraticCurveTo(-base*.1,dir*base*1.3,-base*.42,dir*base*3.25); ctx.lineTo(base*.42,dir*base*3.25); ctx.quadraticCurveTo(base*.1,dir*base*1.3,base*.18,0); ctx.closePath(); ctx.fill(); ctx.restore();}

function pickObject(x,y){let best=null,delta=1e9; for(const obj of currentProjections){const q=obj.q;if(!q||!q.vis)continue; const rr=Math.max(14,(q.R||12)+(obj.key==='disk'?10:6)); const d=Math.hypot(x-q.x,y-q.y); if(d<rr&&d<delta){best=obj;delta=d}} return best;}
function shadeColor(hex,amt){const c=hex.replace('#',''); const num=parseInt(c.length===3?c.split('').map(s=>s+s).join(''):c,16); let r=clamp((num>>16)+amt,0,255), g=clamp(((num>>8)&255)+amt,0,255), b=clamp((num&255)+amt,0,255); return `rgb(${r},${g},${b})`;}

function update(time){if(resizeNeeded)resize(); const dt=Math.min(((time-lastT)||16),50); lastT=time; if(running)elapsed+=dt*.035*speed; parallax.x=lerp(parallax.x,parallaxTarget.x,0.05); parallax.y=lerp(parallax.y,parallaxTarget.y,0.05);
  cam.target=add(cam.target,mul(sub(cam.targetDesired,cam.target),0.08)); cam.dist=lerp(cam.dist,sceneZoom[scene],0.08);
  if(scene==='solar' && tracking){cam.targetDesired=selectedKey==='sun'?v3():bodyPosition(solarMap[selectedKey],elapsed);} else if(scene==='milkyway' && tracking){ if(selectedKey==='sgrA'||selectedKey==='milkyway')cam.targetDesired=v3(); else if(selectedKey==='orion')cam.targetDesired=v3(16,0,8); else if(selectedKey==='solarneighborhood')cam.targetDesired=v3(24,0,10);} else if(scene==='blackhole' && tracking){cam.targetDesired=v3();}
  drawBackground(time);
  if(scene==='solar')drawSolar(); else if(scene==='milkyway')drawMilkyWay(); else drawBlackHole();
  requestAnimationFrame(update);
}

switchScene('solar');
menuOverlay.classList.add('show');
setPlay(true);
requestAnimationFrame(update);
})();
