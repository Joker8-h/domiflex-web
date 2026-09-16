import React from "react";
import theme from "../../styles/theme";

export default function Card({
  children,
  hover = false,
  padding = "lg",
  style = {},
  onClick,
  ...props
}) {
  const paddings = {
    sm: theme.spacing.sm,
    md: theme.spacing.md,
    lg: theme.spacing.lg,
    xl: theme.spacing.xl,
  };

  const baseStyle = {
    backgroundColor: theme.colors.bgCard,
    borderRadius: theme.borderRadius.md,
    border: `1px solid ${theme.colors.border}`,
    padding: paddings[padding],
    transition: theme.transitions.normal,
    cursor: onClick ? "pointer" : "default",
    ...style,
  };

  return (
    <div
      style={baseStyle}
      onMouseEnter={(e) => {
        if (hover) {
          e.currentTarget.style.backgroundColor = theme.colors.bgCardHover;
          e.currentTarget.style.boxShadow = theme.shadows.cardHover;
          e.currentTarget.style.transform = "translateY(-2px)";
        }
      }}
      onMouseLeave={(e) => {
        if (hover) {
          e.currentTarget.style.backgroundColor = theme.colors.bgCard;
          e.currentTarget.style.boxShadow = "none";
          e.currentTarget.style.transform = "translateY(0)";
        }
      }}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
}
