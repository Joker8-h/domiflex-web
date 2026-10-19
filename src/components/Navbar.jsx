import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Search, ShoppingCart, Bell, Menu } from "lucide-react";
import RapitipicaLogo from "./common/RapitipicaLogo";
import { useAuth } from "../pages/context/AuthContext";
import { API_URL } from "../config";
import Avatar from "./common/Avatar";
import MobileDrawer from "./layout/MobileDrawer";
import { useIsMobile } from "../hooks/useMediaQuery";
import { loadCart } from "../lib/cartStorage";

export default function NavbarCustom() {
  const { token, usuario } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [fotoPerfil, setFotoPerfil] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [cartCount, setCartCount] = useState(0);

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
    const interval = setInterval(updateCartCount, 1200);
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

  const fullPath = location.pathname + location.search;
  const isLinkActive = (target) => {
    if (target === "/") return location.pathname === "/";
    if (target === "/restaurantes") return location.pathname === "/restaurantes" && !location.search;
    return fullPath.toLowerCase() === target.toLowerCase();
  };

  return (
    <nav style={styles.navbar} aria-label="Barra superior">
      <div style={styles.container}>
        {/* Izquierda: Menú móvil + Logo Rapitipica + Enlaces del Boceto */}
        <div style={styles.left}>
          {isMobile && (
            <button
              type="button"
              aria-label="Abrir menú"
              aria-expanded={drawerOpen}
              onClick={() => setDrawerOpen(true)}
              style={styles.menuBtn}
            >
              <Menu size={20} aria-hidden="true" color="#FFFFFF" />
            </button>
          )}

          <RapitipicaLogo size={isMobile ? "sm" : "md"} showTagline={false} to="/" />

          {!isMobile && (
            <div style={styles.navLinks}>
              <Link
                to="/"
                style={{
                  ...styles.navLink,
                  color: isLinkActive("/") ? "#E30613" : "#FFFFFF",
                  fontWeight: isLinkActive("/") ? 700 : 500,
                }}
              >
                Inicio
              </Link>
              <Link
                to="/restaurantes"
                style={{
                  ...styles.navLink,
                  color: isLinkActive("/restaurantes") ? "#E30613" : "#FFFFFF",
                  fontWeight: isLinkActive("/restaurantes") ? 700 : 500,
                }}
              >
                Restaurantes
              </Link>
              <Link
                to="/restaurantes?cat=supermercados"
                style={{
                  ...styles.navLink,
                  color: isLinkActive("/restaurantes?cat=supermercados") ? "#E30613" : "#FFFFFF",
                  fontWeight: isLinkActive("/restaurantes?cat=supermercados") ? 700 : 500,
                }}
              >
                Supermercados
              </Link>
              <Link
                to="/restaurantes?cat=licores"
                style={{
                  ...styles.navLink,
                  color: isLinkActive("/restaurantes?cat=licores") ? "#E30613" : "#FFFFFF",
                  fontWeight: isLinkActive("/restaurantes?cat=licores") ? 700 : 500,
                }}
              >
                Licores
              </Link>
              <Link
                to="/restaurantes?cat=ofertas"
                style={{
                  ...styles.navLink,
                  color: isLinkActive("/restaurantes?cat=ofertas") ? "#E30613" : "#FFFFFF",
                  fontWeight: isLinkActive("/restaurantes?cat=ofertas") ? 700 : 500,
                }}
              >
                Ofertas
              </Link>
            </div>
          )}
        </div>

        {/* Centro-Derecha: Buscador blanco redondeado "¿Qué se te antoja hoy?" como en el boceto */}
        {!isMobile && (
          <form onSubmit={handleSearchSubmit} style={styles.searchForm}>
            <input
              type="text"
              placeholder="¿Qué se te antoja hoy?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
              aria-label="Buscar restaurantes o comidas"
            />
            <button type="submit" style={styles.searchBtn} aria-label="Buscar">
              <Search size={17} color="#11141A" strokeWidth={2.5} />
            </button>
          </form>
        )}

        {/* Derecha: Carrito con badge rojo + Iniciar sesión / Registrarse */}
        <div style={styles.right}>
          <Link to="/carrito" style={styles.cartBtn} aria-label={`Carrito con ${cartCount} productos`}>
            <ShoppingCart size={21} color="#FFFFFF" />
            <span style={styles.cartBadge}>{cartCount > 99 ? "99+" : cartCount}</span>
          </Link>

          {!token ? (
            <div style={styles.authLinks}>
              <Link to="/login" style={styles.authLinkText}>
                Iniciar sesión
              </Link>
              <span style={{ color: "#6B7280", fontSize: "13px" }}>/</span>
              <Link to="/register" style={styles.authLinkText}>
                Registrarse
              </Link>
            </div>
          ) : (
            <div style={styles.userSection}>
              <Link to="/notificaciones" style={styles.iconBtn} aria-label="Notificaciones" title="Notificaciones">
                <Bell size={18} color="#FFFFFF" aria-hidden="true" />
              </Link>

              <Link to="/profile" style={styles.userBtn} aria-label="Mi perfil">
                <Avatar
                  name={usuario?.nombre}
                  src={fotoPerfil || usuario?.fotoPerfil}
                  size={30}
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
    backgroundColor: "#0D1117",
    borderBottom: "1px solid #1F2937",
    zIndex: 300,
    padding: "12px 0",
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
    gap: "28px",
  },
  menuBtn: {
    width: "38px",
    height: "38px",
    borderRadius: "10px",
    border: "1px solid #374151",
    backgroundColor: "#161B22",
    color: "#FFFFFF",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  navLinks: {
    display: "flex",
    alignItems: "center",
    gap: "22px",
  },
  navLink: {
    color: "#FFFFFF",
    textDecoration: "none",
    fontSize: "14px",
    transition: "color 0.15s ease",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  searchForm: {
    position: "relative",
    flex: "1",
    maxWidth: "310px",
    marginLeft: "auto",
  },
  searchInput: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    color: "#11141A",
    border: "none",
    borderRadius: "9999px",
    padding: "9px 40px 9px 18px",
    fontSize: "13px",
    fontWeight: 500,
    outline: "none",
    boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
  },
  searchBtn: {
    position: "absolute",
    right: "10px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "4px",
  },
  right: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  cartBtn: {
    position: "relative",
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    backgroundColor: "transparent",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textDecoration: "none",
  },
  cartBadge: {
    position: "absolute",
    top: "0px",
    right: "0px",
    backgroundColor: "#E30613",
    color: "#FFFFFF",
    fontSize: "10px",
    fontWeight: "800",
    borderRadius: "9999px",
    padding: "1px 5px",
    minWidth: "18px",
    textAlign: "center",
    lineHeight: 1.3,
    border: "2px solid #0D1117",
  },
  authLinks: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    whiteSpace: "nowrap",
  },
  authLinkText: {
    color: "#FFFFFF",
    textDecoration: "none",
    fontSize: "13px",
    fontWeight: 600,
    transition: "color 0.15s ease",
  },
  userSection: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  iconBtn: {
    width: "38px",
    height: "38px",
    borderRadius: "50%",
    backgroundColor: "#161B22",
    border: "1px solid #30363D",
    color: "#FFFFFF",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textDecoration: "none",
  },
  userBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    textDecoration: "none",
    color: "#FFFFFF",
    padding: "4px 12px 4px 4px",
    borderRadius: "9999px",
    backgroundColor: "#161B22",
    border: "1px solid #30363D",
  },
  userName: {
    fontSize: "13px",
    fontWeight: 600,
  },
};
