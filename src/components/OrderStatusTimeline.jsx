import React from "react";
import { Check, Clock, Bike, CheckCircle2, ShoppingBag } from "lucide-react";
import tokens from "../design/tokens";

const STEPS = [
  { key: "CREADO", label: "Confirmado", icon: ShoppingBag },
  { key: "ASIGNADO", label: "Asignado", icon: Clock },
  { key: "RECOGIENDO", label: "Preparando", icon: Clock },
  { key: "EN_CAMINO", label: "En camino", icon: Bike },
  { key: "ENTREGADO", label: "Entregado", icon: CheckCircle2 },
];

export default function OrderStatusTimeline({ currentStatus }) {
  const currentIndex = STEPS.findIndex((s) => s.key === currentStatus);
  const activeIdx = currentIndex === -1 ? 0 : currentIndex;

  return (
    <div style={styles.wrapper}>
      <div style={styles.stepperContainer}>
        {/* Progress Background Line */}
        <div style={styles.lineBg} />
        {/* Active Progress Line */}
        <div
          style={{
            ...styles.lineActive,
            width: `${(activeIdx / (STEPS.length - 1)) * 100}%`,
          }}
        />

        {/* Step Nodes */}
        {STEPS.map((step, index) => {
          const isDone = index < activeIdx;
          const isCurrent = index === activeIdx;
          const isPending = index > activeIdx;
          const Icon = step.icon;

          return (
            <div key={step.key} style={styles.stepCol}>
              <div
                style={{
                  ...styles.nodeCircle,
                  backgroundColor: isDone || isCurrent ? tokens.colors.accent : tokens.colors.bgPrimary,
                  borderColor: isDone || isCurrent ? tokens.colors.accent : tokens.colors.border,
                  boxShadow: isCurrent ? tokens.shadows.glow : "none",
                  color: isDone || isCurrent ? "#0B1F44" : tokens.colors.textMuted,
                }}
              >
                {isDone ? (
                  <Check size={16} strokeWidth={3} />
                ) : (
                  <Icon size={16} strokeWidth={isCurrent ? 2.5 : 1.8} />
                )}
              </div>
              <span
                style={{
                  ...styles.stepLabel,
                  color: isCurrent
                    ? tokens.colors.accent
                    : isDone
                    ? tokens.colors.textPrimary
                    : tokens.colors.textMuted,
                  fontWeight: isCurrent ? 700 : 500,
                }}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    width: "100%",
    padding: "16px 0",
  },
  stepperContainer: {
    position: "relative",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    width: "100%",
  },
  lineBg: {
    position: "absolute",
    top: "18px",
    left: "20px",
    right: "20px",
    height: "3px",
    backgroundColor: tokens.colors.border,
    zIndex: 1,
  },
  lineActive: {
    position: "absolute",
    top: "18px",
    left: "20px",
    height: "3px",
    backgroundColor: tokens.colors.accent,
    boxShadow: "0 0 8px rgba(0, 229, 118, 0.6)",
    transition: "width 0.4s ease",
    zIndex: 2,
  },
  stepCol: {
    position: "relative",
    zIndex: 3,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
    width: "70px",
  },
  nodeCircle: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    border: "2px solid",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.3s ease",
  },
  stepLabel: {
    fontSize: tokens.fontSize.xs,
    textAlign: "center",
    lineHeight: 1.2,
  },
};
