// src/services/authService.ts

import axios from 'axios';

const API_URL = 'http://localhost:5000';

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export const authService = {
  login: async (data: LoginData) => {
    const response = await axios.post(`${API_URL}/login`, data);
    return response.data;
  },

  register: async (data: RegisterData) => {
    const response = await axios.post(`${API_URL}/register`, data);
    return response.data;
  },
};
