import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Navigation, 
  ArrowLeft, 
  MapPin, 
  Tag, 
  Clock, 
  ShieldCheck, 
  CreditCard, 
  Banknote, 
  Smartphone,
  Trash2,
  ChevronRight,
  Store
} from "lucide-react";
import toast from "react-hot-toast";
import theme from "../styles/theme";
import tokens from "../design/tokens";
import NavbarCustom from "../components/Navbar";
import CartItem from "../components/CartItem";
import EmptyState from "../components/ui/EmptyState";
import { api } from "../api/client";
import { useIsMobile } from "../hooks/useMediaQuery";
import { loadCart, saveCart, clearCart } from "../lib/cartStorage";

export default function Carrito() {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const stored = loadCart();
  const incomingCart = location.state?.cart;
  const incomingNegocio = location.state?.negocio ?? null;

  const [cart, setCart] = useState(incomingCart?.length ? incomingCart : stored.cart);
  const [negocio, setNegocio] = useState(incomingNegocio || stored.negocio);
  const [nombreEntrega, setNombreEntrega] = useState("");
  const [dirEntrega, setDirEntrega] = useState("");
  const [notas, setNotas] = useState("");
  const [coords, setCoords] = useState(null);
  const [locating, setLocating] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [formError, setFormError] = useState(null);
  const [quote, setQuote] = useState(null);
  const [quoting, setQuoting] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [discountRate, setDiscountRate] = useState(0);
  const [freeShipping, setFreeShipping] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("EFECTIVO"); // "EFECTIVO" | "ONLINE"

  useEffect(() => {
    if (location.state?.cart?.length) {
      setCart(location.state.cart);
      setNegocio(location.state.negocio || null);
    }
  }, [location.state]);

  useEffect(() => {
    saveCart(cart, negocio);
  }, [cart, negocio]);

  const updateQuantity = (id, qty) => {
    if (qty <= 0) {
      setCart((prev) => prev.filter((item) => item.id !== id));
    } else {
      setCart((prev) =>
        prev.map((item) => (item.id === id ? { ...item, cantidad: qty } : item))
      );
    }
  };

  const removeItem = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
    toast.success("Producto removido del carrito");
  };

  const handleClearCart = () => {
    if (window.confirm("¿Seguro que deseas vaciar tu carrito?")) {
      clearCart();
      setCart([]);
      toast.success("Carrito vaciado");
    }
  };

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + Number(item.precio || 0) * item.cantidad, 0),
    [cart]
  );
  const domicilioLocal = Number(negocio?.costoEnvio ?? 3500);
  const baseDomicilio = quote ? Number(quote.envio) : domicilioLocal;
  const domicilio = freeShipping ? 0 : baseDomicilio;
  const baseTotal = quote ? Number(quote.total) - (freeShipping ? baseDomicilio : 0) : subtotal + domicilio;
  const discountAmount = Math.round(subtotal * discountRate);
  const total = Math.max(0, baseTotal - discountAmount);

  useEffect(() => {
    if (!coords || cart.length === 0 || !negocio?.latitud || !negocio?.longitud) {
      setQuote(null);
      return;
    }
    const controller = new AbortController();
    const run = async () => {
      setQuoting(true);
      try {
        const data = await api.post("/pedidos/cotizar", {
          negocioId: negocio.id,
          latRecogida: negocio.latitud,
          lngRecogida: negocio.longitud,
          latEntrega: coords.lat,
          lngEntrega: coords.lng,
          items: cart.map((item) => ({ menuItemId: item.id, cantidad: item.cantidad })),
        }, { signal: controller.signal });
        if (!controller.signal.aborted) setQuote(data);
      } catch (err) {
        if (!controller.signal.aborted) {
          setQuote(null);
          setFormError(err.message || "No se pudo calcular el costo de entrega.");
        }
      } finally {
        if (!controller.signal.aborted) setQuoting(false);
      }
    };
    run();
    return () => controller.abort();
  }, [coords, cart, negocio]);

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Tu dispositivo no soporta geolocalización.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
        toast.success("Ubicación GPS fijada exitosamente.");
      },
      () => {
        setLocating(false);
        // Fallback default coordinates (Popayán center)
        setCoords({ lat: 2.4448, lng: -76.6147 });
        toast.error("No se pudo obtener el GPS exacto. Usando ubicación estimada de Popayán.");
      },
      { timeout: 10000 }
    );
  };

  const datosPedido = () => ({
    negocioId: negocio.id,
    nombreRecogida: negocio.nombre,
    dirRecogida: negocio.direccion || "Popayán",
    latRecogida: negocio.latitud || 2.4448,
    lngRecogida: negocio.longitud || -76.6147,
    nombreEntrega: nombreEntrega.trim() || "Cliente",
    dirEntrega: dirEntrega.trim(),
    latEntrega: coords?.lat || 2.4448,
    lngEntrega: coords?.lng || -76.6147,
    detallePedido: `${negocio.nombre} - ${notas ? `Notas: ${notas}` : ""}`.trim(),
    tipoPago: paymentMethod,
    items: cart.map((item) => ({
      menuItemId: item.id,
      cantidad: item.cantidad,
      precio: item.precio,
    })),
  });

  const listoParaPedir = () => {
    setFormError(null);
    if (cart.length === 0) return false;
    if (!dirEntrega.trim()) {
      setFormError("Por favor ingresa tu dirección de entrega exacta.");
      window.scrollTo({ top: 300, behavior: "smooth" });
      return false;
    }
    if (!coords) {
      // Set auto Popayán coordinate if user didn't press button
      setCoords({ lat: 2.4448, lng: -76.6147 });
    }
    return true;
  };

  const handleProcesarPedido = async () => {
    if (!listoParaPedir()) return;
    setPlacing(true);

    if (paymentMethod === "EFECTIVO") {
      try {
        const pedido = await api.post("/pedidos", datosPedido());
        clearCart();
        setCart([]);
        toast.success(`¡Pedido #${pedido.idPedido} confirmado! Prepárate para recibirlo.`);
        navigate(`/tracking/${pedido.idPedido}`);
      } catch (err) {
        setFormError(err.message || "No se pudo confirmar el pedido. Intenta nuevamente.");
      } finally {
        setPlacing(false);
      }
    } else {
      // Pago online Wompi / PSE / Tarjeta
      try {
        const pedido = await api.post("/pedidos", datosPedido());
        clearCart();
        setCart([]);
        try {
          const checkout = await api.post("/pagos/wompi/checkout", { idPedido: pedido.idPedido });
          const query = [
            `public-key=${encodeURIComponent(checkout.publicKey)}`,
            `currency=${encodeURIComponent(checkout.currency)}`,
            `amount-in-cents=${encodeURIComponent(checkout.amountInCents)}`,
            `reference=${encodeURIComponent(checkout.reference)}`,
            `signature:integrity=${encodeURIComponent(checkout.signature)}`,
            `redirect-url=${encodeURIComponent(checkout.redirectUrl)}`,
          ].join("&");
          window.location.href = `https://checkout.wompi.co/p/?${query}`;
        } catch (err) {
          toast.error(err.message || "No se pudo conectar a la pasarela. El pedido quedó en efectivo.");
          navigate(`/tracking/${pedido.idPedido}`);
        }
      } catch (err) {
        setFormError(err.message || "No se pudo procesar la solicitud de pago.");
        setPlacing(false);
      }
    }
  };

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    const code = couponCode.trim().toUpperCase();
    if (!code) return;
    if (code === "RAPITIPICA" || code === "PROMO10") {
      setDiscountRate(0.1);
      toast.success("¡Cupón aplicado! 10% de descuento en tus productos.");
    } else if (code === "ENVIOGRATIS") {
      setFreeShipping(true);
      toast.success("¡Cupón aplicado! Envío gratis activado.");
    } else {
      toast.error("Cupón no válido o expirado.");
    }
  };

  return (
    <div style={styles.page}>
      <NavbarCustom />

      <main style={styles.mainContainer}>
        {/* Breadcrumb / Top Bar */}
        <div style={styles.topBar}>
          <button 
            type="button" 
            style={styles.backBtn}
            onClick={() => navigate(-1)}
            aria-label="Volver"
          >
            <ArrowLeft size={18} />
            <span>Volver</span>
          </button>
          <div style={styles.breadcrumb}>
            <span style={{ color: tokens.colors.textMuted }}>Inicio</span>
            <span style={{ color: tokens.colors.border }}>/</span>
            <span style={{ color: tokens.colors.accent, fontWeight: 600 }}>Carrito de compras</span>
          </div>
        </div>

        {cart.length === 0 ? (
          <div style={styles.emptyContainer}>
            <EmptyState
              icon="🛒"
              title="Tu carrito está vacío"
              description="Aún no has agregado delicias a tu canasta. Explora los mejores restaurantes y pide en minutos."
              actionLabel="Explorar restaurantes"
              onAction={() => navigate("/restaurantes")}
            />
          </div>
        ) : (
          <div style={styles.grid}>
            {/* Left Column: Items & Delivery Info */}
            <div style={styles.leftCol}>
              {/* Header Restaurant Badge */}
              {negocio && (
                <div style={styles.restaurantBanner}>
                  <div style={styles.restaurantInfo}>
                    <div style={styles.restaurantIcon}>
                      <Store size={22} color={tokens.colors.accent} />
                    </div>
                    <div>
                      <span style={styles.restaurantSub}>Pidiendo en:</span>
                      <h2 style={styles.restaurantTitle}>{negocio.nombre}</h2>
                    </div>
                  </div>
                  <button 
                    type="button" 
                    onClick={handleClearCart} 
                    style={styles.clearCartBtn}
                    title="Vaciar carrito"
                  >
                    <Trash2 size={16} />
                    <span>Vaciar</span>
                  </button>
                </div>
              )}

              {/* Items List */}
              <section aria-label="Productos en el carrito" style={styles.itemsSection}>
                <h3 style={styles.sectionHeader}>
                  Productos seleccionados ({cart.reduce((c, i) => c + i.cantidad, 0)})
                </h3>
                {cart.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    onUpdateQuantity={updateQuantity}
                    onRemove={removeItem}
                  />
                ))}
              </section>

              {/* Delivery Address Card */}
              <section style={styles.card}>
                <div style={styles.cardHeader}>
                  <div style={styles.iconCircle}>
                    <MapPin size={20} color={tokens.colors.accent} />
                  </div>
                  <div>
                    <h3 style={styles.cardTitle}>Dirección de entrega</h3>
                    <p style={styles.cardSubtitle}>¿A dónde te llevamos este pedido?</p>
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label htmlFor="nombre-recibe" style={styles.label}>
                    ¿Quién recibe el pedido?
                  </label>
                  <input
                    id="nombre-recibe"
                    type="text"
                    value={nombreEntrega}
                    onChange={(e) => setNombreEntrega(e.target.value)}
                    placeholder="Ej. Andrés Gómez (o tú mismo)"
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label htmlFor="direccion-entrega" style={styles.label}>
                    Dirección exacta *
                  </label>
                  <input
                    id="direccion-entrega"
                    type="text"
                    value={dirEntrega}
                    onChange={(e) => setDirEntrega(e.target.value)}
                    placeholder="Ej. Calle 5 # 12-45, Barrio Centro, Casa 3"
                    style={styles.input}
                    autoComplete="street-address"
                    required
                  />
                </div>

                <div style={styles.formGroup}>
                  <label htmlFor="notas-entrega" style={styles.label}>
                    Indicaciones especiales (opcional)
                  </label>
                  <input
                    id="notas-entrega"
                    type="text"
                    value={notas}
                    onChange={(e) => setNotas(e.target.value)}
                    placeholder="Ej. Timbre 201, dejar en portería, edificio blanco..."
                    style={styles.input}
                  />
                </div>

                <button
                  type="button"
                  onClick={useMyLocation}
                  disabled={locating}
                  style={styles.gpsBtn}
                >
                  <Navigation size={16} color={tokens.colors.accent} />
                  <span>
                    {locating
                      ? "Obteniendo ubicación GPS…"
                      : coords
                      ? "✓ Ubicación GPS verificada (clic para actualizar)"
                      : "Usar mi ubicación GPS actual"}
                  </span>
                </button>
              </section>

              {/* Payment Methods Card */}
              <section style={styles.card}>
                <div style={styles.cardHeader}>
                  <div style={styles.iconCircle}>
                    <CreditCard size={20} color={tokens.colors.accent} />
                  </div>
                  <div>
                    <h3 style={styles.cardTitle}>Método de pago</h3>
                    <p style={styles.cardSubtitle}>Elige cómo deseas abonar tu orden</p>
                  </div>
                </div>

                <div style={styles.paymentMethodsGrid}>
                  {/* Option 1: Cash */}
                  <label 
                    style={{
                      ...styles.paymentOption,
                      borderColor: paymentMethod === "EFECTIVO" ? tokens.colors.accent : tokens.colors.border,
                      backgroundColor: paymentMethod === "EFECTIVO" ? "rgba(0, 229, 118, 0.08)" : tokens.colors.bgPrimary,
                    }}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="EFECTIVO"
                      checked={paymentMethod === "EFECTIVO"}
                      onChange={() => setPaymentMethod("EFECTIVO")}
                      style={styles.radioInput}
                    />
                    <div style={styles.paymentInfo}>
                      <div style={styles.paymentTitleRow}>
                        <Banknote size={20} color={paymentMethod === "EFECTIVO" ? tokens.colors.accent : tokens.colors.textPrimary} />
                        <span style={styles.paymentName}>Efectivo contra entrega</span>
                      </div>
                      <p style={styles.paymentDesc}>Pagas al recibir tu comida directamente al domiciliario.</p>
                    </div>
                  </label>

                  {/* Option 2: Online / Wompi */}
                  <label 
                    style={{
                      ...styles.paymentOption,
                      borderColor: paymentMethod === "ONLINE" ? tokens.colors.accent : tokens.colors.border,
                      backgroundColor: paymentMethod === "ONLINE" ? "rgba(0, 229, 118, 0.08)" : tokens.colors.bgPrimary,
                    }}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="ONLINE"
                      checked={paymentMethod === "ONLINE"}
                      onChange={() => setPaymentMethod("ONLINE")}
                      style={styles.radioInput}
                    />
                    <div style={styles.paymentInfo}>
                      <div style={styles.paymentTitleRow}>
                        <Smartphone size={20} color={paymentMethod === "ONLINE" ? tokens.colors.accent : tokens.colors.textPrimary} />
                        <span style={styles.paymentName}>Nequi, Daviplata, Tarjetas (Wompi)</span>
                      </div>
                      <p style={styles.paymentDesc}>Pago en línea inmediato 100% seguro con pasarela Wompi Bancolombia.</p>
                    </div>
                  </label>
                </div>
              </section>

              {/* Coupon Section */}
              <section style={styles.couponCard}>
                <form onSubmit={handleApplyCoupon} style={styles.couponForm}>
                  <div style={styles.couponInputWrap}>
                    <Tag size={18} color={tokens.colors.textMuted} style={styles.couponIcon} />
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="¿Tienes un cupón de descuento?"
                      style={styles.couponInput}
                    />
                  </div>
                  <button type="submit" style={styles.couponBtn}>
                    Aplicar
                  </button>
                </form>
              </section>
            </div>

            {/* Right Column: Order Summary (Sticky) */}
            <aside style={styles.rightCol}>
              <div style={styles.summaryCard}>
                <h3 style={styles.summaryTitle}>Resumen del pedido</h3>

                <div style={styles.summaryLines}>
                  <div style={styles.summaryLine}>
                    <span style={styles.summaryLabel}>Subtotal de productos</span>
                    <span style={styles.summaryValue}>${subtotal.toLocaleString()}</span>
                  </div>

                  <div style={styles.summaryLine}>
                    <span style={styles.summaryLabel}>Costo de entrega</span>
                    <span style={styles.summaryValue}>
                      {quoting ? "Calculando..." : `$${domicilio.toLocaleString()}`}
                    </span>
                  </div>

                  <div style={styles.summaryLine}>
                    <span style={styles.summaryLabel}>Tarifa de servicio</span>
                    <span style={{ ...styles.summaryValue, color: tokens.colors.accent }}>$0 (Gratis)</span>
                  </div>

                  <div style={styles.divider} />

                  <div style={styles.totalLine}>
                    <div>
                      <span style={styles.totalLabel}>Total a pagar</span>
                      <span style={styles.totalSub}>Incluye IVA y domicilio</span>
                    </div>
                    <span style={styles.totalPrice}>
                      {quoting ? "..." : `$${total.toLocaleString()}`}
                    </span>
                  </div>
                </div>

                {/* Estimate & Guarantees */}
                <div style={styles.guaranteeBox}>
                  <div style={styles.guaranteeItem}>
                    <Clock size={16} color={tokens.colors.accent} />
                    <span>Tiempo estimado: <strong>25 - 35 min</strong></span>
                  </div>
                  <div style={styles.guaranteeItem}>
                    <ShieldCheck size={16} color={tokens.colors.accent} />
                    <span>Garantía Rapitipica: Comida fresca y a tiempo</span>
                  </div>
                </div>

                {/* Form Error Alert */}
                {formError && (
                  <div role="alert" style={styles.errorAlert}>
                    ⚠️ {formError}
                  </div>
                )}

                {/* Main Action Button */}
                <button
                  type="button"
                  style={styles.confirmBtn}
                  disabled={placing || quoting}
                  onClick={handleProcesarPedido}
                >
                  {placing ? (
                    "Confirmando pedido..."
                  ) : paymentMethod === "EFECTIVO" ? (
                    `Pedir en efectivo • $${total.toLocaleString()}`
                  ) : (
                    `Pagar en línea • $${total.toLocaleString()}`
                  )}
                  <ChevronRight size={20} />
                </button>

                <p style={styles.secureText}>
                  🔒 Transacción segura y verificada por Rapitipica
                </p>
              </div>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: tokens.colors.bgPrimary,
    color: tokens.colors.textPrimary,
    fontFamily: tokens.typography.fontFamily,
    paddingBottom: "80px",
  },
  mainContainer: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "24px 20px",
  },
  topBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "24px",
  },
  backBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: tokens.colors.bgCard,
    border: `1px solid ${tokens.colors.border}`,
    borderRadius: tokens.borderRadius.full,
    padding: "8px 16px",
    color: tokens.colors.textPrimary,
    cursor: "pointer",
    fontSize: tokens.fontSize.sm,
    fontWeight: 500,
    transition: "background 0.2s ease, border-color 0.2s ease",
  },
  breadcrumb: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: tokens.fontSize.sm,
  },
  emptyContainer: {
    backgroundColor: tokens.colors.bgCard,
    borderRadius: tokens.borderRadius.lg,
    border: `1px solid ${tokens.colors.border}`,
    padding: "48px 24px",
    textAlign: "center",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "32px",
    alignItems: "start",
  },
  leftCol: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  restaurantBanner: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: tokens.colors.bgCard,
    border: `1px solid ${tokens.colors.border}`,
    borderRadius: tokens.borderRadius.md,
    padding: "16px 20px",
  },
  restaurantInfo: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },
  restaurantIcon: {
    width: "44px",
    height: "44px",
    borderRadius: tokens.borderRadius.sm,
    backgroundColor: "rgba(0, 229, 118, 0.12)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  restaurantSub: {
    fontSize: tokens.fontSize.xs,
    color: tokens.colors.textSecondary,
    display: "block",
  },
  restaurantTitle: {
    fontSize: tokens.fontSize.lg,
    fontWeight: tokens.fontWeight.bold,
    color: tokens.colors.textPrimary,
    margin: 0,
  },
  clearCartBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    background: "transparent",
    border: "none",
    color: "#EF4444",
    fontSize: tokens.fontSize.sm,
    cursor: "pointer",
    padding: "6px 10px",
    borderRadius: tokens.borderRadius.sm,
  },
  itemsSection: {
    display: "flex",
    flexDirection: "column",
  },
  sectionHeader: {
    fontSize: tokens.fontSize.md,
    fontWeight: tokens.fontWeight.bold,
    color: tokens.colors.textPrimary,
    marginBottom: "12px",
  },
  card: {
    backgroundColor: tokens.colors.bgCard,
    border: `1px solid ${tokens.colors.border}`,
    borderRadius: tokens.borderRadius.md,
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    marginBottom: "4px",
  },
  iconCircle: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    backgroundColor: "rgba(0, 229, 118, 0.12)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: tokens.fontSize.md,
    fontWeight: tokens.fontWeight.bold,
    color: tokens.colors.textPrimary,
    margin: 0,
  },
  cardSubtitle: {
    fontSize: tokens.fontSize.xs,
    color: tokens.colors.textSecondary,
    margin: 0,
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: tokens.fontSize.sm,
    fontWeight: tokens.fontWeight.medium,
    color: tokens.colors.textSecondary,
  },
  input: {
    width: "100%",
    backgroundColor: tokens.colors.bgPrimary,
    border: `1px solid ${tokens.colors.border}`,
    borderRadius: tokens.borderRadius.sm,
    padding: "12px 16px",
    color: tokens.colors.textPrimary,
    fontSize: tokens.fontSize.md,
    outline: "none",
    fontFamily: tokens.typography.fontFamily,
    transition: "border-color 0.2s ease",
  },
  gpsBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    backgroundColor: "rgba(0, 229, 118, 0.08)",
    border: `1px solid ${tokens.colors.accent}`,
    borderRadius: tokens.borderRadius.sm,
    padding: "12px 16px",
    color: tokens.colors.accent,
    fontSize: tokens.fontSize.sm,
    fontWeight: tokens.fontWeight.semibold,
    cursor: "pointer",
    transition: "background 0.2s ease",
  },
  paymentMethodsGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  paymentOption: {
    display: "flex",
    alignItems: "flex-start",
    gap: "14px",
    padding: "16px",
    borderRadius: tokens.borderRadius.md,
    border: `1px solid ${tokens.colors.border}`,
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  radioInput: {
    marginTop: "4px",
    accentColor: tokens.colors.accent,
    cursor: "pointer",
  },
  paymentInfo: {
    flex: 1,
  },
  paymentTitleRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "4px",
  },
  paymentName: {
    fontSize: tokens.fontSize.md,
    fontWeight: tokens.fontWeight.semibold,
    color: tokens.colors.textPrimary,
  },
  paymentDesc: {
    fontSize: tokens.fontSize.xs,
    color: tokens.colors.textSecondary,
    margin: 0,
    lineHeight: 1.4,
  },
  couponCard: {
    backgroundColor: tokens.colors.bgCard,
    border: `1px solid ${tokens.colors.border}`,
    borderRadius: tokens.borderRadius.md,
    padding: "16px 20px",
  },
  couponForm: {
    display: "flex",
    gap: "10px",
  },
  couponInputWrap: {
    position: "relative",
    flex: 1,
  },
  couponIcon: {
    position: "absolute",
    left: "14px",
    top: "50%",
    transform: "translateY(-50%)",
  },
  couponInput: {
    width: "100%",
    backgroundColor: tokens.colors.bgPrimary,
    border: `1px solid ${tokens.colors.border}`,
    borderRadius: tokens.borderRadius.sm,
    padding: "12px 14px 12px 42px",
    color: tokens.colors.textPrimary,
    fontSize: tokens.fontSize.sm,
    outline: "none",
  },
  couponBtn: {
    backgroundColor: "transparent",
    border: `1px solid ${tokens.colors.accent}`,
    color: tokens.colors.accent,
    borderRadius: tokens.borderRadius.sm,
    padding: "0 20px",
    fontWeight: tokens.fontWeight.bold,
    fontSize: tokens.fontSize.sm,
    cursor: "pointer",
    transition: "background 0.2s ease",
  },
  rightCol: {
    position: "sticky",
    top: "100px",
  },
  summaryCard: {
    backgroundColor: tokens.colors.bgCard,
    border: `1px solid ${tokens.colors.border}`,
    borderRadius: tokens.borderRadius.md,
    padding: "24px",
    boxShadow: tokens.shadows.card,
  },
  summaryTitle: {
    fontSize: tokens.fontSize.lg,
    fontWeight: tokens.fontWeight.bold,
    color: tokens.colors.textPrimary,
    marginBottom: "20px",
  },
  summaryLines: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    marginBottom: "20px",
  },
  summaryLine: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.textSecondary,
  },
  summaryValue: {
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.textPrimary,
    fontWeight: tokens.fontWeight.semibold,
  },
  divider: {
    height: "1px",
    backgroundColor: tokens.colors.border,
    margin: "8px 0",
  },
  totalLine: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: "6px",
  },
  totalLabel: {
    fontSize: tokens.fontSize.md,
    fontWeight: tokens.fontWeight.bold,
    color: tokens.colors.textPrimary,
    display: "block",
  },
  totalSub: {
    fontSize: tokens.fontSize.xs,
    color: tokens.colors.textSecondary,
    display: "block",
  },
  totalPrice: {
    fontSize: tokens.fontSize["2xl"],
    fontWeight: tokens.fontWeight.bold,
    color: tokens.colors.accent,
  },
  guaranteeBox: {
    backgroundColor: tokens.colors.bgPrimary,
    borderRadius: tokens.borderRadius.sm,
    padding: "14px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginBottom: "20px",
    border: `1px solid ${tokens.colors.border}`,
  },
  guaranteeItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: tokens.fontSize.xs,
    color: tokens.colors.textSecondary,
  },
  errorAlert: {
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    border: "1px solid #EF4444",
    borderRadius: tokens.borderRadius.sm,
    padding: "12px 14px",
    color: "#FCA5A5",
    fontSize: tokens.fontSize.xs,
    marginBottom: "16px",
    lineHeight: 1.4,
  },
  confirmBtn: {
    width: "100%",
    padding: "16px 20px",
    backgroundColor: tokens.colors.accent,
    color: "#0B1F44",
    border: "none",
    borderRadius: tokens.borderRadius.full,
    fontSize: tokens.fontSize.md,
    fontWeight: tokens.fontWeight.bold,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    boxShadow: tokens.shadows.glow,
    transition: "transform 0.2s ease, background-color 0.2s ease",
  },
  secureText: {
    textAlign: "center",
    fontSize: tokens.fontSize.xs,
    color: tokens.colors.textMuted,
    marginTop: "16px",
    marginBottom: 0,
  },
};
