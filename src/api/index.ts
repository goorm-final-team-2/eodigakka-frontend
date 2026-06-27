import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  const guestToken = sessionStorage.getItem('guestToken');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else if (guestToken) {
    config.headers['X-Guest-Token'] = guestToken;
  }

  return config;
});

export default apiClient;
