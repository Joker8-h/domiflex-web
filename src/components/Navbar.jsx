import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaUserCircle, FaDoorOpen, FaKey, FaQuestionCircle, FaBell } from "react-icons/fa";
import Logo from "../pages/Imagenes/BANNER COMPLETO CON TRANSPARENCIA.png";
import { useAuth } from "../pages/context/AuthContext";
import { API_URL } from "../config";
import theme from "../styles/theme";
import Avatar from "./common/Avatar";

export default function NavbarCustom({ transparent }) {
  const { token, usuario, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [fotoPerfil, setFotoPerfil] = useState(null);

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
    <nav style={styles.navbar}>
      <div style={styles.container}>
        <div style={styles.left}>
          <Link to={token ? "/home" : "/"} style={styles.logoLink}>
            <img src={Logo} alt="DomiFlex" style={styles.logo} />
          </Link>

          {isHome && (
            <div style={styles.navLinks}>
              <a href="#como-funciona-seccion" style={styles.navLink}>
                <FaQuestionCircle size={14} /> ¿Cómo funciona?
              </a>
            </div>
          )}
        </div>

        <div style={styles.right}>
          {!token ? (
            <div style={styles.authButtons}>
              <Link to="/login" style={styles.iconBtn} title="Iniciar Sesión">
                <FaDoorOpen size={20} />
              </Link>
              <Link to="/register" style={styles.iconBtn} title="Registrarse">
                <FaKey size={18} />
              </Link>
            </div>
          ) : (
            <div style={styles.userSection}>
              <Link to="/notificaciones" style={styles.bellBtn}>
                <FaBell size={18} />
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
    gap: "24px",
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
    width: "40px",
    height: "40px",
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
    width: "36px",
    height: "36px",
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
