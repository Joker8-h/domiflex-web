// DomiFlex Design Tokens — sistema canónico (Fase 1).
// theme.js queda como compatibilidad; el código nuevo importa desde aquí.
// Identidad conservada: verde #00E676 sobre #0D1117 + logo DOMIFLEX.

export const colors = {
  bgPrimary: "#0D1117",
  bgSecondary: "#161B22",
  bgCard: "#161B22",
  bgCardHover: "#1C2333",
  bgInput: "#0D1117",
  bgNavbar: "#0D1117ee",
  accent: "#00E676",
  accentDark: "#00C853",
  accentLight: "#69F0AE",
  textPrimary: "#FFFFFF",
  textSecondary: "#9AA4B2", // AA sobre #0D1117 (≈7:1). Antes #8B949E.
  textMuted: "#9AA4B2", // AA. Antes #6E7681 (≈3.6:1, fallaba).
  border: "#21262D",
  borderLight: "#30363D",
  danger: "#FF6B6B", // AA sobre oscuro. Antes #FF5252.
  dangerDark: "#D32F2F",
  warning: "#FFD740",
  success: "#00E676",
  info: "#40C4FF",
  overlay: "rgba(0, 0, 0, 0.6)",
};

export const fontSize = {
  xs: "12px", // mínimo legible móvil. Antes 11px.
  sm: "13px",
  md: "15px",
  lg: "18px",
  xl: "clamp(20px, 2.5vw, 22px)",
  xxl: "clamp(24px, 4vw, 28px)",
  hero: "clamp(30px, 7vw, 44px)",
};

export const fontWeight = {
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
};

export const spacing = {
  xs: "4px",
  sm: "8px",
  md: "12px",
  base: "16px",
  lg: "24px",
  xl: "32px",
  xxl: "48px",
  section: "clamp(48px, 8vw, 80px)",
};

export const radius = {
  sm: "8px",
  md: "12px",
  lg: "16px",
  xl: "24px",
  full: "999px",
};

export const touch = {
  min: "44px", // objetivo táctil mínimo (WCAG 2.5.8 / iOS HIG)
  comfortable: "48px", // formularios y CTAs móviles
};

export const motion = {
  fast: "120ms ease",
  base: "200ms ease",
  slow: "320ms ease",
};

export const breakpoints = {
  mobile: 360,
  tablet: 768,
  desktop: 1024,
  wide: 1280,
};

export const media = {
  mobile: `@media (max-width: ${breakpoints.tablet - 1}px)`,
  tablet: `@media (min-width: ${breakpoints.tablet}px) and (max-width: ${breakpoints.desktop - 1}px)`,
  desktop: `@media (min-width: ${breakpoints.desktop}px)`,
  reducedMotion: "@media (prefers-reduced-motion: reduce)",
};

export const zIndex = {
  sticky: 200,
  fixed: 300,
  modalBackdrop: 400,
  modal: 500,
  toast: 600,
};

const tokens = {
  colors,
  fontSize,
  fontWeight,
  spacing,
  radius,
  touch,
  motion,
  breakpoints,
  media,
  zIndex,
};

export default tokens;
