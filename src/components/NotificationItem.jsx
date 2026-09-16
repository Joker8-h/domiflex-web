import React from "react";
import { FaShoppingBag, FaTag, FaBell, FaEnvelope } from "react-icons/fa";
import theme from "../styles/theme";

const iconMap = {
  PEDIDO: FaShoppingBag,
  PROMOCION: FaTag,
  SISTEMA: FaBell,
  MENSAJE: FaEnvelope,
};

export default function NotificationItem({ notification, onRead }) {
  const Icon = iconMap[notification.tipo] || FaBell;

  return (
    <div
      style={{
        ...styles.container,
        backgroundColor: notification.leido ? "transparent" : `${theme.colors.accent}08`,
        borderLeft: notification.leido ? "none" : `3px solid ${theme.colors.accent}`,
      }}
      onClick={() => onRead && onRead(notification.idNotificacion)}
    >
      <div style={styles.iconContainer}>
        <Icon size={18} color={theme.colors.accent} />
      </div>
      <div style={styles.content}>
        <h4 style={styles.title}>{notification.titulo}</h4>
        <p style={styles.message}>{notification.mensaje}</p>
        <span style={styles.time}>
          {new Date(notification.fechaCreacion).toLocaleString("es-CO", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    gap: "12px",
    padding: "14px 16px",
    cursor: "pointer",
    transition: theme.transitions.fast,
    borderBottom: `1px solid ${theme.colors.border}`,
  },
  iconContainer: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    backgroundColor: `${theme.colors.accent}15`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textPrimary,
    marginBottom: "2px",
  },
  message: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: "4px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  time: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
  },
};
