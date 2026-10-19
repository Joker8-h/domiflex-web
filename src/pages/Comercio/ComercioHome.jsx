import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Phone, CheckCircle, Clock, ShoppingBag, Store, MapPin, PlusCircle } from "lucide-react";
import theme from "../../styles/theme";
import NavbarCustom from "../../components/Navbar";
import { api } from "../../api/client";
import { Button } from "../../components/common";
import EmptyState from "../../components/ui/EmptyState";
import ErrorState from "../../components/ui/ErrorState";
import { useSocket } from "../context/SocketContext";

const inputStyle = {
  backgroundColor: "#F8F9FA",
  border: "1px solid #D1D5DB",
  borderRadius: "12px",
  padding: "12px 16px",
  minHeight: "46px",
  color: "#11141A",
  fontSize: "0.95rem",
  fontFamily: "'Montserrat', sans-serif",
  width: "100%",
  outline: "none",
};

const CATEGORIAS_NEGOCIO = [
  { value: "COMIDA", label: "🍔 Restaurante / Comida preparada" },
  { value: "SUPERMERCADO", label: "🛒 Supermercado / Tienda" },
  { value: "LICORES", label: "🍷 Licores y Bebidas" },
  { value: "DULCES", label: "🍰 Panadería / Dulces y Postres" },
  { value: "FARMACIA", label: "💊 Farmacia y Droguería" },
];

