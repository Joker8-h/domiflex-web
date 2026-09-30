import React, { useState, useEffect, useCallback } from "react";
import { Store, Search, Star, Phone, MapPin, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import theme from "../../styles/theme";
import tokens from "../../design/tokens";
import { api } from "../../api/client";
import { SkeletonCard } from "../../components/ui/Skeleton";
import ErrorState from "../../components/ui/ErrorState";
import EmptyState from "../../components/ui/EmptyState";

export default function AdminNegocios() {
  const [negocios, setNegocios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("TODOS");
  const [procesandoId, setProcesandoId] = useState(null);

  const fetchNegocios = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.get("/negocios/admin/todos");
      setNegocios(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error al cargar comercios para admin:", err);
      setError(err.message || "No se pudo cargar la lista de comercios.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNegocios();
  }, [fetchNegocios]);

  const toggleEstadoNegocio = async (negocio) => {
    try {
      setProcesandoId(negocio.id);
      const nuevoEstado = !negocio.activo;
      await api.put(`/negocios/${negocio.id}`, { activo: nuevoEstado });
      toast.success(
        `Local ${negocio.nombre} ${nuevoEstado ? "activado" : "desactivado"} exitosamente.`
      );
      setNegocios((prev) =>
        prev.map((n) => (n.id === negocio.id ? { ...n, activo: nuevoEstado } : n))
      );
    } catch (err) {
      toast.error(err.message || "Error al actualizar estado del comercio.");
    } finally {
      setProcesandoId(null);
    }
  };

  const negociosFiltrados = negocios.filter((n) => {
    const matchBusqueda =
      n.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      (n.direccion && n.direccion.toLowerCase().includes(busqueda.toLowerCase()));
    const matchTipo = filtroTipo === "TODOS" || n.tipo === filtroTipo;
    return matchBusqueda && matchTipo;
  });

  const totalComercios = negocios.length;
  const comerciosActivos = negocios.filter((n) => n.activo).length;
  const promedioRating =
    totalComercios > 0
      ? (
          negocios.reduce((acc, n) => acc + (Number(n.calificacion) || 0), 0) /
          totalComercios
        ).toFixed(1)
      : "5.0";

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Comercios Aliados</h1>
          <p style={styles.subtitle}>
            Gestión y supervisión de restaurantes y tiendas aliadas en Popayán.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchNegocios}
          style={styles.refreshBtn}
          aria-label="Refrescar lista de comercios"
        >
          <RefreshCw size={16} /> Actualizar
        </button>
      </header>

      {/* Tarjetas de Métricas */}
      <div style={styles.metricsGrid}>
        <div style={styles.metricCard}>
          <span style={styles.metricLabel}>Total Comercios</span>
          <strong style={styles.metricValue}>{totalComercios}</strong>
        </div>
        <div style={styles.metricCard}>
          <span style={styles.metricLabel}>Activos para Pedidos</span>
          <strong style={{ ...styles.metricValue, color: theme.colors.accent }}>
            {comerciosActivos}
          </strong>
        </div>
        <div style={styles.metricCard}>
          <span style={styles.metricLabel}>Rating Promedio</span>
          <strong style={{ ...styles.metricValue, color: "#FFC107", display: "flex", alignItems: "center", gap: 6 }}>
            <Star size={20} fill="#FFC107" /> {promedioRating}
          </strong>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div style={styles.filterBar}>
        <div style={styles.searchBox}>
          <Search size={18} color={theme.colors.textSecondary} />
          <input
            type="text"
            placeholder="Buscar por nombre o dirección..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={styles.searchInput}
          />
        </div>
        <div style={styles.tipoTabs}>
          {["TODOS", "COMIDA", "MERCADO", "FARMACIA"].map((tipo) => (
            <button
              key={tipo}
              type="button"
              onClick={() => setFiltroTipo(tipo)}
              style={{
                ...styles.tipoTab,
                backgroundColor: filtroTipo === tipo ? `${theme.colors.accent}20` : "transparent",
                color: filtroTipo === tipo ? theme.colors.accent : theme.colors.textSecondary,
                borderColor: filtroTipo === tipo ? theme.colors.accent : theme.colors.border,
              }}
            >
              {tipo}
            </button>
          ))}
        </div>
      </div>

      {/* Contenido Principal */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : error ? (
        <ErrorState
          title="Error al cargar comercios"
          description={error}
          onRetry={fetchNegocios}
        />
      ) : negociosFiltrados.length === 0 ? (
        <EmptyState
          icon="🏪"
          title="No se encontraron comercios"
          description="Intenta cambiar los filtros de búsqueda o categoría."
        />
      ) : (
        <div style={styles.grid}>
          {negociosFiltrados.map((negocio) => (
            <div key={negocio.id} style={styles.negocioCard}>
              <div style={styles.cardHeader}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={styles.iconAvatar}>
                    <Store size={22} color={theme.colors.accent} />
                  </div>
                  <div>
                    <h3 style={styles.negocioNombre}>{negocio.nombre}</h3>
                    <span style={styles.negocioTipo}>{negocio.tipo}</span>
                  </div>
                </div>
                <span
                  style={{
                    ...styles.statusBadge,
                    backgroundColor: negocio.activo ? `${theme.colors.accent}20` : "rgba(239, 68, 68, 0.2)",
                    color: negocio.activo ? theme.colors.accent : "#EF4444",
                    borderColor: negocio.activo ? theme.colors.accent : "#EF4444",
                  }}
                >
                  {negocio.activo ? "Activo" : "Inactivo"}
                </span>
              </div>

              <div style={styles.cardBody}>
                <div style={styles.infoRow}>
                  <MapPin size={15} color={theme.colors.textSecondary} />
                  <span>{negocio.direccion || "Popayán, Cauca"}</span>
                </div>
                {negocio.telefono && (
                  <div style={styles.infoRow}>
                    <Phone size={15} color={theme.colors.textSecondary} />
                    <span>{negocio.telefono}</span>
                  </div>
                )}
                <div style={styles.infoRow}>
                  <Star size={15} color="#FFC107" fill="#FFC107" />
                  <span>
                    {negocio.calificacion ? Number(negocio.calificacion).toFixed(1) : "5.0"}
                    {" "}({negocio.totalCalificaciones || 0} calificaciones)
                  </span>
                </div>
              </div>

              <div style={styles.cardFooter}>
                <span style={styles.costoEnvio}>
                  Envío: ${Number(negocio.costoEnvio || 0).toLocaleString()} COP
                </span>
                <button
                  type="button"
                  disabled={procesandoId === negocio.id}
                  onClick={() => toggleEstadoNegocio(negocio)}
                  style={{
                    ...styles.toggleBtn,
                    backgroundColor: negocio.activo ? "rgba(239, 68, 68, 0.15)" : `${theme.colors.accent}15`,
                    color: negocio.activo ? "#EF4444" : theme.colors.accent,
                    borderColor: negocio.activo ? "#EF4444" : theme.colors.accent,
                  }}
                >
                  {negocio.activo ? (
                    <>
                      <XCircle size={15} /> Desactivar
                    </>
                  ) : (
                    <>
                      <CheckCircle size={15} /> Activar
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
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
    flexWrap: "wrap",
    gap: "12px",
    alignItems: "center",
    justifyContent: "space-between",
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
    flex: "1 1 300px",
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
  tipoTabs: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },
  tipoTab: {
    border: "1px solid",
    padding: "8px 14px",
    borderRadius: theme.borderRadius.xl,
    fontSize: theme.fontSize.xs,
    fontWeight: 600,
    cursor: "pointer",
    minHeight: "40px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: "16px",
  },
  negocioCard: {
    backgroundColor: theme.colors.bgCard,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.md,
    padding: "18px",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  iconAvatar: {
    width: "44px",
    height: "44px",
    borderRadius: "10px",
    backgroundColor: `${theme.colors.accent}15`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  negocioNombre: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    margin: "0 0 2px 0",
    color: theme.colors.textPrimary,
  },
  negocioTipo: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    fontWeight: 500,
  },
  statusBadge: {
    fontSize: "11px",
    fontWeight: 600,
    padding: "4px 8px",
    borderRadius: "12px",
    border: "1px solid",
  },
  cardBody: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    padding: "8px 0",
    borderTop: `1px solid ${theme.colors.border}40`,
    borderBottom: `1px solid ${theme.colors.border}40`,
  },
  infoRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  cardFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "auto",
  },
  costoEnvio: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textPrimary,
    fontWeight: 600,
  },
  toggleBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    border: "1px solid",
    borderRadius: theme.borderRadius.sm,
    padding: "8px 12px",
    fontSize: theme.fontSize.xs,
    fontWeight: 600,
    cursor: "pointer",
    minHeight: "40px",
  },
};
