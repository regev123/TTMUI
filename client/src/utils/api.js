import axios from 'axios';

/**
 * @module api
 * @desc    Configures an axios instance with a base URL and common headers to be used for API requests.
 *          This setup ensures consistent API calls with the proper base URL and headers for JSON content.
 *
 * Axios Instance Configuration:
 * - `baseURL`: The base URL for all requests, in this case set to `/api`.
 * - `headers`: The default headers to include in each request, setting `Content-Type` to `application/json` for RESTful API communication.
 *
 * @returns {AxiosInstance} - The configured axios instance to be used for making HTTP requests.
 */
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
