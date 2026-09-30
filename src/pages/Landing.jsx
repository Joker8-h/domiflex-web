import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  MapPin,
  Search,
  ArrowRight,
  Zap,
  Shield,
  Smile,
  Star,
  Clock,
  Heart,
  ChevronRight,
  UtensilsCrossed,
  Store,
  ShoppingCart,
  Wine,
  Pill,
  Dog,
} from "lucide-react";
import RapitipicaLogo from "../components/common/RapitipicaLogo";
import theme from "../styles/theme";

const U = "https://images.unsplash.com";
const Q = "?auto=format&fit=crop&w=800&q=80";

const categories = [
  {
    id: "restaurantes",
    name: "Restaurantes",
    desc: "Comida típica, platos, etc.",
    icon: UtensilsCrossed,
    color: "#FF6B4A",
    path: "/restaurantes?cat=Restaurantes",
  },
  {
    id: "tiendas",
    name: "Tiendas",
    desc: "Abarrotes, snacks, etc.",
    icon: Store,
    color: "#10B981",
    path: "/restaurantes?cat=Tiendas",
  },
  {
    id: "supermercados",
    name: "Supermercados",
    desc: "Mercado, frutas, verduras, etc.",
    icon: ShoppingCart,
    color: "#3B82F6",
    path: "/restaurantes?cat=Supermercados",
  },
  {
    id: "bebidas",
    name: "Bebidas",
    desc: "Refrescos, jugos, cervezas, etc.",
    icon: Wine,
    color: "#8B5CF6",
    path: "/restaurantes?cat=Bebidas",
  },
  {
    id: "farmacias",
    name: "Farmacias",
    desc: "Medicamentos, cuidado personal, etc.",
    icon: Pill,
    color: "#06B6D4",
    path: "/restaurantes?cat=Farmacias",
  },
  {
    id: "mascotas",
    name: "Mascotas",
    desc: "Alimento, accesorios, etc.",
    icon: Dog,
    color: "#F59E0B",
    path: "/restaurantes?cat=Mascotas",
  },
];

const restaurantesPopulares = [
  {
    id: 1,
    nombre: "La Pica",
    categoria: "Comida rápida",
    rating: 4.8,
    reviews: "1.2k",
    tiempo: "15-30 min",
    precio: "$16.900",
    img: `${U}/photo-1568901346375-23c9450c58cd${Q}`,
    tag: "Más pedido",
  },
  {
    id: 2,
    nombre: "Sushi Express",
    categoria: "Sushi & Asiática",
    rating: 4.7,
    reviews: "586",
    tiempo: "20-35 min",
    precio: "$24.000",
    img: `${U}/photo-1579871494447-9811cf80d66c${Q}`,
    tag: "Top Calidad",
  },
  {
    id: 3,
    nombre: "Hamburguesas El Rey",
    categoria: "Hamburguesas",
    rating: 4.6,
    reviews: "942",
    tiempo: "20-40 min",
    precio: "$19.900",
    img: `${U}/photo-1550547660-d9450f859349${Q}`,
    tag: "Promoción",
  },
  {
    id: 4,
    nombre: "Pizza Mania",
    categoria: "Pizzas artesanales",
    rating: 4.5,
    reviews: "721",
    tiempo: "25-45 min",
    precio: "$28.000",
    img: `${U}/photo-1513104890138-7c749659a591${Q}`,
    tag: "Tradicional",
  },
  {
    id: 5,
    nombre: "Tacos La Esquina",
    categoria: "Mexicana",
    rating: 4.7,
    reviews: "826",
    tiempo: "20-35 min",
    precio: "$18.500",
    img: `${U}/photo-1565299585323-38d6b0865b47${Q}`,
    tag: "Picante",
  },
  {
    id: 6,
    nombre: "Bebidas y Más",
    categoria: "Bebidas & Licores",
    rating: 4.4,
    reviews: "410",
    tiempo: "15-25 min",
    precio: "$8.000",
    img: `${U}/photo-1544145945-f90425340c7e${Q}`,
    tag: "Frías",
  },
];

