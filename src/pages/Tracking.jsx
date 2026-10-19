import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  MessageCircle, 
  Phone, 
  Star, 
  Send, 
  Bike, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  ShoppingBag,
  Store,
  ChevronRight,
  ShieldCheck
} from "lucide-react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import tokens from "../design/tokens";
import NavbarCustom from "../components/Navbar";
import OrderStatusTimeline from "../components/OrderStatusTimeline";
import Avatar from "../components/common/Avatar";
import Modal from "../components/ui/Modal";
import { SkeletonCard } from "../components/ui/Skeleton";
import ErrorState from "../components/ui/ErrorState";
import EmptyState from "../components/ui/EmptyState";
import { api } from "../api/client";
import { useSocket } from "./context/SocketContext";
import { useAuth } from "./context/AuthContext";

const POLL_MS = 15000;
const POPAYAN = [2.4448, -76.6147];

// Custom HTML Markers for Dark Map
const restaurantPinIcon = L.divIcon({
  className: "custom-pin",
  html: `<div style="background:#FF6B4A;width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid #0B1F44;box-shadow:0 0 12px rgba(255,107,74,0.6);font-size:16px;">🏪</div>`,
  iconSize: [34, 34],
  iconAnchor: [17, 17],
  popupAnchor: [0, -20],
});

const deliveryPinIcon = L.divIcon({
  className: "custom-pin",
  html: `<div style="background:#00E576;width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid #0B1F44;box-shadow:0 0 12px rgba(0,229,118,0.7);font-size:16px;">📍</div>`,
  iconSize: [34, 34],
  iconAnchor: [17, 17],
  popupAnchor: [0, -20],
});

