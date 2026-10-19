import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Star,
  Clock,
  MapPin,
  Plus,
  ShoppingBag,
  Flame,
  ChevronRight,
  Info,
  MessageSquare,
  Utensils,
  Check,
} from "lucide-react";
import { api } from "../api/client";
import { SkeletonCard } from "../components/ui/Skeleton";
import ErrorState from "../components/ui/ErrorState";
import { loadCart, saveCart } from "../lib/cartStorage";
import NavbarCustom from "../components/Navbar";
import toast from "react-hot-toast";

const FALLBACK_MENU = [
  {
    id: 101,
    nombre: "Hamburguesa Clásica",
    categoria: "Hamburguesas",
    descripcion: "Carne de res 150g, queso cheddar fundido, lechuga fresca, tomate y salsas de la casa.",
    precio: 16900,
    imagen: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80",
    disponible: true,
  },
  {
    id: 102,
    nombre: "Hamburguesa Doble Carne",
    categoria: "Hamburguesas",
    descripcion: "Doble carne jugosa 300g, doble queso americano, tocineta ahumada y cebolla grillé.",
    precio: 22900,
    imagen: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80",
    disponible: true,
  },
  {
    id: 103,
    nombre: "Hamburguesa BBQ Crunch",
    categoria: "Hamburguesas",
    descripcion: "Carne de res, queso, tocineta crujiente, aros de cebolla apanados y salsa BBQ ahumada.",
    precio: 20900,
    imagen: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=600&q=80",
    disponible: true,
  },
  {
    id: 104,
    nombre: "Hamburguesa Hawaiana",
    categoria: "Hamburguesas",
    descripcion: "Carne de res, queso mozzarella, rodaja de piña asada al caramelo y jamón premium.",
    precio: 19900,
    imagen: "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?auto=format&fit=crop&w=600&q=80",
    disponible: true,
  },
  {
    id: 105,
    nombre: "Perro Caliente Especial",
    categoria: "Perros",
    descripcion: "Salchicha americana jumbo, queso fundido, tocineta, papita fosforito y salsas típicas.",
    precio: 14500,
    imagen: "https://images.unsplash.com/photo-1619740455993-9e612b1af08a?auto=format&fit=crop&w=600&q=80",
    disponible: true,
  },
  {
    id: 106,
    nombre: "Alitas BBQ x8",
    categoria: "Alitas",
    descripcion: "Alitas crujientes bañadas en salsa BBQ o picante suave con bastones de apio.",
    precio: 18900,
    imagen: "https://images.unsplash.com/photo-1527477396000-e27163b481c2?auto=format&fit=crop&w=600&q=80",
    disponible: true,
  },
  {
    id: 107,
    nombre: "Papas Francesas Rústicas",
    categoria: "Acompañamientos",
    descripcion: "Papas cortadas a mano con sal de mar, orégano y dip de salsa de la casa.",
    precio: 6500,
    imagen: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80",
    disponible: true,
  },
  {
    id: 108,
    nombre: "Gaseosa 400ml",
    categoria: "Bebidas",
    descripcion: "Refrescante bebida gaseosa personal bien fría.",
    precio: 4000,
    imagen: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=600&q=80",
    disponible: true,
  },
];

