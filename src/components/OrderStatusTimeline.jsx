import React from "react";
import { FaCheckCircle, FaCircle } from "react-icons/fa";
import theme from "../styles/theme";

const states = [
  { key: "CREADO", label: "Pedido confirmado" },
  { key: "ASIGNADO", label: "Repartidor asignado" },
  { key: "RECOGIENDO", label: "En recogida" },
  { key: "EN_CAMINO", label: "En camino" },
  { key: "ENTREGADO", label: "Entregado" },
];

export default function OrderStatusTimeline({ currentStatus }) {
  const currentIndex = states.findIndex((s) => s.key === currentStatus);

  return (
    <div style={styles.container}>
      {states.map((state, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <div key={state.key} style={styles.step}>
            <div style={styles.iconContainer}>
              {isCompleted ? (
                <FaCheckCircle size={20} color={theme.colors.accent} />
              ) : isCurrent ? (
                <div style={styles.currentDot}>
                  <FaCircle size={12} color={theme.colors.accent} />
                </div>
              ) : (
                <FaCircle size={12} color={theme.colors.border} />
              )}
              {index < states.length - 1 && (
                <div
                  style={{
                    ...styles.line,
                    backgroundColor: isCompleted ? theme.colors.accent : theme.colors.border,
                  }}
                />
              )}
            </div>
            <span
              style={{
                ...styles.label,
                color: isCurrent
                  ? theme.colors.accent
                  : isCompleted
                  ? theme.colors.textPrimary
                  : theme.colors.textMuted,
                fontWeight: isCurrent ? theme.fontWeight.bold : theme.fontWeight.normal,
              }}
            >
              {state.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "0",
    padding: "8px 0",
  },
  step: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    position: "relative",
  },
  iconContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    position: "relative",
  },
  currentDot: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    animation: "pulse 1.5s infinite",
  },
  line: {
    width: "2px",
    height: "24px",
    marginTop: "4px",
    transition: theme.transitions.normal,
  },
  label: {
    fontSize: theme.fontSize.sm,
    paddingBottom: "12px",
    transition: theme.transitions.fast,
  },
};
