import axios from "axios";

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const tokenStorage = {
  getAccess: () => localStorage.getItem("gestock_access_token"),
  getRefresh: () => localStorage.getItem("gestock_refresh_token"),
  set: ({ accessToken, refreshToken }) => {
    if (accessToken) localStorage.setItem("gestock_access_token", accessToken);
    if (refreshToken) localStorage.setItem("gestock_refresh_token", refreshToken);
  },
  clear: () => {
    localStorage.removeItem("gestock_access_token");
    localStorage.removeItem("gestock_refresh_token");
    localStorage.removeItem("gestock_user");
  }
};

const api = axios.create({
  baseURL: API_URL
});

api.interceptors.request.use((config) => {
  const token = tokenStorage.getAccess();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = tokenStorage.getRefresh();

      if (refreshToken) {
        const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
        tokenStorage.set({ accessToken: data.accessToken });
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