export default function RestauranteDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [negocio, setNegocio] = useState(null);
  const [productos, setProductos] = useState([]);
  const [activeTab, setActiveTab] = useState("menu"); // menu, info, resenas
  const [selectedCategoria, setSelectedCategoria] = useState("all");
  const [cart, setCart] = useState([]);
  const [cartReady, setCartReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [addedAnimation, setAddedAnimation] = useState({});

  useEffect(() => {
    const fetchNegocio = async () => {
      setLoading(true);
      try {
        const [negData, prodData] = await Promise.allSettled([
          api.get(`/negocios/${id}`),
          api.get(`/negocios/${id}/productos`),
        ]);

        const neg = negData.status === "fulfilled" ? negData.value : null;
        const prods = prodData.status === "fulfilled" && Array.isArray(prodData.value) ? prodData.value : [];

        if (neg) {
          setNegocio(neg);
        } else {
          // Fallback para restaurante demo según ID
          setNegocio({
            id: Number(id) || 1,
            nombre: "La Pica",
            tipo: "Comida rápida",
            calificacion: 4.8,
            reviews: "1.2k",
            tiempoEstimadoMin: 25,
            costoEnvio: 2000,
            direccion: "Cra. 4 # 8-32, Centro",
            telefono: "+57 312 456 7890",
            imagen: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80",
          });
        }

        if (prods.length > 0) {
          setProductos(prods);
        } else {
          setProductos(FALLBACK_MENU);
        }
      } catch (err) {
        console.warn("Error cargando restaurante:", err);
        setNegocio({
          id: Number(id) || 1,
          nombre: "La Pica",
          tipo: "Comida rápida",
          calificacion: 4.8,
          reviews: "1.2k",
          tiempoEstimadoMin: 25,
          costoEnvio: 2000,
          direccion: "Cra. 4 # 8-32, Centro",
          telefono: "+57 312 456 7890",
          imagen: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80",
        });
        setProductos(FALLBACK_MENU);
      } finally {
        setLoading(false);
      }
    };
    fetchNegocio();
  }, [id]);

  useEffect(() => {
    const saved = loadCart();
    if (saved.negocio && String(saved.negocio.id) === String(id)) {
      setCart(saved.cart || []);
    } else {
      setCart(saved.cart || []);
    }
    setCartReady(true);
  }, [id]);

  const addToCart = (prod) => {
    setCart((prev) => {
      const hasDifferentRest = prev.length > 0 && prev[0].restauranteId && negocio?.id && String(prev[0].restauranteId) !== String(negocio.id);
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
        updated = [...baseCart, { ...prod, cantidad: 1, restauranteId: negocio?.id, restauranteNombre: negocio?.nombre }];
      }
      saveCart(updated, negocio);
      return updated;
    });

    // Feedback visual animado
    setAddedAnimation((prev) => ({ ...prev, [prod.id]: true }));
    setTimeout(() => {
      setAddedAnimation((prev) => ({ ...prev, [prod.id]: false }));
    }, 1200);

    toast.success(`¡${prod.nombre} agregado al carrito!`, {
      icon: "🛒",
      style: {
        backgroundColor: "#11254E",
        color: "#F5F7FA",
        border: "1px solid #00E576",
      },
    });
  };

  const categorias = useMemo(() => {
    const cats = [...new Set(productos.map((p) => p.categoria).filter(Boolean))];
    return ["all", ...cats];
  }, [productos]);

  const filteredProductos = useMemo(() => {
    if (selectedCategoria === "all") return productos;
    return productos.filter((p) => p.categoria === selectedCategoria);
  }, [productos, selectedCategoria]);

  const cartTotal = useMemo(
    () => cart.reduce((sum, item) => sum + (Number(item.precio) || 0) * (Number(item.cantidad) || 1), 0),
    [cart]
  );
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
      {/* 1. HERO BANNER DEL RESTAURANTE */}
      <div style={styles.heroBanner}>
        <div style={styles.bannerImageWrap}>
          <img
            src={negocio?.imagen || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80"}
            alt={negocio?.nombre}
            style={styles.bannerImage}
          />
          <div style={styles.bannerOverlay} />
        </div>

        <div style={styles.heroContent}>
          {/* Breadcrumbs */}
          <div style={styles.breadcrumbs}>
            <Link to="/restaurantes" style={styles.breadLink}>
              <ArrowLeft size={14} /> Volver a restaurantes
            </Link>
          </div>

          <div style={styles.restaurantHeaderRow}>
            {/* Avatar circular */}
            <div style={styles.restaurantAvatar}>
              <span>{negocio?.nombre?.slice(0, 2).toUpperCase() || "RP"}</span>
            </div>

            <div style={styles.restaurantInfo}>
              <h1 style={styles.restaurantTitle}>{negocio?.nombre}</h1>
              <div style={styles.restaurantMetaRow}>
                <div style={styles.metaItemRating}>
                  <Star size={15} color="#F59E0B" fill="#F59E0B" />
                  <span>{negocio?.calificacion || 4.8}</span>
                  <span style={{ color: "#9CA3AF" }}>({negocio?.reviews || "1.2k"})</span>
                </div>
                <span>•</span>
                <span style={{ color: "#00E576", fontWeight: 600 }}>{negocio?.tipo || "Comida rápida"}</span>
                <span>•</span>
                <div style={styles.metaItem}>
                  <Clock size={14} color="#00E576" />
                  <span>{negocio?.tiempoEstimadoMin || 25} min</span>
                </div>
                <span>•</span>
                <span style={{ color: "#9CA3AF" }}>
                  {negocio?.costoEnvio === 0 ? "Envío gratis" : `Envío $${Number(negocio?.costoEnvio || 2000).toLocaleString()}`}
                </span>
              </div>
            </div>
          </div>

          {/* TABS SUPERIORES: Menú, Información, Reseñas */}
          <div style={styles.tabsRow}>
            <button
              type="button"
              onClick={() => setActiveTab("menu")}
              style={{
                ...styles.tabButton,
                color: activeTab === "menu" ? "#00E576" : "#9CA3AF",
                borderBottomColor: activeTab === "menu" ? "#00E576" : "transparent",
                fontWeight: activeTab === "menu" ? 700 : 500,
              }}
            >
              <Utensils size={16} /> Menú
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("info")}
              style={{
                ...styles.tabButton,
                color: activeTab === "info" ? "#00E576" : "#9CA3AF",
                borderBottomColor: activeTab === "info" ? "#00E576" : "transparent",
                fontWeight: activeTab === "info" ? 700 : 500,
              }}
            >
              <Info size={16} /> Información
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("resenas")}
              style={{
                ...styles.tabButton,
                color: activeTab === "resenas" ? "#00E576" : "#9CA3AF",
                borderBottomColor: activeTab === "resenas" ? "#00E576" : "transparent",
                fontWeight: activeTab === "resenas" ? 700 : 500,
              }}
            >
              <MessageSquare size={16} /> Reseñas
            </button>
          </div>
        </div>
      </div>

      {/* 2. CONTENIDO PRINCIPAL POR TABS */}
      <div style={styles.bodyContainer}>
        {activeTab === "menu" && (
          <div style={styles.menuLayout}>
            {/* Sidebar de categorías del menú */}
            <aside style={styles.menuSidebar}>
              <div style={styles.sidebarCard}>
                <h3 style={styles.sidebarTitle}>Categorías</h3>
                <div style={styles.sidebarList}>
                  {categorias.map((cat) => {
                    const isSelected = selectedCategoria === cat;
                    const label = cat === "all" ? "Todo el menú" : cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setSelectedCategoria(cat)}
                        style={{
                          ...styles.sidebarItem,
                          backgroundColor: isSelected ? "rgba(0, 229, 118, 0.14)" : "transparent",
                          color: isSelected ? "#00E576" : "#9CA3AF",
                          fontWeight: isSelected ? 700 : 500,
                        }}
                      >
                        <span>{label}</span>
                        {isSelected && <ChevronRight size={14} color="#00E576" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </aside>

            {/* Listado de Platos */}
            <main style={styles.menuMain}>
              <h2 style={styles.categoryTitle}>
                {selectedCategoria === "all" ? "Platos recomendados" : selectedCategoria}
              </h2>

              <div style={styles.productsGrid}>
                {filteredProductos.map((prod) => (
                  <div key={prod.id} style={styles.productCard} className="df-lift">
                    <img
                      src={prod.imagen || "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80"}
                      alt={prod.nombre}
                      style={styles.productImage}
                      loading="lazy"
                    />

                    <div style={styles.productInfo}>
                      <h3 style={styles.productName}>{prod.nombre}</h3>
                      <p style={styles.productDesc}>{prod.descripcion}</p>

                      <div style={styles.productFooter}>
                        <span style={styles.productPrice}>
                          ${Number(prod.precio).toLocaleString()} COP
                        </span>

                        <button
                          type="button"
                          onClick={() => addToCart(prod)}
                          style={{
                            ...styles.addBtn,
                            backgroundColor: addedAnimation[prod.id] ? "#10B981" : "#00E576",
                          }}
                          className="df-press"
                        >
                          {addedAnimation[prod.id] ? (
                            <>
                              <Check size={16} /> ¡Listo!
                            </>
                          ) : (
                            <>
                              <Plus size={16} /> Agregar
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </main>
          </div>
        )}

        {activeTab === "info" && (
          <div style={styles.infoCard}>
            <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#F5F7FA", marginBottom: "16px" }}>
              Información de {negocio?.nombre}
            </h2>
            <p style={{ color: "#9CA3AF", lineHeight: 1.6, marginBottom: "20px" }}>
              {negocio?.descripcion || "Restaurante afiliado a Rapitipica, comprometido con la frescura, el sabor típico y los mejores estándares de preparación."}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", color: "#F5F7FA" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <MapPin size={18} color="#00E576" />
                <span>{negocio?.direccion || "Calle 5 # 4-40, Centro, Popayán"}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Clock size={18} color="#00E576" />
                <span>Horario de atención: 11:00 AM – 10:30 PM (Lunes a Domingo)</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === "resenas" && (
          <div style={styles.infoCard}>
            <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#F5F7FA", marginBottom: "16px" }}>
              Opiniones de clientes
            </h2>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
              <span style={{ fontSize: "38px", fontWeight: "800", color: "#F5F7FA" }}>
                {negocio?.calificacion || 4.8}
              </span>
              <div>
                <div style={{ display: "flex", gap: "2px" }}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={18} color="#F59E0B" fill="#F59E0B" />
                  ))}
                </div>
                <span style={{ fontSize: "13px", color: "#9CA3AF" }}>Basado en {negocio?.reviews || "1.200"} pedidos</span>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={styles.reviewItem}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span style={{ fontWeight: 700, color: "#F5F7FA" }}>Carlos M.</span>
                  <span style={{ fontSize: "12px", color: "#9CA3AF" }}>Hace 2 días</span>
                </div>
                <p style={{ margin: 0, color: "#9CA3AF", fontSize: "13px", lineHeight: 1.5 }}>
                  "La comida llegó súper caliente y exactamente como la pedí. Las papas estaban en su punto crujiente. ¡10/10 Rapitipica!"
                </p>
              </div>

              <div style={styles.reviewItem}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span style={{ fontWeight: 700, color: "#F5F7FA" }}>Andrea P.</span>
                  <span style={{ fontSize: "12px", color: "#9CA3AF" }}>Hace 1 semana</span>
                </div>
                <p style={{ margin: 0, color: "#9CA3AF", fontSize: "13px", lineHeight: 1.5 }}>
                  "El tiempo de entrega fue incluso menor al estimado. La hamburguesa doble es de las mejores de la ciudad."
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. BARRA FLOTANTE DE RESUMEN DEL CARRITO (SI HAY ITEMS) */}
      {cartCount > 0 && (
        <div style={styles.floatingCartBar}>
          <div style={styles.cartBarContainer}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={styles.cartBarBadge}>{cartCount}</div>
              <div>
                <div style={{ fontSize: "12px", color: "#9CA3AF" }}>Total de tu orden</div>
                <div style={{ fontSize: "17px", fontWeight: "800", color: "#F5F7FA" }}>
                  ${cartTotal.toLocaleString()} COP
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate("/carrito")}
              style={styles.cartBarBtn}
              className="btn-rapitipica"
            >
              <ShoppingBag size={18} />
              <span>Ver carrito</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#0B1F44",
    color: "#F5F7FA",
    paddingBottom: "100px",
    fontFamily: "'Montserrat', sans-serif",
  },
  headerSkeleton: {
    maxWidth: "1280px",
    margin: "40px auto",
    padding: "0 20px",
  },
  heroBanner: {
    position: "relative",
    backgroundColor: "#081836",
    borderBottom: "1px solid #1D3B72",
  },
  bannerImageWrap: {
    position: "relative",
    width: "100%",
    height: "220px",
    overflow: "hidden",
  },
  bannerImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  bannerOverlay: {
    position: "absolute",
    inset: 0,
    background: "linear-gradient(to bottom, rgba(11, 31, 68, 0.4) 0%, rgba(11, 31, 68, 0.95) 100%)",
  },
  heroContent: {
    maxWidth: "1280px",
    margin: "-50px auto 0",
    padding: "0 20px",
    position: "relative",
    zIndex: 2,
  },
  breadcrumbs: {
    marginBottom: "16px",
  },
  breadLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    color: "#00E576",
    fontSize: "13px",
    fontWeight: "700",
    textDecoration: "none",
    backgroundColor: "rgba(11, 31, 68, 0.8)",
    padding: "6px 14px",
    borderRadius: "9999px",
    backdropFilter: "blur(8px)",
  },
  restaurantHeaderRow: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    flexWrap: "wrap",
    marginBottom: "20px",
  },
  restaurantAvatar: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    backgroundColor: "#FF6B4A",
    border: "3px solid #00E576",
    color: "#FFFFFF",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "26px",
    fontWeight: "800",
    boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
  },
  restaurantInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  restaurantTitle: {
    fontSize: "clamp(26px, 4vw, 36px)",
    fontWeight: "800",
    color: "#F5F7FA",
    margin: 0,
  },
  restaurantMetaRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "14px",
    flexWrap: "wrap",
  },
  metaItemRating: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    fontWeight: "700",
    color: "#F5F7FA",
  },
  metaItem: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    color: "#F5F7FA",
    fontWeight: "600",
  },
  tabsRow: {
    display: "flex",
    gap: "24px",
    borderTop: "1px solid #1D3B72",
    marginTop: "16px",
  },
  tabButton: {
    background: "transparent",
    border: "none",
    borderBottom: "3px solid transparent",
    padding: "14px 4px",
    fontSize: "15px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer",
    transition: "all 0.15s ease",
  },
  bodyContainer: {
    maxWidth: "1280px",
    margin: "0 auto",
    padding: "30px 20px",
  },
  menuLayout: {
    display: "grid",
    gridTemplateColumns: "240px 1fr",
    gap: "32px",
  },
  menuSidebar: {
    display: "block",
  },
  sidebarCard: {
    backgroundColor: "#11254E",
    border: "1px solid #1D3B72",
    borderRadius: "18px",
    padding: "16px",
    position: "sticky",
    top: "84px",
  },
  sidebarTitle: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#F5F7FA",
    margin: "0 0 12px",
    paddingBottom: "8px",
    borderBottom: "1px solid #1D3B72",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  sidebarList: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  sidebarItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    border: "none",
    borderRadius: "10px",
    padding: "10px 12px",
    cursor: "pointer",
    fontSize: "14px",
    textAlign: "left",
    transition: "all 0.15s ease",
    width: "100%",
  },
  menuMain: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  categoryTitle: {
    fontSize: "22px",
    fontWeight: "800",
    color: "#F5F7FA",
    margin: 0,
  },
  productsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "20px",
  },
  productCard: {
    backgroundColor: "#11254E",
    border: "1px solid #1D3B72",
    borderRadius: "18px",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    transition: "all 0.2s ease",
  },
  productImage: {
    width: "100%",
    height: "170px",
    objectFit: "cover",
  },
  productInfo: {
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    flex: "1",
    gap: "8px",
  },
  productName: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#F5F7FA",
    margin: 0,
  },
  productDesc: {
    fontSize: "13px",
    color: "#9CA3AF",
    lineHeight: 1.4,
    margin: 0,
    flex: "1",
  },
  productFooter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: "12px",
    paddingTop: "12px",
    borderTop: "1px solid #1D3B72",
  },
  productPrice: {
    fontSize: "16px",
    fontWeight: "800",
    color: "#F5F7FA",
  },
  addBtn: {
    color: "#0B1F44",
    border: "none",
    borderRadius: "9999px",
    padding: "8px 18px",
    fontSize: "13px",
    fontWeight: "800",
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  infoCard: {
    backgroundColor: "#11254E",
    border: "1px solid #1D3B72",
    borderRadius: "20px",
    padding: "32px",
    maxWidth: "800px",
    margin: "0 auto",
  },
  reviewItem: {
    backgroundColor: "#0B1F44",
    border: "1px solid #1D3B72",
    borderRadius: "14px",
    padding: "16px",
  },
  floatingCartBar: {
    position: "fixed",
    bottom: "20px",
    left: "20px",
    right: "20px",
    maxWidth: "600px",
    margin: "0 auto",
    zIndex: 250,
  },
  cartBarContainer: {
    backgroundColor: "#081836",
    border: "1px solid #00E576",
    borderRadius: "20px",
    padding: "12px 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.7), 0 0 15px rgba(0, 229, 118, 0.25)",
  },
  cartBarBadge: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    backgroundColor: "#00E576",
    color: "#0B1F44",
    fontSize: "15px",
    fontWeight: "800",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  cartBarBtn: {
    padding: "10px 22px",
    fontSize: "14px",
  },
};
