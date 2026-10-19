import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Search,
  MapPin,
  SlidersHorizontal,
  Flame,
  Pizza,
  Fish,
  Utensils,
  Coffee,
  Sandwich,
  ChevronDown,
} from "lucide-react";
import NegocioCard from "../components/NegocioCard";
import NavbarCustom from "../components/Navbar";
import { SkeletonCard } from "../components/ui/Skeleton";
import EmptyState from "../components/ui/EmptyState";
import ErrorState from "../components/ui/ErrorState";
import { api } from "../api/client";

const FILTER_PILLS = [
  { id: "all", label: "Todos" },
  { id: "restaurantes", label: "Restaurantes" },
  { id: "comida-rapida", label: "Comida rápida" },
  { id: "italiana", label: "Italiana" },
  { id: "asiatica", label: "Asiática" },
  { id: "colombiana", label: "Colombiana" },
  { id: "mexicana", label: "Mexicana" },
  { id: "hamburguesas", label: "Hamburguesas" },
  { id: "pizzas", label: "Pizzas" },
  { id: "sushi", label: "Sushi" },
  { id: "bebidas", label: "Bebidas" },
  { id: "tiendas", label: "Tiendas" },
  { id: "supermercados", label: "Supermercados" },
  { id: "farmacias", label: "Farmacias" },
  { id: "mascotas", label: "Mascotas" },
  { id: "favoritos", label: "❤️ Favoritos" },
];

const SIDEBAR_CATEGORIES = [
  { id: "all", label: "Todos los sabores", icon: Utensils },
  { id: "hamburguesas", label: "Hamburguesas", icon: Flame },
  { id: "pizzas", label: "Pizzas", icon: Pizza },
  { id: "sushi", label: "Sushi", icon: Fish },
  { id: "comida-rapida", label: "Comida rápida", icon: Sandwich },
  { id: "bebidas", label: "Bebidas", icon: Coffee },
];

