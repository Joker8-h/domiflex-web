import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Search, ShoppingBag, Bell, Menu, User, LogIn, Heart } from "lucide-react";
import RapitipicaLogo from "./common/RapitipicaLogo";
import { useAuth } from "../pages/context/AuthContext";
import { API_URL } from "../config";
import theme from "../styles/theme";
import Avatar from "./common/Avatar";
import MobileDrawer from "./layout/MobileDrawer";
import { useIsMobile } from "../hooks/useMediaQuery";
import { loadCart } from "../lib/cartStorage";

export default function NavbarCustom({ transparent }) {
  const { token, usuario, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [fotoPerfil, setFotoPerfil] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [cartCount, setCartCount] = useState(0);

  // Cargar items del carrito
  const updateCartCount = () => {
    try {
      const { cart } = loadCart();
      const count = (cart || []).reduce((acc, item) => acc + (Number(item.cantidad) || 1), 0);
      setCartCount(count);
    } catch {
      setCartCount(0);
    }
  };

  useEffect(() => {
    updateCartCount();
    window.addEventListener("storage", updateCartCount);
    // Intervalo suave para sincronizar carrito entre pestañas y componentes
    const interval = setInterval(updateCartCount, 1500);
    return () => {
      window.removeEventListener("storage", updateCartCount);
      clearInterval(interval);
    };
  }, []);

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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/restaurantes?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate("/restaurantes");
    }
  };

  const isActiveLink = (path) => location.pathname === path;

  return (
    <nav style={styles.navbar} aria-label="Barra superior">
      <div style={styles.container}>
        {/* Izquierda: Drawer móvil + Logo Rapitipica */}
        <div style={styles.left}>
          {isMobile && (
            <button
              type="button"
              aria-label="Abrir menú"
              aria-expanded={drawerOpen}
              onClick={() => setDrawerOpen(true)}
              style={styles.menuBtn}
            >
              <Menu size={20} aria-hidden="true" color="#F5F7FA" />
            </button>
          )}

          <RapitipicaLogo size={isMobile ? "sm" : "md"} showTagline={!isMobile} to="/" />

          {/* Enlaces de navegación desktop */}
          {!isMobile && (
            <div style={styles.navLinks}>
              <Link
                to="/"
                style={{
                  ...styles.navLink,
                  color: isActiveLink("/") ? theme.colors.accent : theme.colors.textPrimary,
                  fontWeight: isActiveLink("/") ? 700 : 500,
                }}
              >
                Inicio
              </Link>
              <Link
                to="/restaurantes"
                style={{
                  ...styles.navLink,
                  color: isActiveLink("/restaurantes") ? theme.colors.accent : theme.colors.textPrimary,
                  fontWeight: isActiveLink("/restaurantes") ? 700 : 500,
                }}
              >
                Restaurantes
              </Link>
              <a
                href="#categorias"
                onClick={(e) => {
                  if (location.pathname !== "/") {
                    e.preventDefault();
                    navigate("/#categorias");
                  }
                }}
                style={styles.navLink}
              >
                Categorías
              </a>
              <Link
                to="/restaurantes?filter=ofertas"
                style={styles.navLink}
              >
                Ofertas
              </Link>
            </div>
          )}
        </div>

        {/* Centro: Buscador "¿Qué se te antoja hoy?" (Desktop/Tablet) */}
        {!isMobile && (
          <form onSubmit={handleSearchSubmit} style={styles.searchForm}>
            <Search size={18} color="#9CA3AF" style={styles.searchIcon} aria-hidden="true" />
            <input
              type="text"
              placeholder="¿Qué se te antoja hoy?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
              aria-label="Buscar restaurantes o comidas"
            />
          </form>
        )}

        {/* Derecha: Carrito + Notificaciones + Perfil / Iniciar Sesión */}
        <div style={styles.right}>
          {/* Botón Carrito */}
          <Link to="/carrito" style={styles.cartBtn} aria-label={`Carrito de compras con ${cartCount} productos`}>
            <ShoppingBag size={20} color="#F5F7FA" />
            {cartCount > 0 && (
              <span style={styles.cartBadge}>{cartCount > 99 ? "99+" : cartCount}</span>
            )}
          </Link>

          {!token ? (
            <Link to="/login" style={styles.loginBtn}>
              <LogIn size={16} aria-hidden="true" />
              <span>Iniciar sesión</span>
            </Link>
          ) : (
            <div style={styles.userSection}>
              <Link to="/notificaciones" style={styles.iconBtn} aria-label="Notificaciones" title="Notificaciones">
                <Bell size={19} color="#F5F7FA" aria-hidden="true" />
              </Link>

              <Link to="/perfil" style={styles.userBtn} aria-label="Mi perfil">
                <Avatar
                  name={usuario?.nombre}
                  src={fotoPerfil || usuario?.fotoPerfil}
                  size={32}
                />
                {!isMobile && (
                  <span style={styles.userName}>{usuario?.nombre?.split(" ")[0]}</span>
                )}
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
    backgroundColor: "rgba(11, 31, 68, 0.94)",
    backdropFilter: "blur(14px)",
    WebkitBackdropFilter: "blur(14px)",
    borderBottom: "1px solid #1D3B72",
    zIndex: 300,
    padding: "10px 0",
    transition: "background-color 0.2s ease",
  },
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    maxWidth: "1280px",
    margin: "0 auto",
    padding: "0 20px",
    gap: "16px",
  },
  left: {
    display: "flex",
    alignItems: "center",
    gap: "24px",
  },
  menuBtn: {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    border: "1px solid #1D3B72",
    backgroundColor: "#11254E",
    color: "#F5F7FA",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  navLinks: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
  },
  navLink: {
    color: "#F5F7FA",
    textDecoration: "none",
    fontSize: "14px",
    transition: "color 0.15s ease",
    cursor: "pointer",
  },
  searchForm: {
    position: "relative",
    flex: "1",
    maxWidth: "420px",
    margin: "0 12px",
  },
  searchIcon: {
    position: "absolute",
    left: "14px",
    top: "50%",
    transform: "translateY(-50%)",
    pointerEvents: "none",
  },
  searchInput: {
    width: "100%",
    backgroundColor: "#081836",
    color: "#F5F7FA",
    border: "1px solid #1D3B72",
    borderRadius: "9999px",
    padding: "9px 18px 9px 42px",
    fontSize: "14px",
    outline: "none",
    transition: "all 0.2s ease",
    boxShadow: "inset 0 1px 3px rgba(0,0,0,0.3)",
  },
  right: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },
  cartBtn: {
    position: "relative",
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    backgroundColor: "#11254E",
    border: "1px solid #1D3B72",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textDecoration: "none",
    transition: "all 0.2s ease",
  },
  cartBadge: {
    position: "absolute",
    top: "-3px",
    right: "-3px",
    backgroundColor: "#00E576",
    color: "#0B1F44",
    fontSize: "11px",
    fontWeight: "800",
    borderRadius: "9999px",
    padding: "2px 6px",
    lineHeight: 1.2,
    border: "2px solid #0B1F44",
  },
  loginBtn: {
    backgroundColor: "#00E576",
    color: "#0B1F44",
    fontWeight: 700,
    fontSize: "14px",
    borderRadius: "9999px",
    padding: "8px 20px",
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    textDecoration: "none",
    transition: "all 0.2s ease",
    boxShadow: "0 4px 14px rgba(0, 229, 118, 0.3)",
  },
  userSection: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  iconBtn: {
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    backgroundColor: "#11254E",
    border: "1px solid #1D3B72",
    color: "#F5F7FA",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textDecoration: "none",
    transition: "all 0.2s ease",
  },
  userBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    textDecoration: "none",
    color: "#F5F7FA",
    padding: "4px 12px 4px 4px",
    borderRadius: "9999px",
    backgroundColor: "#11254E",
    border: "1px solid #1D3B72",
    transition: "all 0.2s ease",
  },
  userName: {
    fontSize: "13px",
    fontWeight: 600,
  },
};
