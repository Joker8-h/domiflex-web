import React from "react";
import { Minus, Trash2, Plus } from "lucide-react";
import theme from "../styles/theme";

export default function CartItem({ item, onUpdateQuantity, onRemove }) {
  return (
    <div style={styles.container}>
      <div style={styles.imageWrap}>
        {item.imagen ? (
          <img src={item.imagen} alt={item.nombre} style={styles.image} />
        ) : (
          <div style={styles.placeholder}>🍔</div>
        )}
      </div>

      <div style={styles.info}>
        <h4 style={styles.name}>{item.nombre}</h4>
        <div style={styles.priceRow}>
          <span style={styles.unitPrice}>
            ${Number(item.precio || 0).toLocaleString()} c/u
          </span>
          <span style={styles.totalPrice}>
            ${(Number(item.precio || 0) * item.cantidad).toLocaleString()}
          </span>
        </div>
      </div>

      <div style={styles.actions}>
        <div style={styles.quantityControl}>
          <button
            type="button"
            style={styles.qtyBtn}
            onClick={() => onUpdateQuantity(item.id, item.cantidad - 1)}
            aria-label="Disminuir cantidad"
          >
            <Minus size={14} />
          </button>
          <span style={styles.qtyText}>{item.cantidad}</span>
          <button
            type="button"
            style={styles.qtyBtn}
            onClick={() => onUpdateQuantity(item.id, item.cantidad + 1)}
            aria-label="Aumentar cantidad"
          >
            <Plus size={14} />
          </button>
        </div>

        <button
          type="button"
          style={styles.removeBtn}
          onClick={() => onRemove(item.id)}
          aria-label="Eliminar producto"
          title="Eliminar"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "16px",
    backgroundColor: theme.colors.bgCard,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.md,
    marginBottom: "12px",
    transition: "transform 0.2s ease, border-color 0.2s ease",
  },
  imageWrap: {
    width: "72px",
    height: "72px",
    borderRadius: theme.borderRadius.sm,
    overflow: "hidden",
    backgroundColor: "#0B1F44",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  placeholder: {
    fontSize: "32px",
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textPrimary,
    marginBottom: "6px",
    lineHeight: 1.3,
  },
  priceRow: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  unitPrice: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  totalPrice: {
    fontSize: theme.fontSize.md,
    color: theme.colors.accent,
    fontWeight: theme.fontWeight.bold,
  },
  actions: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flexShrink: 0,
  },
  quantityControl: {
    display: "inline-flex",
    alignItems: "center",
    gap: "10px",
    backgroundColor: "#0B1F44",
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.full,
    padding: "4px 8px",
  },
  qtyBtn: {
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    border: "none",
    backgroundColor: "rgba(0, 229, 118, 0.15)",
    color: theme.colors.accent,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "background 0.2s ease, color 0.2s ease",
  },
  qtyText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textPrimary,
    minWidth: "18px",
    textAlign: "center",
  },
  removeBtn: {
    background: "none",
    border: "none",
    color: "#EF4444",
    cursor: "pointer",
    padding: "6px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background 0.2s ease",
  },
};
