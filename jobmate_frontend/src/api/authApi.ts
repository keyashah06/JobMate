import axios from 'axios';

// Create an axios instance with default config
const apiClient = axios.create({
  baseURL: 'http://localhost:5000', // Adjust this to your Flask backend URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth related API calls
const authApi = {
  // Login user
  login: async (email: string, password: string) => {
    try {
      const response = await apiClient.post('/api/auth/login', {
        email,
        password,
      });
      // Store token in localStorage or state management solution
      if (response.data.token) {
        localStorage.setItem('jobmate_token', response.data.token);
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Register new user
  signup: async (name: string, email: string, password: string) => {
    try {
      const response = await apiClient.post('/api/auth/signup', {
        name,
        email,
        password,
      });
      // Store token in localStorage or state management solution
      if (response.data.token) {
        localStorage.setItem('jobmate_token', response.data.token);
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Forgot password
  forgotPassword: async (email: string) => {
    try {
      const response = await apiClient.post('/api/auth/forgot-password', {
        email,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('jobmate_token');
  },
};

export default authApi;