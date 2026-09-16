import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import theme from "../styles/theme";
import NotificationItem from "../components/NotificationItem";
import API_URL from "../config";

export default function Notificaciones() {
  const navigate = useNavigate();
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("todas");

  useEffect(() => {
    fetchNotificaciones();
  }, []);

  const fetchNotificaciones = async () => {
    try {
      const token = localStorage.getItem("domiflex_token");
      const usuario = JSON.parse(localStorage.getItem("domiflex_usuario"));
      if (!usuario?.idUsuarios) return;
      const res = await fetch(`${API_URL}/notificaciones/usuario/${usuario.idUsuarios}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setNotificaciones(await res.json());
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem("domiflex_token");
      await fetch(`${API_URL}/notificaciones/${id}/leida`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotificaciones((prev) =>
        prev.map((n) => (n.idNotificacion === id ? { ...n, leido: true } : n))
      );
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const tabs = [
    { id: "todas", label: "Todas" },
    { id: "PEDIDO", label: "Pedidos" },
    { id: "PROMOCION", label: "Promociones" },
  ];

  const filtered = tab === "todas"
    ? notificaciones
    : notificaciones.filter((n) => n.tipo === tab);

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate(-1)}>
          <ArrowLeft size={18} />
        </button>
        <h1 style={styles.title}>Notificaciones</h1>
        <div style={{ width: "36px" }} />
      </div>

      <div style={styles.tabs}>
        {tabs.map((t) => (
          <button
            key={t.id}
            style={{
              ...styles.tab,
              backgroundColor: tab === t.id ? theme.colors.accent : theme.colors.bgCard,
              color: tab === t.id ? "#000" : theme.colors.textPrimary,
            }}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div style={styles.content}>
        {loading ? (
          <div style={styles.loading}>
            <div style={styles.spinner} />
          </div>
        ) : filtered.length === 0 ? (
          <div style={styles.empty}>
            <span style={{ fontSize: "48px" }}>🔔</span>
            <p style={styles.emptyText}>No hay notificaciones</p>
          </div>
        ) : (
          filtered.map((n) => (
            <NotificationItem
              key={n.idNotificacion}
              notification={n}
              onRead={markAsRead}
            />
          ))
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
    width: "36px",
    height: "36px",
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
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
  },
  tabs: {
    display: "flex",
    gap: "8px",
    padding: "0 16px 16px",
  },
  tab: {
    padding: "8px 16px",
    borderRadius: theme.borderRadius.xl,
    border: `1px solid ${theme.colors.border}`,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    cursor: "pointer",
    transition: theme.transitions.fast,
    fontFamily: "'Inter', sans-serif",
  },
  content: {
    padding: "0 16px",
  },
  loading: {
    display: "flex",
    justifyContent: "center",
    padding: "60px 0",
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: `3px solid ${theme.colors.border}`,
    borderTopColor: theme.colors.accent,
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  empty: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px 0",
    gap: "16px",
  },
  emptyText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.md,
  },
};
