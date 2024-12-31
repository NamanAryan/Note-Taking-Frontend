import axios, { AxiosInstance } from 'axios';

// Create an Axios instance with defined configuration
const api: AxiosInstance = axios.create({
  baseURL: 'http://localhost:8000/api', // Replace with your backend's URL
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;

