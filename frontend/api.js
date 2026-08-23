/* =====================================================================
   AthleTEX — Unified API Client
   ===================================================================== */

const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:8000/api/v1'
  : '/api/v1';

const getHeaders = (isMultipart = false) => {
  const headers = {};
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  const token = localStorage.getItem('auth_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (response) => {
  if (response.status === 401) {
    // Clear stale credentials without changing the current page.
    localStorage.removeItem('auth_token');
  }
  
  if (!response.ok) {
    let errorMessage = 'An unexpected error occurred.';
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorMessage;
    } catch (e) {
      // Not JSON
    }
    throw new Error(errorMessage);
  }
  
  if (response.status === 244 || response.status === 204) {
    return null;
  }
  
  return await response.json();
};

const api = {
  auth: {
    async signup(name, email, password, role) {
      const res = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ name, email, password, role })
      });
      const data = await handleResponse(res);
      if (data && data.access_token) {
        localStorage.setItem('auth_token', data.access_token);
      }
      return data;
    },
    async login(email, password) {
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);
      
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData.toString()
      });
      const data = await handleResponse(res);
      if (data && data.access_token) {
        localStorage.setItem('auth_token', data.access_token);
      }
      return data;
    },
    async googleLogin(payload) {
      const res = await fetch(`${API_BASE_URL}/auth/google`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload)
      });
      const data = await handleResponse(res);
      if (data && data.access_token) {
        localStorage.setItem('auth_token', data.access_token);
      }
      return data;
    },
    async me() {
      const res = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: getHeaders()
      });
      return await handleResponse(res);
    },
    logout() {
      localStorage.removeItem('auth_token');
    }
  },
  
  onboarding: {
    async getStatus() {
      const res = await fetch(`${API_BASE_URL}/onboarding/status`, {
        method: 'GET',
        headers: getHeaders()
      });
      return await handleResponse(res);
    },
    async saveStep(step, data) {
      const res = await fetch(`${API_BASE_URL}/onboarding/step`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ step, data })
      });
      return await handleResponse(res);
    },
    async getProfile() {
      const res = await fetch(`${API_BASE_URL}/onboarding/profile`, {
        method: 'GET',
        headers: getHeaders()
      });
      return await handleResponse(res);
    },
    async updateProfile(profileData) {
      const res = await fetch(`${API_BASE_URL}/onboarding/profile`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(profileData)
      });
      return await handleResponse(res);
    }
  },

  profile: {
    async get() {
      const res = await fetch(`${API_BASE_URL}/athletes/profile`, {
        method: 'GET',
        headers: getHeaders()
      });
      return await handleResponse(res);
    },
    async update(profileData) {
      const res = await fetch(`${API_BASE_URL}/athletes/profile`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(profileData)
      });
      return await handleResponse(res);
    },
    async uploadAvatar(file) {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${API_BASE_URL}/athletes/avatar`, {
        method: 'POST',
        headers: getHeaders(true),
        body: formData
      });
      return await handleResponse(res);
    },
    async getSports() {
      const res = await fetch(`${API_BASE_URL}/athletes/sports`, {
        method: 'GET',
        headers: getHeaders()
      });
      return await handleResponse(res);
    },
    async addSport(sportData) {
      const res = await fetch(`${API_BASE_URL}/athletes/sports`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(sportData)
      });
      return await handleResponse(res);
    },
    async updateSport(sportId, sportData) {
      const res = await fetch(`${API_BASE_URL}/athletes/sports/${sportId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(sportData)
      });
      return await handleResponse(res);
    },
    async getAchievements() {
      const res = await fetch(`${API_BASE_URL}/athletes/achievements`, {
        method: 'GET',
        headers: getHeaders()
      });
      return await handleResponse(res);
    },
    async addAchievement(achData) {
      const res = await fetch(`${API_BASE_URL}/athletes/achievements`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(achData)
      });
      return await handleResponse(res);
    },
    async getPublicProfile(userId) {
      const res = await fetch(`${API_BASE_URL}/athletes/public/${userId}`, {
        method: 'GET',
        headers: getHeaders()
      });
      return await handleResponse(res);
    }
  },
  
  athletes: {
    async discover(filters = {}) {
      const params = new URLSearchParams();
      if (filters.sport) params.append('sport', filters.sport);
      if (filters.location) params.append('location', filters.location);
      if (filters.skill_level) params.append('skill_level', filters.skill_level);
      if (filters.verified_only) params.append('verified_only', filters.verified_only);
      if (filters.search) params.append('search', filters.search);
      
      const res = await fetch(`${API_BASE_URL}/athletes/?${params.toString()}`, {
        method: 'GET',
        headers: getHeaders()
      });
      return await handleResponse(res);
    }
  },
  
  connections: {
    async request(receiverId) {
      const res = await fetch(`${API_BASE_URL}/connections/request?receiver_id=${receiverId}`, {
        method: 'POST',
        headers: getHeaders()
      });
      return await handleResponse(res);
    },
    async pending() {
      const res = await fetch(`${API_BASE_URL}/connections/pending`, {
        method: 'GET',
        headers: getHeaders()
      });
      return await handleResponse(res);
    },
    async respond(requestId, accept) {
      const res = await fetch(`${API_BASE_URL}/connections/respond/${requestId}?accept=${accept}`, {
        method: 'POST',
        headers: getHeaders()
      });
      return await handleResponse(res);
    },
    async list() {
      const res = await fetch(`${API_BASE_URL}/connections/list`, {
        method: 'GET',
        headers: getHeaders()
      });
      return await handleResponse(res);
    }
  },
  
  matches: {
    async list(filters = {}) {
      const params = new URLSearchParams();
      if (filters.sport) params.append('sport', filters.sport);
      if (filters.location) params.append('location', filters.location);
      if (filters.skill_level) params.append('skill_level', filters.skill_level);
      
      const res = await fetch(`${API_BASE_URL}/matches/?${params.toString()}`, {
        method: 'GET',
        headers: getHeaders()
      });
      return await handleResponse(res);
    },
    async create(matchData) {
      const res = await fetch(`${API_BASE_URL}/matches/create`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(matchData)
      });
      return await handleResponse(res);
    },
    async get(matchId) {
      const res = await fetch(`${API_BASE_URL}/matches/${matchId}`, {
        method: 'GET',
        headers: getHeaders()
      });
      return await handleResponse(res);
    },
    async join(matchId) {
      const res = await fetch(`${API_BASE_URL}/matches/${matchId}/join`, {
        method: 'POST',
        headers: getHeaders()
      });
      return await handleResponse(res);
    },
    async leave(matchId) {
      const res = await fetch(`${API_BASE_URL}/matches/${matchId}/leave`, {
        method: 'POST',
        headers: getHeaders()
      });
      return await handleResponse(res);
    },
    async submitResult(matchId, resultData) {
      const res = await fetch(`${API_BASE_URL}/matches/${matchId}/result`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(resultData)
      });
      return await handleResponse(res);
    },
    async cancel(matchId) {
      const res = await fetch(`${API_BASE_URL}/matches/${matchId}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      return await handleResponse(res);
    }
  },
  
  tournaments: {
    async list(filters = {}) {
      const params = new URLSearchParams();
      if (filters.sport) params.append('sport', filters.sport);
      if (filters.status_filter) params.append('status_filter', filters.status_filter);
      
      const res = await fetch(`${API_BASE_URL}/tournaments/?${params.toString()}`, {
        method: 'GET',
        headers: getHeaders()
      });
      return await handleResponse(res);
    },
    async create(tourData) {
      const res = await fetch(`${API_BASE_URL}/tournaments/create`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(tourData)
      });
      return await handleResponse(res);
    },
    async get(tourId) {
      const res = await fetch(`${API_BASE_URL}/tournaments/${tourId}`, {
        method: 'GET',
        headers: getHeaders()
      });
      return await handleResponse(res);
    },
    async register(tourId, teamId = null) {
      const url = teamId 
        ? `${API_BASE_URL}/tournaments/${tourId}/register?team_id=${teamId}`
        : `${API_BASE_URL}/tournaments/${tourId}/register`;
      const res = await fetch(url, {
        method: 'POST',
        headers: getHeaders()
      });
      return await handleResponse(res);
    },
    async approve(tourId, participantId) {
      const res = await fetch(`${API_BASE_URL}/tournaments/${tourId}/approve/${participantId}`, {
        method: 'POST',
        headers: getHeaders()
      });
      return await handleResponse(res);
    },
    async start(tourId) {
      const res = await fetch(`${API_BASE_URL}/tournaments/${tourId}/start`, {
        method: 'POST',
        headers: getHeaders()
      });
      return await handleResponse(res);
    },
    async getBracket(tourId) {
      const res = await fetch(`${API_BASE_URL}/tournaments/${tourId}/bracket`, {
        method: 'GET',
        headers: getHeaders()
      });
      return await handleResponse(res);
    },
    async submitMatchScore(matchId, scoreData) {
      const res = await fetch(`${API_BASE_URL}/tournaments/match/${matchId}/score`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(scoreData)
      });
      return await handleResponse(res);
    }
  },
  
  teams: {
    async list(filters = {}) {
      const params = new URLSearchParams();
      if (filters.sport) params.append('sport', filters.sport);
      if (filters.location) params.append('location', filters.location);
      
      const res = await fetch(`${API_BASE_URL}/teams/?${params.toString()}`, {
        method: 'GET',
        headers: getHeaders()
      });
      return await handleResponse(res);
    },
    async create(teamData) {
      const res = await fetch(`${API_BASE_URL}/teams/create`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(teamData)
      });
      return await handleResponse(res);
    },
    async get(teamId) {
      const res = await fetch(`${API_BASE_URL}/teams/${teamId}`, {
        method: 'GET',
        headers: getHeaders()
      });
      return await handleResponse(res);
    },
    async join(teamId) {
      const res = await fetch(`${API_BASE_URL}/teams/${teamId}/join`, {
        method: 'POST',
        headers: getHeaders()
      });
      return await handleResponse(res);
    },
    async respond(teamId, memberId, approve) {
      const res = await fetch(`${API_BASE_URL}/teams/${teamId}/respond/${memberId}?approve=${approve}`, {
        method: 'POST',
        headers: getHeaders()
      });
      return await handleResponse(res);
    },
    async leave(teamId) {
      const res = await fetch(`${API_BASE_URL}/teams/${teamId}/leave`, {
        method: 'POST',
        headers: getHeaders()
      });
      return await handleResponse(res);
    }
  },
  
  events: {
    async list(filters = {}) {
      const params = new URLSearchParams();
      if (filters.sport) params.append('sport', filters.sport);
      const res = await fetch(`${API_BASE_URL}/events/?${params.toString()}`, {
        method: 'GET',
        headers: getHeaders()
      });
      return await handleResponse(res);
    },
    async create(eventData) {
      const res = await fetch(`${API_BASE_URL}/events/create`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(eventData)
      });
      return await handleResponse(res);
    },
    async register(eventId) {
      const res = await fetch(`${API_BASE_URL}/events/${eventId}/register`, {
        method: 'POST',
        headers: getHeaders()
      });
      return await handleResponse(res);
    }
  },
  
  community: {
    async list(category = null) {
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      const res = await fetch(`${API_BASE_URL}/community/?${params.toString()}`, {
        method: 'GET',
        headers: getHeaders()
      });
      return await handleResponse(res);
    },
    async create(postData) {
      const res = await fetch(`${API_BASE_URL}/community/create`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(postData)
      });
      return await handleResponse(res);
    },
    async like(postId) {
      const res = await fetch(`${API_BASE_URL}/community/${postId}/like`, {
        method: 'POST',
        headers: getHeaders()
      });
      return await handleResponse(res);
    },
    async unlike(postId) {
      const res = await fetch(`${API_BASE_URL}/community/${postId}/unlike`, {
        method: 'POST',
        headers: getHeaders()
      });
      return await handleResponse(res);
    },
    async comment(postId, content) {
      const params = new URLSearchParams();
      params.append('content', content);
      const res = await fetch(`${API_BASE_URL}/community/${postId}/comment?${params.toString()}`, {
        method: 'POST',
        headers: getHeaders()
      });
      return await handleResponse(res);
    }
  },
  
  messages: {
    async recent() {
      const res = await fetch(`${API_BASE_URL}/messages/recent`, {
        method: 'GET',
        headers: getHeaders()
      });
      return await handleResponse(res);
    },
    async getHistory(otherUserId) {
      const res = await fetch(`${API_BASE_URL}/messages/chat/${otherUserId}`, {
        method: 'GET',
        headers: getHeaders()
      });
      return await handleResponse(res);
    },
    async send(receiverId, content) {
      const res = await fetch(`${API_BASE_URL}/messages/send`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ receiver_id: receiverId, content })
      });
      return await handleResponse(res);
    }
  },
  
  notifications: {
    async list() {
      const res = await fetch(`${API_BASE_URL}/notifications/`, {
        method: 'GET',
        headers: getHeaders()
      });
      return await handleResponse(res);
    },
    async unreadCount() {
      const res = await fetch(`${API_BASE_URL}/notifications/unread-count`, {
        method: 'GET',
        headers: getHeaders()
      });
      return await handleResponse(res);
    },
    async read(notifId) {
      const res = await fetch(`${API_BASE_URL}/notifications/${notifId}/read`, {
        method: 'POST',
        headers: getHeaders()
      });
      return await handleResponse(res);
    },
    async readAll() {
      const res = await fetch(`${API_BASE_URL}/notifications/read-all`, {
        method: 'POST',
        headers: getHeaders()
      });
      return await handleResponse(res);
    }
  },
  
  settings: {
    async get() {
      const res = await fetch(`${API_BASE_URL}/settings/`, {
        method: 'GET',
        headers: getHeaders()
      });
      return await handleResponse(res);
    },
    async update(settingData) {
      const res = await fetch(`${API_BASE_URL}/settings/`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(settingData)
      });
      return await handleResponse(res);
    }
  },
  
  search: {
    async query(q) {
      const res = await fetch(`${API_BASE_URL}/search?q=${encodeURIComponent(q)}`, {
        method: 'GET',
        headers: getHeaders()
      });
      return await handleResponse(res);
    }
  },

  liveScores: {
    async list() {
      const res = await fetch(`${API_BASE_URL}/live-scores`, {
        method: 'GET',
        headers: getHeaders()
      });
      return await handleResponse(res);
    },
    async get(matchId) {
      const res = await fetch(`${API_BASE_URL}/live-scores/${matchId}`, {
        method: 'GET',
        headers: getHeaders()
      });
      return await handleResponse(res);
    }
  },

  health: {
    async check() {
      const res = await fetch(`http://localhost:8000/health`, {
        method: 'GET'
      });
      return await handleResponse(res);
    }
  },

  ai: {
    async coach(message) {
      const res = await fetch(`${API_BASE_URL}/ai/coach`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ message })
      });
      return await handleResponse(res);
    },
    async playerMatch(sport, skill) {
      const params = new URLSearchParams();
      params.append('sport', sport);
      params.append('skill', skill);
      const res = await fetch(`${API_BASE_URL}/ai/player-match?${params.toString()}`, {
        method: 'POST',
        headers: getHeaders()
      });
      return await handleResponse(res);
    },
    async motionGuard(file) {
      const formData = new FormData();
      if (file) formData.append('file', file);
      const res = await fetch(`${API_BASE_URL}/ai/motion-guard`, {
        method: 'POST',
        headers: getHeaders(true),
        body: formData
      });
      return await handleResponse(res);
    },
    async matchLens(file) {
      const formData = new FormData();
      if (file) formData.append('file', file);
      const res = await fetch(`${API_BASE_URL}/ai/match-lens`, {
        method: 'POST',
        headers: getHeaders(true),
        body: formData
      });
      return await handleResponse(res);
    },
    async openScout(athleteId, sport) {
      const res = await fetch(`${API_BASE_URL}/ai/open-scout`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ athlete_id: athleteId, sport })
      });
      return await handleResponse(res);
    },
    async getReports() {
      const res = await fetch(`${API_BASE_URL}/ai/reports`, {
        method: 'GET',
        headers: getHeaders()
      });
      return await handleResponse(res);
    },
    async getReport(reportId) {
      const res = await fetch(`${API_BASE_URL}/ai/reports/${reportId}`, {
        method: 'GET',
        headers: getHeaders()
      });
      return await handleResponse(res);
    }
  },

  leaderboards: {
    async getLeaderboard(sport = 'Cricket', location = '') {
      try {
        const params = new URLSearchParams();
        if (sport) params.append('sport', sport);
        if (location) params.append('location', location);
        const res = await fetch(`${API_BASE_URL}/leaderboards?${params.toString()}`, {
          method: 'GET',
          headers: getHeaders()
        });
        return await handleResponse(res);
      } catch (e) {
        return [
          { name: 'Arjun Reddy', rating: 94, location: 'Kukatpally, Hyderabad', skill: 'Pro' },
          { name: 'Vikram Varma', rating: 91, location: 'Gachibowli, Hyderabad', skill: 'Advanced' },
          { name: 'Siddharth Rao', rating: 88, location: 'Banjara Hills, Hyderabad', skill: 'Advanced' },
          { name: 'Ananya Sharma', rating: 86, location: 'Hitech City, Hyderabad', skill: 'Intermediate' },
          { name: 'Rohan Mehta', rating: 84, location: 'Kondapur, Hyderabad', skill: 'Intermediate' }
        ];
      }
    }
  },

  liveScores: {
    async list() {
      try {
        const res = await fetch(`${API_BASE_URL}/live-scores`, {
          method: 'GET',
          headers: getHeaders()
        });
        return await handleResponse(res);
      } catch (e) {
        return []; // offline fallback — static cards shown in HTML
      }
    }
  }
};
