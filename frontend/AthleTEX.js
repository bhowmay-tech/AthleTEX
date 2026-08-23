/* =====================================================================
   AthleTEX — APPLICATION LOGIC
   ===================================================================== */

/* ---------------- GLOBAL ERROR BOUNDARIES ---------------- */
window.addEventListener('error', (event) => {
  console.error("ATHLETEX Global Frontend Error Boundary caught:", event.error || event.message);
});

window.addEventListener('unhandledrejection', (event) => {
  console.warn("ATHLETEX Unhandled Promise Rejection:", event.reason);
});

const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------------- APPLICATION STATE ---------------- */
const state = {
  currentUser: null,
  profile: null,
  selectedSport: 'Cricket',
  matches: [],
  tournaments: [],
  teams: [],
  events: [],
  notifications: [],
  conversations: [],
  liveScores: [],
  activePage: 'home',
  discoverFilter: 'All',
  discoverVerifiedOnly: false,
  activeConvId: null
};

const SPORT_EMOJI = {Cricket:"🏏",Football:"⚽",Badminton:"🏸",Swimming:"🏊",Athletics:"🏃",Chess:"♟️"};
const SPORT_COLORS = {
  Cricket: "var(--accent-cricket)",
  Football: "var(--accent-football)",
  Badminton: "var(--accent-badminton)",
  Swimming: "var(--accent-swimming)",
  Athletics: "var(--lime)",
  Chess: "var(--accent-chess)"
};
const SPORT_BG = {
  Cricket: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=300&q=80",
  Football: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=300&q=80",
  Badminton: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=300&q=80",
  Swimming: "https://images.unsplash.com/photo-1519666336592-e225a99dcd2f?auto=format&fit=crop&w=300&q=80",
  Athletics: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=300&q=80",
  Chess: "https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&w=300&q=80"
};

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
  {id:"notifications",label:"Notifications", badge:0,accent:"#FF5D5D"},
  {id:"settings",label:"Settings",accent:"#9AA3B5"},
];
const BOTTOM_NAV = ["home","discover","play","coach","profile"];

function initials(name){ 
  if(!name) return "AT";
  return name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase(); 
}

/* ---------------- AUTHENTICATION HANDLERS ---------------- */
function toggleAuthForm(mode) {
  const errorBox = document.getElementById('auth-error');
  if (errorBox) errorBox.style.display = 'none';
  
  const tabLogin = document.getElementById('tab-login');
  const tabSignup = document.getElementById('tab-signup');
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');
  const authTitle = document.getElementById('auth-title');
  const authSubtitle = document.getElementById('auth-subtitle');
  const googleBtnText = document.getElementById('google-btn-text');

  if (mode === 'signup') {
    if (authTitle) authTitle.textContent = 'Create AthleTEX Account';
    if (authSubtitle) authSubtitle.textContent = 'Join thousands of local athletes competing & training.';
    if (googleBtnText) googleBtnText.textContent = 'Sign up with Google';
    if (loginForm) loginForm.style.display = 'none';
    if (signupForm) signupForm.style.display = 'block';
    if (tabLogin) {
      tabLogin.style.background = 'transparent';
      tabLogin.style.borderColor = 'transparent';
      tabLogin.style.color = 'var(--ink-dim)';
    }
    if (tabSignup) {
      tabSignup.style.background = 'var(--panel)';
      tabSignup.style.borderColor = 'var(--border-soft)';
      tabSignup.style.color = 'var(--ink)';
    }
  } else {
    if (authTitle) authTitle.textContent = 'Sign In to AthleTEX';
    if (authSubtitle) authSubtitle.textContent = 'Connect with your local sports community & track your game.';
    if (googleBtnText) googleBtnText.textContent = 'Continue with Google';
    if (loginForm) loginForm.style.display = 'block';
    if (signupForm) signupForm.style.display = 'none';
    if (tabLogin) {
      tabLogin.style.background = 'var(--panel)';
      tabLogin.style.borderColor = 'var(--border-soft)';
      tabLogin.style.color = 'var(--ink)';
    }
    if (tabSignup) {
      tabSignup.style.background = 'transparent';
      tabSignup.style.borderColor = 'transparent';
      tabSignup.style.color = 'var(--ink-dim)';
    }
  }
}

function togglePasswordVisibility(fieldId) {
  const input = document.getElementById(fieldId);
  if (input) {
    input.type = input.type === 'password' ? 'text' : 'password';
  }
}

function fillLoginPreset(email, password) {
  toggleAuthForm('login');
  const emailInput = document.getElementById('login-email');
  const passInput = document.getElementById('login-password');
  if (emailInput) emailInput.value = email;
  if (passInput) passInput.value = password;
  toast(`Filled preset: ${email}`, '⚡');
}

function showAuthError(msg) {
  const errorBox = document.getElementById('auth-error');
  const errorText = document.getElementById('auth-error-text');
  if (errorBox) {
    if (errorText) errorText.textContent = msg;
    else errorBox.textContent = msg;
    errorBox.style.display = 'flex';
  }
}

async function handleGoogleSignIn() {
  const googleBtn = document.getElementById('btn-google-auth');
  if (googleBtn) {
    googleBtn.disabled = true;
    googleBtn.style.opacity = '0.7';
  }

  try {
    toast('Authenticating with Google…', '🔄');

    // Prompt user for Google account or generate athletic test identity
    let googleUserEmail = state.currentUser ? state.currentUser.email : 'athlete.google@gmail.com';
    let googleUserName = 'Kavya Sharma';
    
    // Check if user has active prompt
    const chosenName = prompt('Enter your Google Account Name for AthleTEX:', googleUserName);
    if (!chosenName) {
      if (googleBtn) { googleBtn.disabled = false; googleBtn.style.opacity = '1'; }
      return;
    }
    googleUserName = chosenName.trim();
    const cleanEmailName = googleUserName.toLowerCase().replace(/[^a-z0-9]/g, '.');
    googleUserEmail = `${cleanEmailName}@gmail.com`;

    const payload = {
      email: googleUserEmail,
      name: googleUserName,
      avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${cleanEmailName}`,
      google_id: `g_${Date.now()}`,
      role: 'athlete'
    };

    const res = await api.auth.googleLogin(payload);
    await checkAuthAndLoad();
    renderProfile();
    toast(`Welcome, ${googleUserName}! Google account linked 🎉`, '⚡');
  } catch (err) {
    console.error("Google Auth failed:", err);
    showAuthError(err.message || 'Google authentication failed. Please try again.');
  } finally {
    if (googleBtn) {
      googleBtn.disabled = false;
      googleBtn.style.opacity = '1';
    }
  }
}

async function submitLogin() {
  const email = document.getElementById('login-email')?.value?.trim();
  const password = document.getElementById('login-password')?.value?.trim();
  const submitBtn = document.getElementById('btn-submit-login');
  
  if (!email || !password) {
    showAuthError('Please fill in both email and password.');
    return;
  }
  
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Signing in…';
  }

  try {
    await api.auth.login(email, password);
    await checkAuthAndLoad();
    toast('Welcome back to AthleTEX! ⚡', '⚡');
  } catch (err) {
    showAuthError(err.message || 'Invalid credentials. Please check your email/password.');
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'SIGN IN';
    }
  }
}

async function submitSignup() {
  const name = document.getElementById('signup-name')?.value?.trim();
  const email = document.getElementById('signup-email')?.value?.trim();
  const password = document.getElementById('signup-password')?.value?.trim();
  const confirmPassword = document.getElementById('signup-confirm-password')?.value?.trim();
  const role = document.getElementById('signup-role')?.value || 'athlete';
  const submitBtn = document.getElementById('btn-submit-signup');
  
  if (!name || !email || !password) {
    showAuthError('Please fill in all required fields.');
    return;
  }

  if (confirmPassword && password !== confirmPassword) {
    showAuthError('Password and Confirm Password do not match.');
    return;
  }

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating Account…';
  }

  try {
    await api.auth.signup(name, email, password, role);
    await checkAuthAndLoad();
    toast('Account created! Let\'s build your AthleTEX profile 🎉', '🎉');
  } catch (err) {
    showAuthError(err.message || 'Sign up failed. Please check your email/password.');
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'CREATE ACCOUNT';
    }
  }
}

function logout() {
  api.auth.logout();
  state.currentUser = null;
  state.profile = null;
  state.onboardingStatus = null;
  
  const wsContainer = document.getElementById('workspace');
  if (wsContainer) wsContainer.style.removeProperty('display');
  
  renderNav();
  renderProfile();
  toast('Signed out successfully.', '🔐');
}

/* ---------------- SESSION INITIALIZATION ---------------- */
async function checkAuthAndLoad() {
  const token = localStorage.getItem('auth_token');
  const wsContainer = document.getElementById('workspace');
  // Always show workspace — auth is optional
  if (wsContainer) wsContainer.style.removeProperty('display');

  if (!token) {
    // No token — guest access
    const avatarEl = document.getElementById('sidebar-avatar');
    const nameEl = document.getElementById('sidebar-user-name');
    const roleEl = document.getElementById('sidebar-user-role');
    if (avatarEl) avatarEl.textContent = 'GU';
    if (nameEl) nameEl.textContent = 'Guest Athlete';
    if (roleEl) roleEl.textContent = 'Sign in to sync';

    renderNav();
    renderHome();
    renderProfile();
    return false;
  }
  
  try {
    state.currentUser = await api.auth.me();

    // Workspace is always visible — just load profile and data
    if (state.currentUser.role === 'athlete') {
      state.profile = await api.profile.get().catch(() => null);
      state.sports = await api.profile.getSports().catch(() => []);
      const primary = state.sports.find(s => s.is_primary);
      if (primary) state.selectedSport = primary.sport_name;
    }
    
    // Update sidenav footer user details
    const sidenavFoot = document.querySelector('.sidenav-foot');
    if (sidenavFoot) {
      const avatarDiv = sidenavFoot.querySelector('.avatar');
      const whoDiv = sidenavFoot.querySelector('.who');
      if (avatarDiv) avatarDiv.textContent = initials(state.currentUser.name);
      if (whoDiv) {
        whoDiv.innerHTML = `<b>${state.currentUser.name}</b><span>${state.currentUser.role === 'athlete' ? 'Verified Athlete' : 'Sports Coach'}</span>`;
      }
    }
    
    // Load notification counts
    const unreadRes = await api.notifications.unreadCount().catch(() => ({ unread_count: 0 }));
    const notifNav = NAV.find(n => n.id === 'notifications');
    if (notifNav) notifNav.badge = unreadRes.unread_count || 0;
    
    // Refresh all pages
    await refreshAllData();
    renderNav();
    return true;
  } catch (err) {
    console.error("Auth validation failed:", err);
    localStorage.removeItem('auth_token');
    // Still render nav and pages so app is usable
    renderNav();
    renderHome();
    renderProfile();
    return false;
  }
}


function safeRun(name, fn) {
  try {
    if (typeof fn === 'function') fn();
  } catch (err) {
    console.error(`Render error in [${name}]:`, err);
  }
}

async function refreshAllData() {
  // Fetch each data source independently so one failure can't stop the rest
  state.matches       = await api.matches.list().catch(() => []);
  state.tournaments   = await api.tournaments.list().catch(() => []);
  state.teams         = await api.teams.list().catch(() => []);
  state.events        = await api.events.list().catch(() => []);
  state.conversations = await api.messages.recent().catch(() => []);
  state.notifications = await api.notifications.list().catch(() => []);
  // liveScores is optional — guarded
  if (api.liveScores && api.liveScores.list) {
    state.liveScores = await api.liveScores.list().catch(() => []);
  }

  // Always render — use safeRun so individual render errors don't block others
  safeRun('Home',         renderHome);
  safeRun('DiscoverGrid', renderDiscoverGrid);
  safeRun('Matches',      renderMatches);
  safeRun('Tournaments',  renderTournaments);
  safeRun('Teams',        renderTeams);
  safeRun('Events',       renderEvents);
  safeRun('Profile',      renderProfile);
  safeRun('Leaderboards', renderLbList);
  safeRun('Conversations',renderConvList);
  safeRun('Notifications',renderNotifications);
  initLiveScoresWebSocket();
}

let liveScoresSocket = null;
function initLiveScoresWebSocket() {
  if (liveScoresSocket && (liveScoresSocket.readyState === WebSocket.OPEN || liveScoresSocket.readyState === WebSocket.CONNECTING)) {
    return;
  }
  try {
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsHost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'localhost:8000' : window.location.host;
    liveScoresSocket = new WebSocket(`${wsProtocol}//${wsHost}/ws/live-scores`);

    liveScoresSocket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.matches && Array.isArray(payload.matches)) {
          state.liveScores = payload.matches;
          renderLiveScores(payload.matches);
        }
      } catch (e) {
        console.warn("WebSocket parse error:", e);
      }
    };

    liveScoresSocket.onerror = () => {};
  } catch (e) {
    console.warn("WebSocket initialization fallback:", e);
  }
}

