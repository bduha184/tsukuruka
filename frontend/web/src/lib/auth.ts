const TOKEN_KEY = 'tsukurioki_token';

export interface User {
  id: string;
  name: string | null;
  provider: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// トークンを保存
export function saveToken(token: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
  }
}

// トークンを取得
export function getToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
}

// トークンを削除
export function removeToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
  }
}

// ログイン
export async function login(provider: string, providerID: string, name?: string): Promise<LoginResponse> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      provider,
      provider_id: providerID,
      name,
    }),
  });

  if (!response.ok) {
    throw new Error('Login failed');
  }

  const data: LoginResponse = await response.json();
  saveToken(data.token);
  return data;
}

// 現在のユーザーを取得
export async function getCurrentUser(): Promise<User | null> {
  const token = getToken();
  if (!token) return null;

  try {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      removeToken();
      return null;
    }

    return await response.json();
  } catch {
    return null;
  }
}

// ログアウト
export async function logout() {
  const token = getToken();
  if (token) {
    await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
  removeToken();
}

// アカウント削除
export async function deleteAccount(): Promise<boolean> {
  const token = getToken();
  if (!token) return false;

  const response = await fetch(`${API_URL}/auth/account`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.ok) {
    removeToken();
    return true;
  }
  return false;
}
