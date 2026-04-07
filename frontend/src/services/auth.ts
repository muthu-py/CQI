import axios, { AxiosError, type AxiosRequestConfig, type AxiosResponse } from 'axios';

const TOKEN_STORAGE_KEY = 'cqi_admin_token';

type LoginResponse = {
  token: string;
  tokenType: string;
  expiresInSeconds: number;
};

const authBaseUrls = Array.from(
  new Set([
    `${window.location.protocol}//${window.location.hostname}:3000/auth`,
    'http://localhost:3000/auth',
    'http://127.0.0.1:3000/auth',
  ])
);

function createAuthClient(baseURL: string) {
  return axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function shouldTryNextBase(error: unknown): boolean {
  if (!axios.isAxiosError(error)) return false;
  if (error.code === 'ERR_NETWORK') return true;
  return error.response?.status === 404;
}

async function requestWithFallback<T>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> {
  let lastError: unknown = null;

  for (const baseURL of authBaseUrls) {
    try {
      const client = createAuthClient(baseURL);
      return await client.request<T>(config);
    } catch (error) {
      lastError = error;
      if (!shouldTryNextBase(error)) {
        throw error;
      }
    }
  }

  throw lastError instanceof Error ? lastError : new AxiosError('Auth request failed');
}

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
  const response = await requestWithFallback<LoginResponse>({
    url: '/login',
    method: 'POST',
    data: { username, password },
  });
  setToken(response.data.token);
  return response.data;
}

export async function signout(): Promise<void> {
  const token = getToken();
  if (token) {
    await requestWithFallback({
      url: '/signout',
      method: 'POST',
      data: {},
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
  clearToken();
}

export async function getMe() {
  const token = getToken();
  if (!token) {
    throw new Error('No token found');
  }

  const response = await requestWithFallback({
    url: '/me',
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}
