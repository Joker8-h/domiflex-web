import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Phone, CheckCircle, Clock, ShoppingBag } from "lucide-react";
import theme from "../../styles/theme";
import tokens from "../../design/tokens";
import { api } from "../../api/client";
import { Button } from "../../components/common";
import EmptyState from "../../components/ui/EmptyState";
import ErrorState from "../../components/ui/ErrorState";
import { useSocket } from "../context/SocketContext";

const inputStyle = {
  backgroundColor: theme.colors.bgInput,
  border: `1px solid ${theme.colors.border}`,
  borderRadius: theme.borderRadius.sm,
  padding: "12px 16px",
  minHeight: "48px",
  color: theme.colors.textPrimary,
  fontSize: theme.fontSize.md,
  fontFamily: "'Montserrat', sans-serif",
  width: "100%",
};

export default function ComercioHome() {
  const [negocios, setNegocios] = useState([]);
  const [negocioId, setNegocioId] = useState(null);
  const [menu, setMenu] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actualizandoPedidoId, setActualizandoPedidoId] = useState(null);
  const [producto, setProducto] = useState({ nombre: "", precio: "", categoria: "Platos", imagen: "" });
  const [local, setLocal] = useState({
    nombre: "",
    direccion: "",
    telefono: "",
    costoEnvio: 2000,
    latitud: "",
    longitud: "",
  });

  const { socket } = useSocket() || {};

  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const lista = await api.get("/negocios/mis-negocios");
      const arr = Array.isArray(lista) ? lista : [];
      setNegocios(arr);
      const id = negocioId || arr[0]?.id || null;
      setNegocioId(id);
      if (id) {
        const items = await api.get(`/negocios/${id}/menu`);
        setMenu(Array.isArray(items) ? items : []);
      } else {
        setMenu([]);
      }
      const mis = await api.get("/pedidos/mis-pedidos");
      setPedidos(Array.isArray(mis) ? mis : []);
    } catch (err) {
      setError(err.message || "No se pudo cargar tu local.");
    } finally {
      setLoading(false);
    }
  }, [negocioId]);

  useEffect(() => { cargar(); }, [cargar]);

  // Escucha de nuevos pedidos en cocina por WebSockets en tiempo real
  useEffect(() => {
    if (!socket) return;

    const onNuevoPedido = (data) => {
      toast.success(`🍳 ¡Nuevo pedido #${data?.idPedido || ""} recibido! Revisa la cocina.`, {
        duration: 7000,
        position: "top-right",
      });
      cargar();
    };

    const onPedidoActualizado = () => {
      cargar();
    };

    socket.on("nuevo_pedido_comercio", onNuevoPedido);
    socket.on("pedido_actualizado", onPedidoActualizado);

    return () => {
      socket.off("nuevo_pedido_comercio", onNuevoPedido);
      socket.off("pedido_actualizado", onPedidoActualizado);
    };
  }, [socket, cargar]);

  const usarUbicacion = () => {
    if (!navigator.geolocation) {
      toast.error("Este dispositivo no tiene GPS.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocal((prev) => ({
          ...prev,
          latitud: pos.coords.latitude,
          longitud: pos.coords.longitude,
        }));
        toast.success("Ubicación del local lista.");
      },
      () => toast.error("No pudimos leer el GPS.")
    );
  };

  const crearLocal = async (e) => {
    e.preventDefault();
    try {
      const creado = await api.post("/negocios", {
        ...local,
        latitud: Number(local.latitud),
        longitud: Number(local.longitud),
        costoEnvio: Number(local.costoEnvio) || 2000,
        tipo: "COMIDA",
      });
      toast.success("Local creado.");
      setNegocioId(creado.id);
      await cargar();
    } catch (err) {
      toast.error(err.message || "No se pudo crear el local.");
    }
  };

  const agregarProducto = async (e) => {
    e.preventDefault();
    if (!negocioId) return;
    try {
      await api.post("/productos", {
        nombre: producto.nombre.trim(),
        precio: Number(producto.precio),
        categoria: producto.categoria.trim() || "Platos",
        imagen: producto.imagen.trim() || null,
        restauranteId: negocioId,
      });
      setProducto({ nombre: "", precio: "", categoria: "Platos", imagen: "" });
      toast.success("Producto agregado.");
      const items = await api.get(`/negocios/${negocioId}/menu`);
      setMenu(Array.isArray(items) ? items : []);
    } catch (err) {
      toast.error(err.message || "No se pudo agregar el producto.");
    }
  };

  const alternar = async (item) => {
    try {
      await api.put(`/productos/${item.id}`, { disponible: !item.disponible });
      setMenu((prev) => prev.map((p) => (p.id === item.id ? { ...p, disponible: !p.disponible } : p)));
    } catch (err) {
      toast.error(err.message || "No se pudo actualizar.");
    }
  };

  const eliminar = async (item) => {
    try {
      await api.delete(`/productos/${item.id}`);
      setMenu((prev) => prev.filter((p) => p.id !== item.id));
    } catch (err) {
      toast.error(err.message || "No se pudo eliminar.");
    }
  };

  if (loading) {
    return <div style={styles.page}><p style={styles.muted}>Cargando tu local…</p></div>;
  }

  if (error) {
    return (
      <div style={styles.page}>
        <ErrorState title="No pudimos abrir el local" description={error} onRetry={cargar} />
      </div>
    );
  }

  const cambiarEstadoPedido = async (idPedido, nuevoEstado) => {
    try {
      setActualizandoPedidoId(idPedido);
      await api.post(`/pedidos/${idPedido}/estado`, { estado: nuevoEstado });
      toast.success(`Pedido #${idPedido} actualizado a ${nuevoEstado}`);
      await cargar();
    } catch (err) {
      toast.error(err.message || "No se pudo actualizar el estado del pedido.");
    } finally {
      setActualizandoPedidoId(null);
    }
  };

  const negocio = negocios.find((n) => n.id === negocioId) || negocios[0];

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.title}>Mi local</h1>
        <p style={styles.muted}>Menú, precios y pedidos de tu negocio en Popayán.</p>
      </header>

      {negocios.length === 0 ? (
        <form onSubmit={crearLocal} style={styles.card}>
          <h2 style={styles.cardTitle}>Crea tu negocio</h2>
          <input required placeholder="Nombre del local" style={inputStyle} value={local.nombre} onChange={(e) => setLocal({ ...local, nombre: e.target.value })} />
          <input required placeholder="Dirección" style={inputStyle} value={local.direccion} onChange={(e) => setLocal({ ...local, direccion: e.target.value })} />
          <input placeholder="Teléfono" style={inputStyle} value={local.telefono} onChange={(e) => setLocal({ ...local, telefono: e.target.value })} />
          <input type="number" min="0" placeholder="Costo de envío" style={inputStyle} value={local.costoEnvio} onChange={(e) => setLocal({ ...local, costoEnvio: e.target.value })} />
          <button type="button" onClick={usarUbicacion} style={styles.ghost}>
            {local.latitud ? "Ubicación lista" : "Usar mi ubicación"}
          </button>
          <Button type="submit" fullWidth disabled={!local.latitud || !local.longitud}>Guardar local</Button>
        </form>
      ) : (
        <>
          <section style={styles.card}>
            <h2 style={styles.cardTitle}>{negocio?.nombre}</h2>
            <p style={styles.muted}>{negocio?.direccion} · Envío ${Number(negocio?.costoEnvio || 0).toLocaleString()}</p>
            {negocios.length > 1 && (
              <select style={inputStyle} value={negocioId || ""} onChange={(e) => setNegocioId(Number(e.target.value))}>
                {negocios.map((n) => <option key={n.id} value={n.id}>{n.nombre}</option>)}
              </select>
            )}
          </section>

          <section style={styles.card}>
            <h2 style={styles.cardTitle}>Menú</h2>
            {menu.length === 0 && <EmptyState icon="🍽️" title="Sin productos" description="Agrega el primer plato de tu carta." />}
            {menu.map((item) => (
              <div key={item.id} style={styles.row}>
                <div>
                  <strong>{item.nombre}</strong>
                  <p style={styles.muted}>{item.categoria} · ${Number(item.precio).toLocaleString()} · {item.disponible ? "Visible" : "Oculto"}</p>
                </div>
                <div style={styles.actions}>
                  <button type="button" style={styles.ghost} onClick={() => alternar(item)}>{item.disponible ? "Ocultar" : "Mostrar"}</button>
                  <button type="button" style={styles.danger} onClick={() => eliminar(item)}>Quitar</button>
                </div>
              </div>
            ))}
            <form onSubmit={agregarProducto} style={styles.form}>
              <input required placeholder="Nombre" style={inputStyle} value={producto.nombre} onChange={(e) => setProducto({ ...producto, nombre: e.target.value })} />
              <input required type="number" min="1" placeholder="Precio" style={inputStyle} value={producto.precio} onChange={(e) => setProducto({ ...producto, precio: e.target.value })} />
              <input placeholder="Categoría" style={inputStyle} value={producto.categoria} onChange={(e) => setProducto({ ...producto, categoria: e.target.value })} />
              <input placeholder="URL de imagen (opcional)" style={inputStyle} value={producto.imagen} onChange={(e) => setProducto({ ...producto, imagen: e.target.value })} />
              <Button type="submit">Agregar al menú</Button>
            </form>
          </section>

          <section style={styles.card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={styles.cardTitle}>Pedidos del local ({pedidos.length})</h2>
              <button type="button" style={styles.refreshBtn} onClick={cargar}>
                Actualizar
              </button>
            </div>
            {pedidos.length === 0 && (
              <EmptyState icon="📦" title="Aún no hay pedidos" description="Cuando un cliente pida, aparecerá aquí en tiempo real." />
            )}
            {pedidos.map((pedido) => {
              const estadoColor =
                pedido.estado === "CREADO" ? "#FFC107" :
                pedido.estado === "ASIGNADO" ? "#2196F3" :
                pedido.estado === "RECOGIENDO" ? "#9C27B0" :
                pedido.estado === "EN_CAMINO" ? "#00BCD4" :
                pedido.estado === "ENTREGADO" ? theme.colors.accent : theme.colors.danger;

              return (
                <div key={pedido.idPedido} style={styles.pedidoCard}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <strong style={{ fontSize: theme.fontSize.md }}>Pedido #{pedido.idPedido}</strong>
                        <span
                          style={{
                            backgroundColor: `${estadoColor}20`,
                            color: estadoColor,
                            border: `1px solid ${estadoColor}`,
                            borderRadius: "12px",
                            padding: "2px 8px",
                            fontSize: "11px",
                            fontWeight: 600,
                          }}
                        >
                          {pedido.estado}
                        </span>
                      </div>
                      <p style={styles.muted}>
                        Cliente: {pedido.cliente?.nombre || "Cliente DomiFlex"} · Entrega: {pedido.dirEntrega || "Popayán"}
                      </p>
                    </div>
                    <strong style={{ color: theme.colors.accent, fontSize: theme.fontSize.md }}>
                      ${Number(pedido.total || 0).toLocaleString()}
                    </strong>
                  </div>

                  {/* Desglose de productos */}
                  {pedido.items && pedido.items.length > 0 && (
                    <div style={styles.itemsList}>
                      <span style={{ fontSize: "12px", color: theme.colors.textSecondary, fontWeight: 600, marginBottom: 4, display: "flex", alignItems: "center", gap: 4 }}>
                        <ShoppingBag size={14} /> Contenido del pedido:
                      </span>
                      {pedido.items.map((it, idx) => (
                        <div key={it.id || idx} style={styles.itemRow}>
                          <span>{it.cantidad}x {it.menuItem?.nombre || it.producto?.nombre || "Ítem de menú"}</span>
                          <span>${((it.precio || 0) * it.cantidad).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Acciones de pedido */}
                  <div style={styles.pedidoActions}>
                    {pedido.cliente?.telefono && (
                      <button
                        type="button"
                        style={styles.actionBtnSecondary}
                        onClick={() => window.open(`tel:${pedido.cliente.telefono}`, "_self")}
                      >
                        <Phone size={14} /> Llamar cliente ({pedido.cliente.telefono})
                      </button>
                    )}

                    {pedido.estado === "CREADO" && (
                      <button
                        type="button"
                        disabled={actualizandoPedidoId === pedido.idPedido}
                        style={styles.actionBtnPrimary}
                        onClick={() => cambiarEstadoPedido(pedido.idPedido, "RECOGIENDO")}
                      >
                        <Clock size={14} /> {actualizandoPedidoId === pedido.idPedido ? "Guardando…" : "En preparación (Listo para recoger)"}
                      </button>
                    )}

                    {pedido.estado === "ASIGNADO" && (
                      <button
                        type="button"
                        disabled={actualizandoPedidoId === pedido.idPedido}
                        style={styles.actionBtnPrimary}
                        onClick={() => cambiarEstadoPedido(pedido.idPedido, "RECOGIENDO")}
                      >
                        <CheckCircle size={14} /> {actualizandoPedidoId === pedido.idPedido ? "Guardando…" : "Marcar listo para repartidor"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </section>
        </>
      )}
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: theme.colors.bgPrimary,
    color: theme.colors.textPrimary,
    padding: "24px 16px 120px",
    maxWidth: "760px",
    margin: "0 auto",
  },
  header: { marginBottom: "20px" },
  title: { fontSize: theme.fontSize.xxl, fontWeight: theme.fontWeight.bold, margin: 0 },
  muted: { color: theme.colors.textSecondary, margin: "4px 0 0", fontSize: theme.fontSize.sm },
  card: {
    backgroundColor: theme.colors.bgCard,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.md,
    padding: "20px",
    marginBottom: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  cardTitle: { margin: 0, fontSize: theme.fontSize.lg },
  row: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "center",
    borderBottom: `1px solid ${theme.colors.border}`,
    paddingBottom: "12px",
  },
  actions: { display: "flex", gap: "8px", flexShrink: 0 },
  form: { display: "flex", flexDirection: "column", gap: "8px", marginTop: "8px" },
  ghost: {
    minHeight: "44px",
    borderRadius: theme.borderRadius.sm,
    border: `1px solid ${theme.colors.accent}`,
    background: "transparent",
    color: theme.colors.accent,
    cursor: "pointer",
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: 600,
  },
  danger: {
    minHeight: "44px",
    borderRadius: theme.borderRadius.sm,
    border: `1px solid ${theme.colors.danger}`,
    background: "transparent",
    color: theme.colors.danger,
    cursor: "pointer",
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: 600,
  },
  refreshBtn: {
    backgroundColor: "transparent",
    border: `1px solid ${theme.colors.border}`,
    color: theme.colors.accent,
    borderRadius: theme.borderRadius.sm,
    padding: "6px 12px",
    cursor: "pointer",
    fontSize: theme.fontSize.xs,
    fontWeight: 600,
  },
  pedidoCard: {
    backgroundColor: "#161B22",
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.sm,
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  itemsList: {
    backgroundColor: "#0D1117",
    padding: "10px",
    borderRadius: theme.borderRadius.sm,
    border: `1px solid ${theme.colors.border}`,
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  itemRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: theme.fontSize.sm,
    color: theme.colors.textPrimary,
  },
  pedidoActions: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginTop: "4px",
  },
  actionBtnPrimary: {
    minHeight: "40px",
    padding: "8px 14px",
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.accent,
    color: "#0D1117",
    border: "none",
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    gap: "6px",
    cursor: "pointer",
    fontSize: theme.fontSize.sm,
    fontFamily: "'Montserrat', sans-serif",
  },
  actionBtnSecondary: {
    minHeight: "40px",
    padding: "8px 14px",
    borderRadius: theme.borderRadius.sm,
    backgroundColor: "transparent",
    color: theme.colors.textPrimary,
    border: `1px solid ${theme.colors.border}`,
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    gap: "6px",
    cursor: "pointer",
    fontSize: theme.fontSize.sm,
    fontFamily: "'Montserrat', sans-serif",
  },
};
