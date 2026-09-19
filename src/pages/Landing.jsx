import { Link } from "react-router-dom";
import { Bike, CreditCard, ShieldCheck, Rocket, Store, Clock, MapPin, ArrowRight } from "lucide-react";
import theme from "../styles/theme";

const U = "https://images.unsplash.com";
const Q = "?auto=format&fit=crop&w=800&q=60";

const categories = [
  { icon: "🍔", label: "Restaurantes" },
  { icon: "💊", label: "Farmacias" },
  { icon: "🛒", label: "Supermercados" },
  { icon: "🏪", label: "Tiendas" },
  { icon: "📦", label: "Paquetería" },
];

const features = [
  { icon: Rocket, title: "Rápido", desc: "Tu pedido en minutos" },
  { icon: ShieldCheck, title: "Seguro", desc: "Repartidores verificados" },
  { icon: Clock, title: "Confiable", desc: "Seguimiento en tiempo real" },
  { icon: CreditCard, title: "Flexible", desc: "Paga en efectivo" },
];

const populares = [
  { nombre: "Hamburguesa Especial", precio: "$16.000", img: `${U}/photo-1568901346375-23c9450c58cd${Q}`, tag: "Más pedido" },
  { nombre: "Bowl Casero", precio: "$12.000", img: `${U}/photo-1546069901-ba9599a7e63c${Q}`, tag: "Saludable" },
  { nombre: "Empanadas x5", precio: "$8.000", img: `${U}/photo-1601050690597-df0568f70950${Q}`, tag: "Típico" },
];

const stats = [
  { value: "+2.400", label: "Pedidos entregados" },
  { value: "4.8★", label: "Calificación" },
  { value: "25 min", label: "Promedio entrega" },
];

