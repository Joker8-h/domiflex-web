import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import theme from "../../styles/theme";
import { api } from "../../api/client";
import { Button } from "../../components/common";
import EmptyState from "../../components/ui/EmptyState";
import ErrorState from "../../components/ui/ErrorState";

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
  const [producto, setProducto] = useState({ nombre: "", precio: "", categoria: "Platos", imagen: "" });
  const [local, setLocal] = useState({
    nombre: "",
    direccion: "",
    telefono: "",
    costoEnvio: 2000,
    latitud: "",
    longitud: "",
  });

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

  const negocio = negocios.find((n) => n.id === negocioId) || negocios[0];

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.title}>Mi local</h1>
        <p style={styles.muted}>Menú, precios y pedidos de tu negocio.</p>
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
            <h2 style={styles.cardTitle}>Pedidos del local</h2>
            {pedidos.length === 0 && <EmptyState icon="📦" title="Aún no hay pedidos" description="Cuando un cliente pida, aparecerá aquí." />}
            {pedidos.map((pedido) => (
              <div key={pedido.idPedido} style={styles.row}>
                <div>
                  <strong>#{pedido.idPedido} · {pedido.estado}</strong>
                  <p style={styles.muted}>
                    {pedido.cliente?.nombre || "Cliente"} · ${Number(pedido.total || 0).toLocaleString()} · {pedido.dirEntrega || "Sin dirección"}
                  </p>
                </div>
              </div>
            ))}
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
};
