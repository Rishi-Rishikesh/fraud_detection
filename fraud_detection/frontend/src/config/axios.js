import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'http://localhost:8000',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Access-Control-Allow-Credentials': 'true'
    }
});

// Add a request interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        // Get the token from localStorage
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error('Response error:', error.response.data);
            return Promise.reject(error.response.data);
        } else if (error.request) {
            // The request was made but no response was received
            console.error('Request error:', error.request);
            return Promise.reject({ detail: 'No response from server' });
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error('Error:', error.message);
            return Promise.reject({ detail: error.message });
        }
    }
);

export default axiosInstance;