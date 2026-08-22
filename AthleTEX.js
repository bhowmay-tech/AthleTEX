/* =====================================================================
   AthleTEX — APPLICATION LOGIC
   ===================================================================== */

const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------------- MOCK DATA ---------------- */
const LOCATIONS = ["Kukatpally","Madhapur","Gachibowli","Secunderabad","Hyderabad","Miyapur","Ameerpet"];
const SPORT_EMOJI = {Cricket:"🏏",Football:"⚽",Badminton:"🏸",Swimming:"🏊",Athletics:"🏃",Chess:"♟️"};

const athletes = [
  {name:"Darshini Reddy",sport:"Cricket",skill:"Advanced",loc:"Kukatpally",rating:94,match:96,verified:true,avail:true},
  {name:"Rahul Sharma",sport:"Cricket",skill:"Advanced",loc:"Kukatpally",rating:91,match:92,verified:true,avail:true},
  {name:"Kiran Kumar",sport:"Cricket",skill:"Intermediate",loc:"Madhapur",rating:89,match:89,verified:true,avail:false},
  {name:"Vijay Rao",sport:"Football",skill:"Intermediate",loc:"Gachibowli",rating:87,match:84,verified:false,avail:true},
  {name:"Rohit Verma",sport:"Football",skill:"Advanced",loc:"Secunderabad",rating:85,match:81,verified:true,avail:true},
  {name:"Sneha Patil",sport:"Badminton",skill:"Advanced",loc:"Madhapur",rating:88,match:90,verified:true,avail:true},
  {name:"Ayesha Khan",sport:"Badminton",skill:"Intermediate",loc:"Hyderabad",rating:79,match:76,verified:false,avail:false},
  {name:"Deepak Nair",sport:"Swimming",skill:"Advanced",loc:"Gachibowli",rating:92,match:70,verified:true,avail:true},
  {name:"Priya Menon",sport:"Athletics",skill:"Intermediate",loc:"Miyapur",rating:81,match:73,verified:false,avail:true},
  {name:"Manoj Yadav",sport:"Chess",skill:"Advanced",loc:"Ameerpet",rating:96,match:65,verified:true,avail:true},
  {name:"Karthik Iyer",sport:"Cricket",skill:"Intermediate",loc:"Miyapur",rating:78,match:80,verified:false,avail:true},
  {name:"Divya Reddy",sport:"Badminton",skill:"Advanced",loc:"Kukatpally",rating:90,match:93,verified:true,avail:true},
  {name:"Suresh Babu",sport:"Football",skill:"Beginner",loc:"Ameerpet",rating:62,match:58,verified:false,avail:false},
  {name:"Nikhil Chandra",sport:"Cricket",skill:"Advanced",loc:"Hyderabad",rating:93,match:88,verified:true,avail:true},
  {name:"Meera Joshi",sport:"Athletics",skill:"Advanced",loc:"Secunderabad",rating:90,match:77,verified:true,avail:true},
  {name:"Farhan Ali",sport:"Football",skill:"Intermediate",loc:"Kukatpally",rating:83,match:86,verified:false,avail:true},
  {name:"Aditi Rao",sport:"Swimming",skill:"Intermediate",loc:"Madhapur",rating:75,match:68,verified:false,avail:false},
  {name:"Vikram Singh",sport:"Chess",skill:"Intermediate",loc:"Gachibowli",rating:77,match:60,verified:false,avail:true},
  {name:"Anjali Desai",sport:"Cricket",skill:"Beginner",loc:"Ameerpet",rating:58,match:55,verified:false,avail:true},
  {name:"Harsha Vardhan",sport:"Badminton",skill:"Beginner",loc:"Miyapur",rating:63,match:59,verified:false,avail:false},
];

const teams = [
  {name:"Hyderabad Strikers",sport:"Cricket",skill:"Intermediate",loc:"Kukatpally",members:12,need:"1 Bowler, 1 All-rounder"},
  {name:"Madhapur Falcons FC",sport:"Football",skill:"Advanced",loc:"Madhapur",members:16,need:"2 Defenders"},
  {name:"Gachibowli Smashers",sport:"Badminton",skill:"Intermediate",loc:"Gachibowli",members:8,need:"2 Doubles pairs"},
  {name:"Secunderabad Titans",sport:"Cricket",skill:"Advanced",loc:"Secunderabad",members:14,need:"1 Wicketkeeper"},
  {name:"Ameerpet United",sport:"Football",skill:"Beginner",loc:"Ameerpet",members:10,need:"3 Midfielders"},
  {name:"Miyapur Shuttlers",sport:"Badminton",skill:"Advanced",loc:"Miyapur",members:6,need:"1 Singles player"},
  {name:"Kukatpally Kings",sport:"Cricket",skill:"Advanced",loc:"Kukatpally",members:15,need:"2 Fast bowlers"},
  {name:"Hyderabad Aquatics Club",sport:"Swimming",skill:"Intermediate",loc:"Hyderabad",members:20,need:"Relay swimmers"},
];

const matches = [
  {name:"Sunday Turf Cricket",sport:"Cricket",loc:"Kukatpally",date:"Sun",time:"5:00 PM",joined:8,max:11,skill:"Intermediate",organizer:"Darshini Reddy"},
  {name:"Weeknight 5-a-side",sport:"Football",loc:"Gachibowli",date:"Wed",time:"7:30 PM",joined:7,max:10,skill:"Intermediate",organizer:"Vijay Rao"},
  {name:"Doubles Badminton Night",sport:"Badminton",loc:"Madhapur",date:"Fri",time:"8:00 PM",joined:3,max:4,skill:"Advanced",organizer:"Sneha Patil"},
  {name:"Morning League Cricket",sport:"Cricket",loc:"Secunderabad",date:"Sat",time:"7:00 AM",joined:9,max:11,skill:"Advanced",organizer:"Nikhil Chandra"},
  {name:"Casual Kickabout",sport:"Football",loc:"Ameerpet",date:"Sun",time:"6:00 PM",joined:6,max:14,skill:"Beginner",organizer:"Suresh Babu"},
  {name:"Sunset Singles Badminton",sport:"Badminton",loc:"Miyapur",date:"Sat",time:"6:30 PM",joined:1,max:2,skill:"Intermediate",organizer:"Harsha Vardhan"},
  {name:"Lap Swim Meetup",sport:"Swimming",loc:"Hyderabad",date:"Sun",time:"7:00 AM",joined:4,max:8,skill:"Intermediate",organizer:"Deepak Nair"},
  {name:"Club Chess Blitz",sport:"Chess",loc:"Ameerpet",date:"Thu",time:"6:00 PM",joined:6,max:16,skill:"Advanced",organizer:"Manoj Yadav"},
  {name:"Track Sprints Practice",sport:"Athletics",loc:"Miyapur",date:"Tue",time:"6:00 AM",joined:5,max:12,skill:"Intermediate",organizer:"Priya Menon"},
  {name:"Corporate Cricket Friendly",sport:"Cricket",loc:"Gachibowli",date:"Sat",time:"4:00 PM",joined:10,max:11,skill:"Intermediate",organizer:"Karthik Iyer"},
];

const events = [
  {name:"Kukatpalli Open 2026",sport:"Badminton",date:"Jun 18",venue:"Kukatpalli Indoor Arena",participants:128,prize:"₹25,000"},
  {name:"Hyderabad Premier Cricket League",sport:"Cricket",date:"Jul 2",venue:"Gachibowli Stadium",participants:220,prize:"₹1,00,000"},
  {name:"Madhapur 5-a-side Cup",sport:"Football",date:"Jun 25",venue:"Madhapur Turf Arena",participants:96,prize:"₹40,000"},
  {name:"Secunderabad Swim Meet",sport:"Swimming",date:"Jul 10",venue:"Secunderabad Aquatic Complex",participants:64,prize:"₹15,000"},
  {name:"Ameerpet Chess Open",sport:"Chess",date:"Jun 30",venue:"Ameerpet Community Hall",participants:80,prize:"₹20,000"},
  {name:"Miyapur Athletics Meet",sport:"Athletics",date:"Jul 5",venue:"Miyapur Sports Complex",participants:150,prize:"₹18,000"},
  {name:"College Cricket Championship",sport:"Cricket",date:"Jul 14",venue:"Hyderabad University Ground",participants:180,prize:"₹50,000"},
  {name:"Gachibowli Badminton Doubles",sport:"Badminton",date:"Jun 28",venue:"Gachibowli Sports Hub",participants:64,prize:"₹12,000"},
  {name:"Kukatpally Football Fest",sport:"Football",date:"Jul 8",venue:"Kukatpally Turf Ground",participants:110,prize:"₹35,000"},
  {name:"Hyderabad Junior Athletics Cup",sport:"Athletics",date:"Jul 20",venue:"GHMC Stadium",participants:200,prize:"₹22,000"},
];

const coaches = [
  {name:"Vikram Rao",role:"Certified Cricket Coach",exp:15,rating:4.9,students:126,loc:"Hyderabad"},
  {name:"Sunita Reddy",role:"Football Performance Coach",exp:9,rating:4.7,students:74,loc:"Madhapur"},
  {name:"Arun Prasad",role:"Badminton Coach",exp:12,rating:4.8,students:98,loc:"Gachibowli"},
  {name:"Lakshmi Narayan",role:"Swimming Coach",exp:11,rating:4.6,students:58,loc:"Secunderabad"},
  {name:"Ravi Teja",role:"Athletics & Conditioning Coach",exp:8,rating:4.5,students:40,loc:"Miyapur"},
];

const sportStats = {
  Cricket:{Skill:"Advanced",Position:"All-rounder",Rating:91,Matches:142,Wins:87,Runs:3420},
  Football:{Skill:"Intermediate",Position:"Midfielder",Rating:84,Matches:64,Goals:38,Assists:27},
  Badminton:{Skill:"Intermediate",Rating:79,Matches:38,Wins:26,"Win Rate":"68%"},
};

const achievements = [
  {icon:"🏆",name:"Tournament Winner",sub:"Kukatpalli Open 2025"},
  {icon:"🔥",name:"10 Match Win Streak",sub:"Cricket"},
  {icon:"💯",name:"Century",sub:"vs Madhapur Falcons"},
  {icon:"⚡",name:"Personal Best",sub:"Strike Rate 148"},
  {icon:"🥇",name:"City Rank #1",sub:"Intermediate Cricket"},
  {icon:"🏅",name:"100 Matches Played",sub:"All Sports"},
];

const notifications = [
  {icon:"🔔",text:"Rahul accepted your match invitation.",time:"2m ago"},
  {icon:"🏆",text:"You moved to #2 in the Kukatpalli cricket leaderboard.",time:"1h ago"},
  {icon:"🤖",text:"AI Coach updated your training plan.",time:"3h ago"},
  {icon:"📅",text:"Sunday Cricket Match starts tomorrow.",time:"5h ago"},
  {icon:"✓",text:"Your athlete profile has been verified.",time:"1d ago"},
  {icon:"💬",text:"Sneha sent you a new message.",time:"1d ago"},
  {icon:"🎯",text:"3 new AI player matches found near you.",time:"2d ago"},
];

const conversations = [
  {name:"Rahul Sharma",init:"RS",last:"Yes! I'll be there.",messages:[
    {from:"in",text:"Hey Darshini, are you joining Sunday's match?"},
    {from:"out",text:"Yes! I'll be there."},
    {from:"in",text:"Great, see you at the turf at 5."}
  ]},
  {name:"Sneha Patil",init:"SP",last:"Doubles partner for Friday?",messages:[
    {from:"in",text:"Are you free for doubles this Friday?"},
    {from:"out",text:"Should be — let me confirm and get back."}
  ]},
  {name:"Hyderabad Strikers",init:"HS",last:"Welcome to the team!",messages:[
    {from:"in",text:"Welcome to the team, Darshini! Practice is Tuesday 6pm."}
  ]},
  {name:"Vikram Rao",init:"VR",last:"Great session today.",messages:[
    {from:"in",text:"Great session today — work on your follow-through this week."}
  ]},
];

/* ---------------- ICONS ---------------- */
const ICONS = {
  home:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/></svg>',
  profile:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 5-6 8-6s6.5 2 8 6"/></svg>',
  discover:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>',
  play:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M6 4h12v6a6 6 0 0 1-12 0z"/><path d="M12 16v4M8 22h8"/></svg>',
  coach:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a4 4 0 0 1 4 4c0 1.5-.8 2.8-2 3.5V12h-4V9.5C8.8 8.8 8 7.5 8 6a4 4 0 0 1 4-4z"/><path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/></svg>',
  leaderboards:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M5 6H3v2a4 4 0 0 0 4 4M19 6h2v2a4 4 0 0 1-4 4"/></svg>',
  messages:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
  notifications:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></svg>',
  settings:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
};

const NAV = [
  {id:"home",label:"Home",accent:"#2F6BFF"},
  {id:"profile",label:"My Athlete",accent:"#F2B705"},
  {id:"discover",label:"Discover",accent:"#22D3EE"},
  {id:"play",label:"Play & Events",accent:"#A6FF4D"},
  {id:"coach",label:"AI Coach",accent:"#22D3EE"},
  {id:"leaderboards",label:"Leaderboards",accent:"#F2B705"},
  {id:"messages",label:"Messages",accent:"#2F6BFF"},
  {id:"notifications",label:"Notifications", badge:7,accent:"#FF5D5D"},
  {id:"settings",label:"Settings",accent:"#9AA3B5"},
];
const BOTTOM_NAV = ["home","discover","play","coach","profile"];

