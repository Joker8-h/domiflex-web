import React from "react";
import { FaStar, FaClock } from "react-icons/fa";
import theme from "../styles/theme";

export default function NegocioCard({ negocio, onClick }) {
  return (
    <div style={styles.card} onClick={() => onClick(negocio)}>
      <div style={styles.imageContainer}>
        {negocio.imagen ? (
          <img src={negocio.imagen} alt={negocio.nombre} style={styles.image} />
        ) : (
          <div style={styles.placeholder}>
            <span style={styles.placeholderIcon}>🏪</span>
          </div>
        )}
        {negocio.tiempoEstimadoMin && (
          <div style={styles.timeBadge}>
            <FaClock size={10} /> {negocio.tiempoEstimadoMin} min
          </div>
        )}
      </div>
      <div style={styles.info}>
        <h3 style={styles.name}>{negocio.nombre}</h3>
        <div style={styles.meta}>
          <span style={styles.rating}>
            <FaStar size={12} color={theme.colors.warning} /> {Number(negocio.calificacion || 0).toFixed(1)}
          </span>
          {negocio.costoEnvio > 0 && (
            <span style={styles.deliveryFee}>
              Envío ${negocio.costoEnvio?.toLocaleString()}
            </span>
          )}
        </div>
        {negocio.descripcion && (
          <p style={styles.description}>{negocio.descripcion}</p>
        )}
      </div>
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: theme.colors.bgCard,
    borderRadius: theme.borderRadius.md,
    border: `1px solid ${theme.colors.border}`,
    overflow: "hidden",
    cursor: "pointer",
    transition: theme.transitions.normal,
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    height: "140px",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  placeholder: {
    width: "100%",
    height: "100%",
    backgroundColor: theme.colors.bgCardHover,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderIcon: {
    fontSize: "40px",
    opacity: 0.5,
  },
  timeBadge: {
    position: "absolute",
    bottom: "8px",
    left: "8px",
    backgroundColor: theme.colors.bgPrimary,
    color: theme.colors.textPrimary,
    padding: "4px 8px",
    borderRadius: theme.borderRadius.sm,
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
  info: {
    padding: "12px",
  },
  name: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textPrimary,
    marginBottom: "4px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  meta: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "4px",
  },
  rating: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    fontWeight: theme.fontWeight.semibold,
  },
  deliveryFee: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.accent,
    fontWeight: theme.fontWeight.medium,
  },
  description: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
};
