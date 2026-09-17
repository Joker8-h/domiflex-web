import React from "react";
import { ChevronRight } from "lucide-react";
import theme from "../styles/theme";

export default function ProfileMenuItem({ icon: Icon, label, onClick, danger = false }) {
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={label}
      style={styles.container}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}>
      <div style={styles.left}>
        <div style={{
          ...styles.iconContainer,
          backgroundColor: danger ? `${theme.colors.danger}15` : `${theme.colors.accent}15`,
        }}>
          <Icon size={18} color={danger ? theme.colors.danger : theme.colors.accent} />
        </div>
        <span style={{
          ...styles.label,
          color: danger ? theme.colors.danger : theme.colors.textPrimary,
        }}>
          {label}
        </span>
      </div>
      <ChevronRight size={14} color={theme.colors.textMuted} />
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 16px",
    minHeight: "48px",
    cursor: "pointer",
    transition: theme.transitions.fast,
    borderBottom: `1px solid ${theme.colors.border}`,
  },
  left: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  iconContainer: {
    width: "36px",
    height: "36px",
    borderRadius: theme.borderRadius.sm,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
  },
};
