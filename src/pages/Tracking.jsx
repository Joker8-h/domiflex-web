import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MessageCircle,
  Phone,
  Star,
  Send,
  ShoppingBag,
  ChevronRight,
} from "lucide-react";
import { MapContainer, Marker, Popup, Polyline, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
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

// Marcadores según Boceto 5 (Ruta roja #E30613, scooter rojo y pin de entrega)
const restaurantPinIcon = L.divIcon({
  className: "custom-pin",
  html: `<div style="background:#0D1117;width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid #FFFFFF;box-shadow:0 4px 10px rgba(0,0,0,0.25);font-size:16px;">🏪</div>`,
  iconSize: [34, 34],
  iconAnchor: [17, 17],
  popupAnchor: [0, -20],
});

const deliveryPinIcon = L.divIcon({
  className: "custom-pin",
  html: `<div style="background:#E30613;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid #FFFFFF;box-shadow:0 4px 12px rgba(227,6,19,0.5);font-size:17px;">📍</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  popupAnchor: [0, -20],
});

const driverIcon = L.divIcon({
  className: "custom-driver-pin",
  html: `<div style="position:relative;width:42px;height:42px;border-radius:50%;background:#E30613;display:flex;align-items:center;justify-content:center;border:3px solid #FFFFFF;box-shadow:0 4px 14px rgba(227,6,19,0.65);">
    <span style="font-size:20px;">🛵</span>
  </div>`,
  iconSize: [42, 42],
  iconAnchor: [21, 21],
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
    map.fitBounds(points, { padding: [45, 45] });
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

  const fetchPedido = useCallback(
    async (signal) => {
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
          setError(err.message || "No se pudo cargar el pedido.");
        }
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [pedidoId]
  );

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
            setPago((prev) => ({
              ...(prev || {}),
              ...datosPago,
              estado: datosPago.estado || "COMPLETADO",
            }));
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
    api
      .get(`/pagos/pedido/${pedidoId}`)
      .then((lista) => {
        if (!cancelado) setPago(Array.isArray(lista) ? lista[0] || null : null);
      })
      .catch(() => {
        if (!cancelado) setPago(null);
      });
    return () => {
      cancelado = true;
    };
  }, [pedido?.estado, pedidoId]);

  const handleLlamar = () => {
    const tel = pedido?.repartidor?.telefono;
    if (tel) {
      window.open(`tel:${tel}`, "_self");
    } else {
      alert("El repartidor no tiene un número telefónico público registrado.");
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
      const idCalificado =
        pedido?.repartidor?.idUsuarios ||
        pedido?.repartidor?.idUsuario ||
        pedido?.idRepartidor ||
        pedido?.idComercio;
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
            onRetry={() => {
              setLoading(true);
              setRetryKey((k) => k + 1);
            }}
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

  const pRecogida = toPoint(pedido.latRecogida, pedido.lngRecogida);
  const pEntrega = toPoint(pedido.latEntrega, pedido.lngEntrega);
  const puntos = [pRecogida, pEntrega, driverPos].filter(Boolean);
  const centro = puntos[0] || POPAYAN;
  const routeLine = [pRecogida, driverPos, pEntrega].filter(Boolean);

  const headerTitle =
    pedido.estado === "ENTREGADO"
      ? "Pedido entregado"
      : pedido.estado === "EN_CAMINO"
      ? "En camino"
      : "Seguimiento del pedido";

  const resumenTexto =
    pedido.items?.length > 0
      ? pedido.items
          .map((i) => `${i.cantidad}x ${i.menuItem?.nombre || "Producto"}`)
          .join(", ")
      : pedido.detallePedido || "1x Pizza margarita, 1x Gaseosa";

  return (
    <div style={styles.page}>
      <NavbarCustom />

      {/* Header negro estilo Boceto 5: "← En camino" */}
      <div style={styles.darkHeader}>
        <div style={styles.darkHeaderInner}>
          <button
            type="button"
            style={styles.backBtn}
            onClick={() => navigate(-1)}
            aria-label="Volver"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 style={styles.darkHeaderTitle}>{headerTitle}</h1>
          <div style={styles.liveBadge}>
            <span style={styles.liveDot} />
            <span>{live ? "En vivo" : `Pedido #${pedido.idPedido}`}</span>
          </div>
        </div>
      </div>

      <main style={styles.container}>
        <div style={styles.grid}>
          {/* Mapa claro con ruta roja y tarjeta flotante "Tu pedido llegará en 15 min" (Boceto 5) */}
          <div style={styles.mapCard}>
            <div style={styles.mapWrap}>
              {/* Tarjeta blanca flotante sobre el mapa */}
              <div style={styles.floatingEtaCard}>
                <span style={styles.floatingEtaTitle}>
                  {pedido.estado === "ENTREGADO"
                    ? "¡Tu pedido fue entregado!"
                    : `Tu pedido llegará en ${pedido.negocio?.tiempoEstimadoMin || 15} min`}
                </span>
              </div>

              <MapContainer
                center={centro}
                zoom={14}
                style={{ width: "100%", height: "100%" }}
                scrollWheelZoom={false}
              >
                <TileLayer
                  attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                  url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                />
                <FitBounds points={puntos.length ? puntos : [centro]} />

                {routeLine.length >= 2 && (
                  <Polyline
                    positions={routeLine}
                    pathOptions={{ color: "#E30613", weight: 5, opacity: 0.9 }}
                  />
                )}

                {pRecogida && (
                  <Marker position={pRecogida} icon={restaurantPinIcon}>
                    <Popup>
                      <strong>{pedido.negocio?.nombre || "Restaurante"}</strong>
                      <br />
                      Punto de recogida
                    </Popup>
                  </Marker>
                )}

                {pEntrega && (
                  <Marker position={pEntrega} icon={deliveryPinIcon}>
                    <Popup>
                      <strong>Entrega</strong>
                      <br />
                      {pedido.dirEntrega || "Tu destino"}
                    </Popup>
                  </Marker>
                )}

                {(driverPos || pRecogida) && (
                  <Marker position={driverPos || pRecogida} icon={driverIcon}>
                    <Popup>
                      <strong>Repartidor en camino</strong>
                    </Popup>
                  </Marker>
                )}
              </MapContainer>
            </div>
          </div>

          {/* Columna de información según Boceto 5 */}
          <div style={styles.detailsCol}>
            {/* Tarjeta del Repartidor: Avatar + Nombre + "Tu repartidor • ★ 4.8" + Botones Llamar / Chat */}
            <div style={styles.driverCard}>
              <div style={styles.driverRow}>
                <Avatar
                  name={pedido.repartidor?.nombre || "Juan Pérez"}
                  size={52}
                />
                <div style={styles.driverInfo}>
                  <h3 style={styles.driverName}>
                    {pedido.repartidor?.nombre || "Juan Pérez"}
                  </h3>
                  <div style={styles.driverSub}>
                    <span>Tu repartidor</span>
                    <span>•</span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 3, color: "#11141A", fontWeight: 700 }}>
                      <Star size={13} fill="#F59E0B" color="#F59E0B" />
                      4.8
                    </span>
                  </div>
                </div>

                <div style={styles.driverQuickBtns}>
                  <button
                    type="button"
                    onClick={handleLlamar}
                    style={styles.circleActionBtn}
                    aria-label="Llamar al repartidor"
                    title="Llamar"
                  >
                    <Phone size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setChatOpen(true);
                      fetchChat();
                    }}
                    style={styles.circleActionBtnRed}
                    aria-label="Abrir chat"
                    title="Chat en vivo"
                  >
                    <MessageCircle size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* Resumen compacto del pedido + link "Ver detalles" (Boceto 5) */}
            <div style={styles.summaryRowCard}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={styles.summaryRestName}>
                  {pedido.negocio?.nombre || "Pizzería La Italiana"}
                </div>
                <div style={styles.summaryItemsText}>{resumenTexto}</div>
              </div>
              <button
                type="button"
                onClick={() => navigate(`/pedido/${pedidoId}`)}
                style={styles.verDetallesLink}
              >
                Ver detalles
              </button>
            </div>

            {/* Stepper Verde (#16A34A): Confirmado -> En camino -> Entregado (Boceto 5) */}
            <OrderStatusTimeline estadoActual={pedido.estado} />

            {/* Desglose y acciones adicionales */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <div style={styles.iconCircle}>
                  <ShoppingBag size={18} color="#E30613" />
                </div>
                <div>
                  <h3 style={styles.cardTitle}>Resumen de cuenta</h3>
                  <p style={styles.cardSubtitle}>Pedido #{pedido.idPedido}</p>
                </div>
              </div>

              <div style={styles.itemsList}>
                {pedido.items?.map((item, i) => (
                  <div key={item.id || i} style={styles.orderItemRow}>
                    <span style={styles.itemQty}>{item.cantidad}x</span>
                    <span style={styles.itemName}>
                      {item.menuItem?.nombre || "Producto"}
                    </span>
                    <span style={styles.itemPrice}>
                      ${(Number(item.precio || 0) * item.cantidad).toLocaleString("es-CO")}
                    </span>
                  </div>
                ))}
              </div>

              <div style={styles.divider} />

              <div style={styles.totalRow}>
                <span style={styles.totalLabel}>Total</span>
                <span style={styles.totalValue}>
                  ${Number(pedido.total || 0).toLocaleString("es-CO")}
                </span>
              </div>

              {pedido.estado === "ENTREGADO" && !yaCalificado && (
                <button
                  type="button"
                  style={styles.rateBtn}
                  onClick={() => setModalCalificar(true)}
                >
                  <Star size={18} fill="#FFFFFF" color="#FFFFFF" />
                  <span>Calificar entrega</span>
                </button>
              )}

              {pedido.estado === "ENTREGADO" && pago && !pago.confirmacionCliente && (
                <button
                  type="button"
                  style={styles.confirmPayBtn}
                  disabled={confirmandoPago}
                  onClick={async () => {
                    setConfirmandoPago(true);
                    try {
                      const actualizado = await api.put(
                        `/pagos/confirmarCliente/${pago.idPago}`
                      );
                      setPago(actualizado);
                    } catch (err) {
                      setError(err.message || "No se pudo confirmar el pago.");
                    } finally {
                      setConfirmandoPago(false);
                    }
                  }}
                >
                  {confirmandoPago
                    ? "Confirmando…"
                    : "Confirmar entrega de efectivo"}
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
            title={`Chat con ${pedido.repartidor?.nombre || "Repartidor"}`}
            onClose={() => setChatOpen(false)}
          >
            <div style={styles.chatContainer}>
              <div style={styles.chatMessagesList}>
                {cargandoChat ? (
                  <p style={styles.chatEmpty}>Cargando mensajes...</p>
                ) : mensajes.length === 0 ? (
                  <p style={styles.chatEmpty}>
                    💬 No hay mensajes aún. Escríbele a tu repartidor si necesitas darle alguna indicación.
                  </p>
                ) : (
                  mensajes.map((m, idx) => {
                    const senderName =
                      typeof m.remitente === "object"
                        ? m.remitente?.nombre
                        : m.remitente;
                    const myId =
                      usuario?.idUsuarios || usuario?.idUsuario || usuario?.id;
                    const isMe =
                      senderName === (usuario?.nombre || "Cliente") ||
                      (myId && Number(m.idRemitente) === Number(myId));
                    return (
                      <div
                        key={m.idMensaje || idx}
                        style={{
                          ...styles.chatBubble,
                          alignSelf: isMe ? "flex-end" : "flex-start",
                          backgroundColor: isMe ? "#E30613" : "#F3F4F6",
                          color: isMe ? "#FFFFFF" : "#11141A",
                        }}
                      >
                        {!isMe && (
                          <span style={styles.chatSender}>
                            {senderName || "Repartidor"}
                          </span>
                        )}
                        <p style={{ margin: 0, fontSize: "0.9rem", fontWeight: 500 }}>
                          {m.mensaje}
                        </p>
                        <span
                          style={{
                            ...styles.chatTime,
                            color: isMe ? "rgba(255,255,255,0.8)" : "#6B7280",
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
                <h4 style={{ color: "#16A34A", fontWeight: 800, margin: 0 }}>
                  ¡Muchas gracias por calificar!
                </h4>
              </div>
            ) : (
              <form
                onSubmit={handleCalificar}
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                <p style={{ color: "#4B5563", fontSize: "0.9rem", margin: 0 }}>
                  ¿Cómo calificarías la rapidez y atención de tu entrega?
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
                    >
                      <Star
                        size={32}
                        fill={star <= puntuacion ? "#F59E0B" : "none"}
                        color={star <= puntuacion ? "#F59E0B" : "#D1D5DB"}
                      />
                    </button>
                  ))}
                </div>
                <textarea
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  placeholder="Comentarios adicionales..."
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
    backgroundColor: "#F8F9FA",
    color: "#11141A",
    paddingBottom: "80px",
  },
  darkHeader: {
    backgroundColor: "#0D1117",
    color: "#FFFFFF",
    padding: "16px 20px",
  },
  darkHeaderInner: {
    maxWidth: "1100px",
    margin: "0 auto",
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },
  backBtn: {
    width: "38px",
    height: "38px",
    borderRadius: "50%",
    border: "1px solid rgba(255,255,255,0.16)",
    backgroundColor: "rgba(255,255,255,0.08)",
    color: "#FFFFFF",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  darkHeaderTitle: {
    fontSize: "1.25rem",
    fontWeight: 800,
    margin: 0,
    flex: 1,
    color: "#FFFFFF",
  },
  liveBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "rgba(255,255,255,0.1)",
    padding: "6px 12px",
    borderRadius: "9999px",
    fontSize: "0.8rem",
    fontWeight: 700,
    color: "#FFFFFF",
  },
  liveDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: "#16A34A",
  },
  container: {
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "24px 20px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "24px",
    alignItems: "start",
  },
  mapCard: {
    backgroundColor: "#FFFFFF",
    border: "1px solid #E5E7EB",
    borderRadius: "20px",
    overflow: "hidden",
    boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
  },
  mapWrap: {
    position: "relative",
    width: "100%",
    height: "420px",
  },
  floatingEtaCard: {
    position: "absolute",
    top: "16px",
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 500,
    backgroundColor: "#FFFFFF",
    color: "#11141A",
    padding: "10px 20px",
    borderRadius: "9999px",
    boxShadow: "0 6px 20px rgba(0,0,0,0.14)",
    border: "1px solid #E5E7EB",
    whiteSpace: "nowrap",
  },
  floatingEtaTitle: {
    fontWeight: 800,
    fontSize: "0.95rem",
    color: "#11141A",
  },
  detailsCol: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  driverCard: {
    backgroundColor: "#FFFFFF",
    border: "1px solid #E5E7EB",
    borderRadius: "18px",
    padding: "16px 18px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
  },
  driverRow: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },
  driverInfo: {
    flex: 1,
    minWidth: 0,
  },
  driverName: {
    fontSize: "1.05rem",
    fontWeight: 800,
    color: "#11141A",
    margin: "0 0 2px 0",
  },
  driverSub: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "0.84rem",
    color: "#6B7280",
  },
  driverQuickBtns: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  circleActionBtn: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    border: "1px solid #E5E7EB",
    backgroundColor: "#F8F9FA",
    color: "#11141A",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  circleActionBtnRed: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    border: "none",
    backgroundColor: "#E30613",
    color: "#FFFFFF",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    boxShadow: "0 4px 10px rgba(227,6,19,0.3)",
  },
  summaryRowCard: {
    backgroundColor: "#FFFFFF",
    border: "1px solid #E5E7EB",
    borderRadius: "16px",
    padding: "14px 18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
  },
  summaryRestName: {
    fontWeight: 800,
    fontSize: "0.95rem",
    color: "#11141A",
    marginBottom: "2px",
  },
  summaryItemsText: {
    fontSize: "0.85rem",
    color: "#6B7280",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  verDetallesLink: {
    background: "none",
    border: "none",
    color: "#E30613",
    fontWeight: 800,
    fontSize: "0.88rem",
    cursor: "pointer",
    flexShrink: 0,
  },
  card: {
    backgroundColor: "#FFFFFF",
    border: "1px solid #E5E7EB",
    borderRadius: "18px",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  iconCircle: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    backgroundColor: "#FEF2F2",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: "0.98rem",
    fontWeight: 800,
    color: "#11141A",
    margin: 0,
  },
  cardSubtitle: {
    fontSize: "0.8rem",
    color: "#6B7280",
    margin: 0,
  },
  itemsList: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  orderItemRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "0.9rem",
  },
  itemQty: {
    fontWeight: 800,
    color: "#E30613",
  },
  itemName: {
    flex: 1,
    color: "#11141A",
  },
  itemPrice: {
    fontWeight: 700,
    color: "#11141A",
  },
  divider: {
    height: "1px",
    backgroundColor: "#E5E7EB",
  },
  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontWeight: 700,
    color: "#4B5563",
  },
  totalValue: {
    fontSize: "1.2rem",
    fontWeight: 900,
    color: "#11141A",
  },
  rateBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    backgroundColor: "#16A34A",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "9999px",
    padding: "12px",
    fontWeight: 800,
    cursor: "pointer",
  },
  confirmPayBtn: {
    backgroundColor: "#E30613",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "9999px",
    padding: "12px",
    fontWeight: 800,
    cursor: "pointer",
  },
  viewFullDetailsBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    backgroundColor: "#F8F9FA",
    border: "1px solid #E5E7EB",
    borderRadius: "12px",
    padding: "10px",
    color: "#11141A",
    fontSize: "0.86rem",
    fontWeight: 700,
    cursor: "pointer",
  },
  chatContainer: {
    display: "flex",
    flexDirection: "column",
    height: "360px",
  },
  chatMessagesList: {
    flex: 1,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    padding: "10px 4px",
  },
  chatEmpty: {
    textAlign: "center",
    color: "#6B7280",
    fontSize: "0.9rem",
    margin: "auto 0",
  },
  chatBubble: {
    maxWidth: "80%",
    padding: "10px 14px",
    borderRadius: "14px",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  chatSender: {
    fontSize: "0.72rem",
    fontWeight: 800,
    color: "#E30613",
  },
  chatTime: {
    fontSize: "0.68rem",
    alignSelf: "flex-end",
  },
  chatInputRow: {
    display: "flex",
    gap: "8px",
    paddingTop: "10px",
    borderTop: "1px solid #E5E7EB",
  },
  chatInput: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    border: "1px solid #D1D5DB",
    borderRadius: "9999px",
    padding: "10px 16px",
    color: "#11141A",
    outline: "none",
  },
  chatSendBtn: {
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    backgroundColor: "#E30613",
    color: "#FFFFFF",
    border: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  ratingTextarea: {
    width: "100%",
    backgroundColor: "#F8F9FA",
    border: "1px solid #D1D5DB",
    borderRadius: "12px",
    padding: "12px",
    color: "#11141A",
    outline: "none",
  },
  submitRatingBtn: {
    backgroundColor: "#E30613",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "9999px",
    padding: "12px",
    fontWeight: 800,
    cursor: "pointer",
  },
};
