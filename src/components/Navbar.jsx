import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { CircleHelp, CircleUserRound, LogIn, Bell, Menu, User, Key } from "lucide-react";
import Logo from "/logo-domiflex.jpg";
import { useAuth } from "../pages/context/AuthContext";
import { API_URL } from "../config";
import theme from "../styles/theme";
import Avatar from "./common/Avatar";
import MobileDrawer from "./layout/MobileDrawer";
import { useIsMobile } from "../hooks/useMediaQuery";

export default function NavbarCustom({ transparent }) {
  const { token, usuario, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [fotoPerfil, setFotoPerfil] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const cargarFoto = async () => {
      if (!usuario?.idUsuarios || !token) return;
      try {
        const res = await fetch(`${API_URL}/auth/${usuario.idUsuarios}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setFotoPerfil(data.fotoPerfil || data.foto);
        }
      } catch (err) {
        console.error("Error al cargar foto:", err);
      }
    };
    cargarFoto();
  }, [usuario, token]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const isHome = location.pathname === "/";

  return (
    <nav style={styles.navbar} aria-label="Barra superior">
      <div style={styles.container}>
        <div style={styles.left}>
          {token && isMobile && (
            <button
              type="button"
              aria-label="Abrir menú"
              aria-expanded={drawerOpen}
              onClick={() => setDrawerOpen(true)}
              style={styles.menuBtn}
            >
              <Menu size={18} aria-hidden="true" />
            </button>
          )}
          <Link to={token ? "/home" : "/"} style={styles.logoLink} aria-label="DomiFlex inicio">
            <img src={Logo} alt="DomiFlex" style={styles.logo} />
          </Link>

          {isHome && (
            <div style={styles.navLinks}>
              <a href="#como-funciona-seccion" style={styles.navLink}>
                <CircleHelp size={14} /> ¿Cómo funciona?
              </a>
            </div>
          )}
        </div>

        <div style={styles.right}>
          {!token ? (
            <div style={styles.authButtons}>
              <Link to="/login" style={styles.iconBtn} title="Iniciar Sesión" aria-label="Iniciar sesión">
                <LogIn size={20} aria-hidden="true" />
              </Link>
              <Link to="/register" style={styles.iconBtn} title="Registrarse" aria-label="Registrarse">
                <Key size={18} aria-hidden="true" />
              </Link>
            </div>
          ) : (
            <div style={styles.userSection}>
              <Link to="/notificaciones" style={styles.bellBtn} aria-label="Notificaciones">
                <Bell size={18} aria-hidden="true" />
              </Link>
              <Link to="/perfil" style={styles.userBtn}>
                <Avatar
                  name={usuario?.nombre}
                  src={fotoPerfil || usuario?.fotoPerfil}
                  size={32}
                />
                <span style={styles.userName}>{usuario?.nombre?.split(" ")[0]}</span>
              </Link>
            </div>
          )}
        </div>
      </div>
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </nav>
  );
}

const styles = {
  navbar: {
    position: "sticky",
    top: 0,
    backgroundColor: theme.colors.bgNavbar,
    backdropFilter: "blur(10px)",
    borderBottom: `1px solid ${theme.colors.border}`,
    zIndex: theme.zIndex.sticky,
    padding: "8px 0",
  },
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0 16px",
  },
  left: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  menuBtn: {
    width: "44px",
    height: "44px",
    borderRadius: "50%",
    border: `1px solid ${theme.colors.border}`,
    backgroundColor: theme.colors.bgCard,
    color: theme.colors.textPrimary,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  logoLink: {
    display: "flex",
    alignItems: "center",
  },
  logo: {
    height: "40px",
    objectFit: "contain",
  },
  navLinks: {
    display: "flex",
    gap: "16px",
  },
  navLink: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    color: theme.colors.accent,
    textDecoration: "none",
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    transition: theme.transitions.fast,
  },
  right: {
    display: "flex",
    alignItems: "center",
  },
  authButtons: {
    display: "flex",
    gap: "12px",
  },
  iconBtn: {
    width: "44px",
    height: "44px",
    borderRadius: "50%",
    backgroundColor: theme.colors.accent,
    color: "#000",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textDecoration: "none",
    transition: theme.transitions.fast,
  },
  userSection: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  bellBtn: {
    width: "44px",
    height: "44px",
    borderRadius: "50%",
    backgroundColor: theme.colors.bgCard,
    color: theme.colors.textPrimary,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textDecoration: "none",
    border: `1px solid ${theme.colors.border}`,
    transition: theme.transitions.fast,
  },
  userBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    textDecoration: "none",
    color: theme.colors.textPrimary,
    padding: "4px 12px 4px 4px",
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.bgCard,
    border: `1px solid ${theme.colors.border}`,
    transition: theme.transitions.fast,
  },
  userName: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
  },
};
