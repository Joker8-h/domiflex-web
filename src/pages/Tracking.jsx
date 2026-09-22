import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MessageCircle, Phone } from "lucide-react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import theme from "../styles/theme";
import OrderStatusTimeline from "../components/OrderStatusTimeline";
import Avatar from "../components/common/Avatar";
import { SkeletonCard } from "../components/ui/Skeleton";
import ErrorState from "../components/ui/ErrorState";
import EmptyState from "../components/ui/EmptyState";
import { api } from "../api/client";
import { useSocket } from "./context/SocketContext";

const POLL_MS = 15000;
const POPAYAN = [2.4448, -76.6147];

const pinIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const driverIcon = L.divIcon({
  className: "",
  html: `<div style="width:18px;height:18px;border-radius:50%;background:#00E676;border:3px solid #0D1117;box-shadow:0 0 0 4px rgba(0,230,118,.35)"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

function FitBounds({ points }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView(points[0], 15);
      return;
    }
    map.fitBounds(points, { padding: [28, 28] });
  }, [map, points]);
  return null;
}

function toPoint(lat, lng) {
  const la = Number(lat);
  const ln = Number(lng);
  if (!Number.isFinite(la) || !Number.isFinite(ln)) return null;
  return [la, ln];
}

export default function Tracking() {
  const { pedidoId } = useParams();
  const navigate = useNavigate();
  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryKey, setRetryKey] = useState(0);
  const [live, setLive] = useState(false);
  const [driverPos, setDriverPos] = useState(null);
  const [pago, setPago] = useState(null);
  const [confirmandoPago, setConfirmandoPago] = useState(false);
  const socketApi = useSocket();

  const fetchPedido = useCallback(async (signal) => {
    try {
      const data = await api.get(`/pedidos/${pedidoId}`, { signal });
      if (signal?.aborted) return;
      if (data?.error || !data?.idPedido) {
        setPedido(null);
        setError(data?.error || "Pedido no encontrado");
        return;
      }
      setPedido(data);
      setError(null);
    } catch (err) {
      if (!signal?.aborted) {
        console.error("Error:", err);
        setError(err.message || "No se pudo cargar el pedido.");
      }
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [pedidoId]);

  useEffect(() => {
    const controller = new AbortController();
    fetchPedido(controller.signal);
    const interval = setInterval(() => fetchPedido(controller.signal), POLL_MS);

    // Tiempo real por socket cuando está disponible; el polling queda de respaldo.
    let cleanupSocket = null;
    try {
      const { socket, joinPedido, leavePedido } = socketApi || {};
      if (socket && joinPedido) {
        joinPedido(pedidoId);
        setLive(true);
        const onUpdate = () => fetchPedido(controller.signal);
        const onLocation = (data) => {
          if (String(data?.idPedido) !== String(pedidoId)) return;
          if (data.lat == null || data.lng == null) return;
          setDriverPos([Number(data.lat), Number(data.lng)]);
        };
        socket.on("pedido_actualizado", onUpdate);
        socket.on("pedido_estado", onUpdate);
        socket.on("location_updated", onLocation);
        cleanupSocket = () => {
          socket.off("pedido_actualizado", onUpdate);
          socket.off("pedido_estado", onUpdate);
          socket.off("location_updated", onLocation);
          if (leavePedido) leavePedido(pedidoId);
        };
      }
    } catch (err) {
      console.error("Socket no disponible, usando polling:", err.message);
    }

    return () => {
      controller.abort();
      clearInterval(interval);
      if (cleanupSocket) cleanupSocket();
    };
  }, [pedidoId, retryKey, fetchPedido, socketApi]);

  useEffect(() => {
    if (pedido?.estado !== "ENTREGADO") {
      setPago(null);
      return undefined;
    }
    let cancelado = false;
    api.get(`/pagos/pedido/${pedidoId}`)
      .then((lista) => {
        if (!cancelado) setPago(Array.isArray(lista) ? lista[0] || null : null);
      })
      .catch(() => {
        if (!cancelado) setPago(null);
      });
    return () => { cancelado = true; };
  }, [pedido?.estado, pedidoId]);

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.header}>
          <div style={{ width: "44px" }} />
          <h1 style={styles.title}>Tu pedido en camino</h1>
          <div style={{ width: "44px" }} />
        </div>
        <div style={styles.content} aria-busy="true" aria-label="Cargando pedido">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  if (error && !pedido) {
    return (
      <div style={styles.page}>
        <div style={styles.header}>
          <button type="button" aria-label="Volver" style={styles.backBtn} onClick={() => navigate(-1)}>
            <ArrowLeft size={18} aria-hidden="true" />
          </button>
          <h1 style={styles.title}>Tu pedido en camino</h1>
          <div style={{ width: "44px" }} aria-hidden="true" />
        </div>
        <ErrorState
          title="No pudimos cargar el pedido"
          description={error}
          onRetry={() => { setLoading(true); setRetryKey((k) => k + 1); }}
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
          <h1 style={styles.title}>Tu pedido en camino</h1>
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

  const estadoLabels = {
    CREADO: "Pedido confirmado",
    ASIGNADO: "Repartidor asignado",
    RECOGIENDO: "En recogida",
    EN_CAMINO: "En camino",
    ENTREGADO: "Entregado",
    CANCELADO: "Cancelado",
  };

  const puntos = [
    toPoint(pedido.latRecogida, pedido.lngRecogida),
    toPoint(pedido.latEntrega, pedido.lngEntrega),
    driverPos,
  ].filter(Boolean);
  const centro = puntos[0] || POPAYAN;

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <button type="button" aria-label="Volver" style={styles.backBtn} onClick={() => navigate(-1)}>
          <ArrowLeft size={18} aria-hidden="true" />
        </button>
        <h1 style={styles.title}>Tu pedido en camino</h1>
        <span style={styles.liveBadge} aria-live="polite">{live ? "En vivo" : "Actualizando"}</span>
      </div>

      <div style={styles.mapWrap}>
        <MapContainer center={centro} zoom={14} style={{ width: "100%", height: "100%" }} scrollWheelZoom={false}>
          <TileLayer
            attribution='&copy; OpenStreetMap'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FitBounds points={puntos.length ? puntos : [centro]} />
          {toPoint(pedido.latRecogida, pedido.lngRecogida) && (
            <Marker position={toPoint(pedido.latRecogida, pedido.lngRecogida)} icon={pinIcon}>
              <Popup>Recogida{pedido.negocio?.nombre ? `: ${pedido.negocio.nombre}` : ""}</Popup>
            </Marker>
          )}
          {toPoint(pedido.latEntrega, pedido.lngEntrega) && (
            <Marker position={toPoint(pedido.latEntrega, pedido.lngEntrega)} icon={pinIcon}>
              <Popup>Entrega: {pedido.dirEntrega || "Tu dirección"}</Popup>
            </Marker>
          )}
          {driverPos && (
            <Marker position={driverPos} icon={driverIcon}>
              <Popup>Domiciliario</Popup>
            </Marker>
          )}
        </MapContainer>
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
              <button type="button" aria-label={`Llamar a ${pedido.repartidor.nombre}`} style={styles.iconBtn}>
                <Phone size={16} aria-hidden="true" />
              </button>
              <button type="button" aria-label={`Enviar mensaje a ${pedido.repartidor.nombre}`} style={styles.iconBtn}>
                <MessageCircle size={16} aria-hidden="true" />
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
            <p key={item.id || i} style={styles.detailItem}>
              {item.cantidad}x {item.menuItem?.nombre} — ${(item.precio * item.cantidad).toLocaleString()}
            </p>
          ))}
          <div style={styles.detailDivider} />
          <div style={styles.detailRow}>
            <span style={styles.detailLabel}>Total</span>
            <span style={styles.detailTotal}>${Number(pedido.total || 0).toLocaleString()}</span>
          </div>
          <div style={styles.detailRow}>
            <span style={styles.detailLabel}>Pago</span>
            <span style={styles.detailText}>
              {pago?.estado === "COMPLETADO"
                ? "Efectivo confirmado"
                : pago?.confirmacionCliente
                  ? "Efectivo enviado. Falta el domiciliario."
                  : "Efectivo"}
            </span>
          </div>
        </div>

        {pedido.estado === "ENTREGADO" && pago && !pago.confirmacionCliente && (
          <button
            type="button"
            style={styles.payBtn}
            disabled={confirmandoPago}
            onClick={async () => {
              setConfirmandoPago(true);
              try {
                const actualizado = await api.put(`/pagos/confirmarCliente/${pago.idPago}`);
                setPago(actualizado);
              } catch (err) {
                setError(err.message || "No se pudo confirmar el pago.");
              } finally {
                setConfirmandoPago(false);
              }
            }}
          >
            {confirmandoPago ? "Confirmando…" : "Ya pagué en efectivo"}
          </button>
        )}

        <button type="button" style={styles.detailsBtn} onClick={() => navigate(`/pedido/${pedidoId}`)}>
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
  liveBadge: {
    backgroundColor: `${theme.colors.accent}20`,
    color: theme.colors.accent,
    padding: "4px 10px",
    borderRadius: theme.borderRadius.xl,
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
  },
  mapWrap: {
    width: "100%",
    height: "280px",
    backgroundColor: theme.colors.bgCard,
    borderBottom: `1px solid ${theme.colors.border}`,
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
    width: "44px",
    height: "44px",
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
  payBtn: {
    width: "100%",
    padding: "14px",
    minHeight: "48px",
    border: "none",
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.accent,
    color: "#0D1117",
    fontWeight: theme.fontWeight.bold,
    cursor: "pointer",
    fontFamily: "'Montserrat', sans-serif",
  },
  detailsBtn: {
    width: "100%",
    padding: "14px",
    minHeight: "48px",
    backgroundColor: "transparent",
    color: theme.colors.accent,
    border: `1px solid ${theme.colors.accent}`,
    borderRadius: theme.borderRadius.xl,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    cursor: "pointer",
    fontFamily: "'Montserrat', sans-serif",
  },
};
