import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Zap,
  Shield,
  Smile,
  Star,
  Heart,
  UtensilsCrossed,
  ShoppingCart,
  Wine,
  CakeSlice,
  CupSoda,
  MoreHorizontal,
  Bike,
} from "lucide-react";
import RapitipicaLogo from "../components/common/RapitipicaLogo";
import NavbarCustom from "../components/Navbar";
import toast from "react-hot-toast";

const U = "https://images.unsplash.com";
const Q = "?auto=format&fit=crop&w=800&q=80";

// Las 6 categorías exactas del boceto con su orden y colores (Rojo, Verde, Negro)
const categories = [
  {
    id: "restaurantes",
    name: "Restaurantes",
    icon: UtensilsCrossed,
    bg: "#E30613", // Rojo
    path: "/restaurantes?cat=restaurantes",
  },
  {
    id: "supermercados",
    name: "Supermercados",
    icon: ShoppingCart,
    bg: "#16A34A", // Verde
    path: "/restaurantes?cat=supermercados",
  },
  {
    id: "licores",
    name: "Licores",
    icon: Wine,
    bg: "#11141A", // Negro
    path: "/restaurantes?cat=licores",
  },
  {
    id: "dulces",
    name: "Dulces",
    icon: CakeSlice,
    bg: "#E30613", // Rojo
    path: "/restaurantes?cat=dulces",
  },
  {
    id: "bebidas",
    name: "Bebidas",
    icon: CupSoda,
    bg: "#16A34A", // Verde
    path: "/restaurantes?cat=bebidas",
  },
  {
    id: "mas",
    name: "Más",
    icon: MoreHorizontal,
    bg: "#11141A", // Negro
    path: "/restaurantes",
  },
];

// Restaurantes destacados exactos del boceto
const restaurantesDestacados = [
  {
    id: 1,
    nombre: "Burger House",
    categoria: "Hamburguesas",
    rating: 4.7,
    reviews: "942",
    tiempo: "25 min",
    precio: "$19.900",
    img: `${U}/photo-1568901346375-23c9450c58cd${Q}`,
    tag: "Destacado",
  },
  {
    id: 4,
    nombre: "Pizzería La Italiana",
    categoria: "Italiana",
    rating: 4.8,
    reviews: "1.2k",
    tiempo: "30 min",
    precio: "$15.900",
    img: `${U}/photo-1513104890138-7c749659a591${Q}`,
    tag: "Popular",
  },
  {
    id: 2,
    nombre: "Sushi Express",
    categoria: "Japonesa",
    rating: 4.6,
    reviews: "586",
    tiempo: "35 min",
    precio: "$24.000",
    img: `${U}/photo-1579871494447-9811cf80d66c${Q}`,
    tag: "Top Calidad",
  },
  {
    id: 5,
    nombre: "Tacos El Mexa",
    categoria: "Mexicana",
    rating: 4.5,
    reviews: "826",
    tiempo: "40 min",
    precio: "$18.500",
    img: `${U}/photo-1565299585323-38d6b0865b47${Q}`,
    tag: "Tradicional",
  },
];

