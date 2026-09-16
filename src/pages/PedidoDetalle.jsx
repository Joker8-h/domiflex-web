import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import theme from "../styles/theme";
import OrderStatusTimeline from "../components/OrderStatusTimeline";
import { SkeletonCard } from "../components/ui/Skeleton";
import ErrorState from "../components/ui/ErrorState";
import EmptyState from "../components/ui/EmptyState";
import { api } from "../api/client";

export default function PedidoDetalle() {
  const { pedidoId } = useParams();
  const navigate = useNavigate();
  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const fetchPedido = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.get(`/pedidos/${pedidoId}`, { signal: controller.signal });
        if (!controller.signal.aborted) setPedido(data);
      } catch (err) {
        if (!controller.signal.aborted) {
          console.error("Error:", err);
          setError(err.message || "No se pudo cargar el pedido.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    fetchPedido();
    return () => controller.abort();
  }, [pedidoId, retryKey]);

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.header}>
          <div style={{ width: "44px" }} />
          <h1 style={styles.title}>Pedido #{pedidoId}</h1>
          <div style={{ width: "44px" }} />
        </div>
        <div style={styles.content} aria-busy="true" aria-label="Cargando pedido">
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
            <ArrowLeft size={18} aria-hidden="true" />
          </button>
          <h1 style={styles.title}>Pedido #{pedidoId}</h1>
          <div style={{ width: "44px" }} aria-hidden="true" />
        </div>
        <ErrorState
          title="No pudimos cargar el pedido"
          description={error}
          onRetry={() => setRetryKey((k) => k + 1)}
        />
      </div>
    );
  }

  if (!pedido) {
    return (
      <div style={styles.page}>
        <div style={styles.header}>
          <button type="button" aria-label="Volver" style={styles.backBtn} onClick={() => navigate(-1)}>
            <ArrowLeft size={18} aria-hidden="true" />
          </button>
          <h1 style={styles.title}>Pedido #{pedidoId}</h1>
          <div style={{ width: "44px" }} aria-hidden="true" />
        </div>
        <EmptyState
          icon="📦"
          title="Pedido no encontrado"
          description="Verifica el número de pedido o vuelve a tus pedidos."
          actionLabel="Ver mis pedidos"
          onAction={() => navigate("/mis-pedidos")}
        />
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <button type="button" aria-label="Volver" style={styles.backBtn} onClick={() => navigate(-1)}>
          <ArrowLeft size={18} aria-hidden="true" />
        </button>
        <h1 style={styles.title}>Pedido #{pedido.idPedido}</h1>
        <div style={{ width: "44px" }} aria-hidden="true" />
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
            <div key={item.id || i} style={styles.itemRow}>
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
  },
  content: {
    padding: "16px",
    paddingBottom: "100px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    maxWidth: "640px",
    margin: "0 auto",
    width: "100%",
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
