import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'http://localhost:8000', // Replace with your API base URL
  timeout: 5000, // Request timeout in milliseconds
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Optional: Add interceptors for request and response
// axiosClient.interceptors.request.use(
//   (config) => {
//     // Modify request config if needed (e.g., add auth token)
//     return config;
//   },
//   (error) => {
//     // Handle request error
//     return Promise.reject(error);
//   }
// );

// axiosClient.interceptors.response.use(
//   (response) => {
//     // Handle successful response
//     return response;
//   },
//   (error) => {
//     // Handle response error
//     return Promise.reject(error);
//   }
// );

export default axiosClient;