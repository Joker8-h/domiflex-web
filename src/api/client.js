// DomiFlex API client central (Fase 1).
// Unifica los ~99 fetch dispersos: base URL, auth, 401→logout, Abort, errores.
// Uso: import { api } from "../api/client";
//      const negocios = await api.get("/negocios", { signal });
import { API_URL } from "../config";

const TOKEN_KEYS = ["domiflex_token", "app_token"];

export function getToken() {
  for (const k of TOKEN_KEYS) {
    const v = localStorage.getItem(k);
    if (v) return v;
  }
  return null;
}

export function clearSession() {
  ["domiflex_token", "domiflex_usuario", "app_token", "app_usuario"].forEach((k) =>
    localStorage.removeItem(k)
  );
}

function handleUnauthorized() {
  clearSession();
  if (!window.location.pathname.startsWith("/login")) {
    window.location.href = "/login";
  }
}

async function request(path, { method = "GET", body, token, signal, headers = {} } = {}) {
  const t = token ?? getToken();
  const res = await fetch(`${API_URL}${path}`, {
    method,
    signal,
    headers: {
      "Content-Type": "application/json",
      ...(t ? { Authorization: `Bearer ${t}` } : {}),
      ...headers,
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  if (res.status === 401) {
    handleUnauthorized();
    throw new Error("Sesión expirada. Inicia sesión de nuevo.");
  }

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    throw new Error(data?.error || data?.message || `Error ${res.status}`);
  }
  return data;
}

export const api = {
  get: (path, opts) => request(path, { ...opts, method: "GET" }),
  post: (path, body, opts) => request(path, { ...opts, method: "POST", body }),
  put: (path, body, opts) => request(path, { ...opts, method: "PUT", body }),
  patch: (path, body, opts) => request(path, { ...opts, method: "PATCH", body }),
  delete: (path, opts) => request(path, { ...opts, method: "DELETE" }),
};

export function authHeaders() {
  const t = getToken();
  return {
    Authorization: `Bearer ${t}`,
    "Content-Type": "application/json",
  };
}
