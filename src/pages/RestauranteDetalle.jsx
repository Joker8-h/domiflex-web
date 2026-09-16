import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaStar, FaClock, FaMapMarkerAlt, FaPhone, FaPlus } from "react-icons/fa";
import theme from "../styles/theme";
import { api } from "../api/client";
import { SkeletonCard } from "../components/ui/Skeleton";
import ErrorState from "../components/ui/ErrorState";
import EmptyState from "../components/ui/EmptyState";
import { useIsMobile } from "../hooks/useMediaQuery";

export default function RestauranteDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [negocio, setNegocio] = useState(null);
  const [productos, setProductos] = useState([]);
  const [selectedCategoria, setSelectedCategoria] = useState(null);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const fetchNegocio = async () => {
      setLoading(true);
      setError(null);
      try {
        const [negData, prodData] = await Promise.all([
          api.get(`/negocios/${id}`, { signal: controller.signal }),
          api.get(`/negocios/${id}/productos`, { signal: controller.signal }),
        ]);
        if (controller.signal.aborted) return;
        setNegocio(negData);
        setProductos(Array.isArray(prodData) ? prodData : []);
      } catch (err) {
        if (!controller.signal.aborted) {
          console.error("Error:", err);
          setError(err.message || "No se pudo cargar el negocio.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    fetchNegocio();
    return () => controller.abort();
  }, [id, retryKey]);

  const addToCart = (producto) => {
    setCart((prev) => {
      const exists = prev.find((item) => item.id === producto.id);
      if (exists) {
        return prev.map((item) =>
          item.id === producto.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      }
      return [...prev, { ...producto, cantidad: 1 }];
    });
  };

  const categorias = useMemo(
    () => [...new Set(productos.map((p) => p.categoria).filter(Boolean))],
    [productos]
  );
  const cartTotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.precio * item.cantidad, 0),
    [cart]
  );
  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.cantidad, 0),
    [cart]
  );

  const filteredProductos = useMemo(
    () => (selectedCategoria ? productos.filter((p) => p.categoria === selectedCategoria) : productos),
    [productos, selectedCategoria]
  );

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.header}>
          <div style={{ width: "44px" }} />
          <h1 style={styles.title}>Cargando…</h1>
          <div style={{ width: "44px" }} />
        </div>
        <div style={styles.productos} aria-busy="true" aria-label="Cargando menú">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.page}>
        <div style={styles.header}>
          <button type="button" aria-label="Volver" style={styles.backBtn} onClick={() => navigate(-1)}>
            <FaArrowLeft size={18} aria-hidden="true" />
          </button>
          <h1 style={styles.title}>Negocio</h1>
          <div style={{ width: "44px" }} aria-hidden="true" />
        </div>
        <ErrorState
          title="No pudimos cargar el negocio"
          description={error}
          onRetry={() => setRetryKey((k) => k + 1)}
        />
      </div>
    );
  }

  if (!negocio) {
    return (
      <div style={styles.page}>
        <div style={styles.header}>
          <button type="button" aria-label="Volver" style={styles.backBtn} onClick={() => navigate(-1)}>
            <FaArrowLeft size={18} aria-hidden="true" />
          </button>
          <h1 style={styles.title}>Negocio</h1>
          <div style={{ width: "44px" }} aria-hidden="true" />
        </div>
        <EmptyState
          icon="🏪"
          title="Negocio no encontrado"
          description="El negocio que buscas no existe o ya no está disponible."
          actionLabel="Explorar negocios"
          onAction={() => navigate("/restaurantes")}
        />
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <button type="button" aria-label="Volver" style={styles.backBtn} onClick={() => navigate(-1)}>
          <FaArrowLeft size={18} aria-hidden="true" />
        </button>
        <h1 style={styles.title}>{negocio.nombre}</h1>
        <div style={{ width: "44px" }} aria-hidden="true" />
      </div>

      {/* Banner */}
      <div style={styles.banner}>
        {negocio.banner ? (
          <img src={negocio.banner} alt={`Foto de ${negocio.nombre}`} style={styles.bannerImg} loading="lazy" />
        ) : (
          <div style={styles.bannerPlaceholder} aria-hidden="true">
            <span style={{ fontSize: "48px" }}>🏪</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div style={styles.info}>
        <h2 style={styles.name}>{negocio.nombre}</h2>
        <div style={styles.meta}>
          <span style={styles.rating}>
            <FaStar size={14} color={theme.colors.warning} aria-hidden="true" /> {Number(negocio.calificacion || 0).toFixed(1)}
          </span>
          <span style={styles.metaItem}>
            <FaClock size={12} aria-hidden="true" /> {negocio.tiempoEstimadoMin} min
          </span>
          <span style={styles.metaItem}>
            Envío ${Number(negocio.costoEnvio || 0).toLocaleString()}
          </span>
        </div>
        {negocio.descripcion && (
          <p style={styles.description}>{negocio.descripcion}</p>
        )}
        <div style={styles.addressRow}>
          <FaMapMarkerAlt size={14} color={theme.colors.textMuted} aria-hidden="true" />
          <span style={styles.address}>{negocio.direccion}</span>
        </div>
        {negocio.telefono && (
          <div style={styles.addressRow}>
            <FaPhone size={14} color={theme.colors.textMuted} aria-hidden="true" />
            <span style={styles.address}>{negocio.telefono}</span>
          </div>
        )}
      </div>

      {/* Categorías del menú */}
      <div style={styles.menuCategories} role="group" aria-label="Filtrar por categoría">
        <button
          type="button"
          aria-pressed={!selectedCategoria}
          style={{
            ...styles.catBtn,
            backgroundColor: !selectedCategoria ? theme.colors.accent : theme.colors.bgCard,
            color: !selectedCategoria ? "#000" : theme.colors.textPrimary,
          }}
          onClick={() => setSelectedCategoria(null)}
        >
          Todos
        </button>
        {categorias.map((cat) => (
          <button
            type="button"
            key={cat}
            aria-pressed={selectedCategoria === cat}
            style={{
              ...styles.catBtn,
              backgroundColor: selectedCategoria === cat ? theme.colors.accent : theme.colors.bgCard,
              color: selectedCategoria === cat ? "#000" : theme.colors.textPrimary,
            }}
            onClick={() => setSelectedCategoria(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Productos */}
      <div style={styles.productos}>
        {filteredProductos.length === 0 ? (
          <EmptyState
            icon="🍽️"
            title="Sin productos aquí"
            description="Prueba con otra categoría del menú."
          />
        ) : (
          filteredProductos.map((producto) => (
            <div key={producto.id} style={styles.productoCard}>
              <div style={styles.productoInfo}>
                <h4 style={styles.productoName}>{producto.nombre}</h4>
                {producto.descripcion && (
                  <p style={styles.productoDesc}>{producto.descripcion}</p>
                )}
                <span style={styles.productoPrice}>
                  ${Number(producto.precio || 0).toLocaleString()}
                </span>
              </div>
              <div style={styles.productoRight}>
                {producto.imagen && (
                  <img src={producto.imagen} alt={producto.nombre} style={styles.productoImg} loading="lazy" />
                )}
                <button
                  type="button"
                  aria-label={`Agregar ${producto.nombre} al carrito`}
                  style={styles.addBtn}
                  onClick={() => addToCart(producto)}
                >
                  <FaPlus size={14} aria-hidden="true" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Carrito flotante */}
      {cartCount > 0 && (
        <button
          type="button"
          aria-label={`Ver carrito, ${cartCount} productos, total $${cartTotal.toLocaleString()}`}
          style={{ ...styles.floatingCart, bottom: isMobile ? "96px" : "24px" }}
          onClick={() => navigate("/carrito", { state: { cart, negocio } })}
        >
          <span style={styles.cartCount} aria-hidden="true">{cartCount}</span>
          <span style={styles.cartText}>Ver carrito</span>
          <span style={styles.cartTotal}>${cartTotal.toLocaleString()}</span>
        </button>
      )}
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: theme.colors.bgPrimary,
    paddingBottom: "100px",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px",
    position: "sticky",
    top: 0,
    backgroundColor: theme.colors.bgNavbar,
    backdropFilter: "blur(10px)",
    zIndex: theme.zIndex.sticky,
  },
  backBtn: {
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
  title: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    flex: 1,
    textAlign: "center",
  },
  banner: {
    width: "100%",
    height: "200px",
    overflow: "hidden",
  },
  bannerImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  bannerPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: theme.colors.bgCard,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    padding: "20px 16px",
  },
  name: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    marginBottom: "8px",
  },
  meta: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    marginBottom: "12px",
    flexWrap: "wrap",
  },
  rating: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
  },
  metaItem: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  description: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: "12px",
  },
  addressRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "4px",
  },
  address: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  menuCategories: {
    display: "flex",
    gap: "8px",
    padding: "0 16px 16px",
    overflowX: "auto",
  },
  catBtn: {
    padding: "8px 16px",
    minHeight: "44px",
    borderRadius: theme.borderRadius.xl,
    border: `1px solid ${theme.colors.border}`,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    cursor: "pointer",
    whiteSpace: "nowrap",
    transition: theme.transitions.fast,
    fontFamily: "'Inter', sans-serif",
  },
  productos: {
    padding: "0 16px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  productoCard: {
    display: "flex",
    justifyContent: "space-between",
    padding: "16px",
    backgroundColor: theme.colors.bgCard,
    borderRadius: theme.borderRadius.md,
    border: `1px solid ${theme.colors.border}`,
  },
  productoInfo: {
    flex: 1,
    paddingRight: "12px",
  },
  productoName: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    marginBottom: "4px",
  },
  productoDesc: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginBottom: "8px",
  },
  productoPrice: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.accent,
  },
  productoRight: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: "8px",
  },
  productoImg: {
    width: "64px",
    height: "64px",
    borderRadius: theme.borderRadius.sm,
    objectFit: "cover",
  },
  addBtn: {
    width: "44px",
    height: "44px",
    borderRadius: "50%",
    border: "none",
    backgroundColor: theme.colors.accent,
    color: "#000",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: theme.transitions.fast,
  },
  floatingCart: {
    position: "fixed",
    bottom: "24px",
    left: "16px",
    right: "16px",
    maxWidth: "560px",
    margin: "0 auto",
    backgroundColor: theme.colors.accent,
    color: "#000",
    border: "none",
    borderRadius: theme.borderRadius.xl,
    padding: "16px 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    cursor: "pointer",
    boxShadow: theme.shadows.button,
    zIndex: theme.zIndex.fixed,
    fontWeight: theme.fontWeight.bold,
    fontFamily: "'Inter', sans-serif",
  },
  cartCount: {
    minWidth: "28px",
    height: "28px",
    borderRadius: "50%",
    backgroundColor: "#000",
    color: theme.colors.accent,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold,
    padding: "0 6px",
  },
  cartText: {
    flex: 1,
    textAlign: "center",
    fontSize: theme.fontSize.md,
  },
  cartTotal: {
    fontSize: theme.fontSize.lg,
  },
};