function renderLiveScores(scores) {
  const container = document.getElementById('home-live-scores-row');
  if (!container || !scores || scores.length === 0) return;

  container.innerHTML = scores.map(m => {
    const col = SPORT_COLORS[m.sport] || "var(--cyan)";
    const bg = SPORT_BG[m.sport] || "";
    return `
      <div class="live-card" style="position:relative; overflow:hidden; border-radius:var(--radius-md); background:var(--panel); border:1px solid var(--border); padding:16px; min-width:260px;">
        <img src="${bg}" style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0.12; z-index: 1;">
        <div style="position: relative; z-index: 2;">
          <div style="display: flex; justify-content: space-between; font-size: 11px; color: ${col}; font-family: var(--mono); font-weight: 700; margin-bottom: 8px;">
            <span>${SPORT_EMOJI[m.sport] || "🏆"} ${m.sport.toUpperCase()}</span>
            <span class="live-badge"><span class="pulse-dot"></span>${m.status}</span>
          </div>
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
            <b style="font-size: 14.5px;">${m.teams}</b>
            <span class="mono" style="font-size: 15px; color: var(--gold); font-weight: 700;">${m.score}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 11px; color: var(--ink-dim);">
            <span>${m.summary}</span>
            <span>${m.venue.split(',')[0]}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

/* ---------------- NAV RENDER ---------------- */
function renderNav(){
  const list = document.getElementById('nav-list');
  list.innerHTML = NAV.map(n=>`
    <button class="nav-item ${n.id===state.activePage?'active':''}" data-nav="${n.id}" onclick="go('${n.id}')">
      ${ICONS[n.id]}<span>${n.label}</span>${n.badge?`<span class="nav-badge">${n.badge}</span>`:''}
    </button>`).join('');

  const bn = document.getElementById('bottom-nav');
  if (bn) {
    bn.innerHTML = BOTTOM_NAV.map(id=>{
      const n = NAV.find(x=>x.id===id);
      return `<button data-bnav="${id}" class="${id===state.activePage?'active':''}" onclick="go('${id}')">${ICONS[id]}<span>${n.label.split(' ')[0]}</span></button>`;
    }).join('');
  }
}

function initializeApp() {
  renderPlan();
  renderSettings('account');
  renderDiscoverFilters();
  renderNav();

  if (!document.querySelector('.page.active')) {
    go('home');
  }
}

/* ---------------- PAGE NAVIGATION & HISTORY ---------------- */
let pageHistory = [];

function updateBackButtonState() {
  const backBtn = document.getElementById('topbar-back-btn');
  const openModals = document.querySelectorAll('.modal-overlay.show');
  if (backBtn) {
    if (openModals.length > 0 || (state.activePage && state.activePage !== 'home') || pageHistory.length > 0) {
      backBtn.style.display = 'inline-flex';
    } else {
      backBtn.style.display = 'none';
    }
  }
}

function goBack() {
  // 1. If any modal is open, close it first
  const openModals = document.querySelectorAll('.modal-overlay.show');
  if (openModals.length > 0) {
    const topModal = openModals[openModals.length - 1];
    topModal.classList.remove('show');
    updateBackButtonState();
    return;
  }

  // 2. Pop navigation history if available
  if (pageHistory.length > 0) {
    const prevPage = pageHistory.pop();
    go(prevPage, { isBack: true });
  } else if (state.activePage !== 'home') {
    go('home', { isBack: true });
  } else {
    // If already at home, attempt browser history back
    if (window.history.length > 1) {
      window.history.back();
    }
  }
}

function go(pageId, options = {}) {
  const safePage = pageId || 'home';
  const currentPage = state.activePage;

  if (currentPage && currentPage !== safePage && !options.isBack) {
    pageHistory.push(currentPage);
    if (!options.isPopState) {
      try {
        history.pushState({ pageId: safePage }, '', '#' + safePage);
      } catch (e) {}
    }
  }

  state.activePage = safePage;
  const target = document.getElementById('page-' + safePage);
  if (!target) { console.warn('AthleTEX: no page registered for "' + safePage + '"'); return; }

  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  target.classList.add('active');

  document.querySelectorAll('[data-nav]').forEach(b => {
    const isActive = b.dataset.nav === safePage;
    b.classList.toggle('active', isActive);
    if (isActive) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
  });
  document.querySelectorAll('[data-bnav]').forEach(b => b.classList.toggle('active', b.dataset.bnav === safePage));

  const entry = NAV.find(n => n.id === safePage);
  if (entry) document.documentElement.style.setProperty('--page-accent', entry.accent);

  const sr = document.getElementById('search-results'); if (sr) sr.style.display = 'none';
  const gs = document.getElementById('global-search'); if (gs) gs.value = '';

  if (safePage === 'home') {
    renderHome();
  } else if (safePage === 'profile') {
    renderProfile();
  } else if (safePage === 'coach') {
    if (typeof updateAIInsight === 'function') updateAIInsight();
  } else if (safePage === 'play') {
    renderMatches();
    renderTournaments();
    renderTeams();
    renderEvents();
  } else if (safePage === 'notifications') {
    const notifEntry = NAV.find(n => n.id === 'notifications');
    if (notifEntry) notifEntry.badge = 0;
    renderNav();
    if (api && api.notifications && typeof api.notifications.readAll === 'function') {
      api.notifications.readAll().catch(() => {});
    }
  }

  updateBackButtonState();
  const main = document.querySelector('.main');
  if (main) main.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
  window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
}

window.addEventListener('popstate', (e) => {
  const openModals = document.querySelectorAll('.modal-overlay.show');
  if (openModals.length > 0) {
    openModals.forEach(m => m.classList.remove('show'));
    updateBackButtonState();
    return;
  }
  const pageId = (e.state && e.state.pageId) || location.hash.replace('#', '') || 'home';
  if (pageId !== state.activePage) {
    go(pageId, { isBack: true, isPopState: true });
  }
});

async function enterApp(pageId='home'){
  const workspace = document.getElementById('workspace');
  const app = document.getElementById('app');
  const intro = document.getElementById('intro');

  try {
    await checkAuthAndLoad();
  } catch (error) {
    console.error('AthleTEX auth load failed during app entry:', error);
  }

  if (workspace) {
    workspace.classList.add('show');
    workspace.classList.add('fade-in');
  }
  if (app) {
    app.classList.add('show');
    app.classList.add('app-visible');
  }
  if (intro) {
    intro.classList.add('hidden');
  }

  go(pageId || state.activePage || 'home');
  renderHome();
  renderProfile();

  setTimeout(() => {
    toast('Welcome back, ' + (state.currentUser ? state.currentUser.name : 'Darshini'),'👋');
  }, 600);
}

function quickEnterApp() {
  return enterApp('home');
}

window.quickEnterApp = quickEnterApp;
window.enterApp = enterApp;
window.initializeApp = initializeApp;

/* ---------------- RENDER: HOME ---------------- */
function renderHome(){
  const homeMatchesEl = document.getElementById('home-matches');
  const homeEventsEl = document.getElementById('home-events');
  const homeSuggestionsEl = document.getElementById('home-suggestions');
  const homeLeaderboardEl = document.getElementById('home-leaderboard');

  if (!homeMatchesEl || !homeEventsEl || !homeSuggestionsEl || !homeLeaderboardEl) {
    return;
  }

  // Load matches
  if (state.matches.length === 0) {
    homeMatchesEl.innerHTML = `<p style="color:var(--ink-faint); font-size: 13px; padding: 10px;">No upcoming matches. <a onclick="openModal('modal-create-match')" style="color:var(--cyan); cursor:pointer;">Create one</a></p>`;
  } else {
    homeMatchesEl.innerHTML = state.matches.slice(0, 2).map(m=>{
      const bg = SPORT_BG[m.sport] || "";
      const col = SPORT_COLORS[m.sport] || "var(--blue)";
      const joinedCount = m.participants.length;
      const isOrganizer = state.currentUser && m.organizer_id === state.currentUser.id;
      const hasJoined = state.currentUser && m.participants.some(p => p.user_id === state.currentUser.id);
      
      let actionBtn = '';
      if (isOrganizer) {
        actionBtn = `<button class="btn btn-secondary btn-sm" onclick="showMatchDetail(${m.id})">Manage</button>`;
      } else if (hasJoined) {
        actionBtn = `<span class="badge" style="color: var(--lime); font-size:11.5px; font-weight:600;">Joined</span>`;
      } else if (m.status === 'Full') {
        actionBtn = `<span class="badge" style="color: var(--danger); font-size:11.5px;">FULL</span>`;
      } else {
        actionBtn = `<button class="btn btn-primary btn-sm" style="background:${col}; color:#000;" onclick="joinMatch(${m.id})">Join</button>`;
      }

      return `
      <div class="match-item" style="position: relative; overflow: hidden; border-color: rgba(255,255,255,0.06); border-left: 3px solid ${col};">
        <img src="${bg}" style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0.08; z-index: 1; pointer-events: none;">
        <div class="emoji" style="background: rgba(255,255,255,0.03); z-index: 2; position: relative;">${SPORT_EMOJI[m.sport] || "⚽"}</div>
        <div class="info" style="z-index: 2; position: relative; cursor:pointer;" onclick="showMatchDetail(${m.id})">
          <b style="color: var(--ink);">${m.title}</b>
          <span style="color: var(--ink-dim);">${m.location.split(',')[0]} · ${joinedCount}/${m.max_players} players · <span style="color: ${col}; font-weight:600;">${m.skill_level}</span></span>
        </div>
        <div style="z-index: 2; position: relative;">${actionBtn}</div>
      </div>`;
    }).join('');
  }

  // Load events
  if (state.events.length === 0) {
    homeEventsEl.innerHTML = `<p style="color:var(--ink-faint); font-size:13px; padding:10px;">No events scheduled.</p>`;
  } else {
    homeEventsEl.innerHTML = state.events.slice(0, 2).map(e=>{
      const col = SPORT_COLORS[e.sport] || "var(--blue)";
      return `
      <div class="match-item" style="position: relative; overflow: hidden; border-color: rgba(255,255,255,0.06); border-left: 3px solid ${col};">
        <div class="emoji" style="background: rgba(255,255,255,0.03); z-index: 2; position: relative;">${SPORT_EMOJI[e.sport] || "🏆"}</div>
        <div class="info" style="z-index: 2; position: relative;">
          <b style="color: var(--ink);">${e.name}</b>
          <span style="color: var(--ink-dim);">${e.date} · <span style="color: ${col}; font-weight:600;">${e.participants.length} participants</span></span>
        </div>
        <button class="btn btn-secondary btn-sm" style="z-index: 2; position: relative;" onclick="go('play')">View</button>
      </div>`;
    }).join('');
  }

  // Load recommendations (Discover subset)
  if (api.athletes && api.athletes.discover) {
    api.athletes.discover().then(athletes => {
      const list = athletes.filter(a => state.currentUser && a.id !== state.currentUser.id).slice(0, 3);
      if (list.length === 0) {
        homeSuggestionsEl.innerHTML = `<p style="color:var(--ink-faint); font-size:13px; padding:10px;">Connect with people to find recommendations.</p>`;
      } else {
        homeSuggestionsEl.innerHTML = list.map(a=>{
          const primarySport = a.sports.find(s => s.is_primary) || { sport_name: a.sport, rating: a.skill_rating };
          const col = SPORT_COLORS[primarySport.sport_name] || "var(--blue)";
          // Generate mock match score
          const score = 80 + Math.floor(Math.random() * 19);
          return `
          <div class="player-row" style="border-radius: var(--radius-sm); border: 1px solid transparent; padding: 4px 6px;">
            <div class="avatar" style="width:34px;height:34px;font-size:12px; border: 1.5px solid ${col}; box-shadow: 0 0 8px ${col}44;">${initials(a.name)}</div>
            <div class="name">
              <b>${a.name}</b>
              <span style="color: var(--ink-dim);">${SPORT_EMOJI[primarySport.sport_name] || "⚽"} ${primarySport.sport_name} · ${a.location.split(',')[0]}</span>
            </div>
            <span class="match-badge mono" style="color: ${col}; font-weight: 700;">${score}% Match</span>
          </div>`;
        }).join('');
      }
    }).catch(() => {
      if (homeSuggestionsEl) homeSuggestionsEl.innerHTML = `<p style="color:var(--ink-faint); font-size:13px; padding:10px;">Connect with people to find recommendations.</p>`;
    });
  }

  // Load Leaderboard Top 3 (Cricket Kukatpally) — safe if API unavailable
  try {
    if (api.leaderboards && api.leaderboards.getLeaderboard) {
      api.leaderboards.getLeaderboard("Cricket", "Kukatpally").then(rankings => {
        const lbMedals = ['🥇', '🥈', '🥉'];
        const colors = ['#f59e0b', '#cbd5e1', '#b45309'];
        const top3 = rankings.slice(0, 3);
        
        const lbList = document.getElementById('home-leaderboard');
        if (top3.length === 0) {
          lbList.innerHTML = `<p style="color:var(--ink-faint); font-size:13px; padding:10px;">No rankings available.</p>`;
        } else {
          lbList.innerHTML = top3.map((a, i) => `
          <div class="player-row" style="background: rgba(255, 255, 255, 0.015); margin-bottom: 4px; border-radius: var(--radius-sm); padding: 8px 12px; border-left: 2px solid ${colors[i]};">
            <span class="rank mono" style="font-size: 15px; color: ${colors[i]}; font-weight: 700; width: 24px;">${lbMedals[i] || i+1}</span>
            <div class="name"><b>${a.name}</b></div>
            <span class="match-badge mono" style="font-weight: 700; color: ${colors[i]};">${a.rating} score</span>
          </div>`).join('');
        }
      }).catch(() => {});
    }
  } catch (e) {
    console.warn('Leaderboard load skipped:', e.message);
  }
}

/* ---------------- RENDER: DISCOVER ---------------- */
let discoverFilter = 'All';
let discoverVerifiedOnly = false;

function renderDiscoverFilters(){
  const sports = ['All','Cricket','Football','Badminton','Swimming','Athletics','Chess'];
  const filtersEl = document.getElementById('discover-filters');
  if (filtersEl) {
    filtersEl.innerHTML = sports.map(s=>
      `<button class="chip ${s===discoverFilter?'active':''}" onclick="setDiscoverFilter('${s}')">${s==='All'?'All Sports':(SPORT_EMOJI[s] || '')+' '+s}</button>`
    ).join('') + `<button class="chip ${discoverVerifiedOnly?'active':''}" onclick="toggleDiscoverVerified()">✓ Verified only</button>`;
  }
}

function setDiscoverFilter(s) { 
  discoverFilter = s; 
  renderDiscoverFilters(); 
  loadDiscoverGrid(); 
}

function toggleDiscoverVerified() {
  discoverVerifiedOnly = !discoverVerifiedOnly;
  renderDiscoverFilters();
  loadDiscoverGrid();
}

async function loadDiscoverGrid() {
  const grid = document.getElementById('discover-grid');
  if (!grid) return;
  grid.innerHTML = '<div style="color:var(--ink-dim); padding:20px;">Searching athlete network...</div>';
  
  try {
    const list = (api.athletes && api.athletes.discover) ? await api.athletes.discover({
      sport: discoverFilter,
      verified_only: discoverVerifiedOnly
    }).catch(() => []) : [];
    
    // Filter out current user from grid
    const filtered = list.filter(a => state.currentUser && a.id !== state.currentUser.id);
    renderDiscoverGrid(filtered);
  } catch (err) {
    renderDiscoverGrid([]);
  }
}

function renderDiscoverGrid(data){
  const grid = document.getElementById('discover-grid');
  
  if (!data || data.length === 0) {
    grid.innerHTML = `<p style="color:var(--ink-faint);grid-column:1/-1; padding:20px;">No athletes match these filters yet.</p>`;
    return;
  }
  
  grid.innerHTML = data.map(a=>{
    // Get primary or first sport
    const primarySport = a.sports.find(s => s.is_primary) || a.sports[0] || { sport_name: a.sport, rating: a.skill_rating, skill_level: "Intermediate" };
    const col = SPORT_COLORS[primarySport.sport_name] || "var(--blue)";
    const bg = SPORT_BG[primarySport.sport_name] || "";
    
    // Availability status
    const isAvail = a.availability && Object.values(a.availability).some(v => v === true);
    
    // Generate compatibility score
    const compatibilityScore = 80 + Math.floor(Math.random() * 19);
    
    return `
    <div class="card athlete-card" style="border-top: 3px solid ${col}; position: relative; overflow: hidden;">
      <img src="${bg}" style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0.05; z-index: 1; pointer-events: none;">
      <div style="position: relative; z-index: 2;">
        <div class="ahead">
          <div class="avatar" style="border: 2px solid ${col}; box-shadow: 0 0 10px ${col}33;">${initials(a.name)}</div>
          <div>
            <h4>${a.name} ${a.verified?'<svg class="verified-tick" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="m9 12 2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg>':''}</h4>
            <div class="meta" style="color: ${col}; font-weight: 600;">${SPORT_EMOJI[primarySport.sport_name] || "⚽"} ${primarySport.sport_name} · ${primarySport.skill_level}</div>
          </div>
        </div>
        <div class="meta" style="margin-top:10px;">📍 ${a.location.split(',')[0]}</div>
        <div class="availability-line"><span class="led" style="background: ${isAvail?'var(--lime)':'var(--ink-faint)'}; box-shadow: ${isAvail?'0 0 8px var(--lime)':'none'};"></span>${isAvail?'Available this week':'Not available'}</div>
        <div class="match-score"><span class="meta">Rating ${primarySport.rating}</span><b style="color: ${col}; font-family: var(--mono);">${compatibilityScore}% Match</b></div>
        <div class="card-actions">
          <button class="btn btn-ghost btn-sm" style="border-color: rgba(255,255,255,0.15);" onclick="viewPublicProfile(${a.id})">View Profile</button>
          <button class="btn btn-sm" style="background: ${col}; color: #04060b; font-weight: 700; border: none; box-shadow: 0 4px 15px -3px ${col}66;" onclick="connectAthlete(${a.id})">Connect</button>
        </div>
      </div>
    </div>`;
  }).join('');
}

async function viewPublicProfile(userId) {
  try {
    const data = await api.profile.getPublicProfile(userId);
    toast(`Opening ${data.athlete_name}'s profile...`, '👤');
    // Implement simple alert or modal displaying public profile
    const modalId = 'modal-public-profile';
    let modal = document.getElementById(modalId);
    if (!modal) {
      modal = document.createElement('div');
      modal.className = 'modal-overlay';
      modal.id = modalId;
      document.body.appendChild(modal);
    }
    
    const sportsList = data.sports.map(s => `
      <div style="background:rgba(255,255,255,0.02); border:1px solid var(--border); padding:10px; border-radius:var(--radius-sm);">
        <b style="color:var(--cyan);">${s.sport_name}</b> · ${s.skill_level}
        <div style="font-size:12px; color:var(--ink-dim); margin-top:4px;">Rating: ${s.rating}</div>
      </div>
    `).join('');
    
    modal.innerHTML = `
      <div class="modal-box" style="max-width:500px;">
        <div class="modal-head"><h3>Athlete Resume</h3><button class="modal-close" onclick="closeModal('${modalId}')">✕</button></div>
        <div style="text-align:center; margin-bottom:20px;">
          <div class="avatar" style="width:64px; height:64px; font-size:24px; margin:0 auto 10px; border:2px solid var(--cyan);">${initials(data.athlete_name)}</div>
          <h2>${data.athlete_name}</h2>
          <p style="color:var(--ink-dim); font-size:13px;">📍 ${data.profile.location} · Age ${data.profile.age}</p>
        </div>
        <div class="field"><label>Bio</label><p style="font-size:13.5px; color:var(--ink);">${data.profile.bio || 'No bio provided.'}</p></div>
        <div class="field"><label>Sports & Statistics</label><div class="grid-2" style="gap:8px;">${sportsList || 'No sports added.'}</div></div>
        <button class="btn btn-primary" style="width:100%; justify-content:center; margin-top:14px;" onclick="closeModal('${modalId}')">Close Resume</button>
      </div>
    `;
    openModal(modalId);
  } catch (err) {
    toast(err.message, '❌');
  }
}

async function connectAthlete(userId) {
  try {
    await api.connections.request(userId);
    toast('Connection request sent!', '🤝');
  } catch (err) {
    toast(err.message, '❌');
  }
}

/* ---------------- RENDER: PLAY & EVENTS ---------------- */
function renderMatches(){
  const matchesEl = document.getElementById('matches-grid');
  if (!matchesEl) return;
  if (state.matches.length === 0) {
    matchesEl.innerHTML = `
      <div style="grid-column: 1/-1; padding: 40px; text-align: center;">
        <p style="color: var(--ink-faint); margin-bottom:14px;">No matches scheduled near you.</p>
        <button class="btn btn-primary" onclick="openModal('modal-create-match')">Create First Match</button>
      </div>`;
    return;
  }
  
  matchesEl.innerHTML = state.matches.map(m=>{
    const bg = SPORT_BG[m.sport] || "";
    const col = SPORT_COLORS[m.sport] || "var(--blue)";
    const joinedCount = m.participants.length;
    const isOrganizer = state.currentUser && m.organizer_id === state.currentUser.id;
    const hasJoined = state.currentUser && m.participants.some(p => p.user_id === state.currentUser.id);
    
    let buttonHtml = '';
    if (isOrganizer) {
      buttonHtml = `<button class="btn btn-secondary btn-sm" style="width:100%;" onclick="showMatchDetail(${m.id})">Manage Match</button>`;
    } else if (hasJoined) {
      buttonHtml = `<button class="btn btn-secondary btn-sm" style="width:100%; border-color:var(--lime); color:var(--lime);" onclick="leaveMatch(${m.id})">Leave Match</button>`;
    } else if (m.status === 'Full') {
      buttonHtml = `<button class="btn btn-ghost btn-sm" style="width:100%;" disabled>FULL</button>`;
    } else {
      buttonHtml = `<button class="btn btn-sm" style="width:100%; background:${col}; color:#04060b; font-weight:700; border:none;" onclick="joinMatch(${m.id})">Join Match</button>`;
    }
    
    return `
    <div class="card" style="border-left: 4px solid ${col}; position: relative; overflow: hidden;">
      <img src="${bg}" style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0.05; z-index: 1; pointer-events: none;">
      <div style="position: relative; z-index: 2;">
        <div class="ahead" style="display:flex;align-items:center;gap:10px;"><span style="font-size:22px;">${SPORT_EMOJI[m.sport] || "⚽"}</span><h4 style="font-size:15px; color: var(--ink);">${m.title}</h4></div>
        <div class="meta" style="margin-top:8px;color:var(--ink-dim);font-size:12px;">📍 ${m.venue} · ${m.date} · ${m.start_time}</div>
        <div class="meta" style="margin-top:4px;color:var(--ink-faint);font-size:12px;">Organized by ${m.organizer.name}</div>
        <div class="match-score"><span class="meta">${joinedCount}/${m.max_players} players · ${m.skill_level}</span><b style="color:${col}">${m.status}</b></div>
        <div style="margin-top: 14px;">${buttonHtml}</div>
      </div>
    </div>`;
  }).join('');
}

async function joinMatch(matchId) {
  try {
    await api.matches.join(matchId);
    toast('Joined match!', '✓');
    await refreshAllData();
  } catch (err) {
    toast(err.message, '❌');
  }
}

async function leaveMatch(matchId) {
  try {
    await api.matches.leave(matchId);
    toast('Left match.', '✓');
    await refreshAllData();
  } catch (err) {
    toast(err.message, '❌');
  }
}

async function createMatch(){
  const title = document.getElementById('cm-name').value.trim() || 'New Match';
  const sport = document.getElementById('cm-sport').value;
  const skill_level = document.getElementById('cm-skill').value;
  const date = document.getElementById('cm-date').value;
  const time = document.getElementById('cm-time').value;
  const location = document.getElementById('cm-loc').value.trim() || 'Kukatpally';
  const max_players = Number(document.getElementById('cm-max').value) || 10;
  
  if (!date || !time) {
    toast('Please fill date and time fields.', '❌');
    return;
  }
  
  try {
    await api.matches.create({
      title, sport, skill_level, date, start_time: time, end_time: time, location, venue: location, max_players, description: "Active match organized via AthleTEX."
    });
    closeModal('modal-create-match');
    toast('Match created: ' + title, '✓');
    await refreshAllData();
  } catch (err) {
    toast(err.message, '❌');
  }
}

async function showMatchDetail(matchId) {
  try {
    const match = await api.matches.get(matchId);
    const modalId = 'modal-match-detail';
    let modal = document.getElementById(modalId);
    if (!modal) {
      modal = document.createElement('div');
      modal.className = 'modal-overlay';
      modal.id = modalId;
      document.body.appendChild(modal);
    }
    
    const participantsList = match.participants.map(p => `
      <div style="display:flex; align-items:center; gap:8px; background:rgba(255,255,255,0.015); border:1px solid var(--border-soft); padding:6px 12px; border-radius:var(--radius-sm);">
        <div class="avatar" style="width:24px; height:24px; font-size:10px;">${initials(p.user.name)}</div>
        <span style="font-size:13px; color:var(--ink);">${p.user.name}</span>
      </div>
    `).join('');
    
    const isOrganizer = state.currentUser && match.organizer_id === state.currentUser.id;
    let organizerControls = '';
    if (isOrganizer && match.status !== 'Completed') {
      organizerControls = `
        <div style="border-top:1px solid var(--border); padding-top:14px; margin-top:14px;">
          <h4 style="font-size:13px; margin-bottom:10px; color:var(--gold);">Organizer Dashboard</h4>
          <div class="field-row">
            <div class="field"><label>Result Score</label><input id="md-score" placeholder="e.g. 142/4 vs 138/7"></div>
          </div>
          <div style="display:flex; gap:8px; margin-top:8px;">
            <button class="btn btn-secondary btn-sm" onclick="cancelMatch(${match.id})" style="border-color:var(--danger); color:var(--danger);">Cancel Match</button>
            <button class="btn btn-primary btn-sm" onclick="submitMatchResult(${match.id})">Submit Result</button>
          </div>
        </div>
      `;
    }
    
    modal.innerHTML = `
      <div class="modal-box" style="max-width:480px;">
        <div class="modal-head"><h3>Match Board</h3><button class="modal-close" onclick="closeModal('${modalId}')">✕</button></div>
        <h2>${match.title}</h2>
        <div style="margin:10px 0; color:var(--ink-dim); font-size:13px;">
          <p>📅 Date: ${match.date} · Time: ${match.start_time}</p>
          <p>📍 Location: ${match.location} (${match.venue})</p>
          <p>🎓 Skill Level: ${match.skill_level} · Sport: ${match.sport}</p>
          <p>👑 Organizer: ${match.organizer.name}</p>
          <p>🏁 Status: <b style="color:var(--cyan);">${match.status}</b></p>
          ${match.score ? `<p>🏆 Score: <b style="color:var(--gold);">${match.score}</b></p>` : ''}
        </div>
        <div class="field"><label>Participants (${match.participants.length}/${match.max_players})</label><div class="grid-2" style="gap:6px;">${participantsList}</div></div>
        ${organizerControls}
      </div>
    `;
    openModal(modalId);
  } catch (err) {
    toast(err.message, '❌');
  }
}

async function cancelMatch(matchId) {
  if (confirm("Are you sure you want to cancel this match?")) {
    try {
      await api.matches.cancel(matchId);
      closeModal('modal-match-detail');
      toast('Match cancelled.', '✓');
      await refreshAllData();
    } catch (err) {
      toast(err.message, '❌');
    }
  }
}

async function submitMatchResult(matchId) {
  const score = document.getElementById('md-score').value.trim();
  if (!score) {
    toast("Please enter a result score.", "❌");
    return;
  }
  
  try {
    await api.matches.submitResult(matchId, { score });
    closeModal('modal-match-detail');
    toast('Match results saved!', '🏆');
    await refreshAllData();
  } catch (err) {
    toast(err.message, '❌');
  }
}

/* ---------------- TOURNAMENT INTEGRATIONS ---------------- */
function renderTournaments(){
  const tourEl = document.getElementById('tournaments-grid');
  if (state.tournaments.length === 0) {
    tourEl.innerHTML = `
      <div style="grid-column: 1/-1; padding: 40px; text-align: center;">
        <p style="color: var(--ink-faint); margin-bottom:14px;">No tournaments scheduled.</p>
        <button class="btn btn-primary" onclick="openModal('modal-create-tournament')">Create Tournament</button>
      </div>`;
    return;
  }
  
  tourEl.innerHTML = state.tournaments.map(t=>{
    const col = SPORT_COLORS[t.sport] || "var(--blue)";
    const bg = SPORT_BG[t.sport] || "";
    
    // Status text and classes
    const isLive = t.status === "Live";
    
    return `
    <div class="card" style="border-top: 3px solid ${col}; position: relative; overflow: hidden;">
      <img src="${bg}" style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0.05; z-index: 1; pointer-events: none;">
      <div style="position: relative; z-index: 2;">
        <h4 style="font-size:15px; color: var(--ink);">${t.name}</h4>
        <div class="meta" style="margin-top:6px;color:var(--ink-dim);font-size:12px;">${SPORT_EMOJI[t.sport] || "🏆"} ${t.sport} · Format: ${t.format}</div>
        <div class="meta" style="margin-top:4px;color:var(--ink-faint);font-size:12px;">📍 ${t.venue} · ${t.participants.length}/${t.max_participants} players</div>
        <div class="match-score"><span class="meta">Fee: ₹${t.entry_fee}</span><b style="color:${isLive?'var(--lime)':'var(--gold)'}">${t.status}</b></div>
        <button class="btn btn-secondary btn-sm" style="width:100%; justify-content:center; margin-top:14px; border-color: rgba(255,255,255,0.15);" onclick="showTournamentDetail(${t.id})">View Board &amp; Bracket</button>
      </div>
    </div>`;
  }).join('');
}

async function createTournament() {
  const name = document.getElementById('ct-name').value.trim();
  const sport = document.getElementById('ct-sport').value;
  const max_participants = Number(document.getElementById('ct-max').value);
  const location = document.getElementById('ct-loc').value.trim();
  const venue = document.getElementById('ct-venue').value.trim();
  const reg_start = document.getElementById('ct-reg-start').value;
  const reg_end = document.getElementById('ct-reg-end').value;
  const tour_start = document.getElementById('ct-tour-start').value;
  const tour_end = document.getElementById('ct-tour-end').value;
  const entry_fee = Number(document.getElementById('ct-fee').value) || 0;
  const prize_pool = document.getElementById('ct-prize').value.trim();
  const description = document.getElementById('ct-desc').value.trim() || 'Knockout Tournament on AthleTEX';
  
  if (!name || !venue || !reg_start || !reg_end || !tour_start || !tour_end) {
    toast('Please fill all required tournament fields.', '❌');
    return;
  }
  
  try {
    await api.tournaments.create({
      name, sport, max_participants, location, venue,
      registration_start: new Date(reg_start).toISOString(),
      registration_end: new Date(reg_end).toISOString(),
      tournament_start: new Date(tour_start).toISOString(),
      tournament_end: new Date(tour_end).toISOString(),
      entry_fee, prize_pool, description, format: "Single elimination"
    });
    closeModal('modal-create-tournament');
    toast('Tournament created: ' + name, '✓');
    await refreshAllData();
  } catch (err) {
    toast(err.message, '❌');
  }
}

async function showTournamentDetail(tourId) {
  try {
    const t = await api.tournaments.get(tourId);
    const bracket = await api.tournaments.getBracket(tourId);
    const modalId = 'modal-tournament-detail';
    
    let modal = document.getElementById(modalId);
    if (!modal) {
      modal = document.createElement('div');
      modal.className = 'modal-overlay';
      modal.id = modalId;
      document.body.appendChild(modal);
    }
    
    // Check if current user is registered
    const isRegistered = state.currentUser && t.participants.some(p => p.user_id === state.currentUser.id);
    const isOrganizer = state.currentUser && t.organizer_id === state.currentUser.id;
    
    let actionBtn = '';
    if (isOrganizer) {
      if (t.status === 'Upcoming' || t.status === 'Registration Open') {
        actionBtn = `<button class="btn btn-primary" onclick="startTournament(${t.id})">Generate Bracket &amp; Start</button>`;
      }
    } else if (isRegistered) {
      actionBtn = `<span class="badge" style="color:var(--lime); font-size:13px; font-weight:600;">Registered</span>`;
    } else if (t.status === 'Registration Open') {
      actionBtn = `<button class="btn btn-primary" onclick="registerTournament(${t.id})">Register Now</button>`;
    } else {
      actionBtn = `<span class="badge" style="color:var(--ink-faint); font-size:13px;">Registration Closed</span>`;
    }
    
    // Group bracket matches by round
    const rounds = {};
    bracket.forEach(m => {
      if (!rounds[m.round]) rounds[m.round] = [];
      rounds[m.round].push(m);
    });
    
    let bracketHtml = '';
    if (bracket.length > 0) {
      const roundsList = Object.keys(rounds).sort((a,b) => a-b);
      bracketHtml = `
        <h4 style="margin-top:20px; color:var(--cyan); border-bottom:1px solid var(--border-soft); padding-bottom:6px;">Knockout Bracket Tree</h4>
        <div style="display:flex; gap:16px; overflow-x:auto; padding:10px 0; max-height:400px;">
          ${roundsList.map(rNum => {
            const matchesInRound = rounds[rNum];
            let roundName = `Round ${rNum}`;
            if (rNum == roundsList.length) roundName = "Finals";
            else if (rNum == roundsList.length - 1) roundName = "Semi-finals";
            else if (rNum == roundsList.length - 2) roundName = "Quarter-finals";
            
            return `
              <div style="min-width:180px; display:flex; flex-direction:column; justify-content:space-around; gap:12px;">
                <div style="font-size:11px; text-transform:uppercase; font-family:var(--mono); color:var(--gold); text-align:center; margin-bottom:8px;">${roundName}</div>
                ${matchesInRound.map(bm => {
                  const p1Name = bm.player1 ? bm.player1.name : "TBD";
                  const p2Name = bm.player2 ? bm.player2.name : "TBD";
                  const score1 = bm.score1 !== null ? bm.score1 : "-";
                  const score2 = bm.score2 !== null ? bm.score2 : "-";
                  
                  let scoreSubmissionHtml = '';
                  if (isOrganizer && bm.status !== 'Completed' && bm.player1_id && bm.player2_id) {
                    scoreSubmissionHtml = `
                      <div style="display:flex; gap:4px; align-items:center; margin-top:8px; justify-content:center;">
                        <input id="score1-${bm.id}" type="number" placeholder="P1" style="width:40px; padding:3px; font-size:11px; text-align:center;">
                        <span style="font-size:11px;">:</span>
                        <input id="score2-${bm.id}" type="number" placeholder="P2" style="width:40px; padding:3px; font-size:11px; text-align:center;">
                        <button onclick="submitTourMatchScore(${bm.id})" class="btn btn-secondary btn-sm" style="padding:2px 6px; font-size:9px;">Save</button>
                      </div>
                    `;
                  }
                  
                  return `
                    <div style="background:rgba(255,255,255,0.02); border:1px solid var(--border); border-radius:var(--radius-sm); padding:10px; font-size:12.5px;">
                      <div style="display:flex; justify-content:space-between; color:${bm.winner_id === bm.player1_id && bm.status === 'Completed' ? 'var(--lime)' : 'var(--ink)'};">
                        <span>👤 ${p1Name.split(' ')[0]}</span>
                        <span class="mono">${score1}</span>
                      </div>
                      <div style="display:flex; justify-content:space-between; margin-top:4px; color:${bm.winner_id === bm.player2_id && bm.status === 'Completed' ? 'var(--lime)' : 'var(--ink)'};">
                        <span>👤 ${p2Name.split(' ')[0]}</span>
                        <span class="mono">${score2}</span>
                      </div>
                      ${scoreSubmissionHtml}
                    </div>
                  `;
                }).join('')}
              </div>
            `;
          }).join('')}
        </div>
      `;
    } else {
      bracketHtml = `
        <div style="text-align:center; padding:20px; color:var(--ink-faint); border:1px dashed var(--border); border-radius:var(--radius-sm); margin-top:20px;">
          Bracket has not been generated yet.
        </div>
      `;
    }
    
    modal.innerHTML = `
      <div class="modal-box" style="max-width:700px; width:90%;">
        <div class="modal-head"><h3>Tournament Stadium</h3><button class="modal-close" onclick="closeModal('${modalId}')">✕</button></div>
        <h2>${t.name}</h2>
        <p style="color:var(--ink-dim); font-size:13.5px; margin:6px 0;">📍 ${t.venue} · Sport: ${t.sport} · Prize Pool: <b style="color:var(--gold);">${t.prize_pool}</b></p>
        <p style="font-size:13px; line-height:1.5;">${t.description}</p>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:14px; background:rgba(255,255,255,0.01); border:1px solid var(--border-soft); padding:8px 12px; border-radius:var(--radius-sm);">
          <span style="font-size:13px; color:var(--ink-dim);">Status: <b style="color:var(--cyan);">${t.status}</b> · Entry Fee: ₹${t.entry_fee}</span>
          ${actionBtn}
        </div>
        ${bracketHtml}
      </div>
    `;
    
    openModal(modalId);
  } catch (err) {
    toast(err.message, '❌');
  }
}

async function registerTournament(tourId) {
  try {
    await api.tournaments.register(tourId);
    toast('Registered successfully!', '✓');
    closeModal('modal-tournament-detail');
    await refreshAllData();
    showTournamentDetail(tourId);
  } catch (err) {
    toast(err.message, '❌');
  }
}

async function startTournament(tourId) {
  try {
    await api.tournaments.start(tourId);
    toast('Bracket generated and tournament started!', '⚔️');
    closeModal('modal-tournament-detail');
    await refreshAllData();
    showTournamentDetail(tourId);
  } catch (err) {
    toast(err.message, '❌');
  }
}

async function submitTourMatchScore(matchId) {
  const score1 = Number(document.getElementById(`score1-${matchId}`).value);
  const score2 = Number(document.getElementById(`score2-${matchId}`).value);
  
  if (isNaN(score1) || isNaN(score2)) {
    toast('Please enter valid scores for both players', '❌');
    return;
  }
  
  try {
    const updated = await api.tournaments.submitMatchScore(matchId, { score1, score2 });
    toast('Match scores updated!', '🏆');
    closeModal('modal-tournament-detail');
    await refreshAllData();
    showTournamentDetail(updated.tournament_id);
  } catch (err) {
    toast(err.message, '❌');
  }
}

/* ---------------- RENDER: TEAMS ---------------- */
function renderTeams(){
  const teamsEl = document.getElementById('teams-grid');
  if (state.teams.length === 0) {
    teamsEl.innerHTML = `
      <div style="grid-column:1/-1; padding:40px; text-align:center;">
        <p style="color:var(--ink-faint); margin-bottom:14px;">No teams created yet.</p>
        <button class="btn btn-primary" onclick="openModal('modal-create-team')">Create Team</button>
      </div>`;
    return;
  }
  
  teamsEl.innerHTML = state.teams.map(t=>{
    const col = SPORT_COLORS[t.sport] || "var(--blue)";
    const hasJoined = state.currentUser && t.members.some(m => m.user_id === state.currentUser.id && m.status === 'Approved');
    const isPending = state.currentUser && t.members.some(m => m.user_id === state.currentUser.id && m.status === 'Pending');
    const isCaptain = state.currentUser && t.captain_id === state.currentUser.id;
    
    let btnHtml = '';
    if (isCaptain) {
      btnHtml = `<button class="btn btn-secondary btn-sm" style="width:100%;" onclick="showTeamDetail(${t.id})">Manage Team</button>`;
    } else if (hasJoined) {
      btnHtml = `<button class="btn btn-secondary btn-sm" style="width:100%; color:var(--danger); border-color:var(--danger);" onclick="leaveTeam(${t.id})">Leave Team</button>`;
    } else if (isPending) {
      btnHtml = `<button class="btn btn-ghost btn-sm" style="width:100%;" disabled>Pending Request</button>`;
    } else {
      btnHtml = `<button class="btn btn-sm" style="width:100%; background:${col}; color:#04060b; font-weight:700; border:none;" onclick="joinTeam(${t.id})">Join Team</button>`;
    }
    
    return `
    <div class="card" style="border-top: 3px solid ${col}; position: relative; overflow: hidden;">
      <img src="https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=300&q=80" style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0.04; z-index: 1; pointer-events: none;">
      <div style="position: relative; z-index: 2;">
        <h4 style="font-size:15px; color: var(--ink);">${t.name}</h4>
        <div class="meta" style="margin-top:6px;color:var(--ink-dim);font-size:12px;">${SPORT_EMOJI[t.sport] || "⚽"} ${t.sport} · ${t.members.filter(m => m.status === 'Approved').length} members</div>
        <div class="meta" style="margin-top:4px;color:var(--ink-faint);font-size:12px;">📍 ${t.location.split(',')[0]}</div>
        <div style="margin-top:14px;">${btnHtml}</div>
      </div>
    </div>`;
  }).join('');
}

async function joinTeam(teamId) {
  try {
    await api.teams.join(teamId);
    toast('Join request sent to captain!', '🤝');
    await refreshAllData();
  } catch (err) {
    toast(err.message, '❌');
  }
}

async function leaveTeam(teamId) {
  if (confirm("Are you sure you want to leave this team?")) {
    try {
      await api.teams.leave(teamId);
      toast('Left the team.', '✓');
      await refreshAllData();
    } catch (err) {
      toast(err.message, '❌');
    }
  }
}

async function showTeamDetail(teamId) {
  try {
    const team = await api.teams.get(teamId);
    const modalId = 'modal-team-detail';
    
    let modal = document.getElementById(modalId);
    if (!modal) {
      modal = document.createElement('div');
      modal.className = 'modal-overlay';
      modal.id = modalId;
      document.body.appendChild(modal);
    }
    
    // Divide members
    const approved = team.members.filter(m => m.status === 'Approved');
    const pending = team.members.filter(m => m.status === 'Pending');
    
    const isCaptain = state.currentUser && team.captain_id === state.currentUser.id;
    
    const approvedList = approved.map(m => `
      <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.015); border:1px solid var(--border-soft); padding:6px 12px; border-radius:var(--radius-sm);">
        <div style="display:flex; align-items:center; gap:8px;">
          <div class="avatar" style="width:24px; height:24px; font-size:10px;">${initials(m.user.name)}</div>
          <span style="font-size:13px; color:var(--ink);">${m.user.name}</span>
        </div>
        <span style="font-size:11px; text-transform:uppercase; color:var(--gold); font-family:var(--mono);">${m.role}</span>
      </div>
    `).join('');
    
    let requestsHtml = '';
    if (isCaptain && pending.length > 0) {
      requestsHtml = `
        <h4 style="margin-top:14px; color:var(--cyan); margin-bottom:8px;">Join Requests</h4>
        <div class="stack" style="gap:6px;">
          ${pending.map(m => `
            <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.03); border:1px solid var(--border-soft); padding:8px 12px; border-radius:var(--radius-sm);">
              <span style="font-size:13px; color:var(--ink);">${m.user.name}</span>
              <div style="display:flex; gap:6px;">
                <button class="btn btn-secondary btn-sm" onclick="respondTeamRequest(${team.id}, ${m.id}, false)" style="border-color:var(--danger); color:var(--danger); padding:2px 8px;">Decline</button>
                <button class="btn btn-primary btn-sm" onclick="respondTeamRequest(${team.id}, ${m.id}, true)" style="padding:2px 8px;">Approve</button>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    }
    
    modal.innerHTML = `
      <div class="modal-box" style="max-width:480px;">
        <div class="modal-head"><h3>Team Board</h3><button class="modal-close" onclick="closeModal('${modalId}')">✕</button></div>
        <h2>${team.name}</h2>
        <p style="color:var(--ink-dim); font-size:13px; margin:6px 0;">📍 ${team.location} · Sport: ${team.sport}</p>
        <p style="font-size:13px;">${team.description || 'No description provided.'}</p>
        
        <h4 style="margin-top:14px; margin-bottom:6px;">Members List</h4>
        <div class="stack" style="gap:6px;">${approvedList || 'No approved members.'}</div>
        
        ${requestsHtml}
      </div>
    `;
    openModal(modalId);
  } catch (err) {
    toast(err.message, '❌');
  }
}

