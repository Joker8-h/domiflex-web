import React from "react";
import theme from "../../styles/theme";

const variants = {
  primary: {
    backgroundColor: theme.colors.accent,
    color: "#000",
    border: "none",
  },
  secondary: {
    backgroundColor: "transparent",
    color: theme.colors.accent,
    border: `2px solid ${theme.colors.accent}`,
  },
  danger: {
    backgroundColor: theme.colors.danger,
    color: "#fff",
    border: "none",
  },
  ghost: {
    backgroundColor: "transparent",
    color: theme.colors.textSecondary,
    border: "none",
  },
};

const sizes = {
  sm: { padding: "6px 14px", fontSize: theme.fontSize.sm },
  md: { padding: "10px 20px", fontSize: theme.fontSize.md },
  lg: { padding: "14px 28px", fontSize: theme.fontSize.lg },
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  disabled = false,
  onClick,
  style = {},
  ...props
}) {
  const baseStyle = {
    borderRadius: theme.borderRadius.xl,
    fontWeight: theme.fontWeight.semibold,
    cursor: disabled ? "not-allowed" : "pointer",
    transition: theme.transitions.fast,
    fontFamily: "'Inter', sans-serif",
    opacity: disabled ? 0.5 : 1,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    width: fullWidth ? "100%" : "auto",
    ...variants[variant],
    ...sizes[size],
    ...style,
  };

  return (
    <button style={baseStyle} disabled={disabled} onClick={onClick} {...props}>
      {children}
    </button>
  );
}
