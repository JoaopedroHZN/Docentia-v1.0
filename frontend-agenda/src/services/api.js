import axios from 'axios';

// Em desenvolvimento local, usa http://localhost:8080
// No Render, a variável VITE_API_URL é injetada automaticamente via render.yaml
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_URL,
});

export default api;