export default function Landing() {
  return (
    <div style={styles.page}>
      {/* Hero */}
      <div style={styles.hero}>
        <div style={styles.heroContent}>
          <div style={styles.eyebrow}>
            <MapPin size={12} aria-hidden="true" />
            <span>Popayán • Colombia</span>
            <span style={styles.dot} aria-hidden="true" />
            <span style={styles.liveDot} aria-hidden="true" />
            <span>Repartidores en línea</span>
          </div>
          <div style={styles.logoLarge}>
            <img
              src="/logo-domiflex.jpg"
              alt="DomiFlex — Delivery, rapidez y flexibilidad"
              width="680"
              height="371"
              loading="eager"
              style={styles.logoImg}
            />
          </div>
          <h1 style={styles.heroTitle}>
            Tu comida favorita, <span style={styles.heroAccent}>más cerca de ti</span>
          </h1>
          <p style={styles.heroSubtitle}>
            Domicilios rápidos. Repartidores verificados. Paga en efectivo.
          </p>
          <div style={styles.heroButtons}>
            <Link to="/register" style={styles.btnPrimary} className="df-press">
              <Rocket size={18} aria-hidden="true" /> Comenzar
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <Link to="/login" style={styles.btnSecondary} className="df-press">
              Iniciar sesión
            </Link>
          </div>
          <div style={styles.statsRow}>
            {stats.map((s) => (
              <div key={s.label} style={styles.stat}>
                <span style={styles.statValue}>{s.value}</span>
                <span style={styles.statLabel}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Marquee categorías */}
      <div style={styles.marquee} aria-hidden="true">
        <div style={styles.marqueeTrack}>
          {[...categories, ...categories].map((cat, i) => (
            <span key={i} style={styles.marqueeItem}>
              {cat.icon} {cat.label} <span style={styles.marqueeSep}>•</span>
            </span>
          ))}
        </div>
      </div>

      {/* Populares con fotos reales */}
      <section aria-labelledby="populares-title" style={styles.popSection}>
        <div style={styles.sectionHead}>
          <div>
            <p style={styles.kicker}>Lo más pedido</p>
            <h2 id="populares-title" style={styles.sectionTitle}>Popular ahora en Popayán</h2>
          </div>
          <Link to="/restaurantes" style={styles.seeAll}>
            Ver todo <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>
        <div style={styles.popGrid}>
          {populares.map((p) => (
            <Link key={p.nombre} to="/restaurantes" style={styles.popCard} className="df-lift">
              <div style={styles.popImgWrap}>
                <img src={p.img} alt={p.nombre} loading="lazy" style={styles.popImg} />
                <span style={styles.popTag}>{p.tag}</span>
              </div>
              <div style={styles.popInfo}>
                <h3 style={styles.popName}>{p.nombre}</h3>
                <span style={styles.popPrice}>{p.precio}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Features */}
      <section aria-labelledby="beneficios-title" style={styles.featuresSection}>
        <h2 id="beneficios-title" style={styles.srOnly}>¿Por qué elegir DomiFlex?</h2>
        <div style={styles.featuresGrid}>
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} style={styles.featureCard} className="df-lift">
                <div style={styles.featureIcon}>
                  <Icon size={28} color={theme.colors.accent} aria-hidden="true" />
                </div>
                <h3 style={styles.featureTitle}>{f.title}</h3>
                <p style={styles.featureDesc}>{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <div style={styles.howSection}>
        <h2 style={styles.sectionTitle}>¿Cómo funciona?</h2>
        <div style={styles.stepsGrid}>
          <div style={styles.stepCard}>
            <div style={styles.stepNumber}>1</div>
            <Store size={32} color={theme.colors.accent} aria-hidden="true" />
            <h3 style={styles.stepTitle}>Elige tu negocio</h3>
            <p style={styles.stepDesc}>Restaurantes, farmacias, supermercados y más</p>
          </div>
          <div style={styles.stepCard}>
            <div style={styles.stepNumber}>2</div>
            <CreditCard size={32} color={theme.colors.accent} aria-hidden="true" />
            <h3 style={styles.stepTitle}>Haz tu pedido</h3>
            <p style={styles.stepDesc}>Selecciona productos y paga en efectivo</p>
          </div>
          <div style={styles.stepCard}>
            <div style={styles.stepNumber}>3</div>
            <Bike size={32} color={theme.colors.accent} aria-hidden="true" />
            <h3 style={styles.stepTitle}>Recibe en casa</h3>
            <p style={styles.stepDesc}>Sigue tu pedido en tiempo real</p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={styles.ctaSection}>
        <h2 style={styles.ctaTitle}>¡Pide ahora!</h2>
        <p style={styles.ctaSubtitle}>Más que un domicilio, una experiencia</p>
        <Link to="/register" style={styles.btnPrimary} className="df-press">
          Registrarse gratis
        </Link>
      </div>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerGrid}>
          <div>
            <p style={styles.footerBrand}>DomiFlex</p>
            <p style={styles.footerText}>Delivery • Rapidez • Flexibilidad</p>
          </div>
          <div style={styles.footerLinks}>
            <Link to="/restaurantes" style={styles.footerLink}>Explorar</Link>
            <Link to="/login" style={styles.footerLink}>Iniciar sesión</Link>
            <Link to="/register" style={styles.footerLink}>Registrarse</Link>
          </div>
        </div>
        <p style={styles.copy}>© 2026 DomiFlex. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: theme.colors.bgPrimary,
    color: theme.colors.textPrimary,
    fontFamily: "'Montserrat', sans-serif",
  },
  hero: {
    position: "relative",
    padding: "clamp(56px, 12vw, 120px) 16px clamp(40px, 8vw, 80px)",
    textAlign: "center",
    background: `radial-gradient(ellipse at 50% 0%, ${theme.colors.accent}15 0%, transparent 60%)`,
    overflow: "hidden",
  },
  heroContent: {
    position: "relative",
    zIndex: 2,
    maxWidth: "640px",
    margin: "0 auto",
  },
  eyebrow: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 16px",
    borderRadius: "999px",
    border: `1px solid ${theme.colors.border}`,
    backgroundColor: theme.colors.bgCard,
    fontSize: "12px",
    fontWeight: 600,
    color: theme.colors.textSecondary,
    marginBottom: "24px",
  },
  dot: {
    width: "4px",
    height: "4px",
    borderRadius: "50%",
    backgroundColor: theme.colors.borderLight,
  },
  liveDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: theme.colors.accent,
    boxShadow: `0 0 8px ${theme.colors.accent}`,
  },
  logoLarge: {
    maxWidth: "340px",
    margin: "0 auto 24px",
    borderRadius: theme.borderRadius.lg,
    overflow: "hidden",
    border: `1px solid ${theme.colors.border}`,
    boxShadow: "0 8px 32px rgba(0, 230, 118, 0.15)",
  },
  logoImg: {
    display: "block",
    width: "100%",
    height: "auto",
    aspectRatio: "680 / 371",
  },
  heroTitle: {
    fontSize: "clamp(30px, 7vw, 44px)",
    fontWeight: 800,
    lineHeight: 1.05,
    letterSpacing: "-0.02em",
    marginBottom: "16px",
    overflowWrap: "break-word",
    textWrap: "balance",
  },
  heroAccent: {
    color: theme.colors.accent,
  },
  heroSubtitle: {
    fontSize: theme.fontSize.lg,
    lineHeight: 1.6,
    color: theme.colors.textSecondary,
    marginBottom: "32px",
    maxWidth: "65ch",
    marginLeft: "auto",
    marginRight: "auto",
  },
  heroButtons: {
    display: "flex",
    gap: "16px",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  btnPrimary: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: theme.colors.accent,
    color: "#000",
    padding: "14px 32px",
    minHeight: "48px",
    borderRadius: theme.borderRadius.xl,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    textDecoration: "none",
  },
  btnSecondary: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "transparent",
    color: theme.colors.accent,
    border: `2px solid ${theme.colors.accent}`,
    padding: "14px 32px",
    minHeight: "48px",
    borderRadius: theme.borderRadius.xl,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    textDecoration: "none",
  },
  statsRow: {
    display: "flex",
    justifyContent: "center",
    gap: "32px",
    marginTop: "40px",
    flexWrap: "wrap",
  },
  stat: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  statValue: {
    fontSize: "22px",
    fontWeight: 800,
    color: theme.colors.textPrimary,
  },
  statLabel: {
    fontSize: "12px",
    color: theme.colors.textSecondary,
  },
  marquee: {
    borderTop: `1px solid ${theme.colors.border}`,
    borderBottom: `1px solid ${theme.colors.border}`,
    backgroundColor: theme.colors.bgCard,
    overflow: "hidden",
    padding: "12px 0",
  },
  marqueeTrack: {
    display: "inline-flex",
    whiteSpace: "nowrap",
    animation: "df-marquee 45s linear infinite",
    willChange: "transform",
  },
  marqueeItem: {
    fontSize: "14px",
    fontWeight: 600,
    color: theme.colors.textSecondary,
    paddingRight: "48px",
  },
  marqueeSep: {
    color: theme.colors.accent,
    marginLeft: "48px",
  },
  popSection: {
    padding: "clamp(48px, 8vw, 80px) 16px",
    maxWidth: "1080px",
    margin: "0 auto",
  },
  sectionHead: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: "16px",
    marginBottom: "24px",
  },
  kicker: {
    fontSize: "12px",
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: theme.colors.accent,
    marginBottom: "8px",
  },
  sectionTitle: {
    fontSize: "clamp(24px, 4vw, 28px)",
    fontWeight: 800,
    letterSpacing: "-0.015em",
    lineHeight: 1.15,
    textWrap: "balance",
  },
  seeAll: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "14px",
    fontWeight: 600,
    color: theme.colors.accent,
    textDecoration: "none",
    whiteSpace: "nowrap",
  },
  popGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px",
  },
  popCard: {
    backgroundColor: theme.colors.bgCard,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.lg,
    overflow: "hidden",
    textDecoration: "none",
    display: "block",
  },
  popImgWrap: {
    position: "relative",
    width: "100%",
    aspectRatio: "4 / 3",
    overflow: "hidden",
    backgroundColor: theme.colors.bgSecondary,
  },
  popImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  popTag: {
    position: "absolute",
    top: "12px",
    left: "12px",
    backgroundColor: theme.colors.accent,
    color: "#000",
    fontSize: "11px",
    fontWeight: 700,
    padding: "4px 10px",
    borderRadius: "999px",
  },
  popInfo: {
    padding: "14px 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "8px",
  },
  popName: {
    fontSize: "15px",
    fontWeight: 700,
    color: theme.colors.textPrimary,
    margin: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  popPrice: {
    fontSize: "15px",
    fontWeight: 800,
    color: theme.colors.accent,
    whiteSpace: "nowrap",
  },
  featuresSection: {
    padding: "clamp(48px, 8vw, 80px) 16px",
    backgroundColor: theme.colors.bgSecondary,
  },
  featuresGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
    maxWidth: "900px",
    margin: "0 auto",
  },
  featureCard: {
    textAlign: "center",
    padding: "32px 20px",
    backgroundColor: theme.colors.bgCard,
    borderRadius: theme.borderRadius.md,
    border: `1px solid ${theme.colors.border}`,
  },
  featureIcon: {
    width: "56px",
    height: "56px",
    margin: "0 auto 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: `${theme.colors.accent}15`,
    borderRadius: "50%",
  },
  featureTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    marginBottom: "8px",
  },
  featureDesc: {
    fontSize: theme.fontSize.sm,
    lineHeight: 1.6,
    color: theme.colors.textSecondary,
  },
  howSection: {
    padding: "clamp(48px, 8vw, 80px) 16px",
    maxWidth: "1000px",
    margin: "0 auto",
  },
  stepsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "16px",
  },
  stepCard: {
    textAlign: "center",
    padding: "40px 24px",
    backgroundColor: theme.colors.bgCard,
    borderRadius: theme.borderRadius.lg,
    border: `1px solid ${theme.colors.border}`,
    position: "relative",
  },
  stepNumber: {
    position: "absolute",
    top: "16px",
    left: "16px",
    width: "32px",
    height: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.accent,
    color: "#000",
    borderRadius: "50%",
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold,
  },
  stepTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    marginTop: "16px",
    marginBottom: "8px",
  },
  stepDesc: {
    fontSize: theme.fontSize.sm,
    lineHeight: 1.6,
    color: theme.colors.textSecondary,
  },
  ctaSection: {
    padding: "clamp(48px, 8vw, 80px) 16px",
    textAlign: "center",
    background: `radial-gradient(ellipse at 50% 100%, ${theme.colors.accent}10 0%, transparent 60%)`,
  },
  ctaTitle: {
    fontSize: "clamp(30px, 7vw, 44px)",
    fontWeight: 800,
    letterSpacing: "-0.02em",
    lineHeight: 1.05,
    marginBottom: "16px",
    textWrap: "balance",
  },
  ctaSubtitle: {
    fontSize: theme.fontSize.lg,
    lineHeight: 1.6,
    color: theme.colors.textSecondary,
    marginBottom: "32px",
  },
  footer: {
    borderTop: `1px solid ${theme.colors.border}`,
    padding: "32px 16px",
  },
  footerGrid: {
    maxWidth: "1080px",
    margin: "0 auto 24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "24px",
    flexWrap: "wrap",
  },
  footerBrand: {
    fontSize: "18px",
    fontWeight: 800,
    marginBottom: "4px",
  },
  footerText: {
    fontSize: "13px",
    color: theme.colors.textSecondary,
  },
  footerLinks: {
    display: "flex",
    gap: "20px",
  },
  footerLink: {
    fontSize: "14px",
    fontWeight: 600,
    color: theme.colors.textSecondary,
    textDecoration: "none",
  },
  copy: {
    textAlign: "center",
    fontSize: "12px",
    color: theme.colors.textMuted,
  },
  srOnly: {
    position: "absolute",
    width: "1px",
    height: "1px",
    overflow: "hidden",
    clip: "rect(0 0 0 0)",
  },
};