/* ---------------- NAV RENDER ---------------- */
function renderNav(){
  const list = document.getElementById('nav-list');
  list.innerHTML = NAV.map(n=>`
    <button class="nav-item ${n.id==='home'?'active':''}" data-nav="${n.id}" onclick="go('${n.id}')">
      ${ICONS[n.id]}<span>${n.label}</span>${n.badge?`<span class="nav-badge">${n.badge}</span>`:''}
    </button>`).join('');

  const bn = document.getElementById('bottom-nav');
  bn.innerHTML = BOTTOM_NAV.map(id=>{
    const n = NAV.find(x=>x.id===id);
    return `<button data-bnav="${id}" class="${id==='home'?'active':''}" onclick="go('${id}')">${ICONS[id]}<span>${n.label.split(' ')[0]}</span></button>`;
  }).join('');
}

function go(pageId){
  const target = document.getElementById('page-'+pageId);
  if(!target){ console.warn('AthleTEX: no page registered for "'+pageId+'"'); return; }
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  target.classList.add('active');

  document.querySelectorAll('[data-nav]').forEach(b=>{
    const isActive = b.dataset.nav===pageId;
    b.classList.toggle('active', isActive);
    if(isActive) b.setAttribute('aria-current','page'); else b.removeAttribute('aria-current');
  });
  document.querySelectorAll('[data-bnav]').forEach(b=>b.classList.toggle('active', b.dataset.bnav===pageId));

  const entry = NAV.find(n=>n.id===pageId);
  if(entry) document.documentElement.style.setProperty('--page-accent', entry.accent);

  document.getElementById('search-results').style.display='none';
  const gs = document.getElementById('global-search'); if(gs) gs.value='';
  window.scrollTo({top:0,behavior: prefersReduced ? 'auto' : 'smooth'});
}

function enterApp(pageId){
  const workspace = document.getElementById('workspace');
  if(!workspace) return;

  if (workspace.classList.contains('show')) {
    if(pageId) go(pageId);
    return;
  }

  if (window.redirectTimer) {
    clearTimeout(window.redirectTimer);
    window.redirectTimer = null;
  }

  const landing = document.getElementById('landing');
  const progressBar = document.getElementById('landing-progress');
  if (progressBar) {
    progressBar.classList.remove('animate');
    progressBar.style.width = '100%';
  }

  if (landing) {
    if (landing.classList.contains('fade-out')) return;
    landing.classList.add('fade-out');
  }

  workspace.classList.add('show');

  // Trigger reflow to start CSS transition
  void workspace.offsetWidth;

  workspace.classList.add('fade-in');

  if(pageId) go(pageId);

  setTimeout(() => {
    if (landing) landing.style.display = 'none';
    toast('Welcome back, Arjun','👋');
  }, 800);
}

/* ---------------- RENDER: HOME ---------------- */
const SPORT_BG = {
  Cricket: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=300&q=80",
  Football: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=300&q=80",
  Badminton: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=300&q=80",
  Swimming: "https://images.unsplash.com/photo-1519666336592-e225a99dcd2f?auto=format&fit=crop&w=300&q=80",
  Athletics: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=300&q=80",
  Chess: "https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&w=300&q=80"
};

const SPORT_COLORS = {
  Cricket: "var(--accent-cricket)",
  Football: "var(--accent-football)",
  Badminton: "var(--accent-badminton)",
  Swimming: "var(--accent-swimming)",
  Athletics: "var(--lime)",
  Chess: "var(--accent-chess)"
};

function renderHome(){
  document.getElementById('home-matches').innerHTML = matches.slice(0,2).map(m=>{
    const bg = SPORT_BG[m.sport] || "";
    const col = SPORT_COLORS[m.sport] || "var(--blue)";
    return `
    <div class="match-item" style="position: relative; overflow: hidden; border-color: rgba(255,255,255,0.06); border-left: 3px solid ${col};">
      <img src="${bg}" style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0.08; z-index: 1; pointer-events: none;">
      <div class="emoji" style="background: rgba(255,255,255,0.03); z-index: 2; position: relative;">${SPORT_EMOJI[m.sport]}</div>
      <div class="info" style="z-index: 2; position: relative;">
        <b style="color: var(--ink);">${m.name}</b>
        <span style="color: var(--ink-dim);">${m.loc} · ${m.joined}/${m.max} players · <span style="color: ${col}; font-weight:600;">${m.skill}</span></span>
      </div>
      <button class="btn btn-secondary btn-sm" style="z-index: 2; position: relative; border-color: rgba(255,255,255,0.15);" onclick="joinMatch('${m.name}')">Join Match</button>
    </div>`;
  }).join('');

  document.getElementById('home-events').innerHTML = events.slice(0,2).map(e=>{
    const bg = SPORT_BG[e.sport] || "";
    const col = SPORT_COLORS[e.sport] || "var(--blue)";
    return `
    <div class="match-item" style="position: relative; overflow: hidden; border-color: rgba(255,255,255,0.06); border-left: 3px solid ${col};">
      <img src="${bg}" style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0.08; z-index: 1; pointer-events: none;">
      <div class="emoji" style="background: rgba(255,255,255,0.03); z-index: 2; position: relative;">${SPORT_EMOJI[e.sport]}</div>
      <div class="info" style="z-index: 2; position: relative;">
        <b style="color: var(--ink);">${e.name}</b>
        <span style="color: var(--ink-dim);">${e.date} · <span style="color: ${col}; font-weight:600;">${e.participants} participants</span></span>
      </div>
      <button class="btn btn-secondary btn-sm" style="z-index: 2; position: relative; border-color: rgba(255,255,255,0.15);" onclick="go('play')">View Event</button>
    </div>`;
  }).join('');

  document.getElementById('home-suggestions').innerHTML = athletes.slice(1,4).map(a=>{
    const col = SPORT_COLORS[a.sport] || "var(--blue)";
    return `
    <div class="player-row" style="border-radius: var(--radius-sm); border: 1px solid transparent; transition: border-color 0.3s; padding: 4px 6px;">
      <div class="avatar" style="width:34px;height:34px;font-size:12px; border: 1.5px solid ${col}; box-shadow: 0 0 8px ${col}44;">${initials(a.name)}</div>
      <div class="name">
        <b>${a.name}</b>
        <span style="color: var(--ink-dim);">${SPORT_EMOJI[a.sport]} ${a.sport} · ${a.loc}</span>
      </div>
      <span class="match-badge mono" style="color: ${col}; font-weight: 700;">${a.match}% Match</span>
    </div>`;
  }).join('');

  const lbMedals = ['🥇', '🥈', '🥉'];
  document.getElementById('home-leaderboard').innerHTML = athletes.filter(a=>a.sport==='Cricket').sort((a,b)=>b.rating-a.rating).slice(0,3).map((a,i)=>{
    const colors = ['#f59e0b', '#cbd5e1', '#b45309'];
    return `
    <div class="player-row" style="background: rgba(255, 255, 255, 0.015); margin-bottom: 4px; border-radius: var(--radius-sm); padding: 8px 12px; border-left: 2px solid ${colors[i]};">
      <span class="rank mono" style="font-size: 15px; color: ${colors[i]}; font-weight: 700; width: 24px;">${lbMedals[i]}</span>
      <div class="name"><b>${a.name}</b></div>
      <span class="match-badge mono" style="font-weight: 700; color: ${colors[i]};">${a.rating} score</span>
    </div>`;
  }).join('');
}
function initials(name){ return name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase(); }

/* ---------------- RENDER: DISCOVER ---------------- */
let discoverFilter = 'All';
function renderDiscoverFilters(){
  const sports = ['All','Cricket','Football','Badminton','Swimming','Athletics','Chess'];
  document.getElementById('discover-filters').innerHTML = sports.map(s=>
    `<button class="chip ${s===discoverFilter?'active':''}" onclick="setDiscoverFilter('${s}')">${s==='All'?'All Sports':SPORT_EMOJI[s]+' '+s}</button>`
  ).join('') + `<button class="chip" onclick="discoverVerifiedOnly=!discoverVerifiedOnly;renderDiscoverGrid();toast(discoverVerifiedOnly?'Showing verified only':'Showing everyone','🔎')">✓ Verified only</button>`;
}
let discoverVerifiedOnly=false;
function setDiscoverFilter(s){ discoverFilter=s; renderDiscoverFilters(); renderDiscoverGrid(); }
function renderDiscoverGrid(list){
  const data = (list||athletes).filter(a=> (discoverFilter==='All'||a.sport===discoverFilter) && (!discoverVerifiedOnly||a.verified) );
  document.getElementById('discover-grid').innerHTML = data.map(a=>{
    const col = SPORT_COLORS[a.sport] || "var(--blue)";
    const bg = SPORT_BG[a.sport] || "";
    return `
    <div class="card athlete-card" style="border-top: 3px solid ${col}; position: relative; overflow: hidden;">
      <img src="${bg}" style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0.05; z-index: 1; pointer-events: none;">
      <div style="position: relative; z-index: 2;">
        <div class="ahead">
          <div class="avatar" style="border: 2px solid ${col}; box-shadow: 0 0 10px ${col}33;">${initials(a.name)}</div>
          <div>
            <h4>${a.name} ${a.verified?'<svg class="verified-tick" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="m9 12 2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg>':''}</h4>
            <div class="meta" style="color: ${col}; font-weight: 600;">${SPORT_EMOJI[a.sport]} ${a.sport} · ${a.skill}</div>
          </div>
        </div>
        <div class="meta" style="margin-top:10px;">📍 ${a.loc}</div>
        <div class="availability-line"><span class="led" style="background: ${a.avail?'var(--lime)':'var(--ink-faint)'}; box-shadow: ${a.avail?'0 0 8px var(--lime)':'none'};"></span>${a.avail?'Available this weekend':'Not available'}</div>
        <div class="match-score"><span class="meta">Rating ${a.rating}</span><b style="color: ${col}; font-family: var(--mono);">${a.match}% Match</b></div>
        <div class="card-actions">
          <button class="btn btn-ghost btn-sm" style="border-color: rgba(255,255,255,0.15);" onclick="viewProfileToast('${a.name}')">View Profile</button>
          <button class="btn btn-sm" style="background: ${col}; color: #04060b; font-weight: 700; border: none; box-shadow: 0 4px 15px -3px ${col}66;" onclick="connectAthlete('${a.name}')">Connect</button>
        </div>
      </div>
    </div>`;
  }).join('') || `<p style="color:var(--ink-faint);grid-column:1/-1;">No athletes match these filters yet.</p>`;
}
function viewProfileToast(name){ toast('Opening '+name+"'s profile", '👤'); }
function connectAthlete(name){ toast('Connection request sent to '+name, '🤝'); }