export default function Landing() {
  const navigate = useNavigate();
  const [direccion, setDireccion] = useState("");
  const [favoritos, setFavoritos] = useState({});

  const handleBuscar = (e) => {
    e.preventDefault();
    if (direccion.trim()) {
      navigate(`/restaurantes?dir=${encodeURIComponent(direccion.trim())}`);
    } else {
      navigate("/restaurantes");
    }
  };

  const toggleFavorito = (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    setFavoritos((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div style={styles.page}>
      {/* 1. HERO SECTION (Rapitipica Web Desktop / Mobile) */}
      <section style={styles.heroSection}>
        <div style={styles.heroContainer}>
          {/* Columna Izquierda: Mensaje + Búsqueda de dirección + Pills */}
          <div style={styles.heroLeft}>
            {/* Badge píldora destacada */}
            <div style={styles.heroBadge}>
              <span style={styles.heroBadgePulse} />
              <span>¡Rápido, fácil y delicioso!</span>
            </div>

            <h1 style={styles.heroHeading}>
              Tu comida favorita <br />
              <span style={styles.heroAccent}>en minutos</span>
            </h1>

            <p style={styles.heroSubheading}>
              Restaurantes, tiendas y más, todo en un solo lugar. Lo típico de tu ciudad directo a tu puerta.
            </p>

            {/* Input de dirección principal */}
            <form onSubmit={handleBuscar} style={styles.searchBar}>
              <div style={styles.searchInner}>
                <MapPin size={22} color="#00E576" style={styles.mapIcon} aria-hidden="true" />
                <input
                  type="text"
                  placeholder="Ingresa tu dirección de entrega..."
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  style={styles.addressInput}
                  aria-label="Dirección de entrega"
                />
              </div>
              <button type="submit" style={styles.searchBtn} className="btn-rapitipica">
                <span>Buscar</span>
                <ArrowRight size={18} />
              </button>
            </form>

            {/* Accesos rápidos de categoría pills */}
            <div style={styles.quickPills}>
              {categories.slice(0, 5).map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => navigate(cat.path)}
                  style={styles.quickPill}
                  className="df-press"
                >
                  <cat.icon size={15} color={cat.color} />
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Columna Derecha: Imagen visual apetecible con sombras glow */}
          <div style={styles.heroRight}>
            <div style={styles.heroImageWrapper}>
              <img
                src="https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1000&q=85"
                alt="Hamburguesa artesanal y comida deliciosa Rapitipica"
                style={styles.heroImage}
                loading="eager"
              />
              {/* Badge flotante de tiempo */}
              <div style={styles.floatingBadgeTime}>
                <Clock size={16} color="#00E576" />
                <div>
                  <div style={{ fontSize: "11px", color: "#9CA3AF" }}>Tiempo promedio</div>
                  <div style={{ fontSize: "14px", fontWeight: "700", color: "#F5F7FA" }}>15-25 minutos</div>
                </div>
              </div>

              {/* Badge flotante de calificación */}
              <div style={styles.floatingBadgeScore}>
                <Star size={16} color="#F59E0B" fill="#F59E0B" />
                <div>
                  <div style={{ fontSize: "11px", color: "#9CA3AF" }}>Satisfacción</div>
                  <div style={{ fontSize: "14px", fontWeight: "700", color: "#F5F7FA" }}>4.9 / 5 Estrellas</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CATEGORÍAS PRINCIPALES */}
      <section id="categorias" style={styles.categoriesSection}>
        <div style={styles.sectionHeader}>
          <div>
            <h2 style={styles.sectionTitle}>Categorías principales</h2>
            <p style={styles.sectionDesc}>Explora todo lo que puedes pedir hoy</p>
          </div>
          <Link to="/restaurantes" style={styles.viewAllLink}>
            Ver todas <ChevronRight size={16} />
          </Link>
        </div>

        <div style={styles.categoriesGrid}>
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.id}
                onClick={() => navigate(cat.path)}
                style={styles.categoryCard}
                className="bg-rapitipica-card bg-rapitipica-card-hover df-lift"
              >
                <div style={{ ...styles.categoryIconWrap, backgroundColor: `${cat.color}22` }}>
                  <Icon size={28} color={cat.color} />
                </div>
                <h3 style={styles.categoryName}>{cat.name}</h3>
                <p style={styles.categoryDesc}>{cat.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. RESTAURANTES POPULARES */}
      <section style={styles.popularSection}>
        <div style={styles.sectionHeader}>
          <div>
            <h2 style={styles.sectionTitle}>Restaurantes populares</h2>
            <p style={styles.sectionDesc}>Los favoritos de la comunidad con entrega express</p>
          </div>
          <Link to="/restaurantes" style={styles.viewAllLink}>
            Ver restaurantes <ChevronRight size={16} />
          </Link>
        </div>

        <div style={styles.restaurantsGrid}>
          {restaurantesPopulares.map((res) => (
            <div
              key={res.id}
              onClick={() => navigate(`/negocio/${res.id}`)}
              style={styles.resCard}
              className="bg-rapitipica-card bg-rapitipica-card-hover df-lift"
            >
              {/* Imagen del restaurante */}
              <div style={styles.resImageWrap}>
                <img src={res.img} alt={res.nombre} style={styles.resImage} loading="lazy" />
                <span style={styles.resTag}>{res.tag}</span>
                <button
                  type="button"
                  onClick={(e) => toggleFavorito(res.id, e)}
                  style={styles.resFavBtn}
                  aria-label="Agregar a favoritos"
                >
                  <Heart
                    size={17}
                    color={favoritos[res.id] ? "#EF4444" : "#FFFFFF"}
                    fill={favoritos[res.id] ? "#EF4444" : "none"}
                  />
                </button>
              </div>

              {/* Contenido de la tarjeta */}
              <div style={styles.resContent}>
                <div style={styles.resHeaderRow}>
                  <h3 style={styles.resTitle}>{res.nombre}</h3>
                  <div style={styles.resRating}>
                    <Star size={14} color="#F59E0B" fill="#F59E0B" />
                    <span>{res.rating}</span>
                    <span style={styles.resReviews}>({res.reviews})</span>
                  </div>
                </div>

                <p style={styles.resCat}>{res.categoria}</p>

                <div style={styles.resFooter}>
                  <div style={styles.resTime}>
                    <Clock size={14} color="#00E576" />
                    <span>{res.tiempo}</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/negocio/${res.id}`);
                    }}
                    style={styles.resPedirBtn}
                  >
                    Pedir
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. PILARES DE MARCA: RÁPIDO, SEGURO, FÁCIL */}
      <section style={styles.pillarsSection}>
        <div style={styles.pillarsContainer}>
          <div style={styles.pillarItem}>
            <div style={styles.pillarIcon}>
              <Zap size={28} color="#00E576" />
            </div>
            <h4 style={styles.pillarTitle}>Más rápido</h4>
            <p style={styles.pillarText}>Ruta optimizada con IA para entregas en tiempo récord.</p>
          </div>

          <div style={styles.pillarItem}>
            <div style={styles.pillarIcon}>
              <Shield size={28} color="#00E576" />
            </div>
            <h4 style={styles.pillarTitle}>Más seguro</h4>
            <p style={styles.pillarText}>Repartidores certificados y validación de seguridad activa.</p>
          </div>

          <div style={styles.pillarItem}>
            <div style={styles.pillarIcon}>
              <Smile size={28} color="#00E576" />
            </div>
            <h4 style={styles.pillarTitle}>Más fácil</h4>
            <p style={styles.pillarText}>¡Pide, disfruta, llega! Tu comida favorita a un solo tap.</p>
          </div>
        </div>
      </section>

      {/* 5. FOOTER OFICIAL RAPITIPICA */}
      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <div style={styles.footerColMain}>
            <RapitipicaLogo size="md" showTagline={true} to="/" />
            <p style={styles.footerTagline}>
              Rapitipica es la plataforma de domicilios donde puedes pedir tu comida favorita, productos y mucho más, de forma rápida, segura y fácil.
            </p>
          </div>

          <div style={styles.footerCol}>
            <h5 style={styles.footerHeading}>Descubrir</h5>
            <Link to="/restaurantes" style={styles.footerLink}>Restaurantes</Link>
            <Link to="/restaurantes?cat=Tiendas" style={styles.footerLink}>Tiendas de conveniencia</Link>
            <Link to="/restaurantes?cat=Supermercados" style={styles.footerLink}>Supermercados</Link>
            <Link to="/restaurantes?cat=Farmacias" style={styles.footerLink}>Farmacias</Link>
          </div>

          <div style={styles.footerCol}>
            <h5 style={styles.footerHeading}>Cuenta</h5>
            <Link to="/login" style={styles.footerLink}>Iniciar sesión</Link>
            <Link to="/register" style={styles.footerLink}>Crear cuenta gratis</Link>
            <Link to="/profile" style={styles.footerLink}>Mi perfil</Link>
            <Link to="/mis-pedidos" style={styles.footerLink}>Mis pedidos</Link>
          </div>

          <div style={styles.footerCol}>
            <h5 style={styles.footerHeading}>Socios</h5>
            <Link to="/register" style={styles.footerLink}>Registra tu restaurante</Link>
            <Link to="/register" style={styles.footerLink}>Únete como repartidor</Link>
            <Link to="/documentacion" style={styles.footerLink}>Centro de ayuda</Link>
          </div>
        </div>

        <div style={styles.footerBottom}>
          <p>© 2026 Rapitipica. Todos los derechos reservados. ¡Pide, disfruta, llega!</p>
        </div>
      </footer>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#0B1F44",
    color: "#F5F7FA",
    fontFamily: "'Montserrat', sans-serif",
  },
  heroSection: {
    padding: "clamp(36px, 6vw, 64px) 20px clamp(48px, 8vw, 80px)",
    background: "radial-gradient(ellipse at 50% 10%, rgba(0, 229, 118, 0.08) 0%, transparent 70%)",
  },
  heroContainer: {
    maxWidth: "1280px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "48px",
    alignItems: "center",
  },
  heroLeft: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  heroBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "rgba(0, 229, 118, 0.12)",
    border: "1px solid rgba(0, 229, 118, 0.35)",
    color: "#00E576",
    fontSize: "13px",
    fontWeight: "700",
    padding: "6px 16px",
    borderRadius: "9999px",
    width: "fit-content",
  },
  heroBadgePulse: {
    width: "8px",
    height: "8px",
    backgroundColor: "#00E576",
    borderRadius: "50%",
    boxShadow: "0 0 10px #00E576",
  },
  heroHeading: {
    fontSize: "clamp(32px, 5vw, 54px)",
    fontWeight: "800",
    lineHeight: 1.15,
    color: "#F5F7FA",
    letterSpacing: "-0.5px",
    margin: 0,
  },
  heroAccent: {
    color: "#00E576",
    textShadow: "0 0 24px rgba(0, 229, 118, 0.25)",
  },
  heroSubheading: {
    fontSize: "16px",
    lineHeight: 1.6,
    color: "#9CA3AF",
    margin: 0,
    maxWidth: "480px",
  },
  searchBar: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    backgroundColor: "#11254E",
    border: "1px solid #1D3B72",
    borderRadius: "9999px",
    padding: "6px 8px 6px 16px",
    boxShadow: "0 8px 24px rgba(3, 10, 26, 0.5)",
    maxWidth: "540px",
  },
  searchInner: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flex: "1",
    minWidth: "200px",
  },
  mapIcon: {
    flexShrink: 0,
  },
  addressInput: {
    width: "100%",
    background: "transparent",
    border: "none",
    color: "#F5F7FA",
    fontSize: "15px",
    outline: "none",
  },
  searchBtn: {
    padding: "10px 24px",
    fontSize: "15px",
  },
  quickPills: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginTop: "8px",
  },
  quickPill: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    backgroundColor: "rgba(17, 37, 78, 0.7)",
    border: "1px solid #1D3B72",
    borderRadius: "9999px",
    padding: "6px 14px",
    color: "#F5F7FA",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.15s ease",
  },
  heroRight: {
    display: "flex",
    justifyContent: "center",
  },
  heroImageWrapper: {
    position: "relative",
    width: "100%",
    maxWidth: "480px",
    borderRadius: "28px",
    overflow: "hidden",
    boxShadow: "0 20px 50px rgba(0, 0, 0, 0.6)",
    border: "1px solid #1D3B72",
  },
  heroImage: {
    width: "100%",
    height: "auto",
    display: "block",
    transform: "scale(1.02)",
    transition: "transform 0.5s ease",
  },
  floatingBadgeTime: {
    position: "absolute",
    bottom: "20px",
    left: "20px",
    backgroundColor: "rgba(11, 31, 68, 0.92)",
    backdropFilter: "blur(10px)",
    border: "1px solid #1D3B72",
    borderRadius: "16px",
    padding: "10px 14px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.4)",
  },
  floatingBadgeScore: {
    position: "absolute",
    top: "20px",
    right: "20px",
    backgroundColor: "rgba(11, 31, 68, 0.92)",
    backdropFilter: "blur(10px)",
    border: "1px solid #1D3B72",
    borderRadius: "16px",
    padding: "10px 14px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.4)",
  },
  categoriesSection: {
    maxWidth: "1280px",
    margin: "0 auto",
    padding: "40px 20px",
  },
  sectionHeader: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginBottom: "28px",
  },
  sectionTitle: {
    fontSize: "clamp(22px, 3vw, 28px)",
    fontWeight: "800",
    color: "#F5F7FA",
    margin: 0,
  },
  sectionDesc: {
    fontSize: "14px",
    color: "#9CA3AF",
    margin: "6px 0 0",
  },
  viewAllLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    color: "#00E576",
    fontSize: "14px",
    fontWeight: "700",
    textDecoration: "none",
    transition: "gap 0.15s ease",
  },
  categoriesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
    gap: "18px",
  },
  categoryCard: {
    borderRadius: "18px",
    padding: "22px 18px",
    cursor: "pointer",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px",
  },
  categoryIconWrap: {
    width: "56px",
    height: "56px",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "4px",
  },
  categoryName: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#F5F7FA",
    margin: 0,
  },
  categoryDesc: {
    fontSize: "12px",
    color: "#9CA3AF",
    margin: 0,
    lineHeight: 1.4,
  },
  popularSection: {
    maxWidth: "1280px",
    margin: "0 auto",
    padding: "40px 20px 60px",
  },
  restaurantsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "24px",
  },
  resCard: {
    borderRadius: "20px",
    overflow: "hidden",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
  },
  resImageWrap: {
    position: "relative",
    width: "100%",
    height: "170px",
    overflow: "hidden",
  },
  resImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  resTag: {
    position: "absolute",
    top: "12px",
    left: "12px",
    backgroundColor: "#00E576",
    color: "#0B1F44",
    fontSize: "11px",
    fontWeight: "800",
    padding: "4px 10px",
    borderRadius: "9999px",
  },
  resFavBtn: {
    position: "absolute",
    top: "12px",
    right: "12px",
    backgroundColor: "rgba(11, 31, 68, 0.75)",
    backdropFilter: "blur(6px)",
    border: "none",
    width: "34px",
    height: "34px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  resContent: {
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    flex: "1",
  },
  resHeaderRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "10px",
  },
  resTitle: {
    fontSize: "17px",
    fontWeight: "700",
    color: "#F5F7FA",
    margin: 0,
  },
  resRating: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    fontSize: "13px",
    fontWeight: "700",
    color: "#F5F7FA",
  },
  resReviews: {
    color: "#9CA3AF",
    fontSize: "12px",
    fontWeight: "400",
  },
  resCat: {
    fontSize: "13px",
    color: "#9CA3AF",
    margin: 0,
  },
  resFooter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: "auto",
    paddingTop: "12px",
    borderTop: "1px solid #1D3B72",
  },
  resTime: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "13px",
    color: "#F5F7FA",
    fontWeight: "600",
  },
  resPedirBtn: {
    backgroundColor: "#00E576",
    color: "#0B1F44",
    border: "none",
    borderRadius: "9999px",
    padding: "6px 16px",
    fontSize: "13px",
    fontWeight: "800",
    cursor: "pointer",
    transition: "all 0.15s ease",
  },
  pillarsSection: {
    backgroundColor: "#081836",
    borderTop: "1px solid #1D3B72",
    borderBottom: "1px solid #1D3B72",
    padding: "50px 20px",
  },
  pillarsContainer: {
    maxWidth: "1200px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "36px",
    textAlign: "center",
  },
  pillarItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
  },
  pillarIcon: {
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    backgroundColor: "rgba(0, 229, 118, 0.12)",
    border: "1px solid rgba(0, 229, 118, 0.3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  pillarTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#F5F7FA",
    margin: 0,
  },
  pillarText: {
    fontSize: "14px",
    color: "#9CA3AF",
    margin: 0,
    lineHeight: 1.5,
    maxWidth: "300px",
  },
  footer: {
    backgroundColor: "#07132B",
    borderTop: "1px solid #1D3B72",
    padding: "60px 20px 30px",
  },
  footerContent: {
    maxWidth: "1280px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "40px",
    marginBottom: "40px",
  },
  footerColMain: {
    gridColumn: "span 1",
  },
  footerTagline: {
    fontSize: "14px",
    lineHeight: 1.6,
    color: "#9CA3AF",
    marginTop: "14px",
    maxWidth: "340px",
  },
  footerCol: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  footerHeading: {
    fontSize: "15px",
    fontWeight: "700",
    color: "#F5F7FA",
    margin: 0,
  },
  footerLink: {
    color: "#9CA3AF",
    textDecoration: "none",
    fontSize: "14px",
    transition: "color 0.15s ease",
  },
  footerBottom: {
    maxWidth: "1280px",
    margin: "0 auto",
    paddingTop: "24px",
    borderTop: "1px solid #1D3B72",
    textAlign: "center",
    color: "#6B7280",
    fontSize: "13px",
  },
};
