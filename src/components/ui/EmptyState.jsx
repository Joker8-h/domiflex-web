import React from "react";
import tokens from "../../design/tokens";

// Estado vacío estandar: ilustración + título + descripción + CTA.
export default function EmptyState({ icon, title, description, actionLabel, onAction }) {
  return (
    <div
      role="status"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        padding: `${tokens.spacing.xxl} ${tokens.spacing.base}`,
        gap: tokens.spacing.sm,
      }}
    >
      {icon && <div style={{ fontSize: "44px" }} aria-hidden="true">{icon}</div>}
      <h2 style={{ fontSize: tokens.fontSize.lg, fontWeight: tokens.fontWeight.bold, color: tokens.colors.textPrimary, margin: 0 }}>
        {title}
      </h2>
      {description && (
        <p style={{ fontSize: tokens.fontSize.sm, color: tokens.colors.textSecondary, margin: 0, maxWidth: "340px" }}>
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          style={{
            marginTop: tokens.spacing.sm,
            minHeight: tokens.touch.min,
            padding: `0 ${tokens.spacing.lg}`,
            borderRadius: tokens.radius.xl,
            border: `2px solid ${tokens.colors.accent}`,
            backgroundColor: "transparent",
            color: tokens.colors.accent,
            fontWeight: tokens.fontWeight.semibold,
            fontSize: tokens.fontSize.md,
            cursor: "pointer",
          }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
