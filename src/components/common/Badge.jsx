import React from "react";
import theme from "../../styles/theme";

const variants = {
  accent: {
    backgroundColor: `${theme.colors.accent}20`,
    color: theme.colors.accent,
  },
  danger: {
    backgroundColor: `${theme.colors.danger}20`,
    color: theme.colors.danger,
  },
  warning: {
    backgroundColor: `${theme.colors.warning}20`,
    color: theme.colors.warningDark,
  },
  info: {
    backgroundColor: `${theme.colors.info}20`,
    color: theme.colors.info,
  },
  muted: {
    backgroundColor: `${theme.colors.textMuted}20`,
    color: theme.colors.textSecondary,
  },
};

export default function Badge({
  children,
  variant = "accent",
  dot = false,
  style = {},
}) {
  const baseStyle = {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "4px 10px",
    borderRadius: theme.borderRadius.xl,
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
    ...variants[variant],
    ...style,
  };

  return (
    <span style={baseStyle}>
      {dot && (
        <span
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            backgroundColor: "currentColor",
          }}
        />
      )}
      {children}
    </span>
  );
}
