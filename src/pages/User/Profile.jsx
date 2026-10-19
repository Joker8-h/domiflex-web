import React, { useState, useEffect } from "react";
import { 
  ShoppingBag, 
  User, 
  MapPin, 
  CreditCard, 
  Bell, 
  LogOut, 
  Clock, 
  CheckCircle2, 
  ChevronRight, 
  Star, 
  Phone, 
  Save, 
  ArrowRight,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import NavbarCustom from "../../components/Navbar";
import { API_URL } from "../../config";
import tokens from "../../design/tokens";
import toast from "react-hot-toast";
import Avatar from "../../components/common/Avatar";
import EmptyState from "../../components/ui/EmptyState";

export default function Profile() {
  const { usuario, token, setUsuario, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("en_curso"); // "en_curso" | "historial" | "estadisticas" | "datos"
  const [pedidos, setPedidos] = useState([]);
  const [loadingPedidos, setLoadingPedidos] = useState(true);

  // Form states
  const [nombre, setNombre] = useState(usuario?.nombre || "");
  const [telefono, setTelefono] = useState(usuario?.telefono || "");
  const [nombreEmergencia, setNombreEmergencia] = useState(usuario?.nombreEmergencia || "");
  const [numeroEmergencia, setNumeroEmergencia] = useState(usuario?.numeroEmergencia || "");
  const [saving, setSaving] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    entregados: 0,
    cancelados: 0,
    gastado: 0,
    calificacionPromedio: 4.9,
  });

  useEffect(() => {
    if (!token || !usuario?.idUsuarios) {
      setLoadingPedidos(false);
      return;
    }

    const fetchPedidos = async () => {
      try {
        setLoadingPedidos(true);
        const res = await fetch(`${API_URL}/pedidos/mis-pedidos`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        let promedioReal = 4.9;
        try {
          const resCal = await fetch(`${API_URL}/calificaciones/${usuario.idUsuarios}/promedio`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (resCal.ok) {
            const calData = await resCal.json();
            const val = Number(calData?.promedio?.promedio ?? calData?.promedio ?? 0);
            if (val > 0) promedioReal = Number(val.toFixed(1));
          }
        } catch {
          // keep fallback 4.9
        }

        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data) ? data : [];
          setPedidos(list);

          const entregados = list.filter((p) => p.estado === "ENTREGADO").length;
          const cancelados = list.filter((p) => p.estado === "CANCELADO").length;
          const gastado = list
            .filter((p) => p.estado === "ENTREGADO")
            .reduce((sum, p) => sum + Number(p.total || 0), 0);

          setStats({
            total: list.length,
            entregados,
            cancelados,
            gastado,
            calificacionPromedio: promedioReal,
          });
        }
      } catch (err) {
        console.error("Error al cargar pedidos del perfil:", err);
      } finally {
        setLoadingPedidos(false);
      }
    };

    fetchPedidos();
  }, [token, usuario?.idUsuarios]);

  const handleGuardarDatos = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await fetch(`${API_URL}/auth/${usuario.idUsuarios}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nombre, telefono, nombreEmergencia, numeroEmergencia }),
      });

      if (res.ok) {
        setUsuario({ ...usuario, nombre, telefono, nombreEmergencia, numeroEmergencia });
        toast.success("Tus datos han sido actualizados con éxito.");
      } else {
        toast.error("No se pudieron actualizar los datos.");
      }
    } catch (err) {
      toast.error("Error al conectar con el servidor.");
    } finally {
      setSaving(false);
    }
  };

  const pedidosEnCurso = pedidos.filter(
    (p) => p.estado !== "ENTREGADO" && p.estado !== "CANCELADO"
  );
  const historialPedidos = pedidos.filter(
    (p) => p.estado === "ENTREGADO" || p.estado === "CANCELADO"
  );

  return (
    <div style={styles.page}>
      <NavbarCustom />

      <main style={styles.container}>
        <div style={styles.layoutGrid}>
          {/* Left Column: User Profile Card & Navigation */}
          <aside style={styles.sidebar}>
            <div style={styles.userCard}>
              <div style={styles.avatarWrap}>
                <Avatar name={usuario?.nombre || "Usuario"} size={72} />
              </div>
              <h2 style={styles.userName}>{usuario?.nombre || "Pedro Pepito"}</h2>
              <span style={styles.userRole}>Cliente Rapitipica</span>
              <p style={styles.userMeta}>
                {usuario?.email || "usuario@rapitipica.com"}
              </p>
              {usuario?.telefono && (
                <p style={styles.userMeta}>📞 {usuario.telefono}</p>
              )}
            </div>

            <nav style={styles.navMenu}>
              <button
                type="button"
                style={{
                  ...styles.navBtn,
                  ...(activeTab === "en_curso" || activeTab === "historial"
                    ? styles.navBtnActive
                    : {}),
                }}
                onClick={() => setActiveTab("en_curso")}
              >
                <div style={styles.navBtnContent}>
                  <ShoppingBag size={18} />
                  <span>Mis pedidos</span>
                </div>
                {pedidosEnCurso.length > 0 && (
                  <span style={styles.badgeActive}>{pedidosEnCurso.length}</span>
                )}
              </button>

              <button
                type="button"
                style={{
                  ...styles.navBtn,
                  ...(activeTab === "estadisticas" ? styles.navBtnActive : {}),
                }}
                onClick={() => setActiveTab("estadisticas")}
              >
                <div style={styles.navBtnContent}>
                  <TrendingUp size={18} />
                  <span>Mis estadísticas</span>
                </div>
              </button>

              <button
                type="button"
                style={{
                  ...styles.navBtn,
                  ...(activeTab === "datos" ? styles.navBtnActive : {}),
                }}
                onClick={() => setActiveTab("datos")}
              >
                <div style={styles.navBtnContent}>
                  <User size={18} />
                  <span>Datos personales</span>
                </div>
              </button>

              <button
                type="button"
                style={styles.navBtn}
                onClick={() => {
                  const actual = localStorage.getItem("domiflex_direccion") || formData.direccion || "";
                  const nueva = window.prompt("Ingresa o actualiza tu dirección predeterminada de entrega:", actual);
                  if (nueva !== null && nueva.trim()) {
                    localStorage.setItem("domiflex_direccion", nueva.trim());
                    setFormData((prev) => ({ ...prev, direccion: nueva.trim() }));
                    toast.success(`Dirección actualizada: ${nueva.trim()}`);
                  }
                }}
              >
                <div style={styles.navBtnContent}>
                  <MapPin size={18} />
                  <span>Direcciones de entrega</span>
                </div>
              </button>

              <button
                type="button"
                style={styles.navBtn}
                onClick={() => {
                  toast.success("Métodos habilitados: Efectivo contraentrega y Tarjeta / PSE vía Wompi Bancolombia.", { icon: "💳" });
                }}
              >
                <div style={styles.navBtnContent}>
                  <CreditCard size={18} />
                  <span>Métodos de pago</span>
                </div>
              </button>

              <div style={styles.menuDivider} />

              <button
                type="button"
                style={styles.logoutBtn}
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
              >
                <LogOut size={18} />
                <span>Cerrar sesión</span>
              </button>
            </nav>
          </aside>

          {/* Right Column: Main Content Panels */}
          <section style={styles.mainPanel}>
            {/* Top Sub-Navigation Tabs */}
            <div style={styles.tabsHeader}>
              <button
                type="button"
                style={{
                  ...styles.tabItem,
                  ...(activeTab === "en_curso" ? styles.tabItemActive : {}),
                }}
                onClick={() => setActiveTab("en_curso")}
              >
                <span>En curso</span>
                {pedidosEnCurso.length > 0 && (
                  <span style={styles.tabBadge}>{pedidosEnCurso.length}</span>
                )}
              </button>

              <button
                type="button"
                style={{
                  ...styles.tabItem,
                  ...(activeTab === "historial" ? styles.tabItemActive : {}),
                }}
                onClick={() => setActiveTab("historial")}
              >
                <span>Historial de pedidos</span>
                <span style={styles.tabBadgeSecondary}>{historialPedidos.length}</span>
              </button>

              <button
                type="button"
                style={{
                  ...styles.tabItem,
                  ...(activeTab === "estadisticas" ? styles.tabItemActive : {}),
                }}
                onClick={() => setActiveTab("estadisticas")}
              >
                <span>Estadísticas</span>
              </button>

              <button
                type="button"
                style={{
                  ...styles.tabItem,
                  ...(activeTab === "datos" ? styles.tabItemActive : {}),
                }}
                onClick={() => setActiveTab("datos")}
              >
                <span>Editar datos</span>
              </button>
            </div>

            {/* TAB: EN CURSO */}
            {activeTab === "en_curso" && (
              <div>
                {loadingPedidos ? (
                  <div style={styles.loadingBox}>
                    <div style={styles.spinner} />
                    <p style={{ color: tokens.colors.textSecondary, marginTop: 12 }}>
                      Cargando pedidos en curso...
                    </p>
                  </div>
                ) : pedidosEnCurso.length === 0 ? (
                  <div style={styles.emptyCard}>
                    <EmptyState
                      icon="🛵"
                      title="No tienes pedidos en curso"
                      description="¿Tienes hambre? Explora los mejores restaurantes típicos y modernos de Popayán."
                      actionLabel="Hacer un pedido ahora"
                      onAction={() => navigate("/restaurantes")}
                    />
                  </div>
                ) : (
                  <div style={styles.ordersList}>
                    {pedidosEnCurso.map((p) => (
                      <div key={p.idPedido} style={styles.orderCardActive}>
                        <div style={styles.orderCardHeader}>
                          <div style={styles.orderNegocioRow}>
                            <div style={styles.negocioAvatar}>🏪</div>
                            <div>
                              <h3 style={styles.orderNegocioTitle}>
                                {p.negocio?.nombre || p.nombreRecogida || "Restaurante"}
                              </h3>
                              <span style={styles.orderDate}>
                                Pedido #{p.idPedido} • {p.fechaPedido ? new Date(p.fechaPedido).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Hoy"}
                              </span>
                            </div>
                          </div>

                          <div style={styles.activeStatusPill}>
                            <span style={styles.pulsingDot} />
                            <span>{p.estado === "EN_CAMINO" ? "En camino a tu casa" : p.estado}</span>
                          </div>
                        </div>

                        <div style={styles.orderItemsPreview}>
                          <p style={styles.itemsSummaryText}>
                            {p.items?.length
                              ? p.items.map((i) => `${i.cantidad}x ${i.menuItem?.nombre || "Plato"}`).join(", ")
                              : p.detallePedido || "Detalle del pedido"}
                          </p>
                        </div>

                        <div style={styles.orderCardFooter}>
                          <div style={styles.orderPriceWrap}>
                            <span style={styles.priceLabel}>Total del pedido</span>
                            <span style={styles.priceValue}>${Number(p.total || 0).toLocaleString()}</span>
                          </div>

                          <button
                            type="button"
                            style={styles.trackBtn}
                            onClick={() => navigate(`/tracking/${p.idPedido}`)}
                          >
                            <span>Seguir en vivo</span>
                            <ChevronRight size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: HISTORIAL */}
            {activeTab === "historial" && (
              <div>
                {loadingPedidos ? (
                  <div style={styles.loadingBox}>
                    <div style={styles.spinner} />
                    <p style={{ color: tokens.colors.textSecondary, marginTop: 12 }}>
                      Cargando historial...
                    </p>
                  </div>
                ) : historialPedidos.length === 0 ? (
                  <div style={styles.emptyCard}>
                    <EmptyState
                      icon="📦"
                      title="Aún no tienes pedidos completados"
                      description="Cuando realices pedidos aparecerán aquí para que puedas volver a pedir fácilmente."
                      actionLabel="Explorar restaurantes"
                      onAction={() => navigate("/restaurantes")}
                    />
                  </div>
                ) : (
                  <div style={styles.ordersList}>
                    {historialPedidos.map((p) => (
                      <div key={p.idPedido} style={styles.orderCard}>
                        <div style={styles.orderCardHeader}>
                          <div style={styles.orderNegocioRow}>
                            <div style={styles.negocioAvatar}>🍔</div>
                            <div>
                              <h3 style={styles.orderNegocioTitle}>
                                {p.negocio?.nombre || p.nombreRecogida || "Restaurante"}
                              </h3>
                              <span style={styles.orderDate}>
                                {p.fechaPedido ? new Date(p.fechaPedido).toLocaleDateString("es-CO", { dateStyle: "medium" }) : "Fecha reciente"}
                              </span>
                            </div>
                          </div>

                          <span
                            style={{
                              ...styles.historyStatusPill,
                              backgroundColor: p.estado === "ENTREGADO" ? "rgba(0, 229, 118, 0.12)" : "rgba(239, 68, 68, 0.12)",
                              color: p.estado === "ENTREGADO" ? tokens.colors.accent : "#EF4444",
                            }}
                          >
                            {p.estado === "ENTREGADO" ? "✓ Entregado" : "✕ Cancelado"}
                          </span>
                        </div>

                        <div style={styles.orderItemsPreview}>
                          <p style={styles.itemsSummaryText}>
                            {p.items?.length
                              ? p.items.map((i) => `${i.cantidad}x ${i.menuItem?.nombre || "Plato"}`).join(", ")
                              : p.detallePedido || "Entrega de comida"}
                          </p>
                        </div>

                        <div style={styles.orderCardFooter}>
                          <div style={styles.orderPriceWrap}>
                            <span style={styles.priceLabel}>Total pagado</span>
                            <span style={styles.priceValue}>${Number(p.total || 0).toLocaleString()}</span>
                          </div>

                          <div style={styles.historyActions}>
                            <button
                              type="button"
                              style={styles.reorderBtn}
                              onClick={() => navigate(`/negocio/${p.negocioId || p.idNegocio || p.negocio?.id || 1}`)}
                            >
                              <span>Pedir de nuevo</span>
                            </button>
                            <button
                              type="button"
                              style={styles.detailsBtn}
                              onClick={() => navigate(`/tracking/${p.idPedido}`)}
                            >
                              <span>Ver detalles</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: ESTADÍSTICAS */}
            {activeTab === "estadisticas" && (
              <div style={styles.statsContainer}>
                <div style={styles.statsGrid}>
                  <div style={styles.statCard}>
                    <div style={styles.statIconCircle}>
                      <ShoppingBag size={24} color={tokens.colors.accent} />
                    </div>
                    <div>
                      <span style={styles.statCardLabel}>Total Pedidos</span>
                      <h3 style={styles.statCardValue}>{stats.total}</h3>
                    </div>
                  </div>

                  <div style={styles.statCard}>
                    <div style={styles.statIconCircle}>
                      <CheckCircle2 size={24} color={tokens.colors.accent} />
                    </div>
                    <div>
                      <span style={styles.statCardLabel}>Entregados con éxito</span>
                      <h3 style={styles.statCardValue}>{stats.entregados}</h3>
                    </div>
                  </div>

                  <div style={styles.statCard}>
                    <div style={styles.statIconCircle}>
                      <TrendingUp size={24} color={tokens.colors.accent} />
                    </div>
                    <div>
                      <span style={styles.statCardLabel}>Total Invertido</span>
                      <h3 style={styles.statCardValue}>${stats.gastado.toLocaleString()}</h3>
                    </div>
                  </div>

                  <div style={styles.statCard}>
                    <div style={styles.statIconCircle}>
                      <Star size={24} color={tokens.colors.accent} />
                    </div>
                    <div>
                      <span style={styles.statCardLabel}>Tu calificación media</span>
                      <h3 style={styles.statCardValue}>★ {stats.calificacionPromedio}</h3>
                    </div>
                  </div>
                </div>

                <div style={styles.membershipCard}>
                  <div style={styles.membershipInfo}>
                    <span style={styles.membershipBadge}>Club Rapitipica Prime</span>
                    <h3 style={styles.membershipTitle}>¡Envíos gratis y promociones exclusivas!</h3>
                    <p style={styles.membershipDesc}>
                      Disfruta de tarifas de envío a $0 en pedidos superiores a $20.000 y acumula puntos en cada compra.
                    </p>
                  </div>
                  <button
                    type="button"
                    style={styles.primeBtn}
                    onClick={() => toast.success("¡Próximamente disponible en Popayán!")}
                  >
                    Conocer beneficios
                  </button>
                </div>
              </div>
            )}

            {/* TAB: EDITAR DATOS */}
            {activeTab === "datos" && (
              <div style={styles.formContainer}>
                <form onSubmit={handleGuardarDatos} style={styles.editForm}>
                  <h3 style={styles.formTitle}>Información personal</h3>
                  <p style={styles.formSubtitle}>
                    Mantén tus datos actualizados para que los repartidores puedan contactarte sin demoras.
                  </p>

                  <div style={styles.formGrid}>
                    <div style={styles.formGroup}>
                      <label htmlFor="nombre" style={styles.label}>Nombre completo</label>
                      <input
                        id="nombre"
                        type="text"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        style={styles.input}
                        required
                      />
                    </div>

                    <div style={styles.formGroup}>
                      <label htmlFor="telefono" style={styles.label}>Teléfono celular</label>
                      <input
                        id="telefono"
                        type="tel"
                        value={telefono}
                        onChange={(e) => setTelefono(e.target.value)}
                        placeholder="312 000 0000"
                        style={styles.input}
                      />
                    </div>

                    <div style={styles.formGroup}>
                      <label htmlFor="nombreEmergencia" style={styles.label}>Contacto alternativo (opcional)</label>
                      <input
                        id="nombreEmergencia"
                        type="text"
                        value={nombreEmergencia}
                        onChange={(e) => setNombreEmergencia(e.target.value)}
                        placeholder="Nombre familiar o portería"
                        style={styles.input}
                      />
                    </div>

                    <div style={styles.formGroup}>
                      <label htmlFor="numeroEmergencia" style={styles.label}>Teléfono alternativo (opcional)</label>
                      <input
                        id="numeroEmergencia"
                        type="tel"
                        value={numeroEmergencia}
                        onChange={(e) => setNumeroEmergencia(e.target.value)}
                        placeholder="310 000 0000"
                        style={styles.input}
                      />
                    </div>
                  </div>

                  <div style={styles.formActions}>
                    <button
                      type="submit"
                      disabled={saving}
                      style={styles.saveBtn}
                    >
                      <Save size={18} />
                      <span>{saving ? "Guardando…" : "Guardar cambios"}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}
          </section>
        </div>
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
    padding: "32px 20px",
  },
  layoutGrid: {
    display: "grid",
    gridTemplateColumns: "300px 1fr",
    gap: "32px",
    alignItems: "start",
  },
  sidebar: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  userCard: {
    backgroundColor: tokens.colors.bgCard,
    border: `1px solid ${tokens.colors.border}`,
    borderRadius: tokens.borderRadius.lg,
    padding: "24px",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  avatarWrap: {
    position: "relative",
    marginBottom: "14px",
  },
  userName: {
    fontSize: tokens.fontSize.lg,
    fontWeight: tokens.fontWeight.bold,
    color: tokens.colors.textPrimary,
    margin: "0 0 4px 0",
  },
  userRole: {
    fontSize: tokens.fontSize.xs,
    color: tokens.colors.accent,
    fontWeight: 600,
    backgroundColor: "rgba(0, 229, 118, 0.12)",
    padding: "2px 10px",
    borderRadius: tokens.borderRadius.full,
    marginBottom: "8px",
  },
  userMeta: {
    fontSize: tokens.fontSize.xs,
    color: tokens.colors.textSecondary,
    margin: "2px 0",
  },
  navMenu: {
    backgroundColor: tokens.colors.bgCard,
    border: `1px solid ${tokens.colors.border}`,
    borderRadius: tokens.borderRadius.lg,
    padding: "12px",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  navBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 16px",
    borderRadius: tokens.borderRadius.md,
    border: "none",
    backgroundColor: "transparent",
    color: tokens.colors.textSecondary,
    fontSize: tokens.fontSize.sm,
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  navBtnActive: {
    backgroundColor: "rgba(0, 229, 118, 0.12)",
    color: tokens.colors.accent,
    fontWeight: 600,
  },
  navBtnContent: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  badgeActive: {
    backgroundColor: tokens.colors.accent,
    color: "#0B1F44",
    fontSize: "11px",
    fontWeight: 700,
    padding: "2px 8px",
    borderRadius: tokens.borderRadius.full,
  },
  menuDivider: {
    height: "1px",
    backgroundColor: tokens.colors.border,
    margin: "8px 0",
  },
  logoutBtn: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 16px",
    borderRadius: tokens.borderRadius.md,
    border: "none",
    backgroundColor: "transparent",
    color: "#EF4444",
    fontSize: tokens.fontSize.sm,
    fontWeight: 600,
    cursor: "pointer",
  },
  mainPanel: {
    backgroundColor: tokens.colors.bgCard,
    border: `1px solid ${tokens.colors.border}`,
    borderRadius: tokens.borderRadius.lg,
    padding: "28px",
  },
  tabsHeader: {
    display: "flex",
    gap: "12px",
    borderBottom: `1px solid ${tokens.colors.border}`,
    paddingBottom: "16px",
    marginBottom: "24px",
    overflowX: "auto",
  },
  tabItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 18px",
    borderRadius: tokens.borderRadius.full,
    border: `1px solid ${tokens.colors.border}`,
    backgroundColor: "transparent",
    color: tokens.colors.textSecondary,
    fontSize: tokens.fontSize.sm,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  tabItemActive: {
    backgroundColor: tokens.colors.accent,
    borderColor: tokens.colors.accent,
    color: "#0B1F44",
    boxShadow: tokens.shadows.glow,
  },
  tabBadge: {
    backgroundColor: "#0B1F44",
    color: tokens.colors.accent,
    fontSize: "11px",
    padding: "2px 6px",
    borderRadius: tokens.borderRadius.full,
    fontWeight: 700,
  },
  tabBadgeSecondary: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    fontSize: "11px",
    padding: "2px 6px",
    borderRadius: tokens.borderRadius.full,
  },
  ordersList: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  orderCardActive: {
    backgroundColor: tokens.colors.bgPrimary,
    border: `1px solid ${tokens.colors.accent}`,
    borderRadius: tokens.borderRadius.md,
    padding: "20px",
    boxShadow: "0 0 12px rgba(0, 229, 118, 0.15)",
  },
  orderCard: {
    backgroundColor: tokens.colors.bgPrimary,
    border: `1px solid ${tokens.colors.border}`,
    borderRadius: tokens.borderRadius.md,
    padding: "20px",
  },
  orderCardHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "12px",
  },
  orderNegocioRow: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },
  negocioAvatar: {
    width: "44px",
    height: "44px",
    borderRadius: tokens.borderRadius.sm,
    backgroundColor: "rgba(0, 229, 118, 0.12)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
  },
  orderNegocioTitle: {
    fontSize: tokens.fontSize.md,
    fontWeight: tokens.fontWeight.bold,
    color: tokens.colors.textPrimary,
    margin: "0 0 2px 0",
  },
  orderDate: {
    fontSize: tokens.fontSize.xs,
    color: tokens.colors.textSecondary,
  },
  activeStatusPill: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "rgba(0, 229, 118, 0.15)",
    color: tokens.colors.accent,
    padding: "6px 14px",
    borderRadius: tokens.borderRadius.full,
    fontSize: tokens.fontSize.xs,
    fontWeight: 700,
  },
  pulsingDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: tokens.colors.accent,
    boxShadow: "0 0 8px rgba(0, 229, 118, 0.8)",
  },
  historyStatusPill: {
    padding: "4px 12px",
    borderRadius: tokens.borderRadius.full,
    fontSize: tokens.fontSize.xs,
    fontWeight: 600,
  },
  orderItemsPreview: {
    padding: "12px 0",
    borderTop: `1px solid ${tokens.colors.border}`,
    borderBottom: `1px solid ${tokens.colors.border}`,
    margin: "12px 0",
  },
  itemsSummaryText: {
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.textSecondary,
    margin: 0,
    lineHeight: 1.4,
  },
  orderCardFooter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  orderPriceWrap: {
    display: "flex",
    flexDirection: "column",
  },
  priceLabel: {
    fontSize: tokens.fontSize.xs,
    color: tokens.colors.textSecondary,
  },
  priceValue: {
    fontSize: tokens.fontSize.lg,
    fontWeight: tokens.fontWeight.bold,
    color: tokens.colors.accent,
  },
  trackBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: tokens.colors.accent,
    color: "#0B1F44",
    border: "none",
    borderRadius: tokens.borderRadius.full,
    padding: "10px 20px",
    fontSize: tokens.fontSize.sm,
    fontWeight: tokens.fontWeight.bold,
    cursor: "pointer",
    boxShadow: tokens.shadows.glow,
  },
  historyActions: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  reorderBtn: {
    padding: "8px 16px",
    borderRadius: tokens.borderRadius.full,
    border: `1px solid ${tokens.colors.accent}`,
    backgroundColor: "transparent",
    color: tokens.colors.accent,
    fontSize: tokens.fontSize.xs,
    fontWeight: 600,
    cursor: "pointer",
  },
  detailsBtn: {
    padding: "8px 16px",
    borderRadius: tokens.borderRadius.full,
    border: `1px solid ${tokens.colors.border}`,
    backgroundColor: "transparent",
    color: tokens.colors.textSecondary,
    fontSize: tokens.fontSize.xs,
    cursor: "pointer",
  },
  statsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
  },
  statCard: {
    backgroundColor: tokens.colors.bgPrimary,
    border: `1px solid ${tokens.colors.border}`,
    borderRadius: tokens.borderRadius.md,
    padding: "20px",
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  statIconCircle: {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    backgroundColor: "rgba(0, 229, 118, 0.12)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  statCardLabel: {
    fontSize: tokens.fontSize.xs,
    color: tokens.colors.textSecondary,
    display: "block",
  },
  statCardValue: {
    fontSize: tokens.fontSize.xl,
    fontWeight: tokens.fontWeight.bold,
    color: tokens.colors.textPrimary,
    margin: "4px 0 0 0",
  },
  membershipCard: {
    backgroundColor: tokens.colors.bgPrimary,
    border: `1px solid ${tokens.colors.accent}`,
    borderRadius: tokens.borderRadius.lg,
    padding: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "24px",
  },
  membershipInfo: {
    flex: 1,
  },
  membershipBadge: {
    backgroundColor: "rgba(0, 229, 118, 0.15)",
    color: tokens.colors.accent,
    fontSize: tokens.fontSize.xs,
    fontWeight: 700,
    padding: "4px 10px",
    borderRadius: tokens.borderRadius.sm,
    display: "inline-block",
    marginBottom: "8px",
  },
  membershipTitle: {
    fontSize: tokens.fontSize.lg,
    fontWeight: tokens.fontWeight.bold,
    color: tokens.colors.textPrimary,
    margin: "0 0 6px 0",
  },
  membershipDesc: {
    fontSize: tokens.fontSize.xs,
    color: tokens.colors.textSecondary,
    margin: 0,
    lineHeight: 1.5,
  },
  primeBtn: {
    padding: "12px 24px",
    borderRadius: tokens.borderRadius.full,
    border: "none",
    backgroundColor: tokens.colors.accent,
    color: "#0B1F44",
    fontWeight: tokens.fontWeight.bold,
    fontSize: tokens.fontSize.sm,
    cursor: "pointer",
    boxShadow: tokens.shadows.glow,
    whiteSpace: "nowrap",
  },
  formContainer: {
    backgroundColor: tokens.colors.bgPrimary,
    borderRadius: tokens.borderRadius.md,
    border: `1px solid ${tokens.colors.border}`,
    padding: "28px",
  },
  editForm: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  formTitle: {
    fontSize: tokens.fontSize.lg,
    fontWeight: tokens.fontWeight.bold,
    color: tokens.colors.textPrimary,
    margin: "0 0 4px 0",
  },
  formSubtitle: {
    fontSize: tokens.fontSize.xs,
    color: tokens.colors.textSecondary,
    margin: 0,
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "20px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: tokens.fontSize.xs,
    fontWeight: 600,
    color: tokens.colors.textSecondary,
  },
  input: {
    backgroundColor: tokens.colors.bgCard,
    border: `1px solid ${tokens.colors.border}`,
    borderRadius: tokens.borderRadius.sm,
    padding: "12px 16px",
    color: tokens.colors.textPrimary,
    fontSize: tokens.fontSize.sm,
    outline: "none",
  },
  formActions: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: "12px",
  },
  saveBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "14px 28px",
    borderRadius: tokens.borderRadius.full,
    border: "none",
    backgroundColor: tokens.colors.accent,
    color: "#0B1F44",
    fontWeight: tokens.fontWeight.bold,
    fontSize: tokens.fontSize.sm,
    cursor: "pointer",
    boxShadow: tokens.shadows.glow,
  },
  emptyCard: {
    padding: "32px 0",
  },
  loadingBox: {
    textAlign: "center",
    padding: "48px 0",
  },
  spinner: {
    width: "36px",
    height: "36px",
    border: `3px solid ${tokens.colors.border}`,
    borderTopColor: tokens.colors.accent,
    borderRadius: "50%",
    animation: "df-spin 1s linear infinite",
    margin: "0 auto",
  },
};
