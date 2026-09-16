import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaArrowLeft, FaTrash } from "react-icons/fa";
import theme from "../styles/theme";
import { Button } from "../components/common";
import CartItem from "../components/CartItem";

export default function Carrito() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart: initialCart = [], negocio = null } = location.state || {};

  const [cart, setCart] = useState(initialCart);

  const updateQuantity = (id, qty) => {
    if (qty <= 0) {
      setCart((prev) => prev.filter((item) => item.id !== id));
    } else {
      setCart((prev) =>
        prev.map((item) => (item.id === id ? { ...item, cantidad: qty } : item))
      );
    }
  };

  const removeItem = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
  const domicilio = negocio?.costoEnvio || 2000;
  const total = subtotal + domicilio;

  const handleCheckout = () => {
    // TODO: Implementar flujo de pago
    alert("Flujo de pago pendiente de implementar");
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate(-1)}>
          <FaArrowLeft size={18} />
        </button>
        <h1 style={styles.title}>Tu carrito</h1>
        <div style={{ width: "36px" }} />
      </div>

      {negocio && (
        <div style={styles.negocioInfo}>
          <span style={styles.negocioIcon}>🏪</span>
          <span style={styles.negocioName}>{negocio.nombre}</span>
        </div>
      )}

      <div style={styles.content}>
        {cart.length === 0 ? (
          <div style={styles.empty}>
            <span style={{ fontSize: "48px" }}>🛒</span>
            <p style={styles.emptyText}>Tu carrito está vacío</p>
            <Button variant="secondary" onClick={() => navigate("/restaurantes")}>
              Explorar negocios
            </Button>
          </div>
        ) : (
          <>
            <div style={styles.items}>
              {cart.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeItem}
                />
              ))}
            </div>

            {/* Cupón */}
            <div style={styles.couponSection}>
              <input
                type="text"
                placeholder="¿Tienes un cupón?"
                style={styles.couponInput}
              />
              <button style={styles.couponBtn}>Aplicar</button>
            </div>

            {/* Resumen */}
            <div style={styles.summary}>
              <div style={styles.summaryRow}>
                <span style={styles.summaryLabel}>Subtotal</span>
                <span style={styles.summaryValue}>${subtotal.toLocaleString()}</span>
              </div>
              <div style={styles.summaryRow}>
                <span style={styles.summaryLabel}>Domicilio</span>
                <span style={styles.summaryValue}>${domicilio.toLocaleString()}</span>
              </div>
              <div style={styles.summaryDivider} />
              <div style={styles.summaryRow}>
                <span style={styles.summaryTotalLabel}>Total</span>
                <span style={styles.summaryTotalValue}>${total.toLocaleString()}</span>
              </div>
            </div>

            <Button fullWidth onClick={handleCheckout}>
              Proceder al pago — ${total.toLocaleString()}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: theme.colors.bgPrimary,
    paddingBottom: "40px",
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
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
  },
  negocioInfo: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 16px",
    backgroundColor: theme.colors.bgCard,
    borderBottom: `1px solid ${theme.colors.border}`,
  },
  negocioIcon: {
    fontSize: "24px",
  },
  negocioName: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
  },
  content: {
    padding: "16px",
  },
  empty: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px 0",
    gap: "16px",
  },
  emptyText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.md,
  },
  items: {
    marginBottom: "24px",
  },
  couponSection: {
    display: "flex",
    gap: "8px",
    marginBottom: "24px",
  },
  couponInput: {
    flex: 1,
    backgroundColor: theme.colors.bgInput,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.sm,
    padding: "12px 16px",
    color: theme.colors.textPrimary,
    fontSize: theme.fontSize.md,
    outline: "none",
    fontFamily: "'Inter', sans-serif",
  },
  couponBtn: {
    backgroundColor: theme.colors.bgCard,
    color: theme.colors.accent,
    border: `1px solid ${theme.colors.accent}`,
    borderRadius: theme.borderRadius.sm,
    padding: "12px 20px",
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    cursor: "pointer",
    fontFamily: "'Inter', sans-serif",
  },
  summary: {
    backgroundColor: theme.colors.bgCard,
    borderRadius: theme.borderRadius.md,
    border: `1px solid ${theme.colors.border}`,
    padding: "20px",
    marginBottom: "24px",
  },
  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "12px",
  },
  summaryLabel: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  summaryValue: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
  },
  summaryDivider: {
    height: "1px",
    backgroundColor: theme.colors.border,
    margin: "12px 0",
  },
  summaryTotalLabel: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
  },
  summaryTotalValue: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.accent,
  },
};
