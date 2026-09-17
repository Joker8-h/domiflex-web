import { Link } from "react-router-dom";
import { Bike, CreditCard, ShieldCheck, Rocket, Store, Clock } from "lucide-react";
import theme from "../styles/theme";

export default function Landing() {
  const features = [
    { icon: Rocket, title: "Rápido", desc: "Tu pedido en minutos" },
    { icon: ShieldCheck, title: "Seguro", desc: "Repartidores verificados" },
    { icon: Clock, title: "Confiable", desc: "Seguimiento en tiempo real" },
    { icon: CreditCard, title: "Flexible", desc: "Múltiples métodos de pago" },
  ];

  const categories = [
    { icon: "🍔", label: "Restaurantes" },
    { icon: "💊", label: "Farmacias" },
    { icon: "🛒", label: "Supermercados" },
    { icon: "🏪", label: "Tiendas" },
    { icon: "📦", label: "Paquetería" },
  ];

  return (
    <div style={styles.page}>
      {/* Hero */}
      <div style={styles.hero}>
        <div style={styles.heroContent}>
          <div style={styles.logoLarge}>
            <img src="/logo-domiflex.jpg" alt="DomiFlex — Delivery, rapidez y flexibilidad" style={styles.logoImg} />
          </div>
          <h1 style={styles.heroTitle}>
            Tu comida favorita, <span style={styles.heroAccent}>más cerca de ti</span>
          </h1>
          <p style={styles.heroSubtitle}>
            Domicilios rápidos. Repartidores verificados. Paga en efectivo.
          </p>
          <div style={styles.heroButtons}>
            <Link to="/register" style={styles.btnPrimary}>
              <Rocket size={18} /> Comenzar
            </Link>
            <Link to="/login" style={styles.btnSecondary}>
              Iniciar sesión
            </Link>
          </div>
        </div>

        <div style={styles.categoriesBar}>
          {categories.map((cat, i) => (
            <div key={i} style={styles.categoryItem}>
              <span style={styles.categoryIcon}>{cat.icon}</span>
              <span style={styles.categoryLabel}>{cat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <section aria-labelledby="beneficios-title" style={styles.featuresSection}>
        <h2 id="beneficios-title" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>
          ¿Por qué elegir DomiFlex?
        </h2>
        <div style={styles.featuresGrid}>
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} style={styles.featureCard}>
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
            <Store size={32} color={theme.colors.accent} />
            <h3 style={styles.stepTitle}>Elige tu negocio</h3>
            <p style={styles.stepDesc}>Restaurantes, farmacias, supermercados y más</p>
          </div>
          <div style={styles.stepCard}>
            <div style={styles.stepNumber}>2</div>
            <CreditCard size={32} color={theme.colors.accent} />
            <h3 style={styles.stepTitle}>Haz tu pedido</h3>
            <p style={styles.stepDesc}>Selecciona productos y paga en efectivo</p>
          </div>
          <div style={styles.stepCard}>
            <div style={styles.stepNumber}>3</div>
            <Bike size={32} color={theme.colors.accent} />
            <h3 style={styles.stepTitle}>Recibe en casa</h3>
            <p style={styles.stepDesc}>Sigue tu pedido en tiempo real</p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={styles.ctaSection}>
        <h2 style={styles.ctaTitle}>¡Pide ahora!</h2>
        <p style={styles.ctaSubtitle}>Más que un domicilio, una experiencia</p>
        <Link to="/register" style={styles.btnPrimary}>
          Registrarse gratis
        </Link>
      </div>

      {/* Footer */}
      <footer style={styles.footer}>
        <p>© 2026 DomiFlex. Todos los derechos reservados.</p>
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
    maxWidth: "600px",
    margin: "0 auto",
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
  },
  heroTitle: {
    fontSize: "clamp(24px, 6vw, 40px)",
    fontWeight: theme.fontWeight.extrabold,
    lineHeight: 1.15,
    marginBottom: "16px",
    overflowWrap: "break-word",
    textWrap: "balance",
  },
  heroAccent: {
    color: theme.colors.accent,
  },
  heroSubtitle: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.textSecondary,
    marginBottom: "32px",
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
    borderRadius: theme.borderRadius.xl,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    textDecoration: "none",
    transition: theme.transitions.fast,
  },
  btnSecondary: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "transparent",
    color: theme.colors.accent,
    border: `2px solid ${theme.colors.accent}`,
    padding: "14px 32px",
    borderRadius: theme.borderRadius.xl,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    textDecoration: "none",
    transition: theme.transitions.fast,
  },
  categoriesBar: {
    display: "flex",
    justifyContent: "center",
    gap: "24px",
    marginTop: "48px",
    flexWrap: "wrap",
  },
  categoryItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
  },
  categoryIcon: {
    fontSize: "32px",
  },
  categoryLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  featuresSection: {
    padding: "80px 24px",
    backgroundColor: theme.colors.bgSecondary,
  },
  featuresGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "24px",
    maxWidth: "900px",
    margin: "0 auto",
  },
  featureCard: {
    textAlign: "center",
    padding: "32px 20px",
    backgroundColor: theme.colors.bgCard,
    borderRadius: theme.borderRadius.md,
    border: `1px solid ${theme.colors.border}`,
    transition: theme.transitions.normal,
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
    color: theme.colors.textSecondary,
  },
  howSection: {
    padding: "80px 24px",
    maxWidth: "1000px",
    margin: "0 auto",
  },
  sectionTitle: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    textAlign: "center",
    marginBottom: "48px",
  },
  stepsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "32px",
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
    color: theme.colors.textSecondary,
  },
  ctaSection: {
    padding: "80px 24px",
    textAlign: "center",
    background: `radial-gradient(ellipse at 50% 100%, ${theme.colors.accent}10 0%, transparent 60%)`,
  },
  ctaTitle: {
    fontSize: theme.fontSize.hero,
    fontWeight: theme.fontWeight.extrabold,
    marginBottom: "16px",
  },
  ctaSubtitle: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.textSecondary,
    marginBottom: "32px",
  },
  footer: {
    padding: "32px 24px",
    textAlign: "center",
    borderTop: `1px solid ${theme.colors.border}`,
    color: theme.colors.textMuted,
    fontSize: theme.fontSize.sm,
  },
};
