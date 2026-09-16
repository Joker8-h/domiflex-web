import React, { useState } from "react";
import theme from "../../styles/theme";

export default function Input({
  label,
  icon,
  error,
  style = {},
  ...props
}) {
  const [focused, setFocused] = useState(false);

  const containerStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    width: "100%",
    ...style,
  };

  const labelStyle = {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    fontWeight: theme.fontWeight.medium,
  };

  const inputWrapperStyle = {
    display: "flex",
    alignItems: "center",
    backgroundColor: theme.colors.bgInput,
    border: `1px solid ${error ? theme.colors.danger : focused ? theme.colors.accent : theme.colors.border}`,
    borderRadius: theme.borderRadius.sm,
    padding: "0 12px",
    transition: theme.transitions.fast,
    boxShadow: focused ? theme.shadows.input : "none",
  };

  const inputStyle = {
    flex: 1,
    backgroundColor: "transparent",
    color: theme.colors.textPrimary,
    border: "none",
    padding: "12px 0",
    fontSize: theme.fontSize.md,
    outline: "none",
    fontFamily: "'Inter', sans-serif",
    width: "100%",
  };

  const iconStyle = {
    color: focused ? theme.colors.accent : theme.colors.textMuted,
    marginRight: "10px",
    fontSize: "18px",
    transition: theme.transitions.fast,
  };

  const errorStyle = {
    fontSize: theme.fontSize.xs,
    color: theme.colors.danger,
  };

  return (
    <div style={containerStyle}>
      {label && <label style={labelStyle}>{label}</label>}
      <div style={inputWrapperStyle}>
        {icon && <span style={iconStyle}>{icon}</span>}
        <input
          style={inputStyle}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />
      </div>
      {error && <span style={errorStyle}>{error}</span>}
    </div>
  );
}