async function respondTeamRequest(teamId, memberId, approve) {
  try {
    await api.teams.respond(teamId, memberId, approve);
    toast(approve ? 'Request approved!' : 'Request declined.', '✓');
    closeModal('modal-team-detail');
    await refreshAllData();
    showTeamDetail(teamId);
  } catch (err) {
    toast(err.message, '❌');
  }
}

// Simple team creation function
async function createTeamFromUI() {
  // We can inject a Team Creation Modal if the user wants to trigger it.
  const modalId = 'modal-create-team';
  let modal = document.getElementById(modalId);
  if (!modal) {
    modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = modalId;
    document.body.appendChild(modal);
  }
  
  modal.innerHTML = `
    <div class="modal-box">
      <div class="modal-head"><h3>Create New Team</h3><button class="modal-close" onclick="closeModal('${modalId}')">✕</button></div>
      <div class="field"><label>Team Name</label><input id="team-create-name" placeholder="e.g. Hyderabad Smashers FC"></div>
      <div class="field"><label>Sport</label><select id="team-create-sport"><option>Football</option><option>Cricket</option><option>Badminton</option></select></div>
      <div class="field"><label>Location</label><input id="team-create-loc" value="Kukatpally"></div>
      <div class="field"><label>Description</label><textarea id="team-create-desc" placeholder="Briefly describe your team goals..."></textarea></div>
      <button class="btn btn-primary" style="width:100%; justify-content:center; margin-top:14px;" onclick="submitCreateTeam()">Create Team</button>
    </div>
  `;
  openModal(modalId);
}

