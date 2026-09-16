import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaPhone, FaComments, FaMapMarkerAlt } from "react-icons/fa";
import theme from "../styles/theme";
import OrderStatusTimeline from "../components/OrderStatusTimeline";
import Avatar from "../components/common/Avatar";
import API_URL from "../config";

export default function Tracking() {
  const { pedidoId } = useParams();
  const navigate = useNavigate();
  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPedido();
    const interval = setInterval(fetchPedido, 15000);
    return () => clearInterval(interval);
  }, [pedidoId]);

  const fetchPedido = async () => {
    try {
      const token = localStorage.getItem("domiflex_token");
      const res = await fetch(`${API_URL}/pedidos/${pedidoId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPedido(data);
      }
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

  const estadoLabels = {
    CREADO: "Pedido confirmado",
    ASIGNADO: "Repartidor asignado",
    RECOGIENDO: "En recogida",
    EN_CAMINO: "En camino",
    ENTREGADO: "Entregado",
    CANCELADO: "Cancelado",
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate(-1)}>
          <FaArrowLeft size={18} />
        </button>
        <h1 style={styles.title}>Tu pedido en camino</h1>
        <span style={styles.liveBadge}>En vivo</span>
      </div>

      {/* Mapa placeholder */}
      <div style={styles.mapPlaceholder}>
        <FaMapMarkerAlt size={48} color={theme.colors.accent} />
        <p style={styles.mapText}>Mapa de seguimiento</p>
      </div>

      <div style={styles.content}>
        {/* Estado */}
        <div style={styles.statusCard}>
          <h3 style={styles.statusTitle}>
            {pedido.estado === "EN_CAMINO"
              ? `Tu pedido llegará en ${pedido.negocio?.tiempoEstimadoMin || 15} min`
              : estadoLabels[pedido.estado] || pedido.estado}
          </h3>
          <OrderStatusTimeline currentStatus={pedido.estado} />
        </div>

        {/* Repartidor */}
        {pedido.repartidor && (
          <div style={styles.driverCard}>
            <Avatar name={pedido.repartidor.nombre} size={48} />
            <div style={styles.driverInfo}>
              <h4 style={styles.driverName}>{pedido.repartidor.nombre}</h4>
              <span style={styles.driverLabel}>Tu domiciliario</span>
            </div>
            <div style={styles.driverActions}>
              <button style={styles.iconBtn}>
                <FaPhone size={16} />
              </button>
              <button style={styles.iconBtn}>
                <FaComments size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Detalle del pedido */}
        <div style={styles.detailCard}>
          <h3 style={styles.detailTitle}>Detalles del pedido</h3>
          {pedido.negocio && (
            <p style={styles.detailText}>{pedido.negocio.nombre}</p>
          )}
          {pedido.items?.map((item, i) => (
            <p key={i} style={styles.detailItem}>
              {item.cantidad}x {item.menuItem?.nombre} — ${(item.precio * item.cantidad).toLocaleString()}
            </p>
          ))}
          <div style={styles.detailDivider} />
          <div style={styles.detailRow}>
            <span style={styles.detailLabel}>Total</span>
            <span style={styles.detailTotal}>${Number(pedido.total).toLocaleString()}</span>
          </div>
          <div style={styles.detailRow}>
            <span style={styles.detailLabel}>Pago</span>
            <span style={styles.detailText}>Efectivo</span>
          </div>
        </div>

        <button style={styles.detailsBtn} onClick={() => navigate(`/pedido/${pedidoId}`)}>
          Ver detalles completos
        </button>
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
    flex: 1,
    textAlign: "center",
  },
  liveBadge: {
    backgroundColor: `${theme.colors.accent}20`,
    color: theme.colors.accent,
    padding: "4px 10px",
    borderRadius: theme.borderRadius.xl,
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
  },
  mapPlaceholder: {
    width: "100%",
    height: "250px",
    backgroundColor: theme.colors.bgCard,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    borderBottom: `1px solid ${theme.colors.border}`,
  },
  mapText: {
    color: theme.colors.textMuted,
    fontSize: theme.fontSize.sm,
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
  statusTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.accent,
    marginBottom: "16px",
  },
  driverCard: {
    backgroundColor: theme.colors.bgCard,
    borderRadius: theme.borderRadius.md,
    border: `1px solid ${theme.colors.border}`,
    padding: "16px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
  },
  driverLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  driverActions: {
    display: "flex",
    gap: "8px",
  },
  iconBtn: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    border: `1px solid ${theme.colors.border}`,
    backgroundColor: theme.colors.bgCard,
    color: theme.colors.accent,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  detailCard: {
    backgroundColor: theme.colors.bgCard,
    borderRadius: theme.borderRadius.md,
    border: `1px solid ${theme.colors.border}`,
    padding: "20px",
  },
  detailTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    marginBottom: "12px",
  },
  detailText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: "4px",
  },
  detailItem: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textPrimary,
    marginBottom: "4px",
  },
  detailDivider: {
    height: "1px",
    backgroundColor: theme.colors.border,
    margin: "12px 0",
  },
  detailRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "8px",
  },
  detailLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  detailTotal: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.accent,
  },
  detailsBtn: {
    width: "100%",
    padding: "14px",
    backgroundColor: "transparent",
    color: theme.colors.accent,
    border: `1px solid ${theme.colors.accent}`,
    borderRadius: theme.borderRadius.xl,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    cursor: "pointer",
    fontFamily: "'Inter', sans-serif",
  },
};
