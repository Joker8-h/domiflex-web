import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { House, Search, ShoppingBag, Heart, User } from "lucide-react";
import { useAuth } from "../pages/context/AuthContext";

export default function BottomTabs() {
  const navigate = useNavigate();
  const location = useLocation();
  const { usuario } = useAuth();
  const rol = (typeof usuario?.rol === "string" ? usuario.rol : usuario?.rol?.nombre || "").toUpperCase();
  const esComercio = rol === "COMERCIO" || Number(usuario?.idRol) === 4;

  const tabs = [
    { id: "inicio", label: "Inicio", icon: House, path: esComercio ? "/comercio" : "/restaurantes" },
    { id: "explorar", label: "Buscar", icon: Search, path: "/restaurantes" },
    { id: "pedidos", label: "Pedidos", icon: ShoppingBag, path: "/mis-pedidos" },
    { id: "favoritos", label: "Favoritos", icon: Heart, path: "/restaurantes?tab=favoritos" },
    { id: "perfil", label: "Perfil", icon: User, path: "/profile" },
  ];

  const isActive = (path) => {
    if (path.includes("?")) {
      return location.pathname + location.search === path;
    }
    return location.pathname === path || (path !== "/" && location.pathname.startsWith(path));
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
              color: active ? "#00E576" : "#9CA3AF",
            }}
            onClick={() => navigate(tab.path)}
          >
            <Icon size={21} aria-hidden="true" strokeWidth={active ? 2.5 : 2} />
            <span style={{ ...styles.label, fontWeight: active ? 700 : 500 }}>{tab.label}</span>
            {active && <div style={styles.indicator} aria-hidden="true" />}
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
    backgroundColor: "rgba(11, 31, 68, 0.96)",
    backdropFilter: "blur(14px)",
    WebkitBackdropFilter: "blur(14px)",
    borderTop: "1px solid #1D3B72",
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    padding: "6px 0 10px",
    zIndex: 300,
    boxShadow: "0 -4px 16px rgba(3, 10, 26, 0.4)",
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
    padding: "4px 8px",
    minHeight: "50px",
    position: "relative",
    transition: "color 0.15s ease",
    fontFamily: "'Montserrat', sans-serif",
  },
  label: {
    fontSize: "11px",
    letterSpacing: "0.2px",
  },
  indicator: {
    position: "absolute",
    top: "-6px",
    left: "50%",
    transform: "translateX(-50%)",
    width: "16px",
    height: "3px",
    backgroundColor: "#00E576",
    borderRadius: "2px",
    boxShadow: "0 0 8px #00E576",
  },
};
