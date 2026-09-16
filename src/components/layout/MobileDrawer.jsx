import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaHome, FaSearch, FaClipboardList, FaUser, FaBell, FaTimes } from "react-icons/fa";
import theme from "../../styles/theme";

const LINKS = [
  { to: "/home", label: "Inicio", Icon: FaHome },
  { to: "/restaurantes", label: "Explorar", Icon: FaSearch },
  { to: "/mis-pedidos", label: "Mis pedidos", Icon: FaClipboardList },
  { to: "/notificaciones", label: "Notificaciones", Icon: FaBell },
  { to: "/perfil", label: "Perfil", Icon: FaUser },
];

// Drawer lateral móvil con focus-trap básico y cierre con ESC.
export default function MobileDrawer({ open, onClose }) {
  const location = useLocation();

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: theme.colors.overlay,
        zIndex: theme.zIndex.modalBackdrop,
      }}
    >
      <nav
        aria-label="Menú principal"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          width: "min(300px, 85vw)",
          backgroundColor: theme.colors.bgSecondary,
          borderRight: `1px solid ${theme.colors.border}`,
          padding: "20px 16px",
          display: "flex",
          flexDirection: "column",
          gap: "4px",
          overflowY: "auto",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
          <span style={{ fontSize: theme.fontSize.lg, fontWeight: theme.fontWeight.bold }}>
            Domi<span style={{ color: theme.colors.accent }}>Flex</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar menú"
            style={{
              minWidth: "44px",
              minHeight: "44px",
              borderRadius: "50%",
              border: `1px solid ${theme.colors.border}`,
              background: "transparent",
              color: theme.colors.textPrimary,
              cursor: "pointer",
            }}
          >
            <FaTimes size={16} aria-hidden="true" />
          </button>
        </div>
        {LINKS.map(({ to, label, Icon }) => {
          const active = location.pathname === to || location.pathname.startsWith(to + "/");
          return (
            <Link
              key={to}
              to={to}
              onClick={onClose}
              aria-current={active ? "page" : undefined}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                minHeight: "52px",
                padding: "0 16px",
                borderRadius: theme.borderRadius.md,
                textDecoration: "none",
                fontSize: theme.fontSize.md,
                fontWeight: active ? theme.fontWeight.semibold : theme.fontWeight.normal,
                color: active ? theme.colors.accent : theme.colors.textPrimary,
                backgroundColor: active ? `${theme.colors.accent}14` : "transparent",
              }}
            >
              <Icon size={20} aria-hidden="true" />
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
