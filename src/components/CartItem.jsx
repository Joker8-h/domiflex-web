import React from "react";
import { Minus, Trash, Plus } from "lucide-react";
import theme from "../styles/theme";

export default function CartItem({ item, onUpdateQuantity, onRemove }) {
  return (
    <div style={styles.container}>
      {item.imagen && <img src={item.imagen} alt={item.nombre} style={styles.image} />}
      <div style={styles.info}>
        <h4 style={styles.name}>{item.nombre}</h4>
        <p style={styles.price}>${(item.precio * item.cantidad).toLocaleString()}</p>
      </div>
      <div style={styles.actions}>
        <button
          style={styles.removeBtn}
          onClick={() => onRemove(item.id)}
        >
          <Trash size={12} />
        </button>
        <div style={styles.quantityControl}>
          <button
            style={styles.qtyBtn}
            onClick={() => onUpdateQuantity(item.id, item.cantidad - 1)}
          >
            <Minus size={10} />
          </button>
          <span style={styles.qtyText}>{item.cantidad}</span>
          <button
            style={styles.qtyBtn}
            onClick={() => onUpdateQuantity(item.id, item.cantidad + 1)}
          >
            <Plus size={10} />
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 0",
    borderBottom: `1px solid ${theme.colors.border}`,
  },
  image: {
    width: "60px",
    height: "60px",
    borderRadius: theme.borderRadius.sm,
    objectFit: "cover",
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textPrimary,
    marginBottom: "4px",
  },
  price: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.accent,
    fontWeight: theme.fontWeight.bold,
  },
  actions: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "8px",
  },
  removeBtn: {
    background: "none",
    border: "none",
    color: theme.colors.textMuted,
    cursor: "pointer",
    padding: "4px",
    transition: theme.transitions.fast,
  },
  quantityControl: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: theme.colors.bgCardHover,
    borderRadius: theme.borderRadius.sm,
    padding: "4px",
  },
  qtyBtn: {
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    border: "none",
    backgroundColor: theme.colors.accent,
    color: "#000",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: theme.transitions.fast,
  },
  qtyText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textPrimary,
    minWidth: "20px",
    textAlign: "center",
  },
};
