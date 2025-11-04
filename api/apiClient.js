import axios from 'axios';
import { getToken } from './tokenService'; // <-- cross-platform token helper

const API_URL = 'https://backend-app-jjw5.onrender.com';

const apiClient = axios.create({
  baseURL: API_URL,
});

// Add interceptor to include token automatically
apiClient.interceptors.request.use(
  async (config) => {
    const token = await getToken(); // works on web + mobile
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;