export default function Landing() {
  const navigate = useNavigate();
  const [favoritos, setFavoritos] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("domiflex_favoritos") || "[]");
      return Array.isArray(saved) ? saved.reduce((acc, id) => ({ ...acc, [String(id)]: true }), {}) : {};
    } catch {
      return {};
    }
  });

  const toggleFavorito = (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    const key = String(id);
    setFavoritos((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      try {
        const list = Object.keys(next).filter((k) => next[k]);
        localStorage.setItem("domiflex_favoritos", JSON.stringify(list));
        window.dispatchEvent(new Event("domiflex_favoritos_changed"));
      } catch {
        // ignore storage error
      }
      return next;
    });
  };

  return (
    <div style={styles.page}>
      <NavbarCustom />

      {/* 1. HERO BANNER (Fondo Negro con brochazos Rojos + Pincelada Verde "a un clic" + Hamburguesa con papas) */}
      <section style={styles.heroSection}>
        {/* Trazos diagonales rojos de fondo estilo boceto */}
        <div style={styles.redBrushBg} aria-hidden="true" />

        <div style={styles.heroContainer}>
          {/* Columna Izquierda: Título + Pincelada Verde + Rapitipica + Botón Rojo "Ordena ahora" */}
          <div style={styles.heroLeft}>
            <h1 style={styles.heroHeading}>
              <span style={styles.heroLineWhite}>Tu comida favorita</span>
              <span style={styles.greenBrushBanner}>a un clic</span>
            </h1>

            <div style={styles.brandSignature}>Rapitipica</div>

            <div style={styles.ctaWrap}>
              <button
                type="button"
                onClick={() => navigate("/restaurantes")}
                style={styles.ordenaAhoraBtn}
                className="df-press"
              >
                Ordena ahora
              </button>
            </div>
          </div>

          {/* Columna Derecha: Hamburguesa doble con queso y papas fritas sobre trazos rojos */}
          <div style={styles.heroRight}>
            <div style={styles.heroImageWrapper}>
              <div style={styles.redSplashBehindBurger} aria-hidden="true" />
              <img
                src="https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1100&q=85"
                alt="Hamburguesa doble con queso y papas fritas Rapitipica"
                style={styles.heroImage}
                loading="eager"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. BARRA DE 6 CÍRCULOS DE CATEGORÍAS SOBRE FONDO BLANCO */}
      <section id="categorias" style={styles.categoriesSection}>
        <div style={styles.categoriesContainer}>
          <div style={styles.categoriesRow}>
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => navigate(cat.path)}
                  style={styles.categoryItemBtn}
                  className="df-press"
                >
                  <div style={{ ...styles.categoryCircle, backgroundColor: cat.bg }}>
                    <Icon size={28} color="#FFFFFF" strokeWidth={2} />
                  </div>
                  <span style={styles.categoryLabel}>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. RESTAURANTES DESTACADOS (Tarjetas blancas limpias en fila de 4 como en el boceto) */}
      <section style={styles.featuredSection}>
        <div style={styles.featuredContainer}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Restaurantes destacados</h2>
            <Link to="/restaurantes" style={styles.viewAllLink}>
              <span>Ver todos</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          <div style={styles.restaurantsGrid}>
            {restaurantesDestacados.map((res) => (
              <div
                key={res.id}
                onClick={() => navigate(`/negocio/${res.id}`)}
                style={styles.resCard}
                className="df-lift"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && navigate(`/negocio/${res.id}`)}
              >
                <div style={styles.resImageWrap}>
                  <img src={res.img} alt={res.nombre} style={styles.resImage} loading="lazy" />
                  <button
                    type="button"
                    onClick={(e) => toggleFavorito(res.id, e)}
                    style={styles.resFavBtn}
                    aria-label="Agregar a favoritos"
                  >
                    <Heart
                      size={16}
                      color={favoritos[res.id] ? "#E30613" : "#11141A"}
                      fill={favoritos[res.id] ? "#E30613" : "none"}
                    />
                  </button>
                  <div style={styles.scooterBadge}>
                    <Bike size={14} color="#FFFFFF" />
                  </div>
                </div>

                <div style={styles.resContent}>
                  <h3 style={styles.resTitle}>{res.nombre}</h3>
                  <p style={styles.resSubtitle}>
                    {res.categoria} • {res.tiempo}
                  </p>
                  <div style={styles.resRatingRow}>
                    <Star size={14} color="#F59E0B" fill="#F59E0B" />
                    <span style={styles.resRatingNum}>{res.rating}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. SELLO DE MARCA: ¡RAPITÍPICA: RÁPIDO, SEGURO Y DELICIOSO! */}
      <section style={styles.pillarsSection}>
        <div style={styles.pillarsContainer}>
          <div style={styles.pillarItem}>
            <div style={{ ...styles.pillarIcon, backgroundColor: "rgba(227, 6, 19, 0.1)" }}>
              <Zap size={26} color="#E30613" />
            </div>
            <h4 style={styles.pillarTitle}>Rápido</h4>
            <p style={styles.pillarText}>Ruta optimizada con IA para entregas en minutos.</p>
          </div>

          <div style={styles.pillarItem}>
            <div style={{ ...styles.pillarIcon, backgroundColor: "rgba(22, 163, 74, 0.12)" }}>
              <Shield size={26} color="#16A34A" />
            </div>
            <h4 style={styles.pillarTitle}>Seguro</h4>
            <p style={styles.pillarText}>Repartidores verificados y seguimiento en vivo.</p>
          </div>

          <div style={styles.pillarItem}>
            <div style={{ ...styles.pillarIcon, backgroundColor: "rgba(17, 20, 26, 0.08)" }}>
              <Smile size={26} color="#11141A" />
            </div>
            <h4 style={styles.pillarTitle}>Delicioso</h4>
            <p style={styles.pillarText}>¡Lo que quieres, en un clic directo a tu puerta!</p>
          </div>
        </div>
      </section>

      {/* 5. FOOTER OFICIAL EN NEGRO */}
      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <div style={styles.footerColMain}>
            <RapitipicaLogo size="md" showTagline={true} to="/" />
            <p style={styles.footerTagline}>
              Rapitipica es tu plataforma de domicilios rápida, segura y deliciosa. Pide de tus restaurantes, supermercados y tiendas favoritas en un clic.
            </p>
          </div>

          <div style={styles.footerCol}>
            <h5 style={styles.footerHeading}>Descubrir</h5>
            <Link to="/restaurantes" style={styles.footerLink}>Restaurantes</Link>
            <Link to="/restaurantes?cat=supermercados" style={styles.footerLink}>Supermercados</Link>
            <Link to="/restaurantes?cat=licores" style={styles.footerLink}>Licores</Link>
            <Link to="/restaurantes?cat=dulces" style={styles.footerLink}>Dulces y Bebidas</Link>
          </div>

          <div style={styles.footerCol}>
            <h5 style={styles.footerHeading}>Cuenta</h5>
            <Link to="/login" style={styles.footerLink}>Iniciar sesión</Link>
            <Link to="/register" style={styles.footerLink}>Registrarse</Link>
            <Link to="/profile" style={styles.footerLink}>Mi cuenta</Link>
            <Link to="/mis-pedidos" style={styles.footerLink}>Mis pedidos</Link>
          </div>

          <div style={styles.footerCol}>
            <h5 style={styles.footerHeading}>Socios</h5>
            <Link to="/register" style={styles.footerLink}>Registra tu restaurante</Link>
            <Link to="/register" style={styles.footerLink}>Únete como repartidor</Link>
            <a
              href="#categorias"
              onClick={(e) => {
                e.preventDefault();
                toast("Soporte 24/7 disponible en soporte@rapitipica.com o vía chat en tus pedidos activos.", { icon: "💬" });
              }}
              style={styles.footerLink}
            >
              Centro de ayuda
            </a>
          </div>
        </div>

        <div style={styles.footerBottom}>
          <p>© 2026 Rapitipica — ¡Rápido, seguro y delicioso!</p>
        </div>
      </footer>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#FFFFFF",
    color: "#11141A",
    fontFamily: "'Montserrat', sans-serif",
  },
  heroSection: {
    position: "relative",
    backgroundColor: "#0D1117",
    overflow: "hidden",
    padding: "clamp(32px, 5vw, 56px) 20px",
  },
  redBrushBg: {
    position: "absolute",
    inset: 0,
    background:
      "radial-gradient(circle at 72% 50%, rgba(227, 6, 19, 0.42) 0%, rgba(185, 5, 15, 0.18) 38%, transparent 70%), linear-gradient(125deg, #0D1117 35%, rgba(227, 6, 19, 0.28) 65%, #0D1117 95%)",
    pointerEvents: "none",
  },
  heroContainer: {
    position: "relative",
    zIndex: 2,
    maxWidth: "1200px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "36px",
    alignItems: "center",
  },
  heroLeft: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "12px",
  },
  heroHeading: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "6px",
    margin: 0,
  },
  heroLineWhite: {
    fontSize: "clamp(30px, 4.5vw, 48px)",
    fontWeight: 900,
    fontStyle: "italic",
    color: "#FFFFFF",
    lineHeight: 1.08,
    letterSpacing: "-0.5px",
    textShadow: "0 4px 16px rgba(0, 0, 0, 0.5)",
  },
  greenBrushBanner: {
    display: "inline-block",
    backgroundColor: "#15803D",
    backgroundImage: "linear-gradient(95deg, #16A34A 0%, #15803D 100%)",
    color: "#FFFFFF",
    fontSize: "clamp(32px, 4.8vw, 50px)",
    fontWeight: 900,
    fontStyle: "italic",
    padding: "4px 28px 6px 18px",
    borderRadius: "10px 26px 8px 22px",
    transform: "rotate(-2deg)",
    boxShadow: "0 6px 20px rgba(21, 128, 61, 0.45)",
    lineHeight: 1.05,
  },
  brandSignature: {
    fontSize: "clamp(22px, 3vw, 32px)",
    fontWeight: 900,
    fontStyle: "italic",
    color: "#E30613",
    marginTop: "6px",
    marginLeft: "12px",
    letterSpacing: "-0.5px",
    textShadow: "0 2px 10px rgba(227, 6, 19, 0.35)",
  },
  ctaWrap: {
    marginTop: "14px",
  },
  ordenaAhoraBtn: {
    backgroundColor: "#E30613",
    color: "#FFFFFF",
    fontWeight: 800,
    fontSize: "16px",
    border: "none",
    borderRadius: "9999px",
    padding: "13px 34px",
    cursor: "pointer",
    boxShadow: "0 8px 22px rgba(227, 6, 19, 0.45)",
    transition: "all 0.2s ease",
  },
  heroRight: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  heroImageWrapper: {
    position: "relative",
    width: "100%",
    maxWidth: "520px",
    borderRadius: "24px",
    overflow: "hidden",
    boxShadow: "0 18px 40px rgba(0, 0, 0, 0.6)",
    border: "2px solid rgba(227, 6, 19, 0.35)",
  },
  redSplashBehindBurger: {
    position: "absolute",
    inset: 0,
    background: "linear-gradient(135deg, rgba(227,6,19,0.25) 0%, transparent 60%)",
    pointerEvents: "none",
  },
  heroImage: {
    width: "100%",
    height: "310px",
    objectFit: "cover",
    display: "block",
  },
  categoriesSection: {
    backgroundColor: "#FFFFFF",
    padding: "36px 20px 28px",
    borderBottom: "1px solid #F1F5F9",
  },
  categoriesContainer: {
    maxWidth: "1000px",
    margin: "0 auto",
  },
  categoriesRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
    gap: "20px",
    justifyItems: "center",
  },
  categoryItemBtn: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: "6px",
  },
  categoryCircle: {
    width: "68px",
    height: "68px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 6px 16px rgba(0, 0, 0, 0.14)",
    transition: "transform 0.2s ease",
  },
  categoryLabel: {
    fontSize: "13px",
    fontWeight: 700,
    color: "#11141A",
    textAlign: "center",
  },
  featuredSection: {
    backgroundColor: "#F8F9FA",
    padding: "36px 20px 56px",
  },
  featuredContainer: {
    maxWidth: "1200px",
    margin: "0 auto",
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "22px",
    gap: "12px",
  },
  sectionTitle: {
    fontSize: "22px",
    fontWeight: 800,
    color: "#11141A",
    margin: 0,
  },
  viewAllLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    color: "#11141A",
    fontWeight: 700,
    fontSize: "14px",
    textDecoration: "none",
  },
  restaurantsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
    gap: "22px",
  },
  resCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: "16px",
    border: "1px solid #E5E7EB",
    overflow: "hidden",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
    transition: "all 0.2s ease",
  },
  resImageWrap: {
    position: "relative",
    width: "100%",
    height: "155px",
    overflow: "hidden",
    backgroundColor: "#11141A",
  },
  resImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  resFavBtn: {
    position: "absolute",
    top: "10px",
    right: "10px",
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    backgroundColor: "rgba(255, 255, 255, 0.92)",
    border: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    boxShadow: "0 2px 6px rgba(0,0,0,0.18)",
  },
  scooterBadge: {
    position: "absolute",
    bottom: "10px",
    right: "10px",
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    backgroundColor: "#E30613",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 2px 6px rgba(227, 6, 19, 0.45)",
  },
  resContent: {
    padding: "14px 16px",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  resTitle: {
    fontSize: "16px",
    fontWeight: 800,
    color: "#11141A",
    margin: 0,
  },
  resSubtitle: {
    fontSize: "13px",
    color: "#6B7280",
    margin: 0,
    fontWeight: 500,
  },
  resRatingRow: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    marginTop: "4px",
  },
  resRatingNum: {
    fontSize: "13px",
    fontWeight: 700,
    color: "#11141A",
  },
  pillarsSection: {
    backgroundColor: "#FFFFFF",
    borderTop: "1px solid #E5E7EB",
    padding: "44px 20px",
  },
  pillarsContainer: {
    maxWidth: "1100px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "28px",
    textAlign: "center",
  },
  pillarItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px",
  },
  pillarIcon: {
    width: "56px",
    height: "56px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  pillarTitle: {
    fontSize: "18px",
    fontWeight: 800,
    color: "#11141A",
    margin: 0,
  },
  pillarText: {
    fontSize: "14px",
    color: "#6B7280",
    margin: 0,
    maxWidth: "260px",
    lineHeight: 1.5,
  },
  footer: {
    backgroundColor: "#0D1117",
    color: "#FFFFFF",
    padding: "48px 20px 24px",
  },
  footerContent: {
    maxWidth: "1200px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "36px",
    paddingBottom: "36px",
    borderBottom: "1px solid #1F2937",
  },
  footerColMain: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  footerTagline: {
    fontSize: "13px",
    color: "#9CA3AF",
    lineHeight: 1.6,
    margin: 0,
  },
  footerCol: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  footerHeading: {
    fontSize: "14px",
    fontWeight: 800,
    color: "#FFFFFF",
    margin: "0 0 4px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  footerLink: {
    color: "#9CA3AF",
    textDecoration: "none",
    fontSize: "13px",
    transition: "color 0.15s ease",
  },
  footerBottom: {
    maxWidth: "1200px",
    margin: "20px auto 0",
    textAlign: "center",
    fontSize: "12px",
    color: "#6B7280",
  },
};
