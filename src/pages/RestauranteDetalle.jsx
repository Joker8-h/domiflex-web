import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Star,
  Clock,
  MapPin,
  Plus,
  ShoppingCart,
  Heart,
  Check,
} from "lucide-react";
import { api } from "../api/client";
import { SkeletonCard } from "../components/ui/Skeleton";
import { loadCart, saveCart } from "../lib/cartStorage";
import NavbarCustom from "../components/Navbar";
import toast from "react-hot-toast";

const FALLBACK_RESTAURANTES = {
  1: {
    id: 1,
    nombre: "Burger House",
    tipo: "Hamburguesas",
    calificacion: 4.7,
    reviews: "942",
    tiempoEstimadoMin: 25,
    costoEnvio: 2000,
    direccion: "Calle 45 # 12-34, Popayán",
    imagen: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=80",
  },
  2: {
    id: 2,
    nombre: "Sushi Express",
    tipo: "Japonesa",
    calificacion: 4.6,
    reviews: "586",
    tiempoEstimadoMin: 35,
    costoEnvio: 2500,
    direccion: "Cra. 9 # 18N-15, Popayán",
    imagen: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=1200&q=80",
  },
  4: {
    id: 4,
    nombre: "Pizzería La Italiana",
    tipo: "Italiana",
    calificacion: 4.8,
    reviews: "1.2k",
    tiempoEstimadoMin: 30,
    costoEnvio: 4900,
    direccion: "Cra. 6 # 8-22, Centro",
    imagen: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80",
  },
  5: {
    id: 5,
    nombre: "Tacos El Mexa",
    tipo: "Mexicana",
    calificacion: 4.5,
    reviews: "826",
    tiempoEstimadoMin: 40,
    costoEnvio: 2000,
    direccion: "Calle 15N # 8-45, Popayán",
    imagen: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=1200&q=80",
  },
};

const FALLBACK_MENU = [
  {
    id: 201,
    nombre: "Pan de ajo",
    categoria: "Entradas",
    descripcion: "Pan artesanal horneado con mantequilla de ajo, finas hierbas y parmesano.",
    precio: 6900,
    imagen: "https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?auto=format&fit=crop&w=500&q=80",
    disponible: true,
  },
  {
    id: 202,
    nombre: "Bruschetta",
    categoria: "Entradas",
    descripcion: "Tostadas italianas con tomate fresco, albahaca, ajo y aceite de oliva extra virgen.",
    precio: 8900,
    imagen: "https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?auto=format&fit=crop&w=500&q=80",
    disponible: true,
  },
  {
    id: 203,
    nombre: "Ensalada caprese",
    categoria: "Entradas",
    descripcion: "Mozzarella fresca, rodajas de tomate maduro, hojas de albahaca y reducción balsámica.",
    precio: 9900,
    imagen: "https://images.unsplash.com/photo-1592417817098-8f3d691a4bf5?auto=format&fit=crop&w=500&q=80",
    disponible: true,
  },
  {
    id: 204,
    nombre: "Pizza margarita",
    categoria: "Pizzas",
    descripcion: "Salsa pomodoro artesanal, queso mozzarella fundido y hojas de albahaca fresca.",
    precio: 15900,
    imagen: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=500&q=80",
    disponible: true,
  },
  {
    id: 101,
    nombre: "Hamburguesa Clásica",
    categoria: "Hamburguesas",
    descripcion: "Carne de res 150g, queso cheddar fundido, lechuga fresca, tomate y salsas de la casa.",
    precio: 16900,
    imagen: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=80",
    disponible: true,
  },
  {
    id: 108,
    nombre: "Gaseosa 400 ml",
    categoria: "Bebidas",
    descripcion: "Refrescante bebida gaseosa personal bien fría.",
    precio: 3500,
    imagen: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=500&q=80",
    disponible: true,
  },
];