const MOCK_RESTAURANTES = [
  {
    id: 1,
    nombre: "La Pica",
    descripcion: "Especialistas en hamburguesas dobles, carnes al carbón y papas artesanales.",
    tipo: "Comida rápida",
    subcategoria: "hamburguesas",
    calificacion: 4.8,
    reviews: "1.2k",
    tiempoEstimadoMin: 25,
    costoEnvio: 2000,
    imagen: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 2,
    nombre: "Sushi Express",
    descripcion: "Rolls tradicionales, nigiris frescos y combos especiales para compartir.",
    tipo: "Asiática",
    subcategoria: "sushi",
    calificacion: 4.7,
    reviews: "586",
    tiempoEstimadoMin: 30,
    costoEnvio: 2500,
    imagen: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 3,
    nombre: "Hamburguesas El Rey",
    descripcion: "Sabor gourmet con tocineta crujiente, cebolla caramelizada y salsas de la casa.",
    tipo: "Comida rápida",
    subcategoria: "hamburguesas",
    calificacion: 4.6,
    reviews: "942",
    tiempoEstimadoMin: 25,
    costoEnvio: 2000,
    imagen: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 4,
    nombre: "Pizza Mania",
    descripcion: "Masa madre crocante, queso mozzarella fundido y los mejores ingredientes italianos.",
    tipo: "Italiana",
    subcategoria: "pizzas",
    calificacion: 4.5,
    reviews: "721",
    tiempoEstimadoMin: 35,
    costoEnvio: 3000,
    imagen: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 5,
    nombre: "Tacos La Esquina",
    descripcion: "Auténticos tacos al pastor, birria con consomé y quesadillas doraditas.",
    tipo: "Mexicana",
    subcategoria: "comida-rapida",
    calificacion: 4.7,
    reviews: "826",
    tiempoEstimadoMin: 25,
    costoEnvio: 2000,
    imagen: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 6,
    nombre: "Bebidas y Más",
    descripcion: "Jugos naturales refrescantes, sodas saborizadas y cervezas artesanales bien frías.",
    tipo: "Bebidas",
    subcategoria: "bebidas",
    calificacion: 4.4,
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
  const initialDir = searchParams.get("dir") || localStorage.getItem("domiflex_ubicacion") || "Popayán, Colombia";

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
          // Fusionar negocios del backend con fallback enriquecido si hay pocos
          setNegocios([...data, ...MOCK_RESTAURANTES.filter(m => !data.some(d => d.nombre === m.nombre))]);
        } else {
          setNegocios(MOCK_RESTAURANTES);
        }
      } catch (err) {
        console.warn("Backend no disponible o sin conexión. Usando restaurantes de demostración:", err.message);
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
    const nueva = window.prompt("Ingresa tu dirección o ciudad de entrega:", ubicacionActual);
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

    if (activePill === "all" || activePill === "restaurantes") return matchQuery;
    if (activePill === "favoritos") {
      const nid = n.id || n.idNegocio;
      return matchQuery && favIds.includes(nid);
    }

    const pillLabel = FILTER_PILLS.find((p) => p.id === activePill)?.label.toLowerCase() || activePill;
    const matchCategory =
      (n.tipo || "").toLowerCase().includes(pillLabel) ||
      (n.tipo || "").toLowerCase().includes(activePill) ||
      (n.subcategoria || "").toLowerCase() === activePill ||
      (n.nombre || "").toLowerCase().includes(pillLabel);

    return matchQuery && matchCategory;
  });

  return (
    <div style={styles.page}>
      <NavbarCustom />
      {/* 1. Header con Título, Subtítulo y Selector de Ubicación */}
      <div style={styles.headerBanner}>
        <div style={styles.headerContainer}>
          <div>
            <div style={styles.breadcrumb}>
              <span style={{ cursor: "pointer" }} onClick={() => navigate("/")}>Inicio</span>
              <span>/</span>
              <span style={{ color: "#00E576", fontWeight: 700 }}>Restaurantes</span>
            </div>
            <h1 style={styles.pageTitle}>Restaurantes</h1>
            <p style={styles.pageSubtitle}>Descubre los mejores sabores, cerca de ti.</p>
          </div>

          <button
            type="button"
            onClick={handleCambiarUbicacion}
            style={{ ...styles.locationSelector, cursor: "pointer" }}
            title="Cambiar dirección de entrega"
          >
            <MapPin size={16} color="#00E576" />
            <div style={{ textAlign: "left" }}>
              <span style={{ fontSize: "11px", color: "#9CA3AF", display: "block" }}>Tu ubicación</span>
              <span style={{ fontSize: "14px", fontWeight: 700, color: "#F5F7FA" }}>{ubicacionActual}</span>
            </div>
            <ChevronDown size={14} color="#9CA3AF" />
          </button>
        </div>
      </div>

      {/* 2. Barra de Búsqueda y Filtros Pills Horizontales */}
      <div style={styles.filterSection}>
        <div style={styles.filterContainer}>
          {/* Input de Búsqueda */}
          <div style={styles.searchBox}>
            <Search size={18} color="#9CA3AF" style={styles.searchIcon} aria-hidden="true" />
            <input
              type="text"
              placeholder="Buscar restaurante o comida..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
              aria-label="Buscar restaurantes o comidas"
            />
          </div>

          {/* Pills horizontales */}
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
                    backgroundColor: isActive ? "#00E576" : "#11254E",
                    color: isActive ? "#0B1F44" : "#F5F7FA",
                    borderColor: isActive ? "#00E576" : "#1D3B72",
                    fontWeight: isActive ? 800 : 500,
                  }}
                  className="df-press"
                >
                  {pill.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Contenido Principal: Sidebar + Grid de Restaurantes */}
      <div style={styles.mainLayout}>
        {/* Sidebar en Desktop */}
        <aside style={styles.sidebar}>
          <div style={styles.sidebarCard}>
            <h3 style={styles.sidebarTitle}>
              <SlidersHorizontal size={16} color="#00E576" />
              <span>Categorías</span>
            </h3>
            <div style={styles.sidebarList}>
              {SIDEBAR_CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isSelected = activePill === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handlePillClick(cat.id)}
                    style={{
                      ...styles.sidebarItem,
                      backgroundColor: isSelected ? "rgba(0, 229, 118, 0.14)" : "transparent",
                      color: isSelected ? "#00E576" : "#9CA3AF",
                      fontWeight: isSelected ? 700 : 500,
                    }}
                  >
                    <Icon size={16} color={isSelected ? "#00E576" : "#9CA3AF"} />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Grid de Restaurantes */}
        <main style={styles.resultsArea}>
          <div style={styles.resultsMeta}>
            <span style={{ fontSize: "14px", color: "#9CA3AF" }}>
              Mostrando <strong style={{ color: "#F5F7FA" }}>{filteredNegocios.length}</strong> restaurantes disponibles
            </span>
          </div>

          {loading ? (
            <div style={styles.grid}>
              {[0, 1, 2, 3, 4, 5].map((i) => (
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
              actionLabel={searchQuery ? "Ver todos los restaurantes" : undefined}
              onAction={searchQuery ? () => setSearchQuery("") : undefined}
            />
          ) : (
            <div style={styles.grid}>
              {filteredNegocios.map((negocio) => (
                <NegocioCard
                  key={negocio.id}
                  negocio={negocio}
                  onClick={(n) => navigate(`/negocio/${n.id}`)}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#0B1F44",
    color: "#F5F7FA",
    paddingBottom: "80px",
    fontFamily: "'Montserrat', sans-serif",
  },
  headerBanner: {
    backgroundColor: "#081836",
    borderBottom: "1px solid #1D3B72",
    padding: "24px 20px",
  },
  headerContainer: {
    maxWidth: "1280px",
    margin: "0 auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "16px",
  },
  breadcrumb: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "12px",
    color: "#9CA3AF",
    marginBottom: "4px",
  },
  pageTitle: {
    fontSize: "28px",
    fontWeight: "800",
    color: "#F5F7FA",
    margin: 0,
  },
  pageSubtitle: {
    fontSize: "14px",
    color: "#9CA3AF",
    margin: "4px 0 0",
  },
  locationSelector: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    backgroundColor: "#11254E",
    border: "1px solid #1D3B72",
    borderRadius: "14px",
    padding: "8px 16px",
    cursor: "pointer",
  },
  filterSection: {
    maxWidth: "1280px",
    margin: "0 auto",
    padding: "24px 20px 0",
  },
  filterContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  searchBox: {
    position: "relative",
    width: "100%",
    maxWidth: "500px",
  },
  searchIcon: {
    position: "absolute",
    left: "14px",
    top: "50%",
    transform: "translateY(-50%)",
  },
  searchInput: {
    width: "100%",
    backgroundColor: "#11254E",
    border: "1px solid #1D3B72",
    borderRadius: "9999px",
    padding: "10px 18px 10px 42px",
    color: "#F5F7FA",
    fontSize: "14px",
    outline: "none",
  },
  pillsScroll: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    overflowX: "auto",
    paddingBottom: "8px",
  },
  pillBtn: {
    padding: "7px 18px",
    borderRadius: "9999px",
    border: "1px solid #1D3B72",
    fontSize: "13px",
    cursor: "pointer",
    whiteSpace: "nowrap",
    transition: "all 0.15s ease",
  },
  mainLayout: {
    maxWidth: "1280px",
    margin: "0 auto",
    padding: "24px 20px",
    display: "grid",
    gridTemplateColumns: "240px 1fr",
    gap: "28px",
  },
  sidebar: {
    display: "block",
  },
  sidebarCard: {
    backgroundColor: "#11254E",
    border: "1px solid #1D3B72",
    borderRadius: "18px",
    padding: "18px",
    position: "sticky",
    top: "84px",
  },
  sidebarTitle: {
    fontSize: "15px",
    fontWeight: "700",
    color: "#F5F7FA",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    margin: "0 0 14px",
    paddingBottom: "10px",
    borderBottom: "1px solid #1D3B72",
  },
  sidebarList: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  sidebarItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    border: "none",
    borderRadius: "10px",
    padding: "9px 12px",
    cursor: "pointer",
    fontSize: "13px",
    textAlign: "left",
    transition: "all 0.15s ease",
    width: "100%",
  },
  resultsArea: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  resultsMeta: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "20px",
  },
};
