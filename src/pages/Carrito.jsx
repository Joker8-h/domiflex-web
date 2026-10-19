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
  Store,
} from "lucide-react";
import toast from "react-hot-toast";
import NavbarCustom from "../components/Navbar";
import CartItem from "../components/CartItem";
import EmptyState from "../components/ui/EmptyState";
import { api } from "../api/client";
import { loadCart, saveCart, clearCart } from "../lib/cartStorage";

export default function Carrito() {
  const navigate = useNavigate();
  const location = useLocation();
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
  const [paymentMethod, setPaymentMethod] = useState("EFECTIVO");

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
    () => cart.reduce((sum, item) => sum + Number(item.precio || item.precioUnitario || 0) * item.cantidad, 0),
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
        const data = await api.post(
          "/pedidos/cotizar",
          {
            negocioId: negocio.id,
            latRecogida: negocio.latitud,
            lngRecogida: negocio.longitud,
            latEntrega: coords.lat,
            lngEntrega: coords.lng,
            items: cart.map((item) => ({ menuItemId: item.id, cantidad: item.cantidad })),
          },
          { signal: controller.signal }
        );
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
      precio: item.precio ?? item.precioUnitario,
    })),
  });

  const listoParaPedir = () => {
    setFormError(null);
    if (cart.length === 0) return false;
    if (!dirEntrega.trim()) {
      setFormError("Por favor ingresa tu dirección de entrega exacta.");
      window.scrollTo({ top: 260, behavior: "smooth" });
      return false;
    }
    if (!coords) {
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

      {/* Header oscuro estilo Boceto 4: "← Tu carrito" */}
      <div style={styles.darkHeader}>
        <div style={styles.darkHeaderInner}>
          <button
            type="button"
            onClick={() => navigate(-1)}
            style={styles.headerBackBtn}
            aria-label="Volver"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 style={styles.headerTitle}>Tu carrito</h1>
          {cart.length > 0 && (
            <button
              type="button"
              onClick={handleClearCart}
              style={styles.headerClearBtn}
              title="Vaciar carrito"
            >
              <Trash2 size={16} />
              <span>Vaciar</span>
            </button>
          )}
        </div>
      </div>

      <main style={styles.mainContainer}>
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
            {/* Columna izquierda: Productos + Dirección + Pago */}
            <div style={styles.leftCol}>
              {negocio && (
                <div style={styles.restaurantBanner}>
                  <div style={styles.restaurantInfo}>
                    <div style={styles.restaurantIcon}>
                      <Store size={20} color="#E30613" />
                    </div>
                    <div>
                      <span style={styles.restaurantSub}>Restaurante seleccionado</span>
                      <h2 style={styles.restaurantTitle}>{negocio.nombre}</h2>
                    </div>
                  </div>
                </div>
              )}

              {/* Lista de productos según Boceto 4 */}
              <section aria-label="Productos en el carrito" style={styles.itemsSection}>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {cart.map((item) => (
                    <CartItem
                      key={item.id}
                      item={item}
                      onUpdateQuantity={updateQuantity}
                      onRemove={removeItem}
                    />
                  ))}
                </div>
              </section>

              {/* Dirección de entrega */}
              <section style={styles.card}>
                <div style={styles.cardHeader}>
                  <div style={styles.iconCircle}>
                    <MapPin size={20} color="#E30613" />
                  </div>
                  <div>
                    <h3 style={styles.cardTitle}>Dirección de entrega</h3>
                    <p style={styles.cardSubtitle}>¿A dónde te llevamos tu pedido?</p>
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
                    placeholder="Ej. Calle 45 # 12-34, Barrio Centro"
                    style={styles.input}
                    autoComplete="street-address"
                    required
                  />
                </div>

                <div style={styles.formGroup}>
                  <label htmlFor="notas-entrega" style={styles.label}>
                    Indicaciones adicionales (opcional)
                  </label>
                  <input
                    id="notas-entrega"
                    type="text"
                    value={notas}
                    onChange={(e) => setNotas(e.target.value)}
                    placeholder="Ej. Timbre 201, sin cebolla..."
                    style={styles.input}
                  />
                </div>

                <button
                  type="button"
                  onClick={useMyLocation}
                  disabled={locating}
                  style={styles.gpsBtn}
                >
                  <Navigation size={16} color={coords ? "#16A34A" : "#E30613"} />
                  <span style={{ color: coords ? "#16A34A" : "#E30613" }}>
                    {locating
                      ? "Obteniendo ubicación GPS…"
                      : coords
                      ? "✓ Ubicación GPS verificada"
                      : "Usar mi ubicación GPS actual"}
                  </span>
                </button>
              </section>

              {/* Método de pago */}
              <section style={styles.card}>
                <div style={styles.cardHeader}>
                  <div style={styles.iconCircle}>
                    <CreditCard size={20} color="#E30613" />
                  </div>
                  <div>
                    <h3 style={styles.cardTitle}>Método de pago</h3>
                    <p style={styles.cardSubtitle}>Elige cómo deseas pagar tu orden</p>
                  </div>
                </div>

                <div style={styles.paymentMethodsGrid}>
                  <label
                    style={{
                      ...styles.paymentOption,
                      borderColor: paymentMethod === "EFECTIVO" ? "#E30613" : "#E5E7EB",
                      backgroundColor: paymentMethod === "EFECTIVO" ? "#FEF2F2" : "#FFFFFF",
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
                        <Banknote size={20} color={paymentMethod === "EFECTIVO" ? "#E30613" : "#11141A"} />
                        <span style={styles.paymentName}>Efectivo contra entrega</span>
                      </div>
                      <p style={styles.paymentDesc}>Pagas al recibir tu pedido directamente al repartidor.</p>
                    </div>
                  </label>

                  <label
                    style={{
                      ...styles.paymentOption,
                      borderColor: paymentMethod === "ONLINE" ? "#E30613" : "#E5E7EB",
                      backgroundColor: paymentMethod === "ONLINE" ? "#FEF2F2" : "#FFFFFF",
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
                        <Smartphone size={20} color={paymentMethod === "ONLINE" ? "#E30613" : "#11141A"} />
                        <span style={styles.paymentName}>Nequi, PSE, Tarjetas (Wompi)</span>
                      </div>
                      <p style={styles.paymentDesc}>Pago en línea seguro e inmediato con Wompi.</p>
                    </div>
                  </label>
                </div>
              </section>

              {/* Cupón */}
              <section style={styles.couponCard}>
                <form onSubmit={handleApplyCoupon} style={styles.couponForm}>
                  <div style={styles.couponInputWrap}>
                    <Tag size={18} color="#9CA3AF" style={styles.couponIcon} />
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Código promocional (ej. RAPITIPICA)"
                      style={styles.couponInput}
                    />
                  </div>
                  <button type="submit" style={styles.couponBtn}>
                    Aplicar
                  </button>
                </form>
              </section>
            </div>

            {/* Columna derecha: Resumen de pago exacto al Boceto 4 (Subtotal, Domicilio, Total + Botón rojo "Continuar") */}
            <aside style={styles.rightCol}>
              <div style={styles.summaryCard}>
                <div style={styles.summaryLines}>
                  <div style={styles.summaryLine}>
                    <span style={styles.summaryLabel}>Subtotal</span>
                    <span style={styles.summaryValue}>${subtotal.toLocaleString("es-CO")}</span>
                  </div>

                  <div style={styles.summaryLine}>
                    <span style={styles.summaryLabel}>Domicilio</span>
                    <span style={styles.summaryValue}>
                      {quoting ? "Calculando..." : `$${domicilio.toLocaleString("es-CO")}`}
                    </span>
                  </div>

                  {discountAmount > 0 && (
                    <div style={styles.summaryLine}>
                      <span style={{ ...styles.summaryLabel, color: "#16A34A" }}>Descuento cupón</span>
                      <span style={{ ...styles.summaryValue, color: "#16A34A" }}>
                        -${discountAmount.toLocaleString("es-CO")}
                      </span>
                    </div>
                  )}

                  <div style={styles.divider} />

                  <div style={styles.totalLine}>
                    <span style={styles.totalLabel}>Total</span>
                    <span style={styles.totalPrice}>
                      {quoting ? "..." : `$${total.toLocaleString("es-CO")}`}
                    </span>
                  </div>
                </div>

                <div style={styles.guaranteeBox}>
                  <div style={styles.guaranteeItem}>
                    <Clock size={16} color="#16A34A" />
                    <span>Entrega estimada: <strong>25 - 35 min</strong></span>
                  </div>
                  <div style={styles.guaranteeItem}>
                    <ShieldCheck size={16} color="#16A34A" />
                    <span>Pedido protegido por Rapitipica</span>
                  </div>
                </div>

                {formError && (
                  <div role="alert" style={styles.errorAlert}>
                    ⚠️ {formError}
                  </div>
                )}

                <button
                  type="button"
                  style={styles.confirmBtn}
                  disabled={placing || quoting}
                  onClick={handleProcesarPedido}
                >
                  {placing ? "Procesando..." : "Continuar"}
                </button>
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
    backgroundColor: "#F8F9FA",
    color: "#11141A",
    paddingBottom: "90px",
  },
  darkHeader: {
    backgroundColor: "#0D1117",
    color: "#FFFFFF",
    padding: "16px 20px",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
  },
  darkHeaderInner: {
    maxWidth: "1100px",
    margin: "0 auto",
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },
  headerBackBtn: {
    width: "38px",
    height: "38px",
    borderRadius: "50%",
    border: "1px solid rgba(255,255,255,0.16)",
    backgroundColor: "rgba(255,255,255,0.08)",
    color: "#FFFFFF",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  headerTitle: {
    fontSize: "1.25rem",
    fontWeight: 800,
    margin: 0,
    flex: 1,
    color: "#FFFFFF",
  },
  headerClearBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    backgroundColor: "rgba(227, 6, 19, 0.15)",
    color: "#FF6B6B",
    border: "1px solid rgba(227, 6, 19, 0.35)",
    borderRadius: "9999px",
    padding: "6px 12px",
    fontSize: "0.82rem",
    fontWeight: 700,
    cursor: "pointer",
  },
  mainContainer: {
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "24px 20px",
  },
  emptyContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: "20px",
    border: "1px solid #E5E7EB",
    padding: "48px 24px",
    textAlign: "center",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "24px",
    alignItems: "start",
  },
  leftCol: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },
  restaurantBanner: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    border: "1px solid #E5E7EB",
    borderRadius: "16px",
    padding: "14px 18px",
  },
  restaurantInfo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  restaurantIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "12px",
    backgroundColor: "#FEF2F2",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  restaurantSub: {
    fontSize: "0.75rem",
    color: "#6B7280",
    display: "block",
  },
  restaurantTitle: {
    fontSize: "1.05rem",
    fontWeight: 800,
    color: "#11141A",
    margin: 0,
  },
  itemsSection: {
    display: "flex",
    flexDirection: "column",
  },
  card: {
    backgroundColor: "#FFFFFF",
    border: "1px solid #E5E7EB",
    borderRadius: "18px",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  iconCircle: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    backgroundColor: "#FEF2F2",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: "1rem",
    fontWeight: 800,
    color: "#11141A",
    margin: 0,
  },
  cardSubtitle: {
    fontSize: "0.8rem",
    color: "#6B7280",
    margin: 0,
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "0.85rem",
    fontWeight: 700,
    color: "#374151",
  },
  input: {
    width: "100%",
    backgroundColor: "#F8F9FA",
    border: "1px solid #D1D5DB",
    borderRadius: "12px",
    padding: "11px 14px",
    color: "#11141A",
    fontSize: "0.95rem",
    outline: "none",
  },
  gpsBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    backgroundColor: "#FEF2F2",
    border: "1px solid #FECACA",
    borderRadius: "12px",
    padding: "11px 16px",
    fontSize: "0.88rem",
    fontWeight: 700,
    cursor: "pointer",
  },
  paymentMethodsGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  paymentOption: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    padding: "14px",
    borderRadius: "14px",
    border: "1.5px solid #E5E7EB",
    cursor: "pointer",
  },
  radioInput: {
    marginTop: "4px",
    accentColor: "#E30613",
    cursor: "pointer",
  },
  paymentInfo: {
    flex: 1,
  },
  paymentTitleRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "2px",
  },
  paymentName: {
    fontSize: "0.95rem",
    fontWeight: 700,
    color: "#11141A",
  },
  paymentDesc: {
    fontSize: "0.8rem",
    color: "#6B7280",
    margin: 0,
  },
  couponCard: {
    backgroundColor: "#FFFFFF",
    border: "1px solid #E5E7EB",
    borderRadius: "16px",
    padding: "14px 16px",
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
    left: "12px",
    top: "50%",
    transform: "translateY(-50%)",
  },
  couponInput: {
    width: "100%",
    backgroundColor: "#F8F9FA",
    border: "1px solid #D1D5DB",
    borderRadius: "10px",
    padding: "10px 12px 10px 38px",
    color: "#11141A",
    fontSize: "0.9rem",
    outline: "none",
  },
  couponBtn: {
    backgroundColor: "#0D1117",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "10px",
    padding: "0 18px",
    fontWeight: 700,
    fontSize: "0.88rem",
    cursor: "pointer",
  },
  rightCol: {
    position: "sticky",
    top: "88px",
  },
  summaryCard: {
    backgroundColor: "#FFFFFF",
    border: "1px solid #E5E7EB",
    borderRadius: "20px",
    padding: "24px",
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.05)",
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },
  summaryLines: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  summaryLine: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "0.95rem",
  },
  summaryLabel: {
    color: "#4B5563",
    fontWeight: 600,
  },
  summaryValue: {
    color: "#11141A",
    fontWeight: 700,
  },
  divider: {
    height: "1px",
    backgroundColor: "#E5E7EB",
    margin: "4px 0",
  },
  totalLine: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: "1.15rem",
    fontWeight: 800,
    color: "#11141A",
  },
  totalPrice: {
    fontSize: "1.35rem",
    fontWeight: 900,
    color: "#11141A",
  },
  guaranteeBox: {
    backgroundColor: "#F0FDF4",
    border: "1px solid #BBF7D0",
    borderRadius: "12px",
    padding: "12px 14px",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  guaranteeItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "0.82rem",
    color: "#166534",
  },
  errorAlert: {
    backgroundColor: "#FEF2F2",
    border: "1px solid #FECACA",
    color: "#DC2626",
    borderRadius: "12px",
    padding: "12px",
    fontSize: "0.86rem",
    fontWeight: 700,
  },
  confirmBtn: {
    width: "100%",
    backgroundColor: "#E30613",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "9999px",
    padding: "15px 24px",
    fontSize: "1.05rem",
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: "0 8px 20px rgba(227, 6, 19, 0.3)",
    transition: "transform 0.15s ease",
  },
};
