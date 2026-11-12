/*
 * Thin client for the Django REST backend.
 *
 * - In development the base URL is empty, so requests go to /api/... and the
 *   Vite dev server proxies them to Django (see vite.config.js).
 * - In production set VITE_API_URL to the deployed backend.
 * - Authentication uses DRF Token auth: "Authorization: Token <key>".
 */
const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export const TOKEN_KEY = 'token';
export const UNAUTHORIZED_EVENT = 'pos:unauthorized';

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/** Turn any DRF error payload into one readable sentence. */
export const extractErrorMessage = (data, fallback = 'Something went wrong.') => {
  if (!data) return fallback;
  if (typeof data === 'string') return data;
  if (Array.isArray(data)) return data.map((d) => extractErrorMessage(d, '')).filter(Boolean).join(' ');
  if (typeof data === 'object') {
    if (data.detail) return extractErrorMessage(data.detail, fallback);
    const parts = Object.entries(data).map(([field, value]) => {
      const text = extractErrorMessage(value, '');
      return text ? `${field.replace(/_/g, ' ')}: ${text}` : '';
    });
    const joined = parts.filter(Boolean).join(' | ');
    return joined || fallback;
  }
  return fallback;
};

const buildQuery = (params) => {
  if (!params) return '';
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') search.append(key, value);
  });
  const text = search.toString();
  return text ? `?${text}` : '';
};

export const apiRequest = async (endpoint, options = {}) => {
  const { params, body, headers: extraHeaders, ...rest } = options;
  const token = localStorage.getItem(TOKEN_KEY);

  const headers = { Accept: 'application/json', ...extraHeaders };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Token ${token}`;

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}${buildQuery(params)}`, {
      ...rest,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError('Cannot reach the server. Is the backend running?', 0, null);
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    // An expired / invalid token on a protected call: sign the user out.
    if (response.status === 401 && token) {
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
    }
    throw new ApiError(extractErrorMessage(data, `Request failed (${response.status}).`), response.status, data);
  }

  return data;
};

export const api = {
  get: (endpoint, params) => apiRequest(endpoint, { method: 'GET', params }),
  post: (endpoint, body) => apiRequest(endpoint, { method: 'POST', body: body ?? {} }),
  patch: (endpoint, body) => apiRequest(endpoint, { method: 'PATCH', body: body ?? {} }),
  put: (endpoint, body) => apiRequest(endpoint, { method: 'PUT', body: body ?? {} }),
  del: (endpoint) => apiRequest(endpoint, { method: 'DELETE' }),
};

/** Lists come back as a plain array, or { results: [...] } — accept both. */
export const asList = (data) => (Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : []);