/* ---------------- RENDER: PLAY & EVENTS ---------------- */
function renderMatches(){
  document.getElementById('matches-grid').innerHTML = matches.map(m=>{
    const bg = SPORT_BG[m.sport] || "";
    const col = SPORT_COLORS[m.sport] || "var(--blue)";
    return `
    <div class="card" style="border-left: 4px solid ${col}; position: relative; overflow: hidden;">
      <img src="${bg}" style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0.05; z-index: 1; pointer-events: none;">
      <div style="position: relative; z-index: 2;">
        <div class="ahead" style="display:flex;align-items:center;gap:10px;"><span style="font-size:22px;">${SPORT_EMOJI[m.sport]}</span><h4 style="font-size:15px; color: var(--ink);">${m.name}</h4></div>
        <div class="meta" style="margin-top:8px;color:var(--ink-dim);font-size:12px;">📍 ${m.loc} · ${m.date} · ${m.time}</div>
        <div class="meta" style="margin-top:4px;color:var(--ink-faint);font-size:12px;">Organized by ${m.organizer}</div>
        <div class="match-score"><span class="meta">${m.joined}/${m.max} players · ${m.skill}</span><b style="color:${col}">${m.max-m.joined} spots left</b></div>
        <button class="btn btn-sm" style="width:100%;justify-content:center;margin-top:14px; background: ${col}; color: #04060b; font-weight: 700; border: none;" onclick="joinMatch('${m.name}')">Join Match</button>
      </div>
    </div>`;
  }).join('');

  document.getElementById('events-grid').innerHTML = events.map(e=>{
    const bg = SPORT_BG[e.sport] || "";
    const col = SPORT_COLORS[e.sport] || "var(--blue)";
    return `
    <div class="card" style="border-left: 4px solid ${col}; position: relative; overflow: hidden;">
      <img src="${bg}" style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0.05; z-index: 1; pointer-events: none;">
      <div style="position: relative; z-index: 2;">
        <div class="ahead" style="display:flex;align-items:center;gap:10px;"><span style="font-size:22px;">${SPORT_EMOJI[e.sport]}</span><h4 style="font-size:15px; color: var(--ink);">${e.name}</h4></div>
        <div class="meta" style="margin-top:8px;color:var(--ink-dim);font-size:12px;">📍 ${e.venue} · ${e.date}</div>
        <div class="match-score"><span class="meta">${e.participants} participants</span><b style="color:var(--gold); font-family: var(--mono);">${e.prize}</b></div>
        <button class="btn btn-secondary btn-sm" style="width:100%;justify-content:center;margin-top:14px; border-color: rgba(255,255,255,0.15);" onclick="registerEvent('${e.name}')">Register</button>
      </div>
    </div>`;
  }).join('');

  document.getElementById('teams-grid').innerHTML = teams.map(t=>{
    const col = SPORT_COLORS[t.sport] || "var(--blue)";
    return `
    <div class="card" style="border-top: 3px solid ${col}; position: relative; overflow: hidden;">
      <img src="https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=300&q=80" style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0.04; z-index: 1; pointer-events: none;">
      <div style="position: relative; z-index: 2;">
        <h4 style="font-size:15px; color: var(--ink);">${t.name}</h4>
        <div class="meta" style="margin-top:6px;color:var(--ink-dim);font-size:12px;">${SPORT_EMOJI[t.sport]} ${t.sport} · ${t.skill} · ${t.members} members</div>
        <div class="meta" style="margin-top:4px;color:var(--ink-faint);font-size:12px;">📍 ${t.loc}</div>
        <div class="meta" style="margin-top:10px;font-size:12px;">Looking for: <b style="color:${col}">${t.need}</b></div>
        <button class="btn btn-sm" style="width:100%;justify-content:center;margin-top:14px; background: ${col}; color: #04060b; font-weight: 700; border: none;" onclick="joinTeam('${t.name}')">Join Team</button>
      </div>
    </div>`;
  }).join('');

  document.getElementById('coaches-grid').innerHTML = coaches.map(c=>`
    <div class="card" style="position: relative; overflow: hidden;">
      <img src="https://images.unsplash.com/photo-1526676082484-915f01d79ac3?auto=format&fit=crop&w=300&q=80" style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0.04; z-index: 1; pointer-events: none;">
      <div style="position: relative; z-index: 2;">
        <div class="ahead" style="display:flex;gap:10px;align-items:center;"><div class="avatar" style="border: 1.5px solid var(--cyan);">${initials(c.name)}</div><div><h4 style="font-size:15px; color: var(--ink);">${c.name}</h4><div class="meta">${c.role}</div></div></div>
        <div class="meta" style="margin-top:10px; color: var(--ink-dim);">📍 ${c.loc} · ${c.exp} yrs experience</div>
        <div class="match-score"><span class="meta">⭐ ${c.rating}</span><b style="color:var(--cyan)">${c.students} students</b></div>
        <button class="btn btn-secondary btn-sm" style="width:100%;justify-content:center;margin-top:14px; border-color: rgba(255,255,255,0.15);" onclick="viewCoach('${c.name.replace(/'/g,"\\'")}')">View Coach</button>
      </div>
    </div>`).join('');
}
function viewCoach(name){ toast('Opening ' + name + '\u2019s coach profile', '🎓'); }
function joinMatch(name){ toast('Joined "'+name+'"','✓'); }
function registerEvent(name){ toast('Registered for '+name,'✓'); }
function joinTeam(name){ toast('Request sent to join '+name,'🤝'); }