export default function ComercioHome() {
  const [negocios, setNegocios] = useState([]);
  const [negocioId, setNegocioId] = useState(null);
  const [menu, setMenu] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actualizandoPedidoId, setActualizandoPedidoId] = useState(null);
  const [producto, setProducto] = useState({ nombre: "", descripcion: "", precio: "", categoria: "Platos fuertes", imagen: "" });
  const [local, setLocal] = useState({
    nombre: "",
    tipo: "COMIDA",
    categoria: "Restaurantes",
    direccion: "",
    telefono: "",
    costoEnvio: 3000,
    tiempoEstimadoMin: 25,
    imagenUrl: "",
    latitud: 2.4448,
    longitud: -76.6147,
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
      toast.error("Este dispositivo no tiene GPS. Usando ubicación central de Popayán.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocal((prev) => ({
          ...prev,
          latitud: pos.coords.latitude,
          longitud: pos.coords.longitude,
        }));
        toast.success("Ubicación GPS del negocio fijada.");
      },
      () => {
        setLocal((prev) => ({ ...prev, latitud: 2.4448, longitud: -76.6147 }));
        toast("Usando coordenadas centrales de Popayán (2.4448, -76.6147).");
      }
    );
  };

  const crearLocal = async (e) => {
    e.preventDefault();
    try {
      const creado = await api.post("/negocios", {
        nombre: local.nombre.trim(),
        direccion: local.direccion.trim(),
        telefono: local.telefono.trim(),
        costoEnvio: Number(local.costoEnvio) || 3000,
        tiempoEstimadoMin: Number(local.tiempoEstimadoMin) || 25,
        imagenUrl: local.imagenUrl.trim() || undefined,
        categoria: local.categoria,
        tipo: local.tipo || "COMIDA",
        latitud: Number(local.latitud) || 2.4448,
        longitud: Number(local.longitud) || -76.6147,
      });
      toast.success("¡Negocio creado y publicado exitosamente!");
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
        descripcion: producto.descripcion.trim() || undefined,
        precio: Number(producto.precio),
        categoria: producto.categoria.trim() || "Platos fuertes",
        imagen: producto.imagen.trim() || null,
        restauranteId: negocioId,
      });
      setProducto({ nombre: "", descripcion: "", precio: "", categoria: "Platos fuertes", imagen: "" });
      toast.success("Producto agregado al menú.");
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
      <NavbarCustom />

      <div style={styles.darkBanner}>
        <div style={styles.darkBannerInner}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={styles.storeIconWrap}>
              <Store size={24} color="#FFFFFF" />
            </div>
            <div>
              <h1 style={styles.title}>Panel de Mi Negocio</h1>
              <p style={styles.bannerSubtitle}>Administra tu restaurante, menú y pedidos en vivo en Rapitipica.</p>
            </div>
          </div>
        </div>
      </div>

      <main style={styles.container}>
        {loading ? (
          <div style={styles.card}><p style={styles.muted}>Cargando información de tu negocio…</p></div>
        ) : error ? (
          <ErrorState title="No pudimos abrir el local" description={error} onRetry={cargar} />
        ) : negocios.length === 0 ? (
          <form onSubmit={crearLocal} style={styles.card}>
            <div style={{ marginBottom: 6 }}>
              <h2 style={styles.cardTitle}>🏪 Registra los datos de tu Negocio</h2>
              <p style={styles.muted}>Completa la ficha de tu local para aparecer en el catálogo de Rapitipica.</p>
            </div>

            <div style={styles.formGrid}>
              <div>
                <label style={styles.label}>Nombre del negocio *</label>
                <input
                  required
                  placeholder="Ej. Pizzería La Italiana"
                  style={inputStyle}
                  value={local.nombre}
                  onChange={(e) => setLocal({ ...local, nombre: e.target.value })}
                />
              </div>

              <div>
                <label style={styles.label}>Categoría principal *</label>
                <select
                  style={inputStyle}
                  value={local.tipo}
                  onChange={(e) => {
                    const selected = CATEGORIAS_NEGOCIO.find((c) => c.value === e.target.value);
                    setLocal({
                      ...local,
                      tipo: e.target.value,
                      categoria: selected ? selected.label.replace(/^[^\s]+\s/, "") : "Restaurantes",
                    });
                  }}
                >
                  {CATEGORIAS_NEGOCIO.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={styles.label}>Dirección física *</label>
                <input
                  required
                  placeholder="Ej. Calle 45 # 12-34, Centro"
                  style={inputStyle}
                  value={local.direccion}
                  onChange={(e) => setLocal({ ...local, direccion: e.target.value })}
                />
              </div>

              <div>
                <label style={styles.label}>Teléfono de contacto *</label>
                <input
                  required
                  placeholder="Ej. 3124567890"
                  style={inputStyle}
                  value={local.telefono}
                  onChange={(e) => setLocal({ ...local, telefono: e.target.value })}
                />
              </div>

              <div>
                <label style={styles.label}>Costo de domicilio ($ COP)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="3000"
                  style={inputStyle}
                  value={local.costoEnvio}
                  onChange={(e) => setLocal({ ...local, costoEnvio: e.target.value })}
                />
              </div>

              <div>
                <label style={styles.label}>Tiempo estimado de entrega (min)</label>
                <input
                  type="number"
                  min="10"
                  max="120"
                  placeholder="25"
                  style={inputStyle}
                  value={local.tiempoEstimadoMin}
                  onChange={(e) => setLocal({ ...local, tiempoEstimadoMin: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label style={styles.label}>URL de Foto / Banner del negocio (opcional)</label>
              <input
                placeholder="https://images.unsplash.com/..."
                style={inputStyle}
                value={local.imagenUrl}
                onChange={(e) => setLocal({ ...local, imagenUrl: e.target.value })}
              />
            </div>

            <button type="button" onClick={usarUbicacion} style={styles.gpsBtn}>
              <MapPin size={16} />
              <span>
                {local.latitud
                  ? `✓ Ubicación GPS lista (${Number(local.latitud).toFixed(4)}, ${Number(local.longitud).toFixed(4)}) — clic para actualizar`
                  : "Obtener ubicación GPS actual del negocio"}
              </span>
            </button>

            <button type="submit" style={styles.primaryBtn}>
              Crear y Publicar mi Negocio
            </button>
          </form>
        ) : (
          <>
            <section style={styles.card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                <div>
                  <span style={styles.activeBadge}>● Publicado en catálogo</span>
                  <h2 style={{ ...styles.cardTitle, marginTop: 4 }}>{negocio?.nombre}</h2>
                  <p style={styles.muted}>
                    {negocio?.direccion} · Domicilio ${Number(negocio?.costoEnvio || 0).toLocaleString("es-CO")}
                  </p>
                </div>
                {negocios.length > 1 && (
                  <select style={{ ...inputStyle, width: "auto" }} value={negocioId || ""} onChange={(e) => setNegocioId(Number(e.target.value))}>
                    {negocios.map((n) => <option key={n.id} value={n.id}>{n.nombre}</option>)}
                  </select>
                )}
              </div>
            </section>

            <section style={styles.card}>
              <h2 style={styles.cardTitle}>🍽️ Menú de Productos ({menu.length})</h2>
              {menu.length === 0 && <EmptyState icon="🍕" title="Tu menú está vacío" description="Agrega tus platos, bebidas o entradas abajo para empezar a vender." />}
              {menu.map((item) => (
                <div key={item.id} style={styles.row}>
                  <div>
                    <strong style={{ color: "#11141A", fontSize: "1rem" }}>{item.nombre}</strong>
                    <p style={styles.muted}>
                      {item.categoria} · <strong>${Number(item.precio).toLocaleString("es-CO")}</strong> ·{" "}
                      <span style={{ color: item.disponible ? "#16A34A" : "#DC2626", fontWeight: 700 }}>
                        {item.disponible ? "Disponible" : "Agotado / Oculto"}
                      </span>
                    </p>
                  </div>
                  <div style={styles.actions}>
                    <button type="button" style={styles.ghost} onClick={() => alternar(item)}>
                      {item.disponible ? "Ocultar" : "Mostrar"}
                    </button>
                    <button type="button" style={styles.danger} onClick={() => eliminar(item)}>
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}

              <form onSubmit={agregarProducto} style={styles.form}>
                <h3 style={{ fontSize: "1rem", fontWeight: 800, margin: "8px 0 4px", display: "flex", alignItems: "center", gap: 6 }}>
                  <PlusCircle size={18} color="#E30613" /> Agregar nuevo plato o producto
                </h3>
                <div style={styles.formGrid}>
                  <input required placeholder="Nombre del plato (ej. Pizza Margarita)" style={inputStyle} value={producto.nombre} onChange={(e) => setProducto({ ...producto, nombre: e.target.value })} />
                  <input required type="number" min="100" placeholder="Precio en COP (ej. 15900)" style={inputStyle} value={producto.precio} onChange={(e) => setProducto({ ...producto, precio: e.target.value })} />
                  <input placeholder="Categoría (ej. Entradas, Pizzas, Bebidas)" style={inputStyle} value={producto.categoria} onChange={(e) => setProducto({ ...producto, categoria: e.target.value })} />
                  <input placeholder="URL de foto del plato (opcional)" style={inputStyle} value={producto.imagen} onChange={(e) => setProducto({ ...producto, imagen: e.target.value })} />
                </div>
                <input placeholder="Descripción de ingredientes (ej. Tomate, mozzarella fresca y albahaca)" style={inputStyle} value={producto.descripcion} onChange={(e) => setProducto({ ...producto, descripcion: e.target.value })} />
                <button type="submit" style={styles.primaryBtn}>
                  + Agregar al menú
                </button>
              </form>
            </section>

            <section style={styles.card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2 style={styles.cardTitle}>📦 Pedidos en vivo ({pedidos.length})</h2>
                <button type="button" style={styles.refreshBtn} onClick={cargar}>
                  Actualizar
                </button>
              </div>
              {pedidos.length === 0 && (
                <EmptyState icon="🛵" title="Aún no hay pedidos activos" description="Cuando un cliente pida en tu negocio, sonará una alerta y aparecerá aquí en tiempo real." />
              )}
              {pedidos.map((pedido) => {
                const estadoColor =
                  pedido.estado === "CREADO" ? "#D97706" :
                  pedido.estado === "ASIGNADO" ? "#2563EB" :
                  pedido.estado === "RECOGIENDO" ? "#7C3AED" :
                  pedido.estado === "EN_CAMINO" ? "#0891B2" :
                  pedido.estado === "ENTREGADO" ? "#16A34A" : "#DC2626";

                return (
                  <div key={pedido.idPedido} style={styles.pedidoCard}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <strong style={{ fontSize: "1rem", color: "#11141A" }}>Pedido #{pedido.idPedido}</strong>
                          <span
                            style={{
                              backgroundColor: `${estadoColor}18`,
                              color: estadoColor,
                              border: `1px solid ${estadoColor}`,
                              borderRadius: "999px",
                              padding: "2px 10px",
                              fontSize: "11px",
                              fontWeight: 800,
                            }}
                          >
                            {pedido.estado}
                          </span>
                        </div>
                        <p style={styles.muted}>
                          Cliente: {pedido.cliente?.nombre || "Cliente"} · Entrega: {pedido.dirEntrega || "Popayán"}
                        </p>
                      </div>
                      <strong style={{ color: "#11141A", fontSize: "1.1rem", fontWeight: 900 }}>
                        ${Number(pedido.total || 0).toLocaleString("es-CO")}
                      </strong>
                    </div>

                    {pedido.items && pedido.items.length > 0 && (
                      <div style={styles.itemsList}>
                        <span style={{ fontSize: "12px", color: "#4B5563", fontWeight: 700, marginBottom: 4, display: "flex", alignItems: "center", gap: 4 }}>
                          <ShoppingBag size={14} color="#E30613" /> Productos solicitados:
                        </span>
                        {pedido.items.map((it, idx) => (
                          <div key={it.id || idx} style={styles.itemRow}>
                            <span><strong>{it.cantidad}x</strong> {it.menuItem?.nombre || it.producto?.nombre || "Producto"}</span>
                            <span style={{ fontWeight: 700 }}>${((it.precio || 0) * it.cantidad).toLocaleString("es-CO")}</span>
                          </div>
                        ))}
                      </div>
                    )}

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
                          <Clock size={14} /> {actualizandoPedidoId === pedido.idPedido ? "Guardando…" : "Aceptar y pasar a Cocina"}
                        </button>
                      )}

                      {pedido.estado === "ASIGNADO" && (
                        <button
                          type="button"
                          disabled={actualizandoPedidoId === pedido.idPedido}
                          style={styles.actionBtnGreen}
                          onClick={() => cambiarEstadoPedido(pedido.idPedido, "RECOGIENDO")}
                        >
                          <CheckCircle size={14} /> {actualizandoPedidoId === pedido.idPedido ? "Guardando…" : "Marcar listo para entregar al repartidor"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </section>
          </>
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
    paddingBottom: "100px",
  },
  darkBanner: {
    backgroundColor: "#0D1117",
    color: "#FFFFFF",
    padding: "24px 20px",
  },
  darkBannerInner: {
    maxWidth: "900px",
    margin: "0 auto",
  },
  storeIconWrap: {
    width: "48px",
    height: "48px",
    borderRadius: "14px",
    backgroundColor: "#E30613",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: "1.4rem",
    fontWeight: 900,
    margin: 0,
    color: "#FFFFFF",
  },
  bannerSubtitle: {
    color: "#D1D5DB",
    margin: "2px 0 0",
    fontSize: "0.88rem",
  },
  container: {
    maxWidth: "900px",
    margin: "0 auto",
    padding: "24px 16px",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  muted: {
    color: "#6B7280",
    margin: "4px 0 0",
    fontSize: "0.88rem",
  },
  card: {
    backgroundColor: "#FFFFFF",
    border: "1px solid #E5E7EB",
    borderRadius: "18px",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
  },
  cardTitle: {
    margin: 0,
    fontSize: "1.15rem",
    fontWeight: 800,
    color: "#11141A",
  },
  activeBadge: {
    display: "inline-block",
    fontSize: "0.75rem",
    fontWeight: 800,
    color: "#16A34A",
    backgroundColor: "#F0FDF4",
    padding: "3px 10px",
    borderRadius: "999px",
    border: "1px solid #BBF7D0",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
    gap: "12px",
  },
  label: {
    display: "block",
    fontSize: "0.82rem",
    fontWeight: 700,
    color: "#374151",
    marginBottom: "6px",
  },
  gpsBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    minHeight: "44px",
    borderRadius: "12px",
    border: "1px solid #BBF7D0",
    backgroundColor: "#F0FDF4",
    color: "#15803D",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "0.88rem",
  },
  primaryBtn: {
    minHeight: "48px",
    borderRadius: "9999px",
    border: "none",
    backgroundColor: "#E30613",
    color: "#FFFFFF",
    fontWeight: 800,
    fontSize: "0.95rem",
    cursor: "pointer",
    boxShadow: "0 6px 16px rgba(227,6,19,0.28)",
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "center",
    borderBottom: "1px solid #E5E7EB",
    paddingBottom: "12px",
  },
  actions: { display: "flex", gap: "8px", flexShrink: 0 },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginTop: "8px",
    paddingTop: "12px",
    borderTop: "1px solid #E5E7EB",
  },
  ghost: {
    padding: "8px 14px",
    borderRadius: "10px",
    border: "1px solid #D1D5DB",
    background: "#F8F9FA",
    color: "#11141A",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "0.84rem",
  },
  danger: {
    padding: "8px 14px",
    borderRadius: "10px",
    border: "1px solid #FECACA",
    background: "#FEF2F2",
    color: "#DC2626",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "0.84rem",
  },
  refreshBtn: {
    backgroundColor: "#F8F9FA",
    border: "1px solid #E5E7EB",
    color: "#E30613",
    borderRadius: "999px",
    padding: "6px 14px",
    cursor: "pointer",
    fontSize: "0.82rem",
    fontWeight: 800,
  },
  pedidoCard: {
    backgroundColor: "#F8F9FA",
    border: "1px solid #E5E7EB",
    borderRadius: "14px",
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  itemsList: {
    backgroundColor: "#FFFFFF",
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #E5E7EB",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  itemRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "0.9rem",
    color: "#11141A",
  },
  pedidoActions: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginTop: "4px",
  },
  actionBtnPrimary: {
    minHeight: "40px",
    padding: "8px 16px",
    borderRadius: "999px",
    backgroundColor: "#E30613",
    color: "#FFFFFF",
    border: "none",
    fontWeight: 800,
    display: "flex",
    alignItems: "center",
    gap: "6px",
    cursor: "pointer",
    fontSize: "0.85rem",
  },
  actionBtnGreen: {
    minHeight: "40px",
    padding: "8px 16px",
    borderRadius: "999px",
    backgroundColor: "#16A34A",
    color: "#FFFFFF",
    border: "none",
    fontWeight: 800,
    display: "flex",
    alignItems: "center",
    gap: "6px",
    cursor: "pointer",
    fontSize: "0.85rem",
  },
  actionBtnSecondary: {
    minHeight: "40px",
    padding: "8px 16px",
    borderRadius: "999px",
    backgroundColor: "#FFFFFF",
    color: "#11141A",
    border: "1px solid #D1D5DB",
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    gap: "6px",
    cursor: "pointer",
    fontSize: "0.85rem",
  },
};
