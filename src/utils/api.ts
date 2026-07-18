const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export const api = {
  signup: async (data: { username: string; email: string; password: string }) => {
    const res = await fetch(`${API_URL}/api/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  
  login: async (data: { email: string; password: string }) => {
    const res = await fetch(`${API_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  
  getProfile: async (token: string) => {
    const res = await fetch(`${API_URL}/api/profile`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return res.json();
  },
};