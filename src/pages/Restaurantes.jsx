import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Search,
  MapPin,
  Bell,
  ChevronRight,
  UtensilsCrossed,
  ShoppingCart,
  Wine,
  CakeSlice,
  CupSoda,
  MoreHorizontal,
} from "lucide-react";
import NegocioCard from "../components/NegocioCard";
import NavbarCustom from "../components/Navbar";
import { SkeletonCard } from "../components/ui/Skeleton";
import EmptyState from "../components/ui/EmptyState";
import ErrorState from "../components/ui/ErrorState";
import { api } from "../api/client";

// Las 6 categorías circulares exactas del boceto (Pantalla 2: Inicio / Explorar)
const CIRCLE_CATEGORIES = [
  { id: "restaurantes", label: "Restaurantes", icon: UtensilsCrossed, bg: "#E30613" },
  { id: "supermercados", label: "Supermercados", icon: ShoppingCart, bg: "#16A34A" },
  { id: "licores", label: "Licores", icon: Wine, bg: "#11141A" },
  { id: "dulces", label: "Dulces", icon: CakeSlice, bg: "#E30613" },
  { id: "bebidas", label: "Bebidas", icon: CupSoda, bg: "#16A34A" },
  { id: "all", label: "Más", icon: MoreHorizontal, bg: "#11141A" },
];

const FILTER_PILLS = [
  { id: "all", label: "Todos" },
  { id: "restaurantes", label: "Restaurantes" },
  { id: "pizzas", label: "Pizzas" },
  { id: "hamburguesas", label: "Hamburguesas" },
  { id: "italiana", label: "Italiana" },
  { id: "sushi", label: "Sushi" },
  { id: "mexicana", label: "Mexicana" },
  { id: "supermercados", label: "Supermercados" },
  { id: "licores", label: "Licores" },
  { id: "dulces", label: "Dulces" },
  { id: "bebidas", label: "Bebidas" },
  { id: "ofertas", label: "🔥 Ofertas" },
  { id: "favoritos", label: "❤️ Favoritos" },
];

const MOCK_RESTAURANTES = [
  {
    id: 4,
    nombre: "Pizzería La Italiana",
    descripcion: "Masa artesanal horneada a la piedra, mozzarella fresca y albahaca italiana.",
    tipo: "Italiana",
    subcategoria: "pizzas",
    calificacion: 4.8,
    reviews: "1.2k",
    tiempoEstimadoMin: 30,
    costoEnvio: 2000,
    imagen: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 1,
    nombre: "Burger House",
    descripcion: "Especialistas en hamburguesas dobles con queso cheddar y papas rústicas.",
    tipo: "Hamburguesas",
    subcategoria: "hamburguesas",
    calificacion: 4.7,
    reviews: "942",
    tiempoEstimadoMin: 25,
    costoEnvio: 2000,
    imagen: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 2,
    nombre: "Sushi Express",
    descripcion: "Rolls japoneses frescos, nigiris de salmón y combos especiales.",
    tipo: "Japonesa",
    subcategoria: "sushi",
    calificacion: 4.6,
    reviews: "586",
    tiempoEstimadoMin: 35,
    costoEnvio: 2500,
    imagen: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 5,
    nombre: "Tacos El Mexa",
    descripcion: "Auténticos tacos al pastor, birria con consomé y nachos supremos.",
    tipo: "Mexicana",
    subcategoria: "mexicana",
    calificacion: 4.5,
    reviews: "826",
    tiempoEstimadoMin: 40,
    costoEnvio: 2000,
    imagen: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 3,
    nombre: "La Pica",
    descripcion: "Comida rápida típica, perros especiales, alitas BBQ y picadas.",
    tipo: "Comida rápida",
    subcategoria: "hamburguesas",
    calificacion: 4.8,
    reviews: "1.1k",
    tiempoEstimadoMin: 25,
    costoEnvio: 2000,
    imagen: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 6,
    nombre: "Bebidas y Licores Express",
    descripcion: "Gaseosas heladas, cervezas artesanales, licores nacionales e importados.",
    tipo: "Bebidas & Licores",
    subcategoria: "bebidas",
    calificacion: 4.7,
    reviews: "410",
    tiempoEstimadoMin: 20,
    costoEnvio: 1500,
    imagen: "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=800&q=80",
  },
];