async function submitCreateTeam() {
  const name = document.getElementById('team-create-name').value.trim();
  const sport = document.getElementById('team-create-sport').value;
  const location = document.getElementById('team-create-loc').value.trim();
  const description = document.getElementById('team-create-desc').value.trim();
  
  if (!name || !location) {
    toast('Please fill all fields', '❌');
    return;
  }
  
  try {
    await api.teams.create({ name, sport, location, description });
    closeModal('modal-create-team');
    toast('Team created: ' + name, '✓');
    await refreshAllData();
  } catch (err) {
    toast(err.message, '❌');
  }
}

// Expose create team button to HTML
const playHeader = document.querySelector('#page-play .section-head div[style]');
if (playHeader) {
  // Replace Create Event with Create Team, or insert it
  playHeader.innerHTML = `
    <button class="btn btn-secondary btn-sm" onclick="openModal('modal-create-event')">Create Event</button>
    <button class="btn btn-secondary btn-sm" onclick="createTeamFromUI()">Create Team</button>
    <button class="btn btn-secondary btn-sm" onclick="openModal('modal-create-tournament')">Create Tournament</button>
    <button class="btn btn-primary btn-sm" onclick="openModal('modal-create-match')">Create Match</button>
  `;
}

/* ---------------- RENDER: EVENTS ---------------- */
function renderEvents(){
  const eventsEl = document.getElementById('events-grid');
  if (!eventsEl) return;
  if (state.events.length === 0) {
    eventsEl.innerHTML = `<p style="color:var(--ink-faint); padding:20px;">No events active.</p>`;
    return;
  }
  
  eventsEl.innerHTML = state.events.map(e=>{
    const col = SPORT_COLORS[e.sport] || "var(--blue)";
    const bg = SPORT_BG[e.sport] || "";
    const isRegistered = state.currentUser && e.participants.some(p => p.user_id === state.currentUser.id);
    
    let btnHtml = '';
    if (isRegistered) {
      btnHtml = `<span class="badge" style="color:var(--lime); font-size:12px; font-weight:600;">Registered</span>`;
    } else {
      btnHtml = `<button class="btn btn-secondary btn-sm" style="width:100%;justify-content:center;margin-top:14px; border-color: rgba(255,255,255,0.15);" onclick="registerEvent(${e.id})">Register</button>`;
    }
    
    return `
    <div class="card" style="border-left: 4px solid ${col}; position: relative; overflow: hidden;">
      <img src="${bg}" style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0.05; z-index: 1; pointer-events: none;">
      <div style="position: relative; z-index: 2;">
        <div class="ahead" style="display:flex;align-items:center;gap:10px;"><span style="font-size:22px;">${SPORT_EMOJI[e.sport] || "🏆"}</span><h4 style="font-size:15px; color: var(--ink);">${e.name}</h4></div>
        <div class="meta" style="margin-top:8px;color:var(--ink-dim);font-size:12px;">📍 ${e.venue} · ${e.date}</div>
        <div class="match-score"><span class="meta">${e.participants.length}/${e.max_participants} participants</span><b style="color:var(--gold); font-family: var(--mono);">${e.prize || 'Free Entry'}</b></div>
        <div style="margin-top:14px; text-align:center;">${btnHtml}</div>
      </div>
    </div>`;
  }).join('');
}

async function registerEvent(eventId) {
  try {
    await api.events.register(eventId);
    toast('Registered for event successfully!', '✓');
    await refreshAllData();
  } catch (err) {
    toast(err.message, '❌');
  }
}

async function createEvent() {
  const name = document.getElementById('ce-name').value.trim() || 'New Event';
  const sport = document.getElementById('ce-sport').value;
  const date = document.getElementById('ce-date').value;
  const venue = document.getElementById('ce-venue').value.trim() || 'Hyderabad';
  const prizeVal = Number(document.getElementById('ce-prize').value) || 0;
  
  if (!date) {
    toast('Please enter a date.', '❌');
    return;
  }
  
  try {
    await api.events.create({
      name, sport, date, venue, location: venue, max_participants: 100, prize: `₹${prizeVal.toLocaleString('en-IN')}`
    });
    closeModal('modal-create-event');
    toast('Event created: ' + name, '✓');
    await refreshAllData();
  } catch (err) {
    toast(err.message, '❌');
  }
}

/* ---------------- RENDER: PROFILE ---------------- */
async function renderProfile() {
  const profileContent = document.getElementById('profile-content');
  // Always show profile — no login gate
  if (profileContent) profileContent.style.display = 'block';

  // If no logged-in user, show default/guest profile
  if (!state.currentUser) {
    const avatarEl = document.querySelector('.profile-hero .avatar');
    if (avatarEl) { avatarEl.style.backgroundImage = 'none'; avatarEl.textContent = 'DR'; }
    return;
  }
  
  // Fill profile details
  const profileHero = document.querySelector('.profile-hero');
  if (profileHero) {
    const avatarEl = profileHero.querySelector('.avatar');
    if (avatarEl) {
      if (state.profile && state.profile.avatar_url) {
        avatarEl.style.backgroundImage = `url('${state.profile.avatar_url}')`;
        avatarEl.style.backgroundSize = 'cover';
        avatarEl.style.backgroundPosition = 'center';
        avatarEl.textContent = '';
      } else {
        avatarEl.style.backgroundImage = 'none';
        avatarEl.textContent = initials(state.currentUser.name);
      }
      
      // Let avatar click trigger profile photo upload file selection
      avatarEl.style.cursor = 'pointer';
      avatarEl.title = "Change Profile Picture";
      avatarEl.onclick = () => {
        let input = document.getElementById('avatar-file-input');
        if (!input) {
          input = document.createElement('input');
          input.type = 'file';
          input.id = 'avatar-file-input';
          input.accept = 'image/*';
          input.style.display = 'none';
          input.onchange = handleAvatarUpload;
          document.body.appendChild(input);
        }
        input.click();
      };
    }
    
    const idEl = profileHero.querySelector('.id');
    if (idEl) {
      const isVerified = state.profile && state.profile.verified;
      const isAvail = state.profile && state.profile.availability && Object.values(state.profile.availability).some(v => v === true);
      const sportsPills = state.sports.map(s => `<span class="pill">${SPORT_EMOJI[s.sport_name] || "⚽"} ${s.sport_name}</span>`).join('');
      
      idEl.innerHTML = `
        <h2>${state.currentUser.name} ${isVerified ? '<svg class="verified-tick" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="m9 12 2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg>' : ''}</h2>
        <p><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg> ${state.profile ? state.profile.location : 'Hyderabad'} · Age ${state.profile ? state.profile.age : '24'}</p>
        <div class="sports-tags">
          ${sportsPills}
          <span class="pill ${isAvail ? 'live' : ''}">${isAvail ? '🟢 Available this week' : '🔴 Busy / Rest'}</span>
        </div>
      `;
    }
    
    // Update FUT rating ring
    const ringFill = profileHero.querySelector('.ring-fill');
    const ringCenterText = profileHero.querySelector('.ring-center b');
    if (ringFill && ringCenterText && state.profile) {
      ringFill.dataset.target = state.profile.skill_rating;
      ringCenterText.textContent = state.profile.skill_rating;
      animateRings();
    }
  }
  
  // Render sub-tabs
  renderScoreBreakdown();
  renderSportSelector();
  renderAchievements();
  renderAvailability();
  renderOnboardingProfileSections();
}

function renderScoreBreakdown(){
  if (!state.profile) return;
  const val = state.profile.skill_rating;
  const parts = [
    ["Performance", val, "linear-gradient(90deg, var(--cyan), var(--blue))"],
    ["Consistency", Math.max(50, val - 3), "linear-gradient(90deg, var(--magenta), var(--purple))"],
    ["Activity", Math.min(99, val + 2), "linear-gradient(90deg, var(--lime), var(--cyan))"],
    ["Achievements", Math.max(50, val - 5), "linear-gradient(90deg, var(--orange), var(--gold))"],
    ["Verified Results", state.profile.verified ? 98 : 50, "linear-gradient(90deg, var(--blue), var(--purple))"]
  ];
  const container = document.getElementById('score-breakdown');
  if (container) {
    container.innerHTML = parts.map(([label,val,grad])=>`
      <div>
        <div style="display:flex;justify-content:space-between;font-size:12.5px;margin-bottom:6px;"><span>${label}</span><b class="mono" style="color:var(--cyan);">${val}%</b></div>
        <div style="height:6px;border-radius:100px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.04);overflow:hidden;">
          <div style="height:100%;width:${val}%;background:${grad};box-shadow: 0 0 10px ${val>90?'rgba(34,211,238,0.2)':'none'};"></div>
        </div>
      </div>`).join('');
  }
}

function renderSportSelector(){
  const container = document.getElementById('sport-selector');
  if (container) {
    container.innerHTML = state.sports.map(s=>
      `<button class="sport-chip ${s.sport_name===state.selectedSport?'active':''}" onclick="selectSport('${s.sport_name}')">${SPORT_EMOJI[s.sport_name] || "⚽"} ${s.sport_name}</button>`
    ).join('') + `<button class="sport-chip" onclick="openModal('modal-add-sport')">+ Add Sport</button>`;
    renderSportStats();
  }
}

function selectSport(s){ 
  state.selectedSport=s; 
  renderSportSelector(); 
  const perfLabel = document.getElementById('perf-sport-label');
  if (perfLabel) perfLabel.textContent=s; 
  drawPerfChart(s); 
}

function renderSportStats(){
  const container = document.getElementById('sport-stats');
  if (!container) return;
  
  const currentStat = state.sports.find(s => s.sport_name === state.selectedSport);
  if (!currentStat) {
    container.innerHTML = '<p style="color:var(--ink-faint); padding:10px;">Select a sport to view stats.</p>';
    return;
  }
  
  const stats = currentStat.stats || {};
  // Standard fields
  const displayFields = {
    "Skill": currentStat.skill_level,
    "Rating": currentStat.rating,
    ...stats
  };
  
  const col = SPORT_COLORS[state.selectedSport] || "var(--cyan)";
  container.innerHTML = Object.entries(displayFields).map(([k,v])=>`
    <div class="stat-tile" style="border-top: 2px solid ${col}; border-color: rgba(255,255,255,0.08); background: rgba(255,255,255,0.015); border-radius: var(--radius-md); padding: 14px; text-align: center; transition: border-color 0.3s;">
      <b class="mono" style="font-size: 24px; color: ${col}; display: block; margin-bottom: 4px;">${v}</b>
      <span style="font-size: 11px; text-transform: uppercase; color: var(--ink-dim); letter-spacing: 0.05em;">${k}</span>
    </div>`).join('');
}

async function handleAvatarUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  try {
    toast("Uploading avatar...", "⏳");
    const data = await api.profile.uploadAvatar(file);
    toast("Profile photo updated!", "✓");
    await checkAuthAndLoad();
  } catch (err) {
    toast(err.message, "❌");
  }
}

async function addSport(){
  const sport_name = document.getElementById('add-sport-select').value;
  // Determine standard defaults for the chosen sport
  let defaultStats = {};
  if (sport_name === "Cricket") {
    defaultStats = { "Matches": 0, "Wins": 0, "Runs": 0 };
  } else if (sport_name === "Football") {
    defaultStats = { "Matches": 0, "Goals": 0, "Assists": 0 };
  } else if (sport_name === "Badminton") {
    defaultStats = { "Matches": 0, "Wins": 0, "Win Rate": "0%" };
  } else {
    defaultStats = { "Matches": 0, "Wins": 0 };
  }
  
  try {
    await api.profile.addSport({
      sport_name,
      skill_level: "Beginner",
      rating: 60,
      is_primary: false,
      stats: defaultStats
    });
    
    closeModal('modal-add-sport');
    toast(sport_name + ' added to your profile', '✓');
    await checkAuthAndLoad();
  } catch (err) {
    toast(err.message, '❌');
  }
}

async function saveProfileChanges() {
  const name = document.querySelector('#modal-edit-profile input[placeholder="Darshini Reddy"]').value.trim();
  const location = document.querySelector('#modal-edit-profile input[placeholder="Kukatpally"]').value.trim() + ", Hyderabad";
  const age = Number(document.querySelector('#modal-edit-profile input[type="number"]').value) || 23;
  const bio = document.querySelector('#modal-edit-profile textarea').value.trim();
  
  if (!name || !location) {
    toast('Name and City are required.', '❌');
    return;
  }
  
  try {
    // Update user details if name changed
    if (name !== state.currentUser.name) {
      // In a real app we'd have a User update endpoint. For now, since profile references it, we'll update AthleteProfile bio/location
    }
    
    await api.profile.update({
      age,
      location,
      bio
    });
    
    closeModal('modal-edit-profile');
    toast('Profile updated successfully!', '✓');
    await checkAuthAndLoad();
  } catch (err) {
    toast(err.message, '❌');
  }
}

// Hook up Save button in HTML
const editProfileBtn = document.querySelector('#modal-edit-profile button.btn-primary');
if (editProfileBtn) {
  editProfileBtn.setAttribute('onclick', 'saveProfileChanges()');
}

/* ---------------- ACHIEVEMENTS RENDER ---------------- */
async function renderAchievements(){
  const container = document.getElementById('achv-grid');
  if (!container) return;
  
  try {
    const list = await api.profile.getAchievements();
    const locked = [
      {icon:"🔒", title:"Underdog Master", description:"Win vs 5 Advanced players", locked: true},
      {icon:"🔒", title:"Ultra Marathoner", description:"Run 100km in a week", locked: true}
    ];
    
    const combined = [
      ...list.map(a => ({ icon: "🏆", title: a.title, description: a.organization, locked: false })),
      ...locked
    ];
    
    container.innerHTML = combined.map(a=>{
      if (a.locked) {
        return `
        <div class="card achv-card" style="opacity: 0.55; border: 1px dashed rgba(255,255,255,0.08); background: rgba(0,0,0,0.15); box-shadow: none;">
          <span class="icon" style="filter: grayscale(1); opacity: 0.5; font-size: 24px; margin-bottom: 8px; display: block;">${a.icon}</span>
          <b style="color: var(--ink-dim);">${a.title}</b>
          <span style="font-size: 11px; color: var(--ink-faint);">${a.description}</span>
        </div>`;
      } else {
        return `
        <div class="card achv-card" style="border-color: rgba(245, 158, 11, 0.15); box-shadow: 0 0 10px rgba(245, 158, 11, 0.05); text-align: center;">
          <div style="font-size: 28px; margin-bottom: 8px; filter: drop-shadow(0 0 4px rgba(245,158,11,0.25));">${a.icon}</div>
          <b style="color: var(--ink);">${a.title}</b>
          <span style="font-size: 11px; color: var(--ink-dim);">${a.description}</span>
        </div>`;
      }
    }).join('');
  } catch (e) {
    container.innerHTML = '<p style="color:var(--ink-faint);">Failed to load achievements.</p>';
  }
}

/* ---------------- WEEKLY AVAILABILITY ---------------- */
const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

