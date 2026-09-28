// import axios from 'axios';

// // Create a configured Axios instance
// const api = axios.create({
//   baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
//   withCredentials: true, // Required to send and receive HTTP-Only cookies (JWT) across origins
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// // Response Interceptor: Globally handle API errors (e.g., expired sessions)
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     // Handle 401 Unauthorized errors (e.g., token expired or unauthenticated)
//     if (error.response && error.response.status === 401) {
//       // Optional: Redirect to login or log session expiration
//       if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
//         console.warn('Session expired or unauthorized access. Redirecting to login...');
//       }
//     }

//     return Promise.reject(error);
//   }
// );

// export default api;

import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
});

// Request Interceptor: Automatically attach JWT token if available
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const userInfo = localStorage.getItem('userInfo');
      if (userInfo) {
        const { token } = JSON.parse(userInfo);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;