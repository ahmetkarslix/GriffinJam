const API_URL = (import.meta.env.VITE_SERVER_URL || '').replace(/\/+$/, '');

export function apiUrl(path) {
  return `${API_URL}${path}`;
}
