// Rapitipica Design Tokens — Paleta Oficial (#0B1F44, #00E576, #F5F7FA, #9CA3AF)
export const colors = {
  bgPrimary: "#0B1F44",       // Azul oscuro principal
  bgSecondary: "#0F2552",     // Contenedores secundarios
  bgCard: "#11254E",          // Superficie de tarjetas y modales
  bgCardHover: "#163265",     // Tarjetas en hover / elementos activos
  bgInput: "#081836",          // Fondo de inputs
  bgNavbar: "rgba(11, 31, 68, 0.95)", // Navbar con glassmorphism
  accent: "#00E576",          // Verde neón primario
  accentDark: "#00C864",      // Verde neón presionado / hover
  accentLight: "#4EFA9E",     // Verde neón iluminado
  textPrimary: "#F5F7FA",     // Blanco textos principales
  textSecondary: "#9CA3AF",   // Gris claro para subtítulos y detalles
  textMuted: "#9CA3AF",       // Metadatos y notas
  border: "#1D3B72",          // Bordes de tarjetas y separadores
  borderLight: "#254A8D",     // Bordes en foco / hover
  danger: "#EF4444",          // Rojo de error / cancelar
  dangerDark: "#DC2626",
  warning: "#F59E0B",         // Amarillo/Ámbar de alertas y estrellas
  success: "#00E576",         // Verde de confirmación
  info: "#38BDF8",            // Azul informativo
  overlay: "rgba(7, 19, 43, 0.75)",
  categories: {
    restaurants: "#FF6B4A",
    stores: "#10B981",
    markets: "#3B82F6",
    drinks: "#8B5CF6",
    pharmacy: "#06B6D4",
    pets: "#F59E0B",
  }
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
