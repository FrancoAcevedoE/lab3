import axios from "axios";

const apiClient = axios.create({
  baseURL: "https://laboratorio3-f36a.restdb.io/rest",
  headers: {
    "x-apikey": "60eb09146661365596af552f",
    "Content-Type": "application/json"
  }
});

// esto agrega el token a cada request
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
