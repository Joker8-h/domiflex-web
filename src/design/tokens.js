// Rapitipica Design Tokens — Paleta Oficial del Boceto (Rojo #E30613, Negro #0D1117, Verde #16A34A, Blanco #FFFFFF)
export const colors = {
  bgPrimary: "#0D1117",       // Negro carbón principal (Header / Hero / Admin)
  bgSecondary: "#161B22",     // Contenedores oscuros secundarios
  bgCard: "#161B22",          // Superficie oscura
  bgCardHover: "#1F2937",     // Hover oscuro
  bgInput: "#0D1117",         // Fondo de inputs oscuros
  bgNavbar: "#0D1117",        // Navbar negro sólido
  bgLight: "#F8F9FA",         // Fondo claro para páginas de cliente
  bgWhite: "#FFFFFF",         // Tarjetas blancas limpias
  accent: "#E30613",          // Rojo principal Rapitipica
  accentDark: "#B9050F",      // Rojo presionado / hover
  accentLight: "#FF3B47",     // Rojo iluminado
  green: "#16A34A",           // Verde detalles / éxitos
  greenDark: "#15803D",       // Verde pincelada hero
  textPrimary: "#F5F7FA",     // Blanco textos sobre negro
  textDark: "#11141A",        // Negro textos sobre blanco
  textSecondary: "#9CA3AF",   // Gris subtítulos
  textMuted: "#6B7280",       // Metadatos y notas
  border: "#21262D",          // Bordes oscuros
  borderLight: "#E5E7EB",     // Bordes claros
  danger: "#E30613",          // Rojo
  dangerDark: "#B9050F",
  warning: "#F59E0B",         // Estrellas de calificación
  success: "#16A34A",         // Verde de confirmación / entregas
  info: "#38BDF8",
  overlay: "rgba(13, 17, 23, 0.75)",
  categories: {
    restaurants: "#E30613",   // Rojo
    markets: "#16A34A",       // Verde
    liquor: "#11141A",        // Negro
    sweets: "#E30613",        // Rojo
    drinks: "#16A34A",        // Verde
    more: "#11141A",          // Negro
  },
};

export const fontSize = {
  xs: "12px",
  sm: "13px",
  md: "15px",
  lg: "18px",
  xl: "clamp(20px, 2.5vw, 22px)",
  "2xl": "clamp(24px, 3.5vw, 28px)",
  xxl: "clamp(24px, 4vw, 28px)",
  hero: "clamp(32px, 6vw, 48px)",
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
  section: "clamp(40px, 6vw, 64px)",
};

export const radius = {
  sm: "8px",
  md: "12px",
  lg: "16px",
  xl: "24px",
  full: "999px",
};

export const borderRadius = radius;

export const typography = {
  fontFamily: "'Montserrat', sans-serif",
};

export const shadows = {
  card: "0 4px 16px rgba(0, 0, 0, 0.08)",
  glow: "0 4px 14px rgba(227, 6, 19, 0.35)",
};

export const touch = {
  min: "44px",
  comfortable: "48px",
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
  borderRadius,
  typography,
  shadows,
  touch,
  motion,
  breakpoints,
  media,
  zIndex,
};

export default tokens;
