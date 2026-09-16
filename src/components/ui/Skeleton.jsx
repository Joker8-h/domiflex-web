import React from "react";
import tokens from "../../design/tokens";

// Skeleton accesible para loading states. Usar en vez de spinners fantasma.
export default function Skeleton({ width = "100%", height = "16px", radius = tokens.radius.md, style = {} }) {
  return (
    <div
      aria-hidden="true"
      style={{
        width,
        height,
        borderRadius: radius,
        background: `linear-gradient(90deg, ${tokens.colors.bgCard} 25%, ${tokens.colors.bgCardHover} 50%, ${tokens.colors.bgCard} 75%)`,
        backgroundSize: "200% 100%",
        animation: "df-shimmer 1.4s ease infinite",
        ...style,
      }}
    />
  );
}

export function SkeletonCard() {
  return (
    <div
      aria-hidden="true"
      style={{
        backgroundColor: tokens.colors.bgCard,
        border: `1px solid ${tokens.colors.border}`,
        borderRadius: tokens.radius.md,
        padding: tokens.spacing.base,
        display: "flex",
        flexDirection: "column",
        gap: tokens.spacing.sm,
      }}
    >
      <Skeleton height="120px" />
      <Skeleton width="70%" height="18px" />
      <Skeleton width="45%" height="14px" />
    </div>
  );
}
