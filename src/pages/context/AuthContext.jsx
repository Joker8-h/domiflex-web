import { createContext, useContext, useState, useEffect } from "react";
import { API_URL } from "../../config";

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
    return userSaved ? JSON.parse(userSaved) : null;
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

  const login = (tk, datosUsuario) => {
    guardarToken(tk);
    guardarUsuario(datosUsuario);
  };

  const logout = () => {
    setToken(null);
    setUsuario(null);
    localStorage.removeItem("domiflex_token");
    localStorage.removeItem("domiflex_usuario");
    localStorage.removeItem("app_token");
    localStorage.removeItem("app_usuario");
  };

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

  const getRepartidores = async () => {
    const res = await fetch(`${API_URL}/auth/repartidores`, { headers: authHeaders() });
    if (!res.ok) throw new Error('No se pudo listar repartidores');
    return res.json();
  };

  const getClientes = async () => {
    const res = await fetch(`${API_URL}/auth/clientes`, { headers: authHeaders() });
    if (!res.ok) throw new Error('No se pudo listar clientes');
    return res.json();
  };

  return (
    <AuthContext.Provider
      value={{
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
        ROLES: ROLES_DOMIFLEX
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};