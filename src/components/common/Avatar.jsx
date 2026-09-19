import React from "react";
import theme from "../../styles/theme";

export default function Avatar({
  src,
  name,
  size = 40,
  style = {},
}) {
  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  const containerStyle = {
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: "50%",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.bgCardHover,
    border: `2px solid ${theme.colors.border}`,
    flexShrink: 0,
    ...style,
  };

  const imgStyle = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  };

  const initialsStyle = {
    color: theme.colors.accent,
    fontSize: `${size * 0.35}px`,
    fontWeight: theme.fontWeight.bold,
    fontFamily: "'Montserrat', sans-serif",
  };

  return (
    <div style={containerStyle}>
      {src ? (
        <img src={src} alt={name || "Avatar"} style={imgStyle} />
      ) : (
        <span style={initialsStyle}>{initials}</span>
      )}
    </div>
  );
}
