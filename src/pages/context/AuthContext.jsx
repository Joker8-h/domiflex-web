import { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { API_URL } from "../../config";
import { api } from "../../api/client";

function safeParse(raw) {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

const AuthContext = createContext();

export const ROLES_DOMIFLEX = {
  ADMIN: "ADMIN",
  REPARTIDOR: "REPARTIDOR",
  CLIENTE: "CLIENTE",
  COMERCIO: "COMERCIO",
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    return localStorage.getItem("domiflex_token") || localStorage.getItem("app_token") || null
  });
  
  const [usuario, setUsuario] = useState(() => {
    const userSaved = localStorage.getItem("domiflex_usuario") || localStorage.getItem("app_usuario");
    const parsed = safeParse(userSaved);
    if (userSaved && !parsed) {
      localStorage.removeItem("domiflex_usuario");
      localStorage.removeItem("app_usuario");
    }
    return parsed;
  });

  useEffect(() => {
    if (token && usuario) {
      localStorage.setItem("domiflex_token", token);
      localStorage.setItem("domiflex_usuario", JSON.stringify(usuario));
      localStorage.removeItem("app_token");
      localStorage.removeItem("app_usuario");
    }
  }, [token, usuario]);

  const guardarToken = (tk) => {
    setToken(tk);
  };

  const guardarUsuario = (datosUsuario) => {
    setUsuario(datosUsuario);
  };

  const login = useCallback((tk, datosUsuario) => {
    guardarToken(tk);
    guardarUsuario(datosUsuario);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUsuario(null);
    localStorage.removeItem("domiflex_token");
    localStorage.removeItem("domiflex_usuario");
    localStorage.removeItem("app_token");
    localStorage.removeItem("app_usuario");
  }, []);

  const getRolNombre = () => {
    const raw = typeof usuario?.rol === 'string' ? usuario.rol : (usuario?.rol?.nombre || "");
    return (raw || "").toUpperCase();
  };

  const isRepartidor = () => getRolNombre() === ROLES_DOMIFLEX.REPARTIDOR || Number(usuario?.idRol) === 2;
  const isCliente = () => getRolNombre() === ROLES_DOMIFLEX.CLIENTE || Number(usuario?.idRol) === 3;
  const isComercio = () => getRolNombre() === ROLES_DOMIFLEX.COMERCIO || Number(usuario?.idRol) === 4;
  const isAdmin = () => getRolNombre() === ROLES_DOMIFLEX.ADMIN || Number(usuario?.idRol) === 1;

  const authHeaders = () => ({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  });

  const getRepartidores = useCallback(async () => {
    try {
      return await api.get("/auth/repartidores", { token });
    } catch {
      throw new Error('No se pudo listar repartidores');
    }
  }, [token]);

  const getClientes = useCallback(async () => {
    try {
      return await api.get("/auth/clientes", { token });
    } catch {
      throw new Error('No se pudo listar clientes');
    }
  }, [token]);

  const value = useMemo(() => ({
    token,
    guardarToken,
    usuario,
    guardarUsuario,
    login,
    logout,
    setUsuario,
    getRolNombre,
    isAdmin,
    isRepartidor,
    isCliente,
    isComercio,
    getRepartidores,
    getClientes,
    authHeaders,
    ROLES: ROLES_DOMIFLEX
  }), [token, usuario, login, logout, getRepartidores, getClientes]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};