// src/services/authService.ts

import axios from 'axios';

const API_URL = 'http://localhost:5000';

export const authService = {
  login: async (credentials: { email: string; password: string }) => {
    const response = await axios.post(`${API_URL}/login`, credentials);
    return response.data;
  },
  register: async (userData: { name: string; email: string; password: string }) => {
    const response = await axios.post(`${API_URL}/register`, userData);
    return response.data;
  },
};
