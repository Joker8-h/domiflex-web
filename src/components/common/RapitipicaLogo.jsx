import React from "react";
import { Link } from "react-router-dom";

export default function RapitipicaLogo({ size = "md", showTagline = false, to = "/", light = true }) {
  // Sizing variants
  const sizeMap = {
    sm: { icon: 26, text: "18px", tagline: "9px" },
    md: { icon: 34, text: "22px", tagline: "11px" },
    lg: { icon: 44, text: "28px", tagline: "12px" },
    xl: { icon: 56, text: "36px", tagline: "14px" },
  };

  const { icon, text, tagline } = sizeMap[size] || sizeMap.md;

  const content = (
    <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", textDecoration: "none", userSelect: "none" }}>
      {/* SVG Icon: Repartidor en moto de alta velocidad estilo Rapitipica */}
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0, filter: "drop-shadow(0 2px 8px rgba(0, 229, 118, 0.4))" }}
      >
        {/* Líneas de velocidad traseras */}
        <line x1="4" y1="20" x2="16" y2="20" stroke="#00E576" strokeWidth="3" strokeLinecap="round" />
        <line x1="2" y1="28" x2="22" y2="28" stroke="#00E576" strokeWidth="3.5" strokeLinecap="round" />
        <line x1="6" y1="36" x2="18" y2="36" stroke="#00E576" strokeWidth="3" strokeLinecap="round" />

        {/* Cabeza / Casco */}
        <circle cx="38" cy="15" r="5.5" fill="#00E576" />
        <path d="M37 13.5H41.5" stroke="#0B1F44" strokeWidth="1.5" strokeLinecap="round" />

        {/* Torso / Conductor */}
        <path
          d="M32 23C32 20.79 33.79 19 36 19H40C41.6 19 43 20.2 43.3 21.8L45 28H35L32 23Z"
          fill="#00E576"
        />

        {/* Brazo al manubrio */}
        <path d="M38 23L47 28" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />

        {/* Maleta térmica trasera */}
        <rect x="23" y="19" width="9" height="12" rx="2" fill="#00C864" stroke="#00E576" strokeWidth="1" />

        {/* Rueda trasera */}
        <circle cx="21" cy="45" r="9" stroke="#FFFFFF" strokeWidth="3.5" />
        <circle cx="21" cy="45" r="4" fill="#00E576" />

        {/* Rueda delantera */}
        <circle cx="51" cy="45" r="9" stroke="#FFFFFF" strokeWidth="3.5" />
        <circle cx="51" cy="45" r="4" fill="#00E576" />

        {/* Chasis de la moto */}
        <path
          d="M21 45H32L39 36H47L51 45"
          stroke="#00E576"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Manubrio y faro */}
        <path d="M47 31L45 27H49" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="50" cy="30" r="2" fill="#00E576" />
      </svg>

      {/* Marca tipográfica */}
      <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: "1px" }}>
          <span
            style={{
              fontSize: text,
              fontWeight: 800,
              color: light ? "#FFFFFF" : "#0B1F44",
              letterSpacing: "-0.5px",
              fontFamily: "'Montserrat', sans-serif",
            }}
          >
            Rapi
          </span>
          <span
            style={{
              fontSize: text,
              fontWeight: 800,
              color: "#00E576",
              letterSpacing: "-0.5px",
              fontFamily: "'Montserrat', sans-serif",
            }}
          >
            tipica
          </span>
        </div>
        {showTagline && (
          <span
            style={{
              fontSize: tagline,
              color: "#9CA3AF",
              fontWeight: 500,
              marginTop: "3px",
              fontStyle: "italic",
              letterSpacing: "0.2px",
            }}
          >
            Lo típico, más cerca de ti
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