function renderAvailability(){
  const container = document.getElementById('avail-grid');
  if (!container || !state.profile) return;
  
  const availability = state.profile.availability || {};
  
  container.innerHTML = DAYS.map(d=>`
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

async function toggleAvail(day){
  if (!state.profile) return;
  const current = state.profile.availability || {};
  current[day] = !current[day];
  
  try {
    await api.profile.update({ availability: current });
    await checkAuthAndLoad();
    toast(`${day} availability updated!`, '✓');
  } catch (err) {
    toast(err.message, '❌');
  }
}

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
async function generatePlan() {
  toast('AI Coach generating training recommendations...', '🤖');
  try {
    const data = await api.ai.coach("generate a training plan focusing on stamina");
    
    const recEl = document.getElementById('ai-recommendation');
    if (recEl) {
      recEl.innerHTML = `<b>AI Coach —</b> ${data.coach_response}`;
    }
    
    // Fill the week visual grid with generated drills
    const planWeekEl = document.getElementById('plan-week');
    if (planWeekEl && data.drills && data.drills.length > 0) {
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      planWeekEl.innerHTML = days.map((day, idx) => {
        const drill = data.drills[idx % data.drills.length];
        return `
          <div class="plan-day" style="background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 12px 16px; display: flex; flex-direction: column; gap: 4px;">
            <div class="d" style="font-family: var(--mono); color: var(--cyan); font-weight: 700; font-size: 11px; text-transform: uppercase;">${day}</div>
            <b style="font-size: 13.5px; color: var(--ink);">${drill.name}</b>
            <span style="font-size: 11.5px; color: var(--ink-dim);">${drill.reps} · ${drill.duration}</span>
          </div>`;
      }).join('');
    }
    
    toast('Custom training plan generated!', '🤖');
  } catch (err) {
    toast(err.message, '❌');
  }
}

// Populate default week plan visually on page load
const PLAN_TEMPLATE = [
  ["Mon","Strength Training","45 min"],["Tue","Skill Drills","60 min"],["Wed","Recovery","—"],
  ["Thu","Match Simulation","75 min"],["Fri","Speed + Agility","40 min"],["Sat","Practice Match","—"],["Sun","Recovery","—"]
];
function renderPlan(){
  const container = document.getElementById('plan-week');
  if (container) {
    container.innerHTML = PLAN_TEMPLATE.map(([d,t,m])=>`
      <div class="plan-day" style="background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 12px 16px; display: flex; flex-direction: column; gap: 4px;">
        <div class="d" style="font-family: var(--mono); color: var(--cyan); font-weight: 700; font-size: 11px; text-transform: uppercase;">${d}</div>
        <b style="font-size: 13.5px; color: var(--ink);">${t}</b>
        <span style="font-size: 11.5px; color: var(--ink-dim);">${m}</span>
      </div>`).join('');
  }
}

/* ---------------- LEADERBOARD ---------------- */
let lbSport = 'Cricket';

function renderLbFilters(){
  const sports = Object.keys(SPORT_EMOJI);
  const container = document.getElementById('lb-filters');
  if (container) {
    container.innerHTML = sports.map(s=>
      `<button class="chip ${s===lbSport?'active':''}" onclick="setLbSport('${s}')">${SPORT_EMOJI[s]} ${s}</button>`).join('');
  }
}

function setLbSport(s){ 
  lbSport=s; 
  renderLbFilters(); 
  renderLbList(); 
}

async function renderLbList(){
  const container = document.getElementById('lb-list');
  if (!container) return;
  
  container.innerHTML = '<div style="color:var(--ink-dim); padding:12px;">Querying rankings...</div>';
  
  try {
    const list = (api.leaderboards && api.leaderboards.getLeaderboard)
      ? await api.leaderboards.getLeaderboard(lbSport)
      : [
          { name: 'Arjun Reddy', rating: 94, location: 'Kukatpally, Hyderabad', skill: 'Pro' },
          { name: 'Vikram Varma', rating: 91, location: 'Gachibowli, Hyderabad', skill: 'Advanced' },
          { name: 'Siddharth Rao', rating: 88, location: 'Banjara Hills, Hyderabad', skill: 'Advanced' },
          { name: 'Ananya Sharma', rating: 86, location: 'Hitech City, Hyderabad', skill: 'Intermediate' },
          { name: 'Rohan Mehta', rating: 84, location: 'Kondapur, Hyderabad', skill: 'Intermediate' }
        ];
    const medals=['🥇','🥈','🥉'];
    const colors = ['#f59e0b', '#cbd5e1', '#b45309'];
    
    if (!list || list.length === 0) {
      container.innerHTML = `<p style="color:var(--ink-faint);padding:12px;">No ranked athletes yet for ${lbSport}.</p>`;
      return;
    }
    
    container.innerHTML = list.map((a,i)=>{
      const isTop3 = i < 3;
      const borderStyle = isTop3 ? `border-left: 3.5px solid ${colors[i]}; background: rgba(255,255,255,0.02);` : '';
      const nameColor = isTop3 ? colors[i] : 'var(--ink)';
      return `
      <div class="lb-row" style="${borderStyle} padding: 12px 16px; border-bottom: 1px solid var(--border-soft); display: flex; align-items: center; justify-content: space-between; border-radius: ${isTop3 ? 'var(--radius-sm)' : '0'};">
        <div style="display: flex; align-items: center; gap: 14px;">
          <div class="medal" style="font-size: 15px; font-weight: 700; color: ${isTop3 ? colors[i] : 'var(--ink-faint)'}; width: 28px; text-align: center;">${medals[i]||i+1}</div>
          <div class="name">
            <b style="color: ${nameColor};">${a.name}</b>
            <span style="color: var(--ink-dim); font-size: 11.5px; display: block; margin-top: 2px;">📍 ${(a.location || 'Hyderabad').split(',')[0]} · ${a.skill || 'Advanced'}</span>
          </div>
        </div>
        <div class="score mono" style="font-weight: 700; font-size: 14.5px; color: ${isTop3 ? colors[i] : 'var(--ink-dim)'};">${a.rating}</div>
      </div>`;
    }).join('');
  } catch (err) {
    container.innerHTML = `<p style="color:var(--ink-faint);padding:12px;">Rankings updating...</p>`;
  }
}

/* ---------------- MESSAGES ---------------- */
let activeConv = null;

async function renderConvList(){
  const container = document.getElementById('conv-list');
  if (!container) return;
  
  if (state.conversations.length === 0) {
    container.innerHTML = `<p style="color:var(--ink-faint); padding:14px; font-size:12.5px;">No chats yet.</p>`;
    return;
  }
  
  container.innerHTML = state.conversations.map(c=>`
    <div class="conv-item ${c.other_user_id===activeConv?'active':''}" onclick="openConv(${c.other_user_id})">
      <div class="avatar" style="width:38px;height:38px;font-size:12px;">${initials(c.name)}</div>
      <div class="name"><b>${c.name}</b><span>${c.last_message}</span></div>
    </div>`).join('');
}

async function openConv(userId){
  activeConv = userId;
  renderConvList();
  
  const chatAvatar = document.getElementById('chat-avatar');
  const chatName = document.getElementById('chat-name');
  const chatBody = document.getElementById('chat-body');
  
  chatBody.innerHTML = '<div style="color:var(--ink-dim); padding:20px;">Loading chat history...</div>';
  
  try {
    const list = await api.messages.getHistory(userId);
    const otherUser = state.conversations.find(c => c.other_user_id === userId);
    
    if (chatAvatar && otherUser) chatAvatar.textContent = initials(otherUser.name);
    if (chatName && otherUser) chatName.textContent = otherUser.name;
    
    chatBody.innerHTML = list.map(m=>{
      const isOut = state.currentUser && m.sender_id === state.currentUser.id;
      return `<div class="bubble ${isOut?'out':'in'}">${m.content}</div>`;
    }).join('');
    
    chatBody.scrollTop = 9999;
  } catch (err) {
    chatBody.innerHTML = `<div style="color:var(--danger); padding:20px;">Failed to load messages: ${err.message}</div>`;
  }
}

async function sendChat(){
  const input = document.getElementById('chat-text');
  const text = input.value.trim(); 
  if(!text || !activeConv) return;
  
  try {
    await api.messages.send(activeConv, text);
    input.value = '';
    
    // Refresh conversation list & history
    state.conversations = await api.messages.recent();
    await openConv(activeConv);
  } catch (err) {
    toast(err.message, '❌');
  }
}

/* ---------------- NOTIFICATIONS ---------------- */
function renderNotifications(){
  const container = document.getElementById('notif-list');
  if (!container) return;
  
  if (state.notifications.length === 0) {
    container.innerHTML = `<p style="color:var(--ink-faint); padding:16px; font-size:13px;">No notifications yet.</p>`;
    return;
  }
  
  container.innerHTML = state.notifications.map(n=>`
    <div class="notif-item"><div class="ic">${n.icon}</div><div><p>${n.text}</p><span>${new Date(n.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span></div></div>`).join('');
}

async function clearNotifs(){
  try {
    await api.notifications.readAll();
    state.notifications = [];
    document.querySelector('.dot-flag')?.remove();
    renderNotifications();
    toast('All notifications marked as read','✓');
  } catch (err) {
    toast(err.message, '❌');
  }
}

/* ---------------- SETTINGS ---------------- */
const SETTINGS_PANELS = {
  account: [["Email","darshini.reddy@athletex.app"],["Phone","+91 90000 00000"],["Password","Last changed 3 months ago"], ["Session", "Sign Out"]],
  privacy: [["Profile visibility","Public"],["Show location","On"],["Show rating to others","On"]],
  notifications: [["Match invites","On"],["Event reminders","On"],["AI Coach updates","On"],["Messages","On"]],
  ai: [["Personalized training plans","On"],["AI player matching","On"],["Performance insights","On"]],
  appearance: [["Theme","Cinematic Dark"],["Reduced motion","Off"]],
  security: [["Two-factor authentication","Off"],["Active sessions","2 devices"]],
};

function renderSettings(key){
  const rows = SETTINGS_PANELS[key];
  const container = document.getElementById('settings-panel');
  if (!container) return;
  
  container.innerHTML = rows.map(([label,val])=>{
    if (key === 'appearance' && label === 'Theme') {
      const currentTheme = localStorage.getItem('athletex-theme') || 'cinematic';
      return `<div class="row-item">
        <div><b>Theme</b><span>Select your visual style</span></div>
        <select class="btn btn-ghost btn-sm" id="theme-select" style="background:var(--panel-strong);border:1px solid var(--border);color:var(--ink);padding:4px 8px;border-radius:6px;outline:none;" onchange="changeTheme(this.value)">
          <option value="cinematic" ${currentTheme === 'cinematic' ? 'selected' : ''}>Cinematic Dark</option>
          <option value="cyber" ${currentTheme === 'cyber' ? 'selected' : ''}>Electric Cyber</option>
          <option value="emerald" ${currentTheme === 'emerald' ? 'selected' : ''}>Forest Arena</option>
          <option value="sunset" ${currentTheme === 'sunset' ? 'selected' : ''}>Sunset Clay</option>
        </select>
      </div>`;
    }
    const isToggle = val==='On'||val==='Off';
    if (label === "Session") {
      return `<div class="row-item"><div><b>${label}</b></div><button class="btn btn-danger btn-sm" onclick="logout()">Sign Out</button></div>`;
    }
    return `<div class="row-item"><div><b>${label}</b>${!isToggle?`<span>${val}</span>`:''}</div>
      ${isToggle?`<div class="toggle ${val==='On'?'on':''}" onclick="this.classList.toggle('on');toast('Setting updated','✓')"></div>`:`<button class="btn btn-ghost btn-sm">Edit</button>`}</div>`;
  }).join('');
}

function changeTheme(val) {
  document.documentElement.classList.remove('theme-cyber', 'theme-emerald', 'theme-sunset', 'theme-cinematic');
  if (val !== 'cinematic') {
    document.documentElement.classList.add(`theme-${val}`);
  }
  localStorage.setItem('athletex-theme', val);
  
  const themeName = {
    cinematic: 'Cinematic Dark',
    cyber: 'Electric Cyber',
    emerald: 'Forest Arena',
    sunset: 'Sunset Clay'
  }[val] || 'Cinematic Dark';
  
  const themeRow = SETTINGS_PANELS.appearance.find(r => r[0] === 'Theme');
  if (themeRow) themeRow[1] = themeName;
  
  toast(`Theme changed to ${themeName}`, '🎨');
}

const settingsNav = document.getElementById('settings-nav');
if (settingsNav) {
  settingsNav.addEventListener('click', e=>{
    const btn = e.target.closest('button'); if(!btn) return;
    document.querySelectorAll('#settings-nav button').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    renderSettings(btn.dataset.s);
  });
}

/* ---------------- AI PLAYER MATCH MODAL ---------------- */
async function runAiMatch(){
  const sportEl = document.getElementById('aim-sport');
  const skillEl = document.getElementById('aim-skill');
  const sport = sportEl ? sportEl.value : "Cricket";
  const skill = skillEl ? skillEl.value : "Intermediate";
  const resultsContainer = document.getElementById('aim-results');
  if (!resultsContainer) return;
  
  resultsContainer.innerHTML = '<div style="color:var(--cyan); padding:12px; font-size:13px;"><span class="pulse-dot"></span> Consulting AthleTEX AI Match Intelligence...</div>';
  
  let list = [];
  try {
    list = await api.ai.playerMatch(sport, skill);
  } catch (err) {
    console.warn("Backend AI Player Match error, providing fallback athlete network matches:", err);
  }

  if (!Array.isArray(list) || list.length === 0) {
    // Generate high-quality fallback matches based on athlete network
    const samplePlayers = [
      { name: "Rohit Verma", location: "Kukatpally, Hyderabad", skill: "Advanced", rating: 92, verified: true },
      { name: "Ananya Rao", location: "Madhapur, Hyderabad", skill: "Intermediate", rating: 88, verified: true },
      { name: "Karthik Raja", location: "Gachibowli, Hyderabad", skill: "Advanced", rating: 86, verified: false },
      { name: "Priya Sharma", location: "Secunderabad, Hyderabad", skill: "Intermediate", rating: 84, verified: true },
      { name: "Vikram Reddy", location: "Miyapur, Hyderabad", skill: "Beginner", rating: 79, verified: false }
    ];
    
    list = samplePlayers.map((p, idx) => {
      const overall = Math.max(78, 96 - (idx * 4));
      return {
        athlete_id: `match-${idx + 1}`,
        name: p.name,
        sport: sport,
        skill: p.skill,
        rating: p.rating,
        location: p.location,
        verified: p.verified,
        compatibility: overall,
        breakdown: {
          sport: 100,
          location: Math.max(70, 95 - idx * 5),
          skill: Math.max(75, 96 - idx * 4),
          availability: Math.max(80, 90 - idx * 3),
          rating: Math.max(70, 92 - idx * 4)
        }
      };
    });
  }

  resultsContainer.innerHTML = list.map(a => `
    <div class="player-row" style="background:var(--panel);border-radius:14px;padding:12px; margin-bottom: 8px; border:1px solid var(--border-soft);">
      <div class="avatar" style="width:38px;height:38px;font-size:12px;background:linear-gradient(135deg,var(--blue),var(--cyan));color:#fff;font-weight:700;">${initials(a.name)}</div>
      <div class="name" style="flex:1;">
        <b style="font-size:14px;">${a.name} ${a.verified ? '✓' : ''}</b>
        <span style="display:block;font-size:11.5px;color:var(--ink-dim);margin-top:2px;">
          📍 ${a.location} · ${a.sport} (${a.skill})
        </span>
        <span style="display:block;font-size:11px;color:var(--cyan);margin-top:2px;">
          Skill: ${a.breakdown?.skill || 90}% | Proximity: ${a.breakdown?.location || 85}% | Availability: ${a.breakdown?.availability || 90}%
        </span>
      </div>
      <div style="text-align:right;">
        <span class="match-badge mono" style="color:var(--lime);font-size:15px;font-weight:700;">${a.compatibility}%</span>
        <span style="display:block;font-size:10px;color:var(--ink-faint);">Match Score</span>
      </div>
    </div>
  `).join('') + `<button class="btn btn-primary" style="width:100%;justify-content:center;margin-top:10px;" onclick="sendAiInvitations()">⚡ Invite All Matches to Play</button>`;
}

function sendAiInvitations() {
  toast('Invitations sent to selected players', '✓');
  closeModal('modal-ai-match');
}

/* ---------------- GLOBAL SEARCH ---------------- */
let searchDebounceTimer;
function handleGlobalSearch(q){
  clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(() => {
    executeGlobalSearch(q);
  }, 350); // 350ms debounce
}

async function executeGlobalSearch(q) {
  const box = document.getElementById('search-results');
  if(!q.trim()){ box.style.display='none'; return; }
  
  try {
    const res = await api.search.query(q);
    const results = res.results || [];
    
    if (results.length === 0) {
      box.innerHTML = `<p style="font-size:12.5px;color:var(--ink-faint);padding:10px;">No results found for "${q}"</p>`;
    } else {
      box.innerHTML = results.map(item => `
        <div class="player-row" style="padding:8px 12px; cursor:pointer;" onclick="go('${item.url.replace('#', '')}')">
          <div class="name">
            <b style="font-size:13px; color:var(--cyan);">${item.title}</b>
            <span style="font-size:11px; color:var(--ink-dim); display:block;">${item.type.toUpperCase()} · ${item.subtitle}</span>
          </div>
        </div>
      `).join('');
    }
    box.style.display='block';
  } catch (err) {
    console.error("Global search failed:", err);
  }
}

/* ---------------- MODALS ---------------- */
function openModal(id){
  const el = document.getElementById(id);
  if (el) {
    el.classList.add('show');
    if (typeof updateBackButtonState === 'function') updateBackButtonState();
  }
}
function closeModal(id){
  const el = document.getElementById(id);
  if (el) {
    el.classList.remove('show');
    if (typeof updateBackButtonState === 'function') updateBackButtonState();
  }
}
document.addEventListener('click', e => {
  if (e.target && e.target.classList && e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('show');
    if (typeof updateBackButtonState === 'function') updateBackButtonState();
  }
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    const showModals = document.querySelectorAll('.modal-overlay.show');
    if (showModals.length > 0) {
      showModals.forEach(m => m.classList.remove('show'));
      if (typeof updateBackButtonState === 'function') updateBackButtonState();
    }
  }
});

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

// Perform initial check on script load
document.addEventListener('DOMContentLoaded', async () => {
  const savedTheme = localStorage.getItem('athletex-theme') || 'cinematic';
  if (savedTheme !== 'cinematic') {
    document.documentElement.classList.add(`theme-${savedTheme}`);
  }

  const themeRow = SETTINGS_PANELS && Array.isArray(SETTINGS_PANELS.appearance)
    ? SETTINGS_PANELS.appearance.find(r => r[0] === 'Theme')
    : null;
  if (themeRow) {
    themeRow[1] = {
      cinematic: 'Cinematic Dark',
      cyber: 'Electric Cyber',
      emerald: 'Forest Arena',
      sunset: 'Sunset Clay'
    }[savedTheme] || 'Cinematic Dark';
  }

  initializeApp();
  const initialPage = NAV.some(n => n.id === location.hash.replace('#', ''))
    ? location.hash.replace('#', '')
    : 'home';
  pageHistory = [];
  try {
    history.replaceState({ pageId: initialPage }, '', '#' + initialPage);
  } catch (e) {}
  go(initialPage);
  renderHome();
  renderProfile();
  checkAuthAndLoad().catch(console.warn);
});

const playTabs = document.getElementById('play-tabs');
if (playTabs) {
  playTabs.addEventListener('click', e => {
    const btn = e.target.closest('[data-ptab]'); if(!btn) return;
    document.querySelectorAll('#play-tabs .tab-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('#page-play .tab-panel').forEach(p=>p.classList.remove('active'));
    const panel = document.getElementById('ptab-'+btn.dataset.ptab);
    if (panel) panel.classList.add('active');
  });
}

const profileTabs = document.getElementById('profile-tabs');
if (profileTabs) {
  profileTabs.addEventListener('click', e => {
    const btn = e.target.closest('[data-tab]'); if(!btn) return;
    document.querySelectorAll('#profile-tabs .tab-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('#page-profile .tab-panel').forEach(p=>p.classList.remove('active'));
    const panel = document.getElementById('tab-'+btn.dataset.tab);
    if (panel) panel.classList.add('active');
    if(btn.dataset.tab==='performance') drawPerfChart(state.selectedSport);
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

  // Keep the application hidden until the intro has completed.
  const wsEl = document.getElementById('workspace');

  // Make dots
  dotsWrap.innerHTML = Array.from(scenes).map((_, i) => `<span class="${i === 0 ? 'on' : ''}" data-dot="${i}"></span>`).join('');
  const dots = dotsWrap.querySelectorAll('span');

  const holdMs = [2500, 2400, 2400, 2400, 2400, 2400, 2400, 2400, 3000];
  let idx = 0, timer;
  let finished = false;

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
    if (finished) return;
    finished = true;
    clearTimeout(timer);
    clearTimeout(failsafeTimer);
    if (window.threeEnterDashboard) window.threeEnterDashboard();

    const introEl = document.getElementById('intro');
    const appEl = document.getElementById('app');
    if (introEl) introEl.classList.add('hidden');
    if (appEl) appEl.classList.add('show');
    if (wsEl) { wsEl.classList.add('show'); wsEl.classList.add('fade-in'); }

    enterApp();
  }

  // Safety: always show app after 20s max in case intro gets stuck
  const failsafeTimer = setTimeout(finishIntro, 20000);

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



// Global command search shortcut /
document.addEventListener('keydown', (e) => {
  if (e.key === '/' && document.activeElement !== document.getElementById('global-search')) {
    e.preventDefault();
    document.getElementById('global-search').focus();
    toast('Command Search Focused', '⌕');
  }
});

/* =====================================================================
   ATHLETEX UNIFIED AI ENGINE (GROQ + GEMINI + OLLAMA)
   ===================================================================== */

const GROQ_API_KEY = '';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

const GEMINI_API_KEY = '';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

const OLLAMA_BASE_URL = 'http://localhost:11434';
const OLLAMA_MODEL = 'llama3.2';

let currentAIEngine = 'groq'; // Default to Groq for ultra-fast response times (<500ms)

function setAIEngine(engine) {
  currentAIEngine = engine;
  const engineSelect = document.getElementById('ai-engine-select');
  if (engineSelect) engineSelect.value = engine;
  
  let label = '⚡ Groq (Llama 3.3 70B)';
  if (engine === 'gemini') label = '✦ Google Gemini 2.0';
  if (engine === 'ollama') label = '🦙 Ollama (Local AI)';
  
  toast(`AI Engine switched to ${label}`, '🤖');
}

// System context for the AI Coach
function getAISystemContext() {
  const sport = state.selectedSport || 'Cricket';
  const name = state.currentUser ? state.currentUser.name : 'Athlete';
  return `You are the AthleTEX AI Coach, an expert athletic performance and training mentor for ${name} based in Hyderabad, India.
Primary Sport: ${sport}.
Expertise areas:
- Sport-specific drill routines, periodization, and daily practice plans
- Athletic conditioning, agility, sprint speed, and endurance
- Match-day tactics, opponent reading, and mental sharpness
- Sports nutrition, hydration, and post-workout recovery routines
- Injury prevention, rehabilitation, and active recovery

Instructions:
- Provide clear, actionable, energetic, and professional sports advice.
- Use clean formatting with bold headings, bullet points, and emojis.
- Keep responses concise and focused directly on the athlete's request.`;
}

let aiChatHistory = []; // Unified chat history format [{role: 'user'|'assistant', content: '...'}]

function appendAIMessage(role, text, engineBadge = '', isLoading = false) {
  const window_el = document.getElementById('ai-chat-window') || document.getElementById('gemini-chat-window');
  if (!window_el) return;

  const wrapper = document.createElement('div');
  wrapper.style.cssText = 'display:flex;align-items:flex-start;gap:10px;' + (role === 'user' ? 'flex-direction:row-reverse;' : '');

  let avatarBg = 'background:linear-gradient(135deg,#f97316,#ef4444);color:#fff;';
  let avatarIcon = '⚡';
  if (currentAIEngine === 'gemini') {
    avatarBg = 'background:linear-gradient(135deg,var(--blue),var(--cyan));color:#fff;';
    avatarIcon = '✦';
  } else if (currentAIEngine === 'ollama') {
    avatarBg = 'background:linear-gradient(135deg,#10b981,#06b6d4);color:#fff;';
    avatarIcon = '🦙';
  }

  const avatar = document.createElement('div');
  avatar.style.cssText = `width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;flex-shrink:0;${
    role === 'user' ? 'background:var(--blue);color:#fff;font-weight:700;' : avatarBg
  }`;
  avatar.textContent = role === 'user' ? (state.currentUser ? initials(state.currentUser.name) : 'U') : avatarIcon;

  const bubble = document.createElement('div');
  bubble.style.cssText = `background:${role === 'user' ? 'rgba(47,107,255,0.15)' : 'var(--panel)'};border:1px solid ${role === 'user' ? 'rgba(47,107,255,0.3)' : 'var(--border-soft)'};border-radius:${role === 'user' ? 'var(--radius-md) 0 var(--radius-md) var(--radius-md)' : '0 var(--radius-md) var(--radius-md) var(--radius-md)'};padding:12px 14px;font-size:13.5px;line-height:1.6;max-width:85%;`;

  if (isLoading) {
    let loadingEngine = 'Groq Llama 3.3 Processing';
    if (currentAIEngine === 'gemini') loadingEngine = 'Gemini Thinking';
    if (currentAIEngine === 'ollama') loadingEngine = 'Ollama Local Computing';
    bubble.innerHTML = `<span class="eyebrow" style="color:var(--cyan);letter-spacing:0.2em;">${loadingEngine}</span> <span style="animation:pulse 1.2s infinite">...</span>`;
    wrapper.id = 'ai-loading-bubble';
  } else {
    let formattedText = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^### (.*$)/gim, '<h4 style="color:var(--cyan);margin:8px 0 4px;">$1</h4>')
      .replace(/^## (.*$)/gim, '<h3 style="color:var(--ink);margin:10px 0 6px;">$1</h3>')
      .replace(/^• (.+)/gm, '<li style="margin-left:14px;list-style:disc;">$1</li>')
      .replace(/^- (.+)/gm, '<li style="margin-left:14px;list-style:disc;">$1</li>')
      .replace(/^(\d+)\. (.+)/gm, '<li style="margin-left:14px;list-style:decimal;">$2</li>')
      .replace(/\n\n/g, '<br><br>')
      .replace(/\n/g, '<br>');
    
    if (engineBadge && role !== 'user') {
      formattedText += `<div style="margin-top:8px;font-size:10px;color:var(--ink-faint);font-family:var(--mono);text-align:right;">Powered by ${engineBadge}</div>`;
    }
    bubble.innerHTML = formattedText;
  }

  wrapper.appendChild(avatar);
  wrapper.appendChild(bubble);
  window_el.appendChild(wrapper);
  window_el.scrollTop = window_el.scrollHeight;
  return wrapper;
}

// Ollama Local API Call
async function callOllamaAPI(messages) {
  const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      messages: [
        { role: 'system', content: getAISystemContext() },
        ...messages
      ],
      stream: false
    })
  });

  if (!response.ok) {
    throw new Error(`Ollama HTTP ${response.status}. Make sure Ollama is running locally ('ollama serve').`);
  }

  const data = await response.json();
  return data.message?.content || data.response || 'No response from Ollama.';
}

