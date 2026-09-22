const KEY = "domiflex_cart";

export function loadCart() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "null");
    if (!raw || !Array.isArray(raw.cart)) return { cart: [], negocio: null };
    return { cart: raw.cart, negocio: raw.negocio || null };
  } catch {
    return { cart: [], negocio: null };
  }
}

export function saveCart(cart, negocio) {
  if (!cart?.length) {
    localStorage.removeItem(KEY);
    return;
  }
  localStorage.setItem(KEY, JSON.stringify({ cart, negocio: negocio || null }));
}

export function clearCart() {
  localStorage.removeItem(KEY);
}
