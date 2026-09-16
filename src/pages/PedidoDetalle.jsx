import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import theme from "../styles/theme";
import OrderStatusTimeline from "../components/OrderStatusTimeline";
import API_URL from "../config";

export default function PedidoDetalle() {
  const { pedidoId } = useParams();
  const navigate = useNavigate();
  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPedido();
  }, [pedidoId]);

  const fetchPedido = async () => {
    try {
      const token = localStorage.getItem("domiflex_token");
      const res = await fetch(`${API_URL}/pedidos/${pedidoId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setPedido(await res.json());
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingPage}>
        <div style={styles.spinner} />
      </div>
    );
  }

  if (!pedido) {
    return (
      <div style={styles.loadingPage}>
        <p style={{ color: theme.colors.textSecondary }}>Pedido no encontrado</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate(-1)}>
          <FaArrowLeft size={18} />
        </button>
        <h1 style={styles.title}>Pedido #{pedido.idPedido}</h1>
        <div style={{ width: "36px" }} />
      </div>

      <div style={styles.content}>
        <div style={styles.statusCard}>
          <OrderStatusTimeline currentStatus={pedido.estado} />
        </div>

        {pedido.negocio && (
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>{pedido.negocio.nombre}</h3>
            <p style={styles.cardText}>{pedido.negocio.direccion}</p>
          </div>
        )}

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Items</h3>
          {pedido.items?.map((item, i) => (
            <div key={i} style={styles.itemRow}>
              <span style={styles.itemName}>{item.cantidad}x {item.menuItem?.nombre}</span>
              <span style={styles.itemPrice}>${(item.precio * item.cantidad).toLocaleString()}</span>
            </div>
          ))}
        </div>

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Resumen de pago</h3>
          <div style={styles.row}>
            <span style={styles.label}>Subtotal</span>
            <span style={styles.value}>${Number(pedido.subtotal || 0).toLocaleString()}</span>
          </div>
          <div style={styles.row}>
            <span style={styles.label}>Envío</span>
            <span style={styles.value}>${Number(pedido.negocio?.costoEnvio || 2000).toLocaleString()}</span>
          </div>
          <div style={styles.divider} />
          <div style={styles.row}>
            <span style={styles.totalLabel}>Total</span>
            <span style={styles.totalValue}>${Number(pedido.total).toLocaleString()}</span>
          </div>
          <div style={styles.row}>
            <span style={styles.label}>Método de pago</span>
            <span style={styles.value}>Efectivo</span>
          </div>
        </div>

        {pedido.dirEntrega && (
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Dirección de entrega</h3>
            <p style={styles.cardText}>{pedido.dirEntrega}</p>
          </div>
        )}

        {pedido.repartidor && (
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Repartidor</h3>
            <p style={styles.cardText}>{pedido.repartidor.nombre}</p>
            <p style={styles.cardText}>{pedido.repartidor.email}</p>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: theme.colors.bgPrimary,
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
  },
  content: {
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  statusCard: {
    backgroundColor: theme.colors.bgCard,
    borderRadius: theme.borderRadius.md,
    border: `1px solid ${theme.colors.border}`,
    padding: "20px",
  },
  card: {
    backgroundColor: theme.colors.bgCard,
    borderRadius: theme.borderRadius.md,
    border: `1px solid ${theme.colors.border}`,
    padding: "16px",
  },
  cardTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    marginBottom: "8px",
  },
  cardText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  itemRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "8px 0",
    borderBottom: `1px solid ${theme.colors.border}`,
  },
  itemName: {
    fontSize: theme.fontSize.sm,
  },
  itemPrice: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "8px",
  },
  label: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  value: {
    fontSize: theme.fontSize.sm,
  },
  divider: {
    height: "1px",
    backgroundColor: theme.colors.border,
    margin: "8px 0",
  },
  totalLabel: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
  },
  totalValue: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.accent,
  },
};
