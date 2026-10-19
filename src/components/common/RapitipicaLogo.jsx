import React from "react";
import { Link } from "react-router-dom";

export default function RapitipicaLogo({ size = "md", showTagline = false, to = "/", light = true }) {
  const sizeMap = {
    sm: { icon: 28, text: "20px", tagline: "9px" },
    md: { icon: 36, text: "24px", tagline: "11px" },
    lg: { icon: 46, text: "30px", tagline: "12px" },
    xl: { icon: 60, text: "38px", tagline: "14px" },
  };

  const { icon, text, tagline } = sizeMap[size] || sizeMap.md;

  const content = (
    <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", textDecoration: "none", userSelect: "none" }}>
      {/* SVG Icon: Repartidor en moto roja estilo boceto oficial Rapitipica */}
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0, filter: "drop-shadow(0 2px 6px rgba(227, 6, 19, 0.45))" }}
      >
        {/* Líneas de velocidad traseras rojas */}
        <line x1="3" y1="22" x2="15" y2="22" stroke="#E30613" strokeWidth="3" strokeLinecap="round" />
        <line x1="1" y1="30" x2="19" y2="30" stroke="#E30613" strokeWidth="3.5" strokeLinecap="round" />
        <line x1="5" y1="38" x2="16" y2="38" stroke="#E30613" strokeWidth="3" strokeLinecap="round" />

        {/* Casco del repartidor */}
        <circle cx="38" cy="15" r="5.5" fill="#E30613" />
        <path d="M37 13.5H41.5" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />

        {/* Torso del repartidor */}
        <path
          d="M32 23C32 20.79 33.79 19 36 19H40C41.6 19 43 20.2 43.3 21.8L45 28H35L32 23Z"
          fill="#E30613"
        />

        {/* Brazo al manubrio */}
        <path d="M38 23L47 28" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />

        {/* Maleta térmica trasera */}
        <rect x="22" y="18" width="10" height="12" rx="2.5" fill="#B9050F" stroke="#E30613" strokeWidth="1.2" />

        {/* Rueda trasera */}
        <circle cx="21" cy="45" r="8.5" stroke="#FFFFFF" strokeWidth="3.2" />
        <circle cx="21" cy="45" r="3.8" fill="#E30613" />

        {/* Rueda delantera */}
        <circle cx="51" cy="45" r="8.5" stroke="#FFFFFF" strokeWidth="3.2" />
        <circle cx="51" cy="45" r="3.8" fill="#E30613" />

        {/* Chasis rojo de la moto */}
        <path
          d="M21 45H33L40 35H47L51 45"
          stroke="#E30613"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Manubrio y faro */}
        <path d="M47 31L45 27H49" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="50" cy="30" r="2.2" fill="#E30613" />
      </svg>

      {/* Marca tipográfica estilo brush/italic Rapitipica */}
      <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
        <div style={{ display: "flex", alignItems: "baseline" }}>
          <span
            style={{
              fontSize: text,
              fontWeight: 900,
              fontStyle: "italic",
              color: light ? "#FFFFFF" : "#0D1117",
              letterSpacing: "-0.6px",
              fontFamily: "'Montserrat', sans-serif",
              textShadow: light ? "0 2px 6px rgba(0,0,0,0.4)" : "none",
            }}
          >
            Rapitipica
          </span>
        </div>
        {showTagline && (
          <span
            style={{
              fontSize: tagline,
              color: light ? "#D1D5DB" : "#4B5563",
              fontWeight: 600,
              marginTop: "3px",
              fontStyle: "italic",
              letterSpacing: "0.2px",
            }}
          >
            Lo que quieres, en un clic
          </span>
        )}
      </div>
    </div>
  );

  if (!to) return content;

  return (
    <Link to={to} style={{ textDecoration: "none" }} aria-label="Rapitipica inicio">
      {content}
    </Link>
  );
}