const driverIcon = L.divIcon({
  className: "custom-driver-pin",
  html: `<div style="position:relative;width:40px;height:40px;border-radius:50%;background:#00E576;display:flex;align-items:center;justify-content:center;border:3px solid #0B1F44;box-shadow:0 0 16px rgba(0,229,118,0.9);">
    <span style="font-size:20px;">🛵</span>
  </div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -22],
});

function FitBounds({ points }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView(points[0], 15);
      return;
    }
    map.fitBounds(points, { padding: [40, 40] });
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
  const { usuario } = useAuth();
  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryKey, setRetryKey] = useState(0);
  const [live, setLive] = useState(false);
  const [driverPos, setDriverPos] = useState(null);
  const [pago, setPago] = useState(null);
  const [confirmandoPago, setConfirmandoPago] = useState(false);
  
  // Chat en tiempo real
  const [chatOpen, setChatOpen] = useState(false);
  const [mensajes, setMensajes] = useState([]);
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const [cargandoChat, setCargandoChat] = useState(false);

  // Calificación
  const [modalCalificar, setModalCalificar] = useState(false);
  const [puntuacion, setPuntuacion] = useState(5);
  const [comentario, setComentario] = useState("");
  const [enviandoCalificacion, setEnviandoCalificacion] = useState(false);
  const [yaCalificado, setYaCalificado] = useState(false);
  const [calificacionExito, setCalificacionExito] = useState(false);

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
        console.error("Error al cargar pedido:", err);
        setError(err.message || "No se pudo cargar el pedido.");
      }
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [pedidoId]);

  const fetchChat = useCallback(async () => {
    try {
      setCargandoChat(true);
      const res = await api.get(`/chat/pedido/${pedidoId}`);
      if (res?.mensajes) {
        setMensajes(res.mensajes);
      }
    } catch (err) {
      console.error("Error al cargar historial de chat:", err);
    } finally {
      setCargandoChat(false);
    }
  }, [pedidoId]);

  useEffect(() => {
    const controller = new AbortController();
    fetchPedido(controller.signal);
    const interval = setInterval(() => fetchPedido(controller.signal), POLL_MS);

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
        const onNuevoMensaje = (msg) => {
          if (String(msg?.idPedido) === String(pedidoId)) {
            setMensajes((prev) => [...prev, msg]);
          }
        };
        const onPagoActualizado = (datosPago) => {
          if (String(datosPago?.idPedido) === String(pedidoId)) {
            setPago((prev) => ({ ...(prev || {}), ...datosPago, estado: datosPago.estado || "COMPLETADO" }));
          }
        };

        socket.on("pedido_actualizado", onUpdate);
        socket.on("pedido_estado", onUpdate);
        socket.on("location_updated", onLocation);
        socket.on("nuevo_mensaje", onNuevoMensaje);
        socket.on("pago_completado", onPagoActualizado);
        socket.on("pago_actualizado", onPagoActualizado);

        cleanupSocket = () => {
          socket.off("pedido_actualizado", onUpdate);
          socket.off("pedido_estado", onUpdate);
          socket.off("location_updated", onLocation);
          socket.off("nuevo_mensaje", onNuevoMensaje);
          socket.off("pago_completado", onPagoActualizado);
          socket.off("pago_actualizado", onPagoActualizado);
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

  const handleLlamar = () => {
    const tel = pedido?.repartidor?.telefono;
    if (tel) {
      window.open(`tel:${tel}`, "_self");
    } else {
      alert("El domiciliario no tiene un número telefónico público registrado.");
    }
  };

  const handleEnviarMensaje = async (e) => {
    e?.preventDefault();
    if (!nuevoMensaje.trim()) return;
    const texto = nuevoMensaje.trim();
    setNuevoMensaje("");
    const remitente = usuario?.nombre || "Cliente";
    const idRemitente = usuario?.idUsuarios || usuario?.idUsuario || usuario?.id || 0;
    if (socketApi?.socket?.connected) {
      socketApi.socket.emit("send_chat_message", {
        idPedido: pedidoId,
        remitente,
        mensaje: texto,
        idRemitente,
      });
    } else {
      try {
        const msg = await api.post("/chat/mensajes", {
          idPedido: pedidoId,
          mensaje: texto,
        });
        if (msg) setMensajes((prev) => [...prev, msg]);
      } catch (err) {
        console.error("Error enviando mensaje por API:", err);
      }
    }
  };

  const handleCalificar = async (e) => {
    e?.preventDefault();
    setEnviandoCalificacion(true);
    try {
      const idCalificado = pedido?.repartidor?.idUsuarios || pedido?.repartidor?.idUsuario || pedido?.idRepartidor || pedido?.idComercio;
      await api.post("/calificaciones", {
        idPedido: pedido.idPedido,
        idCalificado,
        puntuacion,
        comentario,
      });
      setCalificacionExito(true);
      setYaCalificado(true);
      setTimeout(() => {
        setModalCalificar(false);
      }, 1500);
    } catch (err) {
      console.error("Error al enviar calificación:", err);
      alert(err.message || "No se pudo registrar la calificación.");
    } finally {
      setEnviandoCalificacion(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <NavbarCustom />
        <div style={styles.container}>
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  if (error && !pedido) {
    return (
      <div style={styles.page}>
        <NavbarCustom />
        <div style={styles.container}>
          <ErrorState
            title="No pudimos cargar el seguimiento"
            description={error}
            onRetry={() => { setLoading(true); setRetryKey((k) => k + 1); }}
          />
        </div>
      </div>
    );
  }

  if (!pedido) {
    return (
      <div style={styles.page}>
        <NavbarCustom />
        <div style={styles.container}>
          <EmptyState
            icon="📦"
            title="Pedido no encontrado"
            description="No encontramos información de este pedido en curso."
            actionLabel="Ver mis pedidos"
            onAction={() => navigate("/mis-pedidos")}
          />
        </div>
      </div>
    );
  }

  const puntos = [
    toPoint(pedido.latRecogida, pedido.lngRecogida),
    toPoint(pedido.latEntrega, pedido.lngEntrega),
    driverPos,
  ].filter(Boolean);
  const centro = puntos[0] || POPAYAN;

  return (
    <div style={styles.page}>
      <NavbarCustom />

      <main style={styles.container}>
        {/* Top Header */}
        <div style={styles.topHeader}>
          <button 
            type="button" 
            style={styles.backBtn}
            onClick={() => navigate(-1)}
            aria-label="Volver"
          >
            <ArrowLeft size={18} />
            <span>Volver</span>
          </button>

          <div style={styles.orderBadge}>
            <span>Pedido #{pedido.idPedido}</span>
          </div>

          <div style={styles.liveIndicator}>
            <span style={styles.liveDot} />
            <span>{live ? "Seguimiento en vivo" : "Actualizando"}</span>
          </div>
        </div>

        {/* Stepper Status Hero Banner */}
        <section style={styles.statusHero}>
          <div style={styles.statusTextWrap}>
            <span style={styles.statusPill}>
              {pedido.estado === "ENTREGADO" ? "¡Completado!" : "En curso"}
            </span>
            <h1 style={styles.heroTitle}>
              {pedido.estado === "EN_CAMINO"
                ? "¡Tu pedido está en camino!"
                : pedido.estado === "ENTREGADO"
                ? "¡Tu pedido ha sido entregado!"
                : pedido.estado === "RECOGIENDO"
                ? "Preparando tu orden en el restaurante"
                : pedido.estado === "ASIGNADO"
                ? "Repartidor asignado y en ruta al restaurante"
                : "Pedido confirmado y recibido"}
            </h1>
            <p style={styles.heroSubtitle}>
              {pedido.estado === "ENTREGADO"
                ? "¡Esperamos que disfrutes tu comida! Déjanos saber cómo te fue."
                : `Tiempo estimado de llegada: ${pedido.negocio?.tiempoEstimadoMin || 15} - 25 min`}
            </p>
          </div>

          <div style={styles.stepperWrap}>
            <OrderStatusTimeline currentStatus={pedido.estado} />
          </div>
        </section>

        {/* Main 2-Column Grid */}
        <div style={styles.grid}>
          {/* Left Column: Interactive Dark Map */}
          <div style={styles.mapCard}>
            <div style={styles.mapWrap}>
              <MapContainer 
                center={centro} 
                zoom={14} 
                style={{ width: "100%", height: "100%" }} 
                scrollWheelZoom={false}
              >
                {/* CartoDB DarkMatter Tiles for high-end sleek navy look */}
                <TileLayer
                  attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                  url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                />
                <FitBounds points={puntos.length ? puntos : [centro]} />
                
                {toPoint(pedido.latRecogida, pedido.lngRecogida) && (
                  <Marker position={toPoint(pedido.latRecogida, pedido.lngRecogida)} icon={restaurantPinIcon}>
                    <Popup>
                      <strong>{pedido.negocio?.nombre || "Restaurante"}</strong><br />
                      Punto de recogida
                    </Popup>
                  </Marker>
                )}

                {toPoint(pedido.latEntrega, pedido.lngEntrega) && (
                  <Marker position={toPoint(pedido.latEntrega, pedido.lngEntrega)} icon={deliveryPinIcon}>
                    <Popup>
                      <strong>Entrega</strong><br />
                      {pedido.dirEntrega || "Tu destino"}
                    </Popup>
                  </Marker>
                )}

                {driverPos && (
                  <Marker position={driverPos} icon={driverIcon}>
                    <Popup>
                      <strong>Domiciliario en ruta</strong>
                    </Popup>
                  </Marker>
                )}
              </MapContainer>
            </div>

            <div style={styles.mapFooter}>
              <div style={styles.routeLegend}>
                <div style={styles.legendItem}>
                  <span style={{ ...styles.legendDot, backgroundColor: "#FF6B4A" }} />
                  <span>{pedido.negocio?.nombre || "Comercio"}</span>
                </div>
                <div style={styles.legendItem}>
                  <span style={{ ...styles.legendDot, backgroundColor: tokens.colors.accent }} />
                  <span>{pedido.dirEntrega || "Tu dirección"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Driver & Order Details */}
          <div style={styles.detailsCol}>
            {/* Domiciliario Card */}
            {pedido.repartidor ? (
              <div style={styles.driverCard}>
                <div style={styles.driverTopRow}>
                  <div style={styles.driverAvatarWrap}>
                    <Avatar name={pedido.repartidor.nombre} size={54} />
                    <span style={styles.onlineBadge} />
                  </div>
                  <div style={styles.driverMeta}>
                    <span style={styles.driverRole}>Tu domiciliario Rapitipica</span>
                    <h3 style={styles.driverName}>{pedido.repartidor.nombre}</h3>
                    <div style={styles.driverRating}>
                      <Star size={14} color="#00E576" fill="#00E576" />
                      <span>4.9 (280+ entregas)</span>
                    </div>
                  </div>
                </div>

                <div style={styles.vehicleBadge}>
                  <Bike size={16} color={tokens.colors.accent} />
                  <span>Moto registrada • Placa verificada</span>
                </div>

                <div style={styles.driverActions}>
                  <button
                    type="button"
                    style={styles.actionBtnCall}
                    onClick={handleLlamar}
                  >
                    <Phone size={16} />
                    <span>Llamar</span>
                  </button>
                  <button
                    type="button"
                    style={styles.actionBtnChat}
                    onClick={() => {
                      setChatOpen(true);
                      fetchChat();
                    }}
                  >
                    <MessageCircle size={16} />
                    <span>Chat en vivo</span>
                  </button>
                </div>
              </div>
            ) : (
              <div style={styles.driverCardPending}>
                <div style={styles.pendingIcon}>🛵</div>
                <div>
                  <h4 style={styles.pendingTitle}>Buscando el repartidor más cercano...</h4>
                  <p style={styles.pendingSubtitle}>
                    Te asignaremos un domiciliario en menos de un minuto.
                  </p>
                </div>
              </div>
            )}

            {/* Order Details Card */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <div style={styles.iconCircle}>
                  <ShoppingBag size={20} color={tokens.colors.accent} />
                </div>
                <div>
                  <h3 style={styles.cardTitle}>Detalles de la orden</h3>
                  <p style={styles.cardSubtitle}>
                    {pedido.negocio?.nombre || "Restaurante"}
                  </p>
                </div>
              </div>

              <div style={styles.itemsList}>
                {pedido.items?.map((item, i) => (
                  <div key={item.id || i} style={styles.orderItemRow}>
                    <span style={styles.itemQty}>{item.cantidad}x</span>
                    <span style={styles.itemName}>{item.menuItem?.nombre || "Producto"}</span>
                    <span style={styles.itemPrice}>
                      ${(Number(item.precio || 0) * item.cantidad).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              <div style={styles.divider} />

              <div style={styles.totalRow}>
                <span style={styles.totalLabel}>Total abonado</span>
                <span style={styles.totalValue}>
                  ${Number(pedido.total || 0).toLocaleString()}
                </span>
              </div>

              <div style={styles.paymentStatusBadge}>
                <span style={styles.paymentStatusDot} />
                <span>
                  {pedido.tipoPago === "ONLINE" || pago?.estado === "COMPLETADO"
                    ? "Pago en línea verificado"
                    : "Pago en efectivo contra entrega"}
                </span>
              </div>

              {/* Botón de Calificación si está ENTREGADO */}
              {pedido.estado === "ENTREGADO" && !yaCalificado && (
                <button
                  type="button"
                  style={styles.rateBtn}
                  onClick={() => setModalCalificar(true)}
                >
                  <Star size={18} fill="#0B1F44" color="#0B1F44" />
                  <span>Calificar servicio y entrega</span>
                </button>
              )}

              {/* Botón para confirmar pago si aplica */}
              {pedido.estado === "ENTREGADO" && pago && !pago.confirmacionCliente && (
                <button
                  type="button"
                  style={styles.confirmPayBtn}
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
                  {confirmandoPago ? "Confirmando…" : "Ya entregué el efectivo al domiciliario"}
                </button>
              )}

              <button
                type="button"
                style={styles.viewFullDetailsBtn}
                onClick={() => navigate(`/pedido/${pedidoId}`)}
              >
                <span>Ver factura y detalles completos</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Modal de Chat en Vivo */}
        {chatOpen && (
          <Modal
            title={`Chat con ${pedido.repartidor?.nombre || "Domiciliario"}`}
            onClose={() => setChatOpen(false)}
          >
            <div style={styles.chatContainer}>
              <div style={styles.chatMessagesList}>
                {cargandoChat ? (
                  <p style={styles.chatEmpty}>Cargando mensajes...</p>
                ) : mensajes.length === 0 ? (
                  <p style={styles.chatEmpty}>
                    💬 No hay mensajes aún. Escríbele a tu domiciliario si necesitas darle alguna indicación.
                  </p>
                ) : (
                  mensajes.map((m, idx) => {
                    const senderName = typeof m.remitente === "object" ? m.remitente?.nombre : m.remitente;
                    const myId = usuario?.idUsuarios || usuario?.idUsuario || usuario?.id;
                    const isMe =
                      senderName === (usuario?.nombre || "Cliente") ||
                      (myId && Number(m.idRemitente) === Number(myId));
                    return (
                      <div
                        key={m.idMensaje || idx}
                        style={{
                          ...styles.chatBubble,
                          alignSelf: isMe ? "flex-end" : "flex-start",
                          backgroundColor: isMe ? tokens.colors.accent : tokens.colors.bgPrimary,
                          color: isMe ? "#0B1F44" : tokens.colors.textPrimary,
                          border: isMe ? "none" : `1px solid ${tokens.colors.border}`,
                        }}
                      >
                        {!isMe && <span style={styles.chatSender}>{senderName || "Usuario"}</span>}
                        <p style={{ margin: 0, fontSize: tokens.fontSize.sm, fontWeight: isMe ? 600 : 400 }}>
                          {m.mensaje}
                        </p>
                        <span
                          style={{
                            ...styles.chatTime,
                            color: isMe ? "rgba(11, 31, 68, 0.7)" : tokens.colors.textSecondary,
                          }}
                        >
                          {m.fechaEnvio
                            ? new Date(m.fechaEnvio).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "Ahora"}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
              <form onSubmit={handleEnviarMensaje} style={styles.chatInputRow}>
                <input
                  type="text"
                  value={nuevoMensaje}
                  onChange={(e) => setNuevoMensaje(e.target.value)}
                  placeholder="Escribe un mensaje..."
                  style={styles.chatInput}
                />
                <button
                  type="submit"
                  style={styles.chatSendBtn}
                  aria-label="Enviar mensaje"
                >
                  <Send size={18} />
                </button>
              </form>
            </div>
          </Modal>
        )}

        {/* Modal de Calificación */}
        {modalCalificar && (
          <Modal
            title="Califica tu experiencia"
            onClose={() => setModalCalificar(false)}
          >
            {calificacionExito ? (
              <div style={{ textAlign: "center", padding: "24px 0" }}>
                <p style={{ fontSize: "3rem", margin: "0 0 12px 0" }}>⭐</p>
                <h4 style={{ color: tokens.colors.accent, fontWeight: tokens.fontWeight.bold, margin: 0 }}>
                  ¡Muchas gracias por calificar!
                </h4>
                <p style={{ color: tokens.colors.textSecondary, fontSize: tokens.fontSize.sm, marginTop: 6 }}>
                  Tu opinión nos ayuda a mantener el mejor servicio de Popayán.
                </p>
              </div>
            ) : (
              <form onSubmit={handleCalificar} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <p style={{ color: tokens.colors.textSecondary, fontSize: tokens.fontSize.sm, margin: 0 }}>
                  ¿Cómo calificarías la rapidez y la atención de tu entrega?
                </p>
                <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setPuntuacion(star)}
                      style={{
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        padding: "6px",
                      }}
                      aria-label={`${star} estrellas`}
                    >
                      <Star
                        size={32}
                        fill={star <= puntuacion ? tokens.colors.accent : "none"}
                        color={star <= puntuacion ? tokens.colors.accent : tokens.colors.border}
                      />
                    </button>
                  ))}
                </div>
                <textarea
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  placeholder="Comentarios adicionales sobre el domiciliario o la comida..."
                  rows={3}
                  style={styles.ratingTextarea}
                />
                <button
                  type="submit"
                  disabled={enviandoCalificacion}
                  style={styles.submitRatingBtn}
                >
                  {enviandoCalificacion ? "Enviando…" : "Publicar Calificación"}
                </button>
              </form>
            )}
          </Modal>
        )}
      </main>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: tokens.colors.bgPrimary,
    color: tokens.colors.textPrimary,
    fontFamily: tokens.typography.fontFamily,
    paddingBottom: "80px",
  },
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "24px 20px",
  },
  topHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "20px",
  },
  backBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: tokens.colors.bgCard,
    border: `1px solid ${tokens.colors.border}`,
    borderRadius: tokens.borderRadius.full,
    padding: "8px 16px",
    color: tokens.colors.textPrimary,
    cursor: "pointer",
    fontSize: tokens.fontSize.sm,
    fontWeight: 500,
  },
  orderBadge: {
    backgroundColor: "rgba(0, 229, 118, 0.12)",
    color: tokens.colors.accent,
    padding: "6px 14px",
    borderRadius: tokens.borderRadius.full,
    fontSize: tokens.fontSize.sm,
    fontWeight: tokens.fontWeight.bold,
    border: `1px solid rgba(0, 229, 118, 0.3)`,
  },
  liveIndicator: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: tokens.colors.bgCard,
    border: `1px solid ${tokens.colors.border}`,
    borderRadius: tokens.borderRadius.full,
    padding: "6px 14px",
    fontSize: tokens.fontSize.xs,
    color: tokens.colors.textPrimary,
  },
  liveDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: tokens.colors.accent,
    boxShadow: "0 0 8px rgba(0, 229, 118, 0.8)",
  },
  statusHero: {
    backgroundColor: tokens.colors.bgCard,
    border: `1px solid ${tokens.colors.border}`,
    borderRadius: tokens.borderRadius.lg,
    padding: "28px 24px",
    marginBottom: "24px",
    boxShadow: tokens.shadows.card,
  },
  statusTextWrap: {
    marginBottom: "20px",
  },
  statusPill: {
    display: "inline-block",
    backgroundColor: "rgba(0, 229, 118, 0.15)",
    color: tokens.colors.accent,
    fontSize: tokens.fontSize.xs,
    fontWeight: tokens.fontWeight.bold,
    padding: "4px 10px",
    borderRadius: tokens.borderRadius.sm,
    marginBottom: "8px",
    textTransform: "uppercase",
  },
  heroTitle: {
    fontSize: tokens.fontSize["2xl"],
    fontWeight: tokens.fontWeight.bold,
    color: tokens.colors.textPrimary,
    margin: "0 0 6px 0",
  },
  heroSubtitle: {
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.textSecondary,
    margin: 0,
  },
  stepperWrap: {
    marginTop: "8px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
    gap: "24px",
    alignItems: "start",
  },
  mapCard: {
    backgroundColor: tokens.colors.bgCard,
    border: `1px solid ${tokens.colors.border}`,
    borderRadius: tokens.borderRadius.lg,
    overflow: "hidden",
  },
  mapWrap: {
    width: "100%",
    height: "380px",
    backgroundColor: tokens.colors.bgPrimary,
  },
  mapFooter: {
    padding: "16px 20px",
    borderTop: `1px solid ${tokens.colors.border}`,
  },
  routeLegend: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-around",
    gap: "16px",
  },
  legendItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: tokens.fontSize.xs,
    color: tokens.colors.textSecondary,
  },
  legendDot: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
  },
  detailsCol: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  driverCard: {
    backgroundColor: tokens.colors.bgCard,
    border: `1px solid ${tokens.colors.border}`,
    borderRadius: tokens.borderRadius.lg,
    padding: "20px",
  },
  driverCardPending: {
    backgroundColor: tokens.colors.bgCard,
    border: `1px dashed ${tokens.colors.border}`,
    borderRadius: tokens.borderRadius.lg,
    padding: "24px",
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  pendingIcon: {
    fontSize: "36px",
  },
  pendingTitle: {
    fontSize: tokens.fontSize.md,
    fontWeight: tokens.fontWeight.bold,
    color: tokens.colors.textPrimary,
    margin: "0 0 4px 0",
  },
  pendingSubtitle: {
    fontSize: tokens.fontSize.xs,
    color: tokens.colors.textSecondary,
    margin: 0,
  },
  driverTopRow: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    marginBottom: "14px",
  },
  driverAvatarWrap: {
    position: "relative",
  },
  onlineBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    backgroundColor: tokens.colors.accent,
    border: "2px solid #11254E",
  },
  driverMeta: {
    flex: 1,
  },
  driverRole: {
    fontSize: tokens.fontSize.xs,
    color: tokens.colors.textSecondary,
    display: "block",
  },
  driverName: {
    fontSize: tokens.fontSize.lg,
    fontWeight: tokens.fontWeight.bold,
    color: tokens.colors.textPrimary,
    margin: "2px 0 4px 0",
  },
  driverRating: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    fontSize: tokens.fontSize.xs,
    color: tokens.colors.accent,
    fontWeight: 600,
  },
  vehicleBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: tokens.colors.bgPrimary,
    border: `1px solid ${tokens.colors.border}`,
    borderRadius: tokens.borderRadius.sm,
    padding: "8px 12px",
    fontSize: tokens.fontSize.xs,
    color: tokens.colors.textSecondary,
    width: "100%",
    marginBottom: "16px",
  },
  driverActions: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
  },
  actionBtnCall: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    backgroundColor: "transparent",
    border: `1px solid ${tokens.colors.border}`,
    color: tokens.colors.textPrimary,
    padding: "12px",
    borderRadius: tokens.borderRadius.full,
    fontSize: tokens.fontSize.sm,
    fontWeight: 600,
    cursor: "pointer",
  },
  actionBtnChat: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    backgroundColor: tokens.colors.accent,
    color: "#0B1F44",
    border: "none",
    padding: "12px",
    borderRadius: tokens.borderRadius.full,
    fontSize: tokens.fontSize.sm,
    fontWeight: tokens.fontWeight.bold,
    cursor: "pointer",
    boxShadow: tokens.shadows.glow,
  },
  card: {
    backgroundColor: tokens.colors.bgCard,
    border: `1px solid ${tokens.colors.border}`,
    borderRadius: tokens.borderRadius.lg,
    padding: "24px",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    marginBottom: "16px",
  },
  iconCircle: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    backgroundColor: "rgba(0, 229, 118, 0.12)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: tokens.fontSize.md,
    fontWeight: tokens.fontWeight.bold,
    color: tokens.colors.textPrimary,
    margin: 0,
  },
  cardSubtitle: {
    fontSize: tokens.fontSize.xs,
    color: tokens.colors.textSecondary,
    margin: 0,
  },
  itemsList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginBottom: "16px",
  },
  orderItemRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: tokens.fontSize.sm,
  },
  itemQty: {
    color: tokens.colors.accent,
    fontWeight: 700,
  },
  itemName: {
    flex: 1,
    color: tokens.colors.textPrimary,
  },
  itemPrice: {
    color: tokens.colors.textSecondary,
    fontWeight: 500,
  },
  divider: {
    height: "1px",
    backgroundColor: tokens.colors.border,
    margin: "12px 0",
  },
  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "14px",
  },
  totalLabel: {
    fontSize: tokens.fontSize.md,
    fontWeight: tokens.fontWeight.bold,
    color: tokens.colors.textPrimary,
  },
  totalValue: {
    fontSize: tokens.fontSize.xl,
    fontWeight: tokens.fontWeight.bold,
    color: tokens.colors.accent,
  },
  paymentStatusBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "rgba(0, 229, 118, 0.08)",
    padding: "8px 12px",
    borderRadius: tokens.borderRadius.sm,
    fontSize: tokens.fontSize.xs,
    color: tokens.colors.accent,
    width: "100%",
    marginBottom: "16px",
  },
  paymentStatusDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    backgroundColor: tokens.colors.accent,
  },
  rateBtn: {
    width: "100%",
    padding: "14px",
    backgroundColor: tokens.colors.accent,
    color: "#0B1F44",
    border: "none",
    borderRadius: tokens.borderRadius.full,
    fontSize: tokens.fontSize.sm,
    fontWeight: tokens.fontWeight.bold,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    cursor: "pointer",
    boxShadow: tokens.shadows.glow,
    marginBottom: "12px",
  },
  confirmPayBtn: {
    width: "100%",
    padding: "12px",
    backgroundColor: "transparent",
    border: `1px solid ${tokens.colors.accent}`,
    color: tokens.colors.accent,
    borderRadius: tokens.borderRadius.full,
    fontSize: tokens.fontSize.xs,
    fontWeight: 600,
    cursor: "pointer",
    marginBottom: "12px",
  },
  viewFullDetailsBtn: {
    width: "100%",
    padding: "12px",
    backgroundColor: tokens.colors.bgPrimary,
    border: `1px solid ${tokens.colors.border}`,
    color: tokens.colors.textSecondary,
    borderRadius: tokens.borderRadius.md,
    fontSize: tokens.fontSize.xs,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    cursor: "pointer",
  },
  chatContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  chatMessagesList: {
    height: "280px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    padding: "12px",
    backgroundColor: tokens.colors.bgPrimary,
    borderRadius: tokens.borderRadius.md,
    border: `1px solid ${tokens.colors.border}`,
  },
  chatBubble: {
    maxWidth: "80%",
    padding: "10px 14px",
    borderRadius: "14px",
    display: "flex",
    flexDirection: "column",
    wordBreak: "break-word",
  },
  chatSender: {
    fontSize: "11px",
    fontWeight: 700,
    color: tokens.colors.accent,
    marginBottom: "2px",
  },
  chatTime: {
    fontSize: "10px",
    marginTop: "4px",
    alignSelf: "flex-end",
  },
  chatInputRow: {
    display: "flex",
    gap: "8px",
  },
  chatInput: {
    flex: 1,
    minHeight: "44px",
    padding: "0 14px",
    borderRadius: tokens.borderRadius.full,
    border: `1px solid ${tokens.colors.border}`,
    backgroundColor: tokens.colors.bgPrimary,
    color: tokens.colors.textPrimary,
    fontSize: tokens.fontSize.sm,
    outline: "none",
  },
  chatSendBtn: {
    width: "44px",
    height: "44px",
    borderRadius: "50%",
    border: "none",
    backgroundColor: tokens.colors.accent,
    color: "#0B1F44",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  chatEmpty: {
    textAlign: "center",
    color: tokens.colors.textSecondary,
    fontSize: tokens.fontSize.sm,
    margin: "auto",
    padding: "20px",
  },
  ratingTextarea: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: tokens.borderRadius.md,
    border: `1px solid ${tokens.colors.border}`,
    backgroundColor: tokens.colors.bgPrimary,
    color: tokens.colors.textPrimary,
    fontSize: tokens.fontSize.sm,
    fontFamily: tokens.typography.fontFamily,
    resize: "vertical",
    outline: "none",
    boxSizing: "border-box",
  },
  submitRatingBtn: {
    width: "100%",
    padding: "14px",
    border: "none",
    borderRadius: tokens.borderRadius.full,
    backgroundColor: tokens.colors.accent,
    color: "#0B1F44",
    fontWeight: tokens.fontWeight.bold,
    fontSize: tokens.fontSize.sm,
    cursor: "pointer",
    boxShadow: tokens.shadows.glow,
  },
};