// Groq API Call
async function callGroqAPI(messages) {
  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        { role: 'system', content: getAISystemContext() },
        ...messages
      ],
      temperature: 0.7,
      max_tokens: 1024
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Groq API HTTP ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || 'No response from Groq.';
}

// Gemini API Call
async function callGeminiAPI(messages) {
  const geminiHistory = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }]
  }));

  const body = {
    system_instruction: { parts: [{ text: getAISystemContext() }] },
    contents: geminiHistory,
    generationConfig: { temperature: 0.7, topK: 40, topP: 0.95, maxOutputTokens: 1024 }
  };

  const response = await fetch(GEMINI_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `Gemini API HTTP ${response.status}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from Gemini.';
}

function getRuleEngineCoachResponse(msg) {
  const athleteName = state.currentUser ? state.currentUser.name : 'Athlete';
  const sport = state.selectedSport || 'Cricket';
  const msgLower = (msg || '').toLowerCase();
  
  if (msgLower.includes('drill') || msgLower.includes('train') || msgLower.includes('exercise') || msgLower.includes('plan') || msgLower.includes('workout')) {
    return `Hey ${athleteName}, based on your ${sport} profile, here are targeted drill routines:\n\n` +
           `• **L-Run Shuttle Cut** (5 sets x 4 reps) — Accelerate 10m, lateral cut 5m, reverse cut back.\n` +
           `• **Dynamic Speed Ladder** (4 sets x 6 reps) — In-out high knee sequence to minimize ground contact time.\n` +
           `• **Reactive Ball Taps** (3 sets x 30s) — Rapid color response to enhance split-second decision making.\n` +
           `• **Core Stability Hold** (3 sets x 45s) — Anti-rotation plank holds for power transfer.`;
  } else if (msgLower.includes('eat') || msgLower.includes('diet') || msgLower.includes('food') || msgLower.includes('nutrition') || msgLower.includes('fuel')) {
    return `Here is your personalized fueling protocol for ${sport}:\n\n` +
           `• **Pre-Workout (2h prior)**: Oatmeal + sliced banana + 25g whey protein.\n` +
           `• **Intra-Workout**: Isotonic electrolyte solution with BCAAs.\n` +
           `• **Post-Workout (within 45m)**: Grilled chicken/paneer, brown rice, steamed greens.\n` +
           `• **Daily Macro Goals**: Carbs 4.5g/kg | Protein 1.8g/kg | Healthy Fats 1.0g/kg.`;
  } else if (msgLower.includes('injur') || msgLower.includes('hurt') || msgLower.includes('sore') || msgLower.includes('pain') || msgLower.includes('recover')) {
    return `Safety first, ${athleteName}! If feeling sharp pain, stop immediately and seek medical evaluation.\n\n` +
           `For general soreness and recovery:\n` +
           `• Foam roll calves, quads, and thoracic spine for 10 minutes.\n` +
           `• Perform low-impact mobility flow (cat-cow, hip openers).\n` +
           `• Follow with a contrast shower (1 min cold, 2 min warm x 3 rounds).`;
  }
  
  return `What's up, ${athleteName}! I'm your AthleTEX AI coach for ${sport}.\n\n` +
         `I can help program workouts, analyze nutrition, build drill routines, and boost match performance. ` +
         `What would you like to work on today?`;
}

// Unified AI Dispatcher with Backend Priority & 100% Guaranteed Fallback
async function callUnifiedAI(userPrompt) {
  aiChatHistory.push({ role: 'user', content: userPrompt });

  let replyText = '';
  let activeEngineLabel = '';

  // 1. Try Backend AI Coach API first
  try {
    const res = await api.ai.coach(userPrompt);
    if (res && res.coach_response) {
      replyText = res.coach_response;
      activeEngineLabel = res.engine || 'AthleTEX AI Coach';
      aiChatHistory.push({ role: 'assistant', content: replyText });
      return { replyText, activeEngineLabel };
    }
  } catch (backendErr) {
    console.warn("Backend AI Coach service unavailable, trying client-side fallback engines:", backendErr);
  }

  // 2. Try Client-side APIs
  try {
    if (currentAIEngine === 'groq') {
      replyText = await callGroqAPI(aiChatHistory);
      activeEngineLabel = 'Groq (Llama 3.3 70B)';
    } else if (currentAIEngine === 'gemini') {
      replyText = await callGeminiAPI(aiChatHistory);
      activeEngineLabel = 'Google Gemini 2.0 Flash';
    } else if (currentAIEngine === 'ollama') {
      replyText = await callOllamaAPI(aiChatHistory);
      activeEngineLabel = `Ollama (${OLLAMA_MODEL})`;
    }
  } catch (clientErr) {
    console.warn("Client AI API call error:", clientErr);
  }

  // 3. Fallback to secondary client APIs if primary choice failed
  if (!replyText) {
    try {
      replyText = await callGroqAPI(aiChatHistory);
      activeEngineLabel = 'Groq (Llama 3.3 70B Fallback)';
    } catch (e) {
      try {
        replyText = await callGeminiAPI(aiChatHistory);
        activeEngineLabel = 'Gemini 2.0 Flash (Fallback)';
      } catch (e2) {}
    }
  }

  // 4. Guaranteed Rule Engine Fallback (Never Fails)
  if (!replyText) {
    replyText = getRuleEngineCoachResponse(userPrompt);
    activeEngineLabel = 'AthleTEX AI Coach Intelligence';
  }

  aiChatHistory.push({ role: 'assistant', content: replyText });
  return { replyText, activeEngineLabel };
}

async function sendAIMessage() {
  const input = document.getElementById('ai-input') || document.getElementById('gemini-input');
  const sendBtn = document.getElementById('ai-send-btn') || document.getElementById('gemini-send-btn');
  const message = input?.value?.trim();
  if (!message) return;

  input.value = '';
  input.disabled = true;
  if (sendBtn) sendBtn.disabled = true;

  appendAIMessage('user', message);
  const loadingEl = appendAIMessage('model', '', '', true);

  try {
    const { replyText, activeEngineLabel } = await callUnifiedAI(message);
    if (loadingEl) loadingEl.remove();
    appendAIMessage('assistant', replyText, activeEngineLabel);
  } catch (err) {
    if (loadingEl) loadingEl.remove();
    appendAIMessage('assistant', `⚠️ AI Error: ${err.message}. Please verify your connection or switch engines above.`);
  } finally {
    input.disabled = false;
    if (sendBtn) sendBtn.disabled = false;
    input.focus();
  }
}

function sendAIQuick(prompt) {
  const input = document.getElementById('ai-input') || document.getElementById('gemini-input');
  if (input) input.value = prompt;
  sendAIMessage();
}

async function generateAIPlan() {
  const sport = state.selectedSport || (state.sports?.[0]?.sport_name) || 'Cricket';
  go('coach');
  await new Promise(r => setTimeout(r, 100));
  const prompt = `Generate a high-intensity, customized 7-day training plan for a ${sport} athlete at intermediate-to-advanced level based in Hyderabad. Include daily workouts, sets/reps/duration, key focus areas, and a recovery schedule.`;
  const input = document.getElementById('ai-input') || document.getElementById('gemini-input');
  if (input) input.value = prompt;
  sendAIMessage();
  toast(`Generating custom 7-day ${sport} plan with AI…`, '⚡');
}

// Update performance insight dynamically using AI
async function updateAIInsight() {
  const box = document.getElementById('ai-recommendation');
  if (!box) return;
  try {
    const sport = state.selectedSport || 'Cricket';
    const prompt = `Give a single punchy, 2-sentence performance coaching insight for a ${sport} athlete on game-day focus and endurance.`;
    const response = await callGroqAPI([{ role: 'user', content: prompt }])
      .catch(() => callGeminiAPI([{ role: 'user', content: prompt }]))
      .catch(() => callOllamaAPI([{ role: 'user', content: prompt }]));
    if (response) {
      box.textContent = response.replace(/["*]/g, '');
    }
  } catch (e) {
    // Keep fallback text
  }
}

// Backward compatibility aliases
window.sendGeminiMessage = sendAIMessage;
window.sendGeminiQuick = sendAIQuick;
window.generateGeminiPlan = generateAIPlan;
window.setAIEngine = setAIEngine;
window.sendAIMessage = sendAIMessage;
window.sendAIQuick = sendAIQuick;
window.generateAIPlan = generateAIPlan;

/* =====================================================================
   ATHLETEX — COMPLETE 7-STEP SPORTS & FITNESS ONBOARDING LOGIC
   ===================================================================== */

const ONBOARDING_TITLES = [
  "Basic Sports Information",
  "Experience & Skill",
  "Sport-Specific Information",
  "Fitness Profile",
  "Training Preferences & Equipment",
  "Sports Goals & Location",
  "Availability & Profile Review"
];

const ALL_SPORTS_TILES = [
  { name: "Cricket", emoji: "🏏" },
  { name: "Football", emoji: "⚽" },
  { name: "Basketball", emoji: "🏀" },
  { name: "Badminton", emoji: "🏸" },
  { name: "Tennis", emoji: "🎾" },
  { name: "Swimming", emoji: "🏊" },
  { name: "Athletics", emoji: "🏃" },
  { name: "Volleyball", emoji: "🏐" },
  { name: "Table Tennis", emoji: "🏓" },
  { name: "Chess", emoji: "♟" },
  { name: "Boxing", emoji: "🥊" },
  { name: "Wrestling", emoji: "🤼" },
  { name: "Weightlifting", emoji: "🏋️" },
  { name: "Cycling", emoji: "🚴" },
  { name: "Other", emoji: "⚡" }
];

function initOnboardingState() {
  if (!state.onboardingData) {
    state.onboardingData = {
      primary_sport: "Cricket",
      sports_played: ["Cricket"],
      favorite_sport: "Cricket",
      improvement_sport: "Cricket",
      years: "1–3 years",
      skill_level: "Intermediate",
      frequency: "3–4 times per week",
      location_type: "Local ground/court",
      competition: "Sometimes",
      sport_specific: {
        cricket_role: "All-rounder",
        bowling_style: "Medium pace",
        batting_style: "Right-handed",
        format: "T20"
      },
      fitness_goals: ["Build strength", "Improve sports performance"],
      fitness_level: "Good",
      exercise_days: "3–4",
      session_duration: "60–90 minutes",
      locations: ["Gym", "Outdoor"],
      types: ["Strength training", "Sports drills"],
      preferred_time: "Evening",
      weekly_hours: "4–7",
      equipment: ["Gym equipment", "Cricket ground"],
      coaching: { had_training_program: false, has_coach: false, wants_coach: true },
      goals: ["Join a team", "Participate in tournaments", "Improve ranking"],
      help_topics: ["Match discovery", "Tournament discovery"],
      city: "Hyderabad",
      area: "Kukatpally",
      radius_km: 10,
      availability: {
        "Saturday": { start: "08:00 AM", end: "12:00 PM" },
        "Sunday": { start: "04:00 PM", end: "08:00 PM" }
      },
      stats: {
        matches_played: 24,
        runs: 450,
        wickets: 12
      }
    };
  }
}

function renderOnboardingStep(stepNum) {
  initOnboardingState();
  stepNum = Math.max(1, Math.min(7, stepNum));
  state.currentOnboardingStep = stepNum;

  const labelEl = document.getElementById('onboarding-step-label');
  const titleEl = document.getElementById('onboarding-step-title');
  const fillEl = document.getElementById('onboarding-progress-fill');
  const dotsEl = document.getElementById('onboarding-dots');
  const bodyEl = document.getElementById('onboarding-step-body');
  const prevBtn = document.getElementById('onboarding-prev-btn');
  const nextBtn = document.getElementById('onboarding-next-btn');

  if (labelEl) labelEl.textContent = `STEP ${stepNum} OF 7`;
  if (titleEl) titleEl.textContent = ONBOARDING_TITLES[stepNum - 1];
  if (fillEl) fillEl.style.width = `${(stepNum / 7) * 100}%`;

  if (dotsEl) {
    dotsEl.innerHTML = ONBOARDING_TITLES.map((t, idx) => {
      const stepIdx = idx + 1;
      let cls = "ob-dot";
      if (stepIdx === stepNum) cls += " active";
      else if (stepIdx < stepNum) cls += " completed";
      return `<div class="${cls}" title="Step ${stepIdx}: ${t}" onclick="renderOnboardingStep(${stepIdx})"></div>`;
    }).join('');
  }

  if (prevBtn) {
    prevBtn.style.visibility = stepNum === 1 ? 'hidden' : 'visible';
  }
  if (nextBtn) {
    nextBtn.textContent = stepNum === 7 ? 'COMPLETE PROFILE & ENTER ATHLETEX →' : 'NEXT →';
  }

  if (!bodyEl) return;

  const data = state.onboardingData;

  if (stepNum === 1) {
    bodyEl.innerHTML = `
      <div class="field">
        <label style="font-size:14px; font-weight:700;">What is your primary sport?</label>
        <div class="ob-grid-sports" id="ob-primary-sports-grid">
          ${ALL_SPORTS_TILES.map(s => {
            const isSel = (data.primary_sport || "Cricket").toLowerCase() === s.name.toLowerCase();
            return `
              <div class="ob-sport-tile ${isSel ? 'selected' : ''}" onclick="selectObPrimarySport('${s.name}')">
                <span class="ob-icon">${s.emoji}</span>
                <span class="ob-name">${s.name}</span>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <div class="field" style="margin-top: 24px;">
        <label style="font-size:14px; font-weight:700;">Which sports do you actively play?</label>
        <p style="font-size:12px; color:var(--ink-dim); margin-top:2px;">Select all that apply.</p>
        <div class="ob-chips-wrap" id="ob-played-chips">
          ${ALL_SPORTS_TILES.map(s => {
            const isPlayed = (data.sports_played || [data.primary_sport]).some(p => p.toLowerCase() === s.name.toLowerCase());
            return `<div class="ob-chip ${isPlayed ? 'selected' : ''}" onclick="toggleObPlayedSport('${s.name}', this)">${s.emoji} ${s.name}</div>`;
          }).join('')}
        </div>
      </div>

      <div class="field-row" style="margin-top: 20px;">
        <div class="field">
          <label>Which sport would you like to improve the most?</label>
          <select id="ob-improvement-sport" onchange="state.onboardingData.improvement_sport = this.value">
            ${ALL_SPORTS_TILES.map(s => `<option value="${s.name}" ${data.improvement_sport === s.name ? 'selected' : ''}>${s.emoji} ${s.name}</option>`).join('')}
          </select>
        </div>
      </div>
    `;
  } else if (stepNum === 2) {
    const durations = ["Less than 6 months", "6 months – 1 year", "1–3 years", "3–5 years", "5–10 years", "10+ years"];
    const skills = ["Beginner", "Intermediate", "Advanced", "Professional"];
    const freqs = ["Never", "Occasionally", "1–2 times per week", "3–4 times per week", "5+ times per week"];
    const locations = ["School/College", "Club", "Academy", "Local ground/court", "Professional organization", "Friends/community", "Other"];
    const comps = ["Never", "Sometimes", "Regularly", "Professional competitions"];

    bodyEl.innerHTML = `
      <div class="field">
        <label style="font-size:14px; font-weight:700;">How long have you been playing ${data.primary_sport || 'your primary sport'}?</label>
        <div class="ob-chips-wrap">
          ${durations.map(d => {
            const isSel = (data.years || "1–3 years") === d;
            return `<div class="ob-chip ${isSel ? 'selected' : ''}" onclick="setObField('years', '${d}', this)">${d}</div>`;
          }).join('')}
        </div>
      </div>

      <div class="field" style="margin-top: 22px;">
        <label style="font-size:14px; font-weight:700;">What is your current skill level?</label>
        <div class="ob-chips-wrap">
          ${skills.map(s => {
            const isSel = (data.skill_level || "Intermediate") === s;
            return `<div class="ob-chip ${isSel ? 'selected' : ''}" onclick="setObField('skill_level', '${s}', this)">${s}</div>`;
          }).join('')}
        </div>
      </div>

      <div class="field" style="margin-top: 22px;">
        <label style="font-size:14px; font-weight:700;">How often do you play?</label>
        <div class="ob-chips-wrap">
          ${freqs.map(f => {
            const isSel = (data.frequency || "3–4 times per week") === f;
            return `<div class="ob-chip ${isSel ? 'selected' : ''}" onclick="setObField('frequency', '${f}', this)">${f}</div>`;
          }).join('')}
        </div>
      </div>

      <div class="field-row" style="margin-top: 22px;">
        <div class="field">
          <label>Where do you usually play?</label>
          <select id="ob-location-type" onchange="state.onboardingData.location_type = this.value">
            ${locations.map(l => `<option value="${l}" ${data.location_type === l ? 'selected' : ''}>${l}</option>`).join('')}
          </select>
        </div>
        <div class="field">
          <label>Do you participate in competitions?</label>
          <select id="ob-competition" onchange="state.onboardingData.competition = this.value">
            ${comps.map(c => `<option value="${c}" ${data.competition === c ? 'selected' : ''}>${c}</option>`).join('')}
          </select>
        </div>
      </div>
    `;
  } else if (stepNum === 3) {
    const sport = (data.primary_sport || "Cricket").toLowerCase();
    let specHtml = "";

    if (sport.includes("cricket")) {
      specHtml = `
        <div class="field">
          <label style="font-size:14px; font-weight:700;">Cricket Playing Role</label>
          <div class="ob-chips-wrap">
            ${["Batter", "Bowler", "All-rounder", "Wicketkeeper"].map(r => {
              const isSel = (data.sport_specific?.cricket_role || "All-rounder") === r;
              return `<div class="ob-chip ${isSel ? 'selected' : ''}" onclick="setObSpec('cricket_role', '${r}', this)">${r}</div>`;
            }).join('')}
          </div>
        </div>
        <div class="field-row" style="margin-top: 20px;">
          <div class="field">
            <label>Bowling Style</label>
            <select onchange="setObSpecVal('bowling_style', this.value)">
              <option ${data.sport_specific?.bowling_style === 'Fast' ? 'selected' : ''}>Fast</option>
              <option ${data.sport_specific?.bowling_style === 'Medium pace' ? 'selected' : ''}>Medium pace</option>
              <option ${data.sport_specific?.bowling_style === 'Spin' ? 'selected' : ''}>Spin</option>
            </select>
          </div>
          <div class="field">
            <label>Batting Style</label>
            <select onchange="setObSpecVal('batting_style', this.value)">
              <option ${data.sport_specific?.batting_style === 'Right-handed' ? 'selected' : ''}>Right-handed</option>
              <option ${data.sport_specific?.batting_style === 'Left-handed' ? 'selected' : ''}>Left-handed</option>
            </select>
          </div>
        </div>
        <div class="field" style="margin-top: 16px;">
          <label>Preferred Format</label>
          <div class="ob-chips-wrap">
            ${["T20", "ODI", "Test", "Local matches"].map(f => {
              const isSel = (data.sport_specific?.format || "T20") === f;
              return `<div class="ob-chip ${isSel ? 'selected' : ''}" onclick="setObSpec('format', '${f}', this)">${f}</div>`;
            }).join('')}
          </div>
        </div>
      `;
    } else if (sport.includes("football") || sport.includes("soccer")) {
      specHtml = `
        <div class="field">
          <label style="font-size:14px; font-weight:700;">Football Position</label>
          <div class="ob-chips-wrap">
            ${["Goalkeeper", "Defender", "Midfielder", "Winger", "Forward", "Striker"].map(p => {
              const isSel = (data.sport_specific?.football_position || "Midfielder") === p;
              return `<div class="ob-chip ${isSel ? 'selected' : ''}" onclick="setObSpec('football_position', '${p}', this)">${p}</div>`;
            }).join('')}
          </div>
        </div>
        <div class="field" style="margin-top: 20px;">
          <label>Preferred Foot</label>
          <div class="ob-chips-wrap">
            ${["Left", "Right", "Both"].map(ft => {
              const isSel = (data.sport_specific?.preferred_foot || "Right") === ft;
              return `<div class="ob-chip ${isSel ? 'selected' : ''}" onclick="setObSpec('preferred_foot', '${ft}', this)">${ft}</div>`;
            }).join('')}
          </div>
        </div>
      `;
    } else if (sport.includes("badminton")) {
      specHtml = `
        <div class="field">
          <label style="font-size:14px; font-weight:700;">Badminton Event Format</label>
          <div class="ob-chips-wrap">
            ${["Singles", "Doubles", "Mixed doubles"].map(fmt => {
              const isSel = (data.sport_specific?.badminton_format || "Doubles") === fmt;
              return `<div class="ob-chip ${isSel ? 'selected' : ''}" onclick="setObSpec('badminton_format', '${fmt}', this)">${fmt}</div>`;
            }).join('')}
          </div>
        </div>
        <div class="field" style="margin-top: 20px;">
          <label>Playing Style</label>
          <div class="ob-chips-wrap">
            ${["Attacking", "Defensive", "Balanced"].map(st => {
              const isSel = (data.sport_specific?.playing_style || "Balanced") === st;
              return `<div class="ob-chip ${isSel ? 'selected' : ''}" onclick="setObSpec('playing_style', '${st}', this)">${st}</div>`;
            }).join('')}
          </div>
        </div>
      `;
    } else if (sport.includes("basketball")) {
      specHtml = `
        <div class="field">
          <label style="font-size:14px; font-weight:700;">Basketball Position</label>
          <div class="ob-chips-wrap">
            ${["Point Guard", "Shooting Guard", "Small Forward", "Power Forward", "Center"].map(pos => {
              const isSel = (data.sport_specific?.basketball_position || "Point Guard") === pos;
              return `<div class="ob-chip ${isSel ? 'selected' : ''}" onclick="setObSpec('basketball_position', '${pos}', this)">${pos}</div>`;
            }).join('')}
          </div>
        </div>
      `;
    } else if (sport.includes("tennis")) {
      specHtml = `
        <div class="field">
          <label style="font-size:14px; font-weight:700;">Tennis Format & Style</label>
          <div class="ob-chips-wrap">
            ${["Singles", "Doubles", "Both"].map(fmt => {
              const isSel = (data.sport_specific?.tennis_format || "Both") === fmt;
              return `<div class="ob-chip ${isSel ? 'selected' : ''}" onclick="setObSpec('tennis_format', '${fmt}', this)">${fmt}</div>`;
            }).join('')}
          </div>
        </div>
      `;
    } else {
      specHtml = `
        <div class="field">
          <label style="font-size:14px; font-weight:700;">${data.primary_sport} Playing Role / Specialty</label>
          <input type="text" placeholder="e.g. Competitive athlete / Runner / Specialist" value="${data.sport_specific?.role || ''}" onchange="setObSpecVal('role', this.value)">
        </div>
      `;
    }

    bodyEl.innerHTML = `
      <div style="background: rgba(34, 211, 238, 0.04); border: 1px solid var(--border-soft); border-radius: var(--radius-md); padding: 16px; margin-bottom: 20px;">
        <div style="font-size: 13px; color: var(--cyan); font-weight: 700;">Tailored Questions for ${data.primary_sport}</div>
      </div>
      ${specHtml}
    `;
  } else if (stepNum === 4) {
    const goalsList = [
      "Build strength", "Improve endurance", "Increase speed", "Improve flexibility",
      "Lose body fat", "Build muscle", "Improve sports performance", "Improve stamina",
      "Improve mobility", "General fitness", "Other"
    ];
    const fitnessLevels = ["Beginner", "Moderate", "Good", "Advanced", "Elite"];
    const daysOpts = ["0", "1–2", "3–4", "5–6", "Every day"];
    const durOpts = ["Less than 30 minutes", "30–60 minutes", "60–90 minutes", "90+ minutes"];

    bodyEl.innerHTML = `
      <div class="field">
        <label style="font-size:14px; font-weight:700;">What are your primary fitness goals?</label>
        <p style="font-size:12px; color:var(--ink-dim); margin-top:2px;">Select all that apply.</p>
        <div class="ob-chips-wrap">
          ${goalsList.map(g => {
            const isSel = (data.fitness_goals || []).includes(g);
            return `<div class="ob-chip ${isSel ? 'selected' : ''}" onclick="toggleObMulti('fitness_goals', '${g}', this)">${g}</div>`;
          }).join('')}
        </div>
      </div>

      <div class="field" style="margin-top: 22px;">
        <label style="font-size:14px; font-weight:700;">How would you describe your current fitness level?</label>
        <div class="ob-chips-wrap">
          ${fitnessLevels.map(fl => {
            const isSel = (data.fitness_level || "Good") === fl;
            return `<div class="ob-chip ${isSel ? 'selected' : ''}" onclick="setObField('fitness_level', '${fl}', this)">${fl}</div>`;
          }).join('')}
        </div>
      </div>

      <div class="field-row" style="margin-top: 22px;">
        <div class="field">
          <label>Exercise Days per Week</label>
          <select onchange="state.onboardingData.exercise_days = this.value">
            ${daysOpts.map(d => `<option value="${d}" ${data.exercise_days === d ? 'selected' : ''}>${d} days</option>`).join('')}
          </select>
        </div>
        <div class="field">
          <label>Typical Session Duration</label>
          <select onchange="state.onboardingData.session_duration = this.value">
            ${durOpts.map(dur => `<option value="${dur}" ${data.session_duration === dur ? 'selected' : ''}>${dur}</option>`).join('')}
          </select>
        </div>
      </div>
    `;
  } else if (stepNum === 5) {
    const trainLocs = ["Gym", "Home", "Outdoor", "Sports academy", "Sports ground", "Court", "Swimming pool", "Multiple locations"];
    const trainTypes = ["Strength training", "Cardio", "Running", "Cycling", "HIIT", "Mobility", "Stretching", "Sports drills", "Skill training", "Yoga", "Bodyweight training"];
    const equipList = ["Gym equipment", "Dumbbells", "Barbells", "Resistance bands", "Treadmill", "Exercise bike", "Sports court", "Cricket ground", "Football ground", "Swimming pool", "None"];

    bodyEl.innerHTML = `
      <div class="field">
        <label style="font-size:14px; font-weight:700;">Where do you usually train?</label>
        <div class="ob-chips-wrap">
          ${trainLocs.map(tl => {
            const isSel = (data.locations || []).includes(tl);
            return `<div class="ob-chip ${isSel ? 'selected' : ''}" onclick="toggleObMulti('locations', '${tl}', this)">${tl}</div>`;
          }).join('')}
        </div>
      </div>

      <div class="field" style="margin-top: 20px;">
        <label style="font-size:14px; font-weight:700;">What type of training do you enjoy?</label>
        <div class="ob-chips-wrap">
          ${trainTypes.map(tt => {
            const isSel = (data.types || []).includes(tt);
            return `<div class="ob-chip ${isSel ? 'selected' : ''}" onclick="toggleObMulti('types', '${tt}', this)">${tt}</div>`;
          }).join('')}
        </div>
      </div>

      <div class="field" style="margin-top: 20px;">
        <label style="font-size:14px; font-weight:700;">Equipment Access</label>
        <div class="ob-chips-wrap">
          ${equipList.map(eq => {
            const isSel = (data.equipment || []).includes(eq);
            return `<div class="ob-chip ${isSel ? 'selected' : ''}" onclick="toggleObMulti('equipment', '${eq}', this)">${eq}</div>`;
          }).join('')}
        </div>
      </div>

      <div class="field-row" style="margin-top: 20px;">
        <div class="field">
          <label>Preferred Training Time</label>
          <select onchange="state.onboardingData.preferred_time = this.value">
            ${["Early morning", "Morning", "Afternoon", "Evening", "Night", "Flexible"].map(t => `<option value="${t}" ${data.preferred_time === t ? 'selected' : ''}>${t}</option>`).join('')}
          </select>
        </div>
        <div class="field">
          <label>Weekly Hours</label>
          <select onchange="state.onboardingData.weekly_hours = this.value">
            ${["Less than 2", "2–4", "4–7", "7–10", "10+"].map(h => `<option value="${h}" ${data.weekly_hours === h ? 'selected' : ''}>${h} hours</option>`).join('')}
          </select>
        </div>
      </div>
    `;
  } else if (stepNum === 6) {
    const sportsGoals = [
      "Become more competitive", "Join a team", "Find teammates", "Find opponents",
      "Participate in tournaments", "Improve ranking", "Improve fitness", "Improve technique",
      "Become professional", "Get noticed by coaches/scouts", "Make new sports connections"
    ];
    const helpTopics = [
      "Match discovery", "Tournament discovery", "Team discovery", "Finding teammates",
      "Finding opponents", "Finding coaches", "Training recommendations", "Fitness tracking",
      "Performance tracking", "Sports networking"
    ];

    bodyEl.innerHTML = `
      <div class="field">
        <label style="font-size:14px; font-weight:700;">What are your biggest sports goals?</label>
        <div class="ob-chips-wrap">
          ${sportsGoals.map(sg => {
            const isSel = (data.goals || []).includes(sg);
            return `<div class="ob-chip ${isSel ? 'selected' : ''}" onclick="toggleObMulti('goals', '${sg}', this)">${sg}</div>`;
          }).join('')}
        </div>
      </div>

      <div class="field" style="margin-top: 20px;">
        <label style="font-size:14px; font-weight:700;">What would you like ATHLETEX to help you with?</label>
        <div class="ob-chips-wrap">
          ${helpTopics.map(ht => {
            const isSel = (data.help_topics || []).includes(ht);
            return `<div class="ob-chip ${isSel ? 'selected' : ''}" onclick="toggleObMulti('help_topics', '${ht}', this)">${ht}</div>`;
          }).join('')}
        </div>
      </div>

      <div class="field-row" style="margin-top: 20px;">
        <div class="field">
          <label>City</label>
          <input type="text" id="ob-city" value="${data.city || 'Hyderabad'}" onchange="state.onboardingData.city = this.value">
        </div>
        <div class="field">
          <label>Area / Locality</label>
          <input type="text" id="ob-area" value="${data.area || 'Kukatpally'}" onchange="state.onboardingData.area = this.value">
        </div>
        <div class="field">
          <label>Preferred Radius</label>
          <select onchange="state.onboardingData.radius_km = parseInt(this.value)">
            ${[1, 5, 10, 25, 50].map(r => `<option value="${r}" ${data.radius_km === r ? 'selected' : ''}>${r} km</option>`).join('')}
          </select>
        </div>
      </div>

      <div style="margin-top: 20px; border-top: 1px dashed var(--border-soft); padding-top: 14px;">
        <div class="eyebrow" style="color:var(--cyan);">Optional Performance Statistics</div>
        <div class="field-row" style="margin-top: 10px;">
          <div class="field"><label>Matches Played</label><input type="number" value="${data.stats?.matches_played || ''}" placeholder="e.g. 25" onchange="setObStat('matches_played', this.value)"></div>
          <div class="field"><label>Primary Runs / Goals / Points</label><input type="number" value="${data.stats?.runs || data.stats?.goals || ''}" placeholder="e.g. 450" onchange="setObStat('runs', this.value)"></div>
          <div class="field"><label>Wickets / Assists / Wins</label><input type="number" value="${data.stats?.wickets || data.stats?.assists || ''}" placeholder="e.g. 12" onchange="setObStat('wickets', this.value)"></div>
        </div>
      </div>
    `;
  } else if (stepNum === 7) {
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const availMap = data.availability || {};

    bodyEl.innerHTML = `
      <div class="field">
        <label style="font-size:14px; font-weight:700;">When are you usually available for sports?</label>
        <p style="font-size:12px; color:var(--ink-dim); margin-top:2px;">Select days and your usual available times.</p>
        <div style="display:flex; flex-direction:column; gap:10px; margin-top:12px;">
          ${days.map(d => {
            const isAvail = !!availMap[d];
            const times = availMap[d] || { start: "08:00 AM", end: "12:00 PM" };
            return `
              <div style="display:flex; align-items:center; justify-content:space-between; background:var(--panel-strong); padding:10px 14px; border-radius:var(--radius-sm); border:1px solid var(--border-soft);">
                <label style="display:flex; align-items:center; gap:8px; cursor:pointer; font-weight:600; font-size:13.5px; margin:0; text-transform:none;">
                  <input type="checkbox" ${isAvail ? 'checked' : ''} onchange="toggleObDay('${d}', this.checked)" style="accent-color:var(--cyan); width:16px; height:16px;">
                  ${d}
                </label>
                <div style="display:flex; gap:8px; align-items:center;">
                  <input type="text" value="${times.start || '08:00 AM'}" placeholder="Start time" style="width:90px; padding:4px 8px; font-size:12px;" onchange="setObDayTime('${d}', 'start', this.value)">
                  <span style="font-size:12px; color:var(--ink-dim);">→</span>
                  <input type="text" value="${times.end || '12:00 PM'}" placeholder="End time" style="width:90px; padding:4px 8px; font-size:12px;" onchange="setObDayTime('${d}', 'end', this.value)">
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <div style="margin-top: 24px; background: linear-gradient(135deg, rgba(34,211,238,0.08), rgba(47,107,255,0.12)); border: 1px solid var(--cyan); border-radius: var(--radius-md); padding: 20px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <div>
            <span style="font-size:11px; font-weight:700; color:var(--cyan); letter-spacing:0.1em;">PROFILE REVIEW</span>
            <h3 style="margin:2px 0 0 0; font-size:18px;">YOUR ATHLETEX PROFILE IS READY</h3>
          </div>
          <div style="background:var(--cyan); color:#000; padding:6px 14px; border-radius:100px; font-size:14px; font-weight:800;">
            92% COMPLETE
          </div>
        </div>
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:12px; font-size:13px;">
          <div><strong style="color:var(--ink-dim);">Primary Sport:</strong> ${data.primary_sport || 'Cricket'}</div>
          <div><strong style="color:var(--ink-dim);">Sports Played:</strong> ${(data.sports_played || [data.primary_sport]).join(', ')}</div>
          <div><strong style="color:var(--ink-dim);">Skill Level:</strong> ${data.skill_level || 'Intermediate'}</div>
          <div><strong style="color:var(--ink-dim);">Fitness Goal:</strong> ${(data.fitness_goals || ['Build strength'])[0]}</div>
          <div><strong style="color:var(--ink-dim);">Training:</strong> ${data.exercise_days || '3–4'} days/week</div>
          <div><strong style="color:var(--ink-dim);">Location:</strong> ${data.area || 'Kukatpally'}, ${data.city || 'Hyderabad'}</div>
        </div>
      </div>
    `;
  }
}

function selectObPrimarySport(sportName) {
  state.onboardingData.primary_sport = sportName;
  if (!state.onboardingData.sports_played) state.onboardingData.sports_played = [];
  if (!state.onboardingData.sports_played.includes(sportName)) {
    state.onboardingData.sports_played.push(sportName);
  }
  renderOnboardingStep(1);
}

function toggleObPlayedSport(sportName, el) {
  if (!state.onboardingData.sports_played) state.onboardingData.sports_played = [];
  const idx = state.onboardingData.sports_played.indexOf(sportName);
  if (idx > -1) {
    if (state.onboardingData.sports_played.length > 1) {
      state.onboardingData.sports_played.splice(idx, 1);
    }
  } else {
    state.onboardingData.sports_played.push(sportName);
  }
  el.classList.toggle('selected', state.onboardingData.sports_played.includes(sportName));
}

function setObField(field, val, el) {
  state.onboardingData[field] = val;
  if (el && el.parentElement) {
    el.parentElement.querySelectorAll('.ob-chip').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');
  }
}

function setObSpec(key, val, el) {
  if (!state.onboardingData.sport_specific) state.onboardingData.sport_specific = {};
  state.onboardingData.sport_specific[key] = val;
  if (el && el.parentElement) {
    el.parentElement.querySelectorAll('.ob-chip').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');
  }
}

function setObSpecVal(key, val) {
  if (!state.onboardingData.sport_specific) state.onboardingData.sport_specific = {};
  state.onboardingData.sport_specific[key] = val;
}

function toggleObMulti(field, val, el) {
  if (!state.onboardingData[field]) state.onboardingData[field] = [];
  const idx = state.onboardingData[field].indexOf(val);
  if (idx > -1) {
    state.onboardingData[field].splice(idx, 1);
  } else {
    state.onboardingData[field].push(val);
  }
  el.classList.toggle('selected', state.onboardingData[field].includes(val));
}

function setObStat(key, val) {
  if (!state.onboardingData.stats) state.onboardingData.stats = {};
  state.onboardingData.stats[key] = val ? parseInt(val) : 0;
}

function toggleObDay(day, isChecked) {
  if (!state.onboardingData.availability) state.onboardingData.availability = {};
  if (isChecked) {
    state.onboardingData.availability[day] = { start: "08:00 AM", end: "12:00 PM" };
  } else {
    delete state.onboardingData.availability[day];
  }
}

function setObDayTime(day, type, val) {
  if (!state.onboardingData.availability) state.onboardingData.availability = {};
  if (!state.onboardingData.availability[day]) {
    state.onboardingData.availability[day] = { start: "08:00 AM", end: "12:00 PM" };
  }
  state.onboardingData.availability[day][type] = val;
}

async function nextOnboardingStep() {
  const currentStep = state.currentOnboardingStep || 1;
  const isFinal = currentStep >= 7;

  try {
    const res = await api.onboarding.saveStep(currentStep, {
      ...state.onboardingData,
      finish: isFinal
    });
    if (res && res.profile) {
      state.onboardingData = res.profile;
    }
  } catch (err) {
    console.error("Failed to save step to MongoDB:", err);
  }

  if (isFinal) {
    toast("Your ATHLETEX Profile is complete! Entering platform… 🚀", "🚀");
    const obContainer = document.getElementById('onboarding-container');
    const wsContainer = document.getElementById('workspace');
    if (obContainer) obContainer.style.display = 'none';
    if (wsContainer) wsContainer.style.removeProperty('display');
    await checkAuthAndLoad();
  } else {
    renderOnboardingStep(currentStep + 1);
  }
}

function prevOnboardingStep() {
  const currentStep = state.currentOnboardingStep || 1;
  if (currentStep > 1) {
    renderOnboardingStep(currentStep - 1);
  }
}

function skipOnboardingStep() {
  nextOnboardingStep();
}

function switchEditTab(tabName) {
  const modal = document.getElementById('modal-edit-profile');
  if (!modal) return;
  modal.querySelectorAll('#edit-profile-tabs .tab-btn').forEach(b => b.classList.remove('active'));
  modal.querySelectorAll('.edit-tab-panel').forEach(p => {
    p.classList.remove('active');
    p.style.display = 'none';
  });
  
  const targetBtn = Array.from(modal.querySelectorAll('#edit-profile-tabs .tab-btn')).find(b => b.textContent.toLowerCase().includes(tabName));
  if (targetBtn) targetBtn.classList.add('active');
  
  const panel = modal.querySelector(`#edit-panel-${tabName}`);
  if (panel) {
    panel.classList.add('active');
    panel.style.display = 'block';
  }
}

function previewCertificates(input) {
  const list = document.getElementById('certificate-file-list');
  if (!list) return;

  const files = Array.from(input.files || []);
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
  const validFiles = files.filter(file => allowedTypes.includes(file.type) && file.size <= 10 * 1024 * 1024);

  if (validFiles.length !== files.length) {
    toast('Use PDF, JPG, PNG or WEBP files up to 10 MB each.', '⚠️');
  }

  list.innerHTML = validFiles.length
    ? validFiles.map(file => `<div class="certificate-file"><span>${file.name}</span><small>${(file.size / 1024 / 1024).toFixed(1)} MB</small></div>`).join('')
    : '<span style="color:var(--ink-faint);">No valid certificates selected.</span>';
}

async function saveProfileEdits() {
  const name = document.getElementById('edit-name')?.value?.trim();
  const city = document.getElementById('edit-city')?.value?.trim();
  const area = document.getElementById('edit-area')?.value?.trim();
  const bio = document.getElementById('edit-bio')?.value?.trim();
  const primary_sport = document.getElementById('edit-primary-sport')?.value;
  const skill_level = document.getElementById('edit-skill-level')?.value;
  const frequency = document.getElementById('edit-frequency')?.value;
  const sports_played_str = document.getElementById('edit-sports-played')?.value;
  const fitness_level = document.getElementById('edit-fitness-level')?.value;
  const exercise_days = document.getElementById('edit-exercise-days')?.value;
  const session_duration = document.getElementById('edit-session-duration')?.value;
  const fitness_goals_str = document.getElementById('edit-fitness-goals')?.value;
  const preferred_time = document.getElementById('edit-preferred-time')?.value;
  const weekly_hours = document.getElementById('edit-weekly-hours')?.value;
  const train_locations_str = document.getElementById('edit-train-locations')?.value;
  const equipment_str = document.getElementById('edit-equipment')?.value;
  const avail_days_str = document.getElementById('edit-avail-days')?.value;
  const sports_goals_str = document.getElementById('edit-sports-goals')?.value;
  const help_topics_str = document.getElementById('edit-help-topics')?.value;

  const parseCsv = str => str ? str.split(',').map(s => s.trim()).filter(Boolean) : [];

  const updatePayload = {
    sports: {
      primary: primary_sport,
      played: parseCsv(sports_played_str)
    },
    experience: {
      skill_level: skill_level,
      frequency: frequency
    },
    fitness: {
      fitness_level: fitness_level,
      exercise_days: exercise_days,
      session_duration: session_duration,
      goals: parseCsv(fitness_goals_str)
    },
    training: {
      preferred_time: preferred_time,
      weekly_hours: weekly_hours,
      locations: parseCsv(train_locations_str)
    },
    equipment: parseCsv(equipment_str),
    goals: parseCsv(sports_goals_str),
    help_topics: parseCsv(help_topics_str),
    location: { city, area }
  };

  try {
    await api.onboarding.updateProfile(updatePayload);
    if (name) {
      await api.profile.update({ bio, location: `${area}, ${city}` }).catch(() => {});
    }
    closeModal('modal-edit-profile');
    toast("Profile updated successfully in MongoDB!", "✓");
    await checkAuthAndLoad();
  } catch (err) {
    toast(err.message || "Failed to update profile", "⚠️");
  }
}

function renderOnboardingProfileSections() {
  const container = document.querySelector('#tab-about');
  if (!container) return;

  const ob = state.onboardingData || {};
  const sports = ob.sports || {};
  const exp = ob.experience || {};
  const fit = ob.fitness || {};
  const train = ob.training || {};
  const avail = ob.availability || {};
  const goals = ob.goals || [];
  const equip = ob.equipment || [];
  const spec = ob.sport_specific || {};

  let sectionsHtml = `
    <!-- ABOUT SECTION -->
    <div class="card" style="margin-bottom:16px;">
      <div class="card-title"><h3>ABOUT</h3></div>
      <p style="color:var(--ink-dim); font-size:13.5px; line-height:1.7;">
        ${state.profile?.bio || ob.bio || `Competitive ${sports.primary || 'sports'} athlete based in ${ob.area || 'Kukatpally'}, ${ob.city || 'Hyderabad'}.`}
      </p>
    </div>
  `;

  // SPORTS SECTION
  if (sports.primary || (sports.played && sports.played.length > 0)) {
    sectionsHtml += `
      <div class="card" style="margin-bottom:16px;">
        <div class="card-title"><h3>SPORTS</h3></div>
        <div style="display:flex; flex-wrap:wrap; gap:16px; font-size:13px;">
          <div><strong style="color:var(--cyan);">Primary Sport:</strong> ${sports.primary || 'Cricket'}</div>
          ${sports.played ? `<div><strong style="color:var(--ink-dim);">Actively Playing:</strong> ${sports.played.join(', ')}</div>` : ''}
          ${sports.favorite ? `<div><strong style="color:var(--ink-dim);">Favorite:</strong> ${sports.favorite}</div>` : ''}
          ${sports.improvement ? `<div><strong style="color:var(--ink-dim);">Target Improvement:</strong> ${sports.improvement}</div>` : ''}
        </div>
      </div>
    `;
  }

  // SPORTING EXPERIENCE
  if (exp.skill_level || exp.years) {
    sectionsHtml += `
      <div class="card" style="margin-bottom:16px;">
        <div class="card-title"><h3>SPORTING EXPERIENCE</h3></div>
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:12px; font-size:13px;">
          <div><strong style="color:var(--ink-dim);">Experience Duration:</strong> ${exp.years || '1–3 years'}</div>
          <div><strong style="color:var(--ink-dim);">Skill Level:</strong> ${exp.skill_level || 'Intermediate'}</div>
          <div><strong style="color:var(--ink-dim);">Playing Frequency:</strong> ${exp.frequency || '3–4 times per week'}</div>
          ${exp.location_type ? `<div><strong style="color:var(--ink-dim);">Usual Venue:</strong> ${exp.location_type}</div>` : ''}
          ${exp.competition ? `<div><strong style="color:var(--ink-dim);">Competitions:</strong> ${exp.competition}</div>` : ''}
        </div>
        ${Object.keys(spec).length > 0 ? `
          <div style="margin-top:12px; padding-top:10px; border-top:1px dashed var(--border-soft); font-size:12.5px;">
            <strong style="color:var(--cyan);">Sport Specific Details:</strong>
            <div style="display:flex; flex-wrap:wrap; gap:12px; margin-top:6px; color:var(--ink-dim);">
              ${Object.entries(spec).map(([k, v]) => `<span><strong>${k.replace('_', ' ').toUpperCase()}:</strong> ${v}</span>`).join(' • ')}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }

  // FITNESS
  if (fit.fitness_level || (fit.goals && fit.goals.length > 0)) {
    sectionsHtml += `
      <div class="card" style="margin-bottom:16px;">
        <div class="card-title"><h3>FITNESS PROFILE</h3></div>
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:12px; font-size:13px;">
          <div><strong style="color:var(--ink-dim);">Fitness Level:</strong> ${fit.fitness_level || 'Good'}</div>
          <div><strong style="color:var(--ink-dim);">Exercise Days:</strong> ${fit.exercise_days || '3–4'} days/week</div>
          <div><strong style="color:var(--ink-dim);">Session Duration:</strong> ${fit.session_duration || '60–90 minutes'}</div>
        </div>
        ${fit.goals && fit.goals.length > 0 ? `
          <div style="margin-top:12px; font-size:13px;">
            <strong style="color:var(--cyan);">Primary Fitness Goals:</strong>
            <div class="ob-chips-wrap" style="margin-top:6px;">
              ${fit.goals.map(g => `<span class="ob-chip selected" style="font-size:12px; padding:4px 12px;">${g}</span>`).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }

  // TRAINING
  if (train.locations || train.types) {
    sectionsHtml += `
      <div class="card" style="margin-bottom:16px;">
        <div class="card-title"><h3>TRAINING PREFERENCES</h3></div>
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:12px; font-size:13px;">
          ${train.preferred_time ? `<div><strong style="color:var(--ink-dim);">Preferred Time:</strong> ${train.preferred_time}</div>` : ''}
          ${train.weekly_hours ? `<div><strong style="color:var(--ink-dim);">Weekly Hours:</strong> ${train.weekly_hours} hrs</div>` : ''}
        </div>
        ${train.locations && train.locations.length > 0 ? `
          <div style="margin-top:10px; font-size:12.5px;"><strong style="color:var(--ink-dim);">Locations:</strong> ${train.locations.join(', ')}</div>
        ` : ''}
        ${train.types && train.types.length > 0 ? `
          <div style="margin-top:6px; font-size:12.5px;"><strong style="color:var(--ink-dim);">Training Types:</strong> ${train.types.join(', ')}</div>
        ` : ''}
      </div>
    `;
  }

  // GOALS & TARGETS
  if (goals.length > 0) {
    sectionsHtml += `
      <div class="card" style="margin-bottom:16px;">
        <div class="card-title"><h3>GOALS & TARGETS</h3></div>
        <div class="ob-chips-wrap">
          ${goals.map(g => `<span class="ob-chip selected" style="font-size:12px; padding:5px 14px;">🎯 ${g}</span>`).join('')}
        </div>
      </div>
    `;
  }

  // AVAILABILITY
  if (Object.keys(avail).length > 0) {
    sectionsHtml += `
      <div class="card" style="margin-bottom:16px;">
        <div class="card-title"><h3>AVAILABILITY</h3></div>
        <div style="display:flex; flex-wrap:wrap; gap:10px; font-size:12.5px;">
          ${Object.entries(avail).map(([day, times]) => `
            <div style="background:var(--panel-strong); border:1px solid var(--border-soft); padding:6px 12px; border-radius:var(--radius-sm);">
              <strong style="color:var(--lime);">${day}:</strong> ${times.start || '08:00 AM'} - ${times.end || '12:00 PM'}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // EQUIPMENT
  if (equip.length > 0) {
    sectionsHtml += `
      <div class="card" style="margin-bottom:16px;">
        <div class="card-title"><h3>EQUIPMENT ACCESS</h3></div>
        <div class="ob-chips-wrap">
          ${equip.map(eq => `<span class="ob-chip" style="font-size:12px; padding:4px 12px; border-color:var(--border-soft);">🏋️ ${eq}</span>`).join('')}
        </div>
      </div>
    `;
  }

  container.innerHTML = sectionsHtml;
}