export default function Restaurantes() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [negocios, setNegocios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favIds, setFavIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("domiflex_favoritos") || "[]");
    } catch {
      return [];
    }
  });

  const initialSearch = searchParams.get("q") || "";
  const initialCategory = searchParams.get("tab") === "favoritos"
    ? "favoritos"
    : (searchParams.get("cat") || "all");
  const initialDir = searchParams.get("dir") || localStorage.getItem("domiflex_ubicacion") || "Calle 45 # 12-34";

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [activePill, setActivePill] = useState(initialCategory.toLowerCase());
  const [ubicacionActual, setUbicacionActual] = useState(initialDir);

  useEffect(() => {
    const qParam = searchParams.get("q");
    const catParam = searchParams.get("cat");
    const tabParam = searchParams.get("tab");
    const dirParam = searchParams.get("dir");

    if (qParam !== null) setSearchQuery(qParam);
    if (tabParam === "favoritos") setActivePill("favoritos");
    else if (catParam) setActivePill(catParam.toLowerCase());
    if (dirParam) {
      setUbicacionActual(dirParam);
      localStorage.setItem("domiflex_ubicacion", dirParam);
    }
  }, [searchParams]);

  useEffect(() => {
    const syncFavs = () => {
      try {
        setFavIds(JSON.parse(localStorage.getItem("domiflex_favoritos") || "[]"));
      } catch {
        setFavIds([]);
      }
    };
    window.addEventListener("domiflex_favoritos_changed", syncFavs);
    return () => window.removeEventListener("domiflex_favoritos_changed", syncFavs);
  }, []);

  useEffect(() => {
    const fetchNegocios = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.get("/negocios");
        if (Array.isArray(data) && data.length > 0) {
          setNegocios([...MOCK_RESTAURANTES, ...data.filter((d) => !MOCK_RESTAURANTES.some((m) => m.nombre === d.nombre))]);
        } else {
          setNegocios(MOCK_RESTAURANTES);
        }
      } catch (err) {
        console.warn("Usando catálogo destacado Rapitipica:", err.message);
        setNegocios(MOCK_RESTAURANTES);
      } finally {
        setLoading(false);
      }
    };
    fetchNegocios();
  }, []);

  const handlePillClick = (id) => {
    setActivePill(id);
    searchParams.delete("tab");
    if (id === "all") {
      searchParams.delete("cat");
    } else {
      searchParams.set("cat", id);
    }
    setSearchParams(searchParams);
  };

  const handleCambiarUbicacion = () => {
    const nueva = window.prompt("Ingresa tu dirección de entrega:", ubicacionActual);
    if (nueva && nueva.trim()) {
      setUbicacionActual(nueva.trim());
      localStorage.setItem("domiflex_ubicacion", nueva.trim());
    }
  };

  const filteredNegocios = negocios.filter((n) => {
    const matchQuery =
      (n.nombre || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (n.descripcion || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (n.tipo || "").toLowerCase().includes(searchQuery.toLowerCase());

    if (activePill === "all" || activePill === "restaurantes" || activePill === "ofertas") return matchQuery;
    if (activePill === "favoritos") {
      const nid = n.id || n.idNegocio;
      return matchQuery && (favIds.includes(nid) || favIds.includes(String(nid)));
    }

    const pillLabel = FILTER_PILLS.find((p) => p.id === activePill)?.label.toLowerCase() || activePill;
    const matchCategory =
      (n.tipo || "").toLowerCase().includes(pillLabel) ||
      (n.tipo || "").toLowerCase().includes(activePill) ||
      (n.subcategoria || "").toLowerCase().includes(activePill) ||
      (n.nombre || "").toLowerCase().includes(pillLabel);

    return matchQuery && matchCategory;
  });

  return (
    <div style={styles.page}>
      <NavbarCustom />

      {/* 1. CABECERA NEGRA CON UBICACIÓN Y BARRA DE BÚSQUEDA BLANCA ("¿Qué se te antoja hoy?") */}
      <div style={styles.darkHeader}>
        <div style={styles.darkHeaderInner}>
          <div style={styles.locationRow}>
            <button
              type="button"
              onClick={handleCambiarUbicacion}
              style={styles.locationBtn}
              title="Cambiar dirección de entrega"
            >
              <div style={styles.pinCircle}>
                <MapPin size={18} color="#FFFFFF" />
              </div>
              <div style={{ textAlign: "left" }}>
                <span style={styles.locationSub}>Tu ubicación</span>
                <span style={styles.locationMain}>{ubicacionActual}</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => navigate("/notificaciones")}
              style={styles.bellBtn}
              aria-label="Notificaciones"
            >
              <Bell size={20} color="#FFFFFF" />
            </button>
          </div>

          {/* Buscador blanco redondeado como en la pantalla 2 del boceto */}
          <div style={styles.whiteSearchBox}>
            <Search size={18} color="#6B7280" style={styles.searchIcon} />
            <input
              type="text"
              placeholder="¿Qué se te antoja hoy?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.whiteSearchInput}
              aria-label="¿Qué se te antoja hoy?"
            />
          </div>
        </div>
      </div>

      {/* 2. CONTENIDO PRINCIPAL SOBRE FONDO CLARO */}
      <div style={styles.mainContent}>
        {/* BANNER PROMOCIONAL "Pizza desde $12.900" EXACTO DEL BOCETO */}
        <div
          style={styles.promoBanner}
          onClick={() => navigate("/negocio/4")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && navigate("/negocio/4")}
        >
          <div style={styles.promoLeft}>
            <span style={styles.promoTitle}>Pizza</span>
            <div style={styles.promoPriceRow}>
              <span style={styles.promoDesde}>desde</span>
              <span style={styles.promoPrice}>$12.900</span>
            </div>
          </div>
          <img
            src="https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=700&q=80"
            alt="Pizza promoción desde $12.900"
            style={styles.promoImage}
          />
        </div>

        {/* 6 CÍRCULOS DE CATEGORÍAS (Rojo, Verde, Negro) */}
        <div style={styles.circlesGrid}>
          {CIRCLE_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = activePill === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handlePillClick(cat.id)}
                style={styles.circleCatBtn}
                className="df-press"
              >
                <div
                  style={{
                    ...styles.circleIconWrap,
                    backgroundColor: cat.bg,
                    outline: isSelected ? "3px solid #E30613" : "none",
                    outlineOffset: "3px",
                  }}
                >
                  <Icon size={24} color="#FFFFFF" />
                </div>
                <span style={{ ...styles.circleCatLabel, fontWeight: isSelected ? 800 : 600 }}>
                  {cat.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* PILLS DE FILTRO RÁPIDO */}
        <div style={styles.pillsScroll}>
          {FILTER_PILLS.map((pill) => {
            const isActive = activePill === pill.id;
            return (
              <button
                key={pill.id}
                type="button"
                onClick={() => handlePillClick(pill.id)}
                style={{
                  ...styles.pillBtn,
                  backgroundColor: isActive ? "#E30613" : "#FFFFFF",
                  color: isActive ? "#FFFFFF" : "#11141A",
                  borderColor: isActive ? "#E30613" : "#E5E7EB",
                  fontWeight: isActive ? 700 : 600,
                }}
              >
                {pill.label}
              </button>
            );
          })}
        </div>

        {/* SECCIÓN: RESTAURANTES POPULARES */}
        <div style={styles.sectionHeaderRow}>
          <h2 style={styles.sectionHeading}>Restaurantes populares</h2>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              handlePillClick("all");
            }}
            style={styles.verTodosBtn}
          >
            <span>Ver todos</span>
            <ChevronRight size={16} />
          </button>
        </div>

        {loading ? (
          <div style={styles.grid}>
            {[0, 1, 2, 3].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : error ? (
          <ErrorState
            title="No pudimos cargar los restaurantes"
            description={error}
            onRetry={() => window.location.reload()}
          />
        ) : filteredNegocios.length === 0 ? (
          <EmptyState
            icon="🍽️"
            title="No encontramos restaurantes"
            description={
              searchQuery
                ? `Sin resultados para "${searchQuery}". Prueba con otro plato o categoría.`
                : "No hay restaurantes en esta categoría por ahora."
            }
            actionLabel="Ver todos los restaurantes"
            onAction={() => {
              setSearchQuery("");
              handlePillClick("all");
            }}
          />
        ) : (
          <div style={styles.grid}>
            {filteredNegocios.map((negocio) => (
              <NegocioCard
                key={negocio.id || negocio.idNegocio}
                negocio={negocio}
                onClick={(n) => navigate(`/negocio/${n.id || n.idNegocio}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#F8F9FA",
    color: "#11141A",
    paddingBottom: "90px",
    fontFamily: "'Montserrat', sans-serif",
  },
  darkHeader: {
    backgroundColor: "#0D1117",
    padding: "16px 20px 24px",
    borderBottomLeftRadius: "24px",
    borderBottomRightRadius: "24px",
    boxShadow: "0 6px 20px rgba(0, 0, 0, 0.15)",
  },
  darkHeaderInner: {
    maxWidth: "1100px",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  locationRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  locationBtn: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: 0,
  },
  pinCircle: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  locationSub: {
    fontSize: "11px",
    color: "#9CA3AF",
    display: "block",
  },
  locationMain: {
    fontSize: "14px",
    fontWeight: 700,
    color: "#FFFFFF",
    display: "block",
  },
  bellBtn: {
    width: "38px",
    height: "38px",
    borderRadius: "50%",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    border: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  whiteSearchBox: {
    position: "relative",
    width: "100%",
  },
  searchIcon: {
    position: "absolute",
    left: "16px",
    top: "50%",
    transform: "translateY(-50%)",
    pointerEvents: "none",
  },
  whiteSearchInput: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    color: "#11141A",
    border: "none",
    borderRadius: "9999px",
    padding: "12px 18px 12px 44px",
    fontSize: "14px",
    fontWeight: 500,
    outline: "none",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
  },
  mainContent: {
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "22px 20px",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  promoBanner: {
    position: "relative",
    backgroundColor: "#0D1117",
    backgroundImage: "linear-gradient(110deg, #0D1117 45%, #8B0000 100%)",
    borderRadius: "20px",
    padding: "22px 26px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    overflow: "hidden",
    cursor: "pointer",
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
    minHeight: "135px",
  },
  promoLeft: {
    zIndex: 2,
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  promoTitle: {
    fontSize: "clamp(28px, 4vw, 38px)",
    fontWeight: 900,
    fontStyle: "italic",
    color: "#FFFFFF",
    lineHeight: 1,
  },
  promoPriceRow: {
    display: "inline-flex",
    alignItems: "baseline",
    gap: "8px",
    backgroundColor: "#E30613",
    padding: "4px 14px",
    borderRadius: "8px",
    marginTop: "6px",
  },
  promoDesde: {
    fontSize: "13px",
    fontStyle: "italic",
    color: "#FFFFFF",
    fontWeight: 600,
  },
  promoPrice: {
    fontSize: "clamp(20px, 3vw, 26px)",
    fontWeight: 900,
    color: "#FFFFFF",
  },
  promoImage: {
    width: "180px",
    height: "120px",
    objectFit: "cover",
    borderRadius: "14px",
    transform: "rotate(4deg)",
    boxShadow: "0 6px 16px rgba(0,0,0,0.5)",
  },
  circlesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(95px, 1fr))",
    gap: "16px",
    backgroundColor: "#FFFFFF",
    padding: "20px",
    borderRadius: "20px",
    border: "1px solid #E5E7EB",
    boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
  },
  circleCatBtn: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
    background: "transparent",
    border: "none",
    cursor: "pointer",
  },
  circleIconWrap: {
    width: "56px",
    height: "56px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 10px rgba(0,0,0,0.14)",
  },
  circleCatLabel: {
    fontSize: "12px",
    color: "#11141A",
    textAlign: "center",
  },
  pillsScroll: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    overflowX: "auto",
    paddingBottom: "4px",
  },
  pillBtn: {
    padding: "8px 16px",
    borderRadius: "9999px",
    border: "1px solid #E5E7EB",
    fontSize: "13px",
    cursor: "pointer",
    whiteSpace: "nowrap",
    transition: "all 0.15s ease",
  },
  sectionHeaderRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionHeading: {
    fontSize: "20px",
    fontWeight: 800,
    color: "#11141A",
    margin: 0,
  },
  verTodosBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    background: "transparent",
    border: "none",
    color: "#6B7280",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
    gap: "20px",
  },
};
