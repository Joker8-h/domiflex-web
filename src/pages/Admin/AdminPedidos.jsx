import React, { useState, useEffect, useCallback } from "react";
import { Package, Search, Clock, User, Store, Bike, CheckCircle, AlertTriangle, RefreshCw, XCircle } from "lucide-react";
import toast from "react-hot-toast";
import theme from "../../styles/theme";
import tokens from "../../design/tokens";
import { api } from "../../api/client";
import { useSocket } from "../context/SocketContext";
import { SkeletonCard } from "../../components/ui/Skeleton";
import ErrorState from "../../components/ui/ErrorState";
import EmptyState from "../../components/ui/EmptyState";

export default function AdminPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("TODOS");
  const [cancelandoId, setCancelandoId] = useState(null);

  const { socket } = useSocket() || {};

  const fetchPedidos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.get("/pedidos/admin/todos");
      setPedidos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error al cargar pedidos para admin:", err);
      setError(err.message || "No se pudo cargar la lista de pedidos.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPedidos();
  }, [fetchPedidos]);

  // Sockets en tiempo real: actualizar la lista cuando haya actividad
  useEffect(() => {
    if (!socket) return;

    const onPedidoActualizado = () => {
      fetchPedidos();
    };

    socket.on("pedido_actualizado", onPedidoActualizado);
    socket.on("pedido_estado", onPedidoActualizado);
    socket.on("nuevo_pedido_disponible", onPedidoActualizado);

    return () => {
      socket.off("pedido_actualizado", onPedidoActualizado);
      socket.off("pedido_estado", onPedidoActualizado);
      socket.off("nuevo_pedido_disponible", onPedidoActualizado);
    };
  }, [socket, fetchPedidos]);

  const handleCancelar = async (idPedido) => {
    if (!window.confirm(`¿Estás seguro de cancelar el pedido #${idPedido}? Esta acción no se puede deshacer.`)) {
      return;
    }
    try {
      setCancelandoId(idPedido);
      await api.post(`/pedidos/${idPedido}/cancelar`);
      toast.success(`Pedido #${idPedido} cancelado.`);
      fetchPedidos();
    } catch (err) {
      toast.error(err.message || "Error al cancelar el pedido.");
    } finally {
      setCancelandoId(null);
    }
  };

  const pedidosFiltrados = pedidos.filter((p) => {
    const matchEstado = filtroEstado === "TODOS" || p.estado === filtroEstado;
    const term = busqueda.toLowerCase();
    const matchBusqueda =
      String(p.idPedido).includes(term) ||
      (p.cliente?.nombre && p.cliente.nombre.toLowerCase().includes(term)) ||
      (p.repartidor?.nombre && p.repartidor.nombre.toLowerCase().includes(term)) ||
      (p.negocio?.nombre && p.negocio.nombre.toLowerCase().includes(term)) ||
      (p.dirEntrega && p.dirEntrega.toLowerCase().includes(term));
    return matchEstado && matchBusqueda;
  });

  const totalPedidos = pedidos.length;
  const pedidosEnRuta = pedidos.filter((p) => ["ASIGNADO", "RECOGIENDO", "EN_CAMINO"].includes(p.estado)).length;
  const pedidosEntregados = pedidos.filter((p) => p.estado === "ENTREGADO").length;
  const totalFacturado = pedidos
    .filter((p) => p.estado === "ENTREGADO")
    .reduce((sum, p) => sum + (Number(p.total) || 0), 0);

  const getEstadoStyle = (estado) => {
    switch (estado) {
      case "CREADO":
        return { bg: "rgba(255, 193, 7, 0.15)", color: "#FFC107", border: "#FFC107" };
      case "ASIGNADO":
        return { bg: "rgba(33, 150, 243, 0.15)", color: "#2196F3", border: "#2196F3" };
      case "RECOGIENDO":
        return { bg: "rgba(156, 39, 176, 0.15)", color: "#9C27B0", border: "#9C27B0" };
      case "EN_CAMINO":
        return { bg: "rgba(0, 188, 212, 0.15)", color: "#00BCD4", border: "#00BCD4" };
      case "ENTREGADO":
        return { bg: `${theme.colors.accent}15`, color: theme.colors.accent, border: theme.colors.accent };
      case "CANCELADO":
      default:
        return { bg: "rgba(239, 68, 68, 0.15)", color: "#EF4444", border: "#EF4444" };
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Monitor de Pedidos en Vivo</h1>
          <p style={styles.subtitle}>
            Control operativo de despachos, repartos y entregas en tiempo real en Popayán.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchPedidos}
          style={styles.refreshBtn}
          aria-label="Refrescar lista de pedidos"
        >
          <RefreshCw size={16} /> Actualizar
        </button>
      </header>

      {/* Métricas Principales */}
      <div style={styles.metricsGrid}>
        <div style={styles.metricCard}>
          <span style={styles.metricLabel}>Total Registrados</span>
          <strong style={styles.metricValue}>{totalPedidos}</strong>
        </div>
        <div style={styles.metricCard}>
          <span style={styles.metricLabel}>En Curso / Ruta</span>
          <strong style={{ ...styles.metricValue, color: "#2196F3" }}>{pedidosEnRuta}</strong>
        </div>
        <div style={styles.metricCard}>
          <span style={styles.metricLabel}>Entregados</span>
          <strong style={{ ...styles.metricValue, color: theme.colors.accent }}>{pedidosEntregados}</strong>
        </div>
        <div style={styles.metricCard}>
          <span style={styles.metricLabel}>Facturación Entregada</span>
          <strong style={{ ...styles.metricValue, color: theme.colors.accent }}>
            ${totalFacturado.toLocaleString()} COP
          </strong>
        </div>
      </div>

      {/* Filtros de Estado y Búsqueda */}
      <div style={styles.filterBar}>
        <div style={styles.searchBox}>
          <Search size={18} color={theme.colors.textSecondary} />
          <input
            type="text"
            placeholder="Buscar por ID, cliente, repartidor, restaurante..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={styles.searchInput}
          />
        </div>
        <div style={styles.estadoTabs}>
          {["TODOS", "CREADO", "ASIGNADO", "RECOGIENDO", "EN_CAMINO", "ENTREGADO", "CANCELADO"].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setFiltroEstado(st)}
              style={{
                ...styles.estadoTab,
                backgroundColor: filtroEstado === st ? `${theme.colors.accent}20` : "transparent",
                color: filtroEstado === st ? theme.colors.accent : theme.colors.textSecondary,
                borderColor: filtroEstado === st ? theme.colors.accent : theme.colors.border,
              }}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Listado de Pedidos */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : error ? (
        <ErrorState
          title="Error al cargar pedidos"
          description={error}
          onRetry={fetchPedidos}
        />
      ) : pedidosFiltrados.length === 0 ? (
        <EmptyState
          icon="📦"
          title="No hay pedidos con este filtro"
          description="Verifica los términos de búsqueda o selecciona otro estado."
        />
      ) : (
        <div style={styles.pedidosList}>
          {pedidosFiltrados.map((pedido) => {
            const stStyle = getEstadoStyle(pedido.estado);
            return (
              <div key={pedido.idPedido} style={styles.pedidoCard}>
                <div style={styles.pedidoHeader}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={styles.pedidoIcon}>
                      <Package size={20} color={theme.colors.accent} />
                    </div>
                    <div>
                      <strong style={styles.pedidoId}>Pedido #{pedido.idPedido}</strong>
                      <span style={styles.pedidoFecha}>
                        {pedido.creadoEn ? new Date(pedido.creadoEn).toLocaleString() : "Reciente"}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span
                      style={{
                        ...styles.statusBadge,
                        backgroundColor: stStyle.bg,
                        color: stStyle.color,
                        borderColor: stStyle.border,
                      }}
                    >
                      {pedido.estado}
                    </span>
                    <strong style={styles.pedidoTotal}>
                      ${Number(pedido.total || 0).toLocaleString()} COP
                    </strong>
                  </div>
                </div>

                <div style={styles.pedidoDetailsGrid}>
                  <div style={styles.detailCol}>
                    <span style={styles.detailColLabel}>
                      <User size={14} /> Cliente:
                    </span>
                    <strong style={styles.detailColValue}>
                      {pedido.cliente?.nombre || "Usuario DomiFlex"}
                    </strong>
                    {pedido.cliente?.telefono && (
                      <span style={styles.subText}>{pedido.cliente.telefono}</span>
                    )}
                  </div>

                  <div style={styles.detailCol}>
                    <span style={styles.detailColLabel}>
                      <Store size={14} /> Comercio / Origen:
                    </span>
                    <strong style={styles.detailColValue}>
                      {pedido.negocio?.nombre || "Comercio aliado"}
                    </strong>
                    <span style={styles.subText}>
                      {pedido.negocio?.direccion || "Popayán"}
                    </span>
                  </div>

                  <div style={styles.detailCol}>
                    <span style={styles.detailColLabel}>
                      <Bike size={14} /> Domiciliario:
                    </span>
                    <strong style={styles.detailColValue}>
                      {pedido.repartidor?.nombre || "Sin asignar"}
                    </strong>
                    {pedido.repartidor?.telefono && (
                      <span style={styles.subText}>{pedido.repartidor.telefono}</span>
                    )}
                  </div>
                </div>

                {/* Ítems del Pedido */}
                {pedido.items && pedido.items.length > 0 && (
                  <div style={styles.itemsSummary}>
                    <span style={styles.itemsSummaryLabel}>Contenido:</span>
                    {pedido.items.map((it, idx) => (
                      <span key={it.id || idx} style={styles.itemTag}>
                        {it.cantidad}x {it.menuItem?.nombre || "Producto"}
                      </span>
                    ))}
                  </div>
                )}

                {/* Pie de Pedido y Acciones */}
                <div style={styles.pedidoFooter}>
                  <span style={styles.dirEntrega}>
                    <strong>Entrega:</strong> {pedido.dirEntrega || "Dirección no especificada"}
                  </span>
                  {pedido.estado !== "ENTREGADO" && pedido.estado !== "CANCELADO" && (
                    <button
                      type="button"
                      disabled={cancelandoId === pedido.idPedido}
                      onClick={() => handleCancelar(pedido.idPedido)}
                      style={styles.cancelBtn}
                    >
                      <XCircle size={15} /> Cancelar Pedido
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: "24px 20px 100px",
    maxWidth: "1100px",
    margin: "0 auto",
    color: theme.colors.textPrimary,
    fontFamily: "'Montserrat', sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "24px",
    flexWrap: "wrap",
    gap: "16px",
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    margin: "0 0 4px 0",
    color: theme.colors.textPrimary,
  },
  subtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    margin: 0,
  },
  refreshBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: theme.colors.bgCard,
    border: `1px solid ${theme.colors.border}`,
    color: theme.colors.textPrimary,
    padding: "10px 16px",
    borderRadius: theme.borderRadius.sm,
    fontSize: theme.fontSize.sm,
    fontWeight: 600,
    cursor: "pointer",
    minHeight: "44px",
  },
  metricsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
    marginBottom: "24px",
  },
  metricCard: {
    backgroundColor: theme.colors.bgCard,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.md,
    padding: "16px 20px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  metricLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    fontWeight: 600,
  },
  metricValue: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textPrimary,
  },
  filterBar: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    marginBottom: "24px",
  },
  searchBox: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    backgroundColor: theme.colors.bgCard,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.sm,
    padding: "0 14px",
    minHeight: "48px",
  },
  searchInput: {
    background: "transparent",
    border: "none",
    color: theme.colors.textPrimary,
    fontSize: theme.fontSize.sm,
    outline: "none",
    width: "100%",
    fontFamily: "'Montserrat', sans-serif",
  },
  estadoTabs: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },
  estadoTab: {
    border: "1px solid",
    padding: "6px 14px",
    borderRadius: theme.borderRadius.xl,
    fontSize: theme.fontSize.xs,
    fontWeight: 600,
    cursor: "pointer",
    minHeight: "38px",
  },
  pedidosList: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  pedidoCard: {
    backgroundColor: theme.colors.bgCard,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.md,
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  pedidoHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "12px",
    borderBottom: `1px solid ${theme.colors.border}40`,
    paddingBottom: "12px",
  },
  pedidoIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    backgroundColor: `${theme.colors.accent}15`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  pedidoId: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textPrimary,
  },
  pedidoFecha: {
    display: "block",
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginTop: "2px",
  },
  statusBadge: {
    fontSize: "11px",
    fontWeight: 700,
    padding: "4px 10px",
    borderRadius: "12px",
    border: "1px solid",
  },
  pedidoTotal: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.accent,
  },
  pedidoDetailsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
  },
  detailCol: {
    display: "flex",
    flexDirection: "column",
    gap: "3px",
  },
  detailColLabel: {
    fontSize: "11px",
    color: theme.colors.textSecondary,
    display: "flex",
    alignItems: "center",
    gap: "5px",
    fontWeight: 600,
  },
  detailColValue: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textPrimary,
  },
  subText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  itemsSummary: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
    alignItems: "center",
    backgroundColor: "#0D1117",
    padding: "10px",
    borderRadius: theme.borderRadius.sm,
    border: `1px solid ${theme.colors.border}`,
  },
  itemsSummaryLabel: {
    fontSize: "11px",
    color: theme.colors.textSecondary,
    fontWeight: 600,
  },
  itemTag: {
    backgroundColor: `${theme.colors.accent}15`,
    color: theme.colors.accent,
    padding: "2px 8px",
    borderRadius: "6px",
    fontSize: "11px",
    fontWeight: 500,
  },
  pedidoFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "12px",
    borderTop: `1px solid ${theme.colors.border}40`,
    paddingTop: "12px",
  },
  dirEntrega: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  cancelBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    color: "#EF4444",
    border: "1px solid #EF4444",
    borderRadius: theme.borderRadius.sm,
    padding: "6px 12px",
    fontSize: theme.fontSize.xs,
    fontWeight: 600,
    cursor: "pointer",
    minHeight: "36px",
  },
};
