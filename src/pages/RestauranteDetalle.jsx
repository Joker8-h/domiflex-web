import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaStar, FaClock, FaMapMarkerAlt, FaPhone, FaPlus } from "react-icons/fa";
import theme from "../styles/theme";
import { Button } from "../components/common";
import API_URL from "../config";

export default function RestauranteDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [negocio, setNegocio] = useState(null);
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [selectedCategoria, setSelectedCategoria] = useState(null);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNegocio();
  }, [id]);

  const fetchNegocio = async () => {
    try {
      const [negRes, prodRes] = await Promise.all([
        fetch(`${API_URL}/negocios/${id}`),
        fetch(`${API_URL}/negocios/${id}/productos`),
      ]);
      const negData = await negRes.json();
      const prodData = await prodRes.json();
      setNegocio(negData);
      setProductos(prodData);
      const cats = [...new Set(prodData.map((p) => p.categoria))];
      setCategorias(cats);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

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

  const cartTotal = cart.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.cantidad, 0);

  const filteredProductos = selectedCategoria
    ? productos.filter((p) => p.categoria === selectedCategoria)
    : productos;

  if (loading) {
    return (
      <div style={styles.loadingPage}>
        <div style={styles.spinner} />
      </div>
    );
  }

  if (!negocio) {
    return (
      <div style={styles.loadingPage}>
        <p style={{ color: theme.colors.textSecondary }}>Negocio no encontrado</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate(-1)}>
          <FaArrowLeft size={18} />
        </button>
        <h1 style={styles.title}>{negocio.nombre}</h1>
        <div style={{ width: "36px" }} />
      </div>

      {/* Banner */}
      <div style={styles.banner}>
        {negocio.banner ? (
          <img src={negocio.banner} alt="" style={styles.bannerImg} />
        ) : (
          <div style={styles.bannerPlaceholder}>
            <span style={{ fontSize: "48px" }}>🏪</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div style={styles.info}>
        <h2 style={styles.name}>{negocio.nombre}</h2>
        <div style={styles.meta}>
          <span style={styles.rating}>
            <FaStar size={14} color={theme.colors.warning} /> {Number(negocio.calificacion || 0).toFixed(1)}
          </span>
          <span style={styles.metaItem}>
            <FaClock size={12} /> {negocio.tiempoEstimadoMin} min
          </span>
          <span style={styles.metaItem}>
            Envío ${negocio.costoEnvio?.toLocaleString()}
          </span>
        </div>
        {negocio.descripcion && (
          <p style={styles.description}>{negocio.descripcion}</p>
        )}
        <div style={styles.addressRow}>
          <FaMapMarkerAlt size={14} color={theme.colors.textMuted} />
          <span style={styles.address}>{negocio.direccion}</span>
        </div>
        {negocio.telefono && (
          <div style={styles.addressRow}>
            <FaPhone size={14} color={theme.colors.textMuted} />
            <span style={styles.address}>{negocio.telefono}</span>
          </div>
        )}
      </div>

      {/* Categorías del menú */}
      <div style={styles.menuCategories}>
        <button
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
            key={cat}
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
        {filteredProductos.map((producto) => (
          <div key={producto.id} style={styles.productoCard}>
            <div style={styles.productoInfo}>
              <h4 style={styles.productoName}>{producto.nombre}</h4>
              {producto.descripcion && (
                <p style={styles.productoDesc}>{producto.descripcion}</p>
              )}
              <span style={styles.productoPrice}>
                ${producto.precio?.toLocaleString()}
              </span>
            </div>
            <div style={styles.productoRight}>
              {producto.imagen && (
                <img src={producto.imagen} alt={producto.nombre} style={styles.productoImg} />
              )}
              <button style={styles.addBtn} onClick={() => addToCart(producto)}>
                <FaPlus size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Carrito flotante */}
      {cartCount > 0 && (
        <div style={styles.floatingCart} onClick={() => navigate("/carrito", { state: { cart, negocio } })}>
          <span style={styles.cartCount}>{cartCount}</span>
          <span style={styles.cartText}>Ver carrito</span>
          <span style={styles.cartTotal}>${cartTotal.toLocaleString()}</span>
        </div>
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
  loadingPage: {
    minHeight: "100vh",
    backgroundColor: theme.colors.bgPrimary,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: `3px solid ${theme.colors.border}`,
    borderTopColor: theme.colors.accent,
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
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
    width: "36px",
    height: "36px",
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
    gap: "8px",
  },
  productoImg: {
    width: "64px",
    height: "64px",
    borderRadius: theme.borderRadius.sm,
    objectFit: "cover",
  },
  addBtn: {
    width: "32px",
    height: "32px",
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
    backgroundColor: theme.colors.accent,
    color: "#000",
    borderRadius: theme.borderRadius.xl,
    padding: "16px 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    cursor: "pointer",
    boxShadow: theme.shadows.button,
    zIndex: theme.zIndex.fixed,
    fontWeight: theme.fontWeight.bold,
  },
  cartCount: {
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    backgroundColor: "#000",
    color: theme.colors.accent,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold,
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
