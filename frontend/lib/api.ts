const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export function setAuth(token: string, user: { id: string; fullName: string; email: string }) {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

export function getUser(): { id: string; fullName: string; email: string } | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("user");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as { id: string; fullName: string; email: string };
  } catch {
    return null;
  }
}

export function authHeaders(): HeadersInit {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function api(path: string, options: RequestInit = {}) {
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: { ...authHeaders(), ...options.headers },
  });
  return res;
}
