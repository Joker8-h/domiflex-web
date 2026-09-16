import React from "react";
import tokens from "../../design/tokens";

// Estado de error estandar con reintento. role="alert" para lectores.
export default function ErrorState({ title = "Algo salió mal", description = "No pudimos cargar la información. Revisa tu conexión e inténtalo de nuevo.", onRetry }) {
  return (
    <div
      role="alert"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        padding: `${tokens.spacing.xxl} ${tokens.spacing.base}`,
        gap: tokens.spacing.sm,
      }}
    >
      <div style={{ fontSize: "44px" }} aria-hidden="true">⚠️</div>
      <h2 style={{ fontSize: tokens.fontSize.lg, fontWeight: tokens.fontWeight.bold, color: tokens.colors.textPrimary, margin: 0 }}>
        {title}
      </h2>
      <p style={{ fontSize: tokens.fontSize.sm, color: tokens.colors.textSecondary, margin: 0, maxWidth: "340px" }}>
        {description}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          style={{
            marginTop: tokens.spacing.sm,
            minHeight: tokens.touch.min,
            padding: `0 ${tokens.spacing.lg}`,
            borderRadius: tokens.radius.xl,
            border: "none",
            backgroundColor: tokens.colors.accent,
            color: "#000",
            fontWeight: tokens.fontWeight.bold,
            fontSize: tokens.fontSize.md,
            cursor: "pointer",
          }}
        >
          Reintentar
        </button>
      )}
    </div>
  );
}