document.getElementById('play-tabs').addEventListener('click', e=>{
  const btn = e.target.closest('[data-ptab]'); if(!btn) return;
  document.querySelectorAll('#play-tabs .tab-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('#page-play .tab-panel').forEach(p=>p.classList.remove('active'));
  document.getElementById('ptab-'+btn.dataset.ptab).classList.add('active');
});

/* ---------------- PROFILE TABS ---------------- */
document.getElementById('profile-tabs').addEventListener('click', e=>{
  const btn = e.target.closest('[data-tab]'); if(!btn) return;
  document.querySelectorAll('#profile-tabs .tab-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('#page-profile .tab-panel').forEach(p=>p.classList.remove('active'));
  document.getElementById('tab-'+btn.dataset.tab).classList.add('active');
  if(btn.dataset.tab==='performance') drawPerfChart(currentSport);
});

function renderScoreBreakdown(){
  const parts = [
    ["Performance", 94, "linear-gradient(90deg, var(--cyan), var(--blue))"],
    ["Consistency", 91, "linear-gradient(90deg, var(--magenta), var(--purple))"],
    ["Activity", 96, "linear-gradient(90deg, var(--lime), var(--cyan))"],
    ["Achievements", 89, "linear-gradient(90deg, var(--orange), var(--gold))"],
    ["Verified Results", 98, "linear-gradient(90deg, var(--blue), var(--purple))"]
  ];
  document.getElementById('score-breakdown').innerHTML = parts.map(([label,val,grad])=>`
    <div>
      <div style="display:flex;justify-content:space-between;font-size:12.5px;margin-bottom:6px;"><span>${label}</span><b class="mono" style="color:var(--cyan);">${val}%</b></div>
      <div style="height:6px;border-radius:100px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.04);overflow:hidden;">
        <div style="height:100%;width:${val}%;background:${grad};box-shadow: 0 0 10px ${val>90?'rgba(34,211,238,0.2)':'none'};"></div>
      </div>
    </div>`).join('');
}

let currentSport = 'Cricket';
function renderSportSelector(){
  const sports = Object.keys(sportStats);
  document.getElementById('sport-selector').innerHTML = sports.map(s=>
    `<button class="sport-chip ${s===currentSport?'active':''}" onclick="selectSport('${s}')">${SPORT_EMOJI[s]} ${s}</button>`
  ).join('');
  renderSportStats();
}
function selectSport(s){ currentSport=s; renderSportSelector(); document.getElementById('perf-sport-label').textContent=s; drawPerfChart(s); }
function renderSportStats(){
  const stats = sportStats[currentSport];
  const col = SPORT_COLORS[currentSport] || "var(--cyan)";
  document.getElementById('sport-stats').innerHTML = Object.entries(stats).map(([k,v])=>`
    <div class="stat-tile" style="border-top: 2px solid ${col}; border-color: rgba(255,255,255,0.08); background: rgba(255,255,255,0.015); border-radius: var(--radius-md); padding: 14px; text-align: center; transition: border-color 0.3s;">
      <b class="mono" style="font-size: 24px; color: ${col}; display: block; margin-bottom: 4px;">${v}</b>
      <span style="font-size: 11px; text-transform: uppercase; color: var(--ink-dim); letter-spacing: 0.05em;">${k}</span>
    </div>`).join('');
}
function addSport(){
  const s = document.getElementById('add-sport-select').value;
  if(!sportStats[s]){
    sportStats[s] = {Skill:"Beginner",Matches:0,Wins:0,Rating:50};
  }
  currentSport = s;
  renderSportSelector();
  closeModal('modal-add-sport');
  toast(s+' added to your profile','✓');
}

function renderAchievements(){
  const mockAchievements = [
    ...achievements.map(a=>({...a, locked: false})),
    {icon:"🔒", name:"Underdog Master", sub:"Win vs 5 Advanced players", locked: true},
    {icon:"🔒", name:"Ultra Marathoner", sub:"Run 100km in a week", locked: true}
  ];
  document.getElementById('achv-grid').innerHTML = mockAchievements.map(a=>{
    if (a.locked) {
      return `
      <div class="card achv-card" style="opacity: 0.55; border: 1px dashed rgba(255,255,255,0.08); background: rgba(0,0,0,0.15); box-shadow: none;">
        <span class="icon" style="filter: grayscale(1); opacity: 0.5; font-size: 24px; margin-bottom: 8px; display: block;">${a.icon}</span>
        <b style="color: var(--ink-dim);">${a.name}</b>
        <span style="font-size: 11px; color: var(--ink-faint);">${a.sub}</span>
      </div>`;
    } else {
      return `
      <div class="card achv-card" style="border-color: rgba(245, 158, 11, 0.15); box-shadow: 0 0 10px rgba(245, 158, 11, 0.05); text-align: center;">
        <div style="font-size: 28px; margin-bottom: 8px; filter: drop-shadow(0 0 4px rgba(245,158,11,0.25));">${a.icon}</div>
        <b style="color: var(--ink);">${a.name}</b>
        <span style="font-size: 11px; color: var(--ink-dim);">${a.sub}</span>
      </div>`;
    }
  }).join('');
}

const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
let availability = {Mon:true,Tue:false,Wed:true,Thu:false,Fri:true,Sat:true,Sun:true};
function renderAvailability(){
  document.getElementById('avail-grid').innerHTML = DAYS.map(d=>`
    <div class="avail-day ${availability[d]?'on':''}" style="
      background: ${availability[d] ? 'rgba(132, 204, 22, 0.04)' : 'rgba(255,255,255,0.01)'};
      border: 1px solid ${availability[d] ? 'rgba(132, 204, 22, 0.25)' : 'var(--border)'};
      box-shadow: ${availability[d] ? '0 0 10px -2px rgba(132, 204, 22, 0.15)' : 'none'};
      cursor: pointer; text-align: center; border-radius: var(--radius-md); padding: 14px;
      transition: all 0.3s;
    " onclick="toggleAvail('${d}')">
      <div class="d" style="font-weight: 700; color: ${availability[d] ? 'var(--lime)' : 'var(--ink-dim)'};">${d}</div>
      <div class="s" style="font-size: 11px; font-family: var(--mono); color: ${availability[d] ? 'var(--lime)' : 'var(--ink-faint)'};">${availability[d]?'Available':'Busy'}</div>
    </div>`).join('');
}
function toggleAvail(d){ availability[d]=!availability[d]; renderAvailability(); }

/* ---------------- PERFORMANCE CHART (canvas line chart) ---------------- */
function drawPerfChart(sport){
  const canvas = document.getElementById('perf-chart');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.clientWidth, h = 140;
  canvas.width = w*dpr; canvas.height = h*dpr; ctx.scale(dpr,dpr);
  ctx.clearRect(0,0,w,h);
  
  const col = SPORT_COLORS[sport] || "var(--cyan)";
  const colorHex = sport === 'Cricket' ? '#10B981' : (sport === 'Football' ? '#06B6D4' : '#8B5CF6');
  
  const seed = sport.length;
  const points = Array.from({length:10},(_,i)=> 55 + Math.sin(i*0.9+seed)*12 + i*2.6 + Math.random()*4);
  const max=Math.max(...points), min=Math.min(...points);
  
  const grad = ctx.createLinearGradient(0,0,0,h);
  grad.addColorStop(0, colorHex + '55'); grad.addColorStop(1, colorHex + '00');
  
  ctx.beginPath();
  points.forEach((p,i)=>{
    const x = (i/(points.length-1))*w;
    const y = h - ((p-min)/(max-min||1))*(h-20) - 10;
    i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
  });
  const lastX=w, lastY=h - ((points[points.length-1]-min)/(max-min||1))*(h-20)-10;
  ctx.lineTo(lastX,h); ctx.lineTo(0,h); ctx.closePath();
  ctx.fillStyle = grad; ctx.fill();
  
  ctx.beginPath();
  points.forEach((p,i)=>{
    const x = (i/(points.length-1))*w;
    const y = h - ((p-min)/(max-min||1))*(h-20) - 10;
    i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
  });
  ctx.strokeStyle = colorHex; ctx.lineWidth=3.0; ctx.stroke();
  
  points.forEach((p,i)=>{
    const x = (i/(points.length-1))*w;
    const y = h - ((p-min)/(max-min||1))*(h-20) - 10;
    ctx.beginPath(); ctx.arc(x,y,4,0,Math.PI*2); ctx.fillStyle='#070a12'; ctx.fill();
    ctx.lineWidth=2.0; ctx.strokeStyle=colorHex; ctx.stroke();
  });
}

/* ---------------- AI COACH ---------------- */
const PLAN_TEMPLATE = [
  ["Mon","Strength Training","45 min"],["Tue","Skill Drills","60 min"],["Wed","Recovery","—"],
  ["Thu","Match Simulation","75 min"],["Fri","Speed + Agility","40 min"],["Sat","Practice Match","—"],["Sun","Recovery","—"]
];
function renderPlan(){
  document.getElementById('plan-week').innerHTML = PLAN_TEMPLATE.map(([d,t,m])=>`
    <div class="plan-day" style="background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 12px 16px; display: flex; flex-direction: column; gap: 4px; transition: border-color 0.3s, transform 0.3s;">
      <div class="d" style="font-family: var(--mono); color: var(--cyan); font-weight: 700; font-size: 11px; text-transform: uppercase;">${d}</div>
      <b style="font-size: 13.5px; color: var(--ink);">${t}</b>
      <span style="font-size: 11.5px; color: var(--ink-dim);">${m}</span>
    </div>`).join('');
}
const RECOS = [
  "Your recent matches show a 12% drop in second-half performance. Add two endurance sessions this week.",
  "Reaction time has plateaued over 3 sessions — try adding reflex drills every Tuesday.",
  "Your consistency score is trending up — maintain current strength training frequency.",
  "You're most effective in evening matches. Consider scheduling more fixtures after 5 PM."
];
function generatePlan(){
  const shuffled = [...PLAN_TEMPLATE].sort(()=>Math.random()-0.5).map((p,i)=>[PLAN_TEMPLATE[i][0],p[1],p[2]]);
  document.getElementById('plan-week').innerHTML = shuffled.map(([d,t,m])=>`
    <div class="plan-day" style="background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 12px 16px; display: flex; flex-direction: column; gap: 4px; transition: border-color 0.3s, transform 0.3s;">
      <div class="d" style="font-family: var(--mono); color: var(--cyan); font-weight: 700; font-size: 11px; text-transform: uppercase;">${d}</div>
      <b style="font-size: 13.5px; color: var(--ink);">${t}</b>
      <span style="font-size: 11.5px; color: var(--ink-dim);">${m}</span>
    </div>`).join('');
  document.getElementById('ai-recommendation').innerHTML = '<b>AI Insight —</b> '+RECOS[Math.floor(Math.random()*RECOS.length)];
  toast('New training plan generated','🤖');
}

/* ---------------- LEADERBOARD ---------------- */
let lbSport = 'Cricket';
function renderLbFilters(){
  const sports = Object.keys(SPORT_EMOJI);
  document.getElementById('lb-filters').innerHTML = sports.map(s=>
    `<button class="chip ${s===lbSport?'active':''}" onclick="setLbSport('${s}')">${SPORT_EMOJI[s]} ${s}</button>`).join('');
}
function setLbSport(s){ lbSport=s; renderLbFilters(); renderLbList(); }
function renderLbList(){
  const medals=['🥇','🥈','🥉'];
  const list = athletes.filter(a=>a.sport===lbSport).sort((a,b)=>b.rating-a.rating);
  const colors = ['#f59e0b', '#cbd5e1', '#b45309'];
  document.getElementById('lb-list').innerHTML = list.map((a,i)=>{
    const isTop3 = i < 3;
    const borderStyle = isTop3 ? `border-left: 3.5px solid ${colors[i]}; background: rgba(255,255,255,0.02);` : '';
    const nameColor = isTop3 ? colors[i] : 'var(--ink)';
    return `
    <div class="lb-row" style="${borderStyle} padding: 12px 16px; border-bottom: 1px solid var(--border-soft); display: flex; align-items: center; justify-content: space-between; border-radius: ${isTop3 ? 'var(--radius-sm)' : '0'};">
      <div style="display: flex; align-items: center; gap: 14px;">
        <div class="medal" style="font-size: 15px; font-weight: 700; color: ${isTop3 ? colors[i] : 'var(--ink-faint)'}; width: 28px; text-align: center;">${medals[i]||i+1}</div>
        <div class="name">
          <b style="color: ${nameColor};">${a.name}</b>
          <span style="color: var(--ink-dim); font-size: 11.5px; display: block; margin-top: 2px;">📍 ${a.loc} · ${a.skill}</span>
        </div>
      </div>
      <div class="score mono" style="font-weight: 700; font-size: 14.5px; color: ${isTop3 ? colors[i] : 'var(--ink-dim)'};">${a.rating}</div>
    </div>`;
  }).join('') || `<p style="color:var(--ink-faint);padding:12px;">No ranked athletes yet for ${lbSport}.</p>`;
}

/* ---------------- MESSAGES ---------------- */
let activeConv = 0;
function renderConvList(){
  document.getElementById('conv-list').innerHTML = conversations.map((c,i)=>`
    <div class="conv-item ${i===activeConv?'active':''}" onclick="openConv(${i})">
      <div class="avatar" style="width:38px;height:38px;font-size:12px;">${c.init}</div>
      <div class="name"><b>${c.name}</b><span>${c.last}</span></div>
    </div>`).join('');
}
function openConv(i){
  activeConv=i; renderConvList();
  const c = conversations[i];
  document.getElementById('chat-avatar').textContent = c.init;
  document.getElementById('chat-name').textContent = c.name;
  document.getElementById('chat-body').innerHTML = c.messages.map(m=>`<div class="bubble ${m.from}">${m.text}</div>`).join('');
  document.getElementById('chat-body').scrollTop = 9999;
}
function sendChat(){
  const input = document.getElementById('chat-text');
  const text = input.value.trim(); if(!text) return;
  conversations[activeConv].messages.push({from:'out',text});
  conversations[activeConv].last = text;
  input.value='';
  openConv(activeConv);
  setTimeout(()=>{
    conversations[activeConv].messages.push({from:'in',text:"Sounds good 👍"});
    openConv(activeConv);
  }, 900);
}

/* ---------------- NOTIFICATIONS ---------------- */
function renderNotifications(){
  document.getElementById('notif-list').innerHTML = notifications.map(n=>`
    <div class="notif-item"><div class="ic">${n.icon}</div><div><p>${n.text}</p><span>${n.time}</span></div></div>`).join('');
}
function clearNotifs(){
  document.querySelector('.dot-flag')?.remove();
  toast('All notifications marked as read','✓');
}

/* ---------------- SETTINGS ---------------- */
const SETTINGS_PANELS = {
  account: [["Email","arjun.reddy@athletex.app"],["Phone","+91 90000 00000"],["Password","Last changed 3 months ago"]],
  privacy: [["Profile visibility","Public"],["Show location","On"],["Show rating to others","On"]],
  notifications: [["Match invites","On"],["Event reminders","On"],["AI Coach updates","On"],["Messages","On"]],
  ai: [["Personalized training plans","On"],["AI player matching","On"],["Performance insights","On"]],
  appearance: [["Theme","Cinematic Dark"],["Reduced motion","Off"]],
  security: [["Two-factor authentication","Off"],["Active sessions","2 devices"]],
};
function renderSettings(key){
  const rows = SETTINGS_PANELS[key];
  document.getElementById('settings-panel').innerHTML = rows.map(([label,val])=>{
    const isToggle = val==='On'||val==='Off';
    return `<div class="row-item"><div><b>${label}</b>${!isToggle?`<span>${val}</span>`:''}</div>
      ${isToggle?`<div class="toggle ${val==='On'?'on':''}" onclick="this.classList.toggle('on');toast('Setting updated','✓')"></div>`:`<button class="btn btn-ghost btn-sm">Edit</button>`}</div>`;
  }).join('');
}
document.getElementById('settings-nav').addEventListener('click', e=>{
  const btn = e.target.closest('button'); if(!btn) return;
  document.querySelectorAll('#settings-nav button').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  renderSettings(btn.dataset.s);
});

/* ---------------- AI PLAYER MATCH MODAL ---------------- */
function runAiMatch(){
  const sport = document.getElementById('aim-sport').value;
  const pool = athletes.filter(a=>a.sport===sport).sort((a,b)=>b.match-a.match).slice(0,3);
  document.getElementById('aim-results').innerHTML = pool.map(a=>`
    <div class="player-row" style="background:var(--panel);border-radius:14px;padding:12px;">
      <div class="avatar" style="width:36px;height:36px;font-size:12px;">${initials(a.name)}</div>
      <div class="name"><b>${a.name}</b><span>Skill ${rand(90,99)}% · Location ${rand(85,98)}% · Availability ${rand(80,100)}%</span></div>
      <span class="match-badge mono" style="color:var(--lime)">${a.match}%</span>
    </div>`).join('') + `<button class="btn btn-secondary" style="width:100%;justify-content:center;margin-top:6px;" onclick="toast('Invitations sent to selected players','✓');closeModal('modal-ai-match')">Invite Selected Players</button>`;
}
function rand(a,b){ return Math.floor(a+Math.random()*(b-a)); }

/* ---------------- CREATE MATCH / EVENT ---------------- */
function createMatch(){
  const name = document.getElementById('cm-name').value || 'New Match';
  matches.unshift({
    name, sport:document.getElementById('cm-sport').value, loc:document.getElementById('cm-loc').value||'Kukatpally',
    date:document.getElementById('cm-date').value||'TBD', time:document.getElementById('cm-time').value||'TBD',
    joined:1, max:Number(document.getElementById('cm-max').value)||10, skill:document.getElementById('cm-skill').value, organizer:'Arjun Reddy'
  });
  renderMatches(); closeModal('modal-create-match'); toast('Match created: '+name,'✓');
}
function createEvent(){
  const name = document.getElementById('ce-name').value || 'New Event';
  events.unshift({
    name, sport:document.getElementById('ce-sport').value, date:document.getElementById('ce-date').value||'TBD',
    venue:document.getElementById('ce-venue').value||'Hyderabad', participants:0,
    prize:'₹'+(Number(document.getElementById('ce-prize').value)||0).toLocaleString('en-IN')
  });
  renderMatches(); closeModal('modal-create-event'); toast('Event created: '+name,'✓');
}

/* ---------------- GLOBAL SEARCH ---------------- */
function handleGlobalSearch(q){
  const box = document.getElementById('search-results');
  if(!q.trim()){ box.style.display='none'; return; }
  const ql = q.toLowerCase();
  const a = athletes.filter(x=>x.name.toLowerCase().includes(ql)||x.sport.toLowerCase().includes(ql)).slice(0,3);
  const t = teams.filter(x=>x.name.toLowerCase().includes(ql)).slice(0,2);
  const e = events.filter(x=>x.name.toLowerCase().includes(ql)).slice(0,2);
  const m = matches.filter(x=>x.name.toLowerCase().includes(ql)).slice(0,2);
  const sec = (title,arr,fn)=> arr.length?`<div style="margin-bottom:10px;"><div class="eyebrow">${title}</div>${arr.map(fn).join('')}</div>`:'';
  box.innerHTML = sec('Athletes',a,x=>`<div class="player-row" onclick="go('discover')"><div class="avatar" style="width:28px;height:28px;font-size:10px;">${initials(x.name)}</div><div class="name"><b style="font-size:12.5px">${x.name}</b></div></div>`)
    + sec('Teams',t,x=>`<div class="player-row" onclick="go('play')"><div class="name"><b style="font-size:12.5px">${x.name}</b></div></div>`)
    + sec('Events',e,x=>`<div class="player-row" onclick="go('play')"><div class="name"><b style="font-size:12.5px">${x.name}</b></div></div>`)
    + sec('Matches',m,x=>`<div class="player-row" onclick="go('play')"><div class="name"><b style="font-size:12.5px">${x.name}</b></div></div>`)
    || `<p style="font-size:12.5px;color:var(--ink-faint);">No results for "${q}"</p>`;
  box.style.display='block';
}

/* ---------------- MODALS ---------------- */
function openModal(id){ document.getElementById(id).classList.add('show'); }
function closeModal(id){ document.getElementById(id).classList.remove('show'); }
document.querySelectorAll('.modal-overlay').forEach(m=> m.addEventListener('click', e=>{ if(e.target===m) m.classList.remove('show'); }));
document.addEventListener('keydown', e=>{ if(e.key==='Escape') document.querySelectorAll('.modal-overlay.show').forEach(m=>m.classList.remove('show')); });

/* ---------------- TOASTS ---------------- */
function toast(msg, icon='✓'){
  const wrap = document.getElementById('toast-wrap');
  const el = document.createElement('div');
  el.className='toast';
  el.innerHTML = `<span>${icon}</span><span>${msg}</span>`;
  wrap.appendChild(el);
  requestAnimationFrame(()=> el.classList.add('show'));
  setTimeout(()=>{ el.classList.remove('show'); setTimeout(()=>el.remove(),400); }, 3200);
}

/* ---------------- RING ANIMATION ---------------- */
function animateRings(){
  document.querySelectorAll('.ring-fill').forEach(ring=>{
    const target = Number(ring.dataset.target);
    const r = Number(ring.getAttribute('r'));
    const circ = 2*Math.PI*r;
    const offset = circ - (target/100)*circ;
    ring.style.strokeDasharray = circ;
    ring.style.strokeDashoffset = circ;
    requestAnimationFrame(()=> setTimeout(()=>{ ring.style.strokeDashoffset = offset; },100));
  });
}

/* ---------------- THREE.JS CINEMATIC 3D ENGINE ---------------- */
(function athleTEX3D() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;

  const isMobile = window.innerWidth < 768;
  const particleCount = isMobile ? 350 : 1200;

  // WebGL Renderer Setup
  const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = !isMobile;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // Scene & Camera
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  const cameraLookAt = new THREE.Vector3(0, 0, 0);

  // Cinematic Lighting
  const ambientLight = new THREE.AmbientLight(0x08101f, 1.8);
  scene.add(ambientLight);

  const mainLight = new THREE.DirectionalLight(0x22d3ee, 3.0);
  mainLight.position.set(10, 25, 15);
  mainLight.castShadow = !isMobile;
  if (mainLight.castShadow) {
    mainLight.shadow.mapSize.width = 1024;
    mainLight.shadow.mapSize.height = 1024;
    mainLight.shadow.bias = -0.0005;
  }
  scene.add(mainLight);

  const rimLight = new THREE.PointLight(0x2f6bff, 6, 45);
  rimLight.position.set(-8, 5, -12);
  scene.add(rimLight);

  const ambientWarm = new THREE.PointLight(0xf2b705, 1.5, 30);
  ambientWarm.position.set(15, -5, -5);
  scene.add(ambientWarm);

  // PROCEDURAL TEXTURE GENERATORS
  function createWoodTexture() {
    const c = document.createElement('canvas');
    c.width = 512; c.height = 512;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#e8cfa6'; ctx.fillRect(0, 0, 512, 512);
    ctx.strokeStyle = '#b89463';
    for (let i = 0; i < 45; i++) {
      ctx.lineWidth = 1.0 + Math.random() * 1.5;
      ctx.beginPath();
      const startX = (i / 45) * 512 + (Math.random() - 0.5) * 12;
      ctx.moveTo(startX, 0);
      for (let y = 0; y <= 512; y += 32) {
        const offset = Math.sin(y * 0.02 + i) * 3;
        ctx.lineTo(startX + offset, y);
      }
      ctx.stroke();
    }
    for (let i = 0; i < 300; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.08)' : 'rgba(120,80,40,0.04)';
      ctx.fillRect(Math.random() * 512, Math.random() * 512, 2 + Math.random() * 4, 10 + Math.random() * 60);
    }
    return new THREE.CanvasTexture(c);
  }

  function createGripTexture() {
    const c = document.createElement('canvas');
    c.width = 128; c.height = 128;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#f4f0e6'; ctx.fillRect(0, 0, 128, 128);
    ctx.strokeStyle = '#cccccc'; ctx.lineWidth = 1;
    const size = 8;
    for (let x = 0; x < 256; x += size) {
      ctx.beginPath();
      ctx.moveTo(x - 128, 0); ctx.lineTo(x, 128);
      ctx.moveTo(x, 0); ctx.lineTo(x - 128, 128);
      ctx.stroke();
    }
    const texture = new THREE.CanvasTexture(c);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(3, 10);
    return texture;
  }

  function createLeatherTexture() {
    const c = document.createElement('canvas');
    c.width = 256; c.height = 256;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#900a06'; ctx.fillRect(0, 0, 256, 256);
    ctx.fillStyle = '#6e0704';
    for (let i = 0; i < 600; i++) {
      ctx.fillRect(Math.random() * 256, Math.random() * 256, 1.5, 1.5);
    }
    return new THREE.CanvasTexture(c);
  }

  function createLeatherBumpTexture() {
    const c = document.createElement('canvas');
    c.width = 128; c.height = 128;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, 128, 128);
    ctx.fillStyle = '#000000';
    for (let i = 0; i < 1500; i++) {
      const x = Math.random() * 128;
      const y = Math.random() * 128;
      const r = 0.5 + Math.random() * 0.8;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    const texture = new THREE.CanvasTexture(c);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(6, 6);
    return texture;
  }

  function createFootballTexture() {
    const c = document.createElement('canvas');
    c.width = 512; c.height = 512;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#edf0f6'; ctx.fillRect(0, 0, 512, 512);
    ctx.fillStyle = '#1c1c20';
    const drawPentagon = (cx, cy, r) => {
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
        ctx.lineTo(cx + r * Math.cos(angle), cy + r * Math.sin(angle));
      }
      ctx.closePath(); ctx.fill();
    };
    const centers = [[256, 256], [120, 110], [392, 110], [80, 280], [432, 280], [170, 420], [342, 420]];
    centers.forEach(([x, y]) => drawPentagon(x, y, 42));
    ctx.strokeStyle = '#0e0e12'; ctx.lineWidth = 5;
    for (let i = 0; i < centers.length; i++) {
      for (let j = i + 1; j < centers.length; j++) {
        const dist = Math.hypot(centers[i][0] - centers[j][0], centers[i][1] - centers[j][1]);
        if (dist < 220) {
          ctx.beginPath(); ctx.moveTo(centers[i][0], centers[i][1]); ctx.lineTo(centers[j][0], centers[j][1]); ctx.stroke();
        }
      }
    }
    return new THREE.CanvasTexture(c);
  }

  function createFootballNetTexture() {
    const c = document.createElement('canvas');
    c.width = 64; c.height = 64;
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, 64, 64);
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.5;
    ctx.strokeRect(0, 0, 64, 64);
    const texture = new THREE.CanvasTexture(c);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(16, 12);
    return texture;
  }

  function createNetTexture() {
    const c = document.createElement('canvas');
    c.width = 128; c.height = 64;
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, 128, 64);
    ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, 128, 8);
    ctx.strokeStyle = '#6a1d1d'; ctx.lineWidth = 1;
    const size = 3;
    for (let x = 0; x < 128; x += size) {
      ctx.beginPath(); ctx.moveTo(x, 8); ctx.lineTo(x, 64); ctx.stroke();
    }
    for (let y = 8; y < 64; y += size) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(128, y); ctx.stroke();
    }
    const texture = new THREE.CanvasTexture(c);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.repeat.set(16, 1);
    return texture;
  }

  function createCourtLinesTexture() {
    const c = document.createElement('canvas');
    c.width = 512; c.height = 384;
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, 512, 384);
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, 492, 364);
    ctx.beginPath(); ctx.moveTo(256, 10); ctx.lineTo(256, 374); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(176, 10); ctx.lineTo(176, 374);
    ctx.moveTo(336, 10); ctx.lineTo(336, 374);
    ctx.stroke();
    return new THREE.CanvasTexture(c);
  }

  function createPitchLinesTexture() {
    const c = document.createElement('canvas');
    c.width = 512; c.height = 340;
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, 512, 340);
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 5;
    ctx.strokeRect(10, 10, 492, 320);
    ctx.strokeRect(10, 80, 80, 180);
    ctx.strokeRect(422, 80, 80, 180);
    ctx.beginPath(); ctx.moveTo(256, 10); ctx.lineTo(256, 330); ctx.stroke();
    ctx.beginPath(); ctx.arc(256, 170, 50, 0, Math.PI * 2); ctx.stroke();
    return new THREE.CanvasTexture(c);
  }

  function createPoolTileTexture() {
    const c = document.createElement('canvas');
    c.width = 128; c.height = 128;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#0f2b46'; ctx.fillRect(0, 0, 128, 128);
    ctx.strokeStyle = '#005b7f'; ctx.lineWidth = 1;
    const size = 16;
    for (let x = 0; x < 128; x += size) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 128); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, x); ctx.lineTo(128, x); ctx.stroke();
    }
    const texture = new THREE.CanvasTexture(c);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(8, 8);
    return texture;
  }

  function createChessTexture() {
    const c = document.createElement('canvas');
    c.width = 512; c.height = 512;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#d8b07a'; ctx.fillRect(0, 0, 512, 512);
    ctx.fillStyle = '#2d1a10';
    for (let r = 0; r < 8; r++) {
      for (let col = 0; col < 8; col++) {
        if ((r + col) % 2 === 1) ctx.fillRect(col * 64, r * 64, 64, 64);
      }
    }
    return new THREE.CanvasTexture(c);
  }

  const groups = Array.from({ length: 9 }, () => new THREE.Group());
  groups.forEach((g, i) => {
    g.position.x = i * 40;
    scene.add(g);
  });

  // Scene 0: Athlete Hub Concept (spinning rings + floating football)
  const athleteCore = new THREE.Mesh(
    new THREE.TorusGeometry(3.5, 0.08, 8, 48),
    new THREE.MeshStandardMaterial({ color: 0x22d3ee, metalness: 0.9, roughness: 0.1 })
  );
  athleteCore.rotation.x = Math.PI / 2;
  groups[0].add(athleteCore);

  const athleteInner = new THREE.Mesh(
    new THREE.TorusGeometry(2.2, 0.05, 8, 48),
    new THREE.MeshStandardMaterial({ color: 0x2f6bff, metalness: 0.9, roughness: 0.1 })
  );
  athleteInner.rotation.y = Math.PI / 3;
  groups[0].add(athleteInner);

  const heroBall = new THREE.Mesh(
    new THREE.SphereGeometry(1.2, 32, 32),
    new THREE.MeshStandardMaterial({ map: createFootballTexture(), roughness: 0.22, metalness: 0.05 })
  );
  heroBall.name = "hero_ball";
  heroBall.castShadow = true;
  groups[0].add(heroBall);

  // Scene 1: Cricket
  const batGroup = new THREE.Group();
  batGroup.name = "cricket_bat";

  const batShape = new THREE.Shape();
  batShape.moveTo(-0.9, 0.5);
  batShape.quadraticCurveTo(-0.9, 0, -0.6, 0);
  batShape.lineTo(0.6, 0);
  batShape.quadraticCurveTo(0.9, 0, 0.9, 0.5);
  batShape.lineTo(0.9, 8.0);
  batShape.quadraticCurveTo(0.9, 8.8, 0.28, 9.0);
  batShape.lineTo(-0.28, 9.0);
  batShape.quadraticCurveTo(-0.9, 8.8, -0.9, 8.0);
  batShape.lineTo(-0.9, 0.5);

  const extrudeSettings = { depth: 0.8, bevelEnabled: true, bevelSegments: 3, steps: 20, bevelSize: 0.04, bevelThickness: 0.04 };
  const bladeGeom = new THREE.ExtrudeGeometry(batShape, extrudeSettings);

  function getBatThickness(x, y) {
    const widthHalf = 0.9;
    const edgeThickness = 0.22;
    const spineThickness = 0.85;
    const xFactor = 1.0 - Math.min(1.0, Math.abs(x) / widthHalf);
    let yFactor = 1.0;
    if (y < 1.5) {
      yFactor = 0.45 + 0.55 * (y / 1.5);
    } else if (y > 7.0) {
      yFactor = 1.0 - 0.45 * ((y - 7.0) / 2.0);
    }
    return edgeThickness + (spineThickness - edgeThickness) * xFactor * yFactor;
  }

  const posAttr = bladeGeom.attributes.position;
  let maxZ = 0;
  for (let i = 0; i < posAttr.count; i++) {
    const z = posAttr.getZ(i);
    if (z > maxZ) maxZ = z;
  }
  if (maxZ > 0) {
    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      const y = posAttr.getY(i);
      const z = posAttr.getZ(i);
      const zNorm = z / maxZ;
      const thickness = getBatThickness(x, y);
      posAttr.setZ(i, -zNorm * thickness);
    }
  }
  bladeGeom.computeVertexNormals();

  const batBlade = new THREE.Mesh(
    bladeGeom,
    new THREE.MeshStandardMaterial({ map: createWoodTexture(), roughness: 0.45, metalness: 0.05 })
  );
  batBlade.position.y = -4.5;
  batBlade.castShadow = true;
  batGroup.add(batBlade);

  const batHandle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.25, 0.25, 4.5, 16),
    new THREE.MeshStandardMaterial({
      map: createGripTexture(),
      bumpMap: createGripTexture(),
      bumpScale: 0.02,
      roughness: 0.85,
      metalness: 0.05
    })
  );
  batHandle.position.y = 6.25 - 4.5;
  batHandle.castShadow = true;
  batGroup.add(batHandle);

  batGroup.position.set(-1.2, 0.7, -0.5);
  batGroup.rotation.z = -0.4;
  groups[1].add(batGroup);

  const ballGroup = new THREE.Group();
  ballGroup.name = "cricket_ball";
  const ballMesh = new THREE.Mesh(
    new THREE.SphereGeometry(1.1, 32, 32),
    new THREE.MeshStandardMaterial({
      color: 0x900a06,
      bumpMap: createLeatherBumpTexture(),
      bumpScale: 0.005,
      roughness: 0.25,
      metalness: 0.1
    })
  );
  ballMesh.castShadow = true;
  ballGroup.add(ballMesh);

  const seamGroup = new THREE.Group();
  const centralSeam = new THREE.Mesh(
    new THREE.TorusGeometry(1.1, 0.03, 8, 64),
    new THREE.MeshStandardMaterial({ color: 0x7e0603, roughness: 0.3 })
  );
  centralSeam.rotation.y = Math.PI / 2;
  seamGroup.add(centralSeam);

  const stitchMat = new THREE.MeshStandardMaterial({ color: 0xe8e2d5, roughness: 0.6 });
  const numStitches = 60;
  for (let i = 0; i < numStitches; i++) {
    const angle = (i / numStitches) * Math.PI * 2;
    const stitchGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.08, 4);

    const stitchL = new THREE.Mesh(stitchGeo, stitchMat);
    const r = 1.105;
    const py = r * Math.cos(angle);
    const pz = r * Math.sin(angle);
    const px = 0.03;
    stitchL.position.set(px, py, pz);
    stitchL.rotation.x = angle;
    stitchL.rotation.z = 0.55;
    seamGroup.add(stitchL);

    const stitchR = new THREE.Mesh(stitchGeo, stitchMat);
    stitchR.position.set(-px, py, pz);
    stitchR.rotation.x = angle;
    stitchR.rotation.z = -0.55;
    seamGroup.add(stitchR);
  }
  ballGroup.add(seamGroup);
  ballGroup.position.set(1.4, -0.2, 1.5);
  groups[1].add(ballGroup);

  const stumpsGroup = new THREE.Group();
  const stumpMat = new THREE.MeshStandardMaterial({ map: createWoodTexture(), roughness: 0.5 });
  for (let i = -1.2; i <= 1.2; i += 1.2) {
    const stump = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 6.5, 16), stumpMat);
    stump.position.set(i, -1, -2.5);
    stump.castShadow = true;
    stumpsGroup.add(stump);
  }
  const bailMat = new THREE.MeshStandardMaterial({ map: createWoodTexture(), roughness: 0.6 });
  const bail1 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.1, 12), bailMat);
  bail1.position.set(-0.6, 2.3, -2.5);
  const bail2 = bail1.clone(); bail2.position.x = 0.6;
  stumpsGroup.add(bail1, bail2);
  groups[1].add(stumpsGroup);

  // Scene 2: Football
  const football = new THREE.Mesh(
    new THREE.SphereGeometry(1.4, 32, 32),
    new THREE.MeshStandardMaterial({ map: createFootballTexture(), roughness: 0.22, metalness: 0.05 })
  );
  football.name = "football";
  football.position.set(0, -1.3, 3);
  football.castShadow = true;
  groups[2].add(football);

  const goalGroup = new THREE.Group();
  const goalMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee, roughness: 0.3 });
  const leftPost = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 7.5, 16), goalMat);
  leftPost.position.set(-5.5, 1.25, -3);
  const rightPost = leftPost.clone(); rightPost.position.x = 5.5;
  const crossbar = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 11.2, 16), goalMat);
  crossbar.rotation.z = Math.PI / 2;
  crossbar.position.set(0, 5, -3);
  goalGroup.add(leftPost, rightPost, crossbar);

  const fbNetTexture = createFootballNetTexture();
  const fbNetMat = new THREE.MeshStandardMaterial({
    map: fbNetTexture,
    transparent: true,
    opacity: 0.25,
    side: THREE.DoubleSide,
    roughness: 0.9
  });

  const backNet = new THREE.Mesh(new THREE.PlaneGeometry(11, 7.5), fbNetMat);
  backNet.position.set(0, 1.25, -5.5);
  goalGroup.add(backNet);

  const topNet = new THREE.Mesh(new THREE.PlaneGeometry(11, 2.5), fbNetMat);
  topNet.rotation.x = Math.PI / 2;
  topNet.position.set(0, 5.0, -4.25);
  goalGroup.add(topNet);

  const leftNet = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 7.5), fbNetMat);
  leftNet.rotation.y = Math.PI / 2;
  leftNet.position.set(-5.5, 1.25, -4.25);
  goalGroup.add(leftNet);

  const rightNet = leftNet.clone();
  rightNet.position.x = 5.5;
  goalGroup.add(rightNet);
  groups[2].add(goalGroup);

  const pitchGeom = new THREE.PlaneGeometry(24, 16);
  const pitchMat = new THREE.MeshStandardMaterial({ color: 0x1a4627, roughness: 0.95 });
  const pitch = new THREE.Mesh(pitchGeom, pitchMat);
  pitch.rotation.x = -Math.PI / 2;
  pitch.position.set(0, -2.5, -2);
  pitch.receiveShadow = true;
  groups[2].add(pitch);

  const pitchLines = new THREE.Mesh(pitchGeom, new THREE.MeshBasicMaterial({ map: createPitchLinesTexture(), transparent: true, opacity: 0.65 }));
  pitchLines.rotation.x = -Math.PI / 2;
  pitchLines.position.set(0, -2.49, -2);
  groups[2].add(pitchLines);

  // Scene 3: Badminton
  const racket = new THREE.Group();
  racket.name = "racket";
  const racketFrame = new THREE.Mesh(
    new THREE.TorusGeometry(1.8, 0.06, 8, 32),
    new THREE.MeshStandardMaterial({ color: 0x22d3ee, metalness: 0.8, roughness: 0.2 })
  );
  racketFrame.scale.set(1.0, 1.35, 1.0);
  racketFrame.position.y = 4.2;

  const stringCoords = [];
  const ovalWidth = 1.8;
  const ovalHeight = 1.8 * 1.35;
  const stringSpacing = 0.2;
  for (let x = -ovalWidth + 0.1; x <= ovalWidth - 0.1; x += stringSpacing) {
    const maxVal = 1.0 - (x * x) / (ovalWidth * ovalWidth);
    if (maxVal >= 0) {
      const yBound = ovalHeight * Math.sqrt(maxVal);
      stringCoords.push(x, 4.2 - yBound, 0,  x, 4.2 + yBound, 0);
    }
  }
  for (let y = -ovalHeight + 0.1; y <= ovalHeight - 0.1; y += stringSpacing) {
    const maxVal = 1.0 - (y * y) / (ovalHeight * ovalHeight);
    if (maxVal >= 0) {
      const xBound = ovalWidth * Math.sqrt(maxVal);
      stringCoords.push(-xBound, 4.2 + y, 0,  xBound, 4.2 + y, 0);
    }
  }
  const strGeom = new THREE.BufferGeometry();
  strGeom.setAttribute('position', new THREE.Float32BufferAttribute(stringCoords, 3));
  const strMat = new THREE.LineBasicMaterial({ color: 0xedf0f6, transparent: true, opacity: 0.4 });
  const strMesh = new THREE.LineSegments(strGeom, strMat);
  racket.add(strMesh);

  const shaft = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.04, 5.5, 16),
    new THREE.MeshStandardMaterial({ color: 0x2f6bff, metalness: 0.7, roughness: 0.3 })
  );
  shaft.position.y = -0.5;

  const tJoint = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.06, 0.35, 16),
    new THREE.MeshStandardMaterial({ color: 0x22d3ee, metalness: 0.8, roughness: 0.2 })
  );
  tJoint.position.y = 4.2 - 1.8 * 1.35;

  const grip = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.18, 2.2, 16),
    new THREE.MeshStandardMaterial({ color: 0xe8cfa6, roughness: 0.75 })
  );
  grip.position.y = -4.25;
  racket.add(racketFrame, shaft, tJoint, grip);
  racket.position.set(-0.8, -0.2, -1.0);
  racket.rotation.set(0.4, 0.6, -0.8);
  racket.scale.set(0.6, 0.6, 0.6);
  groups[3].add(racket);

  const shuttle = new THREE.Group();
  shuttle.name = "shuttle";
  const shuttleBase = new THREE.Mesh(
    new THREE.SphereGeometry(0.35, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: 0xe8cfa6, roughness: 0.4 })
  );
  shuttleBase.rotation.x = Math.PI / 2;
  shuttle.add(shuttleBase);

  const featherMat = new THREE.MeshStandardMaterial({ color: 0xffffff, side: THREE.DoubleSide, roughness: 0.8, transparent: true, opacity: 0.9 });
  const numFeathers = 16;
  const shaftGeom = new THREE.CylinderGeometry(0.008, 0.008, 1.2, 4);
  const vaneGeom = new THREE.PlaneGeometry(0.15, 0.6);
  for (let i = 0; i < numFeathers; i++) {
    const angle = (i / numFeathers) * Math.PI * 2;
    const fGroup = new THREE.Group();
    const sMesh = new THREE.Mesh(shaftGeom, new THREE.MeshStandardMaterial({ color: 0xdddddd, roughness: 0.6 }));
    sMesh.position.y = 0.6;
    fGroup.add(sMesh);
    const vMesh = new THREE.Mesh(vaneGeom, featherMat);
    vMesh.position.set(0, 0.9, 0);
    fGroup.add(vMesh);

    const pivot = new THREE.Group();
    pivot.rotation.z = angle;
    fGroup.rotation.x = Math.PI / 2 + 0.32;
    pivot.add(fGroup);
    shuttle.add(pivot);
  }
  shuttle.position.set(1.0, 0.2, 0.0);
  shuttle.rotation.set(0.1, -Math.PI / 2, 0.2);
  groups[3].add(shuttle);

  const badNetGroup = new THREE.Group();
  const badPostGeom = new THREE.CylinderGeometry(0.05, 0.05, 3.5, 16);
  const badPostMat = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.7, roughness: 0.3 });

  const badPostL = new THREE.Mesh(badPostGeom, badPostMat);
  badPostL.position.set(0, -0.25, -4.0);
  badPostL.castShadow = true;
  badNetGroup.add(badPostL);

  const badPostR = new THREE.Mesh(badPostGeom, badPostMat);
  badPostR.position.set(0, -0.25, 4.0);
  badPostR.castShadow = true;
  badNetGroup.add(badPostR);

  const badNetGeom = new THREE.PlaneGeometry(8.0, 1.5);
  const badNetMat = new THREE.MeshStandardMaterial({ map: createNetTexture(), transparent: true, opacity: 0.85, side: THREE.DoubleSide, roughness: 0.8 });
  const badNetMesh = new THREE.Mesh(badNetGeom, badNetMat);
  badNetMesh.rotation.y = Math.PI / 2;
  badNetMesh.position.set(0, 0.75, 0);
  badNetGroup.add(badNetMesh);
  groups[3].add(badNetGroup);

  const badCourtFloor = new THREE.Mesh(new THREE.PlaneGeometry(16, 12), new THREE.MeshStandardMaterial({ color: 0x0c402d, roughness: 0.9 }));
  badCourtFloor.rotation.x = -Math.PI / 2;
  badCourtFloor.position.set(0, -2.0, 0);
  badCourtFloor.receiveShadow = true;
  groups[3].add(badCourtFloor);

  const badCourtLines = new THREE.Mesh(new THREE.PlaneGeometry(16, 12), new THREE.MeshBasicMaterial({ map: createCourtLinesTexture(), transparent: true, opacity: 0.65 }));
  badCourtLines.rotation.x = -Math.PI / 2;
  badCourtLines.position.set(0, -1.99, 0);
  groups[3].add(badCourtLines);

  // Scene 4: Swimming Pool Water
  const waterMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(16, 16, 16, 16),
    new THREE.MeshPhysicalMaterial({
      color: 0x063a4a, roughness: 0.05, metalness: 0.1, transmission: 0.75, ior: 1.333,
      transparent: true, opacity: 0.88, side: THREE.DoubleSide
    })
  );
  waterMesh.rotation.x = -Math.PI / 2;
  waterMesh.position.y = -1;
  waterMesh.name = "water";
  groups[4].add(waterMesh);

  const poolFloor = new THREE.Mesh(
    new THREE.PlaneGeometry(16, 16),
    new THREE.MeshStandardMaterial({ map: createPoolTileTexture(), roughness: 0.3 })
  );
  poolFloor.rotation.x = -Math.PI / 2;
  poolFloor.position.y = -3.0;
  groups[4].add(poolFloor);

  const laneRope = new THREE.Group();
  for (let x = -8; x <= 8; x += 0.6) {
    const floatSegment = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 0.45, 8),
      new THREE.MeshStandardMaterial({ color: x % 1.2 === 0 ? 0xff3b30 : 0xffffff })
    );
    floatSegment.rotation.z = Math.PI / 2;
    floatSegment.position.set(x, -0.9, 3);
    laneRope.add(floatSegment);
  }
  groups[4].add(laneRope);

  // Scene 5: Running Track & shoe
  const trackMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(24, 10),
    new THREE.MeshStandardMaterial({ color: 0x6a1510, roughness: 0.9 })
  );
  trackMesh.rotation.x = -Math.PI / 2;
  trackMesh.position.y = -2;
  groups[5].add(trackMesh);
  for (let z = -3; z <= 3; z += 2) {
    const laneLine = new THREE.Mesh(new THREE.PlaneGeometry(24, 0.08), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    laneLine.rotation.x = -Math.PI / 2;
    laneLine.position.set(0, -1.98, z);
    groups[5].add(laneLine);
  }

  const shoe = new THREE.Group();
  shoe.name = "shoe";

  const soleGeom = new THREE.BoxGeometry(2.4, 0.22, 0.9, 10, 2, 2);
  const solePos = soleGeom.attributes.position;
  for (let i = 0; i < solePos.count; i++) {
    const x = solePos.getX(i);
    if (x > 0.3) solePos.setY(i, solePos.getY(i) + Math.pow(x - 0.3, 2) * 0.2);
    if (x < -0.5) solePos.setY(i, solePos.getY(i) - Math.abs(x + 0.5) * 0.05);
  }
  soleGeom.computeVertexNormals();
  const soleMesh = new THREE.Mesh(soleGeom, new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 }));
  soleMesh.position.y = -1.82;
  soleMesh.castShadow = true;
  shoe.add(soleMesh);

  const upperGeom = new THREE.SphereGeometry(0.65, 16, 16);
  upperGeom.scale(1.5, 0.8, 0.7);
  const upperPos = upperGeom.attributes.position;
  for (let i = 0; i < upperPos.count; i++) {
    const x = upperPos.getX(i);
    const y = upperPos.getY(i);
    if (x > 0.0) upperPos.setY(i, y * (1.0 - x * 0.4));
  }
  upperGeom.computeVertexNormals();
  const upperMesh = new THREE.Mesh(upperGeom, new THREE.MeshStandardMaterial({ color: 0x2f6bff, roughness: 0.8, metalness: 0.1 }));
  upperMesh.position.set(-0.1, -1.45, 0);
  upperMesh.castShadow = true;
  shoe.add(upperMesh);

  const collarMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, 0.4, 16), new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.7 }));
  collarMesh.position.set(-0.4, -1.15, 0);
  collarMesh.rotation.z = -0.2;
  shoe.add(collarMesh);

  const lacesGeom = new THREE.BufferGeometry();
  lacesGeom.setAttribute('position', new THREE.Float32BufferAttribute([
    -0.1, -1.15, 0.15,  -0.1, -1.15, -0.15,
    0.1, -1.22, 0.12,   0.1, -1.22, -0.12,
    0.3, -1.3, 0.1,    0.3, -1.3, -0.1
  ], 3));
  const laces = new THREE.LineSegments(lacesGeom, new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 }));
  shoe.add(laces);

  shoe.position.set(0, 0, 1);
  groups[5].add(shoe);

  // Scene 6: Chess
  const chessBoard = new THREE.Mesh(
    new THREE.BoxGeometry(9, 0.4, 9),
    new THREE.MeshStandardMaterial({ map: createChessTexture(), roughness: 0.25 })
  );
  chessBoard.position.y = -1.6;
  chessBoard.receiveShadow = true;
  groups[6].add(chessBoard);

  const kingPoints = [];
  kingPoints.push(new THREE.Vector2(0, -1.6));
  kingPoints.push(new THREE.Vector2(1.1, -1.6));
  kingPoints.push(new THREE.Vector2(1.1, -1.45));
  kingPoints.push(new THREE.Vector2(0.95, -1.4));
  kingPoints.push(new THREE.Vector2(0.95, -1.25));
  kingPoints.push(new THREE.Vector2(0.75, -1.15));
  kingPoints.push(new THREE.Vector2(0.55, -0.6));
  kingPoints.push(new THREE.Vector2(0.42, 0.1));
  kingPoints.push(new THREE.Vector2(0.38, 0.7));
  kingPoints.push(new THREE.Vector2(0.55, 0.75));
  kingPoints.push(new THREE.Vector2(0.65, 0.85));
  kingPoints.push(new THREE.Vector2(0.55, 0.95));
  kingPoints.push(new THREE.Vector2(0.40, 1.0));
  kingPoints.push(new THREE.Vector2(0.52, 1.05));
  kingPoints.push(new THREE.Vector2(0.68, 1.4));
  kingPoints.push(new THREE.Vector2(0.68, 1.5));
  kingPoints.push(new THREE.Vector2(0.0, 1.55));

  const kingMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xfbfaf6,
    roughness: 0.1,
    metalness: 0.05,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
    transmission: 0.25,
    ior: 1.55
  });

  const chessKing = new THREE.Group();
  chessKing.name = "chess_king";

  const kingBody = new THREE.Mesh(
    new THREE.LatheGeometry(kingPoints, 32),
    kingMaterial
  );
  kingBody.castShadow = true;
  chessKing.add(kingBody);

  // Add realistic top cross for the King piece
  const crossGroup = new THREE.Group();
  
  const crossVert = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, 0.5, 0.12),
    kingMaterial
  );
  crossVert.position.y = 1.55 + 0.25;
  crossVert.castShadow = true;
  crossGroup.add(crossVert);
  
  const crossHoriz = new THREE.Mesh(
    new THREE.BoxGeometry(0.35, 0.12, 0.12),
    kingMaterial
  );
  crossHoriz.position.y = 1.55 + 0.35;
  crossHoriz.castShadow = true;
  crossGroup.add(crossHoriz);

  const crossBaseBall = new THREE.Mesh(
    new THREE.SphereGeometry(0.15, 8, 8),
    kingMaterial
  );
  crossBaseBall.position.y = 1.55;
  crossBaseBall.castShadow = true;
  crossGroup.add(crossBaseBall);

  chessKing.add(crossGroup);

  chessKing.position.set(-1.1, -1.4, -1.1);
  groups[6].add(chessKing);

  // Scene 7: Athlete network nodes
  const netGroup = new THREE.Group();
  const nodeMat = new THREE.MeshStandardMaterial({ color: 0x22d3ee, roughness: 0.1, metalness: 0.8 });
  const nodeGeo = new THREE.SphereGeometry(0.2, 12, 12);
  const nodesPos = Array.from({ length: 15 }, () => new THREE.Vector3((Math.random() - 0.5) * 8, (Math.random() - 0.5) * 5, (Math.random() - 0.5) * 6));
  nodesPos.forEach(pos => {
    const node = new THREE.Mesh(nodeGeo, nodeMat);
    node.position.copy(pos);
    netGroup.add(node);
  });

  const lineCoords = [];
  for (let i = 0; i < nodesPos.length; i++) {
    for (let j = i + 1; j < nodesPos.length; j++) {
      const dist = nodesPos[i].distanceTo(nodesPos[j]);
      if (dist < 4.0) {
        lineCoords.push(
          nodesPos[i].x, nodesPos[i].y, nodesPos[i].z,
          nodesPos[j].x, nodesPos[j].y, nodesPos[j].z
        );
      }
    }
  }
  const netLineGeo = new THREE.BufferGeometry();
  netLineGeo.setAttribute('position', new THREE.Float32BufferAttribute(lineCoords, 3));
  const netLineMat = new THREE.LineBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.35 });
  const netLines = new THREE.LineSegments(netLineGeo, netLineMat);
  netGroup.add(netLines);
  groups[7].add(netGroup);

  // Scene 8: Final Sphere Core
  const finalSphere = new THREE.Mesh(
    new THREE.SphereGeometry(3.0, 32, 32),
    new THREE.MeshPhysicalMaterial({
      color: 0x22d3ee, transmission: 0.9, roughness: 0.12, transparent: true, opacity: 0.88, ior: 1.5, emissive: 0x0a3c4a
    })
  );
  finalSphere.name = "final_core";
  groups[8].add(finalSphere);
  for (let i = 0; i < 3; i++) {
    const torus = new THREE.Mesh(
      new THREE.TorusGeometry(4.4 + i * 0.7, 0.04, 6, 64),
      new THREE.MeshBasicMaterial({ color: i === 1 ? 0x2f6bff : 0x22d3ee, transparent: true, opacity: 0.26 })
    );
    torus.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
    torus.name = `torus_${i}`;
    groups[8].add(torus);
  }

  // MORPHABLE GLOWING PARTICLE SYSTEM
  const particleGeometry = new THREE.BufferGeometry();
  const particlePositions = new Float32Array(particleCount * 3);
  const particleColors = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount * 3; i++) {
    particlePositions[i] = (Math.random() - 0.5) * 50;
    particleColors[i] = Math.random();
  }
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
  particleGeometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

  const pCanvas = document.createElement('canvas');
  pCanvas.width = 16; pCanvas.height = 16;
  const pCtx = pCanvas.getContext('2d');
  const g = pCtx.createRadialGradient(8, 8, 0, 8, 8, 8);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.5, 'rgba(34,211,238,0.55)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  pCtx.fillStyle = g; pCtx.fillRect(0, 0, 16, 16);

  const particleMaterial = new THREE.PointsMaterial({
    size: isMobile ? 0.22 : 0.16, vertexColors: true, transparent: true, opacity: 0.85,
    blending: THREE.AdditiveBlending, depthWrite: false, map: new THREE.CanvasTexture(pCanvas)
  });
  const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
  scene.add(particleSystem);

  const particlePositionsArray = particleSystem.geometry.attributes.position.array;
  const startPositions = new Float32Array(particlePositionsArray);
  const targetPositions = new Float32Array(particleCount * 3);

  function morphParticles(sceneIdx) {
    const center = sceneIdx * 40;
    for (let i = 0; i < particleCount; i++) {
      let px = 0, py = 0, pz = 0;

      if (sceneIdx === 0) { // DNA Helix
        const angle = (i / particleCount) * Math.PI * 10;
        const strand = i % 2 === 0 ? 1 : -1;
        px = center + Math.sin(angle) * 3.0 * strand;
        py = (i / particleCount) * 11 - 5.5;
        pz = Math.cos(angle) * 3.0 * strand;
      } else if (sceneIdx === 1) { // Cricket Seam
        if (i < particleCount * 0.4) {
          const angle = (i / (particleCount * 0.4)) * Math.PI * 2;
          px = center + 2.5 + Math.sin(angle) * 0.04;
          py = Math.cos(angle) * 1.25;
          pz = 2 + Math.sin(angle) * 1.25;
        } else {
          px = center - 5 + Math.random() * 10;
          py = Math.random() * 5 - 2.5;
          pz = Math.random() * 6 - 3;
        }
      } else if (sceneIdx === 2) { // Football Net
        const row = i % 20;
        const col = Math.floor(i / 20) % 30;
        px = center - 5.5 + col * 0.38;
        py = 1.0 + row * 0.22;
        pz = -3.1 + Math.sin(col * 0.2) * 0.3;
      } else if (sceneIdx === 3) { // Badminton Cone
        const angle = (i / particleCount) * Math.PI * 2;
        const step = i % 15;
        const r = (step / 15) * 2.2;
        px = center + 2.4 + r * Math.cos(angle * 10);
        py = 1.2 + r * Math.sin(angle * 10);
        pz = 1.8 + (step / 15) * 4 - 2;
      } else if (sceneIdx === 4) { // Swimming Waves
        const angle = (i / particleCount) * Math.PI * 2;
        const ring = i % 5;
        const r = 1.2 + ring * 1.4;
        px = center + r * Math.cos(angle * 6);
        py = -0.9 + Math.sin(r * 2.5) * 0.15;
        pz = r * Math.sin(angle * 6);
      } else if (sceneIdx === 5) { // Track Lanes
        const lane = i % 4;
        px = center - 10 + (i / particleCount) * 80;
        py = -1.95;
        pz = (lane - 1.5) * 2.0;
      } else if (sceneIdx === 6) { // Chess Board
        const r = Math.floor(i / 25) % 8;
        const c = i % 8;
        px = center - 3.8 + c * 1.1;
        py = -1.58;
        pz = -3.8 + r * 1.1;
      } else if (sceneIdx === 7) { // Neural Cluster
        const r = Math.random() * 4.5;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);
        px = center + r * Math.sin(phi) * Math.cos(theta);
        py = r * Math.sin(phi) * Math.sin(theta);
        pz = r * Math.cos(phi);
      } else if (sceneIdx === 8) { // Finale Shell
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);
        const r = 6.2 + Math.random() * 1.2;
        px = center + r * Math.sin(phi) * Math.cos(theta);
        py = r * Math.sin(phi) * Math.sin(theta);
        pz = r * Math.cos(phi);
      }

      targetPositions[i * 3] = px;
      targetPositions[i * 3 + 1] = py;
      targetPositions[i * 3 + 2] = pz;
    }

    const morphObj = { progress: 0 };
    for (let i = 0; i < particlePositionsArray.length; i++) {
      startPositions[i] = particlePositionsArray[i];
    }

    gsap.killTweensOf(morphObj);
    gsap.to(morphObj, {
      progress: 1, duration: 1.6, ease: "power2.inOut",
      onUpdate: () => {
        const p = morphObj.progress;
        for (let i = 0; i < particleCount; i++) {
          const delay = Math.max(0, Math.min(1, (p - (i % 8) * 0.04) / 0.68));
          const ease = delay * delay * (3 - 2 * delay);
          particlePositionsArray[i * 3] = startPositions[i * 3] + (targetPositions[i * 3] - startPositions[i * 3]) * ease;
          particlePositionsArray[i * 3 + 1] = startPositions[i * 3 + 1] + (targetPositions[i * 3 + 1] - startPositions[i * 3 + 1]) * ease;
          particlePositionsArray[i * 3 + 2] = startPositions[i * 3 + 2] + (targetPositions[i * 3 + 2] - startPositions[i * 3 + 2]) * ease;
        }
        particleSystem.geometry.attributes.position.needsUpdate = true;
      }
    });
  }

  // CINEMATIC TRANSITION & CHOREOGRAPHY
  let activeIdx = 0;

  function triggerSceneAnimations(idx) {
    if (idx === 1) { // Cricket Bat swing & Ball hit
      const bat = groups[1].getObjectByName("cricket_bat");
      const ball = groups[1].getObjectByName("cricket_ball");
      if (bat && ball) {
        gsap.killTweensOf(bat.rotation);
        gsap.killTweensOf(ball.position);
        bat.rotation.set(0, 0, -0.4);
        ball.position.set(2.5, 0, 2);
        
        gsap.timeline()
          .to(ball.position, { x: -1.5, z: 0.1, duration: 0.7, ease: "sine.inOut" })
          .to(bat.rotation, { z: 0.6, duration: 0.35, ease: "back.in(1.5)" })
          .to(ball.position, { x: -8, z: -10, duration: 0.8, ease: "power2.out", onStart: () => {
            gsap.to(camera.position, { y: "+=0.35", x: "+=0.25", duration: 0.05, yoyo: true, repeat: 5 });
          }})
          .to(bat.rotation, { z: -0.4, duration: 0.6, ease: "power1.inOut" });
      }
    } else if (idx === 2) { // Football strike net
      const ball = groups[2].getObjectByName("football");
      if (ball) {
        gsap.killTweensOf(ball.position);
        ball.position.set(0, -1.3, 3);
        
        gsap.timeline()
          .to(ball.position, { y: 1.5, z: -3.0, duration: 0.7, ease: "power1.in" })
          .to(ball.position, { z: -3.1, duration: 0.1, onStart: () => {
            const goal = groups[2];
            gsap.to(goal.position, { z: "-=0.15", duration: 0.05, yoyo: true, repeat: 3 });
          }})
          .to(ball.position, { y: -1.3, z: -1, duration: 1.0, ease: "bounce.out" });
      }
    } else if (idx === 3) { // Badminton smash
      const racketMesh = groups[3].getObjectByName("racket");
      const shuttleMesh = groups[3].getObjectByName("shuttle");
      if (racketMesh && shuttleMesh) {
        gsap.killTweensOf(racketMesh.rotation);
        gsap.killTweensOf(shuttleMesh.position);
        racketMesh.rotation.set(0.3, 0.5, -0.5);
        shuttleMesh.position.set(2.4, 1.2, 1.8);
        
        gsap.timeline()
          .to(shuttleMesh.position, { x: 0.2, y: 0.6, z: 0.3, duration: 0.65, ease: "sine.inOut" })
          .to(racketMesh.rotation, { z: 0.7, duration: 0.28, ease: "power2.in" })
          .to(shuttleMesh.position, { x: -10, y: -4, z: -5, duration: 0.8, ease: "power2.out" })
          .to(racketMesh.rotation, { z: -0.5, duration: 0.5 });
      }
    } else if (idx === 5) { // Running Track step (Continuous running stride loop)
      const shoeMesh = groups[5].getObjectByName("shoe");
      if (shoeMesh) {
        gsap.killTweensOf(shoeMesh.position);
        gsap.killTweensOf(shoeMesh.rotation);
        shoeMesh.position.set(-3, 1, 1);
        shoeMesh.rotation.set(0, 0, 0.3);
        
        gsap.timeline({ repeat: -1 })
          .to(shoeMesh.position, { x: 0, y: -0.1, duration: 0.45, ease: "power1.in" })
          .to(shoeMesh.rotation, { z: 0.0, duration: 0.15, ease: "sine.out" })
          .to(shoeMesh.position, { x: 4, y: 1.5, duration: 0.65, ease: "power1.out" })
          .to(shoeMesh.rotation, { z: -0.4, duration: 0.3, ease: "power1.in" }, "<")
          .set(shoeMesh.position, { x: -4, y: 1.5 })
          .set(shoeMesh.rotation, { z: 0.3 })
          .to(shoeMesh.position, { x: -3, y: 1.0, duration: 0.2, ease: "sine.out" });
      }
    } else if (idx === 6) { // Chess piece glide
      const kingMesh = groups[6].getObjectByName("chess_king");
      if (kingMesh) {
        gsap.killTweensOf(kingMesh.position);
        kingMesh.position.set(-1.1, -1.4, -1.1);
        gsap.to(kingMesh.position, { x: 1.1, z: 1.1, duration: 1.2, ease: "power2.inOut" });
      }
    }
  }

  function transitionTo3D(idx) {
    activeIdx = idx;
    const targetX = idx * 40;

    morphParticles(idx);

    const isMobile = window.innerWidth < 768;
    const cameraOffsetX = (isMobile || idx === 8) ? 0.0 : -2.0;
    const cameraOffsetY = idx === 4 ? 2.2 : 1.3;
    const cameraOffsetZ = idx === 8 ? 15.0 : 9.5;

    gsap.to(camera.position, {
      x: targetX + cameraOffsetX,
      y: cameraOffsetY,
      z: cameraOffsetZ,
      duration: 1.8,
      ease: "power2.inOut"
    });

    const lookAtObj = { x: cameraLookAt.x, y: cameraLookAt.y, z: cameraLookAt.z };
    gsap.to(lookAtObj, {
      x: targetX, y: 0, z: 0, duration: 1.8, ease: "power2.inOut",
      onUpdate: () => { cameraLookAt.set(lookAtObj.x, lookAtObj.y, lookAtObj.z); }
    });

    triggerSceneAnimations(idx);
  }

  // HOVER INTERACTION (Raycaster + dynamic tooltip HUD)
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  let hoveredObject = null;

  const tooltip = document.createElement('div');
  tooltip.id = 'webgl-tooltip';
  tooltip.style.cssText = `
    position: absolute; pointer-events: none; background: rgba(8,11,16,0.88); border: 1.5px solid #22d3ee;
    border-radius: 6px; padding: 10px 14px; font-family: 'Space Mono', monospace; font-size: 11px;
    color: #edf0f6; z-index: 1000; display: none; box-shadow: 0 0 16px rgba(34,211,238,0.3); white-space: nowrap;
  `;
  document.body.appendChild(tooltip);

  window.addEventListener('mousemove', (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    tooltip.style.left = (e.clientX + 16) + 'px';
    tooltip.style.top = (e.clientY + 16) + 'px';
  });

  const hoverNames = {
    "cricket_bat": "🏏 CRICKET BAT // HAND-CRAFTED WILLOW // MATCH READY",
    "cricket_ball": "🏏 LEATHER BALL // 5.5 OZ COMPOSITE // SEAM CALIBRATED",
    "football": "⚽ FOOTBALL // AI DYNAMICS // PRESSURE LOCKED",
    "racket": "🏸 RACKET // CARBON FRAME // STRINGS COMPRESSED",
    "shuttle": "🏸 SHUTTLECOCK // FEATHER CORK // TRAJECTORY ACTIVE",
    "water": "🏊 WATER SURFACE // REFRACTION SYNC // FLOW LOCKED",
    "shoe": "🏃 RUNNING SHOE // AGILITY OUTSOLE // PACE SYNC",
    "chess_king": "♟️ AI KING // STRATEGY ANALYZER // EVAL +2.8",
    "final_core": "🌐 ATHLETEX CORE // PLAYER CONNECTIONS: 100% // READY"
  };

  function checkRaycast() {
    raycaster.setFromCamera(mouse, camera);
    const activeGroup = groups[activeIdx];
    if (!activeGroup) return;

    const intersects = raycaster.intersectObjects(activeGroup.children, true);
    if (intersects.length > 0) {
      let targetObj = intersects[0].object;
      while (targetObj.parent && targetObj.parent !== activeGroup && !hoverNames[targetObj.name]) {
        targetObj = targetObj.parent;
      }
      if (hoverNames[targetObj.name]) {
        if (hoveredObject !== targetObj) {
          if (hoveredObject) gsap.to(hoveredObject.scale, { x: 1, y: 1, z: 1, duration: 0.3 });
          hoveredObject = targetObj;
          gsap.to(targetObj.scale, { x: 1.14, y: 1.14, z: 1.14, duration: 0.3 });
          tooltip.innerHTML = hoverNames[targetObj.name];
          tooltip.style.display = 'block';
        }
        return;
      }
    }
    if (hoveredObject) {
      gsap.to(hoveredObject.scale, { x: 1, y: 1, z: 1, duration: 0.3 });
      hoveredObject = null;
      tooltip.style.display = 'none';
    }
  }

  // APP BACKGROUND DASHBOARD MODE (Dynamic connecting web)
  let dashboardMode = false;
  function enterDashboardMode() {
    dashboardMode = true;
    tooltip.style.display = 'none';
    groups.forEach(g => { g.visible = false; });

    // Morph particles into a slower orbiting starry cloud
    const morphObj = { progress: 0 };
    for (let i = 0; i < particlePositionsArray.length; i++) {
      startPositions[i] = particlePositionsArray[i];
    }
    for (let i = 0; i < particleCount; i++) {
      targetPositions[i * 3] = (Math.random() - 0.5) * 45;
      targetPositions[i * 3 + 1] = (Math.random() - 0.5) * 30;
      targetPositions[i * 3 + 2] = (Math.random() - 0.5) * 35;
    }
    gsap.killTweensOf(morphObj);
    gsap.to(morphObj, {
      progress: 1, duration: 2.2, ease: "sine.inOut",
      onUpdate: () => {
        const p = morphObj.progress;
        for (let i = 0; i < particleCount * 3; i++) {
          particlePositionsArray[i] = startPositions[i] + (targetPositions[i] - startPositions[i]) * p;
        }
        particleSystem.geometry.attributes.position.needsUpdate = true;
      }
    });

    gsap.to(camera.position, { x: 0, y: 1.5, z: 28, duration: 2.2, ease: "power2.inOut" });
    gsap.to(cameraLookAt, { x: 0, y: 0, z: 0, duration: 2.2, ease: "power2.inOut" });
  }

  // RENDER LOOP
  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const time = clock.getElapsedTime();

    // Subtle cursor parallax
    if (!isMobile) {
      camera.position.x += (activeIdx * 40 + (activeIdx === 8 ? 0 : 0.8) + mouse.x * 1.5 - camera.position.x) * 0.05;
      camera.position.y += ((activeIdx === 4 ? 2.5 : 1.5) + mouse.y * 1.0 - camera.position.y) * 0.05;
    }

    camera.lookAt(cameraLookAt);

    // Rotate active models subtly
    if (!dashboardMode) {
      const activeGroup = groups[activeIdx];
      if (activeGroup) {
        if (activeIdx === 0) {
          athleteCore.rotation.y = time * 0.35;
          athleteInner.rotation.y = -time * 0.45;
          const heroBallMesh = activeGroup.getObjectByName("hero_ball");
          if (heroBallMesh) {
            heroBallMesh.rotation.y = time * 0.25;
            heroBallMesh.position.y = Math.sin(time * 1.5) * 0.15;
          }
        } else if (activeIdx === 1) { // Cricket float
          const bat = activeGroup.getObjectByName("cricket_bat");
          const ball = activeGroup.getObjectByName("cricket_ball");
          if (bat) {
            bat.position.y = 1.0 + Math.sin(time * 1.2) * 0.12;
            bat.rotation.y = Math.sin(time * 0.4) * 0.05;
          }
          if (ball) {
            ball.rotation.y = time * 0.5;
            ball.position.y = Math.sin(time * 1.5) * 0.12;
          }
        } else if (activeIdx === 2) { // Football net animation
          const footballMesh = activeGroup.getObjectByName("football");
          if (footballMesh && footballMesh.position.z < 0) footballMesh.rotation.y = time * 0.8;
        } else if (activeIdx === 3) { // Badminton float
          const racketMesh = activeGroup.getObjectByName("racket");
          const shuttleMesh = activeGroup.getObjectByName("shuttle");
          if (racketMesh) {
            racketMesh.position.y = 0.5 + Math.sin(time * 1.2) * 0.12;
            racketMesh.rotation.y = 0.5 + Math.sin(time * 0.5) * 0.08;
          }
          if (shuttleMesh) {
            shuttleMesh.position.y = 1.2 + Math.sin(time * 1.6) * 0.1;
            shuttleMesh.rotation.z = time * 0.3;
          }
        } else if (activeIdx === 4) { // Water ripples
          const water = activeGroup.getObjectByName("water");
          if (water) water.geometry.attributes.position.array.forEach((_, j) => {
            if (j % 3 === 2) water.geometry.attributes.position.array[j] = Math.sin(time + j * 0.1) * 0.05;
          });
          water.geometry.attributes.position.needsUpdate = true;
        } else if (activeIdx === 6) {
          const king = activeGroup.getObjectByName("chess_king");
          if (king) king.rotation.y = time * 0.25;
        } else if (activeIdx === 8) {
          const core = activeGroup.getObjectByName("final_core");
          if (core) core.rotation.y = time * 0.16;
          for (let i = 0; i < 3; i++) {
            const torus = activeGroup.getObjectByName(`torus_${i}`);
            if (torus) torus.rotation.z = time * (0.2 + i * 0.1);
          }
        }
      }
      checkRaycast();
    } else {
      // Dashboard starry space orbit
      particleSystem.rotation.y = time * 0.04;
      particleSystem.rotation.x = Math.sin(time * 0.02) * 0.05;
    }

    renderer.render(scene, camera);
  }

  animate();

  // Resize handler
  window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  });

  // Export transitions to global window scope
  window.threeTransitionTo = transitionTo3D;
  window.threeEnterDashboard = enterDashboardMode;
})();

