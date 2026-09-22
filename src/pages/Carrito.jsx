import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Navigation, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import theme from "../styles/theme";
import { Button } from "../components/common";
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
  const [coords, setCoords] = useState(null);
  const [locating, setLocating] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [formError, setFormError] = useState(null);
  const [quote, setQuote] = useState(null);
  const [quoting, setQuoting] = useState(false);

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
  };

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + Number(item.precio || 0) * item.cantidad, 0),
    [cart]
  );
  const domicilioLocal = Number(negocio?.costoEnvio ?? 2000);
  const domicilio = quote ? Number(quote.envio) : domicilioLocal;
  const total = quote ? Number(quote.total) : subtotal + domicilioLocal;

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
          setFormError(err.message || "No se pudo calcular el total.");
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
        toast.success("Ubicación de entrega lista.");
      },
      () => {
        setLocating(false);
        toast.error("No pudimos obtener tu ubicación. Activa el GPS e inténtalo de nuevo.");
      },
      { timeout: 15000 }
    );
  };

  const datosPedido = () => ({
    negocioId: negocio.id,
    nombreRecogida: negocio.nombre,
    dirRecogida: negocio.direccion,
    latRecogida: negocio.latitud,
    lngRecogida: negocio.longitud,
    nombreEntrega: nombreEntrega.trim() || "Mi casa",
    dirEntrega: dirEntrega.trim(),
    latEntrega: coords.lat,
    lngEntrega: coords.lng,
    detallePedido: `Pedido desde ${negocio.nombre}`,
    tipoPago: "EFECTIVO",
    items: cart.map((item) => ({
      menuItemId: item.id,
      cantidad: item.cantidad,
      precio: item.precio,
    })),
  });

  const listoParaPedir = () => {
    setFormError(null);
    if (cart.length === 0) return false;
    if (!negocio?.latitud || !negocio?.longitud) {
      setFormError("Este negocio no tiene ubicación registrada. Elige otro negocio.");
      return false;
    }
    if (!dirEntrega.trim()) {
      setFormError("Escribe tu dirección de entrega.");
      return false;
    }
    if (!coords) {
      setFormError("Comparte tu ubicación con el botón de abajo para calcular el domicilio.");
      return false;
    }
    return true;
  };

  const handleCheckout = async () => {
    if (!listoParaPedir()) return;
    setPlacing(true);
    try {
      const pedido = await api.post("/pedidos", datosPedido());
      clearCart();
      setCart([]);
      toast.success(`Pedido #${pedido.idPedido} confirmado. Pago en efectivo: $${Number(pedido.total).toLocaleString()}`);
      navigate(`/tracking/${pedido.idPedido}`);
    } catch (err) {
      setFormError(err.message || "No se pudo crear el pedido.");
    } finally {
      setPlacing(false);
    }
  };

  const handleOnline = async () => {
    if (!listoParaPedir()) return;
    setPlacing(true);
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
        toast.error(err.message || "El pedido quedó en efectivo.");
        navigate(`/tracking/${pedido.idPedido}`);
      }
    } catch (err) {
      setFormError(err.message || "No se pudo crear el pedido.");
      setPlacing(false);
    }
  };

  return (
    <div style={{ ...styles.page, paddingBottom: isMobile ? "120px" : "40px" }}>
      <div style={styles.header}>
        <button type="button" aria-label="Volver" style={styles.backBtn} onClick={() => navigate(-1)}>
          <ArrowLeft size={18} aria-hidden="true" />
        </button>
        <h1 style={styles.title}>Tu carrito</h1>
        <div style={{ width: "44px" }} aria-hidden="true" />
      </div>

      {negocio && (
        <div style={styles.negocioInfo}>
          <span style={styles.negocioIcon} aria-hidden="true">🏪</span>
          <span style={styles.negocioName}>{negocio.nombre}</span>
        </div>
      )}

      <div style={styles.content}>
        {cart.length === 0 ? (
          <EmptyState
            icon="🛒"
            title="Tu carrito está vacío"
            description="Explora negocios y agrega tus productos favoritos."
            actionLabel="Explorar negocios"
            onAction={() => navigate("/restaurantes")}
          />
        ) : (
          <>
            <div style={styles.items}>
              {cart.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeItem}
                />
              ))}
            </div>

            {/* Entrega */}
            <section aria-labelledby="entrega-title" style={styles.card}>
              <h2 id="entrega-title" style={styles.cardTitle}>Dirección de entrega</h2>
              <label htmlFor="nombre-entrega" style={styles.label}>¿Quién recibe?</label>
              <input
                id="nombre-entrega"
                type="text"
                value={nombreEntrega}
                onChange={(e) => setNombreEntrega(e.target.value)}
                placeholder="Nombre (opcional)"
                style={styles.input}
              />
              <label htmlFor="dir-entrega" style={styles.label}>Dirección</label>
              <input
                id="dir-entrega"
                type="text"
                value={dirEntrega}
                onChange={(e) => setDirEntrega(e.target.value)}
                placeholder="Calle, número, barrio, referencia"
                style={styles.input}
                autoComplete="street-address"
              />
              <button
                type="button"
                onClick={useMyLocation}
                disabled={locating}
                style={styles.locBtn}
              >
                <Navigation size={14} aria-hidden="true" />
                {locating ? "Obteniendo ubicación…" : coords ? "Ubicación lista ✓ (toca para actualizar)" : "Usar mi ubicación actual"}
              </button>
            </section>

            {/* Cupón */}
            <div style={styles.couponSection}>
              <label htmlFor="cupon" style={styles.srOnly}>Cupón de descuento</label>
              <input
                id="cupon"
                type="text"
                placeholder="¿Tienes un cupón?"
                style={styles.couponInput}
                onKeyDown={(e) => {
                  if (e.key === "Enter") toast("Los cupones estarán disponibles muy pronto.", { icon: "🎟️" });
                }}
              />
              <button
                type="button"
                style={styles.couponBtn}
                onClick={() => toast("Los cupones estarán disponibles muy pronto.", { icon: "🎟️" })}
              >
                Aplicar
              </button>
            </div>

            {/* Resumen */}
            <div style={styles.summary} aria-live="polite">
              <div style={styles.summaryRow}>
                <span style={styles.summaryLabel}>Subtotal</span>
                <span style={styles.summaryValue}>${subtotal.toLocaleString()}</span>
              </div>
              <div style={styles.summaryRow}>
                <span style={styles.summaryLabel}>Domicilio</span>
                <span style={styles.summaryValue}>
                  {quoting ? "Calculando…" : `$${domicilio.toLocaleString()}`}
                </span>
              </div>
              <div style={styles.summaryDivider} />
              <div style={styles.summaryRow}>
                <span style={styles.summaryTotalLabel}>Total (efectivo)</span>
                <span style={styles.summaryTotalValue}>
                  {quoting ? "…" : `$${total.toLocaleString()}`}
                </span>
              </div>
              <p style={styles.quoteNote}>
                {quote
                  ? "Total confirmado con los precios del menú."
                  : "Comparte tu ubicación para confirmar el total del servidor."}
              </p>
            </div>

            {formError && (
              <p role="alert" style={styles.formError}>{formError}</p>
            )}

            <Button fullWidth onClick={handleCheckout} disabled={placing || quoting}>
              {placing ? "Confirmando pedido…" : `Pagar en efectivo — $${total.toLocaleString()}`}
            </Button>
            <button type="button" style={styles.onlineBtn} onClick={handleOnline} disabled={placing || quoting}>
              Pagar en línea (Nequi, PSE o tarjeta)
            </button>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: theme.colors.bgPrimary,
    paddingBottom: "40px",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px",
    position: "sticky",
    top: 0,
    backgroundColor: theme.colors.bgNavbar,
    backdropFilter: "blur(10px)",
    zIndex: theme.zIndex.sticky,
  },
  backBtn: {
    width: "44px",
    height: "44px",
    borderRadius: "50%",
    border: `1px solid ${theme.colors.border}`,
    backgroundColor: theme.colors.bgCard,
    color: theme.colors.textPrimary,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  title: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
  },
  negocioInfo: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 16px",
    backgroundColor: theme.colors.bgCard,
    borderBottom: `1px solid ${theme.colors.border}`,
  },
  negocioIcon: {
    fontSize: "24px",
  },
  negocioName: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
  },
  content: {
    padding: "16px",
    maxWidth: "640px",
    margin: "0 auto",
    width: "100%",
  },
  items: {
    marginBottom: "24px",
  },
  card: {
    backgroundColor: theme.colors.bgCard,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.md,
    padding: "20px",
    marginBottom: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  cardTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    marginBottom: "8px",
  },
  label: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.textSecondary,
  },
  input: {
    backgroundColor: theme.colors.bgInput,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.sm,
    padding: "12px 16px",
    minHeight: "48px",
    color: theme.colors.textPrimary,
    fontSize: theme.fontSize.md,
    fontFamily: "'Montserrat', sans-serif",
    width: "100%",
  },
  locBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    marginTop: "8px",
    minHeight: "48px",
    borderRadius: theme.borderRadius.sm,
    border: `1px solid ${theme.colors.accent}`,
    backgroundColor: "transparent",
    color: theme.colors.accent,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    cursor: "pointer",
    fontFamily: "'Montserrat', sans-serif",
  },
  couponSection: {
    display: "flex",
    gap: "8px",
    marginBottom: "24px",
  },
  srOnly: {
    position: "absolute",
    width: "1px",
    height: "1px",
    overflow: "hidden",
    clip: "rect(0 0 0 0)",
  },
  couponInput: {
    flex: 1,
    backgroundColor: theme.colors.bgInput,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.sm,
    padding: "12px 16px",
    minHeight: "48px",
    color: theme.colors.textPrimary,
    fontSize: theme.fontSize.md,
    fontFamily: "'Montserrat', sans-serif",
  },
  couponBtn: {
    backgroundColor: theme.colors.bgCard,
    color: theme.colors.accent,
    border: `1px solid ${theme.colors.accent}`,
    borderRadius: theme.borderRadius.sm,
    padding: "12px 20px",
    minHeight: "48px",
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    cursor: "pointer",
    fontFamily: "'Montserrat', sans-serif",
  },
  summary: {
    backgroundColor: theme.colors.bgCard,
    borderRadius: theme.borderRadius.md,
    border: `1px solid ${theme.colors.border}`,
    padding: "20px",
    marginBottom: "24px",
  },
  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "12px",
  },
  summaryLabel: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  summaryValue: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
  },
  summaryDivider: {
    height: "1px",
    backgroundColor: theme.colors.border,
    margin: "12px 0",
  },
  summaryTotalLabel: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
  },
  summaryTotalValue: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.accent,
  },
  quoteNote: {
    margin: "4px 0 0",
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  onlineBtn: {
    width: "100%",
    marginTop: "10px",
    padding: "14px 16px",
    borderRadius: theme.borderRadius.sm,
    border: `1px solid ${theme.colors.border}`,
    backgroundColor: "transparent",
    color: theme.colors.textPrimary,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold,
    cursor: "pointer",
  },
  formError: {
    backgroundColor: "rgba(255, 82, 82, 0.1)",
    border: "1px solid #FF5252",
    borderRadius: theme.borderRadius.sm,
    padding: "12px 16px",
    color: "#FF8A8A",
    fontSize: theme.fontSize.sm,
    marginBottom: "16px",
  },
};
