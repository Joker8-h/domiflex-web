import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { House, Search, ShoppingBag, User } from "lucide-react";
import { useAuth } from "../pages/context/AuthContext";

export default function BottomTabs() {
  const navigate = useNavigate();
  const location = useLocation();
  const { usuario } = useAuth();
  const rol = (typeof usuario?.rol === "string" ? usuario.rol : usuario?.rol?.nombre || "").toUpperCase();
  const esComercio = rol === "COMERCIO" || Number(usuario?.idRol) === 4;

  // 4 pestañas exactas del boceto móvil: Inicio, Buscar, Pedidos, Cuenta
  const tabs = [
    { id: "inicio", label: "Inicio", icon: House, path: esComercio ? "/comercio" : "/" },
    { id: "buscar", label: "Buscar", icon: Search, path: "/restaurantes" },
    { id: "pedidos", label: "Pedidos", icon: ShoppingBag, path: "/mis-pedidos" },
    { id: "cuenta", label: "Cuenta", icon: User, path: "/profile" },
  ];

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname === path || location.pathname.startsWith(path);
  };

  return (
    <nav aria-label="Navegación móvil Rapitipica" style={styles.container}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const active = isActive(tab.path);
        return (
          <button
            key={tab.id}
            type="button"
            aria-current={active ? "page" : undefined}
            style={{
              ...styles.tab,
              color: active ? "#E30613" : "#4B5563",
            }}
            onClick={() => navigate(tab.path)}
          >
            <Icon size={21} aria-hidden="true" strokeWidth={active ? 2.5 : 2} />
            <span style={{ ...styles.label, fontWeight: active ? 700 : 500 }}>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

const styles = {
  container: {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderTop: "1px solid #E5E7EB",
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    padding: "6px 0 10px",
    zIndex: 300,
    boxShadow: "0 -4px 16px rgba(0, 0, 0, 0.08)",
  },
  tab: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "3px",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "4px 12px",
    minHeight: "50px",
    position: "relative",
    transition: "color 0.15s ease",
    fontFamily: "'Montserrat', sans-serif",
  },
  label: {
    fontSize: "11px",
    letterSpacing: "0.2px",
  },
};