/* ---------------- INTRO FLOW CONTROLLER ---------------- */
(function runIntro() {
  const scenes = document.querySelectorAll('.intro-scene');
  const dotsWrap = document.getElementById('intro-dots');
  const wipe = document.getElementById('intro-wipe');
  if (!scenes.length || !dotsWrap) return;

  // Make dots
  dotsWrap.innerHTML = Array.from(scenes).map((_, i) => `<span class="${i === 0 ? 'on' : ''}" data-dot="${i}"></span>`).join('');
  const dots = dotsWrap.querySelectorAll('span');

  const holdMs = [2500, 2400, 2400, 2400, 2400, 2400, 2400, 2400, 3000];
  let idx = 0, timer;

  function show(i) {
    scenes.forEach((s, k) => {
      s.classList.toggle('active', k === i);
      s.classList.toggle('play', k === i);
    });
    dots.forEach((d, k) => d.classList.toggle('on', k === i));

    // Hook Three.js camera & morph transitions
    if (window.threeTransitionTo) window.threeTransitionTo(i);
  }

  function scanWipe() {
    if (!wipe) return;
    wipe.classList.remove('go');
    void wipe.offsetWidth;
    wipe.classList.add('go');
  }

  function nextScene() {
    scanWipe();
    idx++;
    if (idx >= scenes.length) { finishIntro(); return; }
    show(idx);
    timer = setTimeout(nextScene, holdMs[idx] || 2500);
  }

  function finishIntro() {
    clearTimeout(timer);
    if (window.threeEnterDashboard) window.threeEnterDashboard();

    const introEl = document.getElementById('intro');
    const appEl = document.getElementById('app');
    if (introEl) introEl.classList.add('hidden');
    if (appEl) appEl.classList.add('show');

    enterApp();
  }

  // Click handler on dot indicators
  dotsWrap.addEventListener('click', (e) => {
    const d = e.target.closest('[data-dot]');
    if (!d) return;
    clearTimeout(timer);
    scanWipe();
    idx = parseInt(d.dataset.dot);
    show(idx);
    timer = setTimeout(nextScene, holdMs[idx] || 2500);
  });

  document.getElementById('intro-skip').addEventListener('click', finishIntro);

  window.skipIntro = finishIntro;

  if (prefersReduced) {
    finishIntro();
  } else {
    show(0);
    timer = setTimeout(nextScene, holdMs[0]);
  }
})();

window.quickEnterApp = function(pageId) {
  if (window.skipIntro) {
    window.skipIntro();
  }
  enterApp(pageId);
};

/* ---------------- INIT DASHBOARD VIEWS ---------------- */
renderNav();
document.documentElement.style.setProperty('--page-accent', NAV.find(n => n.id === 'home').accent);
renderHome();
renderDiscoverFilters();
renderDiscoverGrid();
renderMatches();
renderScoreBreakdown();
renderSportSelector();
renderAchievements();
renderAvailability();
renderPlan();
renderLbFilters();
renderLbList();
renderConvList();
openConv(0);
renderNotifications();
renderSettings('account');
setTimeout(animateRings, 400);

// Global command search shortcut /
document.addEventListener('keydown', (e) => {
  if (e.key === '/' && document.activeElement !== document.getElementById('global-search')) {
    e.preventDefault();
    document.getElementById('global-search').focus();
    toast('Command Search Focused', '⌕');
  }
});
