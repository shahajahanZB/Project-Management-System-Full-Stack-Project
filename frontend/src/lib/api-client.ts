import axios from "axios";

const baseURL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8081/api";
console.log("API Client initialized with baseURL:", baseURL);

export const apiClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15_000,
});

// Request interceptor to add authorization token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(
      "API Request:",
      config.method?.toUpperCase(),
      config.url,
      config.data,
    );
    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => {
    console.log(
      "API Response:",
      response.status,
      response.config.url,
      response.data,
    );
    return response;
  },
  (error) => {
    console.error(
      "API Error:",
      error.response?.status,
      error.response?.config?.url,
      error.message,
      error.response?.data,
    );
    return Promise.reject(error);
  },
);
