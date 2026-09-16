import React from "react";
import { useNavigate } from "react-router-dom";
import { CircleHelp, ClipboardList, MapPin, CreditCard, LogOut, ArrowLeft, Settings } from "lucide-react";
import theme from "../styles/theme";
import Avatar from "../components/common/Avatar";
import ProfileMenuItem from "../components/ProfileMenuItem";

export default function Perfil() {
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem("domiflex_usuario") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("domiflex_token");
    localStorage.removeItem("domiflex_usuario");
    navigate("/login");
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate(-1)}>
          <ArrowLeft size={18} />
        </button>
        <h1 style={styles.title}>Mi perfil</h1>
        <div style={{ width: "36px" }} />
      </div>

      <div style={styles.content}>
        {/* Avatar y info */}
        <div style={styles.profileCard}>
          <Avatar name={usuario.nombre} size={72} src={usuario.fotoPerfil} />
          <h2 style={styles.name}>{usuario.nombre || "Usuario"}</h2>
          <p style={styles.email}>{usuario.email || "correo@ejemplo.com"}</p>
          <span style={styles.badge}>Usuario Premium</span>
        </div>

        {/* Stats */}
        <div style={styles.statsRow}>
          <div style={styles.statItem}>
            <span style={styles.statValue}>12</span>
            <span style={styles.statLabel}>Pedidos</span>
          </div>
          <div style={styles.statDivider} />
          <div style={styles.statItem}>
            <span style={styles.statValue}>5</span>
            <span style={styles.statLabel}>Direcciones</span>
          </div>
          <div style={styles.statDivider} />
          <div style={styles.statItem}>
            <span style={styles.statValue}>$0</span>
            <span style={styles.statLabel}>Cupones</span>
          </div>
        </div>

        {/* Menú */}
        <div style={styles.menuCard}>
          <ProfileMenuItem icon={ClipboardList} label="Mis pedidos" onClick={() => navigate("/mis-pedidos")} />
          <ProfileMenuItem icon={MapPin} label="Direcciones" onClick={() => {}} />
          <ProfileMenuItem icon={CreditCard} label="Métodos de pago" onClick={() => {}} />
          <ProfileMenuItem icon={CircleHelp} label="Ayuda y soporte" onClick={() => {}} />
          <ProfileMenuItem icon={Settings} label="Configuración" onClick={() => {}} />
          <ProfileMenuItem icon={LogOut} label="Cerrar sesión" onClick={handleLogout} danger />
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: theme.colors.bgPrimary,
    paddingBottom: "80px",
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
  content: {
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  profileCard: {
    backgroundColor: theme.colors.bgCard,
    borderRadius: theme.borderRadius.lg,
    border: `1px solid ${theme.colors.border}`,
    padding: "32px 20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
  },
  name: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
  },
  email: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  badge: {
    backgroundColor: `${theme.colors.accent}20`,
    color: theme.colors.accent,
    padding: "4px 12px",
    borderRadius: theme.borderRadius.xl,
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
  },
  statsRow: {
    display: "flex",
    backgroundColor: theme.colors.bgCard,
    borderRadius: theme.borderRadius.md,
    border: `1px solid ${theme.colors.border}`,
    padding: "20px",
  },
  statItem: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
  },
  statValue: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.accent,
  },
  statLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  statDivider: {
    width: "1px",
    backgroundColor: theme.colors.border,
  },
  menuCard: {
    backgroundColor: theme.colors.bgCard,
    borderRadius: theme.borderRadius.md,
    border: `1px solid ${theme.colors.border}`,
    overflow: "hidden",
  },
};
