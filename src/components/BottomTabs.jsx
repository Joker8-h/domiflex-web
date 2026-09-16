import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ClipboardList, Search, House, User } from "lucide-react";
import theme from "../styles/theme";

const tabs = [
  { id: "inicio", label: "Inicio", icon: House, path: "/home" },
  { id: "buscar", label: "Buscar", icon: Search, path: "/restaurantes" },
  { id: "pedidos", label: "Pedidos", icon: ClipboardList, path: "/mis-pedidos" },
  { id: "perfil", label: "Perfil", icon: User, path: "/perfil" },
];

export default function BottomTabs() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  return (
    <nav aria-label="Navegación principal" style={styles.container}>
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
              color: active ? theme.colors.accent : theme.colors.textMuted,
            }}
            onClick={() => navigate(tab.path)}
          >
            <Icon size={22} aria-hidden="true" />
            <span style={styles.label}>{tab.label}</span>
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
    backgroundColor: theme.colors.bgNavbar,
    backdropFilter: "blur(10px)",
    borderTop: `1px solid ${theme.colors.border}`,
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    padding: "8px 0 12px",
    zIndex: theme.zIndex.fixed,
  },
  tab: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "4px",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "6px 16px",
    minHeight: "56px",
    minWidth: "64px",
    position: "relative",
    transition: theme.transitions.fast,
    fontFamily: "'Inter', sans-serif",
  },
  label: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.medium,
  },
  indicator: {
    position: "absolute",
    top: "-8px",
    left: "50%",
    transform: "translateX(-50%)",
    width: "20px",
    height: "3px",
    backgroundColor: theme.colors.accent,
    borderRadius: "2px",
  },
};
