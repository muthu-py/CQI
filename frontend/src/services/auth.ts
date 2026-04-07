import axios from 'axios';

const AUTH_BASE_URL = 'http://localhost:3000/auth';
const TOKEN_STORAGE_KEY = 'cqi_admin_token';

type LoginResponse = {
  token: string;
  tokenType: string;
  expiresInSeconds: number;
};

const authApi = axios.create({
  baseURL: AUTH_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

export async function login(username: string, password: string): Promise<LoginResponse> {
  const response = await authApi.post<LoginResponse>('/login', { username, password });
  setToken(response.data.token);
  return response.data;
}

export async function signout(): Promise<void> {
  const token = getToken();
  if (token) {
    await authApi.post(
      '/signout',
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  }
  clearToken();
}

export async function getMe() {
  const token = getToken();
  if (!token) {
    throw new Error('No token found');
  }

  const response = await authApi.get('/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}