export default function RestauranteDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [negocio, setNegocio] = useState(null);
  const [productos, setProductos] = useState([]);
  const [activeTab, setActiveTab] = useState("menu"); // menu, info
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addedAnimation, setAddedAnimation] = useState({});
  const [isFav, setIsFav] = useState(() => {
    try {
      const favs = JSON.parse(localStorage.getItem("domiflex_favoritos") || "[]");
      return favs.includes(Number(id)) || favs.includes(String(id));
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const fetchNegocio = async () => {
      setLoading(true);
      try {
        const [negData, prodData] = await Promise.allSettled([
          api.get(`/negocios/${id}`),
          api.get(`/negocios/${id}/productos`),
        ]);

        const neg = negData.status === "fulfilled" && negData.value?.id ? negData.value : null;
        const prods = prodData.status === "fulfilled" && Array.isArray(prodData.value) ? prodData.value : [];

        if (neg) {
          setNegocio(neg);
        } else {
          setNegocio(
            FALLBACK_RESTAURANTES[id] || {
              id: Number(id) || 4,
              nombre: "Pizzería La Italiana",
              tipo: "Italiana",
              calificacion: 4.8,
              reviews: "1.2k",
              tiempoEstimadoMin: 30,
              costoEnvio: 4900,
              direccion: "Cra. 4 # 8-32, Centro",
              telefono: "+57 312 456 7890",
              imagen: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80",
            }
          );
        }

        if (prods.length > 0) {
          setProductos(prods);
        } else {
          setProductos(FALLBACK_MENU);
        }
      } catch {
        setNegocio(FALLBACK_RESTAURANTES[id] || FALLBACK_RESTAURANTES[4]);
        setProductos(FALLBACK_MENU);
      } finally {
        setLoading(false);
      }
    };
    fetchNegocio();
  }, [id]);

  useEffect(() => {
    const saved = loadCart();
    setCart(saved.cart || []);
  }, [id]);

  const toggleFav = () => {
    const next = !isFav;
    setIsFav(next);
    try {
      const favs = JSON.parse(localStorage.getItem("domiflex_favoritos") || "[]");
      const numId = Number(id) || id;
      const updated = next
        ? [...new Set([...favs, numId])]
        : favs.filter((item) => String(item) !== String(numId));
      localStorage.setItem("domiflex_favoritos", JSON.stringify(updated));
      window.dispatchEvent(new Event("domiflex_favoritos_changed"));
    } catch {
      // ignore
    }
  };

  const addToCart = (prod) => {
    setCart((prev) => {
      const hasDifferentRest =
        prev.length > 0 &&
        prev[0].restauranteId &&
        negocio?.id &&
        String(prev[0].restauranteId) !== String(negocio.id);
      let baseCart = prev;
      if (hasDifferentRest) {
        const confirmReset = window.confirm(
          `Tu carrito contiene productos de ${prev[0].restauranteNombre || "otro restaurante"}. ¿Deseas vaciarlo y agregar productos de ${negocio.nombre}?`
        );
        if (!confirmReset) return prev;
        baseCart = [];
      }
      const exists = baseCart.find((item) => item.id === prod.id);
      let updated;
      if (exists) {
        updated = baseCart.map((item) =>
          item.id === prod.id ? { ...item, cantidad: item.cantidad + 1 } : item
        );
      } else {
        updated = [
          ...baseCart,
          { ...prod, cantidad: 1, restauranteId: negocio?.id, restauranteNombre: negocio?.nombre },
        ];
      }
      saveCart(updated, negocio);
      return updated;
    });

    setAddedAnimation((prev) => ({ ...prev, [prod.id]: true }));
    setTimeout(() => {
      setAddedAnimation((prev) => ({ ...prev, [prod.id]: false }));
    }, 1000);

    toast.success(`¡${prod.nombre} agregado al carrito!`, {
      icon: "🛒",
      style: {
        backgroundColor: "#0D1117",
        color: "#FFFFFF",
        border: "1px solid #E30613",
      },
    });
  };

  // Agrupar productos por categoría como en la Pantalla 3 del boceto ("Entradas", "Pizzas", etc.)
  const productosPorCategoria = useMemo(() => {
    const groups = {};
    productos.forEach((p) => {
      const cat = p.categoria || "Especialidades";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(p);
    });
    return groups;
  }, [productos]);

  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + (Number(item.cantidad) || 1), 0),
    [cart]
  );

  if (loading) {
    return (
      <div style={styles.page}>
        <NavbarCustom />
        <div style={styles.headerSkeleton}>
          <SkeletonCard />
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <NavbarCustom />

      {/* 1. BANNER DE PORTADA CON BOTÓN VOLVER (←) Y FAVORITO (♥) */}
      <div style={styles.bannerContainer}>
        <img
          src={
            negocio?.imagen ||
            "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80"
          }
          alt={negocio?.nombre}
          style={styles.bannerImage}
        />
        <div style={styles.bannerOverlay} />

        <div style={styles.bannerTopActions}>
          <button
            type="button"
            onClick={() => navigate("/restaurantes")}
            style={styles.circleActionBtn}
            aria-label="Volver"
          >
            <ArrowLeft size={20} color="#11141A" />
          </button>

          <button
            type="button"
            onClick={toggleFav}
            style={styles.circleActionBtn}
            aria-label="Favorito"
          >
            <Heart
              size={20}
              color="#E30613"
              fill={isFav ? "#E30613" : "none"}
            />
          </button>
        </div>
      </div>

      {/* 2. TARJETA BLANCA PRINCIPAL SUPERPUESTA (Estilo Pantalla 3 del Boceto) */}
      <div style={styles.sheetContainer}>
        <div style={styles.sheetHeader}>
          <h1 style={styles.restaurantTitle}>{negocio?.nombre}</h1>

          <div style={styles.ratingRow}>
            <Star size={16} color="#F59E0B" fill="#F59E0B" />
            <span style={styles.ratingBold}>{negocio?.calificacion || 4.8}</span>
            <span style={styles.ratingMuted}>({negocio?.reviews || "1.2k"})</span>
          </div>

          <p style={styles.metaText}>
            {negocio?.tipo || "Italiana"} • {negocio?.tiempoEstimadoMin || 30} min • $$
          </p>

          {/* TABS: Menú | Información */}
          <div style={styles.tabsBar}>
            <button
              type="button"
              onClick={() => setActiveTab("menu")}
              style={{
                ...styles.tabBtn,
                color: activeTab === "menu" ? "#E30613" : "#6B7280",
                borderBottomColor: activeTab === "menu" ? "#E30613" : "transparent",
                fontWeight: activeTab === "menu" ? 800 : 600,
              }}
            >
              Menú
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("info")}
              style={{
                ...styles.tabBtn,
                color: activeTab === "info" ? "#E30613" : "#6B7280",
                borderBottomColor: activeTab === "info" ? "#E30613" : "transparent",
                fontWeight: activeTab === "info" ? 800 : 600,
              }}
            >
              Información
            </button>
          </div>
        </div>

        {/* CONTENIDO DEL MENÚ POR SECCIONES CON BOTÓN CIRCULAR ROJO (+) */}
        {activeTab === "menu" ? (
          <div style={styles.menuSectionsWrap}>
            {Object.entries(productosPorCategoria).map(([categoriaNombre, lista]) => (
              <div key={categoriaNombre} style={styles.categoryBlock}>
                <h2 style={styles.sectionCategoryTitle}>{categoriaNombre}</h2>

                <div style={styles.itemsList}>
                  {lista.map((prod) => (
                    <div key={prod.id} style={styles.itemRow}>
                      <img
                        src={
                          prod.imagen ||
                          "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&q=80"
                        }
                        alt={prod.nombre}
                        style={styles.itemThumb}
                        loading="lazy"
                      />

                      <div style={styles.itemCenter}>
                        <h3 style={styles.itemName}>{prod.nombre}</h3>
                        {prod.descripcion && (
                          <p style={styles.itemDesc}>{prod.descripcion}</p>
                        )}
                        <span style={styles.itemPrice}>
                          ${Number(prod.precio).toLocaleString()}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => addToCart(prod)}
                        style={{
                          ...styles.plusCircleBtn,
                          backgroundColor: addedAnimation[prod.id] ? "#16A34A" : "#E30613",
                        }}
                        className="df-press"
                        aria-label={`Agregar ${prod.nombre}`}
                      >
                        {addedAnimation[prod.id] ? (
                          <Check size={18} color="#FFFFFF" strokeWidth={3} />
                        ) : (
                          <Plus size={20} color="#FFFFFF" strokeWidth={2.8} />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={styles.infoBox}>
            <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#11141A", marginBottom: "10px" }}>
              Acerca de {negocio?.nombre}
            </h3>
            <p style={{ color: "#4B5563", fontSize: "14px", lineHeight: 1.6, marginBottom: "18px" }}>
              {negocio?.descripcion ||
                "Ingredientes frescos seleccionados diariamente, preparación artesanal y entrega rápida garantizada con Rapitipica."}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "14px", color: "#11141A" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <MapPin size={18} color="#E30613" />
                <span>{negocio?.direccion || "Cra. 6 # 8-22, Centro, Popayán"}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Clock size={18} color="#16A34A" />
                <span>Horario: 11:00 AM – 10:30 PM (Todos los días)</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. BOTÓN ROJO FLOTANTE "Ver carrito" EXACTO DEL BOCETO */}
      <div style={styles.floatingFooter}>
        <button
          type="button"
          onClick={() => navigate("/carrito")}
          style={styles.verCarritoRedBtn}
          className="df-press"
        >
          <span style={styles.verCarritoText}>Ver carrito</span>
          <div style={styles.verCarritoIconWrap}>
            <ShoppingCart size={20} color="#FFFFFF" />
            <span style={styles.verCarritoCount}>{cartCount}</span>
          </div>
        </button>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#F8F9FA",
    color: "#11141A",
    paddingBottom: "110px",
    fontFamily: "'Montserrat', sans-serif",
  },
  headerSkeleton: {
    maxWidth: "860px",
    margin: "40px auto",
    padding: "0 20px",
  },
  bannerContainer: {
    position: "relative",
    width: "100%",
    height: "240px",
    overflow: "hidden",
    backgroundColor: "#0D1117",
  },
  bannerImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  bannerOverlay: {
    position: "absolute",
    inset: 0,
    background: "linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.2) 60%, rgba(0,0,0,0.5) 100%)",
  },
  bannerTopActions: {
    position: "absolute",
    top: "18px",
    left: "50%",
    transform: "translateX(-50%)",
    width: "100%",
    maxWidth: "860px",
    padding: "0 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 3,
  },
  circleActionBtn: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    backgroundColor: "#FFFFFF",
    border: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
  },
  sheetContainer: {
    position: "relative",
    zIndex: 2,
    maxWidth: "860px",
    margin: "-28px auto 0",
    backgroundColor: "#FFFFFF",
    borderRadius: "26px",
    boxShadow: "0 6px 28px rgba(0, 0, 0, 0.08)",
    border: "1px solid #E5E7EB",
    overflow: "hidden",
  },
  sheetHeader: {
    padding: "24px 24px 0",
    borderBottom: "1px solid #E5E7EB",
  },
  restaurantTitle: {
    fontSize: "clamp(22px, 3.5vw, 28px)",
    fontWeight: 800,
    color: "#11141A",
    margin: "0 0 6px",
  },
  ratingRow: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    marginBottom: "4px",
  },
  ratingBold: {
    fontSize: "14px",
    fontWeight: 800,
    color: "#11141A",
  },
  ratingMuted: {
    fontSize: "13px",
    color: "#6B7280",
    fontWeight: 500,
  },
  metaText: {
    fontSize: "13px",
    color: "#6B7280",
    fontWeight: 500,
    margin: "0 0 14px",
  },
  tabsBar: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    textAlign: "center",
  },
  tabBtn: {
    background: "transparent",
    border: "none",
    borderBottom: "3px solid transparent",
    padding: "12px 8px",
    fontSize: "15px",
    cursor: "pointer",
    transition: "all 0.15s ease",
  },
  menuSectionsWrap: {
    padding: "20px 24px 28px",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  categoryBlock: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  sectionCategoryTitle: {
    fontSize: "18px",
    fontWeight: 800,
    color: "#11141A",
    margin: 0,
  },
  itemsList: {
    display: "flex",
    flexDirection: "column",
  },
  itemRow: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    padding: "12px 0",
    borderBottom: "1px solid #F1F5F9",
  },
  itemThumb: {
    width: "68px",
    height: "68px",
    borderRadius: "12px",
    objectFit: "cover",
    flexShrink: 0,
    backgroundColor: "#F1F5F9",
  },
  itemCenter: {
    flex: 1,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: "3px",
  },
  itemName: {
    fontSize: "15px",
    fontWeight: 700,
    color: "#11141A",
    margin: 0,
  },
  itemDesc: {
    fontSize: "12px",
    color: "#6B7280",
    margin: 0,
    lineHeight: 1.35,
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  itemPrice: {
    fontSize: "14px",
    fontWeight: 700,
    color: "#374151",
    marginTop: "2px",
  },
  plusCircleBtn: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    border: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    flexShrink: 0,
    boxShadow: "0 4px 10px rgba(227, 6, 19, 0.3)",
    transition: "background-color 0.2s ease",
  },
  infoBox: {
    padding: "24px",
  },
  floatingFooter: {
    position: "fixed",
    bottom: "18px",
    left: "20px",
    right: "20px",
    maxWidth: "520px",
    margin: "0 auto",
    zIndex: 250,
  },
  verCarritoRedBtn: {
    width: "100%",
    backgroundColor: "#E30613",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "9999px",
    padding: "14px 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    cursor: "pointer",
    boxShadow: "0 8px 24px rgba(227, 6, 19, 0.45)",
  },
  verCarritoText: {
    fontSize: "16px",
    fontWeight: 800,
    margin: "0 auto",
    paddingLeft: "28px",
  },
  verCarritoIconWrap: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  verCarritoCount: {
    position: "absolute",
    top: "-8px",
    right: "-8px",
    backgroundColor: "#FFFFFF",
    color: "#E30613",
    fontSize: "11px",
    fontWeight: 900,
    borderRadius: "9999px",
    padding: "1px 5px",
    minWidth: "18px",
    textAlign: "center",
  },
};
